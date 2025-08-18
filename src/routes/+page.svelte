<script>
  import { playArea, groupedUnits } from '$lib/stores/playArea.js';
  import { scenarioLevel } from '$lib/stores/scenarioLevel.js';
  import { monsterImageMap } from '$lib/assets/registry';
  import MonsterCard from '$lib/components/MonsterCard.svelte';
  import AddPanel from '$lib/components/AddPanel.svelte';

  export let data;
  const monsterNames = Object.keys(data.monsters);
  const bossNames = Object.keys(data.bosses || {});

  /** @type {number|null} */
  let selectedLevel = null;
  $: selectedLevel = $scenarioLevel ?? '';

  function resetGame() {
    if (confirm('Are you sure you want to start over? This will clear all added monsters.')) {
      localStorage.removeItem('playArea');
      localStorage.removeItem('scenarioLevel');
      playArea.set([]);
      scenarioLevel.set(null);
      addPanelOpen = true; // <-- re-open after reset
      decidedInitialOpen = true; // keep future auto-decisions off
    }
  }

  let addPanelOpen = true; // controls <details> open/closed
  let decidedInitialOpen = false; // ensure we run this logic only once

  // Decide only once, after the store is available
  $: if (!decidedInitialOpen) {
    addPanelOpen = $playArea.length === 0; // open if starting fresh, else collapse
    decidedInitialOpen = true;
  }
</script>

<div class="reset"><button on:click={resetGame}>Start Over</button></div>
<h1>Gloomhaven Monster Tracker</h1>
Scenario Level:
<select
  bind:value={selectedLevel}
  name="level"
  on:change={(e) => {
    const newLevel = +e.target.value;
    if ($playArea.length > 0 && newLevel !== $scenarioLevel) {
      alert('Changing scenario level requires starting over.');
      selectedLevel = $scenarioLevel ?? ''; // Revert UI
    } else {
      scenarioLevel.set(newLevel);
    }
  }}
>
  <option value="">-Choose-</option>
  {#each [1, 2, 3, 4, 5, 6, 7] as level}
    <option value={level}>{level}</option>
  {/each}
</select>
<hr />

<details class="add-monsters" bind:open={addPanelOpen}>
  <summary>Add Monsters</summary>
  <AddPanel {data} {monsterNames} {bossNames} />
</details>

{#if $playArea.length > 0}
  <h2>Monsters</h2>
  <div class="play-area">
    {#each $groupedUnits as group}
      <div class="monster-group">
        <h3>
          {#if monsterImageMap[`Horz-${group[0].name}`]}
            <img
              src={monsterImageMap[`Horz-${group[0].name}`]}
              alt={group[0].name}
              class="monster-image"
            />
          {/if}
          {group[0].name}
        </h3>
        <div class="card-row">
          {#each group as unit (unit.id)}
            <MonsterCard {unit} />
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .play-area {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 1rem;
  }

  .monster-group h3 {
    margin: 0 0 0.5rem 0;
  }

  .card-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  div.reset {
    text-align: right;
    position: absolute;
    right: 1rem;
  }

  .monster-image {
    height: 48px;
    width: auto;
    vertical-align: middle;
    margin-right: 6px;
  }

  /* Monster names in cards */
  .monster-group h3 {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.25rem;
  }

  /* Stats and tables stay readable */
  table {
    font-family: 'Roboto Condensed', sans-serif;
    font-size: 0.95rem;
  }

  /* give the headings a slightly warmer dark color */
  h1 {
    margin-block-start: 0;
  }

  h1,
  h2,
  h3 {
    color: #3a2f23;
  }

  .add-monsters > * {
    margin-bottom: 0.5rem;
  }
</style>
