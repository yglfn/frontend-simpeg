<template>
  <div class="admin-dashboard">
    <!-- Page Header -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="text-center md:text-left">
        <h2 class="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <i class="fas fa-user-shield text-blue-600"></i>
          Dashboard Admin
        </h2>
        <p class="text-slate-500 mt-2">
          Selamat datang, <strong class="text-slate-700">{{ userName }}</strong>! 
          Anda login sebagai <span class="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold">Admin</span>
        </p>
        <p class="text-slate-400 text-sm mt-1">Panel kontrol utama sistem kepegawaian</p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 text-slate-500 text-sm border border-slate-200">
          <i class="fas fa-calendar text-slate-400"></i>
          {{ formattedDate }}
        </div>
        
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="refreshDashboard" 
          :disabled="isLoading"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !dashboardData.total_pegawai" class="py-12 text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4"></div>
      <p class="text-slate-500">Memuat data dashboard...</p>
    </div>

    <!-- Error State -->
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-6">
      <div class="text-4xl text-red-500 mb-4">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3 class="text-lg font-semibold text-red-700 mb-2">Gagal Memuat Data</h3>
      <p class="text-red-600 mb-6">{{ errorMessage }}</p>
      <button 
        class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
        @click="refreshDashboard"
      >
        <i class="fas fa-redo"></i> Coba Lagi
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-if="!isLoading && !errorMessage || dashboardData.total_pegawai" class="dashboard-content">
      <!-- Admin Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Pegawai Card -->
        <div 
          class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goToModule('super-admin/pegawai')"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i class="fas fa-user-tie"></i>
            </div>
            <span class="text-xs font-medium bg-green-100 text-green-700 py-1 px-2 rounded-lg">
                <i class="fas fa-arrow-up mr-1"></i> Aktif
            </span>
          </div>
          <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ formatNumber(dashboardData.total_pegawai) }}</h3>
          <p class="text-slate-500 text-sm">Total Pegawai</p>
        </div>

        <!-- Unit Kerja Card -->
        <div 
          class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goToModule('super-admin/unit-kerja')"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <i class="fas fa-building"></i>
            </div>
          </div>
          <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ formatNumber(dashboardData.total_unit_kerja) }}</h3>
          <p class="text-slate-500 text-sm">Unit Kerja</p>
        </div>

        <!-- Jabatan Card -->
        <div 
          class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goToModule('super-admin/jabatan')"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <i class="fas fa-sitemap"></i>
            </div>
          </div>
          <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ formatNumber(dashboardData.total_jabatan) }}</h3>
          <p class="text-slate-500 text-sm">Jabatan & Posisi</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <i class="fas fa-bolt"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Aksi Cepat</h3>
              <p class="text-slate-500 text-sm">Jalan pintas pengelolaan sistem</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-4"
              @click="goToModule('super-admin/data-pegawai?action=add')"
            >
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <i class="fas fa-user-plus"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700">Tambah Pegawai</h4>
                <p class="text-slate-500 text-xs mt-1">Input data pegawai baru</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300"></i>
            </div>

            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-4"
              @click="goToModule('super-admin/jabatan')"
            >
              <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <i class="fas fa-sitemap"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700">Kelola Jabatan</h4>
                <p class="text-slate-500 text-xs mt-1">Update struktur organisasi</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300"></i>
            </div>

            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-4"
              @click="goToModule('super-admin/unit-kerja')"
            >
              <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <i class="fas fa-building"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700">Unit Kerja</h4>
                <p class="text-slate-500 text-xs mt-1">Manajemen unit & divisi</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300"></i>
            </div>

            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-4"
              @click="goToModule('super-admin/referensi')"
            >
              <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <i class="fas fa-database"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700">Tabel Referensi</h4>
                <p class="text-slate-500 text-xs mt-1">Lihat data master sistem</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300"></i>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <i class="fas fa-history"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-800">Aktivitas</h3>
            </div>
            <button 
              @click="fetchRecentActivities" 
              class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              :disabled="isLoadingActivities"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoadingActivities }"></i>
            </button>
          </div>

          <div v-if="recentActivities.length > 0" class="space-y-4">
            <div 
              v-for="(activity, index) in recentActivities" 
              :key="index" 
              class="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0"
            >
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm"
                :class="getActivityIconClass(activity.status)"
              >
                <i class="fas" :class="activity.icon"></i>
              </div>
              <div>
                <h5 class="text-sm font-semibold text-slate-700">{{ activity.title }}</h5>
                <p class="text-xs text-slate-500 mt-1">{{ activity.description }}</p>
                <span class="text-xs text-slate-400 mt-2 block">{{ activity.time }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-slate-400">
            <i class="fas fa-inbox text-3xl mb-2"></i>
            <p class="text-sm">Tidak ada aktivitas terbaru</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElNotification } from 'element-plus'
import api from '@/services/api' // Use the configured axios instance

const router = useRouter()
const authStore = useAuthStore()

// State
const isLoading = ref(false)
const isLoadingActivities = ref(false)
const currentDate = ref(new Date())
const errorMessage = ref('')
const dashboardData = ref({
  total_pegawai: 0,
  total_unit_kerja: 0,
  total_jabatan: 0,
})
const recentActivities = ref([])

// Computed
const user = computed(() => authStore.user)
const userName = computed(() => user.value?.nama_lengkap || user.value?.nama || 'Admin')

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Methods
const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // Using the configured API service
    const response = await api.get('/super-admin/dashboard', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const data = response.data.data
    
    // Map backend response to dashboard state
    dashboardData.value = {
      total_pegawai: data.summary.total_pegawai,
      total_unit_kerja: data.unit_kerja.total_unit_kerja,
      total_jabatan: data.jabatan.aktif, // Menggunakan Jabatan Aktif
    }

    // Map recent activities
    if (data.aktivitas_terbaru && Array.isArray(data.aktivitas_terbaru)) {
        recentActivities.value = data.aktivitas_terbaru.map(activity => ({
            icon: `fa-${activity.icon}`,
            title: activity.title,
            description: activity.description,
            time: formatTimeAgo(activity.created_at),
            status: getActivityStatus(activity.type)
        }))
    } else {
        recentActivities.value = []
    }

  } catch (error) {
    console.error('Error loading dashboard:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal terhubung ke server'
    ElMessage.error('Gagal memuat data dashboard')
  } finally {
    isLoading.value = false
    isLoadingActivities.value = false
  }
}

const fetchRecentActivities = async () => {
  // Already handled in fetchDashboardData since backend returns everything
}

const formatTimeAgo = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Baru saja'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`
    return date.toLocaleDateString('id-ID')
}

const getActivityStatus = (type) => {
    if (type === 'pegawai_baru') return 'success'
    if (type === 'riwayat_jabatan_baru') return 'warning'
    return 'info'
}

const goToModule = (path) => {
  router.push(`/${path}`)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const getActivityIconClass = (status) => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-600';
    case 'warning': return 'bg-orange-100 text-orange-600';
    case 'error': return 'bg-red-100 text-red-600';
    default: return 'bg-blue-100 text-blue-600';
  }
}

const refreshDashboard = () => {
  fetchDashboardData()
}

// Lifecycle
onMounted(() => {
  fetchDashboardData().then(() => {
    fetchRecentActivities()
  })
  
  // Timer for date/time
  setInterval(() => {
    currentDate.value = new Date()
  }, 60000)
})
</script>

<style scoped>
/* Scoped styles mainly for transition effects not covered by Tailwind utilities */
.dashboard-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
