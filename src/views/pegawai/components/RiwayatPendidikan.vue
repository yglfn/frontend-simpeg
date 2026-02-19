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

                            <!-- Inline Dokumen Badges -->
                            <div v-if="item.dokumen_pendidikan?.length" class="mt-3 flex flex-wrap gap-2">
                                <div v-for="dok in item.dokumen_pendidikan" :key="dok.id" class="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700">
                                    <i class="text-[10px]" :class="getFileIcon(dok.nama_file)"></i>
                                    <span class="truncate max-w-[120px]">{{ dok.tipe_dokumen?.nama_tipe || dok.nama_file }}</span>
                                    <button @click="viewDokumen(dok.id)" class="text-emerald-500 hover:text-emerald-700" title="Lihat">
                                        <i class="fas fa-external-link-alt text-[9px]"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-3">
                        <button @click="openEditModal(item)" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1" title="Edit">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button @click="confirmDelete(item)" class="text-xs font-semibold text-red-400 hover:text-red-600 hover:underline flex items-center gap-1" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="p-6 text-center text-slate-400">
                Belum ada data riwayat pendidikan.
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteModal = false"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <i class="fas fa-trash-alt text-red-500"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800">Hapus Riwayat Pendidikan</h3>
                            <p class="text-sm text-slate-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>
                    <p class="text-sm text-slate-600 mb-5">Yakin ingin menghapus data pendidikan <span class="font-semibold">{{ deleteTarget?.nama_institusi }}</span>?</p>
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

        <!-- Modal Form Pendidikan (with integrated document upload) -->
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
                            <input v-model="form.nama_institusi" type="text" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
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
                                <input v-model="form.kota_pendidikan" type="text" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Penandatangan Ijazah</label>
                                <input v-model="form.penandatangan_ijazah" type="text" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" />
                            </div>
                        </div>

                        <!-- Keterangan -->
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan</label>
                            <textarea v-model="form.keterangan" rows="2" placeholder="Catatan tambahan (opsional)" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm resize-none"></textarea>
                        </div>

                        <!-- ==================== DOKUMEN PENDIDIKAN (Integrated) ==================== -->
                        <div class="border-t border-slate-200 pt-5">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <i class="fas fa-folder-open text-emerald-500"></i>
                                    Dokumen Pendidikan
                                </h4>
                            </div>

                            <!-- Existing Documents (only in edit mode) -->
                            <div v-if="isEditing && modalDokumenList.length > 0" class="space-y-2 mb-4">
                                <div v-for="dok in modalDokumenList" :key="dok.id" class="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:border-emerald-200 transition group/dok">
                                    <div class="flex items-center gap-3 min-w-0">
                                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="getFileIconClass(dok.nama_file)">
                                            <i class="text-xs" :class="getFileIcon(dok.nama_file)"></i>
                                        </div>
                                        <div class="min-w-0">
                                            <p class="text-sm font-medium text-slate-700 truncate">{{ dok.tipe_dokumen?.nama_tipe || 'Dokumen' }}</p>
                                            <p class="text-[11px] text-slate-400 truncate">{{ dok.nama_file }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        <button @click="viewDokumen(dok.id)" class="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition" title="Lihat">
                                        <i class="fas fa-external-link-alt text-xs"></i>
                                    </button>
                                        <button @click="confirmDeleteDokumen(dok)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Hapus">
                                            <i class="fas fa-trash-alt text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="isEditing && loadingModalDokumen" class="flex justify-center py-3">
                                <div class="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
                            </div>

                            <!-- Upload New Document Section -->
                            <div class="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
                                <p class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                                    {{ isEditing ? 'Tambah Dokumen Baru' : 'Upload Dokumen' }}
                                </p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-medium text-slate-600 mb-1">Tipe Dokumen</label>
                                        <select v-model="docUpload.tipe_dokumen_id" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm bg-white">
                                            <option value="">-- Pilih Tipe --</option>
                                            <option v-for="t in tipeDokumenOptions" :key="t.id" :value="t.id">{{ t.nama_tipe }}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-slate-600 mb-1">File</label>
                                        <input type="file" ref="inlineFileInput" accept=".pdf,.jpg,.jpeg,.png" @change="handleInlineFile" class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 border border-slate-200 rounded-lg cursor-pointer" />
                                    </div>
                                </div>
                                <!-- Pending files queue (for new pendidikan mode) -->
                                <div v-if="!isEditing && pendingFiles.length > 0" class="space-y-1.5 mt-2">
                                    <p class="text-[11px] text-slate-500 font-medium">File antrian (akan diupload setelah data disimpan):</p>
                                    <div v-for="(pf, idx) in pendingFiles" :key="idx" class="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <i class="text-[10px]" :class="getFileIcon(pf.file.name)"></i>
                                            <span class="truncate text-slate-700">{{ getTipeName(pf.tipe_dokumen_id) }} — {{ pf.file.name }}</span>
                                        </div>
                                        <button @click="removePendingFile(idx)" class="text-red-400 hover:text-red-600 p-1">
                                            <i class="fas fa-times text-[10px]"></i>
                                        </button>
                                    </div>
                                </div>
                                <button v-if="isEditing" @click="uploadDokumenNow" :disabled="uploading || !docUpload.tipe_dokumen_id || !docUpload.file" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                                    <span v-if="uploading" class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                                    <i v-else class="fas fa-upload text-[10px]"></i>
                                    {{ uploading ? 'Mengunggah...' : 'Upload Sekarang' }}
                                </button>
                                <button v-else @click="addToPendingFiles" :disabled="!docUpload.tipe_dokumen_id || !docUpload.file" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                                    <i class="fas fa-plus text-[10px]"></i>
                                    Tambah ke Antrian
                                </button>
                                <p class="text-[11px] text-slate-400">Format: PDF, JPG, PNG. Maks 10 MB.</p>
                            </div>
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

        <!-- Delete Dokumen Confirmation -->
        <Teleport to="body">
            <div v-if="showDeleteDokumenModal" class="fixed inset-0 z-[10000] flex items-center justify-center p-4" @click.self="showDeleteDokumenModal = false">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                    <div class="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800 mb-2">Hapus Dokumen?</h3>
                    <p class="text-sm text-slate-500 mb-6">Dokumen <strong>{{ deleteDokumenTarget?.nama_file }}</strong> akan dihapus.</p>
                    <div class="flex justify-center gap-3">
                        <button @click="showDeleteDokumenModal = false" class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">Batal</button>
                        <button @click="executeDeleteDokumen" :disabled="deletingDokumen" class="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2">
                            <span v-if="deletingDokumen" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            {{ deletingDokumen ? 'Menghapus...' : 'Ya, Hapus' }}
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
const tipeDokumenOptions = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const saving = ref(false)
const errors = ref({})

// Dokumen State (inside modal)
const modalDokumenList = ref([])
const loadingModalDokumen = ref(false)
const uploading = ref(false)
const docUpload = ref({ tipe_dokumen_id: '', file: null })
const inlineFileInput = ref(null)
const pendingFiles = ref([]) // for new pendidikan: queue files to upload after save

// Delete dokumen
const showDeleteDokumenModal = ref(false)
const deleteDokumenTarget = ref(null)
const deletingDokumen = ref(false)

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
    return !basicEducation.some(level => name.includes(level))
})

