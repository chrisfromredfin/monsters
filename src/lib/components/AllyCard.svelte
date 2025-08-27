<script>
  import Card from '$lib/components/Card.svelte';
  import RemoveButton from '$lib/components/RemoveButton.svelte';
  import HpControls from '$lib/components/HpControls.svelte';
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
  <Card className="ally">
    <!-- Remove (top-right) -->
    <RemoveButton on:remove={handleRemove} />

    <div class="top">
      <div><strong class="large">{unit.name}</strong> (Ally)</div>

      <HpControls currentHp={unit.currentHp} maxHp={unit.stats.health} on:adjust={handleHpAdjust} />
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
  .card-wrapper {
    transition:
      max-width 0.3s ease-out,
      opacity 0.3s ease-out,
      margin 0.3s ease-out,
      padding 0.3s ease-out;
    overflow: hidden;
    max-width: 1000px;
  }

  .card-wrapper.removing {
    max-width: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
  }
</style>
