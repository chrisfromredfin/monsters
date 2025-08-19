<!-- src/lib/components/HealthBar.svelte -->
<script>
  export let currentHp;
  export let maxHp;
  export let lowThreshold = 6; // HP threshold for pulse effect
</script>

<div class="health-bar">
  <div
    class={`health-fill ${currentHp < lowThreshold ? 'pulse' : ''}`}
    style:width={(currentHp / maxHp) * 100 + '%'}
  ></div>
</div>
