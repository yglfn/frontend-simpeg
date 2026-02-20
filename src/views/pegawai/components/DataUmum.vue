<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div class="flex items-center gap-3">
                <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                <h3 class="font-bold text-slate-800">Informasi Umum</h3>
            </div>
            <button v-if="!editMode" @click="editMode = true" class="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                <i class="fas fa-edit mr-1"></i> Edit
            </button>
        </div>
        <div class="p-6">
            <!-- View Mode -->
            <div v-if="!editMode" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <!-- Removed NIP and Name as they are in header -->
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Tempat Lahir</span><span class="text-sm font-semibold text-slate-700">{{ data?.tempat_lahir || '-' }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Tanggal Lahir</span><span class="text-sm font-semibold text-slate-700">{{ data?.tanggal_lahir ? new Date(data.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Jenis Kelamin</span><span class="text-sm font-semibold text-slate-700">{{ data?.jenis_kelamin === 'L' ? 'Laki-laki' : (data?.jenis_kelamin === 'P' ? 'Perempuan' : '-') }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Agama</span><span class="text-sm font-semibold text-slate-700">{{ data?.agama?.nama || '-' }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Status Pernikahan</span><span class="text-sm font-semibold text-slate-700">{{ data?.status_kawin?.nama || '-' }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Golongan Darah</span><span class="text-sm font-semibold text-slate-700">{{ data?.golongan_darah?.nama || '-' }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Email</span><span class="text-sm font-semibold text-slate-700">{{ data?.email || '-' }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Telepon / WhatsApp</span><span class="text-sm font-semibold text-slate-700">{{ data?.telepon || '-' }}</span></div>
               <div><span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Kode Pos</span><span class="text-sm font-semibold text-slate-700">{{ data?.kode_pos || '-' }}</span></div>
            </div>

            <!-- Edit Mode -->
            <div v-else class="space-y-4 max-w-3xl">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tanggal Lahir</label>
                  <el-date-picker
                    v-model="form.tanggal_lahir"
                    type="date"
                    placeholder="Pilih Tanggal"
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
                    class="w-full !w-full"
                    :size="'default'"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Jenis Kelamin</label>
                  <select v-model="form.jenis_kelamin" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white transition-shadow">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Agama</label>
                  <select v-model="form.agama_id" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white transition-shadow">
                    <option v-for="a in refAgama" :key="a.id" :value="a.id">{{ a.nama_agama }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status Kawin</label>
                  <select v-model="form.status_kawin_id" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white transition-shadow">
                    <option v-for="s in refStatusKawin" :key="s.id" :value="s.id">{{ s.status }}</option>
                  </select>
                </div>
                 <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Golongan Darah</label>
                  <select v-model="form.golongan_darah_id" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white transition-shadow">
                    <option v-for="g in refGolonganDarah" :key="g.id" :value="g.id">{{ g.kode }}</option>
                  </select>
                </div>
              </div>
              <!-- Kontak -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input v-model="form.email" type="email" placeholder="email@example.com"
                      class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Telepon / WhatsApp</label>
                  <input v-model="form.telepon" type="text" placeholder="08xxxxxxxxxx"
                      class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Kode Pos</label>
                  <input v-model="form.kode_pos" type="text" placeholder="12345" maxlength="10"
                      class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow" />
                </div>
              </div>
              <div class="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                <button @click="save" :disabled="saving" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
                <button @click="cancelEdit" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">Batal</button>
              </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format' 

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
const form = reactive({
    jenis_kelamin: '',
    agama_id: null,
    status_kawin_id: null,
    golongan_darah_id: null,
    tanggal_lahir: '',
    email: '',
    telepon: '',
    kode_pos: ''
})

const refAgama = ref([])
const refStatusKawin = ref([])
const refGolonganDarah = ref([])

// Load Data
const loadData = async () => {
    if (!props.profileId) return
    try {
        const res = await api.get(`/pegawai/profile/umum/${props.profileId}`)
        data.value = res.data.data || {}
    } catch (e) {
        console.error('Error loading Data Umum', e)
    }
}

// Load References
const loadReferences = async () => {
    try {
        const [resAgama, resStatus, resDarah] = await Promise.all([
            api.get('/reference/agama'),
            api.get('/reference/status-kawin'),
            api.get('/reference/golongan-darah')
        ])
        refAgama.value = resAgama.data.data || []
        refStatusKawin.value = resStatus.data.data || []
        refGolonganDarah.value = resDarah.data.data || []
    } catch (e) {
        console.error('Error loading references', e)
    }
}

// Watch profileId change
watch(() => props.profileId, (newId) => {
    if (newId) loadData()
}, { immediate: true })

onMounted(() => {
    loadReferences()
})

// Edit Logic
watch(editMode, (val) => {
    if (val && data.value) {
        form.jenis_kelamin = data.value.jenis_kelamin
        form.agama_id = data.value.agama?.id
        form.status_kawin_id = data.value.status_kawin?.id
        form.golongan_darah_id = data.value.golongan_darah?.id
        // Ensure format YYYY-MM-DD for input type="date"
        form.tanggal_lahir = data.value.tanggal_lahir ? new Date(data.value.tanggal_lahir).toISOString().split('T')[0] : ''
        form.email = data.value.email || ''
        form.telepon = data.value.telepon || ''
        form.kode_pos = data.value.kode_pos || ''
    }
})

const cancelEdit = () => {
    editMode.value = false
}

const save = async () => {
    saving.value = true
    try {
        await api.put(`/pegawai/profile/umum/${props.profileId}`, form)
        showToast('Data umum berhasil diperbarui')
        await loadData()
        editMode.value = false
    } catch (e) {
        console.error('Error saving Data Umum', e)
        if (e.response?.data?.errors) {
            // Get the first parsing error
            const errors = e.response.data.errors;
            const firstErrorField = Object.keys(errors)[0];
            showToast(errors[firstErrorField][0], 'error');
        } else {
            showToast(e.response?.data?.message || 'Gagal menyimpan data umum', 'error')
        }
    } finally {
        saving.value = false
    }
}
</script>
