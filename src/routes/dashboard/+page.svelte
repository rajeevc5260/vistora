<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";
  import { Button } from "$lib/components/ui/button";
  import {
    LogOut,
    Plus,
    Video,
    FolderOpen,
    Users,
    Settings,
  } from "lucide-svelte";
  import type { PageProps } from "./$types";
  import { goto } from "$app/navigation";

  let { data }: PageProps = $props();
  const user = data.session?.user;
</script>

<div class="max-w-6xl mx-auto space-y-8 px-4 lg:px-0">
  <!-- Welcome Card -->
  <div
    class="rounded-2xl border shadow-sm p-6 bg-white flex items-center gap-6"
  >
    <div class="relative">
      <img
        src={user?.image ?? "/placeholder-avatar.png"}
        alt="User Avatar"
        class="w-16 h-16 rounded-full border-2 border-gray-100 shadow-sm object-cover"
      />

      <div
        class="absolute -bottom-0 -right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
      ></div>
    </div>

    <div class="flex-1">
      <h2 class="text-xl font-semibold text-gray-900 mb-1">
        Welcome back, {user?.name ?? "User"} 👋
      </h2>
      <p class="text-gray-600">{user?.email}</p>
    </div>

    <!-- Sign out button -->
    <Button
      variant="outline"
      size="sm"
      onclick={signOut}
      class="gap-2 flex items-center hover:bg-gray-50"
    >
      <LogOut class="w-4 h-4" />
      Sign Out
    </Button>
  </div>

  <!-- Quick Actions Section -->
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
      <p class="text-gray-600">Get started with your most common tasks</p>
    </div>

    <!-- Primary Actions Row -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Create Course - Featured -->
      <div
        role="presentation"
        onclick={() => goto("/dashboard/courses/new")}
        class="relative rounded-2xl border-2 border-dashed border-blue-200 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer group overflow-hidden"
      >
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div
              class="p-3 bg-blue-500 rounded-xl text-white group-hover:bg-blue-600 transition-colors"
            >
              <Plus class="w-6 h-6" />
            </div>
            <div>
              <h4 class="text-xl font-semibold text-gray-900">
                Create New Course
              </h4>
              <p class="text-sm text-blue-600 font-medium">
                Start building your next course
              </p>
            </div>
          </div>
          <p class="text-gray-700">
            Design engaging content and share your knowledge with students
            worldwide
          </p>
        </div>
        <div
          class="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
        >
          <Plus class="w-16 h-16" />
        </div>
      </div>

      <!-- Manage Courses - Featured -->
      <div
        role="presentation"
        onclick={() => goto("/dashboard/courses")}
        class="relative rounded-2xl border-2 border-dashed border-orange-200 p-8 bg-gradient-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-all duration-300 cursor-pointer group overflow-hidden"
      >
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div
              class="p-3 bg-orange-500 rounded-xl text-white group-hover:bg-orange-600 transition-colors"
            >
              <FolderOpen class="w-6 h-6" />
            </div>
            <div>
              <h4 class="text-xl font-semibold text-gray-900">
                Manage Courses
              </h4>
              <p class="text-sm text-orange-600 font-medium">
                View, edit, or delete your courses
              </p>
            </div>
          </div>
          <p class="text-gray-700">
            Organize your course catalog and track performance metrics
          </p>
        </div>
        <div
          class="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
        >
          <FolderOpen class="w-16 h-16" />
        </div>
      </div>
    </div>

    <!-- Secondary Actions Grid -->
    <div class="grid md:grid-cols-3 gap-6">
      <div
        role="presentation"
        onclick={() => goto("/dashboard/videos")}
        class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors"
          >
            <Video class="w-5 h-5" />
          </div>
          <h4 class="text-lg font-medium text-gray-900">Video Library</h4>
        </div>
        <p class="text-sm text-gray-600">
          Manage your uploaded videos and media assets
        </p>
      </div>

      <div
        role="presentation"
        onclick={() => goto("/dashboard/students")}
        class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-200 transition-colors"
          >
            <Users class="w-5 h-5" />
          </div>
          <h4 class="text-lg font-medium text-gray-900">Students</h4>
        </div>
        <p class="text-sm text-gray-600">
          View enrolled students and engagement insights
        </p>
      </div>

      <div
        role="presentation"
        onclick={() => goto("/dashboard/settings")}
        class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gray-200 transition-colors"
          >
            <Settings class="w-5 h-5" />
          </div>
          <h4 class="text-lg font-medium text-gray-900">Settings</h4>
        </div>
        <p class="text-sm text-gray-600">
          Profile, billing, and account preferences
        </p>
      </div>
    </div>
  </div>
</div>
