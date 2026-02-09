<template>
  <div>
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
      <div class="flex items-center space-x-4">
        <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {{ (data?.profile?.full_name || 'U').charAt(0) }}
        </div>
        <div>
            <h2 class="text-xl font-bold text-slate-800">{{ data?.profile?.full_name || 'Pegawai' }}</h2>
            <p class="text-slate-500">{{ data?.profile?.nip || '-' }}</p>
            <div class="flex gap-2 mt-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ data?.profile?.position || 'Belum ada jabatan' }}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {{ data?.profile?.work_unit || 'Belum ada unit kerja' }}
                </span>
            </div>
        </div>
      </div>
    </div>

    <!-- Personal Leave Stats -->
     <h3 class="text-lg font-medium text-slate-800 mb-4">Statistik Cuti Saya</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
       <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <p class="text-xs text-slate-500 uppercase">Sisa Cuti Tahunan</p>
        <p class="text-2xl font-bold text-slate-800">{{ 12 - (data?.leave_used_this_year || 0) }} / 12</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <p class="text-xs text-yellow-600 uppercase">Menunggu</p>
        <p class="text-2xl font-bold text-yellow-600">{{ data?.leave_statistics?.waiting || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <p class="text-xs text-green-600 uppercase">Disetujui</p>
        <p class="text-2xl font-bold text-green-600">{{ data?.leave_statistics?.approved || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <p class="text-xs text-red-600 uppercase">Ditolak</p>
        <p class="text-2xl font-bold text-red-600">{{ data?.leave_statistics?.rejected || 0 }}</p>
      </div>
    </div>

    <!-- Recent Leaves -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="text-lg font-medium text-slate-800">Riwayat Pengajuan Cuti Terakhir</h3>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis Cuti</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lama</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                    <tr v-for="leave in data?.recent_leaves" :key="leave.id">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{{ leave.leave_type }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ leave.start_date }} s/d {{ leave.end_date }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ leave.duration }} Hari</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                             <span :class="{
                                'bg-yellow-100 text-yellow-800': leave.status === 'waiting',
                                'bg-green-100 text-green-800': leave.status === 'approved',
                                'bg-red-100 text-red-800': leave.status === 'rejected',
                             }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                {{ leave.status }}
                             </span>
                        </td>
                    </tr>
                    <tr v-if="!data?.recent_leaves?.length">
                        <td colspan="4" class="px-6 py-4 text-center text-sm text-slate-500">Belum ada riwayat cuti.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    data: Object
});
</script>
