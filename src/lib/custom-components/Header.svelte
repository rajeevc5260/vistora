<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { onMount } from 'svelte';
    
    let mobileMenuOpen = false;
    
    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }
    
    function closeMobileMenu() {
        mobileMenuOpen = false;
    }
    
    // Close mobile menu when clicking outside
    onMount(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (!target.closest('nav') && !target.closest('[data-mobile-menu-toggle]')) {
                mobileMenuOpen = false;
            }
        }
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    });
</script>

<header
    class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
>
    <div class="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <!-- Logo -->
        <a href="/" class="flex items-center ml-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center">
                <img alt="Vistora logo" src="/favicon.png" class="text-white font-bold text-sm" />
            </div>
            <h1 class="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                istora
            </h1>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-4">
            <a
                href="/"
                class="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >Home</a
            >
            <a
                href="#features"
                class="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >Features</a
            >
            <a
                href="#about"
                class="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >About</a
            >
            <Button>
                <a href="/login">Login</a>
            </Button>
        </nav>

        <!-- Mobile Menu Button -->
        <button
            data-mobile-menu-toggle
            class="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-all duration-200"
            on:click={toggleMobileMenu}
            aria-label="Toggle mobile menu"
        >
            <svg
                class="w-6 h-6 text-gray-700 transition-transform duration-300 {mobileMenuOpen ? 'rotate-90' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                {#if mobileMenuOpen}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                {:else}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                {/if}
            </svg>
        </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <div class="md:hidden">
        <div 
            class="absolute top-full left-0 right-0 bg-white/95 backdrop-blur border-t shadow-lg transition-all duration-300 ease-in-out {mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}"
        >
            <nav class="px-4 py-4 space-y-3">
                <a
                    href="/"
                    class="block text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 px-3 py-2 rounded-md transition-all duration-200"
                    on:click={closeMobileMenu}
                    >Home</a
                >
                <a
                    href="#features"
                    class="block text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 px-3 py-2 rounded-md transition-all duration-200"
                    on:click={closeMobileMenu}
                    >Features</a
                >
                <a
                    href="#about"
                    class="block text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 px-3 py-2 rounded-md transition-all duration-200"
                    on:click={closeMobileMenu}
                    >About</a
                >
                <div class="pt-2 border-t border-gray-100">
                    <Button class="w-full mt-2">
                        <a href="/login" class="block w-full" on:click={closeMobileMenu}>Login</a>
                    </Button>
                </div>
            </nav>
        </div>
    </div>
</header>