<script lang="ts">
    import { Button } from "$lib/components/ui/button";
</script>

<header
    class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
>
    <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3 ml-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-sm">V</span>
            </div>
            <h1 class="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Vistora
            </h1>
        </div>
        <nav class="space-x-4">
            <a
                href="/"
                class="text-sm font-medium text-gray-700 hover:text-black"
                >Home</a
            >
            <a
                href="#features"
                class="text-sm font-medium text-gray-700 hover:text-black"
                >Features</a
            >
            <a
                href="#about"
                class="text-sm font-medium text-gray-700 hover:text-black"
                >About</a
            >
            <Button>
                <a href="/login">Login</a>
            </Button>
        </nav>
    </div>
</header>
