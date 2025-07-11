<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import type { PageProps } from "./$types";
    import { 
        Pen, 
        Video, 
        FileText, 
        Image as ImageIcon, 
        ArrowLeft, 
        Clock, 
        Users, 
        BookOpen, 
        Play,
        Eye,
        Calendar,
        Settings,
        Shapes,
        Trash,
        X,
        Pencil,
        Plus,

        GalleryThumbnails

    } from "lucide-svelte";
    import { formatDuration, formatTotalDuration } from "$lib/utils/formatTime";
    import { loadVideoFromFirstLesson } from "$lib/utils/loadFirstVideo";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";


    let { data }: PageProps = $props();
    let { course, modules } = data;

    let title = $state(course.title);
    let description = $state(course.description || "");
    let thumbnailUrl = $state(course.thumbnailUrl || "");
    let activeTab = $state("overview");

    const fallbackImage = "https://placehold.co/640x360?text=Thumbnail+Preview";
    const showPreview = $derived(
        thumbnailUrl.startsWith("http://") ||
            thumbnailUrl.startsWith("https://"),
    );

    async function handleUpdate() {
        const res = await fetch(`/api/courses/${course.id}`, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ title, description, thumbnailUrl }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            toast.success("Course updated");
            goto("/dashboard/courses");
        } else {
            toast.error("Failed to update course");
        }
    }

    function goBack() {
        goto("/dashboard/courses");
    }

    const materials = [
        { name: "Course Outline.pdf", icon: FileText, link: "#" },
        { name: "Design Mockup.png", icon: ImageIcon, link: "#" },
        { name: "Assets.zip", icon: FileText, link: "#" },
    ];

    const tabs = [
        { id: "overview", label: "Overview", icon: BookOpen },
        { id: "qa", label: "Q&A", icon: Users },
        { id: "notes", label: "Notes", icon: FileText },
        { id: "announcements", label: "Announcements", icon: Calendar },
        { id: "reviews", label: "Reviews", icon: Eye },
        { id: "tools", label: "Learning Tools", icon: Settings },
    ];

    const totalLessons = data.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    const totalSeconds = data.modules.reduce((sum, mod) => {
        return sum + mod.lessons.reduce((s, lesson) => s + (lesson.duration ?? 0), 0);
    }, 0);

    const totalDuration = formatTotalDuration(totalSeconds);

    let newModuleTitle = $state('');

    async function handleAddModule() {
        console.log("started")
        if (!newModuleTitle.trim()) return;

        const res = await fetch(`/api/courses/${course.id}/modules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newModuleTitle }),
        });

        if (res.ok) {
            const newModule = await res.json();

            // modules.push(newModule);
            // console.log("module", newModule)
            newModuleTitle = '';
            // Refresh the page data
		    await goto(location.pathname, { invalidateAll: true });
            toast.success('Module added');
        } else {
            toast.error('Failed to add module');
        }
    }

    let selectedFile: File | null = $state(null);
    let lessonTitle = $state('');
    let lessonDescription = $state('');
    let videoDuration = $state(0);

	async function handleLessonUpload(moduleId: string) {
        if (!selectedFile || !lessonTitle) return;

        const toastId = toast.loading("Uploading lesson...", { duration: Infinity });

        const dialogElement = document.querySelector(`#lesson-dialog-${moduleId}`) as HTMLElement;
        if (dialogElement) dialogElement.click();

        try {
            const res = await fetch(`/api/modules/${moduleId}/lessons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: lessonTitle,
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size,
                }),
            });

            if (!res.ok) throw new Error("Failed to initiate upload");

            const { fileId, uploadId, partSize, partUrls, title } = await res.json();

            let uploadedBytes = 0;
            const totalSize = selectedFile.size;

            for (const part of partUrls) {
                const start = (part.partNumber - 1) * partSize;
                const end = Math.min(start + partSize, selectedFile.size);
                const chunk = selectedFile.slice(start, end);

                const upload = await fetch(part.url, {
                    method: "PUT",
                    body: chunk,
                    headers: {
                        "Content-Type": selectedFile.type || "application/octet-stream",
                    },
                });

                if (!upload.ok) throw new Error(`Failed to upload part ${part.partNumber}`);

                part.etag = upload.headers.get("ETag")?.replaceAll('"', "") ?? "";

                // Update uploaded bytes and progress
                uploadedBytes += chunk.size;
                const progress = Math.floor((uploadedBytes / totalSize) * 100);
                toast.message("Uploading lesson...", {
                    id: toastId,
                    description: `Progress: ${progress}%`,
                });
            }

            await fetch(`/api/modules/${moduleId}/lessons/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileId,
                    uploadId,
                    parts: partUrls.map((p: { partNumber: any; etag: any }) => ({
                        partNumber: p.partNumber,
                        etag: p.etag,
                    })),
                    title,
                    duration: videoDuration,
                    description: lessonDescription,
                }),
            });

            toast.success("Lesson uploaded successfully", { id: toastId });
            selectedFile = null;
            lessonTitle = "";
            lessonDescription = "";

            // Refresh page data
            await goto(location.pathname, { invalidateAll: true });
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload lesson", { id: toastId });
        }
    }



    let selectedVideoUrl: string | null = $state(null);
    let loadingFileId:  string | null = $state(null);

    // play pause
    let currentPlayingVideoId: string | null = $state(null);
    let videoElement: HTMLVideoElement | null = $state(null);
    let videoPaused: boolean = $state(false);

    // Enhanced handleLessonClick function
    async function handleLessonClick(fileId: string) {
        loadingFileId = fileId;
        selectedVideoUrl = null;
        currentPlayingVideoId = null;
        videoPaused = false;
        
        try {
            const res = await fetch(`/api/videos/${fileId}/download-url`);
            const { url } = await res.json();
            selectedVideoUrl = url;
            currentPlayingVideoId = fileId;
            
            // Wait for video element to be available and play
            setTimeout(() => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video) {
                    videoElement = video;
                    setupVideoListeners();
                    video.play();
                    videoPaused = false;
                }
            }, 100);
        } catch (error) {
            toast.error('Failed to load video');
            console.error('Error loading video:', error);
        } finally {
            loadingFileId = null;
        }
    }

    // Pause video function
    function handlePauseVideo() {
        if (videoElement) {
            videoElement.pause();
            videoPaused = true;
        }
    }

    // Resume video function
    function handleResumeVideo() {
        if (videoElement) {
            videoElement.play();
            videoPaused = false;
        }
    }

    // Setup video event listeners to sync state
    function setupVideoListeners() {
        if (videoElement) {
            // Remove existing listeners to avoid duplicates
            videoElement.removeEventListener('pause', handleVideoPause);
            videoElement.removeEventListener('play', handleVideoPlay);
            videoElement.removeEventListener('ended', handleVideoEnd);
            
            // Add new listeners
            videoElement.addEventListener('pause', handleVideoPause);
            videoElement.addEventListener('play', handleVideoPlay);
            videoElement.addEventListener('ended', handleVideoEnd);
            videoElement.addEventListener('loadstart', handleVideoLoadStart);
            videoElement.addEventListener('canplay', handleVideoCanPlay);
        }
    }

    // Event handler functions
    function handleVideoPause() {
        videoPaused = true;
    }

    function handleVideoPlay() {
        videoPaused = false;
    }

    function handleVideoEnd() {
        currentPlayingVideoId = null;
        videoPaused = false;
        videoElement = null;
    }

    function handleVideoLoadStart() {
        videoPaused = false;
    }

    function handleVideoCanPlay() {
        videoPaused = false;
    }

    let isDeleting = $state(false);

    async function handleDeleteCourse() {
        isDeleting = true;
        try {
            const res = await fetch(`/api/courses/${course.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                toast.success("Course deleted successfully");
                goto("/dashboard/courses");
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to delete course");
            }
        } catch (error) {
            toast.error("Unexpected error while deleting");
            console.error("Delete error:", error);
        } finally {
            isDeleting = false;
        }
    }

    let editModules: Record<string, boolean> = $state({});
    let selectedFileIds: Record<string, Set<string>> = $state({});

    async function handleBulkDelete(moduleId: string) {
        const idsToDelete = Array.from(selectedFileIds[moduleId] ?? []);
        if (idsToDelete.length === 0) return;

        try {
            const toastId = toast.loading('Deleting selected lessons...', { duration: Infinity });

            await fetch(`/api/modules/${moduleId}/lessons/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileIds: idsToDelete }),
            });

            toast.success('Lessons deleted', { id: toastId });
            selectedFileIds[moduleId] = new Set();
            await goto(location.pathname, { invalidateAll: true });
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete selected lessons');
        }
    }


    async function handleDeleteModule(moduleId: string) {
        if (!moduleId) return;

        try {
            const toastId = toast.loading("Deleting module...", { duration: Infinity });
            const res = await fetch(`/api/modules/${moduleId}`, { 
                method: "DELETE" 
            });

            if (!res.ok) throw new Error("Failed");

            toast.success("Module deleted", { id: toastId });
            await goto(location.pathname, { invalidateAll: true });
        } catch (err) {
            console.error("Module delete error:", err);
            toast.error("Failed to delete module");
        }
    }

