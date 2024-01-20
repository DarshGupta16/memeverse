<script>
    import Tabs from '$lib/components/tabs.svelte'
    import Meme from '$lib/components/meme.svelte'
    import { auth, fire } from "$lib/plugins/firebase/firebase.js"
	import { onMount } from 'svelte';
    import { goto } from "$app/navigation"

    let memes = [];

    onMount(async () => {
        const loadedMemes = await fire.loadLatest();
        memes = loadedMemes;
    })

    const likeMeme = async (memeID, index) => {
        if (!memes[index].likes.includes(auth.currentUser.uid)) {
            await fire.addLike(memeID)

            let updatedMemeDoc = memes[index]
            updatedMemeDoc.likes.push(auth.currentUser.uid)

            memes[index] = updatedMemeDoc
        } else {
            await fire.removeLike(memeID)

            let updatedMemeDoc = memes[index]
            updatedMemeDoc.likes.splice(updatedMemeDoc.likes.indexOf(auth.currentUser.uid), 1)

            memes[index] = updatedMemeDoc
        }
    }

    const deleteMeme = async (memeID, index) => {
        await fire.deleteMeme(memeID)

        let updatedMemes = memes;
        updatedMemes.splice(index, 1)

        memes = updatedMemes
    }
</script>

<div class="latest-page">
    <h1 class="title">Memeverse</h1>
    <button class="settings-btn" on:click={() => goto('/settings')}>
        <img src="/icons/gear.png" class="settings-icon" alt="">
    </button>
    <h2>Latest</h2>
    <div class="memes-container">
        {#each memes as meme, index(meme)}
            <Meme {meme} {index} on:like={(e) => likeMeme(e.detail.memeID, e.detail.index)} on:delete={(e) => deleteMeme(e.detail.memeID, e.detail.index)} />
        {/each}
        <br>
        <br>
        <br>
        <br>
    </div>
</div>

<Tabs activeTab="latest" />