<template>
  <div class="pegawai-dashboard">
    <!-- Page Header -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="text-center md:text-left">
        <h2 class="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
          <i class="fas fa-id-badge text-teal-600"></i>
          Dashboard Pegawai
        </h2>
        <p class="text-slate-500 mt-2">
          Selamat datang, <strong class="text-slate-700">{{ profileData.nama_lengkap || 'Pegawai' }}</strong>!
          Anda login sebagai <span class="bg-teal-100 text-teal-700 py-1 px-3 rounded-full text-xs font-semibold">Pegawai</span>
        </p>
        <p class="text-slate-400 text-sm mt-1">Panel informasi kepegawaian Anda</p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 text-slate-500 text-sm border border-slate-200">
          <i class="fas fa-calendar text-slate-400"></i>
          {{ formattedDate }}
        </div>
        
        <button 
          class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="refreshData" 
          :disabled="isLoading"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !hasData" class="py-12 text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent mb-4"></div>
      <p class="text-slate-500">Memuat data...</p>
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
        @click="refreshData"
      >
        <i class="fas fa-redo"></i> Coba Lagi
      </button>
    </div>

    <!-- Content -->
    <div v-if="(!isLoading && !errorMessage) || hasData" class="dashboard-content">

      <!-- Top Row: Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        <!-- Profile Completion Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:shadow-md transition-shadow cursor-pointer" @click="goTo('/pegawai/profile?tab=umum')">
          <div>
            <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Kelengkapan Profil</p>
            <h3 class="text-3xl font-bold flex items-baseline gap-1" :class="profileCompletion >= 80 ? 'text-teal-600' : (profileCompletion >= 50 ? 'text-amber-500' : 'text-red-500')">
              {{ profileCompletion }}<span class="text-xl">%</span>
            </h3>
            <p class="text-xs mt-2" :class="profileCompletion >= 80 ? 'text-teal-500' : 'text-amber-500'">
              <i class="fas" :class="profileCompletion >= 80 ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
              {{ profileCompletion >= 80 ? 'Profil sudah cukup lengkap' : 'Lengkapi profil Anda' }}
            </p>
          </div>
          <div class="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4" :class="profileCompletion >= 80 ? 'bg-teal-50 border-teal-100 text-teal-600' : (profileCompletion >= 50 ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-red-50 border-red-100 text-red-500')">
            <i class="fas fa-chart-pie text-2xl group-hover:scale-110 transition-transform"></i>
          </div>
        </div>

        <!-- Masa Kerja Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Masa Kerja</p>
            <h3 class="text-3xl font-bold text-indigo-600 flex items-baseline gap-1">
              {{ masaKerja.tahun }}<span class="text-base text-slate-600 font-medium">Thn</span> {{ masaKerja.bulan }}<span class="text-base text-slate-600 font-medium">Bln</span>
            </h3>
            <p class="text-xs mt-2 text-slate-400">
              <i class="fas fa-calendar-alt"></i> Dihitung dari TMT
            </p>
          </div>
          <div class="w-16 h-16 rounded-full bg-indigo-50 border-4 border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <i class="fas fa-briefcase text-2xl group-hover:scale-110 transition-transform"></i>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 grid grid-cols-2 gap-4">
           <div class="text-center p-2 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors" @click="goTo('/pegawai/profile?tab=pendidikan')">
             <div class="text-blue-600 mb-1"><i class="fas fa-graduation-cap"></i></div>
             <div class="text-xl font-bold text-slate-800">{{ counts.pendidikan }}</div>
             <div class="text-xs text-slate-500">Pendidikan</div>
           </div>
           <div class="text-center p-2 rounded-lg bg-pink-50 cursor-pointer hover:bg-pink-100 transition-colors" @click="goTo('/pegawai/profile?tab=keluarga')">
             <div class="text-pink-600 mb-1"><i class="fas fa-users"></i></div>
             <div class="text-xl font-bold text-slate-800">{{ counts.keluarga }}</div>
             <div class="text-xs text-slate-500">Keluarga</div>
           </div>
           <div class="text-center p-2 rounded-lg bg-violet-50 col-span-2 flex items-center justify-between px-4 cursor-pointer hover:bg-violet-100 transition-colors" @click="goTo('/pegawai/profile?tab=riwayat-jabatan')">
             <div class="flex items-center gap-2">
               <div class="text-violet-600"><i class="fas fa-history"></i></div>
               <div class="text-xs font-semibold text-slate-600">Riwayat Jabatan</div>
             </div>
             <div class="text-lg font-bold text-slate-800">{{ counts.riwayatJabatan }}</div>
           </div>
        </div>

      </div>

      <!-- Detail Kepegawaian Saat Ini & Riwayat -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <!-- Status Kepegawaian Saat Ini -->
        <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-0 overflow-hidden flex flex-col">
          <div class="bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white">
            <div class="flex items-center gap-3 mb-1">
              <div class="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <i class="fas fa-id-card text-lg"></i>
              </div>
              <h3 class="text-lg font-bold">Status Kepegawaian</h3>
            </div>
            <p class="text-teal-50 text-sm ml-13">Posisi saat ini</p>
          </div>
          <div class="p-6 flex-1 flex flex-col gap-5">
            <div>
              <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Jabatan Aktif</span>
              <p class="text-base font-bold text-slate-800">{{ currentJabatan?.jabatan?.nama_jabatan || pekerjaanData.jabatan?.nama || '-' }}</p>
            </div>
            <div>
              <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit Kerja</span>
              <p class="text-sm font-medium text-slate-700">{{ currentJabatan?.unit_kerja?.nama_unit || pekerjaanData.unit_kerja?.nama || '-' }}</p>
            </div>
             <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Golongan</span>
                  <p class="text-sm font-medium text-slate-700">{{ pekerjaanData.golongan?.nama || '-' }}</p>
                </div>
                <div>
                  <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</span>
                  <span class="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ pekerjaanData.status_kepegawaian?.nama || 'Aktif' }}
                  </span>
                </div>
            </div>
          </div>
          <div class="bg-slate-50 p-4 border-t border-slate-100">
             <button @click="goTo('/pegawai/profile')" class="w-full py-2 text-sm text-center font-medium text-teal-600 hover:text-teal-700 transition-colors">
               Lihat Profil Lengkap <i class="fas fa-arrow-right ml-1 text-xs"></i>
             </button>
          </div>
        </div>

        <!-- Riwayat Jabatan Terakhir -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <i class="fas fa-history"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800">Riwayat Jabatan Terakhir</h3>
          </div>
          <router-link to="/pegawai/profile?tab=riwayat-jabatan" class="text-teal-600 hover:text-teal-800 text-sm flex items-center gap-1">
            Lihat Semua <i class="fas fa-arrow-right text-xs"></i>
          </router-link>
        </div>

        <div v-if="riwayatJabatan.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Jabatan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit Kerja</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">TMT Jabatan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="rj in riwayatJabatan.slice(0, 5)" :key="rj.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-800">{{ rj.jabatan?.nama_jabatan || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ rj.unit_kerja?.nama_unit || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(rj.tmt_jabatan) }}</td>
                <td class="px-4 py-3">
                  <span 
                    class="px-2 py-0.5 text-xs font-semibold rounded-full"
                    :class="rj.is_aktif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ rj.is_aktif ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-8 text-slate-400">
          <i class="fas fa-inbox text-3xl mb-2"></i>
          <p class="text-sm">Belum ada riwayat jabatan.</p>
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
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

