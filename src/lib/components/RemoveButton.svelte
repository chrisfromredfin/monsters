<!-- src/lib/components/RemoveButton.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('remove');
  }
</script>

<button class="remove-btn" aria-label="Remove card" title="Remove" on:click={handleClick}>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="-0.5 0 25 25">
    <path
      stroke="#0F0F0F"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      d="M6.5 7.085v14.33c0 .28.22.5.5.5h10c.28 0 .5-.22.5-.5V7.085M14 5.085h-4v-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5zM5 5.085h14M12 10.465v7.46M15 9.465v9.46M9 9.465v9.46"
    />
  </svg>
</button>
