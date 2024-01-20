<script>
    import Tabs from '$lib/components/tabs.svelte'
    import { fire } from '$lib/plugins/firebase/firebase.js'

    let newUsername = ""
    let usernameChangeStatus = ""

    const updateUsername = async () => {
        usernameChangeStatus = "Changing..."
        await fire.changeUsername(newUsername)
        newUsername = ""
        usernameChangeStatus = "Username changed successfully!"
    }

    let oldEmail = ""
    let newEmail = ""
    let password = ""
    let emailChangeStatus = "";

    const updateEmail = async () => {
        await fire.changeEmail(oldEmail, newEmail, password)
        oldEmail = ""
        newEmail = ""
        password = ""
        emailChangeStatus = "Please click the link in your inbox to verify the new email"
    }

    let email = ""
    let oldPassword = ""
    let newPassword = ""
    let passwordChangeStatus = ""

    const updatePassword = async () => {
        await fire.changePassword(email, oldPassword, newPassword)
        passwordChangeStatus = "Password Changed!"
        email = ""
        oldPassword = ""
        newPassword = ""
    }

    let accountDeleteEmail = ""
    let accountDeletePassword = ""

    const deleteAccount = () => {
        fire.deleteAccount(accountDeleteEmail, accountDeletePassword)
    }
</script>

<div class="settings-page">
    <h1>Settings</h1>
    <div class="section">
        <h2 class="section-title">Change Username</h2>
        <input type="text" class="section-input" placeholder="New username..." bind:value={newUsername}>
        <button class="section-submit-btn" on:click={() => updateUsername()}>Change</button>
        <p class="username-change-status" style="text-align: center;">{usernameChangeStatus}</p>
    </div>
    <div class="section">
        <h2 class="section-title">Change Email</h2>
        <input type="text" class="section-input" placeholder="Old email..." bind:value={oldEmail}>
        <input type="text" class="section-input" placeholder="New email..." bind:value={newEmail}>
        <input type="password" class="section-input" placeholder="Password..." bind:value={password}>
        <br>
        <button class="section-submit-btn" on:click={() => updateEmail()}>Change</button>
        <p>{emailChangeStatus}</p>
    </div>
    <div class="section">
        <h2 class="section-title">Change Password</h2>
        <input type="text" class="section-input" placeholder="Email..." bind:value={email}>
        <input type="password" class="section-input" placeholder="Old Password..." bind:value={oldPassword}>
        <input type="password" class="section-input" placeholder="New Password..." bind:value={newPassword}>
        <br>
        <button class="section-submit-btn" on:click={() => updatePassword()}>Change</button>
        <p>{passwordChangeStatus}</p>
    </div>
    <div class="section">
        <h2 class="section-title">Delete Account</h2>
        <input type="text" class="section-input" placeholder="Email..." bind:value={accountDeleteEmail}>
        <input type="password" class="section-input" placeholder="Password..." bind:value={accountDeletePassword}>
        <br>
        <button class="section-submit-btn" on:click={() => deleteAccount()}>Delete</button>
    </div>
    <br><br>
    <div class="section" style="text-align: center;">
        <button class="section-submit-btn" on:click={() => fire.signoutUser()}>Sign Out</button>
    </div>
</div>

<Tabs activeTab="settings" />