<!-- src/lib/components/StatsDisplay.svelte -->
<script>
  export let move;
  export let attack;
  export let range;
</script>

<div class="mar">
  <strong>Mov</strong>: {move} |
  <strong>Atk</strong>: {attack} |
  <strong>Rng</strong>: {range}
</div>
