<script>
  import { playArea } from '$lib/stores/playArea.js';
  import { iconMap } from '$lib/assets/registry';
  import Card from '$lib/components/Card.svelte';
  import '$lib/styles/cards.css';

  // Props
  export let unit;

  // Keep the same conditions list you’re using
  const CONDITIONS = [
    'strengthened',
    'muddled',
    'poisoned',
    'wounded',
    'stunned',
    'immobilized',
    'disarmed'
  ];

  function removeUnit() {
    playArea.update((arr) => arr.filter((u) => u.id !== unit.id));
  }

  function adjustHp(delta) {
    const max = unit.stats.health ?? 0;
    unit.currentHp = Math.max(0, Math.min(max, (unit.currentHp ?? max) + delta));
    playArea.update((a) => [...a]); // trigger reactivity/persistence
  }

  function toggleCondition(condition) {
    const list = unit.activeConditions ?? [];
    const isActive = list.includes(condition);
    unit.activeConditions = isActive ? list.filter((c) => c !== condition) : [...list, condition];
    playArea.update((a) => [...a]); // trigger reactivity/persistence
  }
</script>

<Card className={unit.type}>
  <!-- Remove (top-right) -->
  <button class="remove-btn" aria-label="Remove card" title="Remove" on:click={removeUnit}>
    <!-- same trash icon you used -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="-0.5 0 25 25"
    >
      <path
        stroke="#0F0F0F"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-miterlimit="10"
        d="M6.5 7.085v14.33c0 .28.22.5.5.5h10c.28 0 .5-.22.5-.5V7.085M14 5.085h-4v-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5zM5 5.085h14M12 10.465v7.46M15 9.465v9.46M9 9.465v9.46"
      />
    </svg>
  </button>

  <div class="top">
    <div><strong class="large">#{unit.number}</strong> ({unit.type})</div>

    HP:<span class="large">{unit.currentHp}</span>/{unit.stats.health}
    <span class="hp-controls">
      <button on:click={() => adjustHp(-1)}>-</button>
      <button on:click={() => adjustHp(+1)}>+</button>
    </span>

    <div class="mar">
      <strong>Mov</strong>: {unit.stats.move} |
      <strong>Atk</strong>: {unit.stats.attack} |
      <strong>Rng</strong>: {unit.stats.range}
    </div>

    {#if unit.stats.attributes.length > 0}
      <strong>Attributes</strong>:<br />
      <div class="attributes">
        {#each unit.stats.attributes as attr}
          {@const iconKey = attr.split(' ')[0]?.toLowerCase()}
          {@const attrValue = attr.split(' ')[1]?.toLowerCase()}
          {#if iconMap[iconKey]}
            <span class="attribute-group">
              <img
                src={iconMap[iconKey]}
                width="16"
                height="16"
                alt={attr}
                title={attr}
                class="attribute-icon"
              />
              {attrValue}
            </span>
          {:else}
            <span>{attr}</span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <div class="bottom">
    <div class="conditions">
      {#each CONDITIONS as condition}
        {@const isActive = (unit.activeConditions ?? []).includes(condition)}
        <button on:click={() => toggleCondition(condition)} aria-pressed={isActive}>
          <img
            src={iconMap[condition]}
            alt={condition}
            title={condition}
            class="condition-icon {isActive ? 'active' : 'inactive'}"
          />
        </button>
      {/each}
    </div>

    <div class="health-bar">
      <div
        class={`health-fill ${unit.currentHp < 6 ? 'pulse' : ''}`}
        style:width={(unit.currentHp / unit.stats.health) * 100 + '%'}
      ></div>
    </div>
  </div>
</Card>
