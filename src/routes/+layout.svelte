<script>
	import { onMount } from "svelte";
    import {auth} from "$lib/plugins/firebase/firebase.js"
    import {goto} from "$app/navigation"

    onMount(() => {
        auth.onAuthStateChanged(user => {
            if (!user) goto('/login')
            if (!user.emailVerified) goto('/not_verified')
        })
    })
</script>

<style>
    @import url("$lib/styles/style.css");
</style>

<slot></slot>