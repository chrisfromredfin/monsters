<script>
  import { playArea } from '$lib/stores/playArea.js';
  import { scenarioLevel } from '$lib/stores/scenarioLevel.js';
  import { iconMap, monsterImageMap } from '$lib/assets/registry';
  import MonsterCard from '$lib/components/MonsterCard.svelte';

  /** Conditions **/
  const CONDITIONS = [
    'strengthened',
    'muddled',
    'poisoned',
    'wounded',
    'stunned',
    'immobilized',
    'disarmed'
  ];

  export let data;
  const monsterNames = Object.keys(data.monsters);

  let unitStates = Array(10).fill(null); // [null, null, ..., null]
  let selectedMonster = 'Ancient Artillery';
  let selectedLevel = null;
  $: selectedLevel = $scenarioLevel ?? '';

  $: groupedUnits = Object.values(
    $playArea.reduce((acc, unit) => {
      if (!acc[unit.name]) acc[unit.name] = [];
      acc[unit.name].push(unit);
      return acc;
    }, {})
  ).map((group) => group.sort((a, b) => a.number - b.number));

  function resetGame() {
    if (confirm('Are you sure you want to start over? This will clear all added monsters.')) {
      localStorage.removeItem('playArea');
      localStorage.removeItem('scenarioLevel');
      playArea.set([]);
      unitStates = Array(10).fill(null);
      selectedMonster = 'Ancient Artillery';
      scenarioLevel.set(null);
      addPanelOpen = true; // <-- re-open after reset
      decidedInitialOpen = true; // keep future auto-decisions off
    }
  }

  function adjustHp(unit, delta) {
    const max = unit.stats.health ?? 0;
    unit.currentHp = Math.max(0, Math.min(max, (unit.currentHp ?? max) + delta));
    playArea.update((a) => [...a]); // notify store
  }

  function handleAdd() {
    if (!selectedMonster || $scenarioLevel === null) return;

    const monster = data.monsters[selectedMonster];
    if (!monster) return;

    const levelData = monster.level.find((l) => l.level === +$scenarioLevel);
    if (!levelData) return;

    const newUnits = unitStates
      .map((type, i) => {
        if (!type) return null;
        const id = crypto?.randomUUID?.() ?? `${selectedMonster}-${type}-${i + 1}-${Date.now()}`;
        return {
          id,
          number: i + 1,
          type,
          stats: levelData[type],
          name: selectedMonster,
          currentHp: levelData[type].health,
          activeConditions: []
        };
      })
      .filter(Boolean);

    playArea.update((old) => [...old, ...newUnits]);
    unitStates = Array(10).fill(null);
  }

  function removeUnit(id) {
    playArea.update((arr) => arr.filter((u) => u.id !== id));
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
  <select bind:value={selectedMonster} disabled={!$scenarioLevel}>
    {#each monsterNames as name}
      <option value={name}>{name}</option>
    {/each}
  </select>

  {#if $scenarioLevel}
    <table border="1">
      <thead>
        <tr>
          <th></th>
          {#each Array(10)
            .fill(0)
            .map((_, i) => i + 1) as ndx}
            <th>{ndx}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Elite</td>
          {#each unitStates as state, i}
            <td
              ><input
                type="checkbox"
                checked={state === 'elite'}
                on:change={() => {
                  unitStates[i] = state === 'elite' ? null : 'elite';
                }}
              /></td
            >
          {/each}
        </tr>
        <tr>
          <td>Regular</td>
          {#each unitStates as state, i}
            <td
              ><input
                type="checkbox"
                checked={state === 'normal'}
                on:change={() => {
                  unitStates[i] = state === 'normal' ? null : 'normal';
                }}
              /></td
            >
          {/each}
        </tr>
      </tbody>
    </table>
    <button on:click={handleAdd} disabled={!selectedMonster}>Add</button>
  {/if}
</details>

{#if $playArea.length > 0}
  <h2>Monsters</h2>
  <div class="play-area">
    {#each groupedUnits as group}
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
