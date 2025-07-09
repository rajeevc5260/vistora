<script lang="ts">
    import { page } from "$app/state";
    import Header from "$lib/custom-components/Header.svelte";
    let { children } = $props();
    import "../app.css";

    import { Toaster } from "$lib/components/ui/sonner";
</script>

{#if !page.url.pathname.startsWith("/dashboard") }
    <Header />
{/if}
{@render children()}
<Toaster position="bottom-right"  richColors />
