<template>
  <div class="app-container">
    <div class="unit-kerja-wrapper">
      <header class="modern-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-building"></i>
          </div>
          <div class="header-text">
            <h1>Manajemen Unit Kerja</h1>
            <p>Atur struktur dan hierarki organisasi Anda dengan mudah.</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-icon-text" @click="refreshData" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>{{ loading ? 'Memuat...' : 'Refresh' }}</span>
          </button>
          <button class="btn btn-primary btn-icon-text" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Unit Baru</span>
          </button>
        </div>
      </header>

      <div class="main-card">
        <div class="toolbar">
          <div class="search-wrapper">
            <i class="fas fa-search"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari unit kerja..."
              @keyup.enter="searchData"
              @input="debounceSearch"
            />
          </div>

          <div class="filter-wrapper">
            <div class="select-wrapper">
              <select v-model="filterJenis" @change="applyFilters">
                <option value="" disabled selected>Filter Jenis</option>
                <option value="">Semua Jenis</option>
                <option value="Universitas">Universitas</option>
                <option value="Fakultas">Fakultas</option>
                <option value="Program Studi">Program Studi</option>
                <option value="Departemen">Departemen</option>
                <option value="Bagian">Bagian</option>
                <option value="Sub Bagian">Sub Bagian</option>
                <option value="Unit">Unit</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <i class="fas fa-chevron-down dropdown-icon"></i>
            </div>

            <div class="select-wrapper">
              <select v-model="filterParent" @change="applyFilters">
                <option value="" disabled selected>Filter Parent</option>
                <option value="">Semua Parent</option>
                <option value="null">Root (Tanpa Parent)</option>
                <option v-for="unit in parentUnitList" :key="unit.id" :value="unit.id">
                  {{ unit.nama_unit }}
                </option>
              </select>
              <i class="fas fa-chevron-down dropdown-icon"></i>
            </div>
            
            <button class="btn-icon-only" @click="clearFilters" v-if="hasActiveFilters" title="Reset Filter">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="active-filters-bar" v-if="hasActiveFilters">
            <span class="filter-label">Filter Aktif:</span>
            <span v-if="filterJenis" class="chip">
                {{ filterJenis }} <i class="fas fa-times" @click="filterJenis = ''; applyFilters()"></i>
            </span>
            <span v-if="filterParent !== '' && filterParent !== undefined" class="chip">
                {{ filterParent === 'null' ? 'Root Unit' : getParentName(filterParent) }}
                <i class="fas fa-times" @click="filterParent = ''; applyFilters()"></i>
            </span>
            <span v-if="searchQuery" class="chip">
                "{{ searchQuery }}" <i class="fas fa-times" @click="searchQuery = ''; searchData()"></i>
            </span>
        </div>

        <div class="table-wrapper">
          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
          </div>
          
            <div class="state-container error" v-if="errorMessage">
                <div class="state-icon bg-red">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Gagal Memuat Data</h3>
                <p>{{ errorMessage }}</p>
                <button class="btn btn-primary" @click="fetchUnitKerja">Coba Lagi</button>
            </div>

          <table class="modern-table" v-if="!errorMessage">
            <thead>
              <tr>
                <th width="60">No</th>
                <th>Nama Unit</th>
                <th>Jenis</th>
                <th>Hierarki (Parent)</th>
                <th>Tanggal Dibuat</th>
                <th>Terakhir Diubah</th> <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && unitKerjaList.length === 0">
                <td colspan="7"> <div class="state-container empty">
                        <div class="state-icon bg-blue">
                            <i class="fas fa-folder-open"></i>
                        </div>
                        <h3>Data Kosong</h3>
                        <p>Belum ada data unit kerja yang ditemukan.</p>
                    </div>
                </td>
              </tr>
              <tr v-else v-for="(unit, index) in unitKerjaList" :key="unit.id">
                <td class="text-muted">{{ pagination.from + index }}</td>
                <td>
                  <div class="cell-primary">
                    <span class="font-bold text-dark">{{ unit.nama_unit }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="getJenisBadgeClass(unit.jenis_unit)">
                    {{ unit.jenis_unit }}
                  </span>
                </td>
                <td>
                  <div class="cell-meta" v-if="unit.parent">
                     <i class="fas fa-level-up-alt text-primary"></i>
                     <span>{{ unit.parent.nama_unit }}</span>
                  </div>
                  <div class="cell-meta text-muted" v-else>
                    <i class="fas fa-crown text-warning"></i>
                    <span>Root Unit</span>
                  </div>
                </td>
                <td>
                    <div class="date-cell">
                        <span class="date-main">{{ formatDate(unit.created_at) }}</span>
                        <span class="date-sub">{{ formatTime(unit.created_at) }}</span>
                    </div>
                </td>
                <td>
                    <div class="date-cell">
                        <span class="date-main">{{ formatDate(unit.updated_at) }}</span>
                        <span class="date-sub">{{ formatTime(unit.updated_at) }}</span>
                    </div>
                </td>
                <td>
                  <div class="action-group">
                    <button class="btn-action view" @click="viewDetail(unit)" title="Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" @click="openEditModal(unit)" title="Edit">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-action delete" @click="confirmDelete(unit)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer" v-if="unitKerjaList.length > 0">
          <div class="footer-info">
            Menampilkan <b>{{ pagination.from }}-{{ pagination.to }}</b> dari <b>{{ pagination.total }}</b> data
          </div>
          <div class="pagination-modern" v-if="pagination.lastPage > 1">
            <button 
                class="page-btn prev" 
                :disabled="pagination.currentPage === 1"
                @click="changePage(pagination.currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            <button 
                v-for="page in getPageRange" 
                :key="page"
                class="page-btn number"
                :class="{ 'active': page === pagination.currentPage, 'dots': page === '...' }"
                @click="changePage(page)">
                {{ page }}
            </button>

            <button 
                class="page-btn next" 
                :disabled="pagination.currentPage === pagination.lastPage"
                @click="changePage(pagination.currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal-fade">
        <div v-if="showDetailModal" class="modal-backdrop" @click="closeDetailModal">
            <div class="modal-card" @click.stop>
                <div class="modal-header">
                    <div class="header-title">
                        <h2>Detail Unit Kerja</h2>
                        <span class="id-badge">ID: {{ selectedUnit.id }}</span>
                    </div>
                    <button class="btn-close" @click="closeDetailModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="detail-header-block">
                        <div class="icon-circle">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="detail-titles">
                            <h3>{{ selectedUnit.nama_unit }}</h3>
                            <span class="badge" :class="getJenisBadgeClass(selectedUnit.jenis_unit)">
                                {{ selectedUnit.jenis_unit }}
                            </span>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="info-box">
                            <label>Parent Unit</label>
                            <p v-if="selectedUnit.parent">
                                <i class="fas fa-level-up-alt"></i> {{ selectedUnit.parent.nama_unit }}
                            </p>
                            <p v-else class="text-muted">Root (Unit Utama)</p>
                        </div>
                        
                        <div class="info-box">
                            <label>Tanggal Dibuat</label>
                            <p>{{ formatDateTime(selectedUnit.created_at) }}</p>
                        </div>
                        <div class="info-box">
                            <label>Terakhir Diubah</label>
                            <p>{{ formatDateTime(selectedUnit.updated_at) }}</p>
                        </div>

                        <div class="info-box full-width" v-if="selectedUnit.children && selectedUnit.children.length">
                            <label>Sub Unit (Children)</label>
                            <div class="children-chips">
                                <span v-for="child in selectedUnit.children" :key="child.id" class="child-chip">
                                    {{ child.nama_unit }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeDetailModal">Tutup</button>
                    <button class="btn btn-primary" @click="openEditModal(selectedUnit)">Edit Data</button>
                </div>
            </div>
        </div>
    </Transition>

    <Transition name="modal-fade">
        <div v-if="showFormModal" class="modal-backdrop" @click="closeFormModal">
            <div class="modal-card modal-md" @click.stop>
                <div class="modal-header">
                    <h2>{{ isEditMode ? 'Edit Unit Kerja' : 'Tambah Unit Baru' }}</h2>
                    <button class="btn-close" @click="closeFormModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="submitForm" class="modern-form">
                        <div class="form-group">
                            <label for="nama_unit">Nama Unit</label>
                            <input type="text" id="nama_unit" v-model="formData.nama_unit" placeholder="Misal: Fakultas Ilmu Komputer" required />
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label for="jenis_unit">Jenis Unit</label>
                                <div class="select-wrapper fluid">
                                    <select id="jenis_unit" v-model="formData.jenis_unit" required>
                                        <option value="">Pilih Jenis...</option>
                                        <option value="Universitas">Universitas</option>
                                        <option value="Fakultas">Fakultas</option>
                                        <option value="Program Studi">Program Studi</option>
                                        <option value="Departemen">Departemen</option>
                                        <option value="Bagian">Bagian</option>
                                        <option value="Sub Bagian">Sub Bagian</option>
                                        <option value="Unit">Unit</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    <i class="fas fa-chevron-down dropdown-icon"></i>
                                </div>
                            </div>
                            <div class="form-group half">
                                <label for="parent_id">Parent Unit</label>
                                <div class="select-wrapper fluid">
                                    <select id="parent_id" v-model="formData.parent_id">
                                        <option :value="null">Tidak Ada (Root)</option>
                                        <option v-for="unit in parentUnitList" :key="unit.id" :value="unit.id">
                                            {{ unit.nama_unit }}
                                        </option>
                                    </select>
                                    <i class="fas fa-chevron-down dropdown-icon"></i>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions-right">
                            <button type="button" class="btn btn-text" @click="closeFormModal">Batal</button>
                            <button type="submit" class="btn btn-primary" :disabled="submitting">
                                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                                {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </Transition>

    <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="modal-backdrop" @click="closeDeleteModal">
            <div class="modal-card modal-sm text-center" @click.stop>
                <div class="modal-body">
                    <div class="warning-icon">
                        <i class="fas fa-trash"></i>
                    </div>
                    <h3>Hapus Unit?</h3>
                    <p class="modal-desc">
                        Anda akan menghapus <strong>{{ selectedUnit?.nama_unit }}</strong>. 
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div v-if="selectedUnit?.children?.length > 0" class="alert-box">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>Unit ini memiliki {{ selectedUnit.children.length }} sub-unit.</span>
                    </div>
                    <div class="modal-actions-center">
                        <button class="btn btn-secondary" @click="closeDeleteModal">Batal</button>
                        <button class="btn btn-danger" @click="deleteUnitKerja" :disabled="deleting">
                            {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash'

const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterJenis = ref('')
const filterParent = ref('')
const showDetailModal = ref(false)
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const unitKerjaList = ref([])
const parentUnitList = ref([])
const selectedUnit = ref(null)

const pagination = ref({
  currentPage: 1,
  perPage: 10,
  total: 0,
  lastPage: 1,
  from: 1,
  to: 10,
})

const formData = ref({
  nama_unit: '',
  jenis_unit: '',
  parent_id: null,
})

const hasActiveFilters = computed(() => {
  return (
    filterJenis.value ||
    (filterParent.value !== null && filterParent.value !== undefined && filterParent.value !== '') ||
    searchQuery.value
  )
})

const getPageRange = computed(() => {
  const range = []
  const { currentPage, lastPage } = pagination.value
  const delta = 1
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
    range.push(i)
  }
  if (currentPage - delta > 2) range.unshift('...')
  if (currentPage + delta < lastPage - 1) range.push('...')
  range.unshift(1)
  if (lastPage > 1) range.push(lastPage)
  return range.filter((val, index, self) => self.indexOf(val) === index)
})

const fetchUnitKerja = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const params = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
      search: searchQuery.value,
      jenis_unit: filterJenis.value || undefined,
      parent_id: filterParent.value !== '' ? filterParent.value : undefined
    }
    const response = await api.get('/super-admin/unit-kerja', { params })
    const result = response.data
    
    // Check if success
    if (result.success && result.data) {
        unitKerjaList.value = result.data
        // Handle pagination if provided (simple get() doesn't return full pagination meta usually, but let's see if BE supports it later)
        // Backend UnitKerjaController index() returns `get()` so no pagination metadata by default.
        // We might need to manually handle 'total' related UI if BE doesn't paginate.
        // Assuming Backend returns simple array for now based on Controller code.
        
        pagination.value = {
            currentPage: 1,
            perPage: unitKerjaList.value.length || 10,
            total: unitKerjaList.value.length || 0,
            lastPage: 1,
            from: 1,
            to: unitKerjaList.value.length || 0
        }
    } else {
         unitKerjaList.value = []
    }
  } catch (error) {
    console.error('Error loading unit kerja:', error)
    errorMessage.value = 'Gagal memuat data unit kerja'
  } finally {
    loading.value = false
  }
}

