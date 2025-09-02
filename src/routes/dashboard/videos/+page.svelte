<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { goto } from "$app/navigation";
    import {
        Video,
        Plus,
        Search,
        Play,
        Clock,
        FolderOpen,
        BookOpen,
        Calendar,
        Filter,
        Eye,
        MoreVertical,
        Trash
    } from "lucide-svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import type { PageProps } from "./$types";

    import {
        AlertDialog,
        AlertDialogTrigger,
        AlertDialogContent,
        AlertDialogHeader,
        AlertDialogTitle,
        AlertDialogFooter,
        AlertDialogCancel,
        AlertDialogAction
    } from "$lib/components/ui/alert-dialog";

    let { data }: PageProps = $props();

    type VideoWithDetails = {
        id: string;
        title: string;
        description?: string;
        fileId?: string;
        resolutions?: string;
        duration?: number;
        createdAt: string;
        moduleTitle?: string;
        courseTitle?: string;
        courseId?: string;
        moduleId?: string;
        thumbnailUrl?: string;
    };

    //@ts-expect-error
    let videos = $state<VideoWithDetails[]>(data.initialVideos || []);
    let offset = $state(20);
    let loading = $state(false);
    let endReached = $state(false);
    let searchQuery = $state('');
    let searchTimeout: NodeJS.Timeout | null = null;
    let isSearching = $state(false);
    let searchOffset = $state(0);
    let searchEndReached = $state(false);
    let deleteLoading = $state(false);

    const limit = 20;
    const searchLimit = 20;

    let showDeleteDialog = $state(false);
    let videoToDelete: VideoWithDetails | null = $state(null);

    async function confirmDeleteVideo(video: VideoWithDetails) {
        videoToDelete = video;
        showDeleteDialog = true;
    }

    async function deleteVideo() {
        if (!videoToDelete?.moduleId || !videoToDelete?.fileId) {
            showDeleteDialog = false;
            return;
        }

        deleteLoading = true;
        try {
            const res = await fetch(`/api/modules/${videoToDelete.moduleId}/lessons/bulk-delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ fileIds: [videoToDelete.fileId] })
            });

            if (res.ok) {
                videos = videos.filter(v => v.fileId !== videoToDelete?.fileId);
            } else {
                console.error("Delete failed");
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            showDeleteDialog = false;
            deleteLoading = false;
        }
    }

    async function loadMoreVideos() {
        if (loading || endReached || isSearching) return;

        loading = true;
        try {
            const res = await fetch(`/api/videos?offset=${offset}&limit=${limit}`);
            const newVideos = await res.json();

            if (newVideos.length === 0) {
                endReached = true;
            } else {
                videos = [...videos, ...newVideos];
                offset += limit;
            }
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            loading = false;
        }
    }

    async function searchVideos(query: string, append = false) {
        if (loading || searchEndReached) return;

        loading = true;
        try {
            const res = await fetch(`/api/videos?query=${encodeURIComponent(query)}&limit=${searchLimit}&offset=${searchOffset}`);
            const result = await res.json();

            if (append) {
                videos = [...videos, ...result];
            } else {
                videos = result;
            }

            if (result.length < searchLimit) {
                searchEndReached = true;
            }

            searchOffset += searchLimit;
        } catch (error) {
            console.error('Error searching videos:', error);
        } finally {
            loading = false;
            isSearching = false;
        }
    }

    function handleSearchInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        searchQuery = value;

        if (searchTimeout) clearTimeout(searchTimeout);

        if (value.trim() === '') {
            isSearching = false;
            //@ts-expect-error
            videos = data.initialVideos || [];
            offset = 20;
            endReached = false;
            return;
        }

        searchTimeout = setTimeout(() => {
            searchOffset = 0;
            searchEndReached = false;
            videos = [];
            isSearching = true;
            searchVideos(value.trim());
        }, 300);
    }

    function handleScroll() {
        const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
        if (bottom && !isSearching) loadMoreVideos();
    }

    onMount(() => {
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

    function formatDuration(seconds?: number): string {
        if (!seconds) return "0:00";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return hours > 0
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            : `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    function getResolutionBadges(resolutions?: string): string[] {
        return resolutions?.split(',').map(r => r.trim()) || [];
    }
</script>

<svelte:head>
    <title>Video Library — Vistora Dashboard</title>
    <meta name="description" content="Manage your uploaded videos, search, and organize media assets on Vistora." />
</svelte:head>

<div class="max-w-7xl mx-auto space-y-8 px-4 lg:px-0">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Video Library</h1>
            <p class="text-gray-600 mt-1">
                Manage your video content and media assets
                {#if data.totalVideos > 0}
                    • {data.totalVideos} video{data.totalVideos !== 1 ? 's' : ''} total
                {/if}
            </p>
        </div>
    </div>

    <!-- Search and Filters -->
    <div class="relative">
        <Input
            type="text"
            placeholder="Search videos..."
            class="w-full md:w-1/3 md:min-w-sm px-4 py-2"
            oninput={handleSearchInput}
            value={searchQuery}
        />
        {#if isSearching}
            <div class="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        {/if}
    </div>

    <!-- Videos Grid -->
    {#if videos.length === 0 && !loading}
        <!-- Empty State -->
        <div class="text-center py-16">
            <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Video class="w-12 h-12 text-gray-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No videos found' : 'No videos uploaded yet'}
            </h3>
            <p class="text-gray-600 mb-6 max-w-sm mx-auto">
                {searchQuery 
                    ? 'Try adjusting your search terms or browse all videos.' 
                    : 'Upload your first video to get started with your video library!'
                }
            </p>
            {#if !searchQuery}
                <Button 
                    onclick={() => goto("/dashboard/videos/upload")} 
                    class="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                    <Plus class="w-5 h-5" />
                    Upload Your First Video
                </Button>
            {/if}
        </div>
    {:else}
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each videos as video}
                <div class="group rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                    <!-- Video Thumbnail -->
                    <div role="presentation" class="relative aspect-video overflow-hidden bg-gray-100 cursor-pointer" 
                        onclick={(e) => {
                            e.stopPropagation();
                            if (video.courseId) {
                                goto(`/dashboard/courses/${video.courseId}`);
                            }
                        }}>
                        {#if video.thumbnailUrl}
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        {:else}
                            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Video class="w-12 h-12 text-gray-400" />
                            </div>
                        {/if}
                        
                        <!-- Play Button Overlay -->
                        <div class="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div class="bg-white rounded-full p-4 shadow-lg">
                                    <Play class="w-8 h-8 text-gray-700 fill-current" />
                                </div>
                            </div>
                        </div>

                        <!-- Duration Badge -->
                        {#if video.duration}
                            <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                {formatDuration(video.duration)}
                            </div>
                        {/if}

                        <!-- Resolution Badges -->
                        {#if video.resolutions}
                            <div class="absolute top-2 left-2 flex gap-1">
                                {#each getResolutionBadges(video.resolutions) as resolution}
                                    <Badge variant="secondary" class="text-xs bg-black bg-opacity-75 text-white border-none">
                                        {resolution}
                                    </Badge>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <!-- Video Info -->
                    <div class="p-6">
                        <div class="flex items-start justify-between gap-3 mb-3">
                            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {video.title}
                            </h3>
                        </div>

                        {#if video.description}
                            <p class="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                {video.description}
                            </p>
                        {/if}

                        <!-- Course and Module Info -->
                        <div class="space-y-2 mb-4">
                            {#if video.courseTitle}
                                <div class="flex items-center gap-2 text-sm text-gray-500">
                                    <BookOpen class="w-4 h-4" />
                                    <span class="truncate">{video.courseTitle}</span>
                                </div>
                            {/if}
                            {#if video.moduleTitle}
                                <div class="flex items-center gap-2 text-sm text-gray-500">
                                    <FolderOpen class="w-4 h-4" />
                                    <span class="truncate">{video.moduleTitle}</span>
                                </div>
                            {/if}
                        </div>

                        <!-- Footer -->
                        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar class="w-4 h-4" />
                                <span class="line-clamp-1">{formatDate(video.createdAt)}</span>
                            </div>
                            
                            <div class="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="gap-1"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        if (video.courseId) {
                                            goto(`/dashboard/courses/${video.courseId}`);
                                        }
                                    }}
                                >
                                    <Eye class="w-4 h-4" />
                                    <span class="text-xs">View</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="gap-1 text-red-600 hover:text-red-700"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        confirmDeleteVideo(video);
                                    }}
                                >
                                    <Trash class="w-4 h-4" />
                                    <span class="text-xs">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Alert Dialog -->
    {#if showDeleteDialog && videoToDelete}
        <AlertDialog open onOpenChange={(open) => (showDeleteDialog = open)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to delete "<b>{videoToDelete.title}</b>"?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        class="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                        onclick={deleteVideo}
                        disabled={deleteLoading}
                    >
                        {#if deleteLoading}
                            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                        {:else}
                            Delete
                        {/if}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    {/if}

    <!-- Load More for Search Results -->
    {#if isSearching && !searchEndReached && !loading && videos.length > 0}
        <div class="text-center py-6">
            <Button onclick={() => searchVideos(searchQuery, true)} variant="outline">
                Load More Results
            </Button>
        </div>
    {/if}

    <!-- Loading States -->
    {#if loading}
        <div class="text-center py-8">
            <div class="inline-flex items-center gap-2 text-gray-500">
                <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading videos...</span>
            </div>
        </div>
    {:else if (endReached || searchEndReached) && videos.length > 0}
        <div class="text-center py-8">
            <div class="inline-flex items-center gap-2 text-gray-400">
                <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>You've reached the end</span>
                <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    {/if}
</div>