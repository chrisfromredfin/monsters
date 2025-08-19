<!-- src/lib/components/ConditionsDisplay.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { iconMap } from '$lib/assets/registry';
  import { CONDITIONS, IMMUNITY_MAP } from '$lib/constants.js';
  
  export let activeConditions = [];
  export let immunities = []; // Array of immunities for bosses
  
  const dispatch = createEventDispatcher();
  
  // Normalize immunities to lowercase set for fast lookup
  const immuneSet = new Set(immunities.map((s) => s.toLowerCase()));
  
  function toggleCondition(condition) {
    dispatch('toggle', { condition });
  }
</script>

<div class="conditions">
  {#each CONDITIONS as condition}
    {@const isActive = activeConditions.includes(condition)}
    {@const immunityKey = (IMMUNITY_MAP[condition] ?? condition).toLowerCase()}
    {@const isImmune = immuneSet.has(immunityKey)}

    <button
      on:click={() => toggleCondition(condition)}
      aria-pressed={isActive}
      disabled={isImmune}
      title={isImmune ? `Immune to ${condition}` : condition}
      class="condition-button {isImmune ? 'immune' : isActive ? 'active' : 'inactive'}"
    >
      <img
        src={iconMap[condition]}
        alt={condition}
        title={condition}
        class="condition-icon {isImmune ? 'immune' : isActive ? 'active' : 'inactive'}"
      />
    </button>
  {/each}
</div>
