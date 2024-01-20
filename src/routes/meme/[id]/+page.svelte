<script>
    import { page } from "$app/stores"
	import { onMount } from "svelte"
    import { auth, fire } from "$lib/plugins/firebase/firebase.js"
    import { goto, afterNavigate } from "$app/navigation"
    import Meme from "$lib/components/meme.svelte"
    const memeID = $page.params.id

    let meme;
    onMount(async () => {
        meme = await fire.fetchMeme(memeID)
    })

    let previousPage;

    afterNavigate(({from}) => {
        previousPage = from.url.pathname || "/trending";
    })

    const likeMeme = async (memeID) => {
        if (!meme.likes.includes(auth.currentUser.uid)) {
            await fire.addLike(memeID)

            let updatedMemeDoc = meme
            updatedMemeDoc.likes.push(auth.currentUser.uid)

            meme = updatedMemeDoc
        } else {
            await fire.removeLike(memeID)

            let updatedMemeDoc = meme
            updatedMemeDoc.likes.splice(updatedMemeDoc.likes.indexOf(auth.currentUser.uid), 1)

            meme = updatedMemeDoc
        }
    }

    const deleteMeme = async (memeID) => {
        await fire.deleteMeme(memeID)

        goto(previousPage)
    }

    let commentInput = ""

    const addComment = async () => {
        await fire.addComment(memeID, commentInput)

        meme.comments = [{comment: commentInput, poster: auth.currentUser.uid, posterUsername: auth.currentUser.displayName}, ...meme.comments]

        commentInput = ""
    }

    const deleteComment = async (index) => {
        meme.comments.splice(index, 1)
        meme.comments = meme.comments
        await fire.deleteComment(memeID, meme.comments)
    }
</script>

<div class="meme-page">
    {#if meme != null}
        <button class="back-btn" on:click={() => goto(previousPage)}><i class="fa-solid fa-arrow-left"></i></button>
        <Meme {meme} index={0} on:like={(e) => likeMeme(e.detail.memeID)} on:delete={(e) => deleteMeme(e.detail.memeID)} memePageActive={true} />
        
        <div class="comments-section">
            {#each meme.comments as comment, index(comment)}
                <div class="comment">
                    <p>
                        <strong>{comment.posterUsername}</strong>
                        {#if auth.currentUser.uid == comment.poster}
                            <button class="delete-comment-btn" on:click={() => deleteComment(index)}><i class="fa-solid fa-trash"></i></button>
                        {/if}
                    </p>
                    <p>{comment.comment}</p>
                </div>
            {/each}
        </div>

        <div class="comment-input-container">
            <div class="comment-input-content">
                <input type="text" placeholder="add a comment..." maxlength="500" bind:value={commentInput}>
                <button class="upload-btn" on:click={() => addComment()}><img src="/icons/paper plane.png" alt="" class="icon"></button>
            </div>
        </div>
    {/if}
</div>