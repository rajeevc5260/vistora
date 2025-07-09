import { toast } from 'svelte-sonner';

export async function loadVideoFromFirstLesson(
	modules: any[],
	setSelectedUrl: (url: string | null) => void,
	setLoadingId: (id: string | null) => void,
    setCurrentPlayingVideoId: (videoId: string | null) => void

): Promise<void> {
	const firstLesson = modules[0]?.lessons[0];
	if (!firstLesson || !firstLesson.fileId) return;

	setLoadingId(firstLesson.fileId);
	setSelectedUrl(null);
    setCurrentPlayingVideoId(firstLesson.fileId);

	try {
		const res = await fetch(`/api/videos/${firstLesson.fileId}/download-url`);
		if (!res.ok) throw new Error('Request failed');
		const { url } = await res.json();
		setSelectedUrl(url);
	} catch (error) {
		toast.error('Failed to load video');
		console.error('Video load error:', error);
	} finally {
		setLoadingId(null);
	}
}
