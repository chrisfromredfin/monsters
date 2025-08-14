<script>
  import { playArea } from '$lib/stores/playArea.js';
  import { scenarioLevel } from '$lib/stores/scenarioLevel.js';

  /** Icons **/
  const modules = import.meta.glob('$lib/assets/*.svg', { eager: true });

  const iconMap = {};
  for (const path in modules) {
    const key = path.split('/').pop().replace('.svg', '').toLowerCase();
    iconMap[key] = modules[path].default;
  }

  /** Monster Images **/
  const monsterImages = import.meta.glob('$lib/assets/monsters/*.png', { eager: true });

  const monsterImageMap = {};
  for (const path in monsterImages) {
    const key = path.split('/').pop().replace('.png', '');
    monsterImageMap[key] = monsterImages[path].default;
  }

  /** Conditions **/
  const CONDITIONS = ['strengthened', 'muddled', 'poisoned', 'wounded', 'stunned', 'immobilized'];

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
        return {
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

  let addPanelOpen = true; // controls <details> open/closed
  let decidedInitialOpen = false; // ensure we run this logic only once

  // Decide only once, after the store is available
  $: if (!decidedInitialOpen) {
    addPanelOpen = $playArea.length === 0; // open if starting fresh, else collapse
    decidedInitialOpen = true;
  }
</script>

<div class="reset"><button on:click={resetGame}>Start Over</button></div>

Scenario Level:
<select
  bind:value={selectedLevel}
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
          {#each group as unit}
            <!-- #TODO - add a @const here for the shield value-->
            <div class="monster-card {unit.type}">
              <div class="top">
                <div><strong>#{unit.number}</strong> ({unit.type})</div>

                HP:<span class="large">{unit.currentHp}</span>/{unit.stats.health}
                <span class="hp-controls">
                  <button on:click={() => adjustHp(unit, -1)}>-</button>
                  <button on:click={() => adjustHp(unit, +1)}>+</button>
                </span>

                <div class="mar">
                  <strong>Mov</strong>: {unit.stats.move} | <strong>Atk</strong>: {unit.stats
                    .attack} | <strong>Rng</strong>: {unit.stats.range}
                </div>
                {#if unit.stats.attributes.length > 0}
                  <strong>Attributes</strong>:<br />
                  <div class="attributes">
                    {#each unit.stats.attributes as attr}
                      {@const iconKey = attr.split(' ')[0]?.toLowerCase()}
                      {@const attrValue = attr.split(' ')[1]?.toLowerCase()}
                      {console.log(iconMap, iconKey)}
                      {#if iconMap[iconKey]}
                        <span
                          ><img
                            src={iconMap[iconKey]}
                            width="16"
                            height="16"
                            alt={attr}
                            title={attr}
                            class="attribute-icon"
                          />
                          {attrValue}</span
                        >
                      {:else}
                        <span>{attr}</span> <!-- Fallback -->
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
              <div class="bottom">
                <div class="conditions">
                  {#each CONDITIONS as condition}
                    {@const isActive = (unit.activeConditions ?? []).includes(condition)}
                    <button
                      on:click={() => {
                        if (isActive) {
                          unit.activeConditions = unit.activeConditions.filter(
                            (c) => c !== condition
                          );
                        } else {
                          unit.activeConditions = [...unit.activeConditions, condition];
                        }
                        playArea.update((area) => [...area]); // trigger reactivity
                      }}
                    >
                      <img
                        src={iconMap[condition]}
                        alt={condition}
                        title={condition}
                        class="condition-icon {isActive ? 'active' : 'inactive'}"
                      />
                    </button>
                  {/each}
                </div>

                <div class="health-bar">
                  <div
                    class={`health-fill ${unit.currentHp < 6 ? 'pulse' : ''}`}
                    style:width={(unit.currentHp / unit.stats.health) * 100 + '%'}
                  ></div>
                </div>
              </div>
            </div>
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

  .monster-card {
    border: 2px solid #ccc;
    padding: 0.5rem;
    width: 200px;
    background: #f9f9f9;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }
  .mar {
    margin-block: 0.4rem;
  }
  .monster-card.elite {
    border-color: gold;
    background: rgba(255, 215, 0, 0.2);
  }

  .hp-controls {
    margin-top: 4px;
  }

  .hp-controls button {
    margin-right: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1rem;
  }
  .health-bar {
    margin-top: 8px;
    height: 10px;
    background-color: #ddd;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid black;
  }

  .health-fill {
    height: 100%;
    background-color: maroon;
    transition: width 0.3s ease;
  }

  @keyframes pulse-animation {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  .pulse {
    animation: pulse-animation 2s ease-in-out infinite;
  }

  div.reset {
    text-align: right;
  }
  .attributes {
    display: flex;
    justify-content: space-between;
  }
  .large {
    font-size: 1.5rem;
  }

  /** Conditions **/
  .conditions {
    display: flex;
    flex-wrap: wrap;
    margin-top: 0.5rem;
    gap: 4px;
  }
  .conditions button {
    background-color: transparent;
    padding: 0;
    border-color: transparent;
  }
  .condition-icon {
    width: 22px;
    height: 22px;
    cursor: pointer;
    opacity: 0.18;
    transition: opacity 0.2s ease;
  }
  .condition-icon.active {
    opacity: 1;
  }
  .condition-icon.inactive:hover {
    opacity: 0.6;
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
  table,
  .monster-card {
    font-family: 'Roboto Condensed', sans-serif;
    font-size: 0.95rem;
  }

  /* Optional: give the headings a slightly warmer dark color */
  h1,
  h2,
  h3 {
    color: #3a2f23;
  }

  .add-monsters > * {
    margin-bottom: 0.5rem;
  }
</style>
