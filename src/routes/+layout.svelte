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
	:global(html, body) {
		margin: 0;
		padding: 0;
  		background-color: #eeeeee;
	}
	:global(*) {
		box-sizing: border-box;
	}
	.wrapper {
		min-height:100vh;
	}
	.container {
		padding: 1rem;
		max-width: 1024px;
		margin: 1rem auto;
		border: 1px solid black;
		min-height: 1rem;
		background-color: white;
	}
</style>