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
        Download,
        Eye,
        Calendar,
        Settings
    } from "lucide-svelte";

    let { data }: PageProps = $props();
    let { course } = data;

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

    const modules = [
        {
            title: "Module 1: Getting Started",
            lessons: [
                { title: "Course Overview", duration: "4:20" },
                { title: "Environment Setup", duration: "6:15" },
                { title: "Hello World", duration: "3:10" },
            ],
        },
        {
            title: "Module 2: Components",
            lessons: [
                { title: "Component Structure", duration: "5:45" },
                { title: "Props & State", duration: "7:00" },
                { title: "Lifecycle", duration: "6:30" },
            ],
        },
    ];

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

    const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    const totalDuration = "2h 31m"; // This would be calculated from actual lesson durations
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
                    <Button variant="outline" size="sm" class="gap-2">
                        <Eye class="w-4 h-4" />
                        Preview
                    </Button>
                    <Dialog.Root>
                        <Dialog.Trigger class={buttonVariants({ variant: "default", size: "sm" })}>
                            <Pen class="w-4 h-4 mr-2" />
                            Edit Course
                        </Dialog.Trigger>

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
                                        Thumbnail URL
                                        <span class="text-xs text-gray-500 font-normal">Recommended: 1280×720px</span>
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

                                <Button class="w-full" onclick={handleUpdate}>
                                    Save Changes
                                </Button>
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
            <!-- Left Section -->
            <div class="lg:w-2/3 space-y-8">
                <!-- Video/Thumbnail Section -->
                <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div class="aspect-video bg-gray-900 relative group">
                        <img
                            src={showPreview ? course.thumbnailUrl : fallbackImage}
                            alt="Course Thumbnail"
                            class="w-full h-full object-cover"
                        />
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <button class="bg-white hover:bg-gray-100 rounded-full p-6 shadow-xl transition-all transform hover:scale-105">
                                <Play class="w-8 h-8 text-gray-900 ml-1" />
                            </button>
                        </div>
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

            <!-- Right Sidebar -->
            <div class="lg:w-1/3">
                <div class="bg-white rounded-2xl shadow-sm sticky top-24">
                    <div class="p-6 border-b">
                        <h2 class="text-xl font-semibold text-gray-900 mb-2">Course Content</h2>
                        <p class="text-sm text-gray-600">{modules.length} modules • {totalLessons} lessons • {totalDuration}</p>
                    </div>

                    <div class="max-h-[500px] overflow-y-auto">
                        <Accordion.Root type="multiple" class="w-full">
                            {#each modules as mod, i}
                                <Accordion.Item value={`module-${i}`} class="border-b last:border-b-0">
                                    <Accordion.Trigger class="px-6 py-4 hover:bg-gray-50 text-left w-full">
                                        <div class="flex items-center justify-between w-full">
                                            <div>
                                                <p class="font-medium text-gray-900">{mod.title}</p>
                                                <p class="text-sm text-gray-500">{mod.lessons.length} lessons</p>
                                            </div>
                                        </div>
                                    </Accordion.Trigger>
                                    <Accordion.Content class="px-6 pb-4">
                                        <div class="space-y-2">
                                            {#each mod.lessons as lesson}
                                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <div class="flex items-center gap-3">
                                                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <Video class="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <span class="text-sm font-medium text-gray-900">{lesson.title}</span>
                                                    </div>
                                                    <span class="text-xs text-gray-500 font-medium">{lesson.duration}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            {/each}

                            <Accordion.Item value="materials" class="border-b-0">
                                <Accordion.Trigger class="px-6 py-4 hover:bg-gray-50 text-left w-full">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <FileText class="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-900">Course Materials</p>
                                            <p class="text-sm text-gray-500">{materials.length} files</p>
                                        </div>
                                    </div>
                                </Accordion.Trigger>
                                <Accordion.Content class="px-6 pb-4">
                                    <div class="space-y-2">
                                        {#each materials as material}
                                            <a
                                                href={material.link}
                                                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                            >
                                                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <material.icon class="w-4 h-4 text-gray-600" />
                                                </div>
                                                <span class="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                                    {material.name}
                                                </span>
                                                <Download class="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        {/each}
                                    </div>
                                </Accordion.Content>
                            </Accordion.Item>
                        </Accordion.Root>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>