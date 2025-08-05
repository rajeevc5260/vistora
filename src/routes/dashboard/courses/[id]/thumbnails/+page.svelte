<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { ArrowLeft, Image as ImageIcon, ImageUp, Settings, Star, Trash } from 'lucide-svelte';
	import type { PageProps } from './$types';
    import Input from '$lib/components/ui/input/input.svelte';
    import * as Dialog from '$lib/components/ui/dialog';
    import * as AlertDialog from '$lib/components/ui/alert-dialog';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { toast } from 'svelte-sonner';

	let { data }: PageProps = $props();
	let { course } = data;

	let thumbnails = $state<{ id:string, name: string; url: string }[]>([]);
	let loading = $state(true);
	let endReached = $state(false);
	let offset = $state(0);
	const limit = 20;

	let searchQuery = $state('');
	let searchTimeout: NodeJS.Timeout | null = null;
	let isSearching = $state(false);

	async function loadThumbnails(append = false) {
		try {
			loading = true;
			const url = new URL(`/api/courses/${course.id}/thumbnails`, location.origin);
			url.searchParams.set('offset', offset.toString());
			url.searchParams.set('limit', limit.toString());
			if (searchQuery.trim()) {
				url.searchParams.set('query', searchQuery.trim());
			}

			const res = await fetch(url.toString());
			const json = await res.json();

			if (append) {
				thumbnails = [...thumbnails, ...json.thumbnails];
			} else {
				thumbnails = json.thumbnails;
			}

			if (json.thumbnails.length < limit) endReached = true;
			else offset += limit;
		} catch (err) {
			console.error('Failed to load thumbnails:', err);
		} finally {
			loading = false;
		}
	}

	function handleSearchInput(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		searchQuery = value;
		endReached = false;
		offset = 0;

		if (searchTimeout) clearTimeout(searchTimeout);

		if (value.trim() === '') {
			isSearching = false;
			loadThumbnails();
		} else {
			isSearching = true;
			searchTimeout = setTimeout(() => {
				loadThumbnails();
			}, 300);
		}
	}

    function handleScroll() {
        const nearBottom =
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

        if (nearBottom && !loading && !endReached) {
            loadThumbnails(true);
        }
    }

	onMount(() => {
		loadThumbnails();
        window.addEventListener('scroll', handleScroll);
	    return () => window.removeEventListener('scroll', handleScroll);
	});


    // new thumb nail adding

    let dialogOpen = $state(false);
    let newThumbnailName = $state('');
    let newThumbnailBase64 = $state('');
    let newThumbnailUrl = $state('');
    let thumbnailError = $state('');
    let fileInputRef: HTMLInputElement | null = null;

    const showPreview = $derived(
        newThumbnailBase64 || (
            newThumbnailUrl.startsWith('http://') ||
            newThumbnailUrl.startsWith('https://')
        )
    );

    function openFilePicker() {
        if (fileInputRef) fileInputRef.click();
    }

    function handleThumbnailFile(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        newThumbnailUrl = '';
        thumbnailError = '';
        const reader = new FileReader();
        reader.onload = () => {
            newThumbnailBase64 = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    async function validateAndConvertImageUrl(url: string) {
        thumbnailError = '';
        newThumbnailBase64 = '';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            thumbnailError = 'Invalid image URL.';
            return;
        }
        try {
            const res = await fetch(url);
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.startsWith('image/')) {
                thumbnailError = 'The URL does not point to a valid image.';
                return;
            }
            const blob = await res.blob();
            const reader = new FileReader();
            reader.onload = () => {
                newThumbnailBase64 = reader.result as string;
            };
            reader.readAsDataURL(blob);
        } catch {
            thumbnailError = 'Failed to fetch image.';
        }
    }

    $effect(() => {
        if (newThumbnailUrl.trim()) {
            newThumbnailBase64 = '';
            validateAndConvertImageUrl(newThumbnailUrl.trim());
        }
    });

    let uploading = $state(false);

    async function uploadThumbnail() {
        uploading = true;
        const file = fileInputRef?.files?.[0];
        const uuid = crypto.randomUUID();
        const originalName = newThumbnailName || (file?.name ?? 'thumbnail.jpg');
        const fileName = `${uuid}_${originalName}`;

        try {
            let fileBlob: Blob | null = null;

            if (file) {
                fileBlob = file;
            } else if (newThumbnailUrl.trim()) {
                // Fetch image from the URL as blob
                const res = await fetch(newThumbnailUrl.trim());
                const contentType = res.headers.get('content-type') || 'image/jpeg';
                if (!contentType.startsWith('image/')) throw new Error('Invalid image URL');
                fileBlob = await res.blob();
            } else {
                throw new Error('No file or image URL provided');
            }

            // 1. Request presigned upload URL
            const res = await fetch(`/api/courses/${course.id}/thumbnails/get-upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fileName })
            });

            if (!res.ok) throw new Error("Failed to get upload URL");
            const { uploadUrl, id: fileId } = await res.json();

            // 2. Upload the file blob
            await fetch(uploadUrl, {
                method: 'PUT',
                body: fileBlob,
                headers: {
                    'Content-Type': fileBlob.type
                }
            });

            // 3. Notify backend with fileId and name
            const notifyRes = await fetch(`/api/courses/${course.id}/thumbnails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId, name: originalName })
            });

            if (notifyRes.ok) {
                offset = 0;
                endReached = false;
                loadThumbnails();
                toast.success("New Thumbnail uploaded successfully");
                dialogOpen = false;
            } else {
                throw new Error("Failed to save thumbnail record");
            }
        } catch (e) {
            console.error('Thumbnail upload failed:', e);
            toast.error('Thumbnail upload failed');
        } finally {
            uploading = false;
        }
    }

    const fallbackImage = "https://placehold.co/640x360?text=Thumbnail+Preview";

    // delete thumbnail
    let deleteLoading  = $state(false);
    async function deleteThumbnail(fileId: string) {
        try {
            deleteLoading = true;
            const res = await fetch(`/api/courses/${course.id}/thumbnails/${fileId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                // Optimistically remove the thumbnail
                thumbnails = thumbnails.filter(t => t.id !== fileId);
                toast.success("Thumbnail deleted successfully")
            } else {
                console.error('Delete failed');
                toast.error('Delete failed')
            }
        } catch (err) {
            console.error('Error deleting thumbnail:', err);
            toast.error('Error deleting thumbnail:')
        } finally {
            deleteLoading = false;
        }
    }

    // set as main thumbnail
    let setDfaultLoading  = $state(false);
    async function setAsMainThumbnail(fileId: string) {
        setDfaultLoading = true;
        try {
            const res = await fetch(`/api/courses/${course.id}/thumbnails`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId })
            });
            if (res.ok) {
                await goto(location.pathname, { invalidateAll: true });
                toast.success("New Thumbnail is set to course")
            } else {
                console.error('Failed to set main thumbnail');
                toast.error("Failed to set main thumbnail")
            }
        } catch (err) {
            console.error('Error setting thumbnail:', err);
            toast.error('Error setting thumbnail')
        } finally{
            setDfaultLoading = false;
        }
    }

</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white border-b sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 lg:px-0">
			<div class="flex items-center justify-between py-4">
				<div class="flex items-center gap-4">
					<Button variant="ghost" onclick={() => goto(`/dashboard/courses/${course.id}`)}>
						<ArrowLeft class="w-4 h-4" />
						Back
					</Button>
					<div class="h-6 w-px bg-gray-300"></div>
					<h1 class="text-xl font-semibold text-gray-900 line-clamp-1">
						Thumbnails for: {course.title}
					</h1>
				</div>
				<Dialog.Root bind:open={dialogOpen}>
                    <Dialog.Trigger class={buttonVariants({ variant: "outline" })} ><ImageUp />Upload Thumbnail</Dialog.Trigger>
                    <Dialog.Content class="max-w-md w-full rounded-xl p-6">
                        <Dialog.Title class="text-lg font-bold text-gray-900">Upload Thumbnail</Dialog.Title>
                        <Dialog.Description class="text-sm text-gray-500 mb-4">
                            You can upload an image file or provide a URL.
                        </Dialog.Description>
                
                        <div class="space-y-4">
                            <!-- File Upload -->
                            <Input placeholder="Image.png" bind:value={newThumbnailName} />
                            <div class="flex gap-2">
                                <Input placeholder="https://example.com/image.jpg" bind:value={newThumbnailUrl} />
                                <Button variant="outline" size="sm" class="gap-2 flex-shrink-0" onclick={openFilePicker} type="button">
                                    <ImageIcon class="w-4 h-4" />
                                    Browse
                                </Button>
                                <input type="file" accept="image/*" bind:this={fileInputRef} class="hidden" onchange={handleThumbnailFile} />
                            </div>
                
                            {#if thumbnailError}
                                <p class="text-sm text-red-500">{thumbnailError}</p>
                            {:else}
                                <p class="text-xs text-gray-500 mt-1">
                                    Recommended: 1280×720px • Use a high-quality image that represents your course
                                </p>
                            {/if}
                
                             <!-- Thumbnail -->
                             <div class="aspect-video bg-gray-100 relative overflow-hidden rounded-lg">
                                <img
                                    alt=""
                                    src={showPreview ? (newThumbnailBase64 || newThumbnailUrl) : fallbackImage}
                                    class="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                
                        <!-- Actions -->
                        <div class="mt-6 flex justify-end gap-3">
                            <Button variant="secondary" onclick={() => dialogOpen = false}>Cancel</Button>
                            <Button onclick={uploadThumbnail}>
                                {#if uploading}
                                    <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                    Uploading...
                                {:else}
                                    <ImageUp class="w-4 h-4"/>
                                    Upload
                                {/if}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Root>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="max-w-7xl mx-auto px-4 lg:px-0 py-8">
		<div class="mb-6">
			<Input
				class="md:min-w-sm md:w-1/3"
				type="text"
				placeholder="Search thumbnails..."
				oninput={handleSearchInput}
			/>
		</div>

		{#if loading && thumbnails.length === 0}
			<div class="flex items-center justify-center gap-2 text-center text-gray-500">
                <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div> 
                Loading thumbnails...
            </div>
		{:else if thumbnails.length === 0}
			<div class="text-center py-12">
				<div class="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
					<ImageIcon class="w-10 h-10 text-gray-400" />
				</div>
				<h2 class="text-lg font-medium text-gray-700">No thumbnails found</h2>
				<p class="text-sm text-gray-500">You haven't uploaded any thumbnails yet for this course.</p>
			</div>
		{:else}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                {#each thumbnails as thumb (thumb.id)}
                    <div class="border rounded-xl overflow-hidden hover:shadow-lg transition-all group relative {data.course.thumbnailFileId === thumb.id ? "border-blue-500 shadow-lg" : ""}">
                        <img src={thumb.url} alt={thumb.name} class="w-full aspect-video object-cover cursor-pointer"  role="presentation" onclick={() => goto(`/dashboard/courses/${course.id}/thumbnails/${thumb.id}`)}/>
                        <div class="p-3 text-sm truncate text-gray-700">{thumb.name}</div>
                        <div class="flex item-center gap-2 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {#if data.course.thumbnailFileId !== thumb.id}
                                <AlertDialog.Root>
                                    <AlertDialog.Trigger class={buttonVariants({ variant: "secondary" })}>
                                            <Star class="w-4 h-4 text-yellow-500"/>
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Content class="max-w-md w-full rounded-xl p-6">
                                        <AlertDialog.Title class="text-lg font-bold text-gray-900">
                                            Set as Main Thumbnail
                                        </AlertDialog.Title>
                                        <AlertDialog.Description class="text-sm text-gray-500 mt-2 mb-4">
                                            This image will become the primary thumbnail for your course.
                                        </AlertDialog.Description>
                                        <div class="flex justify-end gap-3 mt-6">
                                            <AlertDialog.Cancel >Cancel</AlertDialog.Cancel>
                                            <AlertDialog.Action onclick={() => setAsMainThumbnail(thumb.id)} disabled={setDfaultLoading}>
                                                {#if setDfaultLoading}
                                                    <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                                    Setting default...
                                                {:else}
                                                    Confirm
                                                {/if}
                                            </AlertDialog.Action>
                                        </div>
                                    </AlertDialog.Content>
                                </AlertDialog.Root>
                            {/if}
                            <!-- Delete button (appears on hover) -->
                            <AlertDialog.Root>
                                <AlertDialog.Trigger class={buttonVariants({ variant: "secondary" })}>
                                <Trash class="w-4 h-4" />
                                </AlertDialog.Trigger>
                            
                                <AlertDialog.Content class="max-w-md w-full rounded-xl p-6">
                                    <AlertDialog.Title class="text-lg font-bold text-gray-900">
                                        Delete Thumbnail
                                    </AlertDialog.Title>
                                    <AlertDialog.Description class="text-sm text-gray-500 mt-2 mb-4">
                                        Are you sure you want to delete this thumbnail? This action cannot be undone.
                                    </AlertDialog.Description>
                            
                                    <div class="flex justify-end gap-3 mt-6">
                                        <AlertDialog.Cancel >Cancel</AlertDialog.Cancel>
                                        <AlertDialog.Action class={buttonVariants({ variant: "destructive" })} disabled={deleteLoading} onclick={() => deleteThumbnail(thumb.id)}>
                                            {#if deleteLoading}
                                                <div class="w-5 h-5 border-2 border-blue-200 border-t-red-600 rounded-full animate-spin"></div>
                                                Deleting...
                                            {:else}
                                                Delete
                                            {/if}
                                        </AlertDialog.Action>
                                    </div>
                                </AlertDialog.Content>
                            </AlertDialog.Root>
                        </div>
                    </div>
                {/each}
            </div>
		{/if}
	</div>
</div>
{#if endReached && !loading}
    <div class="text-center py-8">
        <div class="inline-flex items-center gap-2 text-gray-400">
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>You've reached the end</span>
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
    </div>
{/if}
