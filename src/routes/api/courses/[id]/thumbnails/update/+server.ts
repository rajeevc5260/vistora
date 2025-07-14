import { json } from '@sveltejs/kit';
import { trelae } from '$lib/utils/trelae';
import { z } from 'zod';

const schema = z.object({
	fileId: z.string(),
	resize: z
		.object({
			width: z.number(),
			height: z.number()
		})
		.optional(),
	grayscale: z.boolean().optional(),
	compress: z.number().optional(),
	convert: z
		.enum(['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'])
		.optional(),
	zoom: z.number().optional(), // canvas-only
	brightness: z.number().optional(),
	contrast: z.number().optional(),
	saturation: z.number().optional(),
	blur: z.number().optional(),
	invert: z.boolean().optional(),
	flipX: z.boolean().optional(),
	flipY: z.boolean().optional(),
	hue: z.number().optional(),
	cropParams: z
		.object({
			width: z.number(),
			height: z.number(),
			left: z.number(),
			top: z.number(),
			position: z.string().optional()
		})
		.optional()
});


export async function POST({ request }) {
	const input = await request.json();
	const parsed = schema.safeParse(input);

	if (!parsed.success) {
		return json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
	}

	const {
		fileId,
		resize,
		grayscale,
		compress,
		convert,
		brightness,
		contrast,
		saturation,
		blur,
		invert,
		flipX,
		flipY,
		hue,
		cropParams
	} = parsed.data;

	try {
		let file = trelae.file(fileId);

		if (resize) {
			file = file.resize({
				width: resize.width,
				height: resize.height,
				fastShrinkOnLoad: true,
				withoutEnlargement: true
			});
		}

        if (cropParams) {
			file = file.crop({
				width: cropParams.width,
				height: cropParams.height,
				left: cropParams.left,
				top: cropParams.top,
				position: cropParams.position ?? 'center'
			});
		}

		if (flipX || flipY) {
			file = file.flip({
				horizontal: !!flipX,
				vertical: !!flipY
			});
		}

		if (
			brightness !== undefined ||
			saturation !== undefined ||
			hue !== undefined
		) {
			file = file.adjust({
				brightness: brightness ?? 1,
				saturation: saturation ?? 1,
				hue: hue ?? 0
			});
		}

		if (compress !== undefined) {
			file = file.compress({ quality: compress });
		}

		if (convert) {
			file = file.convert(convert);
		}

		if (grayscale) {
			file = file.grayscale();
		}

		if (blur && blur > 0) {
			file = file.blur({ sigma: blur });
		}

        console.log("file", file)
		await file.save();

		return json({ success: true });
	} catch (err) {
		console.error('Trelae manipulation failed:', err);
		return json({ error: 'Image transformation failed' }, { status: 500 });
	}
}
