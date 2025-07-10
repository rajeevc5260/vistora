<script lang="ts">
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<div class="max-w-7xl mx-auto space-y-8 px-4 lg:px-0">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">All Videos</h1>
            <p class="text-gray-600 mt-1">
                View and manage uploaded video files across your courses
            </p>
        </div>
    </div>
</div>
