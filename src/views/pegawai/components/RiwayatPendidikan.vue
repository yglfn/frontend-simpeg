<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Riwayat Pendidikan
            </h3>
            <div class="flex items-center gap-3">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{{ list.length }} Record</span>
                <button @click="openAddModal" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm">
                    <i class="fas fa-plus text-[10px]"></i> Tambah
                </button>
            </div>
        </div>

        <!-- List -->
        <div class="p-6">
            <div v-if="loadingList" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <div v-else-if="list.length > 0" class="space-y-4">
                <div v-for="item in list" :key="item.id" class="relative pl-4 pr-4 py-5 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                    <div class="flex items-start gap-4 pr-12">
                        <!-- Jenjang -->
                        <div class="flex flex-col items-center gap-1 shrink-0 min-w-[3.5rem]">
                            <div class="w-14 h-14 rounded-xl bg-blue-50 md:bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 md:border-transparent">
                                {{ item.pendidikan?.nama_jenjang || 'N/A' }}
                            </div>
                        </div>
                        
                        <div class="flex-1 min-w-0 pt-1">
                            <!-- Major / Program Studi & Year -->
                            <div class="flex items-center gap-2 mb-1">
                                <h4 class="font-bold text-slate-800 text-lg leading-tight">
                                    {{ item.program_studi || item.fakultas || 'Pendidikan Umum' }}
                                </h4>
                                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    {{ item.tahun_lulus }}
                                </span>
                            </div>
                            
                            <!-- Institution -->
                            <p class="text-sm font-medium text-slate-600 mb-3 flex items-center gap-1.5">
                                <i class="fas fa-university text-slate-400 text-xs"></i>
                                {{ item.nama_institusi }}
                            </p>

                            <!-- Metadata Grid -->
                            <div class="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                                <div class="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    <i class="fas fa-scroll text-blue-500/70"></i>
                                    <span class="font-mono">{{ item.nomor_ijazah || '-' }}</span>
                                </div>
                                <div v-if="item.kota_pendidikan" class="flex items-center gap-1.5">
                                    <i class="fas fa-map-marker-alt text-slate-400"></i>
                                    {{ item.kota_pendidikan }}
                                </div>
                                <div v-if="item.penandatangan_ijazah" class="flex items-center gap-1.5">
                                    <i class="fas fa-signature text-slate-400"></i>
                                    {{ item.penandatangan_ijazah }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons (Bottom Right or Absolute Hover) -->
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-3">
                        <button @click="openEditModal(item)" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1" title="Edit">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="p-6 text-center text-slate-400">
                Belum ada data riwayat pendidikan.
            </div>
        </div>

        <!-- Modal Form -->
        <Teleport to="body">
            <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="closeModal">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <!-- Modal Header -->
                    <div class="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
                        <h3 class="text-lg font-bold text-slate-800">{{ isEditing ? 'Edit Pendidikan' : 'Tambah Pendidikan' }}</h3>
                        <button @click="closeModal" class="p-2 hover:bg-slate-100 rounded-lg transition">
                            <i class="fas fa-times text-slate-400"></i>
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 space-y-5">
                        <!-- Jenjang Pendidikan -->
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Jenjang Pendidikan <span class="text-red-500">*</span></label>
                            <select v-model="form.pendidikan_id" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-white">
                                <option value="">-- Pilih Jenjang --</option>
                                <option v-for="j in jenjangOptions" :key="j.id" :value="j.id">{{ j.nama_jenjang }}</option>
                            </select>
                            <p v-if="errors.pendidikan_id" class="text-red-500 text-xs mt-1">{{ errors.pendidikan_id[0] }}</p>
                        </div>

                        <!-- Nama Institusi -->
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nama Institusi <span class="text-red-500">*</span></label>
                            <input v-model="form.nama_institusi" type="text" placeholder="" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            <p v-if="errors.nama_institusi" class="text-red-500 text-xs mt-1">{{ errors.nama_institusi[0] }}</p>
                        </div>

                        <!-- Fakultas & Program Studi -->
                        <div v-if="shouldShowFakultasProdi" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Fakultas</label>
                                <input v-model="form.fakultas" type="text" placeholder="Contoh: Teknik" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Program Studi</label>
                                <input v-model="form.program_studi" type="text" placeholder="Contoh: Informatika" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            </div>
                        </div>

                        <!-- Tahun Lulus & Nomor Ijazah -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Tahun Lulus <span class="text-red-500">*</span></label>
                                <input v-model.number="form.tahun_lulus" type="number" min="1900" :max="new Date().getFullYear()" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                                <p v-if="errors.tahun_lulus" class="text-red-500 text-xs mt-1">{{ errors.tahun_lulus[0] }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nomor Ijazah</label>
                                <input v-model="form.nomor_ijazah" type="text" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            </div>
                        </div>

                        <!-- Kota & Penandatangan -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Kota Pendidikan</label>
                                <input v-model="form.kota_pendidikan" type="text"  class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Penandatangan Ijazah</label>
                                <input v-model="form.penandatangan_ijazah" type="text"class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            </div>
                        </div>

                        <!-- Keterangan -->
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan</label>
                            <textarea v-model="form.keterangan" rows="3" placeholder="Catatan tambahan (opsional)" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm resize-none"></textarea>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                        <button @click="closeModal" class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">
                            Batal
                        </button>
                        <button @click="saveForm" :disabled="saving" class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2">
                            <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            {{ saving ? 'Menyimpan...' : (isEditing ? 'Perbarui' : 'Simpan') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="showDeleteModal = false">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                    <div class="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800 mb-2">Hapus Data Pendidikan?</h3>
                    <p class="text-sm text-slate-500 mb-6">Data pendidikan di <strong>{{ deleteTarget?.nama_institusi }}</strong> akan dihapus permanen.</p>
                    <div class="flex justify-center gap-3">
                        <button @click="showDeleteModal = false" class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">Batal</button>
                        <button @click="executeDelete" :disabled="deleting" class="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2">
                            <span v-if="deleting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>


    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const props = defineProps({
    profileId: {
        type: [String, Number],
        required: true
    }
})

// State
const list = ref([])
const loadingList = ref(false)
const jenjangOptions = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const errors = ref({})

const { showToast } = useToast()

const defaultForm = {
    pendidikan_id: '',
    nama_institusi: '',
    fakultas: '',
    program_studi: '',
    nomor_ijazah: '',
    tahun_lulus: '',
    kota_pendidikan: '',
    penandatangan_ijazah: '',
    keterangan: ''
}
const form = ref({ ...defaultForm })

// Computed
const shouldShowFakultasProdi = computed(() => {
    if (!form.value.pendidikan_id) return false
    const selected = jenjangOptions.value.find(j => j.id === form.value.pendidikan_id)
    if (!selected) return false

    const name = selected.nama_jenjang.toLowerCase()
    const basicEducation = ['sd', 'smp', 'sma', 'slta', 'sltp', 'mi', 'mts', 'ma', 'paket']
    
    // Return false if it matches any basic education keywords
    return !basicEducation.some(level => name.includes(level))
})

// Watch to clear fields if hidden
watch(shouldShowFakultasProdi, (newVal) => {
    if (!newVal) {
        form.value.fakultas = ''
        form.value.program_studi = ''
    }
})



// Load data
const loadData = async () => {
    if (!props.profileId) return
    loadingList.value = true
    try {
        const res = await api.get(`/pegawai/profile/pendidikan/${props.profileId}`)
        list.value = (res.data.data || []).sort((a, b) => b.tahun_lulus - a.tahun_lulus)
    } catch (e) {
        console.error('Error loading Riwayat Pendidikan', e)
    } finally {
        loadingList.value = false
    }
}

// Load jenjang reference
const loadJenjang = async () => {
    try {
        const res = await api.get('/reference/pendidikan')
        jenjangOptions.value = res.data.data || []
    } catch (e) {
        console.error('Error loading jenjang pendidikan', e)
    }
}

// Open Add Modal
const openAddModal = () => {
    isEditing.value = false
    editId.value = null
    form.value = { ...defaultForm }
    errors.value = {}
    showModal.value = true
}

// Open Edit Modal
const openEditModal = (item) => {
    isEditing.value = true
    editId.value = item.id
    form.value = {
        pendidikan_id: item.pendidikan_id || '',
        nama_institusi: item.nama_institusi || '',
        fakultas: item.fakultas || '',
        program_studi: item.program_studi || '',
        nomor_ijazah: item.nomor_ijazah || '',
        tahun_lulus: item.tahun_lulus || '',
        kota_pendidikan: item.kota_pendidikan || '',
        penandatangan_ijazah: item.penandatangan_ijazah || '',
        keterangan: item.keterangan || ''
    }
    errors.value = {}
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

// Save (Create or Update)
const saveForm = async () => {
    saving.value = true
    errors.value = {}
    try {
        if (isEditing.value) {
            await api.put(`/pegawai/profile/pendidikan/${props.profileId}/${editId.value}`, form.value)
            showToast('Data pendidikan berhasil diperbarui.')
        } else {
            await api.post(`/pegawai/profile/pendidikan/${props.profileId}`, form.value)
            showToast('Data pendidikan berhasil ditambahkan.')
        }
        closeModal()
        await loadData()
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response.data.errors || {}
        } else {
            showToast('Gagal menyimpan data. Silakan coba lagi.', 'error')
        }
        console.error('Error saving pendidikan', e)
    } finally {
        saving.value = false
    }
}

// Delete
const confirmDelete = (item) => {
    deleteTarget.value = item
    showDeleteModal.value = true
}

const executeDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await api.delete(`/pegawai/profile/pendidikan/${props.profileId}/${deleteTarget.value.id}`)
        showToast('Data pendidikan berhasil dihapus.')
        showDeleteModal.value = false
        deleteTarget.value = null
        await loadData()
    } catch (e) {
        showToast('Gagal menghapus data.', 'error')
        console.error('Error deleting pendidikan', e)
    } finally {
        deleting.value = false
    }
}

// Init
watch(() => props.profileId, (newId) => {
    if (newId) loadData()
}, { immediate: true })

loadJenjang()
</script>

<style scoped>
.toast-enter-active { animation: slideIn 0.3s ease-out; }
.toast-leave-active { animation: slideOut 0.25s ease-in; }
@keyframes slideIn { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(60px); } }
</style>
