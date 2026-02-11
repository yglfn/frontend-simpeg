<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Navbar (Fixed Top) -->
    <Navbar />

    <div class="flex flex-1 pt-[90px]">
      <!-- New Sidebar Component -->
      <Sidebar :collapsed="sidebarCollapsed" @toggle-collapse="toggleSidebar" />

      <!-- Main Content -->
      <div 
        class="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300"
        :class="{ 'ml-[70px]': sidebarCollapsed, 'ml-[250px]': !sidebarCollapsed }"
      >
        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const sidebarCollapsed = ref(false);

const toggleSidebar = (state) => {
  sidebarCollapsed.value = state;
};
</script>
