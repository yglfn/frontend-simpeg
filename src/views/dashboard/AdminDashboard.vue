<template>
  <div>
    <h2 class="text-xl font-semibold text-slate-800 mb-6">Admin Dashboard</h2>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div class="flex items-center justify-between">
          <div>
             <p class="text-sm font-medium text-slate-500">Total Pegawai</p>
             <p class="text-3xl font-bold text-slate-800 mt-1">{{ data?.summary?.total_employees || 0 }}</p>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg"><UsersIcon class="h-6 w-6 text-blue-600" /></div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div class="flex items-center justify-between">
          <div>
             <p class="text-sm font-medium text-slate-500">Total Unit Kerja</p>
             <p class="text-3xl font-bold text-slate-800 mt-1">{{ data?.summary?.total_work_units || 0 }}</p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg"><BuildingOfficeIcon class="h-6 w-6 text-green-600" /></div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div class="flex items-center justify-between">
          <div>
             <p class="text-sm font-medium text-slate-500">Total Jabatan</p>
             <p class="text-3xl font-bold text-slate-800 mt-1">{{ data?.summary?.total_positions || 0 }}</p>
          </div>
          <div class="p-3 bg-purple-50 rounded-lg"><BriefcaseIcon class="h-6 w-6 text-purple-600" /></div>
        </div>
      </div>
    </div>

    <!-- Leave Statistics -->
    <h3 class="text-lg font-medium text-slate-800 mb-4">Statistik Kehadiran & Cuti</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <p class="text-xs text-slate-500 uppercase">Total Pengajuan</p>
        <p class="text-2xl font-bold text-slate-800">{{ data?.leave_statistics?.total || 0 }}</p>
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Top Work Units -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 class="text-lg font-medium text-slate-800 mb-4">Unit Kerja Terbesar</h3>
        <ul class="divide-y divide-slate-100">
            <li v-for="(unit, index) in data?.top_work_units" :key="index" class="py-3 flex justify-between items-center">
                <span class="text-sm text-slate-600">{{ unit.unit_name }}</span>
                <span class="text-sm font-semibold text-slate-800">{{ unit.total_employees }} Pegawai</span>
            </li>
            <li v-if="!data?.top_work_units?.length" class="text-sm text-slate-500">Belum ada data.</li>
        </ul>
      </div>

       <!-- Gender Stats -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 class="text-lg font-medium text-slate-800 mb-4">Demografi Pegawai</h3>
        <div class="space-y-4">
             <div v-for="(gender, index) in data?.gender_distribution" :key="index">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-slate-600">{{ gender.gender }}</span>
                    <span class="font-medium text-slate-800">{{ gender.total }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${(gender.total / data?.summary?.total_employees) * 100}%` }"></div>
                </div>
             </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UsersIcon, BuildingOfficeIcon, BriefcaseIcon } from '@heroicons/vue/24/outline';
defineProps({
    data: Object
});
</script>
