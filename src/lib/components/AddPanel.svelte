<script>
  import { createEventDispatcher } from 'svelte';
  import { playArea } from '$lib/stores/playArea.js';
  import { scenarioLevel } from '$lib/stores/scenarioLevel.js';
  import { computeBossHealth } from '$lib/boss-helpers.js';

  /** @typedef {import('$lib/types').Unit} Unit */

  // Props from parent
  /** @type {any} */
  export let data; // the big JSON (monsters, levels...)
  /** @type {string[]} */
  export let monsterNames = []; // list of names for the <select>
  const bossNames = Object.keys(data.bosses ?? {});
  let selectedBoss = bossNames[0] ?? '';
  let partyCount = 4; // default; let the user change this

  // Ally state
  let allyName = '';
  let allyHp = 1;

  const dispatch = createEventDispatcher();

  // Local UI state (kept internal to the panel)
  let selectedMonster = 'Ancient Artillery';
  let unitStates = Array(10).fill(null); // ["elite" | "normal" | null] per slot

  // Get existing numbers for the selected monster
  $: existingNumbers = new Set(
    $playArea.filter((unit) => unit.name === selectedMonster).map((unit) => unit.number)
  );

  function handleAdd() {
    if (!selectedMonster || $scenarioLevel === null) return;

    const monster = data.monsters[selectedMonster];
    if (!monster) return;

    const levelData = monster.level.find((/** @type {any} */ l) => l.level === +$scenarioLevel);
    if (!levelData) return;

    const now = Date.now();
    const newUnits = /** @type {Unit[]} */ (
      unitStates
        .map((type, i) => {
          if (!type) return null;

          const number = i + 1;
          // Skip if this number already exists for this monster
          if (existingNumbers.has(number)) return null;

          const id = crypto?.randomUUID?.() ?? `${selectedMonster}-${type}-${number}-${now}`;
          const stats = levelData[type];
          /** @type {Unit} */
          const unit = {
            id,
            number,
            type: /** @type {'normal' | 'elite' | 'boss'} */ (type),
            stats,
            name: selectedMonster,
            currentHp: stats.health,
            activeConditions: []
          };
          return unit;
        })
        .filter(Boolean)
    );

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
    const lvl = boss.level.find((/** @type {any} */ l) => l.level === +$scenarioLevel);
    if (!lvl) return;

    // health is an expression like "10xC"
    const hp = computeBossHealth(String(lvl.health), partyCount);

    const id = crypto?.randomUUID?.() ?? `${selectedBoss}-boss-${Date.now()}`;
    /** @type {Unit} */
    const unit = {
      id,
      name: selectedBoss,
      number: 1, // typically single boss; keep 1
      type: /** @type {'normal' | 'elite' | 'boss'} */ ('boss'),
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
          (Array.isArray(lvl.special1) ? lvl.special1.join(', ') : '').replace(
            /\{\{.*?\}\}/g,
            '🟥'
          ),
          (Array.isArray(lvl.special2) ? lvl.special2.join(', ') : '').replace(/\{\{.*?\}\}/g, '🟥')
        ],
        immunities: Array.isArray(lvl.immunities) ? lvl.immunities : [],
        notes: lvl.notes ?? ''
      }
    };

    playArea.update((old) => [...old, unit]);
    // optionally close the panel or leave it open
    // dispatch('added') if you want the parent to collapse, etc.
  }

  function nextAllyNumber() {
    const existing = $playArea.filter((u) => u.type === 'ally');
    return existing.length + 1;
  }

  function addAlly() {
    if (!allyHp) return;
    const now = Date.now();
    const id = crypto?.randomUUID?.() ?? `ally-${now}`;
    const name = allyName?.trim() ? allyName.trim() : `Ally ${nextAllyNumber()}`;
    /** @type {Unit} */
    const unit = {
      id,
      name,
      number: 1,
      type: /** @type {'normal' | 'elite' | 'boss' | 'ally'} */ ('ally'),
      stats: { health: Number(allyHp), move: 0, attack: 0 },
      currentHp: Number(allyHp),
      activeConditions: []
    };
    playArea.update((a) => [...a, unit]);
    allyName = '';
    allyHp = 1;
    dispatch('added');
  }
</script>

