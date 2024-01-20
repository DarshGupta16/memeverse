<script>
    import Modal from '$lib/components/modal.svelte';
    import { goto } from '$app/navigation'
    import { fire } from '$lib/plugins/firebase/firebase'

    let showModal = false, modalMessage;
    const toggleModal = () => {
        showModal = !showModal;
    }

    let username, email, password;
    const signup = async () => {
        const result = await fire.signupUser(username, email, password)

        toggleModal()

        if (result.status == false) modalMessage = result.error
        else { modalMessage = alert("Account created successfully!"); goto('/') }
    }
</script>

<Modal {showModal} message={modalMessage} on:click={() => toggleModal()} />

<div class="signup-page">
    <form class="signup-form" on:submit|preventDefault={() => signup()}>
        <input type="text" class="username" placeholder="username.." required bind:value={username}>
        <input type="text" class="email" placeholder="email.." required bind:value={email}>
        <input type="password" class="password" placeholder="password.." required bind:value={password}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <p on:click={() => goto('/login')} style="text-decoration: underline;">login?</p>
        <button class="signup-btn">signup</button>
    </form>
</div>