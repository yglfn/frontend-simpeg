<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="app-loading">
    <div class="loading-content">
      <div class="spinner"></div>
      <p>Loading application...</p>
    </div>
  </div>
  
  <!-- App content -->
  <div v-else class="app-container">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoading = ref(true)

const initializeApp = async () => {
  try {
    // Initialize auth dari localStorage atau fetch dari API
    await authStore.initializeAuth()
    
    console.log('App initialized. User:', authStore.user?.email || authStore.user?.username || 'Not logged in')
  } catch (error) {
    console.error('Error initializing app:', error)
    // Clear invalid data jika terjadi error
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initializeApp()
})
</script>

<style scoped>
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0e0e0;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-container {
  min-height: 100vh;
}
</style>