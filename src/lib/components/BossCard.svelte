<!-- src/lib/components/BossCard.svelte -->
<script>
  import { playArea } from '$lib/stores/playArea.js';
  import { iconMap } from '$lib/assets/registry';
  import Card from '$lib/components/Card.svelte';
  import '$lib/styles/cards.css';

  /** @typedef {import('$lib/types').Unit} Unit */
  /** @type {{ unit: Unit }} */
  export let unit;

  const CONDITIONS = [
    'strengthened',
    'muddled',
    'poisoned',
    'wounded',
    'stunned',
    'immobilized',
    'disarmed'
  ];

  const IMMUNITY_MAP = {
    muddled: 'muddle',
    poisoned: 'poison',
    wounded: 'wound',
    stunned: 'stun',
    immobilized: 'immobilize',
    disarmed: 'disarm'
    // strengthened has no immunity counterpart
  };
  // Normalize boss immunities to lowercase set for fast lookup
  const immuneSet = new Set((unit.bossMeta?.immunities ?? []).map((s) => s.toLowerCase()));

  function removeUnit() {
    playArea.update((arr) => arr.filter((u) => u.id !== unit.id));
  }
  function adjustHp(delta) {
    const max = unit.stats.health ?? 0;
    unit.currentHp = Math.max(0, Math.min(max, (unit.currentHp ?? max) + delta));
    playArea.update((a) => [...a]);
  }
  function toggleCondition(condition) {
    const list = unit.activeConditions ?? [];
    const isActive = list.includes(condition);
    unit.activeConditions = isActive ? list.filter((c) => c !== condition) : [...list, condition];
    playArea.update((a) => [...a]);
  }
</script>

<Card className="boss">
  <button class="remove-btn" aria-label="Remove card" title="Remove" on:click={removeUnit}>
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
    <div><strong class="large">{unit.name}</strong> (Boss)</div>

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

    {#if unit.bossMeta?.immunities?.length}
      <div class="mar"><strong>Immunities:</strong> {unit.bossMeta.immunities.join(', ')}</div>
    {/if}
    {#if unit.bossMeta?.specials?.length}
      <div class="mar">
        <strong>Specials:</strong>
        <ol>
          {#each unit.bossMeta.specials as s}
            <li>{s}</li>
          {/each}
        </ol>
      </div>
    {/if}
    {#if unit.bossMeta?.notes}
      <div class="mar"><em>{unit.bossMeta.notes}</em></div>
    {/if}
  </div>

  <div class="bottom">
    <div class="conditions">
      {#each CONDITIONS as condition}
        {@const isActive = (unit.activeConditions ?? []).includes(condition)}
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

    <div class="health-bar">
      <div
        class={`health-fill ${unit.currentHp < 6 ? 'pulse' : ''}`}
        style:width={(unit.currentHp / unit.stats.health) * 100 + '%'}
      ></div>
    </div>
  </div>
</Card>

<style>
  ol {
    margin: 0;
    padding-inline-start: 1.25rem;
  }
</style>
