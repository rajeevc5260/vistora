import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/courses/${params.id}`);

	if (!res.ok) {
		throw new Error("Failed to load course");
	}

	const course = await res.json();
	return { course };
};
