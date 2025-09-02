<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
</script>

<svelte:head>
    <title>404 | Page Not Found | Trelae</title>
    <meta
        name="description"
        content="The page you are looking for does not exist on Trelae. Go back home for help."
    />
</svelte:head>

<div class="grid min-h-full place-items-center bg-white px-6 py-24 lg:px-8">
    <div class="text-center max-w-2xl">
        <p class="text-sm font-semibold text-blue-600 mb-2">404</p>
        <h1
            class="mt-2 text-4xl sm:text-6xl font-bold tracking-tight text-gray-600"
        >
            This page does not exist
        </h1>
        <p class="mt-4 text-base sm:text-lg text-gray-600">
            Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div class="mt-8 flex items-center justify-center">
            <Button
                href="/"
                class="gap-2 flex items-center justify-center w-full sm:w-auto"
            >
                Go back home <ArrowRight size={16} strokeWidth={2.5} />
            </Button>
        </div>
    </div>
</div>
