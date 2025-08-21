<!-- src/lib/components/HpControls.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  export let currentHp;
  export let maxHp;

  const dispatch = createEventDispatcher();

  /**
   * @param {number} delta
   */
  function adjustHp(delta) {
    dispatch('adjust', { delta });
  }
</script>

<div class="hp-controls">
  <span>HP:<span class="large">{currentHp}</span>/{maxHp}</span>
  <span class="hp-controls">
    <button on:click={() => adjustHp(-1)}>-</button>
    <button on:click={() => adjustHp(+1)}>+</button>
  </span>
</div>

<style>
  .hp-controls {
    display: flex;
  }

  .hp-controls > span {
    width: 50%;
    display: inline-block;
  }
</style>