watch(shouldShowFakultasProdi, (newVal) => {
    if (!newVal) {
        form.value.fakultas = ''
        form.value.program_studi = ''
    }
})

// Helpers
const getFileIcon = (filename) => {
    if (!filename) return 'fas fa-file'
    const ext = filename.split('.').pop().toLowerCase()
    if (ext === 'pdf') return 'fas fa-file-pdf'
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'fas fa-file-image'
    return 'fas fa-file'
}

const getFileIconClass = (filename) => {
    if (!filename) return 'bg-slate-100 text-slate-500'
    const ext = filename.split('.').pop().toLowerCase()
    if (ext === 'pdf') return 'bg-red-50 text-red-500'
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'bg-blue-50 text-blue-500'
    return 'bg-slate-100 text-slate-500'
}

const getStorageUrl = (path) => {
    if (!path) return '#'
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${baseUrl.replace('/api', '')}/storage/${path}`
}

const getTipeName = (id) => {
    const t = tipeDokumenOptions.value.find(x => x.id === id)
    return t ? t.nama_tipe : 'Dokumen'
}

// View dokumen via authenticated API endpoint
const viewDokumen = async (dokumenId) => {
    try {
        const res = await api.get(`/pegawai/pendidikan/dokumen/${dokumenId}/download`, {
            responseType: 'blob'
        })
        const blob = new Blob([res.data], { type: res.headers['content-type'] })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
    } catch (e) {
        console.error('Error viewing dokumen', e)
        showToast('Gagal membuka dokumen.', 'error')
    }
}

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

const loadJenjang = async () => {
    try {
        const res = await api.get('/reference/pendidikan')
        jenjangOptions.value = res.data.data || []
    } catch (e) {
        console.error('Error loading jenjang pendidikan', e)
    }
}

const loadTipeDokumen = async () => {
    try {
        const res = await api.get('/reference/tipe-dokumen')
        tipeDokumenOptions.value = res.data.data || []
    } catch (e) {
        console.error('Error loading tipe dokumen', e)
    }
}

// Load dokumen for modal (edit mode)
const loadModalDokumen = async (riwayatPendidikanId) => {
    loadingModalDokumen.value = true
    try {
        const res = await api.get(`/pegawai/pendidikan/${riwayatPendidikanId}/dokumen`)
        modalDokumenList.value = res.data.data || []
    } catch (e) {
        console.error('Error loading dokumen in modal', e)
        modalDokumenList.value = []
    } finally {
        loadingModalDokumen.value = false
    }
}

// Open Add Modal
const openAddModal = () => {
    isEditing.value = false
    editId.value = null
    form.value = { ...defaultForm }
    errors.value = {}
    modalDokumenList.value = []
    pendingFiles.value = []
    docUpload.value = { tipe_dokumen_id: '', file: null }
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
    pendingFiles.value = []
    docUpload.value = { tipe_dokumen_id: '', file: null }
    showModal.value = true
    loadModalDokumen(item.id)
}

const closeModal = () => {
    showModal.value = false
    pendingFiles.value = []
}

// Save (Create or Update) + upload pending files
const saveForm = async () => {
    saving.value = true
    errors.value = {}
    try {
        let savedId = editId.value

        if (isEditing.value) {
            await api.put(`/pegawai/profile/pendidikan/${props.profileId}/${editId.value}`, form.value)
            showToast('Data pendidikan berhasil diperbarui.')
        } else {
            const res = await api.post(`/pegawai/profile/pendidikan/${props.profileId}`, form.value)
            savedId = res.data.data?.id
            showToast('Data pendidikan berhasil ditambahkan.')
        }

        // Upload pending files (for new records or queued in add mode)
        if (savedId && pendingFiles.value.length > 0) {
            for (const pf of pendingFiles.value) {
                try {
                    const fd = new FormData()
                    fd.append('tipe_dokumen_id', pf.tipe_dokumen_id)
                    fd.append('file', pf.file)
                    await api.post(`/pegawai/pendidikan/${savedId}/dokumen`, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })
                } catch (uploadErr) {
                    console.error('Error uploading queued doc', uploadErr)
                    showToast(`Gagal upload: ${pf.file.name}`, 'error')
                }
            }
            if (pendingFiles.value.length > 0) {
                showToast(`${pendingFiles.value.length} dokumen berhasil diunggah.`)
            }
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

/*
|--------------------------------------------------------------------------
| INLINE DOCUMENT UPLOAD (inside modal)
|--------------------------------------------------------------------------
*/

const handleInlineFile = (e) => {
    docUpload.value.file = e.target.files[0] || null
}

const resetFileInput = () => {
    docUpload.value = { tipe_dokumen_id: '', file: null }
    if (inlineFileInput.value) inlineFileInput.value.value = ''
}

// For ADD mode: queue files to upload after save
const addToPendingFiles = () => {
    if (!docUpload.value.tipe_dokumen_id || !docUpload.value.file) return
    pendingFiles.value.push({
        tipe_dokumen_id: docUpload.value.tipe_dokumen_id,
        file: docUpload.value.file
    })
    resetFileInput()
}

const removePendingFile = (idx) => {
    pendingFiles.value.splice(idx, 1)
}

// For EDIT mode: upload immediately
const uploadDokumenNow = async () => {
    if (!docUpload.value.tipe_dokumen_id || !docUpload.value.file) return
    uploading.value = true
    try {
        const fd = new FormData()
        fd.append('tipe_dokumen_id', docUpload.value.tipe_dokumen_id)
        fd.append('file', docUpload.value.file)
        await api.post(`/pegawai/pendidikan/${editId.value}/dokumen`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('Dokumen berhasil diunggah.')
        resetFileInput()
        await loadModalDokumen(editId.value)
        await loadData()
    } catch (e) {
        const msg = e.response?.data?.message || 'Gagal mengunggah dokumen.'
        showToast(msg, 'error')
        console.error('Error uploading dokumen', e)
    } finally {
        uploading.value = false
    }
}

// Delete dokumen
const confirmDeleteDokumen = (dok) => {
    deleteDokumenTarget.value = dok
    showDeleteDokumenModal.value = true
}

const executeDeleteDokumen = async () => {
    if (!deleteDokumenTarget.value) return
    deletingDokumen.value = true
    try {
        await api.delete(`/pegawai/pendidikan/${editId.value}/dokumen/${deleteDokumenTarget.value.id}`)
        showToast('Dokumen berhasil dihapus.')
        showDeleteDokumenModal.value = false
        deleteDokumenTarget.value = null
        await loadModalDokumen(editId.value)
        await loadData()
    } catch (e) {
        showToast('Gagal menghapus dokumen.', 'error')
        console.error('Error deleting dokumen', e)
    } finally {
        deletingDokumen.value = false
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
        await api.delete(`/pegawai/profile/pendidikan/${props.profileId}/${deleteTarget.value.id}`)
        showToast('Data pendidikan berhasil dihapus.')
        showDeleteModal.value = false
        deleteTarget.value = null
        await loadData()
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

loadJenjang()
loadTipeDokumen()
</script>
