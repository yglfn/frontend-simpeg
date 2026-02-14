<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                Riwayat Pendidikan
            </h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{{ list.length }} Record</span>
        </div>
        <div class="p-6">
            <div v-if="list.length > 0" class="space-y-4">
                <div v-for="item in list" :key="item.id" class="flex gap-4 p-4 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                    <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-lg">
                        {{ item.jenjang?.substring(0,2) || 'Pd' }}
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-slate-800">{{ item.nama_institusi }}</h4>
                            <span class="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{{ item.tahun_lulus || '-' }}</span>
                        </div>
                        <p class="text-sm text-slate-600 mt-1">{{ item.jurusan || '-' }} <span v-if="item.gelar" class="text-amber-600 font-medium">({{ item.gelar }})</span></p>
                        <p class="text-xs text-slate-400 mt-1">No. Ijazah: {{ item.no_ijazah || '-' }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="p-6 text-center text-slate-400">
                Belum ada data riwayat pendidikan.
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/services/api'

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
        const res = await api.get(`/pegawai/profile/pendidikan/${props.profileId}`)
        list.value = res.data.data || []
    } catch (e) {
        console.error('Error loading Riwayat Pendidikan', e)
    }
}

watch(() => props.profileId, (newId) => {
    if (newId) loadData()
}, { immediate: true })
</script>
