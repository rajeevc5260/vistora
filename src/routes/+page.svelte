<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    let { data }: PageProps = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-6 py-32 text-center relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
            <div class="absolute bottom-20 right-20 w-48 h-48 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div class="relative z-10">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 mb-8 shadow-sm">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-gray-700">Now Available</span>
            </div>

            <h1 class="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
                Visual Learning,
                <span class="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Reinvented
                </span>
            </h1>
            
            <p class="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Vistora helps instructors share rich video tutorials with interactive
                modules and track progress effortlessly. Built for modern educators.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {#if !data.session}
                    <Button 
                        class="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onclick={() => goto("/login")}
                    >
                        Get Started Free
                    </Button>
                    <Button 
                        variant="outline" 
                        class="text-lg px-8 py-4 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                        onclick={() => goto("#features")}
                    >
                        Learn More
                    </Button>
                {:else}
                    <div class="rounded-2xl border border-blue-200 bg-white/80 backdrop-blur-sm p-6 mb-6 shadow-sm">
                        <p class="text-lg text-gray-700 mb-4">
                            Welcome back, <span class="font-semibold text-blue-600">{data.session.user?.name}</span>! 👋
                        </p>
                        <Button 
                            class="text-lg px-8 py-4  text-white shadow-lg"
                            onclick={() => goto("/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                {/if}
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
            <div class="group relative rounded-2xl border border-gray-200 p-8 bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden">
                <div class="relative z-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="p-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white group-hover:from-blue-600 group-hover:to-blue-800 transition-all duration-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 4h.01M12 16h.01M16 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900">Multi-Resolution Streaming</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">
                        Fast CloudFront video delivery with adaptive quality selector for seamless viewing across all devices.
                    </p>
                </div>
                <div class="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 4h.01M12 16h.01M16 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </div>

            <!-- Feature 2 -->
            <div class="group relative rounded-2xl border border-gray-200 p-8 bg-white hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer overflow-hidden">
                <div class="relative z-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900">Role-Based Access</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">
                        Admins, instructors, and viewers get exactly what they need with granular permission controls.
                    </p>
                </div>
                <div class="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                </div>
            </div>

            <!-- Feature 3 -->
            <div class="group relative rounded-2xl border border-gray-200 p-8 bg-white hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer overflow-hidden">
                <div class="relative z-10">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900">Progress Tracking</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">
                        Track watch history and completion rates for every user with detailed analytics and insights.
                    </p>
                </div>
                <div class="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="bg-gradient-to-r from-gray-50 to-blue-50 py-24">
        <div class="max-w-6xl mx-auto px-6">
            <div class="rounded-3xl border border-white/20 bg-white/80 backdrop-blur-sm p-12 shadow-xl">
                <div class="text-center">
                    <h2 class="text-4xl font-bold text-gray-900 mb-6">
                        Built for modern educators
                    </h2>
                    <p class="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
                        Whether you're teaching a course or sharing internal training
                        content, Vistora helps you deliver engaging video experiences with
                        powerful tools like role management, progress tracking, and secure
                        content delivery.
                    </p>
                </div>
                
                <!-- Stats or additional info -->
                <div class="grid md:grid-cols-3 gap-8 mt-12">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                        <div class="text-gray-600">Uptime</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-600 mb-2">50k+</div>
                        <div class="text-gray-600">Videos Delivered</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-600 mb-2">1M+</div>
                        <div class="text-gray-600">Students Reached</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-7xl mx-auto px-6 py-24 text-center">
        <div class="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 to-blue-800 p-12 text-white relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute inset-0 pointer-events-none">
                <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-blue-800/20"></div>
                <div class="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div class="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            </div>
            
            <div class="relative z-10">
                <h2 class="text-4xl font-bold mb-4">
                    Ready to transform your teaching?
                </h2>
                <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of educators who are already using Vistora to create amazing learning experiences.
                </p>
                {#if !data.session}
                    <Button 
                        class="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onclick={() => goto("/login")}
                    >
                        Start Your Free Trial
                    </Button>
                {:else}
                    <Button 
                        class="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onclick={() => goto("/dashboard")}
                    >
                        Continue to Dashboard
                    </Button>
                {/if}
            </div>
        </div>
    </section>
</div>

<!-- Footer -->
<footer class="bg-white border-t border-gray-200 py-8">
    <div class="max-w-7xl mx-auto px-6 text-center">
        <p class="text-gray-500">
            © {new Date().getFullYear()} Vistora. All rights reserved.
        </p>
        <div class="flex justify-center gap-6 mt-4">
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">Support</a>
        </div>
    </div>
</footer>