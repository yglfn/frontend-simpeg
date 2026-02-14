<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                Data Keluarga
            </h3>
        </div>
        <div class="p-0">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th class="p-4">Nama Lengkap</th>
                            <th class="p-4">Hubungan</th>
                            <th class="p-4">L/P</th>
                            <th class="p-4">Tgl Lahir</th>
                            <th class="p-4">Pekerjaan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="k in list" :key="k.id" class="hover:bg-slate-50/80 transition-colors">
                            <td class="p-4 font-medium text-slate-800">{{ k.nama || '-' }}</td>
                            <td class="p-4"><span class="bg-pink-50 text-pink-600 px-2 py-1 rounded text-xs font-bold">{{ k.hubungan || '-' }}</span></td>
                            <td class="p-4 text-slate-600">{{ k.jenis_kelamin || '-' }}</td>
                            <td class="p-4 text-slate-600">{{ formatDate(k.tanggal_lahir) }}</td>
                            <td class="p-4 text-slate-600">{{ k.pekerjaan || '-' }}</td>
                        </tr>
                        <tr v-if="list.length === 0">
                            <td colspan="5" class="p-8 text-center text-slate-400">Belum ada data keluarga tercatat.</td>
                        </tr>
                    </tbody>
                </table>
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
        const res = await api.get(`/pegawai/profile/keluarga/${props.profileId}`)
        list.value = res.data.data || []
    } catch (e) {
        console.error('Error loading Keluarga', e)
    }
}

watch(() => props.profileId, (newId) => {
    if (newId) loadData()
}, { immediate: true })
</script>
