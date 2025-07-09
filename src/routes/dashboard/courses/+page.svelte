<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";
    import { Badge } from "$lib/components/ui/badge";
    import { CalendarDays, Plus, BookOpen, Clock, Eye } from "lucide-svelte";

    type Course = {
        id: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        createdAt: string;
    };

    let courses = $state<Course[]>([]);
    let offset = $state(0);
    let loading = $state(false);
    let endReached = $state(false);

    const limit = 9;

    async function loadMoreCourses() {
        if (loading || endReached) return;

        loading = true;
        const res = await fetch(`/api/courses?offset=${offset}&limit=${limit}`);
        const newCourses = await res.json();

        if (newCourses.length === 0) {
            endReached = true;
        } else {
            courses = [...courses, ...newCourses];
            offset += limit;
        }
        loading = false;
    }

    function handleScroll() {
        const bottom =
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 200;

        if (bottom) loadMoreCourses();
    }

    onMount(() => {
        loadMoreCourses();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
</script>

<div class="max-w-7xl mx-auto space-y-8 px-4 lg:px-0">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Your Courses</h1>
            <p class="text-gray-600 mt-1">
                Manage and organize your educational content
                {#if courses.length > 0}
                    • {courses.length} course{courses.length !== 1 ? 's' : ''} total
                {/if}
            </p>
        </div>
        
        <Button 
            onclick={() => goto("/dashboard/courses/new")} 
            class="gap-2  text-white px-6 py-3 rounded-lg shadow-sm"
        >
            <Plus class="w-5 h-5" />
            Create New Course
        </Button>
    </div>

    <!-- Courses Grid -->
    {#if courses.length === 0 && !loading}
        <!-- Empty State -->
        <div class="text-center py-16">
            <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen class="w-12 h-12 text-gray-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p class="text-gray-600 mb-6 max-w-sm mx-auto">
                Get started by creating your first course. Share your knowledge with the world!
            </p>
            <Button 
                onclick={() => goto("/dashboard/courses/new")} 
                class="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
                <Plus class="w-5 h-5" />
                Create Your First Course
            </Button>
        </div>
    {:else}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each courses as course}
                <div
                    role="presentation"
                    class="group rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden"
                    onclick={() => goto(`/dashboard/courses/${course.id}`)}
                >
                    <!-- Thumbnail -->
                    <div class="relative aspect-video overflow-hidden">
                        <img
                            src={course.thumbnailUrl ||
                                "https://placehold.co/640x360?text=Thumbnail"}
                            alt={course.title}
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        <!-- Overlay on hover -->
                        <div class="absolute inset-0 bg-opacity group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div class="bg-white rounded-full p-3 shadow-lg">
                                    <Eye class="w-6 h-6 text-gray-700" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <div class="flex items-start justify-between gap-3 mb-3">
                            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {course.title}
                            </h3>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                            {course.description || "No description provided for this course yet."}
                        </p>

                        <!-- Footer -->
                        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarDays class="w-4 h-4" />
                                <span>{formatDate(course.createdAt)}</span>
                            </div>
                            
                            <Badge variant="secondary" class="text-xs px-3 py-1">
                                <Clock class="w-3 h-3 mr-1" />
                                Draft
                            </Badge>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Loading States -->
    {#if loading}
        <div class="text-center py-8">
            <div class="inline-flex items-center gap-2 text-gray-500">
                <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading more courses...</span>
            </div>
        </div>
    {:else if endReached && courses.length > 0}
        <div class="text-center py-8">
            <div class="inline-flex items-center gap-2 text-gray-400">
                <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>You've reached the end</span>
                <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    {/if}
</div>