<script lang="ts">
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from '$lib/components/ui/table';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let { students, total, page, limit } = data;
	let currentSearch = '';
	let filteredStudents = students;

	let searchDebounce: NodeJS.Timeout;

	function handleSearchInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		currentSearch = val;

		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(async () => {
			if (!currentSearch) {
				filteredStudents = students;
				return;
			}

			const res = await fetch('/api/students/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query: currentSearch })
			});

			if (res.ok) {
				const result = await res.json();
				filteredStudents = result.students;
			}
		}, 300);
	}

	function nextPage() {
		goto(`/dashboard/students?page=${(page || 1) + 1}`);
	}
	function prevPage() {
		goto(`/dashboard/students?page=${(page || 1) - 1}`);
	}
</script>

<div class="max-w-7xl mx-auto space-y-8 px-4 lg:px-0">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Enrolled Students</h1>
            <p class="text-gray-600 mt-1">
                Students those who are enrolled in my courses
            </p>
        </div>
    </div>

	<!-- Search -->
	<div class="flex justify-between items-center">
		<Input
			type="text"
			placeholder="Search by name or email..."
			value={currentSearch}
			oninput={handleSearchInput}
			class="w-full max-w-sm"
		/>
	</div>

	<!-- Table -->
	<Table class="mt-4">
		<TableHeader>
			<TableRow>
				<TableHead>Avatar</TableHead>
				<TableHead>Name</TableHead>
				<TableHead>Email</TableHead>
				<TableHead>Enrolled Courses</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each filteredStudents as student}
				<TableRow>
					<TableCell>
						<Avatar>
							<AvatarImage src={student.avatarUrl || ''} alt={student.name} />
							<AvatarFallback>{(student.name || student.email)?.charAt(0)}</AvatarFallback>
						</Avatar>
					</TableCell>
					<TableCell class="font-medium">{student.name || 'No Name'}</TableCell>
					<TableCell>{student.email}</TableCell>
					<TableCell>
						{#if student.courses?.length > 0}
							<ul class="text-sm text-gray-600 list-disc ml-4 space-y-0.5">
								{#each student.courses as c}
									<li>{c}</li>
								{/each}
							</ul>
						{:else}
							<span class="text-sm text-gray-400">No courses</span>
						{/if}
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>

	<!-- Pagination -->
	{#if !currentSearch}
		<div class="flex justify-between items-center mt-4 text-sm text-gray-500">
			<span>
				Showing page {page} of {Math.ceil(total / limit)} • Total {total} student{total !== 1 ? 's' : ''}
			</span>
			<div class="flex gap-2">
				<Button onclick={prevPage} disabled={page <= 1} variant="outline">Previous</Button>
				<Button onclick={nextPage} disabled={page * limit >= total} variant="outline">Next</Button>
			</div>
		</div>
	{:else if filteredStudents.length === 0}
		<div class="text-center text-gray-500 py-8">
			No students found for “{currentSearch}”
		</div>
	{/if}
</div>