const { showToast } = useToast()

const router = useRouter()
const authStore = useAuthStore()

// State
const isLoading = ref(false)
const errorMessage = ref('')
const currentDate = ref(new Date())

const profileData = ref({})
const pekerjaanData = ref({})
const riwayatJabatan = ref([])
const counts = ref({
  pendidikan: 0,
  riwayatJabatan: 0,
  keluarga: 0,
})

// Analytics state
const masaKerja = ref({ tahun: 0, bulan: 0 })
const profileCompletion = ref(0)
const currentJabatan = ref(null)

// Computed
const profileId = computed(() => authStore.user?.profile_id)
const hasData = computed(() => !!profileData.value.nama_lengkap)

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const hitungMasaKerja = (tmtString) => {
  if (!tmtString) return { tahun: 0, bulan: 0 }
  const tmt = new Date(tmtString)
  if (isNaN(tmt)) return { tahun: 0, bulan: 0 }
  
  const now = new Date()
  let years = now.getFullYear() - tmt.getFullYear()
  let months = now.getMonth() - tmt.getMonth()
  
  if (months < 0) {
    years--
    months += 12
  }
  return { tahun: years, bulan: months }
}

const hitungKelengkapanProfil = (umum, pekerjaan, pendidikanCount, keluargaCount) => {
  const fieldsToCheck = [
    umum?.nip, umum?.nama_lengkap, umum?.tempat_lahir, umum?.tanggal_lahir,
    umum?.jenis_kelamin, umum?.agama_id, umum?.telepon, umum?.alamat_1_id,
    pekerjaan?.jabatan_id, pekerjaan?.unit_kerja_id, pekerjaan?.status_kepegawaian_id
  ]
  
  let filledFields = fieldsToCheck.filter(field => field !== null && field !== undefined && field !== '').length
  let totalFields = fieldsToCheck.length
  
  // Bonus items
  if (pendidikanCount > 0) { filledFields++; totalFields++; } else { totalFields++; }
  if (keluargaCount > 0) { filledFields++; totalFields++; } else { totalFields++; }
  if (umum?.foto_url) { filledFields++; totalFields++; } else { totalFields++; }
  
  return Math.round((filledFields / totalFields) * 100)
}

