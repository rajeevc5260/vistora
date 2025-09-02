<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";
    import { Badge } from "$lib/components/ui/badge";
    import { CalendarDays, Plus, BookOpen, Check, Eye, Heart } from "lucide-svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    const userRole = data.session?.user?.role || 'viewer';
    const isInstructor = userRole === 'instructor';

    type Course = {
        id: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        createdAt: string;
        isEnrolled?: boolean;
        isFavorited?:boolean;
    };

    let courses = $state<Course[]>([]);
    let offset = $state(0);
    let loading = $state(false);
    let endReached = $state(false);

    const limit = 20;

    async function loadMoreCourses() {
        if (loading || endReached || isSearching) return;

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

    let searchQuery = $state('');
    let searchTimeout: NodeJS.Timeout | null = null;
    let searchOffset = $state(0);
    let searchLimit = 20;
    let searchEndReached = $state(false);
    let isSearching = $state(false);

    async function searchCourses(query: string, append = false) {
        if (loading || searchEndReached) return;

        loading = true;

        const res = await fetch(`/api/courses/search?query=${encodeURIComponent(query)}&limit=${searchLimit}&offset=${searchOffset}`);
        const result = await res.json();

        if (append) {
            courses = [...courses, ...result];
        } else {
            courses = result;
        }

        if (result.length < searchLimit) {
            searchEndReached = true;
        }

        searchOffset += searchLimit;
        loading = false;
        isSearching = false;
    }



    function handleSearchInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        searchQuery = value;

        if (searchTimeout) clearTimeout(searchTimeout);

        if (value.trim() === '') {
            // Reset to default scroll mode
            isSearching = false;
            courses = [];
            offset = 0;
            endReached = false;
            loadMoreCourses();
            return;
        }

        searchTimeout = setTimeout(() => {
            searchOffset = 0;
            searchEndReached = false;
            courses = [];
            isSearching = true;
            searchCourses(value.trim());
        }, 300);
    }

    let enrollLoading = $state<{ [courseId: string]: boolean }>({});

    async function enrollInCourse(courseId: string) {
        enrollLoading[courseId] = true;
        try {
            const res = await fetch(`/api/courses/enroll`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ courseId })
            });

            if (res.ok) {
                courses = courses.map((c) =>
                    c.id === courseId ? { ...c, isEnrolled: true } : c
                );
            } else {
                console.error("Enrollment failed");
            }
        } catch (err) {
            console.error("Enrollment error", err);
        } finally {
            enrollLoading[courseId] = false;
        }
    }


    let favoriteLoading = $state<{ [id: string]: boolean }>({});

    async function toggleFavorite(courseId: string, current: boolean) {
        favoriteLoading[courseId] = true;

        try {
            const res = await fetch(`/api/courses/favorite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId,
                    action: current ? 'unfavorite' : 'favorite'
                })
            });

            if (res.ok) {
                courses = courses.map((c) =>
                    c.id === courseId ? { ...c, isFavorited: !current } : c
                );
            } else {
                console.error("Favorite toggle failed");
            }
        } finally {
            favoriteLoading[courseId] = false;
        }
    }
</script>

<svelte:head>
    <title>Courses — Vistora Dashboard</title>
    <meta name="description" content="Browse, manage, and organize your courses on the Vistora dashboard." />
</svelte:head>

<div class="max-w-7xl mx-auto space-y-8 px-4 lg:px-0">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">
                {isInstructor ? 'Your Courses' : 'Explore Courses'}
            </h1>
            <p class="text-gray-600 mt-1">
                {#if isInstructor}
                    Manage and organize your educational content
                    {#if courses.length > 0}
                        • {courses.length} course{courses.length !== 1 ? 's' : ''} total
                    {/if}
                {:else}
                    Browse the courses available to you
                {/if}
            </p>
        </div>
        
        {#if isInstructor}
            <Button 
                onclick={() => goto("/dashboard/courses/new")} 
                class="gap-2  text-white px-6 py-3 rounded-lg shadow-sm"
            >
                <Plus class="w-5 h-5" />
                Create New Course
            </Button>
        {/if}
    </div>

    <div class="relative">
        <Input
            type="text"
            placeholder="Search your courses..."
            class="w-full md:w-1/3 md:min-w-sm px-4 py-2"
            oninput={handleSearchInput}
            value={searchQuery}
        />
        {#if isSearching}
            <div class="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        {/if}
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
                            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {course.title}
                            </h3>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                            {course.description || "No description provided for this course yet."}
                        </p>

                        <div class="flex justify-center items-center gap-3 mb-2">
                            <div class="flex-1">
                                {#if !isInstructor && !course.isEnrolled}
                                    <Button
                                        size="sm"
                                        class="bg-blue-600 hover:bg-blue-700 text-white h-9 w-full text-sm"
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            enrollInCourse(course.id);
                                        }}
                                        disabled={enrollLoading[course.id]}
                                    >
                                        {#if enrollLoading[course.id]}
                                            <span class="inline-flex items-center gap-2">
                                                <div class="w-3 h-3 border-2 border-white border-t-blue-100 rounded-full animate-spin"></div>
                                                Enrolling...
                                            </span>
                                        {:else}
                                            Enroll
                                        {/if}
                                    </Button>
                                {:else if !isInstructor && course.isEnrolled}
                                    <div class="h-9 text-sm flex items-center justify-center bg-green-100 text-green-800 border border-green-300 rounded-md w-full">
                                        Enrolled
                                    </div>
                                {/if}
                            </div>
                        
                           {#if !isInstructor}
                                <button
                                    class="bg-white/80 hover:bg-white/90 rounded-full p-1"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(course?.id, course.isFavorited ?? false);
                                    }}
                                    disabled={favoriteLoading[course.id]}
                                >
                                {#if course.isFavorited}
                                    <Heart size={24} class="text-red-500 fill-red-500 stroke-none" />
                                {:else}
                                    <Heart size={24} class="text-gray-500 fill-none stroke-2" />
                                {/if}
                                </button>
                            {/if}
                        </div>
                        <!-- Footer -->
                        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarDays class="w-4 h-4" />
                                <span>{formatDate(course.createdAt)}</span>
                            </div>
                            
                            <Badge variant="secondary" class="text-xs px-3 py-1 bg-green-200 border-2 border-white ">
                                <Check  class="w-3 h-3 mr-1" />
                                Published
                            </Badge>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if isSearching && !searchEndReached && !loading}
        <div class="text-center py-6">
            <Button onclick={() => searchCourses(searchQuery, true)}>
                Load More Results
            </Button>
        </div>
    {/if}
    <!-- Loading States -->
    {#if loading}
        <div class="text-center py-8">
            <div class="inline-flex items-center gap-2 text-gray-500">
                <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading courses...</span>
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