const fetchParentUnits = async () => {
  try {
    // Just fetch all for parent dropdown
    const response = await api.get('/super-admin/unit-kerja')
    if (response.data.success) {
         parentUnitList.value = response.data.data
    }
  } catch (error) {
    console.error(error)
  }
}

const createUnitKerja = async () => {
  try {
    submitting.value = true
    const response = await api.post('/super-admin/unit-kerja', formData.value)
    if (response.data.success) {
        ElMessage.success('Unit kerja berhasil ditambahkan')
        closeFormModal()
        fetchUnitKerja()
        fetchParentUnits()
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Gagal membuat unit kerja')
  } finally {
    submitting.value = false
  }
}

const updateUnitKerja = async () => {
  try {
    submitting.value = true
    const response = await api.put(`/super-admin/unit-kerja/${selectedUnit.value.id}`, formData.value)
    if (response.data.success) {
        ElMessage.success('Unit kerja berhasil diperbarui')
        closeFormModal()
        fetchUnitKerja()
        fetchParentUnits()
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || 'Gagal mengupdate unit kerja')
  } finally {
    submitting.value = false
  }
}

const deleteUnitKerja = async () => {
  try {
    deleting.value = true
    const response = await api.delete(`/super-admin/unit-kerja/${selectedUnit.value.id}`)
    if (response.data.success) {
        ElMessage.success('Unit kerja berhasil dihapus')
        closeDeleteModal()
        fetchUnitKerja()
        fetchParentUnits()
    }
  } catch (error) {
    ElMessage.error('Gagal menghapus unit kerja')
  } finally {
    deleting.value = false
  }
}

const refreshData = () => {
  searchQuery.value = ''
  filterJenis.value = ''
  filterParent.value = ''
  pagination.value.currentPage = 1
  fetchUnitKerja()
}

const searchData = () => {
  pagination.value.currentPage = 1
  fetchUnitKerja()
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  fetchUnitKerja()
}

const clearFilters = () => {
  refreshData()
}

const changePage = (page) => {
  if (page === '...') return
  if (page >= 1 && page <= pagination.value.lastPage) {
    pagination.value.currentPage = page
    fetchUnitKerja()
  }
}

const debounceSearch = debounce(() => {
   searchData()
}, 500)

const openAddModal = () => {
  resetForm()
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = (unit) => {
  selectedUnit.value = unit
  isEditMode.value = true
  showFormModal.value = true
  showDetailModal.value = false
  formData.value = {
    nama_unit: unit.nama_unit,
    jenis_unit: unit.jenis_unit,
    parent_id: unit.parent_id || null,
  }
}

const viewDetail = async (unit) => {
  selectedUnit.value = unit
  showDetailModal.value = true
}

const confirmDelete = (unit) => {
  selectedUnit.value = unit
  showDeleteModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedUnit.value = null
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedUnit.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedUnit.value = null
}

const resetForm = () => {
  formData.value = {
    nama_unit: '',
    jenis_unit: '',
    parent_id: null,
  }
}

const submitForm = async () => {
  if (isEditMode.value) {
    await updateUnitKerja()
  } else {
    await createUnitKerja()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getJenisBadgeClass = (jenis) => {
  switch (jenis) {
    case 'Universitas': return 'badge-indigo'
    case 'Fakultas': return 'badge-blue'
    case 'Program Studi': return 'badge-green'
    case 'Departemen': return 'badge-purple'
    case 'Bagian': return 'badge-orange'
    case 'Sub Bagian': return 'badge-gray'
    case 'Unit': return 'badge-dark'
    default: return 'badge-red'
  }
}

const getParentName = (parentId) => {
  if (parentId === 'null') return 'Root Unit'
  const parent = parentUnitList.value.find((u) => u.id == parentId)
  return parent ? parent.nama_unit : 'Unknown'
}

onMounted(() => {
    fetchUnitKerja()
    fetchParentUnits()
})
</script>

<style scoped>
/* ================= VARIABLES ================= */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --secondary: #64748b;
  --danger: #ef4444;
  --danger-hover: #dc2626;
  --success: #10b981;
  --background: #f3f4f6;
  --card-bg: #ffffff;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-lg: 16px;
  --radius-md: 8px;
  --radius-sm: 4px;
}

.app-container {
  background-color: #f3f4f6;
  min-height: 100vh;
  padding: 32px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1f2937;
}

.unit-kerja-wrapper {
  max-width: 1280px;
  margin: 0 auto;
}

/* ================= HEADER ================= */
.modern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4f46e5, #818cf8);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

.header-text h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.header-text p {
  color: #6b7280;
  margin: 4px 0 0 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* ================= BUTTONS ================= */
.btn {
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon-text i {
  font-size: 14px;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);
}
.btn-primary:hover { background-color: #4338ca; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}
.btn-secondary:hover { background-color: #f9fafb; border-color: #9ca3af; }

.btn-danger {
  background-color: #ef4444;
  color: white;
}
.btn-danger:hover { background-color: #dc2626; }

.btn-text {
  background: transparent;
  color: #6b7280;
}
.btn-text:hover { color: #374151; background: #f3f4f6; }

.btn-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}
.btn-close:hover { background: #f3f4f6; color: #4b5563; }

/* ================= MAIN CARD ================= */
.main-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

/* ================= TOOLBAR & FILTERS ================= */
.toolbar {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-wrapper i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-wrapper input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f9fafb;
  transition: all 0.2s;
}

.search-wrapper input:focus {
  background-color: white;
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filter-wrapper {
  display: flex;
  gap: 12px;
}

.select-wrapper {
  position: relative;
  min-width: 160px;
}

.select-wrapper select {
  width: 100%;
  padding: 10px 32px 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  appearance: none;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}
.select-wrapper select:focus { border-color: #4f46e5; outline: none; }

.dropdown-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  font-size: 12px;
}

.btn-icon-only {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-icon-only:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* Active Filters */
.active-filters-bar {
  padding: 12px 20px;
  background: #f8fafc;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #e5e7eb;
}
.filter-label { font-size: 12px; font-weight: 600; color: #6b7280; margin-right: 5px; }
.chip {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.chip i { cursor: pointer; color: #94a3b8; font-size: 10px; }
.chip i:hover { color: #ef4444; }

/* ================= TABLE ================= */
.table-wrapper {
  position: relative;
  overflow-x: auto;
  min-height: 300px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.modern-table thead th {
  background-color: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.modern-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease;
}
.modern-table tbody tr:last-child { border-bottom: none; }
.modern-table tbody tr:hover { background-color: #f8fafc; }

.modern-table td {
  padding: 16px 20px;
  vertical-align: middle;
  color: #374151;
}

.font-bold { font-weight: 600; }
.text-dark { color: #111827; }
.text-muted { color: #9ca3af; }
.text-primary { color: #4f46e5; }
.text-warning { color: #f59e0b; }
.text-right { text-align: right; }

.cell-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.date-cell { display: flex; flex-direction: column; }
.date-main { font-weight: 500; color: #374151; }
.date-sub { font-size: 12px; color: #9ca3af; }

/* Action Buttons in Table */
.action-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.btn-action.view { background: #eff6ff; color: #3b82f6; }
.btn-action.view:hover { background: #3b82f6; color: white; }

.btn-action.edit { background: #fef3c7; color: #d97706; }
.btn-action.edit:hover { background: #d97706; color: white; }

.btn-action.delete { background: #fee2e2; color: #ef4444; }
.btn-action.delete:hover { background: #ef4444; color: white; }

/* ================= BADGES ================= */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-indigo { background: #e0e7ff; color: #4338ca; }
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-green { background: #d1fae5; color: #065f46; }
.badge-purple { background: #f3e8ff; color: #7e22ce; }
.badge-orange { background: #ffedd5; color: #c2410c; }
.badge-gray { background: #f3f4f6; color: #4b5563; }
.badge-dark { background: #e5e7eb; color: #1f2937; }
.badge-red { background: #fee2e2; color: #991b1b; }

/* ================= PAGINATION ================= */
.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-info { font-size: 13px; color: #6b7280; }

.pagination-modern {
  display: flex;
  gap: 6px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.2s;
  padding: 0 6px;
}
.page-btn:hover:not(:disabled) { background: #f3f4f6; color: #1f2937; border-color: #d1d5db; }
.page-btn.active { background: #4f46e5; color: white; border-color: #4f46e5; }
.page-btn:disabled { opacity: 0.5; cursor: default; }
.page-btn.dots { border: none; background: transparent; cursor: default; }

/* ================= STATES ================= */
.state-container {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.state-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
}
.bg-red { background: #fee2e2; color: #ef4444; }
.bg-blue { background: #eff6ff; color: #3b82f6; }

.state-container h3 { margin: 0 0 8px; font-size: 18px; color: #1f2937; }
.state-container p { margin: 0 0 16px; color: #6b7280; }

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ================= MODALS ================= */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalUp 0.3s ease-out;
}
.modal-md { max-width: 650px; }
.modal-sm { max-width: 400px; }

@keyframes modalUp {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 { margin: 0; font-size: 18px; color: #1f2937; }
.header-title { display: flex; flex-direction: column; }
.id-badge { font-size: 11px; color: #9ca3af; font-family: monospace; }

.modal-body { padding: 24px; }
.modal-footer {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Detail Styling */
.detail-header-block {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}
.icon-circle {
    width: 56px; height: 56px;
    background: #eef2ff;
    color: #4f46e5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}
.detail-titles h3 { margin: 0 0 6px 0; font-size: 20px; color: #111827; }

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.full-width { grid-column: 1 / -1; }
.info-box label { display: block; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.info-box p { margin: 0; font-size: 15px; color: #374151; font-weight: 500; }
.children-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.child-chip { background: #f3f4f6; padding: 6px 12px; border-radius: 6px; font-size: 13px; color: #4b5563; }

/* Form Styling */
.modern-form { display: flex; flex-direction: column; gap: 20px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151; }
.form-group input { 
    width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; 
    border-radius: 8px; font-size: 14px; transition: all 0.2s;
}
.form-group input:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.form-row { display: flex; gap: 16px; }
.half { flex: 1; }
.fluid { width: 100%; }
.form-actions-right { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }

/* Delete Modal Specifics */
.warning-icon { 
    font-size: 40px; color: #ef4444; 
    background: #fef2f2; width: 80px; height: 80px; 
    border-radius: 50%; display: flex; align-items: center; 
    justify-content: center; margin: 0 auto 16px; 
}
.modal-desc { color: #6b7280; margin-bottom: 20px; }
.alert-box { 
    background: #fff7ed; border: 1px solid #fed7aa; color: #c2410c; 
    padding: 12px; border-radius: 8px; font-size: 13px; 
    display: flex; align-items: center; gap: 8px; text-align: left; margin-bottom: 20px;
}
.modal-actions-center { display: flex; justify-content: center; gap: 12px; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>