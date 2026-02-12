<template>
  <div v-if="isPegawai">
    <PegawaiDashboard />
  </div>
  <div v-else class="admin-dashboard">
    <!-- Page Header -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="text-center md:text-left">
        <h2 class="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <i class="fas fa-user-shield text-blue-600"></i>
          Dashboard Super Admin
        </h2>
        <p class="text-slate-500 mt-2">
          Selamat datang, 
          Anda login sebagai <span class="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold">Super Admin</span>
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
    <div v-if="isLoading && !hasData" class="py-12 text-center">
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
    <div v-if="(!isLoading && !errorMessage) || hasData" class="dashboard-content">

      <!-- ========== ROW 1: Summary Cards (4 cards) ========== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Pegawai -->
        <div 
          class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goToModule('super-admin/data-pegawai')"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i class="fas fa-users"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatNumber(dashboardData.total_pegawai) }}</h3>
          <p class="text-slate-500 text-xs mt-1">Total Pegawai</p>
        </div>

        <!-- Pegawai Aktif -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md group">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <i class="fas fa-user-check"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatNumber(dashboardData.pegawai_aktif) }}</h3>
          <p class="text-slate-500 text-xs mt-1">Pegawai Aktif</p>
        </div>

        <!-- Unit Kerja -->
        <div 
          class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goToModule('super-admin/unit-kerja')"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <i class="fas fa-building"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatNumber(dashboardData.total_unit_kerja) }}</h3>
          <p class="text-slate-500 text-xs mt-1">Unit Kerja</p>
        </div>

        <!-- Total Riwayat -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md group">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-lg group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <i class="fas fa-file-alt"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">{{ formatNumber(dashboardData.total_riwayat) }}</h3>
          <p class="text-slate-500 text-xs mt-1">Total Riwayat</p>
        </div>
      </div>

      <!-- ========== ROW 2: Jenis Kelamin & Unit Kerja ========== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Jenis Kelamin -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <i class="fas fa-venus-mars"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800">Jenis Kelamin</h3>
          </div>
          <div v-if="chartData.pegawai_per_jenis_kelamin?.length" class="space-y-4">
            <div v-for="(item, idx) in chartData.pegawai_per_jenis_kelamin" :key="idx">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-600">{{ item.label }}</span>
                <span class="font-semibold text-slate-800">{{ item.value }}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5">
                <div 
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="item.label === 'Laki-laki' ? 'bg-blue-500' : 'bg-pink-500'"
                  :style="{ width: percentOf(item.value, totalFromChart(chartData.pegawai_per_jenis_kelamin)) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-slate-400 mt-1">{{ percentOf(item.value, totalFromChart(chartData.pegawai_per_jenis_kelamin)) }}%</p>
            </div>
          </div>
          <div v-else class="text-center py-6 text-slate-400">
            <i class="fas fa-chart-bar text-2xl mb-2"></i>
            <p class="text-sm">Belum ada data</p>
          </div>
        </div>

        <!-- Distribusi Unit Kerja -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <i class="fas fa-building"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">Distribusi Unit Kerja</h3>
              <p class="text-xs text-slate-400">Jumlah pegawai per unit</p>
            </div>
          </div>
          <div v-if="topUnitKerja.length" class="space-y-3 max-h-80 overflow-y-auto pr-2">
            <div v-for="(unit, idx) in topUnitKerja" :key="idx" class="flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 truncate" :title="unit.nama_unit">{{ unit.nama_unit }}</span>
                  <span class="font-semibold text-slate-800 shrink-0 ml-2">{{ unit.total_pegawai }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: percentOf(unit.total_pegawai, maxUnitKerjaPegawai) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-slate-400">
            <i class="fas fa-building text-2xl mb-2"></i>
            <p class="text-sm">Belum ada data unit kerja</p>
          </div>
        </div>
      </div>

      <!-- ========== ROW 3: Admin Stats & Quick Actions + Activities ========== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Admin Stats + Quick Actions -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Admin Overview -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6" v-if="adminStats.total > 0">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                <i class="fas fa-user-shield"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-800">Manajemen Admin</h3>
                <p class="text-xs text-slate-400">Statistik admin sistem</p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-sky-50 rounded-lg p-4 text-center border border-sky-100">
                <p class="text-2xl font-bold text-sky-700">{{ adminStats.total }}</p>
                <p class="text-xs text-sky-600 mt-1">Total Admin</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                <p class="text-2xl font-bold text-green-700">{{ adminStats.aktif }}</p>
                <p class="text-xs text-green-600 mt-1">Aktif</p>
              </div>
              <div class="bg-red-50 rounded-lg p-4 text-center border border-red-100">
                <p class="text-2xl font-bold text-red-600">{{ adminStats.non_aktif }}</p>
                <p class="text-xs text-red-500 mt-1">Non-Aktif</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
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
              @click="refreshDashboard" 
              class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              :disabled="isLoading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
            </button>
          </div>

          <div v-if="recentActivities.length > 0" class="space-y-4 max-h-96 overflow-y-auto pr-1">
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
import { ElMessage } from 'element-plus'
import api from '@/services/api'
import PegawaiDashboard from '@/views/dashboard/PegawaiDashboard.vue'

const router = useRouter()
const authStore = useAuthStore()

// Role detection
const isPegawai = computed(() => {
  const roleId = authStore.user?.role_id
  return roleId === 3
})

// State
const isLoading = ref(false)
const currentDate = ref(new Date())
const errorMessage = ref('')

const dashboardData = ref({
  total_pegawai: 0,
  pegawai_aktif: 0,
  total_unit_kerja: 0,
  total_riwayat: 0,
})

const adminStats = ref({ total: 0, aktif: 0, non_aktif: 0 })
const chartData = ref({})
const recentActivities = ref([])

// Computed
const user = computed(() => authStore.user)
const userName = computed(() => user.value?.nama_lengkap || user.value?.nama || 'Admin')
const hasData = computed(() => dashboardData.value.total_pegawai > 0 || dashboardData.value.total_unit_kerja > 0)

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const topUnitKerja = computed(() => {
  const units = chartData.value.jabatan_aktif_per_unit_kerja || []
  // Or use unit_kerja_pegawai from unit_kerja stats
  // Fallback to unit_kerja data if chart doesn't have it
  return units.length ? units.sort((a, b) => b.value - a.value).slice(0, 10).map(item => ({
    nama_unit: item.label,
    total_pegawai: item.value,
  })) : []
})

const maxUnitKerjaPegawai = computed(() => {
  if (!topUnitKerja.value.length) return 1
  return Math.max(...topUnitKerja.value.map(u => u.total_pegawai), 1)
})

// Methods
const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const response = await api.get('/super-admin/dashboard', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const data = response.data.data
    
    // Map summary
    dashboardData.value = {
      total_pegawai: data.summary?.total_pegawai || 0,
      pegawai_aktif: data.summary?.pegawai_aktif || 0,
      total_unit_kerja: data.unit_kerja?.total_unit_kerja || 0,
      total_riwayat: (data.summary?.total_riwayat_jabatan || 0) + (data.summary?.total_riwayat_pendidikan || 0),
    }

    // Map admin statistics
    adminStats.value = {
      total: data.admin?.total || 0,
      aktif: data.admin?.aktif || 0,
      non_aktif: data.admin?.non_aktif || 0,
    }

    // Map chart data
    chartData.value = data.chart_data || {}

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
  }
}

