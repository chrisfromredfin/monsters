<script>
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="wrapper">
  <div class="container">
    {@render children?.()}
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=Roboto+Condensed:wght@400;700&display=swap');

  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family: 'Roboto Condensed', sans-serif;
    font-size: 16px;
    line-height: 1.4;
    color: #222;
  }
  :global(*) {
    box-sizing: border-box;
  }
  :global(h1, h2, h3, h4, h5, h6) {
    font-family: 'IM Fell English SC', serif;
    font-weight: normal; /* This font has its own natural weight */
    letter-spacing: 0.5px;
    margin-bottom: 0.3em;
  }

  .wrapper {
    min-height: 100vh;
    background: #e9dab4;
    background: linear-gradient(
      145deg,
      rgba(233, 218, 180, 0) 42%,
      rgba(233, 218, 180, 1) 70%,
      rgba(233, 218, 180, 1) 100%
    );
  }
  .container {
    padding: 1rem;
    margin: 0 auto;
    min-height: 1rem;
  }
</style>
