<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Navbar (Fixed Top) -->
    <Navbar />

    <div class="flex flex-1 pt-[90px]">
      <!-- New Sidebar Component -->
      <Sidebar :collapsed="sidebarCollapsed" @toggle-collapse="toggleSidebar" />

      <div 
        class="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300"
        :class="sidebarCollapsed ? 'ml-[70px]' : 'ml-[70px] md:ml-[250px]'"
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
import { ref, onMounted, onUnmounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

const sidebarCollapsed = ref(window.innerWidth <= 768);

const toggleSidebar = (state) => {
  sidebarCollapsed.value = state;
};

const checkScreenSize = () => {
  if (window.innerWidth <= 768) {
    sidebarCollapsed.value = true;
  } else {
    sidebarCollapsed.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>