// Helper functions
const percentOf = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

const totalFromChart = (chartArray) => {
  if (!chartArray || !Array.isArray(chartArray)) return 0
  return chartArray.reduce((sum, item) => sum + (item.value || 0), 0)
}



const formatTimeAgo = (dateString) => {
    if (!dateString) return ''
    // Laravel returns datetime like "2026-02-11 10:30:00" without timezone info.
    // new Date("2026-02-11 10:30:00") parses as UTC in some browsers,
    // but the server time is already in local timezone (WIB/UTC+7).
    // Replace space with 'T' to ensure consistent parsing, and treat as local time.
    let normalized = dateString.replace(' ', 'T')
    // Only add timezone offset if the string doesn't already have one
    if (!/[Z+\-]\d{2}/.test(normalized) && !normalized.endsWith('Z')) {
      // No timezone info — treat as local time by NOT appending Z
      // new Date("2026-02-11T10:30:00") without Z is parsed as local time
    }
    const date = new Date(normalized)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 0) return 'Baru saja' // future dates (clock skew)
    if (diffInSeconds < 60) return 'Baru saja'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`
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
  if (num === undefined || num === null) return '0'
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
  fetchDashboardData()
  
  setInterval(() => {
    currentDate.value = new Date()
  }, 60000)
})
</script>

<style scoped>
.dashboard-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom scrollbar for overflow areas */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
