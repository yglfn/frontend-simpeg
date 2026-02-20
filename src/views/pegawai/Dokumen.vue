<template>
  <div class="dokumen-page p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <i class="fas fa-folder-open text-2xl"></i>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Dokumen Saya</h1>
          <p class="text-slate-500 text-sm mt-1">Kelola berkas pendukung profil kepegawaian Anda</p>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Tabs Navigation -->
      <div class="border-b border-slate-200 overflow-x-auto">
        <nav class="flex px-4 min-w-max">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id"
            class="px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="currentTab === tab.id 
              ? 'border-teal-500 text-teal-600 bg-teal-50/50' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'"
          >
            <i class="fas" :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <keep-alive>
          <component :is="activeComponent" />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Import components (akan dibuat nanti)
import DokumenPendidikan from './components/dokumen/DokumenPendidikan.vue'
import DokumenJabatan from './components/dokumen/DokumenJabatan.vue'
import DokumenKeluarga from './components/dokumen/DokumenKeluarga.vue'
import DokumenKaryaIlmiah from './components/dokumen/DokumenKaryaIlmiah.vue'

const currentTab = ref('pendidikan')

const tabs = [
  { id: 'pendidikan', name: 'Pendidikan & Diklat', icon: 'fa-graduation-cap' },
  { id: 'jabatan', name: 'Jabatan', icon: 'fa-sitemap' },
  { id: 'keluarga', name: 'Keluarga', icon: 'fa-users' },
  { id: 'karya-ilmiah', name: 'Karya Ilmiah', icon: 'fa-book' },
]

const activeComponent = computed(() => {
  switch (currentTab.value) {
    case 'pendidikan': return DokumenPendidikan
    case 'jabatan': return DokumenJabatan
    case 'keluarga': return DokumenKeluarga
    case 'karya-ilmiah': return DokumenKaryaIlmiah
    default: return DokumenPendidikan
  }
})
</script>
