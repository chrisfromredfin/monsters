<script>
	export let data;
	const monsterNames = Object.keys(data.monsters);

	let scenarioLevel = null;
	let unitStates = Array(10).fill(null); // [null, null, ..., null]
</script>

Scenario Level:
<select bind:value={scenarioLevel} id="level">
	<option value="">-Choose-</option>
	{#each [1, 2, 3, 4, 5, 6, 7] as level}
		<option value={level}>{level}</option>
	{/each}
</select>
<hr />

<select disabled={!scenarioLevel}>
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
	<button>Add</button>
{/if}
