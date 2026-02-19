<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Alamat & Kontak
            </h3>
            <button v-if="!editMode" @click="startEdit" class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                <i class="fas fa-edit mr-1"></i> Edit
            </button>
        </div>
        
        <div class="p-6">
            <!-- View Mode -->
            <div v-if="!editMode">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <!-- Alamat Utama -->
                    <div class="bg-slate-50 p-5 rounded-lg border border-slate-100">
                        <h4 class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <i class="fas fa-id-card text-slate-400"></i> Alamat Sesuai KTP
                        </h4>
                        <div class="space-y-3">
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Jalan / Alamat</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_utama?.alamat || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Desa/Kel</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_utama?.desa_kelurahan || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Kecamatan</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_utama?.kecamatan || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Kab/Kota</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_utama?.kabupaten_kota || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Provinsi</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_utama?.provinsi || '-' }}</span></div>
                        </div>
                    </div>

                    <!-- Alamat Domisili -->
                    <div class="bg-slate-50 p-5 rounded-lg border border-slate-100">
                        <h4 class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <i class="fas fa-map-marked-alt text-slate-400"></i> Alamat Domisili Saat Ini
                        </h4>
                        <div class="space-y-3">
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Jalan / Alamat</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_domisili?.alamat || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Desa/Kel</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_domisili?.desa_kelurahan || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Kecamatan</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_domisili?.kecamatan || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Kab/Kota</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_domisili?.kabupaten_kota || '-' }}</span></div>
                            <div class="block mb-0.5"><span class="block text-xs text-slate-400 mb-0.5">Provinsi</span><span class="block text-sm font-medium text-slate-700">{{ data?.alamat_domisili?.provinsi || '-' }}</span></div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Edit Mode -->
            <div v-else class="space-y-8">
                <!-- Alamat KTP Form -->
                <div class="bg-slate-50 p-5 rounded-lg border border-slate-100">
                    <h4 class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <i class="fas fa-id-card text-blue-500"></i> Alamat Sesuai KTP
                    </h4>
                    <div class="space-y-4">
                        <!-- Jalan / Alamat -->
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Jalan / Alamat</label>
                            <input v-model="form.utama.alamat" type="text" placeholder="Contoh: Jl. Sudirman No. 1, RT 01/RW 02"
                                class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Provinsi -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Provinsi <span class="text-red-500">*</span></label>
                                <select v-model="form.utama.provinsi_id" @change="onProvinsiChange('utama')"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors">
                                    <option :value="null" disabled>-- Pilih Provinsi --</option>
                                    <option v-for="prov in regionData.provinsi" :key="prov.id" :value="prov.id">{{ prov.nama_provinsi }}</option>
                                </select>
                            </div>
                            <!-- Kabupaten/Kota -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Kabupaten/Kota <span class="text-red-500">*</span></label>
                                <select v-model="form.utama.kabupaten_kota_id" @change="onKabKotaChange('utama')"
                                    :disabled="!regionData.utama.kabupaten.length"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed">
                                    <option :value="null" disabled>-- Pilih Kabupaten/Kota --</option>
                                    <option v-for="kab in regionData.utama.kabupaten" :key="kab.id" :value="kab.id">{{ kab.nama_kab_kota }}</option>
                                </select>
                            </div>
                            <!-- Kecamatan -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Kecamatan <span class="text-red-500">*</span></label>
                                <select v-model="form.utama.kecamatan_id" @change="onKecamatanChange('utama')"
                                    :disabled="!regionData.utama.kecamatan.length"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed">
                                    <option :value="null" disabled>-- Pilih Kecamatan --</option>
                                    <option v-for="kec in regionData.utama.kecamatan" :key="kec.id" :value="kec.id">{{ kec.nama_kecamatan }}</option>
                                </select>
                            </div>
                            <!-- Desa/Kelurahan -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Desa/Kelurahan <span class="text-red-500">*</span></label>
                                <select v-model="form.utama.desa_kelurahan_id"
                                    :disabled="!regionData.utama.desa.length"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed">
                                    <option :value="null" disabled>-- Pilih Desa/Kelurahan --</option>
                                    <option v-for="desa in regionData.utama.desa" :key="desa.id" :value="desa.id">{{ desa.nama_desa_kelurahan }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Alamat Domisili Form -->
                <div class="bg-slate-50 p-5 rounded-lg border border-slate-100">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <i class="fas fa-map-marked-alt text-green-500"></i> Alamat Domisili Saat Ini
                        </h4>
                        <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-600 select-none">
                            <input type="checkbox" v-model="samaKTP" @change="onSamaKTPChange"
                                class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span>Sama dengan KTP</span>
                        </label>
                    </div>
                    <div :class="{ 'opacity-50 pointer-events-none': samaKTP }" class="space-y-4">
                        <!-- Jalan / Alamat -->
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Jalan / Alamat</label>
                            <input v-model="form.domisili.alamat" type="text" placeholder="Contoh: Jl. Sudirman No. 1, RT 01/RW 02"
                                class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Provinsi -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Provinsi</label>
                                <select v-model="form.domisili.provinsi_id" @change="onProvinsiChange('domisili')"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors">
                                    <option :value="null" disabled>-- Pilih Provinsi --</option>
                                    <option v-for="prov in regionData.provinsi" :key="prov.id" :value="prov.id">{{ prov.nama_provinsi }}</option>
                                </select>
                            </div>
                            <!-- Kabupaten/Kota -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Kabupaten/Kota</label>
                                <select v-model="form.domisili.kabupaten_kota_id" @change="onKabKotaChange('domisili')"
                                    :disabled="!regionData.domisili.kabupaten.length"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed">
                                    <option :value="null" disabled>-- Pilih Kabupaten/Kota --</option>
                                    <option v-for="kab in regionData.domisili.kabupaten" :key="kab.id" :value="kab.id">{{ kab.nama_kab_kota }}</option>
                                </select>
                            </div>
                            <!-- Kecamatan -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Kecamatan</label>
                                <select v-model="form.domisili.kecamatan_id" @change="onKecamatanChange('domisili')"
                                    :disabled="!regionData.domisili.kecamatan.length"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed">
                                    <option :value="null" disabled>-- Pilih Kecamatan --</option>
                                    <option v-for="kec in regionData.domisili.kecamatan" :key="kec.id" :value="kec.id">{{ kec.nama_kecamatan }}</option>
                                </select>
                            </div>
                            <!-- Desa/Kelurahan -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-500 mb-1.5">Desa/Kelurahan</label>
                                <select v-model="form.domisili.desa_kelurahan_id"
                                    :disabled="!regionData.domisili.desa.length"
                                    class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed">
                                    <option :value="null" disabled>-- Pilih Desa/Kelurahan --</option>
                                    <option v-for="desa in regionData.domisili.desa" :key="desa.id" :value="desa.id">{{ desa.nama_desa_kelurahan }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 pt-2">
                    <button @click="save" :disabled="saving"
                        class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                        {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                    </button>
                    <button @click="cancelEdit"
                        class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const props = defineProps({
    profileId: {
        type: [String, Number],
        required: true
    }
})

const data = ref({})
const editMode = ref(false)
const saving = ref(false)
const samaKTP = ref(false)

// Form Data
const form = reactive({
    utama: { alamat: '', provinsi_id: null, kabupaten_kota_id: null, kecamatan_id: null, desa_kelurahan_id: null },
    domisili: { alamat: '', provinsi_id: null, kabupaten_kota_id: null, kecamatan_id: null, desa_kelurahan_id: null },
    email: '', telepon: '', kode_pos: ''
})

// Region dropdown data
const regionData = reactive({
    provinsi: [],
    utama: { kabupaten: [], kecamatan: [], desa: [] },
    domisili: { kabupaten: [], kecamatan: [], desa: [] }
})

// ========== Region API Helpers ==========

const loadProvinsi = async () => {
    try {
        const res = await api.get('/reference/provinsi')
        regionData.provinsi = res.data.data || []
    } catch (e) {
        console.error('Error loading provinsi', e)
    }
}

const loadKabupaten = async (type, provinsiId) => {
    if (!provinsiId) { regionData[type].kabupaten = []; return }
    try {
        const res = await api.get('/reference/kabupaten-kota', { params: { provinsi_id: provinsiId } })
        regionData[type].kabupaten = res.data.data || []
    } catch (e) {
        console.error('Error loading kabupaten', e)
        regionData[type].kabupaten = []
    }
}

const loadKecamatan = async (type, kabKotaId) => {
    if (!kabKotaId) { regionData[type].kecamatan = []; return }
    try {
        const res = await api.get('/reference/kecamatan', { params: { kab_kota_id: kabKotaId } })
        regionData[type].kecamatan = res.data.data || []
    } catch (e) {
        console.error('Error loading kecamatan', e)
        regionData[type].kecamatan = []
    }
}

const loadDesa = async (type, kecamatanId) => {
    if (!kecamatanId) { regionData[type].desa = []; return }
    try {
        const res = await api.get('/reference/desa-kelurahan', { params: { kecamatan_id: kecamatanId } })
        regionData[type].desa = res.data.data || []
    } catch (e) {
        console.error('Error loading desa', e)
        regionData[type].desa = []
    }
}

// ========== Cascading Dropdown Handlers ==========

const onProvinsiChange = async (type) => {
    form[type].kabupaten_kota_id = null
    form[type].kecamatan_id = null
    form[type].desa_kelurahan_id = null
    regionData[type].kecamatan = []
    regionData[type].desa = []
    await loadKabupaten(type, form[type].provinsi_id)
}

const onKabKotaChange = async (type) => {
    form[type].kecamatan_id = null
    form[type].desa_kelurahan_id = null
    regionData[type].desa = []
    await loadKecamatan(type, form[type].kabupaten_kota_id)
}

const onKecamatanChange = async (type) => {
    form[type].desa_kelurahan_id = null
    await loadDesa(type, form[type].kecamatan_id)
}

// ========== "Sama dengan KTP" Checkbox ==========

const onSamaKTPChange = () => {
    if (samaKTP.value) {
        // Copy all values from utama to domisili
        form.domisili.alamat = form.utama.alamat
        form.domisili.provinsi_id = form.utama.provinsi_id
        form.domisili.kabupaten_kota_id = form.utama.kabupaten_kota_id
        form.domisili.kecamatan_id = form.utama.kecamatan_id
        form.domisili.desa_kelurahan_id = form.utama.desa_kelurahan_id
        // Copy region dropdown data
        regionData.domisili.kabupaten = [...regionData.utama.kabupaten]
        regionData.domisili.kecamatan = [...regionData.utama.kecamatan]
        regionData.domisili.desa = [...regionData.utama.desa]
    }
}

// ========== Load Data ==========

const loadData = async () => {
    if (!props.profileId) return
    try {
        const res = await api.get(`/pegawai/profile/alamat/${props.profileId}`)
        data.value = res.data.data || {}
    } catch (e) {
        console.error('Error loading Alamat', e)
    }
}

// Populate form with existing data and pre-load cascading dropdowns
const populateForm = async () => {
    const d = data.value
    form.email = d.email || ''
    form.telepon = d.telepon || ''
    form.kode_pos = d.kode_pos || ''

    // Load provinsi first
    if (regionData.provinsi.length === 0) {
        await loadProvinsi()
    }

    // Populate Alamat Utama
    if (d.alamat_utama) {
        form.utama.alamat = d.alamat_utama.alamat || ''
        form.utama.provinsi_id = d.alamat_utama.provinsi_id || null
        form.utama.kabupaten_kota_id = d.alamat_utama.kabupaten_kota_id || null
        form.utama.kecamatan_id = d.alamat_utama.kecamatan_id || null
        form.utama.desa_kelurahan_id = d.alamat_utama.desa_kelurahan_id || null

        // Load cascading data sequentially so dropdowns are populated
        if (form.utama.provinsi_id) await loadKabupaten('utama', form.utama.provinsi_id)
        if (form.utama.kabupaten_kota_id) await loadKecamatan('utama', form.utama.kabupaten_kota_id)
        if (form.utama.kecamatan_id) await loadDesa('utama', form.utama.kecamatan_id)
    }

    // Populate Alamat Domisili
    if (d.alamat_domisili) {
        form.domisili.alamat = d.alamat_domisili.alamat || ''
        form.domisili.provinsi_id = d.alamat_domisili.provinsi_id || null
        form.domisili.kabupaten_kota_id = d.alamat_domisili.kabupaten_kota_id || null
        form.domisili.kecamatan_id = d.alamat_domisili.kecamatan_id || null
        form.domisili.desa_kelurahan_id = d.alamat_domisili.desa_kelurahan_id || null

        if (form.domisili.provinsi_id) await loadKabupaten('domisili', form.domisili.provinsi_id)
        if (form.domisili.kabupaten_kota_id) await loadKecamatan('domisili', form.domisili.kabupaten_kota_id)
        if (form.domisili.kecamatan_id) await loadDesa('domisili', form.domisili.kecamatan_id)
    }
}

// ========== Edit Mode Handlers ==========

const startEdit = async () => {
    editMode.value = true
    samaKTP.value = false
    await populateForm()
}

const cancelEdit = () => {
    editMode.value = false
    samaKTP.value = false
}

// ========== Save ==========

const save = async () => {
    // Basic validation
    if (!form.utama.desa_kelurahan_id) {
        showToast('Silakan pilih Desa/Kelurahan untuk Alamat KTP', 'error')
        return
    }

    // If "Sama dengan KTP" is checked, sync again
    const domAlamat = samaKTP.value ? form.utama.alamat : form.domisili.alamat
    const domDesaId = samaKTP.value ? form.utama.desa_kelurahan_id : form.domisili.desa_kelurahan_id

    saving.value = true
    try {
        await api.put(`/pegawai/profile/alamat/${props.profileId}`, {
            alamat_utama: {
                desa_kelurahan_id: form.utama.desa_kelurahan_id,
                alamat: form.utama.alamat || null
            },
            alamat_domisili: {
                desa_kelurahan_id: domDesaId || null,
                alamat: domAlamat || null
            }
        })
        showToast('Data alamat berhasil diperbarui')
        await loadData()
        editMode.value = false
        samaKTP.value = false
    } catch (e) {
        console.error('Error saving Alamat', e)
        if (e.response?.data?.errors) {
            const errors = e.response.data.errors
            const firstError = Object.values(errors)[0]
            showToast(Array.isArray(firstError) ? firstError[0] : firstError, 'error')
        } else {
            showToast(e.response?.data?.message || 'Gagal menyimpan alamat', 'error')
        }
    } finally {
        saving.value = false
    }
}

// Watch profileId
watch(() => props.profileId, (newId) => {
    if (newId) loadData()
}, { immediate: true })
</script>
