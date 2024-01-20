<script>
    import Tabs from "$lib/components/tabs.svelte";
    import Modal from "$lib/components/modal.svelte";
    import { fire } from "$lib/plugins/firebase/firebase.js"
    import { goto } from "$app/navigation"

    let showModal = false;
    let modalMessage = "";

    let file;
    let fileBlob;

    const acceptedFormats = ["image/jpeg", "image/png", "image/gif"]

    $: {         
        if (file != null) {
            if (acceptedFormats.includes(file.type)) {
                fileBlob = URL.createObjectURL(file);
            } else {
                modalMessage = "Invalid file format";
                showModal = true;
                file = null;
            }
        }
    }

    const upload = async () => {
        if (file != null) {
            const dotIndex = file.name.lastIndexOf(".")
            const extension = file.name.substring(dotIndex + 1)

            const result = await fire.uploadMeme(file, extension)
            if (result.status == true) {
                alert("Meme uploaded!")
                goto('/latest')
            } else {
                showModal = true;
                modalMessage = result.error;
            }
        } else {
            showModal = true;
            modalMessage = "No file selected";
        }
    }
</script>

<Modal {showModal} message={modalMessage} on:click={() => showModal = false} />

<div class="upload-page">
    <h1 class="page-title">Upload a meme</h1>

    <div class="input-group">
        <img src="{fileBlob}" alt="">
        <input type="file" on:change={(e) => file = e.target.files[0]} accept=".jpg, .png, .gif" />
    </div>

    <button class="upload-btn" on:click={() => upload()}><img src="/icons/paper plane.png" alt="" class="icon"></button>
</div>

<Tabs activeTab="upload" />