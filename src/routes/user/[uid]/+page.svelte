<script>
    import { auth, fire } from "$lib/plugins/firebase/firebase.js"
    import Meme from "$lib/components/meme.svelte"
    import Tabs from "$lib/components/tabs.svelte"

    export let data;

    $: userUID = data.uid
    $: username = data.username;
    $: memes = data.memes
    $: followers = data.followers

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

    const followUser = async () => {
        await fire.followUser(userUID)
        followers = await fire.fetchFollowers(userUID)
    }

    const unfollowUser = async () => {
        await fire.unfollowUser(userUID)
        followers = await fire.fetchFollowers(userUID)
    }
</script>

<div class="latest-page user-page">
    <div class="title-container">
        {#if username != null}
            <h2 class="title">{username}</h2>
            <p class="followers-count">{followers.length} followers</p>
            {#if userUID != auth.currentUser.uid}
                {#if !followers.includes(auth.currentUser.uid)}
                    <button class="follow-btn" on:click={() => followUser()}>
                        Follow
                    </button>
                {:else}
                    <button class="follow-btn" on:click={() => unfollowUser()}>
                        Unfollow
                    </button>
                {/if}
            {/if}
        {/if}
    </div>

    <div class="memes-container">
        {#each memes as meme, index(meme)}
            <Meme {meme} {index} on:like={(e) => likeMeme(e.detail.memeID, e.detail.index)} on:delete={(e) => deleteMeme(e.detail.memeID, e.detail.index)} />
        {/each}
        <br>
        <br>
        <br>
        <br>
    </div>

    <Tabs activeTab="account" />
</div>