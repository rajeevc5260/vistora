<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import { 
		ArrowLeft, 
		Image as ImageIcon, 
		Settings, 
		Eye, 
		Sparkles, 
		Download, 
		RefreshCw,
		Palette,
		Sliders,
		Move,
		Zap,
		FileImage,
		Maximize,
		Sun,
		Contrast,
		Droplets,
		RotateCw,
		Paintbrush,
        Droplet
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let editing = $state(false);
	let loading = $state(false);

	let resize = $state({ width: 1280, height: 720 });
	let grayscale = $state(false);
	let compress = $state(95);
	let convert = $state('');
	let zoom = $state(1);
	let brightness = $state(1);
	let contrast = $state(1);
	let saturation = $state(1);
	let blur = $state(0);
	let invert = $state(false);
	let flipX = $state(false);
	let flipY = $state(false);
    let hue = $state(0);
	
	// Crop parameters
	let cropParams = $state({
		width: 0,
		height: 0,
		left: 0,
		top: 0,
		position: 'center'
	});

	let previewDataUrl = $state(data.thumbnail.url);
	let canvasRef: HTMLCanvasElement;

	$effect(() => {
        const { width, height } = resize;
        const gray = grayscale;
        const isEditing = editing;
        const z = zoom;
        const bright = brightness;
        const cont = contrast;
        const sat = saturation;
        const blr = blur;
        const inv = invert;
        const fx = flipX;
        const fy = flipY;
        const hueShift = hue;

        if (!isEditing || !canvasRef) return;

        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(data.thumbnail.url)}`;

        (async () => {
            try {
                const res = await fetch(proxyUrl, { method: 'HEAD' });

                const contentType = res.headers.get('content-type') || '';
                const ext = contentType.split('/')[1]?.split(';')[0];

                if (['jpeg', 'png', 'webp'].includes(ext)) {
                    convert = ext;
                } else {
                    convert = '';
                }
            } catch (err) {
                console.error('Failed to fetch content-type:', err);
                convert = '';
            }
        })();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = proxyUrl;

        img.onload = () => {
            const ctx = canvasRef.getContext('2d');
            if (!ctx) return;

            // Set canvas size to the desired output dimensions
            canvasRef.width = width;
            canvasRef.height = height;

            ctx.clearRect(0, 0, width, height);
            ctx.save();

            // Calculate crop parameters for the API
            const imgAspectRatio = img.width / img.height;
            const canvasAspectRatio = width / height;
            
            // Calculate the crop area based on zoom level
            let cropWidth, cropHeight, cropLeft, cropTop;
            
            if (z >= 1) {
                // Zooming in - crop from center
                // Calculate crop dimensions based on zoom level
                if (imgAspectRatio > canvasAspectRatio) {
                    // Image is wider than canvas ratio
                    cropHeight = img.height / z;
                    cropWidth = cropHeight * canvasAspectRatio;
                } else {
                    // Image is taller than canvas ratio
                    cropWidth = img.width / z;
                    cropHeight = cropWidth / canvasAspectRatio;
                }
                
                // Center the crop
                cropLeft = (img.width - cropWidth) / 2;
                cropTop = (img.height - cropHeight) / 2;
            } else {
                // Zooming out - use full image dimensions
                cropWidth = img.width;
                cropHeight = img.height;
                cropLeft = 0;
                cropTop = 0;
            }

            // Update crop parameters for API usage
            cropParams = {
                width: Math.round(cropWidth),
                height: Math.round(cropHeight),
                left: Math.round(cropLeft),
                top: Math.round(cropTop),
                position: 'center'
            };

            // Console log the crop parameters
            console.log('Crop Parameters:', cropParams);
            console.log('API Usage Example:');
            console.log(`file.crop({
            width: ${cropParams.width},
            height: ${cropParams.height},
            left: ${cropParams.left},
            top: ${cropParams.top},
            position: '${cropParams.position}'
            }).save();`);

            // For canvas display, we need to calculate how to draw the cropped area
            // Calculate destination size on canvas
            let destWidth = width;
            let destHeight = height;
            let destX = 0;
            let destY = 0;

            if (z < 1) {
                // When zooming out, maintain aspect ratio and add padding
                if (imgAspectRatio > canvasAspectRatio) {
                    destWidth = width * z;
                    destHeight = (width * z) / imgAspectRatio;
                } else {
                    destHeight = height * z;
                    destWidth = (height * z) * imgAspectRatio;
                }
                
                // Center the destination
                destX = (width - destWidth) / 2;
                destY = (height - destHeight) / 2;
            }

            // Center the transformation for flipping
            ctx.translate(width / 2, height / 2);
            
            // Apply flip transformations
            ctx.scale(fx ? -1 : 1, fy ? -1 : 1);

            // Move back to draw from the calculated position
            ctx.translate(-width / 2, -height / 2);

            // Apply filters
            ctx.filter = [
                gray ? 'grayscale(100%)' : '',
                `brightness(${bright})`,
                `contrast(${cont})`,
                `saturate(${sat})`,
                `blur(${blr}px)`,
                inv ? 'invert(100%)' : '',
                `hue-rotate(${hueShift}deg)`
            ].filter(Boolean).join(' ');

            // Draw the cropped and scaled image
            ctx.drawImage(
                img,
                cropLeft, cropTop, cropWidth, cropHeight, // Source crop area
                destX, destY, destWidth, destHeight       // Destination area
            );

            ctx.restore();
            previewDataUrl = canvasRef.toDataURL('image/png');
        };

        img.onerror = (err) => {
            console.error('Proxy image load failed:', err);
            toast.error('Preview image could not be loaded');
        };
    });

	function resetAllSettings() {
		resize = { width: 1280, height: 720 };
		grayscale = false;
		compress = 80;
		convert = '';
		zoom = 1;
		brightness = 1;
		contrast = 1;
		saturation = 1;
		blur = 0;
		invert = false;
		flipX = false;
		flipY = false;
		hue = 0;
		cropParams = {
			width: 0,
			height: 0,
			left: 0,
			top: 0,
			position: 'center'
		};
		toast.success('All settings reset to default');
	}

	function downloadImage() {
		if (canvasRef) {
			const link = document.createElement('a');
			link.download = `${data.thumbnail.name}_edited.png`;
			link.href = canvasRef.toDataURL('image/png');
			link.click();
			toast.success('Image downloaded successfully!');
		}
	}

    async function saveChanges() {
        loading = true;

        try {
            const requestBody = {
                fileId: data.thumbnail.fileId,
                resize,
                grayscale,
                compress,
                convert,
                zoom,
                brightness,
                contrast,
                saturation,
                blur,
                invert,
                flipX,
                flipY,
                hue,
                cropParams
            };

            // Log the request body to the console
            console.log("Sending the following data to the API:", requestBody);

            const res = await fetch(`/api/courses/${data.course.id}/thumbnails/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!res.ok) throw new Error('Failed to update thumbnail');

            toast.success('Thumbnail updated successfully!');
            editing = false;
            // Refresh page data
            await goto(location.pathname, { invalidateAll: true });
        } catch (err) {
            console.error(err);
            toast.error('Thumbnail update failed');
        } finally {
            loading = false;
        }
    }

	// Helper function to set common aspect ratios
	function setAspectRatio(ratio: string) {
		switch (ratio) {
			case '16:9':
				resize = { width: 1280, height: 720 };
				break;
			case '4:3':
				resize = { width: 1024, height: 768 };
				break;
			case '1:1':
				resize = { width: 800, height: 800 };
				break;
			case '9:16':
				resize = { width: 720, height: 1280 };
				break;
		}
	}

