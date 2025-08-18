<script>
  import { createEventDispatcher } from 'svelte';
  import { playArea } from '$lib/stores/playArea.js';
  import { scenarioLevel } from '$lib/stores/scenarioLevel.js';
  import { computeBossHealth } from '$lib/boss-helpers.js';

  // Props from parent
  export let data; // the big JSON (monsters, levels...)
  export let monsterNames = []; // list of names for the <select>
  const bossNames = Object.keys(data.bosses ?? {});
  let selectedBoss = bossNames[0] ?? '';
  let partyCount = 4; // default; let the user change this
  let addingBoss = false; // e.g., a checkbox or separate button mode

  const dispatch = createEventDispatcher();

  // Local UI state (kept internal to the panel)
  let selectedMonster = 'Ancient Artillery';
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

  function addBoss() {
    if (!$scenarioLevel || !selectedBoss) return;

    const boss = data.bosses[selectedBoss];
    // find the level block that matches the scenario level
    const lvl = boss.level.find((l) => l.level === +$scenarioLevel);
    if (!lvl) return;

    // health is an expression like "10xC"
    const hp = computeBossHealth(String(lvl.health), partyCount);

    const id = crypto?.randomUUID?.() ?? `${selectedBoss}-boss-${Date.now()}`;
    const unit = {
      id,
      name: selectedBoss,
      number: 1, // typically single boss; keep 1
      type: 'boss',
      currentHp: hp,
      stats: {
        health: hp,
        move: Number(lvl.move ?? 0),
        attack: Number(lvl.attack ?? 0),
        range: Number(lvl.range ?? 0)
      },
      activeConditions: [],
      bossMeta: {
        healthExpr: String(lvl.health),
        specials: [
          ...(Array.isArray(lvl.special1) ? lvl.special1 : []),
          ...(Array.isArray(lvl.special2) ? lvl.special2 : [])
        ],
        immunities: Array.isArray(lvl.immunities) ? lvl.immunities : [],
        notes: lvl.notes ?? ''
      }
    };

    playArea.update((old) => [...old, unit]);
    // optionally close the panel or leave it open
    // dispatch('added') if you want the parent to collapse, etc.
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

  <div class="boss-adder">
    <label>
      <input type="checkbox" bind:checked={addingBoss} />
      Add Boss
    </label>

    {#if addingBoss}
      <div>
        <select bind:value={selectedBoss}>
          {#each bossNames as b}<option value={b}>{b}</option>{/each}
        </select>

        <label
          >Party size (C):
          <input type="number" min="1" max="6" bind:value={partyCount} />
        </label>

        <button on:click={addBoss} disabled={!selectedBoss}>Add Boss</button>
      </div>
    {/if}
  </div>
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