// Methods
const fetchAll = async () => {
  if (!profileId.value) {
    errorMessage.value = 'Profile ID tidak ditemukan. Silakan login ulang.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const id = profileId.value

    // Fetch all data in parallel
    const [umumRes, pekerjaanRes, jabatanRes, pendidikanRes, keluargaRes] = await Promise.allSettled([
      api.get(`/pegawai/profile/umum/${id}`),
      api.get(`/pegawai/profile/pekerjaan/${id}`),
      api.get(`/pegawai/profile/riwayat-jabatan/${id}`),
      api.get(`/pegawai/profile/pendidikan/${id}`),
      api.get(`/pegawai/profile/keluarga/${id}`),
    ])

    // Profile Umum
    if (umumRes.status === 'fulfilled' && umumRes.value?.data?.data) {
      profileData.value = {
        ...umumRes.value.data.data,
        nip: authStore.user?.nip || authStore.user?.username || '-',
      }
    }

    // Pekerjaan
    if (pekerjaanRes.status === 'fulfilled' && pekerjaanRes.value?.data?.data) {
      pekerjaanData.value = pekerjaanRes.value.data.data
    }

    // Riwayat Jabatan
    if (jabatanRes.status === 'fulfilled' && jabatanRes.value?.data?.data) {
      const jabatanData = jabatanRes.value.data.data
      riwayatJabatan.value = Array.isArray(jabatanData) ? jabatanData : (jabatanData?.data || [])
      counts.value.riwayatJabatan = riwayatJabatan.value.length
    }

    // Pendidikan (count)
    if (pendidikanRes.status === 'fulfilled' && pendidikanRes.value?.data?.data) {
      const pendData = pendidikanRes.value.data.data
      counts.value.pendidikan = Array.isArray(pendData) ? pendData.length : 0
    }

    // Keluarga (count)
    if (keluargaRes.status === 'fulfilled' && keluargaRes.value?.data?.data) {
      const kelData = keluargaRes.value.data.data
      counts.value.keluarga = Array.isArray(kelData) ? kelData.length : 0
    }

    // Compute Analytics
    if (pekerjaanData.value.tmt_cpns) {
       masaKerja.value = hitungMasaKerja(pekerjaanData.value.tmt_cpns)
    } else if (pekerjaanData.value.tmt_pns) {
       masaKerja.value = hitungMasaKerja(pekerjaanData.value.tmt_pns)
    }

    // Find current active job
    if (riwayatJabatan.value.length > 0) {
       currentJabatan.value = riwayatJabatan.value.find(rj => rj.is_aktif) || riwayatJabatan.value[0]
    }

    profileCompletion.value = hitungKelengkapanProfil(
      profileData.value, 
      pekerjaanData.value, 
      counts.value.pendidikan, 
      counts.value.keluarga
    )

  } catch (error) {
    console.error('Error loading pegawai dashboard:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal memuat data dashboard.'
    showToast('Gagal memuat data dashboard', 'error')
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const goTo = (path) => {
  router.push(path)
}

const refreshData = () => {
  fetchAll()
}

// Lifecycle
onMounted(() => {
  fetchAll()
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
</style>
