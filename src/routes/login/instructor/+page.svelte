<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import {
        Mail,
        Lock,
        Eye,
        EyeOff,
        GraduationCap,
        ArrowRight,
    } from "lucide-svelte";

    let email = "";
    let password = "";
    let error = "";
    let loading = false;
    let showPassword = false;

    async function login() {
        if (!email || !password) {
            error = "Please fill in all fields";
            return;
        }

        loading = true;
        error = "";

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                location.href = "/dashboard";
            } else {
                const { error: msg } = await res.json();
                error = msg ?? "Login failed";
            }
        } catch (err) {
            error = "Network error. Please try again.";
        } finally {
            loading = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            login();
        }
    }
</script>

<div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4"
>
    <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
            <div
                class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"
            >
                <GraduationCap class="w-8 h-8 text-blue-600" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p class="text-gray-600">Sign in to your instructor account</p>
        </div>

        <!-- Login Card -->
        <Card class="shadow-xl border-0">
            <CardHeader class="space-y-1 pb-6">
                <CardTitle class="text-2xl text-center">Sign In</CardTitle>
                <CardDescription class="text-center">
                    Enter your credentials to access your dashboard
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <!-- Email Field -->
                <div class="space-y-2">
                    <Label for="email" class="text-sm font-medium">Email</Label>
                    <div class="relative">
                        <Mail
                            class="absolute left-3 top-3 h-4 w-4 text-gray-400"
                        />
                        <Input
                            id="email"
                            type="email"
                            bind:value={email}
                            placeholder="instructor@example.com"
                            class="pl-10 h-12"
                            disabled={loading}
                            onkeydown={handleKeydown}
                        />
                    </div>
                </div>

                <!-- Password Field -->
                <div class="space-y-2">
                    <Label for="password" class="text-sm font-medium"
                        >Password</Label
                    >
                    <div class="relative">
                        <Lock
                            class="absolute left-3 top-3 h-4 w-4 text-gray-400"
                        />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            placeholder="Enter your password"
                            class="pl-10 pr-10 h-12"
                            disabled={loading}
                            onkeydown={handleKeydown}
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                            on:click={() => (showPassword = !showPassword)}
                        >
                            {#if showPassword}
                                <EyeOff class="h-4 w-4" />
                            {:else}
                                <Eye class="h-4 w-4" />
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Error Alert -->
                {#if error}
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                {/if}

                <!-- Login Button -->
                <Button
                    onclick={login}
                    disabled={loading || !email || !password}
                    class="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    {#if loading}
                        <div
                            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                        ></div>
                        Signing in...
                    {:else}
                        Sign In
                        <ArrowRight class="w-4 h-4 ml-2" />
                    {/if}
                </Button>

                <!-- Divider -->
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t border-gray-200" ></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-white px-2 text-gray-500">or</span>
                    </div>
                </div>

                <!-- Sign Up Link -->
                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Don't have an account?
                        <a
                            href="/signup/instructor"
                            class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign up here
                        </a>
                    </p>
                </div>

                <!-- Forgot Password -->
                <div class="text-center">
                    <a
                        href="/auth/forgot-password"
                        class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Forgot your password?
                    </a>
                </div>
            </CardContent>
        </Card>

        <!-- Footer -->
        <div class="text-center mt-8 text-sm text-gray-500">
            <p>&copy; 2024 Learning Platform. All rights reserved.</p>
        </div>
    </div>
</div>
