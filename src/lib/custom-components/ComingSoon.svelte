<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { CalendarDays } from "lucide-svelte";
    import { goto } from "$app/navigation";
</script>

<div class="max-w-4xl mx-auto py-20 px-6 text-center space-y-8">
    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
        <CalendarDays class="w-12 h-12 text-gray-400" />
    </div>
    <h1 class="text-3xl font-bold text-gray-900">Coming Soon</h1>
    <p class="text-gray-600 max-w-md mx-auto">
        We're working hard to bring you this feature. Check back soon for updates!
    </p>
    <Button onclick={() => goto('/dashboard')} class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
        Back to Dashboard
    </Button>
</div>
