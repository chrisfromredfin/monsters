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

  // Animation state
  let isRemoving = false;

  function handleRemove() {
    // Start the animation
    isRemoving = true;

    // Remove the unit after animation completes
    setTimeout(() => {
      removeUnit(unit.id);
    }, 300); // Match animation duration
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

<div class="card-wrapper" class:removing={isRemoving}>
  <Card className={unit.type}>
    <!-- Remove (top-right) -->
    <RemoveButton on:remove={handleRemove} />

    <div class="top">
      <div><strong class="large">#{unit.number}</strong> ({unit.type})</div>

      <HpControls currentHp={unit.currentHp} maxHp={unit.stats.health} on:adjust={handleHpAdjust} />

      <div class="stattrs">
        <StatsDisplay move={unit.stats.move} attack={unit.stats.attack} range={unit.stats.range} />

        {#if unit.stats.attributes && unit.stats.attributes.length > 0}
          <div class="attributes">
            {#each unit.stats.attributes as attr (attr)}
              {@const attrStr = String(attr)}

              <!-- Handle complex attributes first -->
              {#if attrStr.toLowerCase().includes('disadvantage')}
                {#if iconMap['disadvantage']}
                  <span class="attribute-group disadvantage" title={attrStr}>
                    <img
                      src={iconMap['disadvantage']}
                      width="16"
                      height="16"
                      alt="Disadvantage"
                      class="attribute-icon"
                    />
                    <span class="attribute-value">Disadvantage</span>
                  </span>
                {:else}
                  <span class="attribute-text disadvantage" title={attrStr}>⚫ Disadvantage</span>
                {/if}
              {:else if attrStr.toLowerCase().includes('advantage')}
                {#if iconMap['advantage']}
                  <span class="attribute-group advantage" title={attrStr}>
                    <img
                      src={iconMap['advantage']}
                      width="16"
                      height="16"
                      alt="Advantage"
                      class="attribute-icon"
                    />
                    <span class="attribute-value">Advantage</span>
                  </span>
                {:else}
                  <span class="attribute-text advantage" title={attrStr}>⚪ Advantage</span>
                {/if}
              {:else}
                <!-- Handle normal attributes -->
                {@const parts = attrStr.split(' ')}
                {@const iconKey = parts[0]?.toLowerCase()}
                {@const attrValue = parts.slice(1).join(' ')}
                {@const hasIcon = iconMap[iconKey]}
                {@const displayValue = attrValue || ''}

                {#if hasIcon}
                  <span class="attribute-group" title={attrStr}>
                    <img
                      src={iconMap[iconKey]}
                      width="16"
                      height="16"
                      alt={attrStr}
                      class="attribute-icon"
                    />
                    {#if displayValue}
                      <span class="attribute-value">{displayValue}</span>
                    {/if}
                  </span>
                {:else}
                  <!-- Fallback for attributes without icons -->
                  <span class="attribute-text" title={attrStr}>{attrStr}</span>
                {/if}
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="bottom">
      <ConditionsDisplay
        activeConditions={unit.activeConditions ?? []}
        on:toggle={handleConditionToggle}
      />

      <HealthBar currentHp={unit.currentHp} maxHp={unit.stats.health} />
    </div>
  </Card>
</div>

<style>
  .stattrs {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .card-wrapper {
    transition:
      max-width 0.3s ease-out,
      opacity 0.3s ease-out,
      margin 0.3s ease-out,
      padding 0.3s ease-out;
    overflow: hidden;
    max-width: 1000px; /* Large initial max-width */
  }

  .card-wrapper.removing {
    max-width: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
  }
</style>
