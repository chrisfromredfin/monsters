<script>
  import { playArea, groupedUnits } from '$lib/stores/playArea.js';
  import { scenarioLevel } from '$lib/stores/scenarioLevel.js';
  import { monsterImageMap } from '$lib/assets/registry';
  import MonsterCard from '$lib/components/MonsterCard.svelte';
  import BossCard from '$lib/components/BossCard.svelte';
  import AddPanel from '$lib/components/AddPanel.svelte';

  export let data;
  const monsterNames = Object.keys(data.monsters);

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

  let addPanelOpen = true; // controls expandable panel open/closed
  let decidedInitialOpen = false; // ensure we run this logic only once

  // Decide only once, after the store is available
  $: if (!decidedInitialOpen) {
    addPanelOpen = $playArea.length === 0; // open if starting fresh, else collapse
    decidedInitialOpen = true;
  }

  // Handle smooth animation for custom expandable panel
  function toggleAddPanel() {
    addPanelOpen = !addPanelOpen;
  }
</script>

<div class="reset"><button on:click={resetGame}>Start Over</button></div>
<h1>Gloomhaven Monster Tracker</h1>
Scenario Level:
<select
  bind:value={selectedLevel}
  name="level"
  on:change={(e) => {
    const target = /** @type {HTMLSelectElement} */ (e.target);
    const newLevel = +target.value;
    if ($playArea.length > 0 && newLevel !== $scenarioLevel) {
      alert('Changing scenario level requires starting over.');
      selectedLevel = $scenarioLevel ?? ''; // Revert UI
    } else {
      scenarioLevel.set(newLevel);
    }
  }}
>
  <option value="">-Choose-</option>
  {#each [1, 2, 3, 4, 5, 6, 7] as level (level)}
    <option value={level}>{level}</option>
  {/each}
</select>
<hr />

<div class="add-monsters" class:open={addPanelOpen}>
  <div
    class="summary"
    tabindex="0"
    on:click={toggleAddPanel}
    on:keydown={(e) => e.key === 'Enter' && toggleAddPanel()}
  >
    <span class="arrow" class:open={addPanelOpen}>▶</span>
    Add Monsters
  </div>
  <div class="details-content">
    <div class="details-inner">
      <AddPanel {data} {monsterNames} />
    </div>
  </div>
</div>

{#if $playArea.length > 0}
  <h2>Monsters</h2>
  <div class="play-area">
    {#each $groupedUnits as group (group[0].name)}
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
            {#if unit.type === 'boss'}
              <BossCard {unit} />
            {:else}
              <MonsterCard {unit} />
            {/if}
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

  /* give the headings a slightly warmer dark color */
  h1 {
    margin-block-start: 0;
  }

  h1,
  h2,
  h3 {
    color: #3a2f23;
  }

  /* Smooth animation for custom expandable panel */
  .add-monsters {
    border: 1px solid #abb9c8;
    border-radius: 8px;
    padding: 0;
    overflow: hidden;
  }

  .add-monsters .summary {
    padding: 0.375rem;
    background: #f8f9fa;
    cursor: pointer;
    user-select: none;
    font-weight: bold;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .add-monsters .summary:hover {
    background: #e9ecef;
  }

  .add-monsters .arrow {
    transition: transform 0.3s ease;
    display: inline-block;
    font-size: 0.8em;
  }

  .add-monsters .arrow.open {
    transform: rotate(90deg);
  }

  /* Container for the animated content */
  .add-monsters .details-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease;
  }

  .add-monsters.open .details-content {
    max-height: 800px; /* Large enough to accommodate content */
  }

  /* Inner wrapper with padding animation */
  .add-monsters .details-inner {
    padding: 0 1rem;
    transition: padding 0.4s ease;
    background-color: white;
  }

  .add-monsters.open .details-inner {
    padding: 1rem;
  }
</style>
