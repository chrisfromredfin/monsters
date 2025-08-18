<script>
  import { createEventDispatcher } from 'svelte';
  import { playArea } from '$lib/stores/playArea.js';
  import { scenarioLevel } from '$lib/stores/scenarioLevel.js';

  // Props from parent
  export let data; // the big JSON (monsters, levels...)
  export let monsterNames = []; // list of names for the <select>
  export let bossNames = []; // list of boss names for the boss <select>

  const dispatch = createEventDispatcher();

  // Local UI state (kept internal to the panel)
  let selectedMonster = 'Ancient Artillery';
  let selectedBoss = bossNames[0] || '';
  let unitStates = Array(10).fill(null); // ["elite" | "normal" | null] per slot

  function handleAdd() {
    if (!selectedMonster || $scenarioLevel === null) return;

    const monster = data.monsters[selectedMonster];
    if (!monster) return;

    const levelData = monster.level.find((l) => l.level === +$scenarioLevel);
    if (!levelData) return;

    const now = Date.now();
    const newUnits = unitStates
      .map((type, i) => {
        if (!type) return null;
        const id = crypto?.randomUUID?.() ?? `${selectedMonster}-${type}-${i + 1}-${now}`;
        const stats = levelData[type];
        return {
          id,
          number: i + 1,
          type,
          stats,
          name: selectedMonster,
          currentHp: stats.health,
          activeConditions: []
        };
      })
      .filter(Boolean);

    if (newUnits.length === 0) return;

    playArea.update((old) => [...old, ...newUnits]);

    // Reset checkboxes for next add
    unitStates = Array(10).fill(null);

    // Let parent know we added something (so it can auto-collapse)
    dispatch('added');
  }

  function handleAddBoss() {
    if (!selectedBoss || $scenarioLevel === null) return;

    const boss = data.bosses[selectedBoss];
    if (!boss) return;

    const levelData = boss.level.find((l) => l.level === +$scenarioLevel);
    if (!levelData) return;

    const now = Date.now();
    const id = crypto?.randomUUID?.() ?? `${selectedBoss}-boss-${now}`;
    
    const newBoss = {
      id,
      number: 1, // Bosses are typically unique
      type: 'boss',
      stats: {
        health: levelData.health,
        move: levelData.move,
        attack: levelData.attack,
        range: levelData.range || 0,
        special1: levelData.special1 || [],
        special2: levelData.special2 || [],
        immunities: levelData.immunities || [],
        notes: levelData.notes || ''
      },
      name: selectedBoss,
      currentHp: levelData.health,
      activeConditions: []
    };

    playArea.update((old) => [...old, newBoss]);

    // Let parent know we added something (so it can auto-collapse)
    dispatch('added');
  }
</script>

<select bind:value={selectedMonster} disabled={!$scenarioLevel}>
  {#each monsterNames as name}
    <option value={name}>{name}</option>
  {/each}
</select>

{#if $scenarioLevel}
  <table>
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
          <td>
            <input
              type="checkbox"
              checked={state === 'elite'}
              on:change={() => {
                unitStates[i] = state === 'elite' ? null : 'elite';
              }}
            />
          </td>
        {/each}
      </tr>
      <tr>
        <td>Regular</td>
        {#each unitStates as state, i}
          <td>
            <input
              type="checkbox"
              checked={state === 'normal'}
              on:change={() => {
                unitStates[i] = state === 'normal' ? null : 'normal';
              }}
            />
          </td>
        {/each}
      </tr>
    </tbody>
  </table>

  <button on:click={handleAdd} disabled={!selectedMonster}>Add</button>
  
  {#if bossNames.length > 0}
    <select bind:value={selectedBoss} disabled={!$scenarioLevel}>
      {#each bossNames as name}
        <option value={name}>{name}</option>
      {/each}
    </select>
    <button on:click={handleAddBoss} disabled={!selectedBoss}>Add Boss</button>
  {/if}
{/if}

<style>
  /* keep panel spacing nice if used inside <details> */
  :global(.add-monsters) > * {
    margin-bottom: 0.5rem;
  }
  table {
    border-collapse: collapse;
  }
  td {
    border: 1px solid gray;
    padding: 0.25rem;
  }
</style>
