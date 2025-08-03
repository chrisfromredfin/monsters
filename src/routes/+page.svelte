<script>
	export let data;
	const monsterNames = Object.keys(data.monsters);

	let scenarioLevel = null;
	let unitStates = Array(10).fill(null); // [null, null, ..., null]

  let playArea = []; // will hold added cards
  let selectedMonster = 'Ancient Artillery';

  $: groupedUnits = Object.values(
    playArea.reduce((acc, unit) => {
      if (!acc[unit.name]) acc[unit.name] = [];
      acc[unit.name].push(unit);
      return acc;
    }, {})
  ).map(group => group.sort((a, b) => a.number - b.number));

  function handleAdd() {
    if (!selectedMonster || scenarioLevel === null) return;

    const monster = data.monsters[selectedMonster];
    if (!monster) return;

    const levelData = monster.level.find(l => l.level === +scenarioLevel);
    if (!levelData) return;

    const newUnits = unitStates
      .map((type, i) => {
        if (!type) return null;
        return {
          number: i + 1,
          type, // "normal" or "elite"
          stats: levelData[type],
          name: selectedMonster
        };
      })
      .filter(Boolean);

    playArea = [...playArea, ...newUnits];

    // Reset unitStates
    unitStates = Array(10).fill(null);
  }
</script>

Scenario Level:
<select bind:value={scenarioLevel} id="level">
	<option value="">-Choose-</option>
	{#each [1, 2, 3, 4, 5, 6, 7] as level}
		<option value={level}>{level}</option>
	{/each}
</select>
<hr />

<select bind:value={selectedMonster} disabled={!scenarioLevel}>
	{#each monsterNames as name}
		<option value={name}>{name}</option>
	{/each}
</select>

{#if scenarioLevel}
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
		</tbody>
	</table>
  <button on:click={handleAdd} disabled={!selectedMonster}>Add</button>
{/if}

{#if playArea.length > 0}
  <h2>Monsters</h2>
  <div class="play-area">
    {#each groupedUnits as group}
      <div class="monster-group">
        <h3>{group[0].name}</h3>
        <div class="card-row">
          {#each group as unit}
            <div class="monster-card {unit.type}">
              <strong>#{unit.number}</strong> ({unit.type})
              <ul>
                <li>HP: {unit.stats.health}</li>
                <li>Move: {unit.stats.move}</li>
                <li>Attack: {unit.stats.attack}</li>
                <li>Range: {unit.stats.range}</li>
                {#if unit.stats.attributes.length > 0}
                  <li>Attributes: {unit.stats.attributes.join(', ')}</li>
                {/if}
              </ul>
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
  }

  .monster-card.elite {
    border-color: gold;
    background: rgba(255, 215, 0, 0.2);
  }
</style>
