<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";
    import type { PageProps } from "./$types";
    let { data }: PageProps = $props();
    let activeTab = $state<"dashboard" | "course">("dashboard");
</script>

<svelte:head>
    <title>Vistora — Visual Learning, Reinvented</title>
    <meta
        name="description"
        content="Vistora helps instructors share rich video tutorials with interactive modules and track progress effortlessly."
    />
</svelte:head>

<div
    class="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,#dbeafe_15%,transparent_60%),radial-gradient(900px_500px_at_100%_10%,#e9d5ff_10%,transparent_60%)]"
>
    <!-- Hero -->
    <section class="relative overflow-hidden">
        <!-- soft blobs -->
        <div class="pointer-events-none absolute inset-0">
            <div
                class="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"
            ></div>
            <div
                class="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"
            ></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
            <!-- review badge -->
            <div
                class="mx-auto mb-6 w-fit rounded-full border border-black/10 bg-white/80 backdrop-blur px-4 py-2 text-sm text-gray-700 shadow-sm"
            >
                ★★★★★ <span class="ml-1 font-medium">1200+ educators</span>
            </div>

            <h1
                class="text-center text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-gray-900"
            >
                Video-first learning
                <span
                    class="block bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent"
                >
                    made simple with Vistora
                </span>
            </h1>

            <p class="mt-6 text-center text-xl text-gray-600 max-w-3xl mx-auto">
                Share rich tutorials, structure modules, and track
                progress—without wrestling with tooling.
            </p>

            <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                {#if !data.session}
                    <Button
                        class="text-lg px-8 py-5"
                        onclick={() => goto("/login")}
                    >
                        Get Started Free
                    </Button>
                    <Button
                        variant="outline"
                        class="text-lg px-8 py-5 border-2"
                        onclick={() => goto("#features")}
                    >
                        Learn More
                    </Button>
                {:else}
                    <div
                        class="flex flex-col justify-center items-center rounded-2xl border border-blue-200 bg-white/80 backdrop-blur p-6 shadow-sm"
                    >
                        <p class="text-lg text-gray-700 mb-4">
                            Welcome back, <span
                                class="font-semibold text-blue-700"
                                >{data.session.user?.name}</span
                            >!
                        </p>
                        <Button
                            class="text-lg px-8 py-4"
                            onclick={() => goto("/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                {/if}
            </div>

            <!-- Product Screenshot -->
            <div class="mt-16">
                <!-- Tabs -->
                <div class="flex justify-center gap-4 mb-6">
                    <button
                        class="px-4 py-2 text-sm font-medium rounded-full border transition
                       {activeTab === 'dashboard'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}"
                        onclick={() => (activeTab = "dashboard")}
                    >
                        Dashboard
                    </button>
                    <button
                        class="px-4 py-2 text-sm font-medium rounded-full border transition
                       {activeTab === 'course'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}"
                        onclick={() => (activeTab = "course")}
                    >
                        Course Player
                    </button>
                </div>

                <!-- Image Card -->
                <div
                    class="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm"
                >
                    <!-- subtle top browser chrome -->
                    <div
                        class="flex items-center gap-1 px-4 py-2 border-b border-black/5 bg-white/70"
                    >
                        <span class="h-3 w-3 rounded-full bg-red-400/90"></span>
                        <span class="h-3 w-3 rounded-full bg-yellow-400/90"
                        ></span>
                        <span class="h-3 w-3 rounded-full bg-green-400/90"
                        ></span>
                        <div
                            class="ml-3 h-6 flex-1 rounded-md bg-gray-100/80 border border-gray-200/70"
                        ></div>
                    </div>

                    <!-- responsive images -->
                    {#if activeTab === "dashboard"}
                        <img
                            src="/productImage.png"
                            alt="Vistora dashboard screenshot"
                            loading="lazy"
                            class="block w-full h-auto"
                        />
                    {:else}
                        <img
                            src="/course-player.png"
                            alt="Vistora course player screenshot"
                            loading="lazy"
                            class="block w-full h-auto"
                        />
                    {/if}

                    <!-- soft gradient overlay -->
                    <div
                        class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/5"
                    ></div>
                </div>

                <!-- mobile caption -->
                <p class="mt-3 text-center text-sm text-gray-500">
                    {activeTab === "dashboard"
                        ? "Vistora dashboard preview"
                        : "Vistora course player preview"}
                </p>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="max-w-7xl mx-auto px-6 py-24">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">
                Everything you need to teach
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to enhance your teaching experience
            </p>
        </div>

        <div class="grid gap-8 md:grid-cols-3">
            <!-- Feature 1 -->
            <div
                class="group relative rounded-2xl border border-gray-200 p-8 bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden"
            >
                <div class="relative z-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div
                            class="p-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white group-hover:from-blue-600 group-hover:to-blue-800 transition-all duration-300"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 4h.01M12 16h.01M16 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900">
                            Multi-Resolution Streaming
                        </h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">
                        Fast CloudFront video delivery with adaptive quality
                        selector for seamless viewing across all devices.
                    </p>
                </div>
                <div
                    class="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"
                >
                    <svg
                        class="w-16 h-16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 4h.01M12 16h.01M16 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
            </div>

            <!-- Feature 2 -->
            <div
                class="group relative rounded-2xl border border-gray-200 p-8 bg-white hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer overflow-hidden"
            >
                <div class="relative z-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div
                            class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900">
                            Role-Based Access
                        </h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">
                        Admins, instructors, and viewers get exactly what they
                        need with granular permission controls.
                    </p>
                </div>
                <div
                    class="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"
                >
                    <svg
                        class="w-16 h-16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </div>
            </div>

            <!-- Feature 3 -->
            <div
                class="group relative rounded-2xl border border-gray-200 p-8 bg-white hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer overflow-hidden"
            >
                <div class="relative z-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div
                            class="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900">
                            Progress Tracking
                        </h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">
                        Track watch history and completion rates for every user
                        with detailed analytics and insights.
                    </p>
                </div>
                <div
                    class="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"
                >
                    <svg
                        class="w-16 h-16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class=" py-18">
        <div class="max-w-6xl mx-auto px-6">
            <div
                class="rounded-3xl border border-slate-150 bg-white/80 backdrop-blur-sm p-12 shadow-xl"
            >
                <div class="text-center">
                    <h2 class="text-4xl font-bold text-gray-900 mb-6">
                        Built for modern educators
                    </h2>
                    <p
                        class="text-md text-gray-700 leading-relaxed max-w-4xl mx-auto"
                    >
                        Vistora is a new platform designed to help educators,
                        trainers, and creators share knowledge through
                        streamlined video-first courses. Whether you're building
                        a public course or organizing internal training —
                        Vistora gives you the tools to publish, manage, and
                        engage learners effortlessly.
                    </p>
                </div>

                <!-- Highlights -->
                <div class="grid md:grid-cols-3 gap-8 mt-12">
                    <div class="text-center">
                        <div class="text-blue-600 mb-2">
                            <svg
                                class="mx-auto w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 14l9-5-9-5-9 5 9 5z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 14l6.16-3.422A12.042 12.042 0 0112 21a12.042 12.042 0 01-6.16-10.422L12 14z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            Video-Centric
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">
                            Built from the ground up for video-based education
                            and training.
                        </p>
                    </div>
                    <div class="text-center">
                        <div class="text-blue-600 mb-2">
                            <svg
                                class="mx-auto w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9.75 3v1.5m4.5-1.5v1.5m-6 16.5h7.5A2.25 2.25 0 0018 18.75V6.75A2.25 2.25 0 0015.75 4.5H8.25A2.25 2.25 0 006 6.75v12A2.25 2.25 0 008.25 21z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            Modern UI
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">
                            Clean, responsive design that works seamlessly
                            across devices.
                        </p>
                    </div>
                    <div class="text-center">
                        <div class="text-blue-600 mb-2">
                            <svg
                                class="mx-auto w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 9V5.25a2.25 2.25 0 00-4.5 0V9M12 12v7.5m0-7.5H9m3 0h3"
                                />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            Launch Early
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">
                            We’re currently onboarding early creators — get
                            started today.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="max-w-7xl mx-auto px-6 pb-24">
        <div
            class="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 to-blue-800 p-12 text-white"
        >
            <div class="absolute inset-0 pointer-events-none">
                <div
                    class="absolute top-0 left-0 h-full w-full bg-white/10 mix-blend-soft-light"
                ></div>
                <div
                    class="absolute right-10 top-10 h-28 w-28 rounded-full bg-white/20 blur-xl"
                ></div>
                <div
                    class="absolute left-10 bottom-10 h-24 w-24 rounded-full bg-white/20 blur-xl"
                ></div>
            </div>
            <div class="relative">
                <h2 class="text-3xl md:text-4xl font-bold">
                    Ready to transform your teaching?
                </h2>
                <p class="mt-2 text-blue-100 max-w-2xl">
                    Join thousands of educators building modern learning
                    experiences with Vistora.
                </p>
                <div class="mt-6">
                    {#if !data.session}
                        <Button
                            class="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                            onclick={() => goto("/login")}
                        >
                            Start Your Free Trial
                        </Button>
                    {:else}
                        <Button
                            class="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                            onclick={() => goto("/dashboard")}
                        >
                            Continue to Dashboard
                        </Button>
                    {/if}
                </div>
            </div>
        </div>
    </section>
</div>

<!-- Footer -->
<footer class="bg-white border-t border-black/5 py-8">
    <div class="max-w-7xl mx-auto px-6 text-center">
        <p class="text-gray-500">
            © {new Date().getFullYear()} Vistora. All rights reserved.
        </p>
        <div class="flex justify-center gap-6 mt-4 text-sm">
            <a href="#" class="text-gray-400 hover:text-gray-700">Privacy</a>
            <a href="#" class="text-gray-400 hover:text-gray-700">Terms</a>
            <a href="#" class="text-gray-400 hover:text-gray-700">Support</a>
        </div>
    </div>
</footer>
