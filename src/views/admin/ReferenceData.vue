<template>
  <div class="reference-data-container">
    <div class="content-wrapper">
      
      <header class="page-header">
        <div class="header-content">
          <div class="icon-box">
            <i class="fas fa-layer-group"></i>
          </div>
          <div class="header-text">
            <h2>Tabel Referensi</h2>
            <p>Master data sistem (Read Only)</p>
          </div>
        </div>
        
        <button class="btn-refresh" @click="refreshData" :disabled="loading">
          <span class="icon-wrapper" :class="{ 'spinning': loading }">
            <i class="fas fa-sync-alt"></i>
          </span>
          <span>{{ loading ? 'Memuat...' : 'Refresh Data' }}</span>
        </button>
      </header>

      <div class="control-bar">
        <div class="control-wrapper">
          
          <div class="input-group">
            <label>Kategori Data</label>
            <div class="custom-select-wrapper">
              <i class="fas fa-filter input-icon"></i>
              <select v-model="selectedCategory" @change="fetchData" class="modern-select">
                <option value="" disabled selected>Pilih Referensi...</option>
                <option value="roles">Roles</option>
                <option value="agama">Agama</option>
                <option value="pendidikan">Pendidikan</option>
                <option value="status-kawin">Status Pernikahan</option>
                <option value="golongan-darah">Golongan Darah</option>
                <option value="jenis-jabatan">Jenis Jabatan</option>
                <option value="golongan">Golongan </option>
                <option value="pangkat">Pangkat </option>
                <option value="tipe-dokumen">Tipe Dokumen</option>
                <option value="jenis-pegawai">Jenis Pegawai</option>
                <option value="status-kepegawaian">Status Kepegawaian</option>
                <option value="jenis-cuti">Jenis Cuti</option>
              </select>
              <i class="fas fa-chevron-down arrow-icon"></i>
            </div>
          </div>

          <div class="input-group search-group" :class="{ 'disabled': !dataList.length }">
            <label>Pencarian</label>
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                v-model="searchQuery"
                :disabled="!dataList.length"
                placeholder="Cari nama, kode, atau deskripsi..."
              />
            </div>
          </div>
        </div>
      </div>

      <div class="data-surface">
        
        <div v-if="loading" class="state-container">
          <div class="loader"></div>
          <p>Menghubungkan ke database...</p>
        </div>

        <div v-else-if="dataList.length === 0 && !selectedCategory" class="state-container empty">
          <div class="empty-illustration">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3>Belum ada Kategori</h3>
          <p>Silakan pilih kategori referensi di atas untuk memuat data.</p>
        </div>

        <div v-else class="table-container">
          <div class="table-meta">
            <span class="meta-tag">
              Total: <b>{{ filteredData.length }}</b> Item
            </span>
            <span class="meta-tag category-tag" v-if="selectedCategory">
              {{ getCategoryLabel(selectedCategory) }}
            </span>
          </div>

          <div class="table-scroll">
            <table class="modern-table">
              <thead>
                <tr>
                  <th width="80" class="text-center">ID</th>
                  <th>{{ mainColumnLabel }}</th>
                  <th v-if="selectedCategory === 'pangkat'" width="200">Golongan</th>
                  <th v-if="selectedCategory === 'jenis-cuti'" width="150" class="text-center">Durasi</th>
                  <th v-if="selectedCategory === 'jenis-cuti'" width="120" class="text-center">Kode</th>
                  <th v-if="selectedCategory === 'golongan-darah' || selectedCategory === 'tipe-dokumen'">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredData.length === 0">
                  <td :colspan="getColumnCount" class="text-center no-result">
                    <i class="far fa-frown"></i>
                    <p>Tidak ditemukan data "{{ searchQuery }}"</p>
                  </td>
                </tr>
                <tr v-else v-for="item in filteredData" :key="item.id">
                  <td class="text-center">
                    <span class="id-pill">#{{ item.id }}</span>
                  </td>
                  <td class="primary-text">
                    {{ item[mainColumnKey] || item.name || item.description }}
                  </td>
                  <td v-if="selectedCategory === 'pangkat'">
                    <span class="status-badge group">
                      {{ item.golongan_id || '-' }}
                    </span>
                  </td>
                  <td v-if="selectedCategory === 'jenis-cuti'" class="text-center">
                    <span class="status-badge duration">
                      {{ item.maks_hari_per_tahun }} Hari
                    </span>
                  </td>
                  <td v-if="selectedCategory === 'jenis-cuti'" class="text-center">
                    <span class="code-mono">{{ item.kode }}</span>
                  </td>
                  <td v-if="selectedCategory === 'golongan-darah' || selectedCategory === 'tipe-dokumen'">
                    <span class="desc-text">{{ item.keterangan || '-' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/api'
import { ElMessage } from 'element-plus'

// State (Sama seperti sebelumnya)
const selectedCategory = ref('')
const dataList = ref([])
const loading = ref(false)
const searchQuery = ref('')

// Config (Sama seperti sebelumnya)
const columnConfig = {
  'roles': { key: 'nama_role', label: 'Nama Role' },
  'agama': { key: 'nama_agama', label: 'Nama Agama' },
  'pendidikan': { key: 'nama_jenjang', label: 'Jenjang Pendidikan' },
  'status-kawin': { key: 'status', label: 'Status' },
  'golongan-darah': { key: 'kode', label: 'Golongan Darah' },
  'jenis-jabatan': { key: 'nama_jenis', label: 'Jenis Jabatan' },
  'golongan': { key: 'nama_golongan', label: 'Nama Golongan' },
  'pangkat': { key: 'nama_pangkat', label: 'Nama Pangkat' },
  'tipe-dokumen': { key: 'nama_tipe', label: 'Nama Tipe Audit' },
  'jenis-pegawai': { key: 'nama', label: 'Jenis Pegawai' },
  'status-kepegawaian': { key: 'nama_status', label: 'Status Kepegawaian' },
  'jenis-cuti': { key: 'nama_cuti', label: 'Nama Cuti' },
}

const categoryLabels = {
  'roles': 'Roles',
  'agama': 'Agama',
  'pendidikan': 'Pendidikan',
  'status-kawin': 'Status Pernikahan',
  'golongan-darah': 'Golongan Darah',
  'jenis-jabatan': 'Jenis Jabatan',
  'golongan': 'Golongan',
  'pangkat': 'Pangkat',
  'tipe-dokumen': 'Tipe Dokumen',
  'jenis-pegawai': 'Jenis Pegawai',
  'status-kepegawaian': 'Status Kepegawaian',
  'jenis-cuti': 'Jenis Cuti',
}

// Computed Logic
const mainColumnKey = computed(() => columnConfig[selectedCategory.value]?.key || 'name')
const mainColumnLabel = computed(() => columnConfig[selectedCategory.value]?.label || 'Nama')

const filteredData = computed(() => {
  if (!searchQuery.value) return dataList.value
  const lower = searchQuery.value.toLowerCase()
  return dataList.value.filter(item => {
    const val = item[mainColumnKey.value]
    return val && String(val).toLowerCase().includes(lower)
  })
})

const getColumnCount = computed(() => {
  let count = 2
  if (selectedCategory.value === 'ranks') count++
  if (selectedCategory.value === 'leave-types') count += 2
  if (selectedCategory.value === 'blood-types') count++
  return count
})

// Methods
const fetchData = async () => {
  if (!selectedCategory.value) {
    dataList.value = []
    return
  }
  
  loading.value = true
  try {
    const response = await api.get(`/super-admin/reference/${selectedCategory.value}`)
    dataList.value = response.data.data
    searchQuery.value = ''
  } catch (error) {
    console.error('Failed to fetch references', error)
    ElMessage.error('Gagal memuat data referensi')
    dataList.value = []
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  searchQuery.value = ''
  if (selectedCategory.value) {
    fetchData()
  }
}

const getCategoryLabel = (category) => {
  return categoryLabels[category] || category
}
</script>

<style scoped>
/* --- Design System Variables --- */
:root {
  --primary-color: #4f46e5; /* Indigo 600 */
  --primary-hover: #4338ca; /* Indigo 700 */
  --primary-light: #e0e7ff;
  --bg-app: #f3f4f6; /* Cool Gray 100 */
  --bg-surface: #ffffff;
  --text-main: #111827; /* Gray 900 */
  --text-secondary: #6b7280; /* Gray 500 */
  --border-color: #e5e7eb; /* Gray 200 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --radius-lg: 12px;
  --radius-xl: 16px;
}

.reference-data-container {
  min-height: 100vh;
  background-color: #f8fafc; /* Slate 50 */
  padding: 0.75rem 2rem 2rem 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* --- Header Section --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4f46e5, #818cf8);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.header-text h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.header-text p {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.btn-refresh {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-lg);
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-refresh:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* --- Control Bar --- */
.control-bar {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255,255,255,0.5);
}

.control-wrapper {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.input-group label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.5rem;
}

/* Custom Select Styling */
.custom-select-wrapper {
  position: relative;
}

.modern-select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  appearance: none;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.modern-select:focus,
.search-box input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background-color: white;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.arrow-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.8rem;
  pointer-events: none;
}

/* Search Box Styling */
.search-group.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

/* --- Data Surface --- */
.data-surface {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  min-height: 400px;
  position: relative;
  overflow: hidden;
}

/* Table Info */
.table-meta {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  background: #fff;
}

.meta-tag {
  font-size: 0.8rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.category-tag {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
  font-weight: 600;
}

/* Table Styling */
.table-container {
  width: 100%;
}

.table-scroll {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.modern-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.modern-table tr:hover td {
  background-color: #f8fafc;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

/* Cell Specifics */
.id-pill {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
}

.primary-text {
  font-weight: 500;
  color: #0f172a;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.group {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.duration {
  background-color: #dcfce7;
  color: #166534;
}

.code-mono {
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  color: #c026d3;
  font-size: 0.8rem;
}

.desc-text {
  color: #64748b;
  font-style: italic;
}

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
}

.empty-illustration {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.no-result {
  padding: 3rem !important;
  color: #94a3b8;
  font-style: italic;
}

.no-result i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .reference-data-container {
    padding: 1rem;
  }
  
  .control-wrapper {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
}
</style>