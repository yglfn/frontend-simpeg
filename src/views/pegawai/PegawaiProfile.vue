<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mb-4"></div>
      <p class="text-slate-500 font-medium animate-pulse">Memuat profil pegawai...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500 ease-in-out">
      
      <!-- Profile Header -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden group">
         <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
         <div class="relative z-10 flex flex-col items-start gap-8">
            <div class="flex flex-col md:flex-row items-center gap-8 w-full border-b border-slate-100 pb-6">
                <div class="relative shrink-0">
                   <div class="w-32 h-32 rounded-xl overflow-hidden ring-4 ring-white shadow-lg bg-slate-200 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                      <img v-if="profilePhotoUrl" :src="profilePhotoUrl" alt="Profile Photo" class="w-full h-full object-cover" @error="photoError = true">
                      <span v-else class="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400 bg-slate-100">{{ formattedName?.charAt(0) || '?' }}</span>
                   </div>
                   <button @click="triggerFileInput" class="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full text-xs shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 cursor-pointer" title="Ganti Foto">
                      <i class="fas fa-camera"></i>
                   </button>
                   <input 
                      type="file" 
                      ref="fileInput" 
                      class="hidden" 
                      accept="image/*"
                      @change="handleFileUpload"
                   >
                </div>
                
                <div class="flex-1 text-center md:text-left">
                  <div class="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                     <h1 class="text-3xl font-bold text-slate-800 tracking-tight">{{ formattedName }}</h1>
                     <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                        {{ user?.role?.nama_role || user?.role?.NAMA_ROLE || 'Pegawai' }}
                     </span>
                  </div>
                  <div class="space-y-1 text-slate-500 text-sm">
                     <p class="flex items-center gap-2 justify-center md:justify-start"><i class="fas fa-id-badge text-indigo-400"></i> NIP / Nomor Identitas : <span class="font-mono font-medium text-slate-700">{{ headerData?.nip || user?.nip || '-' }}</span></p>
                  </div>
                </div>
            </div>

            <!-- Immutable Job Details Section -->
            <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                <div>
                   <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Jabatan</span>
                   <p class="text-sm font-medium text-slate-700">{{ pekerjaanData?.jabatan?.nama || '-' }}</p>
                </div>
                <div>
                   <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit Kerja</span>
                   <p class="text-sm font-medium text-slate-700">{{ pekerjaanData?.unit_kerja?.nama || '-' }}</p>
                </div>
                <div>
                   <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Jenis Pegawai</span>
                   <p class="text-sm font-medium text-slate-700">{{ pekerjaanData?.jenis_pegawai?.nama || '-' }}</p>
                </div>
                 <div>
                   <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status Kepegawaian</span>
                   <p class="text-sm font-medium text-slate-700">{{ pekerjaanData?.status_kepegawaian?.nama || '-' }}</p>
                </div>
                <div>
                   <span class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Golongan/Pangkat</span>
                   <p class="text-sm font-medium text-slate-700">{{ pekerjaanData?.golongan?.nama || '-' }} / {{ pekerjaanData?.pangkat?.nama || '-' }}</p>
                </div>
            </div>
         </div>
      </div>

       <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- Right Content: Tabs & Forms -->
        <div class="flex-1 min-w-0">
          <!-- Section Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
               <h2 class="text-xl font-bold text-slate-800">{{ currentTabInfo.label }}</h2>
               <p class="text-slate-500 text-sm mt-1">{{ currentTabInfo.description }}</p>
            </div>
          </div>

          <!-- Dynamic Component Rendering -->
          <component 
            :is="activeComponent" 
            v-if="profileId" 
            :profile-id="profileId"
          />
          <div v-else class="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
             Data profil tidak ditemukan.
          </div>

        </div>
      </div>
    
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api' // Import API

// Import Components
import DataUmum from './components/DataUmum.vue'
import AlamatPegawai from './components/AlamatPegawai.vue'
// DataPekerjaan import removed
import RiwayatJabatan from './components/RiwayatJabatan.vue'
import RiwayatPendidikan from './components/RiwayatPendidikan.vue'
import DataKeluarga from './components/DataKeluarga.vue'
import KeamananAkun from './components/KeamananAkun.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const fileInput = ref(null)

const triggerFileInput = () => {
    fileInput.value.click()
}

