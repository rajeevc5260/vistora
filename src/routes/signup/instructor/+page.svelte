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
        User,
        Mail,
        Lock,
        Eye,
        EyeOff,
        GraduationCap,
        UserPlus,
        CheckCircle,
        Shield,
    } from "lucide-svelte";

    let name = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
    let error = "";
    let success = false;
    let loading = false;
    let showPassword = false;
    let showConfirmPassword = false;

    // Password validation
    $: passwordValid = password.length >= 8;
    $: passwordsMatch = password === confirmPassword && confirmPassword !== "";

    async function signup() {
        error = "";

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            error = "All fields are required";
            return;
        }
        if (password !== confirmPassword) {
            error = "Passwords do not match";
            return;
        }
        if (!passwordValid) {
            error = "Password must be at least 8 characters long";
            return;
        }

        loading = true;

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                success = true;
                setTimeout(() => {
                    window.location.href = "/login/instructor";
                }, 2000);
            } else {
                const data = await res.json();
                error = data.error ?? "Signup failed";
            }
        } catch (err) {
            error = "Network error. Please try again.";
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Sign Up as Instructor — Vistora</title>
    <meta name="description" content="Create your instructor account on Vistora and start publishing courses." />
</svelte:head>

<div
    class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4"
>
    <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
            <div
                class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4"
            >
                <GraduationCap class="w-8 h-8 text-emerald-600" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
                Join as Instructor
            </h1>
            <p class="text-gray-600">Create your account and start teaching</p>
        </div>

        <!-- Success Message -->
        {#if success}
            <Card class="shadow-xl border-0 bg-green-50 border-green-200">
                <CardContent class="pt-6">
                    <div class="text-center space-y-4">
                        <div
                            class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full"
                        >
                            <CheckCircle class="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-green-900">
                                Account Created!
                            </h3>
                            <p class="text-green-700 mt-2">
                                Welcome to our platform! You'll be redirected to
                                the login page shortly.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        {:else}
            <!-- Signup Card -->
            <Card class="shadow-xl border-0">
                <CardHeader class="space-y-1 pb-6">
                    <CardTitle class="text-2xl text-center"
                        >Create Account</CardTitle
                    >
                    <CardDescription class="text-center">
                        Fill in your details to get started
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
                    <!-- Name Field -->
                    <div class="space-y-2">
                        <Label for="name" class="text-sm font-medium"
                            >Full Name</Label
                        >
                        <div class="relative">
                            <User
                                class="absolute left-3 top-3 h-4 w-4 text-gray-400"
                            />
                            <Input
                                id="name"
                                type="text"
                                bind:value={name}
                                placeholder="John Doe"
                                class="pl-10 h-12"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <!-- Email Field -->
                    <div class="space-y-2">
                        <Label for="email" class="text-sm font-medium"
                            >Email</Label
                        >
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
                        <div class="flex items-center space-x-2 text-xs">
                            <div class="flex items-center">
                                {#if passwordValid}
                                    <CheckCircle
                                        class="w-3 h-3 text-green-500 mr-1"
                                    />
                                    <span class="text-green-600"
                                        >Strong password</span
                                    >
                                {:else}
                                    <Shield
                                        class="w-3 h-3 text-gray-400 mr-1"
                                    />
                                    <span class="text-gray-500"
                                        >At least 8 characters</span
                                    >
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Confirm Password Field -->
                    <div class="space-y-2">
                        <Label for="confirmPassword" class="text-sm font-medium"
                            >Confirm Password</Label
                        >
                        <div class="relative">
                            <Lock
                                class="absolute left-3 top-3 h-4 w-4 text-gray-400"
                            />
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                bind:value={confirmPassword}
                                placeholder="Confirm your password"
                                class="pl-10 pr-10 h-12"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                class="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                                on:click={() =>
                                    (showConfirmPassword =
                                        !showConfirmPassword)}
                            >
                                {#if showConfirmPassword}
                                    <EyeOff class="h-4 w-4" />
                                {:else}
                                    <Eye class="h-4 w-4" />
                                {/if}
                            </button>
                        </div>
                        {#if confirmPassword && !passwordsMatch}
                            <p class="text-xs text-red-600 flex items-center">
                                <span
                                    class="w-3 h-3 border border-red-500 rounded-full mr-1"
                                ></span>
                                Passwords don't match
                            </p>
                        {:else if passwordsMatch}
                            <p class="text-xs text-green-600 flex items-center">
                                <CheckCircle
                                    class="w-3 h-3 text-green-500 mr-1"
                                />
                                Passwords match
                            </p>
                        {/if}
                    </div>

                    <!-- Error Alert -->
                    {#if error}
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    {/if}

                    <!-- Signup Button -->
                    <Button
                        onclick={signup}
                        disabled={loading ||
                            !name ||
                            !email ||
                            !password ||
                            !confirmPassword}
                        class="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                        {#if loading}
                            <div
                                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                            ></div>
                            Creating Account...
                        {:else}
                            Create Account
                            <UserPlus class="w-4 h-4 ml-2" />
                        {/if}
                    </Button>

                    <!-- Divider -->
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-200"></div>
                        </div>
                        <div
                            class="relative flex justify-center text-xs uppercase"
                        >
                            <span class="bg-white px-2 text-gray-500">or</span>
                        </div>
                    </div>

                    <!-- Login Link -->
                    <div class="text-center">
                        <p class="text-sm text-gray-600">
                            Already have an account?
                            <a
                                href="/login/instructor"
                                class="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                            >
                                Sign in here
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        {/if}

        <!-- Footer -->
        <div class="text-center mt-8 text-sm text-gray-500">
            <p>&copy; 2024 Learning Platform. All rights reserved.</p>
        </div>
    </div>
</div>