</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white border-b sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 lg:px-0">
			<div class="flex items-center justify-between py-4">
				<div class="flex items-center gap-4">
					<Button variant="ghost" onclick={() => goto(`/dashboard/courses/${data.course.id}/thumbnails`)} class="gap-2">
						<ArrowLeft class="w-4 h-4" />
						Back to Thumbnails
					</Button>
					<div class="h-6 w-px bg-gray-300"></div>
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 bg-gradient-to-br bg-blue-500 rounded-full flex items-center justify-center">
							<ImageIcon class="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 class="text-xl font-semibold text-gray-900 line-clamp-1" title={data.thumbnail.name}>
								{data.thumbnail.name}
							</h1>
						</div>
					</div>
				</div>
				
				<div class="flex items-center gap-3">
					<Button variant="outline" onclick={() => (editing = !editing)} class="gap-2">
						{#if editing}
							<Eye class="w-4 h-4" />
							Preview Mode
						{:else}
							<Settings class="w-4 h-4" />
							Edit Thumbnail
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 lg:px-0 py-8">
		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Left Column - Preview -->
			<div class="lg:col-span-2 space-y-6">
				{#if editing}
					<!-- Welcome Card -->
					<Card class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
						<CardContent class="p-6">
							<div class="flex items-center gap-3 mb-3">
								<div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
									<Sparkles class="w-5 h-5 text-white" />
								</div>
								<div>
									<h2 class="text-lg font-semibold text-gray-900">Transform Your Thumbnail</h2>
									<p class="text-sm text-blue-500">Make it stand out with professional editing tools</p>
								</div>
							</div>
							<p class="text-sm text-gray-700">
								Use the powerful editing tools to enhance your thumbnail. Adjust colors, add effects, and make it perfect for your course.
							</p>
						</CardContent>
					</Card>
				{/if}

				<!-- Image Preview -->
				<Card class="overflow-hidden">
					<CardHeader>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Eye class="w-4 h-4 text-gray-500" />
								<CardTitle class="text-lg">Preview</CardTitle>
							</div>
							{#if editing}
								<div class="flex items-center gap-2">
									<Button variant="outline" size="sm" onclick={resetAllSettings} class="gap-1">
										<RefreshCw class="w-3 h-3" />
										Reset
									</Button>
									<Button variant="outline" size="sm" onclick={downloadImage} class="gap-1">
										<Download class="w-3 h-3" />
										Download
									</Button>
								</div>
							{/if}
						</div>
						<CardDescription>
							{editing ? 'Live preview of your edits' : 'Current thumbnail image'}
						</CardDescription>
					</CardHeader>
					<CardContent class="p-0">
						<div class="relative bg-gray-100">
							<img
								src={editing ? previewDataUrl : data.thumbnail.url}
								alt={data.thumbnail.name}
								class="w-full aspect-video object-contain"
							/>
							{#if editing}
								<div class="absolute top-2 right-2 space-y-1">
									<Badge variant="secondary" class="bg-black/20 text-white block">
										{resize.width}×{resize.height}
									</Badge>
									<Badge variant="secondary" class="bg-black/20 text-white block">
										Zoom: {zoom.toFixed(1)}x
									</Badge>
									<Badge variant="secondary" class="bg-black/20 text-white block text-xs">
										Crop: {cropParams.width}×{cropParams.height}
									</Badge>
								</div>
							{/if}
						</div>
					</CardContent>
				</Card>

				<canvas bind:this={canvasRef} class="hidden"></canvas>
			</div>

			<!-- Right Column - Edit Panel -->
			{#if editing}
				<div class="space-y-6">
					<!-- Dimensions & Transform -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-base">
								<Maximize class="w-4 h-4" />
								Dimensions & Transform
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<!-- Aspect Ratio Presets -->
							<div>
								<Label class="text-xs font-medium text-gray-700 mb-2 block">Quick Ratios</Label>
								<div class="grid grid-cols-4 gap-2">
									<Button variant="outline" size="sm" onclick={() => setAspectRatio('16:9')} class="text-xs">16:9</Button>
									<Button variant="outline" size="sm" onclick={() => setAspectRatio('4:3')} class="text-xs">4:3</Button>
									<Button variant="outline" size="sm" onclick={() => setAspectRatio('1:1')} class="text-xs">1:1</Button>
									<Button variant="outline" size="sm" onclick={() => setAspectRatio('9:16')} class="text-xs">9:16</Button>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-3">
								<div>
									<Label class="text-xs font-medium text-gray-700">Width</Label>
									<Input type="number" bind:value={resize.width} class="h-8" min="100" max="4096" />
								</div>
								<div>
									<Label class="text-xs font-medium text-gray-700">Height</Label>
									<Input type="number" bind:value={resize.height} class="h-8" min="100" max="4096" />
								</div>
							</div>
							
							<div>
								<Label class="text-xs font-medium text-gray-700 flex items-center gap-1">
									<Move class="w-3 h-3" />
									Zoom: {zoom.toFixed(1)}x
								</Label>
								<Input type="range" min="0.5" max="3" step="0.1" bind:value={zoom} class="mt-1" />
								<div class="flex justify-between text-xs text-gray-500 mt-1">
									<span>0.5x (Show More)</span>
									<span>3x (Crop Closer)</span>
								</div>
								<p class="text-xs text-gray-600 mt-1">
									Zoom in to crop closer and show less of the image. Zoom out to show more of the image.
								</p>
								{#if cropParams.width > 0}
									<div class="mt-2 p-2 bg-gray-50 rounded text-xs">
										<div class="font-medium text-gray-700 mb-1">Crop Area:</div>
										<div class="text-gray-600">
											Size: {cropParams.width}×{cropParams.height}px<br>
											Position: ({cropParams.left}, {cropParams.top})<br>
											Alignment: {cropParams.position}
										</div>
									</div>
								{/if}
							</div>

							<div class="grid grid-cols-2 gap-3">
								<label class="flex items-center gap-2 text-sm">
									<input type="checkbox" bind:checked={flipX} class="rounded" />
									Flip X
								</label>
								<label class="flex items-center gap-2 text-sm">
									<input type="checkbox" bind:checked={flipY} class="rounded" />
									Flip Y
								</label>
							</div>
						</CardContent>
					</Card>

					<!-- Color Adjustments -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-base">
								<Palette class="w-4 h-4" />
								Color & Effects
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<Label class="text-xs font-medium text-gray-700 flex items-center gap-1">
									<Sun class="w-3 h-3" />
									Brightness: {brightness.toFixed(1)}
								</Label>
								<Input type="range" min="0.1" max="2" step="0.1" bind:value={brightness} class="mt-1" />
							</div>

							<div>
								<Label class="text-xs font-medium text-gray-700 flex items-center gap-1">
									<Contrast class="w-3 h-3" />
									Contrast: {contrast.toFixed(1)}
								</Label>
								<Input type="range" min="0.1" max="2" step="0.1" bind:value={contrast} class="mt-1" />
							</div>

							<div>
								<Label class="text-xs font-medium text-gray-700 flex items-center gap-1">
									<Droplets class="w-3 h-3" />
									Saturation: {saturation.toFixed(1)}
								</Label>
								<Input type="range" min="0" max="2" step="0.1" bind:value={saturation} class="mt-1" />
							</div>

							<div>
								<Label class="text-xs font-medium text-gray-700 flex items-center gap-1">
									<RotateCw class="w-3 h-3" />
									Hue Rotate: {hue}°
								</Label>
								<Input type="range" min="0" max="360" step="1" bind:value={hue} class="mt-1" />
							</div>
						</CardContent>
					</Card>

					<!-- Filters -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-base">
								<Sliders class="w-4 h-4" />
								Filters & Effects
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<Label class="text-xs font-medium text-gray-700 flex items-center gap-1">
									<Droplet class="w-3 h-3" />
									Blur: {blur}px
								</Label>
								<Input type="range" min="0" max="10" step="0.5" bind:value={blur} class="mt-1" />
							</div>

							<div class="grid grid-cols-2 gap-3">
								<label class="flex items-center gap-2 text-sm">
									<input type="checkbox" bind:checked={grayscale} class="rounded" />
									Grayscale
								</label>
								<label class="flex items-center gap-2 text-sm">
									<input type="checkbox" bind:checked={invert} class="rounded" />
									Invert
								</label>
							</div>

							<Separator />
						</CardContent>
					</Card>

					<!-- Export Settings -->
					<Card>
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-base">
								<Download class="w-4 h-4" />
								Export Settings
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div>
								<Label class="text-xs font-medium text-gray-700">Format</Label>
								<select bind:value={convert} class="w-full mt-1 p-2 border rounded-md text-sm">
									<option value="">Keep original</option>
									<option value="jpeg">JPEG</option>
									<option value="png">PNG</option>
									<option value="webp">WebP</option>
								</select>
							</div>

							<div>
								<Label class="text-xs font-medium text-gray-700">Quality: {compress}%</Label>
								<Input type="range" min="10" max="100" bind:value={compress} class="mt-1" />
							</div>
						</CardContent>
					</Card>

					<!-- Action Buttons -->
					<div class="flex gap-3">
						<Button onclick={saveChanges} disabled={loading} class="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
							{#if loading}
								<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
								Saving...
							{:else}
								<ImageIcon class="w-4 h-4 mr-2" />
								Save Changes
							{/if}
						</Button>
						<Button variant="outline" onclick={() => (editing = false)} class="px-6">
							Cancel
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>