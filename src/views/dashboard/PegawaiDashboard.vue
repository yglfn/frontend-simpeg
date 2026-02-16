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

      <!-- Profile Card -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Avatar -->
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
            {{ (profileData.nama_lengkap || 'P').charAt(0).toUpperCase() }}
          </div>
          <!-- Info -->
          <div class="flex-1 text-center md:text-left">
            <h3 class="text-xl font-bold text-slate-800">
              {{ profileData.gelar_depan_1 }} {{ profileData.gelar_depan_2 }} {{ profileData.nama_lengkap || '-' }}{{ profileData.gelar_belakang ? ', ' + profileData.gelar_belakang : '' }}
            </h3>
            <p class="text-slate-500 mt-1">NIP: {{ profileData.nip || '-' }}</p>
            <div class="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <span v-if="pekerjaanData.jabatan" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                <i class="fas fa-briefcase"></i> {{ pekerjaanData.jabatan.nama }}
              </span>
              <span v-if="pekerjaanData.unit_kerja" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                <i class="fas fa-building"></i> {{ pekerjaanData.unit_kerja.nama }}
              </span>
              <span v-if="pekerjaanData.golongan" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                <i class="fas fa-layer-group"></i> {{ pekerjaanData.golongan.nama }}
              </span>
              <span v-if="pekerjaanData.status_kepegawaian" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                <i class="fas fa-id-card"></i> {{ pekerjaanData.status_kepegawaian.nama }}
              </span>
            </div>
          </div>
          <!-- Edit Profile Button -->
          <router-link 
            to="/pegawai/profile" 
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
          >
            <i class="fas fa-pen"></i> Edit Profil
          </router-link>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goTo('/pegawai/profile?tab=pendidikan')"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i class="fas fa-graduation-cap"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">{{ counts.pendidikan }}</h3>
          <p class="text-slate-500 text-xs mt-1">Riwayat Pendidikan</p>
        </div>

        <div 
          class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goTo('/pegawai/profile?tab=riwayat-jabatan')"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-lg group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <i class="fas fa-sitemap"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">{{ counts.riwayatJabatan }}</h3>
          <p class="text-slate-500 text-xs mt-1">Riwayat Jabatan</p>
        </div>

        <div 
          class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goTo('/pegawai/profile?tab=keluarga')"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <i class="fas fa-users"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">{{ counts.keluarga }}</h3>
          <p class="text-slate-500 text-xs mt-1">Data Keluarga</p>
        </div>

        <div 
          class="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group"
          @click="goTo('/pegawai/profile?tab=umum')"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <i class="fas fa-user-circle"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-slate-800">
            <i class="fas fa-check-circle text-green-500 text-lg"></i>
          </h3>
          <p class="text-slate-500 text-xs mt-1">Profil Lengkap</p>
        </div>
      </div>

      <!-- Two Column: Personal Info & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Personal Info -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              <i class="fas fa-info-circle"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800">Informasi Pribadi</h3>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-slate-50">
              <span class="text-sm text-slate-500">Tempat, Tgl Lahir</span>
              <span class="text-sm font-medium text-slate-800">{{ profileData.tempat_lahir || '-' }}, {{ formatDate(profileData.tanggal_lahir) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-50">
              <span class="text-sm text-slate-500">Jenis Kelamin</span>
              <span class="text-sm font-medium text-slate-800">{{ profileData.jenis_kelamin === 'L' ? 'Laki-laki' : profileData.jenis_kelamin === 'P' ? 'Perempuan' : '-' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-50">
              <span class="text-sm text-slate-500">Agama</span>
              <span class="text-sm font-medium text-slate-800">{{ profileData.agama?.nama || '-' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-50">
              <span class="text-sm text-slate-500">Status Kawin</span>
              <span class="text-sm font-medium text-slate-800">{{ profileData.status_kawin?.nama || '-' }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-sm text-slate-500">Pangkat</span>
              <span class="text-sm font-medium text-slate-800">{{ pekerjaanData.pangkat?.nama || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <i class="fas fa-bolt"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">Aksi Cepat</h3>
              <p class="text-slate-400 text-xs">Kelola data kepegawaian Anda</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3"
              @click="goTo('/pegawai/profile?tab=umum')"
            >
              <div class="w-9 h-9 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700 text-sm">Data Umum</h4>
                <p class="text-slate-500 text-xs">Lihat & edit profil</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300 text-xs"></i>
            </div>

            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3"
              @click="goTo('/pegawai/profile?tab=alamat')"
            >
              <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700 text-sm">Alamat</h4>
                <p class="text-slate-500 text-xs">Update alamat</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300 text-xs"></i>
            </div>

            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3"
              @click="goTo('/pegawai/profile?tab=pendidikan')"
            >
              <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700 text-sm">Pendidikan</h4>
                <p class="text-slate-500 text-xs">Riwayat pendidikan</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300 text-xs"></i>
            </div>

            <div 
              class="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3"
              @click="goTo('/pegawai/profile?tab=keluarga')"
            >
              <div class="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <i class="fas fa-users"></i>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700 text-sm">Keluarga</h4>
                <p class="text-slate-500 text-xs">Data anggota keluarga</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-slate-300 text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Riwayat Jabatan Terakhir -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
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
