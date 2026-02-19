<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Data Keluarga
            </h3>
            <div class="flex items-center gap-3">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{{ list.length }} Anggota</span>
                <button @click="openModal()" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Tambah
                </button>
            </div>
        </div>

        <!-- List Content -->
        <div class="p-6">
            <div v-if="loading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            
            <div v-else-if="list.length > 0" class="space-y-4">
                <div v-for="k in list" :key="k.id" class="relative pl-4 pr-4 py-5 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                    <div class="flex items-start gap-4 pr-12">
                        <!-- Icon / Avatar Placeholder -->
                        <div class="flex flex-col items-center gap-1 shrink-0 min-w-[3.5rem]">
                            <div class="w-14 h-14 rounded-xl bg-blue-50 md:bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 md:border-transparent">
                                {{ getInitials(k.nama) }}
                            </div>
                        </div>
                        
                        <div class="flex-1 min-w-0 pt-1">
                            <!-- Nama & Hubungan -->
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <h4 class="font-bold text-slate-800 text-lg leading-tight">
                                    {{ k.nama }}
                                </h4>
                                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                                    {{ formatHubungan(k.hubungan) }}
                                </span>
                                <span v-if="k.tertanggung" class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100" title="Tertanggung">
                                    Tertanggung
                                </span>
                            </div>
                            
                            <!-- Pekerjaan -->
                            <p class="text-sm font-medium text-slate-600 mb-3 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                {{ k.pekerjaan || 'Tidak ada data pekerjaan' }}
                            </p>

                            <!-- Metadata Grid -->
                            <div class="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                                <div class="flex items-center gap-1.5">
                                    <i class="fas fa-venus-mars text-slate-400"></i>
                                    <span>{{ k.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <i class="fas fa-calendar-alt text-slate-400"></i>
                                    <span>{{ k.tempat_lahir ? `${k.tempat_lahir}, ` : '' }}{{ formatDate(k.tanggal_lahir) }}</span>
                                </div>
                                <div v-if="k.keterangan" class="flex items-center gap-1.5">
                                    <i class="fas fa-info-circle text-slate-400"></i>
                                    <span class="italic truncate max-w-[200px]">{{ k.keterangan }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-3">
                        <button @click="openModal(k)" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1" title="Edit">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button @click="confirmDelete(k)" class="text-xs font-semibold text-red-400 hover:text-red-600 hover:underline flex items-center gap-1" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
            
            <div v-else class="p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Belum ada data keluarga tercatat.</span>
            </div>
        </div>

        <!-- Modal Delete Keluarga -->
        <Teleport to="body">
            <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteModal = false"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <i class="fas fa-trash-alt text-red-500"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800">Hapus Data Keluarga</h3>
                            <p class="text-sm text-slate-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>
                    <p class="text-sm text-slate-600 mb-5">Yakin ingin menghapus data <span class="font-semibold">{{ deleteTarget?.nama }}</span>?</p>
                    <div class="flex gap-3 justify-end">
                        <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Batal</button>
                        <button @click="executeDelete" :disabled="isDeleting" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                            <span v-if="isDeleting" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                            {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Modal Form Keluarga -->
        <Teleport to="body">
            <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeModal">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div class="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                        <h3 class="text-lg font-bold text-slate-800">
                            {{ isEditing ? 'Edit Data Keluarga' : 'Tambah Data Keluarga' }}
                        </h3>
                        <button @click="closeModal" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    
                    <div class="p-6 overflow-y-auto custom-scrollbar">
                        <form @submit.prevent="saveData" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Hubungan Keluarga <span class="text-red-500">*</span></label>
                                <select v-model="form.hubungan" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" required>
                                    <option value="" disabled>Pilih Hubungan</option>
                                    <option value="suami">Suami</option>
                                    <option value="istri">Istri</option>
                                    <option value="anak">Anak</option>
                                    <option value="ayah">Ayah</option>
                                    <option value="ibu">Ibu</option>
                                    <option value="ayah_mertua">Ayah Mertua</option>
                                    <option value="ibu_mertua">Ibu Mertua</option>
                                    <option value="saudara">Saudara</option>
                                    <option value="kakek">Kakek</option>
                                    <option value="nenek">Nenek</option>
                                </select>
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap <span class="text-red-500">*</span></label>
                                <input v-model="form.nama" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="Masukkan nama lengkap" required>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                                <select v-model="form.jenis_kelamin" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
                                    <option value="">Pilih</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Pekerjaan</label>
                                <input v-model="form.pekerjaan" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="Pekerjaan saat ini">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
                                <input v-model="form.tempat_lahir" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="Kota kelahiran">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                                <el-date-picker
                                    v-model="form.tanggal_lahir"
                                    type="date"
                                    placeholder="Hari/Bulan/Tahun"
                                    format="DD/MM/YYYY"
                                    value-format="YYYY-MM-DD"
                                    class="!w-full"
                                    :teleported="false"
                                />
                            </div>

                            <!-- Opsi khusus Anak -->
                            <div v-if="form.hubungan === 'anak'" class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                 <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Status Anak</label>
                                    <select v-model="form.status_anak" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
                                        <option value="">Pilih Status</option>
                                        <option value="kandung">Kandung</option>
                                        <option value="angkat">Angkat</option>
                                        <option value="tiri">Tiri</option>
                                    </select>
                                </div>
                                 <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Keterangan Anak</label>
                                    <input v-model="form.keterangan_anak" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="Contoh: Masih Sekolah">
                                </div>
                            </div>

                             <!-- Opsi khusus Pasangan -->
                            <div v-if="['suami', 'istri'].includes(form.hubungan)" class="md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                 <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Status Perkawinan</label>
                                    <select v-model="form.status_kawin" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
                                        <option value="0">Belum Kawin</option>
                                        <option value="1">Kawin</option>
                                    </select>
                                    <p class="text-xs text-slate-500 mt-1">Status pencatatan perkawinan secara negara.</p>
                                </div>
                            </div>

                            <div class="md:col-span-2 flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                                <div class="relative flex items-center">
                                    <input v-model="form.tertanggung" type="checkbox" id="tertanggung" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                </div>
                                <label for="tertanggung" class="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                    Masuk dalam tanggungan (Tunjangan / BPJS)
                                </label>
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Keterangan Tambahan</label>
                                <textarea v-model="form.keterangan" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none" placeholder="Catatan tambahan jika ada"></textarea>
                            </div>

                        </form>
                    </div>

                    <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 z-10">
                        <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors">
                            Batal
                        </button>
                        <button @click="saveData" :disabled="isSaving" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{{ isSaving ? 'Menyimpan...' : 'Simpan' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import api from '@/services/api'
import { formatDate } from '@/utils/format'
import { useToast } from '@/composables/useToast'

const props = defineProps({
    profileId: {
        type: [String, Number],
        required: true
    }
})

const { showToast } = useToast()
const list = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const editingId = ref(null)


const form = reactive({
    nama: '',
    hubungan: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    pekerjaan: '',
    status_kawin: '0',
    status_anak: '',
    tertanggung: false,
    keterangan_anak: '',
    keterangan: ''
})

const formatHubungan = (val) => {
    if (!val) return '-'
    return val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}



const resetForm = () => {
    Object.keys(form).forEach(key => {
        form[key] = ''
    })
    form.status_kawin = '0'
    form.tertanggung = false
    isEditing.value = false
    editingId.value = null
}

const openModal = (data = null) => {
    resetForm()
    if (data) {
        isEditing.value = true
        editingId.value = data.id
        Object.keys(form).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                form[key] = data[key]
            }
        })
        form.tertanggung = Boolean(data.tertanggung)
        form.status_kawin = String(data.status_kawin || '0')
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    resetForm()
}

const loadData = async () => {
    if (!props.profileId) return
    loading.value = true
    try {
        const res = await api.get(`/pegawai/profile/keluarga/${props.profileId}`)
        list.value = res.data.data || []
    } catch (e) {
        console.error('Error loading Keluarga', e)
        showToast('Gagal memuat data keluarga', 'error')
    } finally {
        loading.value = false
    }
}

const saveData = async () => {
    if (!props.profileId) return
    
    if (!form.nama || !form.hubungan) {
        showToast('Nama dan Hubungan wajib diisi', 'warning')
        return
    }

    isSaving.value = true
    try {
        const payload = { ...form }
        
        let url = `/pegawai/profile/keluarga/${props.profileId}`
        let method = 'post'
        
        if (isEditing.value && editingId.value) {
            url += `/${editingId.value}`
            method = 'put'
        }

        const res = await api[method](url, payload)
        
        if (res.data.success) {
            showToast(res.data.message || 'Data berhasil disimpan', 'success')
            closeModal()
            loadData()
        }
    } catch (e) {
        console.error('Error saving keluarga', e)
        const msg = e.response?.data?.message || 'Gagal menyimpan data'
        showToast(msg, 'error')
    } finally {
        isSaving.value = false
    }
}

// Delete
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const isDeleting = ref(false)

const confirmDelete = (item) => {
    deleteTarget.value = item
    showDeleteModal.value = true
}

const executeDelete = async () => {
    if (!deleteTarget.value) return
    isDeleting.value = true
    try {
        await api.delete(`/pegawai/profile/keluarga/${props.profileId}/${deleteTarget.value.id}`)
        showToast('Data keluarga berhasil dihapus.')
        showDeleteModal.value = false
        deleteTarget.value = null
        loadData()
    } catch (e) {
        const msg = e.response?.data?.message || 'Gagal menghapus data.'
        showToast(msg, 'error')
    } finally {
        isDeleting.value = false
    }
}

// Init
watch(() => props.profileId, (newId) => {
    if (newId) loadData()
}, { immediate: true })
</script>
