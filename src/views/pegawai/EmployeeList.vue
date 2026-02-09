<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800">Data Pegawai</h1>
        <p class="text-slate-500 text-sm mt-1">Daftar semua pegawai termasuk nama, NIP, jabatan, dan status.</p>
      </div>
      <router-link to="/employees/create"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium">
        <el-icon><Plus /></el-icon>
        Tambah Pegawai
      </router-link>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-100 bg-slate-50/50">
         <el-input
            v-model="searchQuery"
            placeholder="Cari NIP atau Nama..."
            prefix-icon="Search"
            clearable
            class="w-full max-w-sm"
            @input="handleSearch"
          />
      </div>

      <!-- Table (Element Plus) -->
      <el-table
        v-loading="loading"
        :data="employees"
        style="width: 100%"
        stripe
        highlight-current-row
      >
        <el-table-column label="Nama / NIP" min-width="250">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <el-avatar :size="40" :src="scope.row.profile?.photo_url || `https://ui-avatars.com/api/?name=${scope.row.name}&background=random`" />
              <div>
                <div class="font-bold text-slate-800">{{ scope.row.name }}</div>
                <div class="text-xs text-slate-500">{{ scope.row.nip }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Jabatan" min-width="200">
           <template #default="scope">
             {{ scope.row.position?.position_name || '-' }}
           </template>
        </el-table-column>

        <el-table-column label="Unit Kerja" min-width="200">
           <template #default="scope">
             {{ scope.row.work_unit?.name || '-' }}
           </template>
        </el-table-column>

        <el-table-column label="Status" width="120">
          <template #default="scope">
             <el-tag type="success" effect="light" round>Aktif</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Aksi" width="120" fixed="right" align="center">
          <template #default="scope">
            <div class="flex justify-center gap-2">
                 <el-button link type="primary" size="small">Edit</el-button>
                 <el-button link type="danger" size="small">Hapus</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination Placeholder -->
      <div class="p-4 flex justify-end border-t border-slate-100">
         <el-pagination layout="prev, pager, next" :total="employees.length" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';
import api from '@/services/api';
import { debounce } from 'lodash';

const employees = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const fetchEmployees = async () => {
    loading.value = true;
    try {
        const response = await api.get('/employees');
        // Handle pagination/data wrapper
        employees.value = response.data.data ? response.data.data : response.data; 
    } catch (error) {
        console.error("Error fetching employees", error);
    } finally {
        loading.value = false;
    }
};

const handleSearch = debounce(() => {
    // Implement search logic if API supports it
    fetchEmployees(); 
}, 500);

onMounted(() => {
    fetchEmployees();
});
</script>