</script>

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 lg:px-0">
            <div class="flex items-center justify-between py-4">
                <div class="flex items-center gap-4">
                    <Button variant="ghost" onclick={goBack} class="gap-2">
                        <ArrowLeft class="w-4 h-4" />
                        Back to Courses
                    </Button>
                    <div class="h-6 w-px bg-gray-300"></div>
                    <h1 class="text-xl font-semibold text-gray-900 truncate">
                        {course.title}
                    </h1>
                </div>
                
                <div class="flex items-center gap-3">
                   <!-- Course Management Dropdown -->
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button variant="outline" size="sm" class="gap-2">
                                <Settings class="w-4 h-4" />
                                Manage Course
                            </Button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content align="end" class="w-[220px]">
                            <DropdownMenu.Group>
                                <DropdownMenu.Label>Course Options</DropdownMenu.Label>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item onclick={() => goto(`/dashboard/courses/${course.id}/thumbnails`)}>
                                    <GalleryThumbnails class="w-4 h-4"/>
                                    Thumbnails
                                </DropdownMenu.Item>

                                <DropdownMenu.Item
                                    onclick={() => {
                                        document.getElementById('add-module-trigger')?.click();
                                    }}
                                >
                                    <Shapes class="w-4 h-4" />
                                    Add Module
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() => {
                                        document.getElementById('edit-course-trigger')?.click();
                                    }}
                                >
                                    <Pen class="w-4 h-4" />
                                    Edit Course
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() => {
                                        document.getElementById('delete-course-trigger')?.click();
                                    }}
                                >
                                    <Trash class="w-4 h-4"/>
                                    Delete Course
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <!-- Hidden Dialog Triggers and Dialog Content -->
                    <!-- Add Module -->
                    <Dialog.Root>
                        <Dialog.Trigger id="add-module-trigger" style="display: none" />
                        <Dialog.Content class="sm:max-w-[425px]">
                            <Dialog.Header>
                                <Dialog.Title>Add Module</Dialog.Title>
                                <Dialog.Description>
                                    Add new module to your course. Click save when you're done.
                                </Dialog.Description>
                            </Dialog.Header>
                            <div>
                                <Input bind:value={newModuleTitle} placeholder="Module title (e.g. Introduction)" />
                            </div>
                            <Dialog.Footer>
                                <Dialog.Close>
                                    <Button class="w-full" type="submit" onclick={handleAddModule}>
                                        Add Module
                                    </Button>
                                </Dialog.Close>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Root>

                    <!-- Delete Course -->
                    <AlertDialog.Root>
                        <AlertDialog.Trigger id="delete-course-trigger" style="display: none" />
                        <AlertDialog.Content>
                            <AlertDialog.Header>
                                <AlertDialog.Title>Delete Course</AlertDialog.Title>
                                <AlertDialog.Description>
                                    This action will permanently delete this course, its modules, lessons, and the associated data.
                                    <br />
                                    Are you sure you want to proceed?
                                </AlertDialog.Description>
                            </AlertDialog.Header>
                            <AlertDialog.Footer>
                                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                <AlertDialog.Action
                                    class={buttonVariants({ variant: "destructive" })}
                                    onclick={handleDeleteCourse}
                                    disabled={isDeleting}
                                >
                                    {#if isDeleting}
                                        <span class="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    {/if}
                                    Confirm Delete
                                </AlertDialog.Action>
                            </AlertDialog.Footer>
                        </AlertDialog.Content>
                    </AlertDialog.Root>

                    <!-- Edit Course -->
                    <Dialog.Root>
                        <Dialog.Trigger id="edit-course-trigger" style="display: none" />
                        <Dialog.Content class="sm:max-w-[800px] w-full h-[80%] overflow-auto">
                            <Dialog.Header>
                                <Dialog.Title>Edit Course Details</Dialog.Title>
                            </Dialog.Header>
                            <div class="space-y-6">
                                <div class="space-y-2">
                                    <label for="" class="text-sm font-medium text-gray-700">Course Title</label>
                                    <Input bind:value={title} placeholder="Enter course title" />
                                </div>
                                <div class="space-y-2">
                                    <label for="" class="text-sm font-medium text-gray-700">Course Description</label>
                                    <Textarea bind:value={description} rows={4} placeholder="Describe your course..." />
                                </div>
                                <div class="space-y-2">
                                    <label for="" class="text-sm font-medium text-gray-700">
                                        Thumbnail URL <span class="text-xs text-gray-500 font-normal">Recommended: 1280×720px</span>
                                    </label>
                                    <Input bind:value={thumbnailUrl} placeholder="https://example.com/image.jpg" />
                                </div>
                                <div class="space-y-2">
                                    <label for="" class="text-sm font-medium text-gray-700">Preview</label>
                                    <div class="aspect-video w-full rounded-lg border overflow-hidden bg-gray-100">
                                        <img
                                            src={showPreview ? thumbnailUrl : fallbackImage}
                                            alt="Thumbnail Preview"
                                            class="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <Dialog.Footer class="w-full">
                                    <Button type="submit" class="w-full" onclick={handleUpdate}>
                                        Save Changes
                                    </Button>
                                </Dialog.Footer>
                            </div>
                        </Dialog.Content>
                    </Dialog.Root>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 lg:px-0 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Left Section - Will shrink as screen size reduces -->
            <div class="lg:flex-1 lg:min-w-0 space-y-8">
                <!-- Video/Thumbnail Section -->
                <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div class="aspect-video bg-gray-900 relative group">
                        {#if selectedVideoUrl}
                            <video
                                controls
                                autoplay
                                bind:this={videoElement}
                                onpause={handleVideoPause}
                                onplay={handleVideoPlay}
                                onended={handleVideoEnd}
                                onloadstart={handleVideoLoadStart}
                                oncanplay={handleVideoCanPlay}
                                class="w-full h-full object-cover"
                            >
                                <source src={selectedVideoUrl} type="video/mp4" />
                                <track kind="captions" label="English captions" src="" srclang="en" default />
                                Your browser does not support the video tag.
                            </video>
                        {:else}
                            <img
                                src={showPreview ? course.thumbnailUrl : fallbackImage}
                                alt="Course Thumbnail"
                                class="w-full h-full object-cover"
                            />
                            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                                {#if loadingFileId}
                                    <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                {:else}
                                    <button
                                            onclick={() =>
                                                loadVideoFromFirstLesson(
                                                    data.modules,
                                                    (url) => selectedVideoUrl = url,
                                                    (id) => loadingFileId = id,
                                                    (id) => currentPlayingVideoId = id
                                                )
                                            }
                                        class="bg-white hover:bg-gray-100 rounded-full p-6 shadow-xl transition-all transform hover:scale-105">
                                        <Play class="w-8 h-8 text-gray-900 ml-1" />
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    <!-- Course Stats -->
                    <div class="p-6 border-b">
                        <div class="flex flex-wrap gap-6 text-sm text-gray-600">
                            <div class="flex items-center gap-2">
                                <Clock class="w-4 h-4" />
                                <span>{totalDuration}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <BookOpen class="w-4 h-4" />
                                <span>{totalLessons} lessons</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <Users class="w-4 h-4" />
                                <span>0 students</span>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation Tabs -->
                    <div class="flex overflow-x-auto border-b">
                        {#each tabs as tab}
                            <button
                                class="flex-shrink-0 flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 {activeTab === tab.id 
                                    ? 'text-blue-600 border-blue-600' 
                                    : 'text-gray-600 border-transparent hover:text-gray-900'}"
                                onclick={() => activeTab = tab.id}
                            >
                                <tab.icon class="w-4 h-4" />
                                {tab.label}
                            </button>
                        {/each}
                    </div>

                    <!-- Tab Content -->
                    <div class="p-6">
                        {#if activeTab === "overview"}
                            <div class="prose max-w-none">
                                <h3 class="text-lg font-semibold mb-4">About This Course</h3>
                                <div class="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {course.description || "No description provided for this course yet. Add a description to help students understand what they'll learn."}
                                </div>
                            </div>
                        {:else}
                            <div class="text-center py-12">
                                <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen class="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                                <p class="text-gray-600">This section will be available once you publish your course.</p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Right Sidebar - Fixed minimum width -->
            <div class="lg:w-1/3 lg:min-w-[380px] lg:max-w-[420px]">
                <div class="bg-white rounded-2xl shadow-sm sticky top-24">
                    <div class="p-6 border-b">
                        <h2 class="text-xl font-semibold text-gray-900 mb-2">Course Content</h2>
                        <p class="text-sm text-gray-600">{data.modules.length} modules • {totalLessons} lessons • {totalDuration}</p>
                    </div>

                    <div class="max-h-[500px] overflow-y-auto">
                       <Accordion.Root type="multiple" class="w-full">
                            {#each data.modules as mod, i}
                                <Accordion.Item value={`module-${i}`} class="border-b last:border-b-0">
                                    <Accordion.Trigger class="px-6 py-4 hover:bg-gray-50 text-left w-full">
                                        <div class="flex items-center justify-between w-full">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <BookOpen class="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p class="font-medium text-gray-900">{mod.title}</p>
                                                    <p class="text-sm text-gray-500">{mod.lessons.length} lessons</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion.Trigger>
                                    <Accordion.Content class="px-6 pb-4 bg-gray-50 ">
                                        <div class="space-y-3">
                                            <div class="flex gap-2 justify-end mb-4 pt-2">
                                                <!-- Edit Lessons -->
                                                {#if mod.lessons.length > 0}
                                                    <Button
                                                        variant="secondary"
                                                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors {editModules[mod.id] 
                                                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300' 
                                                            : 'bg-white hover:bg-white'}"
                                                        onclick={() => {
                                                            editModules[mod.id] = !editModules[mod.id];
                                                            if (!editModules[mod.id]) selectedFileIds[mod.id] = new Set();
                                                        }}
                                                    >
                                                        {#if editModules[mod.id]}
                                                            <X class="w-4 h-4"/>
                                                            Cancel
                                                        {:else}
                                                            <Pencil class="w-4 h-4"/>
                                                            Edit
                                                        {/if}
                                                    </Button>
                                                {/if}
                                                <!-- Add Lesson Button -->
                                                <Dialog.Root>
                                                    <Dialog.Trigger class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 hover:border-blue-300">
                                                        <Plus class="w-4 h-4"/>
                                                        Add Lesson
                                                    </Dialog.Trigger>

                                                    <Dialog.Content class="sm:max-w-[500px]">
                                                        <Dialog.Header>
                                                            <Dialog.Title class="text-xl font-semibold text-gray-900">Add New Lesson</Dialog.Title>
                                                            <Dialog.Description class="text-gray-600">
                                                                Upload a video lesson to this module. Supported formats: MP4, MOV, AVI
                                                            </Dialog.Description>
                                                        </Dialog.Header>

                                                        <div class="space-y-6 py-4">
                                                            <!-- File Upload Area -->
                                                            <div class="space-y-2">
                                                                <label for="" class="block text-sm font-medium text-gray-700">Video File</label>
                                                                <div class="relative">
                                                                    <input
                                                                        type="file"
                                                                        accept="video/*"
                                                                        class="hidden"
                                                                        id="video-upload-{mod.id}"
                                                                        onchange={(e) => {
                                                                            const target = e.target as HTMLInputElement | null;
                                                                            selectedFile = target && target.files ? target.files[0] : null;
                                                                            if (selectedFile) {
                                                                                const video = document.createElement('video');
                                                                                video.preload = 'metadata';

                                                                                video.onloadedmetadata = () => {
                                                                                    window.URL.revokeObjectURL(video.src);
                                                                                    videoDuration = Math.round(video.duration);
                                                                                    console.log('Duration (sec):', videoDuration);
                                                                                };

                                                                                video.src = URL.createObjectURL(selectedFile);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label
                                                                        for="video-upload-{mod.id}"
                                                                        class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                                                            {#if selectedFile}
                                                                                <div class="flex items-center gap-3 text-green-600">
                                                                                    <Video class="w-8 h-8" />
                                                                                    <div class="text-left">
                                                                                        <p class="text-sm font-medium">{selectedFile.name}</p>
                                                                                        <p class="text-xs text-gray-500">
                                                                                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                                                                                            {#if videoDuration > 0}
                                                                                                • {formatDuration(videoDuration)}
                                                                                            {/if}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            {:else}
                                                                                <svg class="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                                </svg>
                                                                                <p class="mb-2 text-sm text-gray-500">
                                                                                    <span class="font-semibold">Click to upload</span> or drag and drop
                                                                                </p>
                                                                                <p class="text-xs text-gray-500">MP4, MOV, AVI (MAX. 500MB)</p>
                                                                            {/if}
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <!-- Lesson Title -->
                                                            <div class="space-y-2">
                                                                <label for="" class="block text-sm font-medium text-gray-700">Lesson Title</label>
                                                                <Input
                                                                    bind:value={lessonTitle}
                                                                    placeholder="Enter lesson title..."
                                                                    class="w-full"
                                                                />
                                                            </div>

                                                            <!-- Lesson Description -->
                                                            <div class="space-y-2">
                                                                <label for="" class="block text-sm font-medium text-gray-700">
                                                                    Description
                                                                    <span class="text-gray-500 font-normal">(Optional)</span>
                                                                </label>
                                                                <Textarea
                                                                    bind:value={lessonDescription}
                                                                    placeholder="Describe what students will learn in this lesson..."
                                                                    rows={3}
                                                                    class="w-full resize-none"
                                                                />
                                                            </div>

                                                            <!-- Video Info Display -->
                                                            {#if selectedFile && videoDuration > 0}
                                                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                                    <div class="flex items-center gap-3">
                                                                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                            <Video class="w-5 h-5 text-blue-600" />
                                                                        </div>
                                                                        <div>
                                                                            <p class="text-sm font-medium text-blue-900">Video Ready</p>
                                                                            <p class="text-xs text-blue-700">
                                                                                Duration: {formatDuration(videoDuration)} • Size: {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            {/if}
                                                        </div>

                                                        <Dialog.Footer class="flex gap-3 pt-6">
                                                            <Dialog.Close>
                                                                <Button variant="outline" class="flex-1" id={`lesson-dialog-${mod.id}`}>
                                                                    Cancel
                                                                </Button>
                                                            </Dialog.Close>
                                                            <Button
                                                                onclick={() => handleLessonUpload(mod.id)}
                                                                disabled={!selectedFile || !lessonTitle.trim()}
                                                                class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Upload Lesson
                                                            </Button>
                                                        </Dialog.Footer>
                                                    </Dialog.Content>
                                                </Dialog.Root>
                                            </div>

                                            {#if editModules[mod.id] && mod.lessons.length > 0}
                                                <div class=" mb-4">
                                                    <div class="flex flex-col gap-3 items-start">
                                                        <label class="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                                onchange={(e) => {
                                                                    const checked = e.currentTarget.checked;
                                                                    selectedFileIds[mod.id] = new Set(
                                                                        checked ? mod.lessons.map(l => l.fileId).filter((id) => id !== null) : []
                                                                    );
                                                                }}
                                                                checked={
                                                                    selectedFileIds[mod.id]?.size === mod.lessons.length &&
                                                                    mod.lessons.length > 0
                                                                }
                                                            />
                                                            <span class="select-none">Select all lessons</span>
                                                        </label>

                                                        {#if selectedFileIds[mod.id]?.size > 0}
                                                            <AlertDialog.Root>
                                                                <AlertDialog.Trigger>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        class="ml-[25px] px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-lg transition-colors"
                                                                    >
                                                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Delete selected ({selectedFileIds[mod.id].size})
                                                                    </Button>
                                                                </AlertDialog.Trigger>

                                                                <AlertDialog.Content>
                                                                    <AlertDialog.Header>
                                                                        <AlertDialog.Title>Confirm Delete</AlertDialog.Title>
                                                                        <AlertDialog.Description>
                                                                            Are you sure you want to delete the {selectedFileIds[mod.id].size} selected lesson{selectedFileIds[mod.id].size > 1 ? 's' : ''}?
                                                                            This action cannot be undone.
                                                                        </AlertDialog.Description>
                                                                    </AlertDialog.Header>

                                                                    <AlertDialog.Footer>
                                                                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                                                        <AlertDialog.Action class={buttonVariants({ variant: "destructive"})}  onclick={() => handleBulkDelete(mod.id)}>
                                                                            Confirm Delete
                                                                        </AlertDialog.Action>
                                                                    </AlertDialog.Footer>
                                                                </AlertDialog.Content>
                                                            </AlertDialog.Root>
                                                        {/if}
                                                    </div>
                                                </div>
                                            {/if}

                                            <!-- Lessons List -->
                                            <div class="space-y-2">
                                                {#each mod.lessons as lesson, lessonIndex}
                                                    {@const isCurrentVideo = selectedVideoUrl && currentPlayingVideoId === lesson.fileId}
                                                    {@const isLoadingThis = loadingFileId === lesson.fileId}
                                                    {@const isPaused = isCurrentVideo && videoPaused}
                                                    <div class="flex items-center">
                                                        {#if editModules[mod.id]}
                                                            <div class="mr-3 flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                                    checked={lesson.fileId !== null && selectedFileIds[mod.id]?.has(lesson.fileId)}
                                                                    onchange={(e) => {
                                                                        const checked = e.currentTarget.checked;
                                                                        const prevSet = selectedFileIds[mod.id] ?? new Set();
                                                                        const nextSet = new Set(prevSet); // create new Set to trigger reactivity
                                                                        if (lesson.fileId !== null) {
                                                                            checked ? nextSet.add(lesson.fileId) : nextSet.delete(lesson.fileId);
                                                                            selectedFileIds[mod.id] = nextSet;
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        {/if}

                                                        <div
                                                            role="presentation"
                                                            class="group flex items-center justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer w-full {isCurrentVideo 
                                                                ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                                                                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'}"

                                                        >
                                                            <div class="flex items-center gap-4">
                                                                <!-- Lesson Number & Icon -->
                                                                <div class="flex items-center gap-3">
                                                                    <div class="w-10 h-10 rounded-full flex items-center justify-center {isCurrentVideo 
                                                                        ? 'bg-blue-200' 
                                                                        : 'bg-blue-100'}">
                                                                        {#if isLoadingThis}
                                                                            <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                                                        {:else if isCurrentVideo}
                                                                            <div class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                                                {#if isPaused}
                                                                                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                                        <path d="M8 5v14l11-7z"/>
                                                                                    </svg>
                                                                                {:else}
                                                                                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                                                {/if}
                                                                            </div>
                                                                        {:else}
                                                                            <Video class="w-5 h-5 text-blue-600" />
                                                                        {/if}
                                                                    </div>
                                                                </div>

                                                                <!-- Lesson Info -->
                                                                <Tooltip.Provider>
                                                                    <Tooltip.Root>
                                                                        <Tooltip.Trigger>
                                                                            <div class="flex-1 text-left">
                                                                                <h4 class="font-medium transition-colors line-clamp-1 {isCurrentVideo 
                                                                                    ? 'text-blue-900' 
                                                                                    : 'text-gray-900 group-hover:text-blue-600'}">
                                                                                    {lesson.title}
                                                                                </h4>
                                                                                {#if lesson.description}
                                                                                    <p class="text-sm mt-1 line-clamp-1 {isCurrentVideo 
                                                                                        ? 'text-blue-700' 
                                                                                        : 'text-gray-500'}">
                                                                                        {lesson.description}
                                                                                    </p>
                                                                                {/if}
                                                                            </div>
                                                                        </Tooltip.Trigger>
                                                                        <Tooltip.Content class="max-w-[300px]">
                                                                            <p><strong>Title:</strong> {lesson.title}</p>
                                                                            <p><strong>Description:</strong> {lesson.description}</p>
                                                                        </Tooltip.Content>
                                                                    </Tooltip.Root>
                                                                </Tooltip.Provider>
                                                            </div>

                                                            <!-- Duration & Actions -->
                                                            <div class="flex items-center gap-3">
                                                                <div class="flex items-center gap-2 text-sm {isCurrentVideo 
                                                                    ? 'text-blue-600' 
                                                                    : 'text-gray-500'}">
                                                                    <Clock class="w-4 h-4" />
                                                                    <span class="font-medium">{formatDuration(lesson.duration ?? 0)}</span>
                                                                </div>
                                                                
                                                                <!-- Play/Pause/Resume Controls -->
                                                                <div class="flex items-center gap-2">
                                                                    {#if isCurrentVideo}
                                                                        {#if isPaused}
                                                                            <!-- Resume Button -->
                                                                            <button
                                                                                aria-label="Resume"
                                                                                onclick={() => handleResumeVideo()}
                                                                                class="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                                                                                title="Resume"
                                                                            >
                                                                                <svg class="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M8 5v14l11-7z"/>
                                                                                </svg>
                                                                            </button>
                                                                        {:else}
                                                                            <!-- Pause Button -->
                                                                            <button
                                                                                aria-label="Pause"
                                                                                onclick={() => handlePauseVideo()}
                                                                                class="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                                                                                title="Pause"
                                                                            >
                                                                                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                                                                </svg>
                                                                            </button>
                                                                        {/if}
                                                                    {:else}
                                                                        <!-- Play Button -->
                                                                        <button
                                                                            onclick={() => handleLessonClick(lesson.fileId ?? '')}
                                                                            class="w-8 h-8 rounded-full flex items-center justify-center transition-all {isLoadingThis 
                                                                                ? 'bg-gray-200 cursor-not-allowed' 
                                                                                : 'bg-gray-100 hover:bg-blue-100 group-hover:bg-blue-100'}"
                                                                            disabled={isLoadingThis}
                                                                            title="Play"
                                                                        >
                                                                            {#if isLoadingThis}
                                                                                <div class="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                                                                            {:else}
                                                                                <Play class="w-4 h-4 text-gray-600 group-hover:text-blue-600 ml-0.5" />
                                                                            {/if}
                                                                        </button>
                                                                    {/if}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/each}

                                                {#if editModules[mod.id] && mod.lessons.length > 0}
                                                    <!-- Delete Module -->
                                                    <AlertDialog.Root>
                                                        <AlertDialog.Trigger class={buttonVariants({ variant: "destructive", className:"w-full mt-2" })}>
                                                                <Trash class="w-4 h-4" />
                                                                Delete Module
                                                        </AlertDialog.Trigger>
                                                    
                                                        <AlertDialog.Content>
                                                            <AlertDialog.Header>
                                                                <AlertDialog.Title>Delete Module</AlertDialog.Title>
                                                                <AlertDialog.Description>
                                                                    This will permanently delete this module and all its associated lessons and video files.
                                                                    Are you sure you want to proceed?
                                                                </AlertDialog.Description>
                                                            </AlertDialog.Header>
                                                    
                                                            <AlertDialog.Footer>
                                                                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                                                <AlertDialog.Action
                                                                    class={buttonVariants({ variant: "destructive" })}
                                                                    onclick={() => handleDeleteModule(mod.id)}
                                                                >
                                                                    Delete Module
                                                                </AlertDialog.Action>
                                                            </AlertDialog.Footer>
                                                        </AlertDialog.Content>
                                                    </AlertDialog.Root>
                                                {/if}
                                                <!-- Empty State -->
                                                {#if mod.lessons.length === 0}
                                                    <div class="text-center py-8">
                                                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Video class="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        <p class="text-sm text-gray-500 mb-2">No lessons yet</p>
                                                        <p class="text-xs text-gray-400">Add your first lesson to get started</p>
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            {/each}
                        </Accordion.Root>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>