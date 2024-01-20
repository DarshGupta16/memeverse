<script>
    import { auth, fire } from "$lib/plugins/firebase/firebase.js"
    import { goto } from "$app/navigation"

    let newEmail = ""
    let password = ""
    const changeEmail = async () => {
        await fire.changeEmail(auth.currentUser.email, newEmail, password)
        newEmail = ""
        password = ""
        alert("New verification link has been sent to your inbox")
    }
</script>

<div class="unverified-page">
    <div class="unverified-page-content">
        <h1>Please click the link in your inbox and verify your email to continue</h1>
        <p>Or change your email:</p>
        <br><br><br>
        <input type="text" placeholder="Enter a new email..." class="unverified-input" bind:value={newEmail}>
        <input type="password" placeholder="Password..." class="unverified-input" bind:value={password}>
        <br><br>
        <button class="unverified-btn" on:click={() => changeEmail()}>Change Email</button>
        <br><br>
        <button class="unverified-btn" on:click={() => goto('/')}>Try loading again</button>
    </div>
</div>