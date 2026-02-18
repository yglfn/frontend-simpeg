<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                Riwayat Jabatan
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{{ list.length }} Record</span>
        </div>
        <div class="p-0">
            <div v-if="list.length > 0" class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th class="p-4">Jabatan</th>
                            <th class="p-4">Unit Kerja</th>
                            <th class="p-4">TMT</th>
                            <th class="p-4">SK</th>
                            <th class="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="rj in list" :key="rj.id" class="hover:bg-slate-50/80 transition-colors">
                            <td class="p-4 font-medium text-slate-800">{{ rj.nama_jabatan || '-' }}</td>
                            <td class="p-4 text-slate-600">{{ rj.nama_unit || '-' }}</td>

                            <td class="p-4 text-slate-600">{{ formatDate(rj.tmt_jabatan) }}</td>
                            <td class="p-4 text-slate-600">{{ rj.no_sk || '-' }}</td>
                            <td class="p-4">
                                <span :class="rj.is_aktif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'" class="px-2 py-1 rounded text-xs font-semibold">
                                    {{ rj.is_aktif ? 'Aktif' : 'Non-Aktif' }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="p-8 text-center text-slate-400">
                Belum ada data riwayat jabatan.
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/services/api'
import { formatDate } from '@/utils/format'

const props = defineProps({
    profileId: {
        type: [String, Number],
        required: true
    }
})

const list = ref([])

const loadData = async () => {
    if (!props.profileId) return
    try {
        const res = await api.get(`/pegawai/profile/riwayat-jabatan/${props.profileId}`)
        const data = res.data.data
        list.value = Array.isArray(data) ? data : (data?.data || [])
    } catch (e) {
        console.error('Error loading Riwayat Jabatan', e)
    }
}

watch(() => props.profileId, (newId) => {
    if (newId) loadData()
}, { immediate: true })
</script>
