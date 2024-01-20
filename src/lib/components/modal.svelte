<script>
    export let showModal = false;
    export let message;

    const disableModal = () => {
        showModal = false;
    }
</script>

{#if showModal}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal" on:click|self>
    <div class="modal-content">
        <h1>{message}</h1>
        <button on:click>Okay</button>
    </div>
</div>
{/if}