const uploading = ref(false)

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validasi ukuran (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB')
        return
    }

    const formData = new FormData()
    formData.append('foto', file)

    try {
        uploading.value = true
        const res = await api.post(`/pegawai/profile/umum/${profileId.value}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        
        if (res.data.success) {
            const newFotoUrl = res.data.data.foto_url
            photoError.value = false
            // Update local header data
            if (headerData.value) {
                headerData.value.foto_url = newFotoUrl
            }
            // Update auth store user so Navbar also gets updated
            if (authStore.user) {
                authStore.user.foto_url = newFotoUrl
            }
            // Persist to localStorage so it survives page refresh
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            storedUser.foto_url = newFotoUrl
            localStorage.setItem('user', JSON.stringify(storedUser))
            
            alert('Foto profil berhasil diperbarui')
        }
    } catch (e) {
        console.error('Upload failed', e)
        alert('Gagal mengunggah foto')
    } finally {
        uploading.value = false
        // Reset input
        event.target.value = ''
    }
}

const loading = ref(false)
const user = computed(() => authStore.user)
const profileId = computed(() => authStore.user?.profile_id)
const activeMainTab = ref('umum')

// Header Data State
const headerData = ref(null)
const pekerjaanData = ref(null)
const photoError = ref(false)

const profilePhotoUrl = computed(() => {
    if (photoError.value) return null
    return headerData.value?.foto_url || user.value?.foto_url || null
})

const formattedName = computed(() => {
    const d = headerData.value
    
    // 1. Try to get base name from headerData (API) or fallback to user store
    // Backend uses 'nama_lengkap', store might use 'name' or 'nama'
    let name = d?.nama_lengkap || user.value?.nama_lengkap || user.value?.name || ''
    
    // 2. If still empty, return email or default text
    if (!name) return user.value?.email || 'Nama Tidak Ditemukan'

    // 3. Add titles if available in headerData or user store
    // Check Backend keys: gelar_depan_1, gelar_depan_2, gelar_belakang
    const gDepan1 = d?.gelar_depan_1 || ''
    const gDepan2 = d?.gelar_depan_2 || ''
    const gBelakang = d?.gelar_belakang || ''

    // Combine Prefix Titles
    let prefix = ''
    if (gDepan1) prefix += `${gDepan1} `
    if (gDepan2) prefix += `${gDepan2} `
    
    // Construct Full Name
    let fullName = `${prefix}${name}`.trim()
    
    // Add Suffix Title
    if (gBelakang) fullName = `${fullName}, ${gBelakang}`
    
    return fullName
})

// Metadata for Header
const currentTabInfo = computed(() => {
   switch(activeMainTab.value) {
     case 'umum': return { label: 'Data Umum', description: 'Informasi dasar pegawai dan data pribadi.' }
     case 'alamat': return { label: 'Alamat & Kontak', description: 'Informasi tempat tinggal dan kontak.' }
     // 'pekerjaan' tab removed as it is now in header
     case 'riwayat-jabatan': return { label: 'Riwayat Jabatan', description: 'Rekam jejak jabatan pegawai.' }
     case 'pendidikan': return { label: 'Riwayat Pendidikan', description: 'Data pendidikan formal.' }
      case 'keluarga': return { label: 'Data Keluarga', description: 'Daftar anggota keluarga.' }
      case 'keamanan': return { label: 'Keamanan Akun', description: 'Pengaturan password.' }
     default: return { label: '', description: '' }
   }
})

// Map active tab to Component
const activeComponent = computed(() => {
    switch(activeMainTab.value) {
        case 'umum': return DataUmum
        case 'alamat': return AlamatPegawai
        // 'pekerjaan' case removed
        case 'riwayat-jabatan': return RiwayatJabatan
        case 'pendidikan': return RiwayatPendidikan
        case 'keluarga': return DataKeluarga
        case 'keamanan': return KeamananAkun
        default: return DataUmum
    }
})

// Tab Switching Logic
const setActiveMainTab = (key) => {
    activeMainTab.value = key
    if (route.query.tab !== key) {
        router.replace({ query: { tab: key } })
    }
}

// Fetch basic profile data for header
const loadHeaderData = async () => {
    if (!profileId.value) return
    try {
        const [resUmum, resPekerjaan] = await Promise.all([
            api.get(`/pegawai/profile/umum/${profileId.value}`),
            api.get(`/pegawai/profile/pekerjaan/${profileId.value}`)
        ])
        headerData.value = resUmum.data.data
        pekerjaanData.value = resPekerjaan.data.data
    } catch (e) {
        console.error('Error loading header data', e)
    }
}

watch(profileId, (newId) => {
    if (newId) loadHeaderData()
}, { immediate: true })

// Watch Route for Sidebar Navigation
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      setActiveMainTab(newTab)
    }
  },
  { immediate: true } 
)
</script>

<style scoped>
/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #cbd5e1;
}
</style>
