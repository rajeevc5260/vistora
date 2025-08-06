<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    LogOut,
    Plus,
    Video,
    FolderOpen,
    Users,
    Settings,
    BookOpen,
    Trophy,
    Search,
    Heart,
    History,
    FileBadge2,
    CircleDot,
  } from "lucide-svelte";
  import type { PageProps } from "./$types";
  import {
        Avatar,
        AvatarImage,
        AvatarFallback,
    } from "$lib/components/ui/avatar";
  import { goto } from "$app/navigation";
    import { logout } from "$lib/utils/logout";

  let { data }: PageProps = $props();
  const user = data.session?.user;
  const userRole = user?.role || 'viewer'; // Default to viewer if no role specified
</script>

<div class="max-w-6xl mx-auto space-y-8 px-4 lg:px-0">
  <!-- Welcome Card -->
  <div
    class="rounded-2xl border shadow-sm p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
  >
    <div class="relative flex-shrink-0">
      <Avatar class="w-12 h-12 sm:w-16 sm:h-16">
          <AvatarImage
              src={user?.image ?? ""}
              alt={user?.name ?? "User"}
          />
          <AvatarFallback
              >{user?.name?.[0] ?? "U"}</AvatarFallback
          >
      </Avatar>
      <div
        class="absolute -bottom-0 -right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"
      ></div>
    </div>

    <div class="flex-1 min-w-0">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">
        Welcome back, {user?.name ?? "User"} 👋
      </h2>
      <p class="text-sm sm:text-base text-gray-600 truncate mb-2 sm:mb-0">{user?.email}</p>
      <div class="flex items-center gap-2 mt-2">
        <span class="px-2 py-1 text-xs font-medium rounded-full {userRole === 'instructor' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-emerald-100 text-emerald-800'}">
          {userRole === 'instructor' ? 'Instructor' : 'Student'}
        </span>
      </div>
    </div>

    <!-- Sign out button -->
    <div class="w-full sm:w-auto flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        onclick={logout}
        class="gap-2 flex items-center justify-center hover:bg-gray-50 w-full sm:w-auto"
      >
        <LogOut class="w-4 h-4" />
        <span class="sm:inline">Sign Out</span>
      </Button>
    </div>
  </div>
  {#if userRole === 'instructor'}
    <!-- Instructor Dashboard -->
    <div class="space-y-6">
      <div class="text-center">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Instructor Dashboard</h3>
        <p class="text-gray-600">Manage your courses and track student progress</p>
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
  {:else}
    <!-- Student/Viewer Dashboard -->
    <div class="space-y-6">
      <div class="text-center">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h3>
        <p class="text-gray-600">Continue your learning journey</p>
      </div>

      <!-- Primary Actions Row -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Browse Courses - Featured -->
        <div
          role="presentation"
          onclick={() => goto("/dashboard/courses")}
          class="relative rounded-2xl border-2 border-dashed border-emerald-200 p-8 bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-4">
              <div
                class="p-3 bg-emerald-500 rounded-xl text-white group-hover:bg-emerald-600 transition-colors"
              >
                <Search class="w-6 h-6" />
              </div>
              <div>
                <h4 class="text-xl font-semibold text-gray-900">
                  Browse Courses
                </h4>
                <p class="text-sm text-emerald-600 font-medium">
                  Discover new learning opportunities
                </p>
              </div>
            </div>
            <p class="text-gray-700">
              Explore thousands of courses across various subjects and skill levels
            </p>
          </div>
          <div
            class="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <Search class="w-16 h-16" />
          </div>
        </div>

        <!-- My Courses - Featured -->
        <div
          role="presentation"
          onclick={() => goto("/dashboard/my-courses")}
          class="relative rounded-2xl border-2 border-dashed border-purple-200 p-8 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer group overflow-hidden"
        >
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-4">
              <div
                class="p-3 bg-purple-500 rounded-xl text-white group-hover:bg-purple-600 transition-colors"
              >
                <BookOpen class="w-6 h-6" />
              </div>
              <div>
                <h4 class="text-xl font-semibold text-gray-900">
                  My Courses
                </h4>
                <p class="text-sm text-purple-600 font-medium">
                  Continue where you left off
                </p>
              </div>
            </div>
            <p class="text-gray-700">
              Access your enrolled courses and track your progress
            </p>
          </div>
          <div
            class="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <BookOpen class="w-16 h-16" />
          </div>
        </div>
      </div>

      <!-- Secondary Actions Grid -->
      <div class="grid md:grid-cols-3 gap-6">
        <div
          role="presentation"
          onclick={() => goto("/dashboard/my-courses")}
          class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors"
            >
              <CircleDot class="w-5 h-5" />
            </div>
            <h4 class="text-lg font-medium text-gray-900">Learning Progress</h4>
          </div>
          <p class="text-sm text-gray-600">
            Track your learning progress and achievements
          </p>
        </div>

        <div
          role="presentation"
          onclick={() => goto("/dashboard/favorites")}
          class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-red-200 transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-200 transition-colors"
            >
              <Heart class="w-5 h-5" />
            </div>
            <h4 class="text-lg font-medium text-gray-900">Favorites</h4>
          </div>
          <p class="text-sm text-gray-600">
            Access your bookmarked courses and content
          </p>
        </div>

        <div
          role="presentation"
          onclick={() => goto("/dashboard/certificates")}
          class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-yellow-200 transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="p-2 bg-yellow-100 rounded-lg text-yellow-600 group-hover:bg-yellow-200 transition-colors"
            >
              <FileBadge2 class="w-5 h-5" />
            </div>
            <h4 class="text-lg font-medium text-gray-900">Certificates</h4>
          </div>
          <p class="text-sm text-gray-600">
            View and download your completion certificates
          </p>
        </div>

        <div
          role="presentation"
          onclick={() => goto("/dashboard/history")}
          class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-200 transition-colors"
            >
              <History class="w-5 h-5" />
            </div>
            <h4 class="text-lg font-medium text-gray-900">Learning History</h4>
          </div>
          <p class="text-sm text-gray-600">
            Review your completed courses and activities
          </p>
        </div>

        <div
          role="presentation"
          onclick={() => goto("/dashboard/achievements")}
          class="group rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="p-2 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-200 transition-colors"
            >
              <Trophy class="w-5 h-5" />
            </div>
            <h4 class="text-lg font-medium text-gray-900">Achievements</h4>
          </div>
          <p class="text-sm text-gray-600">
            View your badges and learning milestones
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
            Profile, notifications, and account preferences
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>