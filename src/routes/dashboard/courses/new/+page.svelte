<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { ArrowLeft, BookOpen, Image as ImageIcon, Sparkles, Eye } from "lucide-svelte";

    let title = $state("");
    let description = $state("");
    let thumbnailUrl = $state("");
    let isSubmitting = $state(false);

    let fileInputRef: HTMLInputElement | null = null;

    let fileName = $state("");
    let thumbnailBase64 = $state("");
    let thumbnailError = $state("");

    // $inspect("thumbnailBase64", thumbnailBase64)

    let showPreview = $derived(
        thumbnailBase64 || (
            thumbnailUrl.startsWith("http://") ||
            thumbnailUrl.startsWith("https://")
        )
    );

    async function handleSubmit() {
        if (!title.trim()) {
            toast.error("Please enter a course title");
            return;
        }

        isSubmitting = true;
        
        try {
            console.log("Creating course with data svelte:", {
                title,
                description,
                thumbnailUrl,
            });
            
            const res = await fetch("/api/courses", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    title,
                    description,
                    thumbnailBase64: thumbnailBase64,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const result = await res.json();
                toast.success("Course created successfully!");
                goto(`/dashboard/courses/${result.id}`);
            } else {
                toast.error("Failed to create course");
            }
        } catch (error) {
            toast.error("An error occurred while creating the course");
        } finally {
            isSubmitting = false;
        }
    }

    function goBack() {
        goto("/dashboard/courses");
    }

    const fallbackImage = "https://placehold.co/640x360?text=Thumbnail+Preview";

    function openFilePicker() {
        if (fileInputRef) {
            fileInputRef.click();
        }
    }
    

    function handleFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        fileName = file.name;
        thumbnailUrl = ""; // Clear URL input if file is uploaded
        thumbnailError = "";

        const reader = new FileReader();
        reader.onload = () => {
            thumbnailBase64 = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    async function validateAndConvertImageUrl(url: string) {
        thumbnailError = "";
        thumbnailBase64 = "";

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            thumbnailError = "Please enter a valid image URL";
            return;
        }

        try {
            const res = await fetch(url);
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.startsWith("image/")) {
                thumbnailError = "The URL does not point to a valid image.";
                return;
            }

            const blob = await res.blob();
            const reader = new FileReader();
            reader.onload = () => {
                thumbnailBase64 = reader.result as string;
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            thumbnailError = "Failed to load image. Please check the URL.";
        }
    }

    $effect(() => {
        if (thumbnailUrl.trim()) {
            fileName = "";
            thumbnailBase64 = "";
            validateAndConvertImageUrl(thumbnailUrl.trim());
        }
    });
