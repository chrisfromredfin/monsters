<script>
    export let data;
    const monsterNames = Object.keys(data.monsters);

    let scenarioLevel = null;
</script>

Scenario Level:
<select bind:value={scenarioLevel} id="level">
    <option value="">-Choose-</option>
    {#each [1,2,3,4,5,6,7] as level}
      <option value={level}>{level}</option>
    {/each}
</select>
<hr/>

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
            {#each [1,2,3,4,5,6,7,8,9,10] as ndx}
            <th>{ndx}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Regular</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>Elite</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>
{/if}