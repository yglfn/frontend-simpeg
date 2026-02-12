<template>
  <div class="pegawai-profile">
    <!-- Page Header -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <i class="fas fa-user-circle text-teal-600"></i>
            Profil Saya
          </h2>
          <p class="text-slate-500 mt-1 text-sm">Kelola data kepegawaian Anda</p>
        </div>
        <router-link to="/" class="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1">
          <i class="fas fa-arrow-left"></i> Kembali ke Dashboard
        </router-link>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 overflow-x-auto">
      <div class="flex border-b border-slate-200 min-w-max">
        <button 
          v-for="tab in tabs" :key="tab.key"
          class="tab-button px-5 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2"
          :class="activeTab === tab.key ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'"
          @click="setTab(tab.key)"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent mb-3"></div>
      <p class="text-slate-500 text-sm">Memuat data...</p>
    </div>

    <!-- Tab Content -->
    <div v-else>

      <!-- ==================== TAB: DATA UMUM ==================== -->
      <div v-if="activeTab === 'umum'" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><i class="fas fa-user"></i></div>
            <h3 class="text-lg font-bold text-slate-800">Data Umum</h3>
          </div>
          <button v-if="!editMode.umum" @click="editMode.umum = true" class="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1">
            <i class="fas fa-pen"></i> Edit
          </button>
        </div>

        <!-- View Mode -->
        <div v-if="!editMode.umum" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="field in umumFields" :key="field.key" class="flex justify-between py-2.5 border-b border-slate-50">
            <span class="text-sm text-slate-500">{{ field.label }}</span>
            <span class="text-sm font-medium text-slate-800">{{ getUmumValue(field) }}</span>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-slate-700 block mb-1">Jenis Kelamin</label>
              <select v-model="umumForm.jenis_kelamin" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 block mb-1">Agama</label>
              <select v-model="umumForm.agama_id" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                <option v-for="a in refAgama" :key="a.id" :value="a.id">{{ a.nama_agama }}</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 block mb-1">Status Kawin</label>
              <select v-model="umumForm.status_kawin_id" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                <option v-for="s in refStatusKawin" :key="s.id" :value="s.id">{{ s.status }}</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="saveUmum" :disabled="saving" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i> Simpan
            </button>
            <button @click="cancelEditUmum" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium">Batal</button>
          </div>
        </div>
      </div>

      <!-- ==================== TAB: ALAMAT ==================== -->
      <div v-if="activeTab === 'alamat'" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fas fa-map-marker-alt"></i></div>
          <h3 class="text-lg font-bold text-slate-800">Data Alamat</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Alamat Utama -->
          <div class="bg-slate-50 rounded-lg p-5 border border-slate-100">
            <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <i class="fas fa-home text-blue-500"></i> Alamat Utama (KTP)
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Desa/Kel.</span><span class="text-slate-800">{{ alamatData.alamat_utama?.desa_kelurahan || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Kecamatan</span><span class="text-slate-800">{{ alamatData.alamat_utama?.kecamatan || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Kab/Kota</span><span class="text-slate-800">{{ alamatData.alamat_utama?.kabupaten_kota || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Provinsi</span><span class="text-slate-800">{{ alamatData.alamat_utama?.provinsi || '-' }}</span></div>
            </div>
          </div>

          <!-- Alamat Domisili -->
          <div class="bg-slate-50 rounded-lg p-5 border border-slate-100">
            <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <i class="fas fa-map-pin text-emerald-500"></i> Alamat Domisili
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Desa/Kel.</span><span class="text-slate-800">{{ alamatData.alamat_domisili?.desa_kelurahan || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Kecamatan</span><span class="text-slate-800">{{ alamatData.alamat_domisili?.kecamatan || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Kab/Kota</span><span class="text-slate-800">{{ alamatData.alamat_domisili?.kabupaten_kota || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Provinsi</span><span class="text-slate-800">{{ alamatData.alamat_domisili?.provinsi || '-' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center gap-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <i class="fas fa-envelope text-slate-400"></i>
            <div>
              <p class="text-xs text-slate-500">Email</p>
              <p class="text-sm font-medium text-slate-800">{{ alamatData.email || '-' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <i class="fas fa-phone text-slate-400"></i>
            <div>
              <p class="text-xs text-slate-500">Telepon</p>
              <p class="text-sm font-medium text-slate-800">{{ alamatData.telepon || '-' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
            <i class="fas fa-mail-bulk text-slate-400"></i>
            <div>
              <p class="text-xs text-slate-500">Kode Pos</p>
              <p class="text-sm font-medium text-slate-800">{{ alamatData.kode_pos || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== TAB: PEKERJAAN ==================== -->
      <div v-if="activeTab === 'pekerjaan'" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><i class="fas fa-briefcase"></i></div>
          <div>
            <h3 class="text-lg font-bold text-slate-800">Data Pekerjaan</h3>
            <p class="text-xs text-slate-400">Data ini hanya bisa diubah oleh admin</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="field in pekerjaanFields" :key="field.key" class="flex justify-between py-3 border-b border-slate-50">
            <span class="text-sm text-slate-500">{{ field.label }}</span>
            <span class="text-sm font-medium text-slate-800">{{ getPekerjaanValue(field.key) }}</span>
          </div>
        </div>
      </div>

      <!-- ==================== TAB: PENDIDIKAN ==================== -->
      <div v-if="activeTab === 'pendidikan'" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><i class="fas fa-graduation-cap"></i></div>
            <h3 class="text-lg font-bold text-slate-800">Riwayat Pendidikan</h3>
          </div>
          <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">{{ pendidikanList.length }} data</span>
        </div>

        <div v-if="pendidikanList.length > 0" class="space-y-4">
          <div v-for="item in pendidikanList" :key="item.id" class="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-slate-800">{{ item.nama_institusi || '-' }}</h4>
                <p class="text-sm text-slate-600 mt-1">{{ item.jenjang || '-' }} — {{ item.jurusan || '-' }}</p>
                <p class="text-xs text-slate-400 mt-1">Tahun Lulus: {{ item.tahun_lulus || '-' }}</p>
                <p v-if="item.no_ijazah" class="text-xs text-slate-400">No. Ijazah: {{ item.no_ijazah }}</p>
              </div>
              <div class="text-right">
                <span v-if="item.gelar" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  {{ item.gelar }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-10 text-slate-400">
          <i class="fas fa-graduation-cap text-4xl mb-3"></i>
          <p class="text-sm">Belum ada data riwayat pendidikan.</p>
        </div>
      </div>

      <!-- ==================== TAB: KELUARGA ==================== -->
      <div v-if="activeTab === 'keluarga'" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><i class="fas fa-users"></i></div>
            <h3 class="text-lg font-bold text-slate-800">Data Keluarga</h3>
          </div>
          <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">{{ keluargaList.length }} anggota</span>
        </div>

        <div v-if="keluargaList.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hubungan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tgl Lahir</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pekerjaan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="k in keluargaList" :key="k.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-800 font-medium">{{ k.nama || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700">
                    {{ k.hubungan || '-' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(k.tanggal_lahir) }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ k.pekerjaan || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-10 text-slate-400">
          <i class="fas fa-users text-4xl mb-3"></i>
          <p class="text-sm">Belum ada data keluarga.</p>
        </div>
      </div>

      <!-- ==================== TAB: RIWAYAT JABATAN ==================== -->
      <div v-if="activeTab === 'riwayat-jabatan'" class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center"><i class="fas fa-sitemap"></i></div>
            <div>
              <h3 class="text-lg font-bold text-slate-800">Riwayat Jabatan</h3>
              <p class="text-xs text-slate-400">Data ini hanya bisa diubah oleh admin</p>
            </div>
          </div>
          <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">{{ riwayatJabatanList.length }} data</span>
        </div>

        <div v-if="riwayatJabatanList.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Jabatan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit Kerja</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">TMT Jabatan</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">No. SK</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="rj in riwayatJabatanList" :key="rj.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-800 font-medium">{{ rj.jabatan?.nama_jabatan || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ rj.unit_kerja?.nama_unit || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(rj.tmt_jabatan) }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ rj.no_sk || '-' }}</td>
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

        <div v-else class="text-center py-10 text-slate-400">
          <i class="fas fa-sitemap text-4xl mb-3"></i>
          <p class="text-sm">Belum ada data riwayat jabatan.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Tabs
const tabs = [
  { key: 'umum', label: 'Data Umum', icon: 'fas fa-user' },
  { key: 'alamat', label: 'Alamat', icon: 'fas fa-map-marker-alt' },
  { key: 'pekerjaan', label: 'Pekerjaan', icon: 'fas fa-briefcase' },
  { key: 'pendidikan', label: 'Pendidikan', icon: 'fas fa-graduation-cap' },
  { key: 'keluarga', label: 'Keluarga', icon: 'fas fa-users' },
  { key: 'riwayat-jabatan', label: 'Riwayat Jabatan', icon: 'fas fa-sitemap' },
]

const activeTab = ref('umum')
const loading = ref(false)
const saving = ref(false)
const profileId = ref(authStore.user?.profile_id)

// Data stores
const umumData = ref({})
const alamatData = ref({})
const pekerjaanData = ref({})
const pendidikanList = ref([])
const keluargaList = ref([])
const riwayatJabatanList = ref([])

// Edit mode
const editMode = reactive({ umum: false })
const umumForm = reactive({ jenis_kelamin: '', agama_id: null, status_kawin_id: null })

// Reference data for dropdowns
const refAgama = ref([])
const refStatusKawin = ref([])

// Field definitions
const umumFields = [
  { key: 'nama_lengkap', label: 'Nama Lengkap' },
  { key: 'gelar_depan_1', label: 'Gelar Depan 1' },
  { key: 'gelar_depan_2', label: 'Gelar Depan 2' },
  { key: 'gelar_belakang', label: 'Gelar Belakang' },
  { key: 'tempat_lahir', label: 'Tempat Lahir' },
  { key: 'tanggal_lahir', label: 'Tanggal Lahir', format: 'date' },
  { key: 'jenis_kelamin', label: 'Jenis Kelamin', format: 'gender' },
  { key: 'agama', label: 'Agama', format: 'ref' },
  { key: 'status_kawin', label: 'Status Kawin', format: 'ref' },
]

const pekerjaanFields = [
  { key: 'jenis_pegawai', label: 'Jenis Pegawai' },
  { key: 'status_kepegawaian', label: 'Status Kepegawaian' },
  { key: 'golongan', label: 'Golongan' },
  { key: 'pangkat', label: 'Pangkat' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'unit_kerja', label: 'Unit Kerja' },
]

// Methods
const setTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: { tab } })
  loadTabData(tab)
}

const loadTabData = async (tab) => {
  if (!profileId.value) return
  const id = profileId.value

  loading.value = true
  try {
    switch (tab) {
      case 'umum':
        if (!umumData.value.id) {
          const res = await api.get(`/pegawai/profile/umum/${id}`)
          umumData.value = res.data.data || {}
        }
        break
      case 'alamat':
        if (!alamatData.value.email) {
          const res = await api.get(`/pegawai/profile/alamat/${id}`)
          alamatData.value = res.data.data || {}
        }
        break
      case 'pekerjaan':
        if (!pekerjaanData.value.jabatan) {
          const res = await api.get(`/pegawai/profile/pekerjaan/${id}`)
          pekerjaanData.value = res.data.data || {}
        }
        break
      case 'pendidikan':
        if (!pendidikanList.value.length) {
          const res = await api.get(`/pegawai/profile/pendidikan/${id}`)
          pendidikanList.value = res.data.data || []
        }
        break
      case 'keluarga':
        if (!keluargaList.value.length) {
          const res = await api.get(`/pegawai/profile/keluarga/${id}`)
          keluargaList.value = res.data.data || []
        }
        break
      case 'riwayat-jabatan':
        if (!riwayatJabatanList.value.length) {
          const res = await api.get(`/pegawai/profile/riwayat-jabatan/${id}`)
          const data = res.data.data
          riwayatJabatanList.value = Array.isArray(data) ? data : (data?.data || [])
        }
        break
    }
  } catch (error) {
    console.error(`Error loading ${tab}:`, error)
    ElMessage.error(`Gagal memuat data ${tab}`)
  } finally {
    loading.value = false
  }
}

const getUmumValue = (field) => {
  const val = umumData.value[field.key]
  if (field.format === 'date') return formatDate(val)
  if (field.format === 'gender') return val === 'L' ? 'Laki-laki' : val === 'P' ? 'Perempuan' : '-'
  if (field.format === 'ref') return val?.nama || '-'
  return val || '-'
}

const getPekerjaanValue = (key) => {
  const val = pekerjaanData.value[key]
  return val?.nama || '-'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

const cancelEditUmum = () => {
  editMode.umum = false
  // Reset form to current data
  umumForm.jenis_kelamin = umumData.value.jenis_kelamin || ''
  umumForm.agama_id = umumData.value.agama?.id || null
  umumForm.status_kawin_id = umumData.value.status_kawin?.id || null
}

const saveUmum = async () => {
  saving.value = true
  try {
    await api.put(`/pegawai/profile/umum/${profileId.value}`, {
      jenis_kelamin: umumForm.jenis_kelamin,
      agama_id: umumForm.agama_id,
      status_kawin_id: umumForm.status_kawin_id,
    })
    ElMessage.success('Profil berhasil diperbarui')
    editMode.umum = false
    // Reload data
    const res = await api.get(`/pegawai/profile/umum/${profileId.value}`)
    umumData.value = res.data.data || {}
  } catch (error) {
    console.error('Save error:', error)
    ElMessage.error(error.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    saving.value = false
  }
}

const loadReferenceData = async () => {
  try {
    const [agamaRes, statusKawinRes] = await Promise.allSettled([
      api.get('/super-admin/referensi/agama'),
      api.get('/super-admin/referensi/status-kawin'),
    ])
    if (agamaRes.status === 'fulfilled') refAgama.value = agamaRes.value?.data?.data || []
    if (statusKawinRes.status === 'fulfilled') refStatusKawin.value = statusKawinRes.value?.data?.data || []
  } catch (error) {
    console.warn('Failed to load reference data:', error)
  }
}

// Watch edit mode to populate form
watch(() => editMode.umum, (val) => {
  if (val) {
    umumForm.jenis_kelamin = umumData.value.jenis_kelamin || ''
    umumForm.agama_id = umumData.value.agama?.id || null
    umumForm.status_kawin_id = umumData.value.status_kawin?.id || null
    if (!refAgama.value.length) loadReferenceData()
  }
})

// Watch route query tab changes (from sidebar navigation)
watch(() => route.query.tab, (newTab) => {
  if (newTab && tabs.some(t => t.key === newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
    loadTabData(newTab)
  }
})

// Lifecycle
onMounted(() => {
  // Check for tab query param
  const tabParam = route.query.tab
  if (tabParam && tabs.some(t => t.key === tabParam)) {
    activeTab.value = tabParam
  }
  loadTabData(activeTab.value)
})
</script>

<style scoped>
.pegawai-profile {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-button {
  transition: all 0.2s ease;
}
</style>
