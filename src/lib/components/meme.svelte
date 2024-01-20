<script>
	import { createEventDispatcher } from "svelte"
    import { goto } from "$app/navigation"
    import { auth } from "$lib/plugins/firebase/firebase.js"

    export let meme;
    export let index;
    export let memePageActive = false;

    const dispatch = createEventDispatcher()

    const likeMeme = (memeID) => {
        dispatch('like', { memeID, index })
    }

    const deleteMeme = (memeID) => {
        dispatch('delete', { memeID })
    }
</script>

<div class="meme">
    <p class="poster" on:click={() => goto(`/user/${meme.poster}`)}>{meme.posterUsername}</p>
    <img src="{meme.downloadURL}" alt="" on:click={() => goto(`/meme/${meme.memeID}`)}>
    <div class="button-row">
        <button on:click={() => likeMeme(meme.memeID)} style:background-color="{meme.likes.includes(auth.currentUser.uid) ? "hsl(0, 100%, 69%)" : ""}">
            <i class="{meme.likes.includes(auth.currentUser.uid) ? "fa-solid" : "fa-regular"} fa-heart"></i>
            <p>{meme.likes.length}</p>
        </button>
        <button on:click={() => goto(`/meme/${meme.memeID}`)} style:background-color="{memePageActive ? "hsl(156, 93%, 46%)" : ""}">
            <i class="fa-regular fa-comment"></i>
            <p>{meme.comments.length}</p>
        </button>
        {#if auth.currentUser?.uid == meme.poster}
            <button on:click={() => deleteMeme(meme.memeID)}><i class="fa-solid fa-trash"></i></button>
        {/if}
    </div>
</div>
