<script>
  export let className = ''; // allow custom classes to be passed in
</script>

<div class={`monster-card ${className}`}>
  <slot />
</div>

<style>
  .monster-card {
    position: relative;
    border: 2px solid #ccc;
    padding: 0.5rem;
    width: 230px;
    background: #f9f9f9;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    font-family: 'Roboto Condensed', sans-serif;
    font-size: 0.95rem;
  }
  .monster-card.elite {
    border-color: gold;
    background: rgba(255, 215, 0, 0.2);
  }
  .monster-card.boss {
    width: 350px;
    border-color: #510e6b;
    background-color: white;
  }
  .monster-card.ally {
    border-color: #17a2b8;
    background: #e8f9fc;
  }
</style>
