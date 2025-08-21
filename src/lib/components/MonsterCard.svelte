<script>
  import { iconMap } from '$lib/assets/registry';
  import Card from '$lib/components/Card.svelte';
  import RemoveButton from '$lib/components/RemoveButton.svelte';
  import HpControls from '$lib/components/HpControls.svelte';
  import StatsDisplay from '$lib/components/StatsDisplay.svelte';
  import ConditionsDisplay from '$lib/components/ConditionsDisplay.svelte';
  import HealthBar from '$lib/components/HealthBar.svelte';
  import { removeUnit, adjustHp, toggleCondition } from '$lib/utils/unitActions.js';
  import '$lib/styles/cards.css';

  /** @typedef {import('$lib/types').Unit} Unit */

  // Props
  /** @type {Unit} */
  export let unit;

  function handleRemove() {
    removeUnit(unit.id);
  }

  /**
   * @param {CustomEvent<{delta: number}>} event
   */
  function handleHpAdjust(event) {
    adjustHp(unit, event.detail.delta);
  }

  /**
   * @param {CustomEvent<{condition: string}>} event
   */
  function handleConditionToggle(event) {
    toggleCondition(unit, event.detail.condition);
  }
</script>

<Card className={unit.type}>
  <!-- Remove (top-right) -->
  <RemoveButton on:remove={handleRemove} />

  <div class="top">
    <div><strong class="large">#{unit.number}</strong> ({unit.type})</div>

    <HpControls currentHp={unit.currentHp} maxHp={unit.stats.health} on:adjust={handleHpAdjust} />

    <StatsDisplay move={unit.stats.move} attack={unit.stats.attack} range={unit.stats.range} />

    {#if unit.stats.attributes && unit.stats.attributes.length > 0}
      <strong>Attributes</strong>:<br />
      <div class="attributes">
        {#each unit.stats.attributes as attr (attr)}
          {@const attrStr = String(attr)}
          {@const iconKey = attrStr.split(' ')[0]?.toLowerCase()}
          {@const attrValue = attrStr.split(' ')[1]?.toLowerCase()}
          {#if iconMap[iconKey]}
            <span class="attribute-group">
              <img
                src={iconMap[iconKey]}
                width="22"
                height="22"
                alt={attrStr}
                title={attrStr}
                class="attribute-icon"
              />
              {attrValue}
            </span>
          {:else}
            <span>{attrStr}</span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <div class="bottom">
    <ConditionsDisplay
      activeConditions={unit.activeConditions ?? []}
      on:toggle={handleConditionToggle}
    />

    <HealthBar currentHp={unit.currentHp} maxHp={unit.stats.health} />
  </div>
</Card>
