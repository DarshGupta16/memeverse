<script>
    import Modal from '$lib/components/modal.svelte';
    import { goto } from '$app/navigation'
    import { fire } from '$lib/plugins/firebase/firebase'

    let showModal = false, modalMessage;
    const toggleModal = () => showModal = !showModal;

    let email, password;
    const login = async () => {
        const result = await fire.loginUser(email, password)

        if (result.status == true) { alert("Signed in successfully!"); goto('/'); }
        else { modalMessage = result.error; toggleModal(); }
    }
</script>

<Modal {showModal} message={modalMessage} on:click={() => toggleModal()} />

<div class="signup-page">
    <form class="signup-form" on:submit|preventDefault={() => login()}>
        <input type="text" class="email" placeholder="email.." required bind:value={email}>
        <input type="password" class="password" placeholder="password.." required bind:value={password}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <p on:click={() => goto('/signup')} style="text-decoration: underline;">signup?</p>
        <button class="signup-btn">login</button>
    </form>
</div>