{#if $scenarioLevel}
  <div class="add-panel-container">
    <!-- Monster Section -->
    <div class="monster-section">
      <div class="monster-header">
        <label for="monster-select">Monster:</label>
        <select id="monster-select" bind:value={selectedMonster} disabled={!$scenarioLevel}>
          {#each monsterNames as name (name)}
            <option value={name}>{name}</option>
          {/each}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th></th>
            {#each Array(10)
              .fill(0)
              .map((_, i) => i + 1) as ndx (ndx)}
              <th>{ndx}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Elite</td>
            {#each unitStates as state, i (i)}
              {@const number = i + 1}
              {@const isExisting = existingNumbers.has(number)}
              <td class:existing={isExisting}>
                <input
                  type="checkbox"
                  checked={state === 'elite'}
                  disabled={isExisting}
                  title={isExisting ? `${selectedMonster} #${number} already exists` : ''}
                  on:change={() => {
                    unitStates[i] = state === 'elite' ? null : 'elite';
                  }}
                />
              </td>
            {/each}
          </tr>
          <tr>
            <td>Regular</td>
            {#each unitStates as state, i (i)}
              {@const number = i + 1}
              {@const isExisting = existingNumbers.has(number)}
              <td class:existing={isExisting}>
                <input
                  type="checkbox"
                  checked={state === 'normal'}
                  disabled={isExisting}
                  title={isExisting ? `${selectedMonster} #${number} already exists` : ''}
                  on:change={() => {
                    unitStates[i] = state === 'normal' ? null : 'normal';
                  }}
                />
              </td>
            {/each}
          </tr>
        </tbody>
      </table>

      <button on:click={handleAdd} disabled={!selectedMonster}>Add Monsters</button>
    </div>

    <!-- Boss and Ally Sections (right column) -->
    <div class="right-column">
      <!-- Boss Section -->
      <div class="boss-section">
        <h4>Add Boss</h4>

        <div class="boss-controls">
          <label for="boss-select">Boss:</label>
          <select id="boss-select" bind:value={selectedBoss}>
            {#each bossNames as b (b)}<option value={b}>{b}</option>{/each}
          </select>

          <label for="party-count">Party size (C):</label>
          <input id="party-count" type="number" min="1" max="6" bind:value={partyCount} />

          <button on:click={addBoss} disabled={!selectedBoss}>Add Boss</button>
        </div>
      </div>

      <!-- Ally Section -->
      <div class="ally-section">
        <h4>Add Ally</h4>

        <div class="ally-controls">
          <label for="ally-name">Name:</label>
          <input id="ally-name" type="text" bind:value={allyName} placeholder="(auto)" />

          <label for="ally-hp">HP:</label>
          <input id="ally-hp" type="number" min="1" bind:value={allyHp} />

          <button on:click={addAlly} disabled={!allyHp || allyHp < 1}>Add Ally</button>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="no-level">
    <p>Select a scenario level above to add monsters and bosses.</p>

    <select bind:value={selectedMonster} disabled>
      {#each monsterNames as name (name)}
        <option value={name}>{name}</option>
      {/each}
    </select>
  </div>
{/if}

<style>
  /* Main horizontal container */
  .add-panel-container {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  /* Monster section (left side) */
  .monster-section {
    flex: 1;
    min-width: 0; /* Allow flex item to shrink */
  }

  .monster-header {
    margin-bottom: 0.75rem;
  }

  .monster-header label {
    display: inline-block;
    margin-right: 0.5rem;
    font-weight: bold;
  }

  .monster-header select {
    min-width: 200px;
  }

  /* Right column for boss and ally sections */
  .right-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-width: 320px;
  }

  /* Boss section (right side) */
  .boss-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #dee2e6;
  }

  .boss-section h4 {
    margin: 0 0 1rem 0;
    color: #495057;
    font-size: 1.1rem;
  }

  .boss-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .boss-controls label {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .boss-controls input,
  .boss-controls select {
    padding: 0.25rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }

  .boss-controls button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .boss-controls button:hover {
    background: #0056b3;
  }

  .boss-controls button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  /* Ally section */
  .ally-section {
    background: #e8f9fc;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #17a2b8;
  }

  .ally-section h4 {
    margin: 0 0 1rem 0;
    color: #495057;
    font-size: 1.1rem;
  }

  .ally-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .ally-controls label {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .ally-controls input {
    padding: 0.25rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }

  .ally-controls button {
    padding: 0.5rem 1rem;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .ally-controls button:hover {
    background: #138496;
  }

  .ally-controls button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  /* Table styling */
  table {
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  td {
    border: 1px solid gray;
    padding: 0.25rem;
  }

  td.existing {
    background-color: #f0f0f0;
    opacity: 0.6;
  }

  td.existing input[type='checkbox'] {
    cursor: not-allowed;
  }

  /* Monster add button */
  .monster-section button {
    padding: 0.5rem 1rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .monster-section button:hover {
    background: #1e7e34;
  }

  .monster-section button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  /* No level state */
  .no-level {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  .no-level select {
    margin-top: 1rem;
    opacity: 0.6;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .add-panel-container {
      flex-direction: column;
      gap: 1.5rem;
    }

    .right-column {
      min-width: 0;
    }

    .boss-section,
    .ally-section {
      flex: none;
      width: 100%;
    }
  }
</style>
