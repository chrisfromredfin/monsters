<!-- src/lib/components/HpControls.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  export let currentHp;
  export let maxHp;
  
  const dispatch = createEventDispatcher();
  
  function adjustHp(delta) {
    dispatch('adjust', { delta });
  }
</script>

HP:<span class="large">{currentHp}</span>/{maxHp}
<span class="hp-controls">
  <button on:click={() => adjustHp(-1)}>-</button>
  <button on:click={() => adjustHp(+1)}>+</button>
</span>
