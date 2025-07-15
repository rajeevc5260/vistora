<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Switch } from "$lib/components/ui/switch";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { Badge } from "$lib/components/ui/badge";
    import {
      User,
      CreditCard,
      Bell,
      Shield,
      Save,
      Edit,
      Eye,
      EyeOff,
      Mail,
      Phone,
      Globe,
      Trash2,
      Download,
      Upload
    } from "lucide-svelte";
    import type { PageProps } from "./$types";
    import {
      Avatar,
      AvatarImage,
      AvatarFallback,
    } from "$lib/components/ui/avatar";
    import { goto } from "$app/navigation";
  
    let { data }: PageProps = $props();
    const user = data.session?.user;
  
    // Form states
    let profileForm = {
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
      website: "",
      phone: "",
      location: ""
    };
  
    let notificationSettings = {
      emailNotifications: true,
      courseUpdates: true,
      studentEnrollments: true,
      marketingEmails: false,
      weeklyReports: true
    };
  
    let billingInfo = {
      plan: "Pro",
      billingCycle: "monthly",
      nextBilling: "2024-08-15"
    };
  
    let showCurrentPassword = $state(false)
    let showNewPassword =  $state(false)
    let passwordForm = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    };
  
    function handleProfileSave() {
      // Handle profile save logic
      console.log("Profile saved:", profileForm);
    }
  
    function handleNotificationSave() {
      // Handle notification save logic
      console.log("Notifications saved:", notificationSettings);
    }
  
    function handlePasswordChange() {
      // Handle password change logic
      console.log("Password change requested");
    }
  
    function handleAccountDelete() {
      // Handle account deletion logic
      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        console.log("Account deletion requested");
      }
    }
  </script>
  
  <div class="max-w-7xl mx-auto space-y-8 px-4 lg:px-0">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-600 mt-1">
          Manage your account preferences and configuration
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <Button 
          variant="outline"
          class="gap-2"
          onclick={() => goto("/dashboard")}
        >
          Back to Dashboard
        </Button>
        
        <Button 
          onclick={handleProfileSave}
          class="gap-2"
        >
          <Save class="w-5 h-5" />
          Save Changes
        </Button>
      </div>
    </div>
  
    <!-- Settings Content -->
    <div class="grid lg:grid-cols-4 gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1">
        <Card class="sticky top-6">
          <CardContent class="p-6">
            <nav class="space-y-2">
              <a href="#profile" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                <User class="w-4 h-4" />
                Profile
              </a>
              <a href="#billing" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <CreditCard class="w-4 h-4" />
                Billing
              </a>
              <a href="#notifications" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Bell class="w-4 h-4" />
                Notifications
              </a>
              <a href="#security" class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Shield class="w-4 h-4" />
                Security
              </a>
            </nav>
          </CardContent>
        </Card>
      </div>
  
      <!-- Main Content -->
      <div class="lg:col-span-3 space-y-8">
        <!-- Profile Section -->
        <Card id="profile">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-lg text-blue-600">
                <User class="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Avatar Section -->
            <div class="flex items-center gap-6">
              <div class="relative">
                <Avatar class="w-20 h-20">
                  <AvatarImage
                    src={user?.image ?? ""}
                    alt={user?.name ?? "User"}
                  />
                  <AvatarFallback class="text-xl">
                    {user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <button class="absolute -bottom-1 -right-1 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                  <Edit class="w-3 h-3" />
                </button>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Profile Picture</h3>
                <p class="text-sm text-gray-600 mb-2">JPG, PNG or GIF. Max size 2MB.</p>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" class="gap-2">
                    <Upload class="w-4 h-4" />
                    Upload
                  </Button>
                  <Button variant="outline" size="sm" class="gap-2">
                    <Trash2 class="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
  
            <!-- Profile Form -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  bind:value={profileForm.name}
                  placeholder="Enter your full name"
                />
              </div>
  
              <div class="space-y-2">
                <Label for="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  bind:value={profileForm.email}
                  placeholder="Enter your email"
                />
              </div>
  
              <div class="space-y-2">
                <Label for="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  bind:value={profileForm.phone}
                  placeholder="Enter your phone number"
                />
              </div>
  
              <div class="space-y-2">
                <Label for="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  bind:value={profileForm.location}
                  placeholder="Enter your location"
                />
              </div>
  
              <div class="md:col-span-2 space-y-2">
                <Label for="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  bind:value={profileForm.website}
                  placeholder="https://your-website.com"
                />
              </div>
  
              <div class="md:col-span-2 space-y-2">
                <Label for="bio">Bio</Label>
                <Textarea
                  id="bio"
                  bind:value={profileForm.bio}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
  
        <!-- Billing Section -->
        <Card id="billing">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-100 rounded-lg text-green-600">
                <CreditCard class="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription and payment methods</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Current Plan -->
            <Card class="bg-green-50 border-green-200">
              <CardContent class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-medium text-green-900">Current Plan</h3>
                      <Badge variant="secondary" class="bg-green-100 text-green-800">{billingInfo.plan}</Badge>
                    </div>
                    <p class="text-sm text-green-700">
                      Next billing: {billingInfo.nextBilling} • {billingInfo.billingCycle}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
  
            <!-- Payment Methods -->
            <div>
              <h3 class="font-medium text-gray-900 mb-4">Payment Methods</h3>
              <div class="space-y-3">
                <Card>
                  <CardContent class="p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-5 bg-blue-600 rounded"></div>
                        <div>
                          <p class="font-medium text-gray-900">•••• •••• •••• 4242</p>
                          <p class="text-sm text-gray-600">Expires 12/27</p>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Button variant="outline" class="mt-3 gap-2">
                <CreditCard class="w-4 h-4" />
                Add Payment Method
              </Button>
            </div>
  
            <!-- Billing History -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-gray-900">Billing History</h3>
                <Button variant="outline" size="sm" class="gap-2">
                  <Download class="w-4 h-4" />
                  Download All
                </Button>
              </div>
              <div class="space-y-2">
                <Card>
                  <CardContent class="p-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-gray-900">Pro Plan - July 2024</p>
                        <p class="text-sm text-gray-600">Paid on July 15, 2024</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="font-medium text-gray-900">$29.00</span>
                        <Button variant="outline" size="sm">
                          <Download class="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
  
        <!-- Notifications Section -->
        <Card id="notifications">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Bell class="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Email Notifications -->
            <div>
                <h3 class="font-medium text-gray-900 mb-4">Email Notifications</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900">General Notifications</p>
                      <p class="text-sm text-gray-600">Receive email notifications for important updates</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" bind:checked={notificationSettings.emailNotifications} class="sr-only peer" />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
    
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900">Course Updates</p>
                      <p class="text-sm text-gray-600">Get notified when students interact with your courses</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" bind:checked={notificationSettings.courseUpdates} class="sr-only peer" />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
    
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900">Student Enrollments</p>
                      <p class="text-sm text-gray-600">Receive notifications when new students enroll</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" bind:checked={notificationSettings.studentEnrollments} class="sr-only peer" />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
    
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900">Weekly Reports</p>
                      <p class="text-sm text-gray-600">Get weekly analytics and performance reports</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" bind:checked={notificationSettings.weeklyReports} class="sr-only peer" />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
    
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900">Marketing Emails</p>
                      <p class="text-sm text-gray-600">Receive updates about new features and promotions</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" bind:checked={notificationSettings.marketingEmails} class="sr-only peer" />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
            </div>
  
            <Separator />
  
            <div class="flex justify-end">
              <Button onclick={handleNotificationSave} class="gap-2">
                <Save class="w-4 h-4" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
  
        <!-- Security Section -->
        <Card id="security">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-100 rounded-lg text-red-600">
                <Shield class="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Change Password -->
            <div>
              <h3 class="font-medium text-gray-900 mb-4">Change Password</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="current-password">Current Password</Label>
                  <div class="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      bind:value={passwordForm.currentPassword}
                      placeholder="Enter current password"
                      class="pr-10"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onclick={() => showCurrentPassword = !showCurrentPassword}
                    >
                      {#if showCurrentPassword}
                        <EyeOff class="w-5 h-5 text-gray-400" />
                      {:else}
                        <Eye class="w-5 h-5 text-gray-400" />
                      {/if}
                    </button>
                  </div>
                </div>
  
                <div class="space-y-2">
                  <Label for="new-password">New Password</Label>
                  <div class="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      bind:value={passwordForm.newPassword}
                      placeholder="Enter new password"
                      class="pr-10"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onclick={() => showNewPassword = !showNewPassword}
                    >
                      {#if showNewPassword}
                        <EyeOff class="w-5 h-5 text-gray-400" />
                      {:else}
                        <Eye class="w-5 h-5 text-gray-400" />
                      {/if}
                    </button>
                  </div>
                </div>
  
                <div class="space-y-2">
                  <Label for="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    bind:value={passwordForm.confirmPassword}
                    placeholder="Confirm new password"
                  />
                </div>
  
                <Button onclick={handlePasswordChange} class="gap-2">
                  <Save class="w-4 h-4" />
                  Update Password
                </Button>
              </div>
            </div>
  
            <Separator />
  
            <!-- Two-Factor Authentication -->
            <Card class="bg-yellow-50 border-yellow-200">
              <CardContent class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-yellow-900">Two-Factor Authentication</h3>
                    <p class="text-sm text-yellow-700">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
  
            <!-- Danger Zone -->
            <Card class="bg-red-50 border-red-200">
              <CardContent class="p-4">
                <h3 class="font-medium text-red-900 mb-2">Danger Zone</h3>
                <p class="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button 
                  variant="outline" 
                  onclick={handleAccountDelete}
                  class="gap-2 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 class="w-4 h-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>