</script>

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 lg:px-0">
            <div class="flex items-center justify-between py-6">
                <div class="flex items-center gap-4">
                    <Button variant="ghost" onclick={goBack} class="gap-2">
                        <ArrowLeft class="w-4 h-4" />
                        Back to Courses
                    </Button>
                    <div class="h-6 w-px bg-gray-300"></div>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen class="w-4 h-4 text-blue-600" />
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900">Create New Course</h1>
                    </div>
                </div>
                
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Draft</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 lg:px-0 py-8">
        <div class="grid lg:grid-cols-2 gap-8">
            <!-- Left Column - Form -->
            <div class="space-y-6">
                <!-- Welcome Card -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Sparkles class="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900">Let's Create Something Amazing</h2>
                            <p class="text-sm text-blue-600">Share your knowledge with the world</p>
                        </div>
                    </div>
                    <p class="text-sm text-gray-700">
                        Start by giving your course a compelling title and description. Don't worry, you can always change these later.
                    </p>
                </div>

                <!-- Form Fields -->
                <div class="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
                    <div class="space-y-2">
                        <label for="" class="block text-sm font-semibold text-gray-900">
                            Course Title *
                        </label>
                        <Input 
                            bind:value={title} 
                            placeholder="e.g. Complete Web Development Bootcamp"
                            class="text-base"
                        />
                        <p class="text-xs text-gray-500">
                            Choose a clear, descriptive title that tells students what they'll learn
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label for="" class="block text-sm font-semibold text-gray-900">
                            Course Description
                        </label>
                        <Textarea 
                            bind:value={description} 
                            placeholder="Describe what students will learn, what skills they'll gain, and what makes your course unique..."
                            rows={4}
                            class="text-base resize-none"
                        />
                        <p class="text-xs text-gray-500">
                            Help students understand the value and outcomes of your course
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label for="" class="block text-sm font-semibold text-gray-900">
                            Thumbnail Image
                        </label>
                        <div class="flex gap-2">
                            <Input
                                bind:value={thumbnailUrl}
                                placeholder="https://example.com/your-course-image.jpg"/>
                            <Button variant="outline" size="sm" class="gap-2 flex-shrink-0" onclick={openFilePicker} type="button">
                                <ImageIcon class="w-4 h-4" />
                                Browse
                            </Button>
                            <input
                                type="file"
                                accept="image/*"
                                class="hidden"
                                bind:this={fileInputRef}
                                onchange={handleFileSelected}
                            />
                        </div>
                        {#if fileName}
                            <p class="text-xs text-gray-500 mt-1">Selected file: {fileName}</p>
                        {/if}
                        {#if thumbnailError}
                            <p class="text-xs text-red-500 mt-1">{thumbnailError}</p>
                        {:else}
                            <p class="text-xs text-gray-500 mt-1">
                                Recommended: 1280×720px • Use a high-quality image that represents your course
                            </p>
                        {/if}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <Button 
                        onclick={handleSubmit} 
                        disabled={isSubmitting || !title.trim()}
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                    >
                        {#if isSubmitting}
                            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating Course...
                        {:else}
                            <BookOpen class="w-5 h-5 mr-2" />
                            Create Course
                        {/if}
                    </Button>
                    <Button variant="outline" onclick={goBack} class="px-6 py-3">
                        Cancel
                    </Button>
                </div>
            </div>

            <!-- Right Column - Preview -->
            <div class="space-y-6">
                <div class="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div class="p-6 border-b">
                        <div class="flex items-center gap-2 mb-2">
                            <Eye class="w-4 h-4 text-gray-500" />
                            <h3 class="text-lg font-semibold text-gray-900">Preview</h3>
                        </div>
                        <p class="text-sm text-gray-600">See how your course will appear to students</p>
                    </div>

                    <!-- Course Card Preview -->
                    <div class="p-6">
                        <div class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <!-- Thumbnail -->
                            <div class="aspect-video bg-gray-100 relative overflow-hidden">
                                <img
                                    src={showPreview ? (thumbnailBase64 || thumbnailUrl) : fallbackImage}
                                    alt="Course Thumbnail Preview"
                                    class="w-full h-full object-cover"
                                />
                                {#if !showPreview}
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <div class="text-center">
                                            <ImageIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p class="text-sm text-gray-500">Add thumbnail URL to see preview</p>
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            <!-- Course Info -->
                            <div class="p-6">
                                <h4 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {title || "Your Course Title"}
                                </h4>
                                <p class="text-sm text-gray-600 line-clamp-3">
                                    {description || "Your course description will appear here. Students will read this to understand what they'll learn from your course."}
                                </p>
                                
                                <div class="flex items-center justify-between mt-4 pt-4 border-t">
                                    <div class="flex items-center gap-2">
                                        <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                                        <span class="text-sm font-medium text-gray-700">Your Name</span>
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        Draft
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tips Card -->
                <div class="bg-amber-50 rounded-2xl border border-amber-200 p-6">
                    <h3 class="text-lg font-semibold text-amber-900 mb-3">💡 Pro Tips</h3>
                    <ul class="space-y-2 text-sm text-amber-800">
                        <li class="flex items-start gap-2">
                            <div class="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Use action words in your title to make it more engaging</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <div class="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Include learning outcomes in your description</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <div class="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Choose a bright, high-contrast thumbnail image</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>