<script>
    import { goto } from "$app/navigation"
    import { auth } from "$lib/plugins/firebase/firebase.js"
	import { onMount } from "svelte";

    export let activeTab = "";

    let tabs = [];

    onMount(() => {
        auth.onAuthStateChanged(user => {
            if (user) {
                tabs = [
                    { name: 'trending', link: '/', iconName: 'fire', activeColour: 'hsl(29, 100%, 90%)' },
                    { name: 'following', link: '/following', iconName: 'heart', activeColour: 'hsl(330, 100%, 90%)' },
                    { name : 'latest', link: '/latest', iconName: 'sparkles', activeColour: 'hsl(58, 100%, 90%)'},
                    { name: 'upload', link: '/upload', iconName: 'upload', activeColour: 'hsl(187, 100%, 90%)' },
                    { name: 'account', link: `/user/${auth.currentUser.uid}`, iconName: 'account', activeColour: 'hsl(210, 100%, 90%)'},
                ]
            }
        })
    })
</script>

<div class="tabs">
    {#each tabs as tab}
        <button class="tab" style="background-color: {tab.name == activeTab ? tab.activeColour : 'initial'};" on:click={() => goto(tab.link)}>
            <!-- svelte-ignore a11y-missing-attribute -->
            <img src="/icons/{tab.iconName}.png" class="tab-icon">
        </button>
    {/each}
</div>