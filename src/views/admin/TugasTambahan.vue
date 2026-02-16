<template>
  <div class="app-container">
    <div class="content-wrapper">
      <header class="modern-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="header-text">
            <h1>Manajemen Tugas Tambahan</h1>
            <p>Kelola data tugas tambahan dan unit kerja terkait.</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-icon-text" @click="refreshData" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>{{ loading ? 'Memuat...' : 'Refresh' }}</span>
          </button>
          <button class="btn btn-primary btn-icon-text" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Tugas Tambahan Baru</span>
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
              placeholder="Cari nama tugas atau keterangan..."
              @keyup.enter="searchData"
              @input="debounceSearch"
            />
          </div>

          <div class="filter-wrapper">
             <div class="select-wrapper">
              <select v-model="filterUnit" @change="applyFilters">
                <option value="" disabled selected>Filter Unit Kerja</option>
                <option value="">Semua Unit Kerja</option>
                <option v-for="unit in unitKerjaList" :key="unit.id" :value="unit.id">
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
          <span v-if="filterUnit" class="chip">
             Unit: {{ getUnitName(filterUnit) }} <i class="fas fa-times" @click="filterUnit = ''; applyFilters()"></i>
          </span>
          <span v-if="searchQuery" class="chip">
             "{{ searchQuery }}" <i class="fas fa-times" @click="searchQuery = ''; searchData()"></i>
          </span>
        </div>

        <div class="table-wrapper">
          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
          </div>

          <div v-if="errorMessage" class="state-container error">
            <div class="state-icon bg-red">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Gagal Memuat Data</h3>
            <p>{{ errorMessage }}</p>
            <button class="btn btn-primary" @click="fetchData">Coba Lagi</button>
          </div>

          <table class="modern-table" v-if="!errorMessage">
            <thead>
              <tr>
                <th width="50">No</th>
                <th>Nama Tugas</th>
                <th>Unit Kerja</th>
                <th>Keterangan</th>
                <th>Terakhir Diubah</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && dataList.length === 0">
                <td colspan="6">
                  <div class="state-container empty">
                    <div class="state-icon bg-blue">
                      <i class="fas fa-inbox"></i>
                    </div>
                    <h3>Data Kosong</h3>
                    <p>Belum ada data tugas tambahan yang ditemukan.</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in dataList" :key="item.id">
                <td class="text-muted">{{ pagination.from + index }}</td>
                <td>
                  <span class="font-bold text-dark">{{ item.nama_tugas }}</span>
                </td>
                <td>
                  <span class="badge badge-blue">
                      {{ item.unit_kerja_nama || '-' }}
                  </span>
                </td>
                <td>
                   <span v-if="item.keterangan" class="small-note text-muted">{{ truncateText(item.keterangan, 50) }}</span>
                   <span v-else class="text-muted">-</span>
                </td>
                <td>
                    <div class="date-cell">
                        <span class="date-main">{{ formatDate(item.updated_at || item.created_at) }}</span>
                    </div>
                </td>
                <td>
                  <div class="action-group">
                    <button class="btn-action edit" @click="openEditModal(item)" title="Edit">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-action delete" @click="confirmDelete(item)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer" v-if="dataList.length > 0">
          <div class="footer-info">
            Menampilkan <b>{{ pagination.from }}-{{ pagination.to }}</b> dari <b>{{ pagination.total }}</b> data
          </div>
          <div class="pagination-modern" v-if="pagination.lastPage > 1">
            <button class="page-btn prev" :disabled="pagination.currentPage === 1" @click="changePage(pagination.currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              v-for="page in getPageRange"
              :key="page"
              class="page-btn number"
              :class="{ 'active': page === pagination.currentPage, 'dots': page === '...' }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <button class="page-btn next" :disabled="pagination.currentPage === pagination.lastPage" @click="changePage(pagination.currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Transition name="modal-fade">
      <div v-if="showFormModal" class="modal-backdrop" @click="closeFormModal">
        <div class="modal-card modal-md" @click.stop>
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Edit Tugas Tambahan' : 'Tambah Tugas Tambahan' }}</h2>
            <button class="btn-close" @click="closeFormModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm" class="modern-form">
              <div class="form-group">
                <label for="nama_tugas">Nama Tugas Tambahan <span class="text-danger">*</span></label>
                <input type="text" id="nama_tugas" v-model="formData.nama_tugas" placeholder="Contoh: Kepala Laboratorium" required />
              </div>

               <div class="form-group">
                  <label for="unit_kerja">Unit Kerja <span class="text-danger">*</span></label>
                  <div class="select-wrapper fluid">
                    <select id="unit_kerja" v-model="formData.unit_kerja_id" required>
                      <option value="">Pilih Unit Kerja...</option>
                      <option v-for="unit in unitKerjaList" :key="unit.id" :value="unit.id">
                        {{ unit.nama_unit }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
               </div>

              <div class="form-group">
                <label for="keterangan">Keterangan</label>
                <textarea id="keterangan" v-model="formData.keterangan" rows="3" placeholder="Keterangan opsional..."></textarea>
              </div>

              <div class="form-actions-right">
                <button type="button" class="btn btn-text" @click="closeFormModal">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                  {{ submitting ? 'Menyimpan...' : 'Simpan Data' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-backdrop" @click="closeDeleteModal">
        <div class="modal-card modal-sm text-center" @click.stop>
          <div class="modal-body">
            <div class="warning-icon">
              <i class="fas fa-trash"></i>
            </div>
            <h3>Hapus Data?</h3>
            <p class="modal-desc">
              Anda akan menghapus tugas tambahan <strong>{{ selectedItem?.nama_tugas }}</strong>.
              Tindakan ini <strong>tidak dapat dibatalkan</strong>.
            </p>
            
            <div class="form-group" style="margin: 15px 0;">
                <label class="d-block mb-2 text-muted small">Ketik <strong>{{ selectedItem?.nama_tugas || 'KONFIRMASI' }}</strong> untuk melanjutkan:</label>
                <input 
                    type="text" 
                    v-model="deleteConfirmationInput" 
                    class="form-control text-center" 
                    placeholder="Ketik disini..." 
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;"
                />
            </div>

            <div class="modal-actions-center">
              <button class="btn btn-secondary" @click="closeDeleteModal">Batal</button>
              <button 
                class="btn btn-danger" 
                @click="deleteData" 
                :disabled="deleting || deleteConfirmationInput !== (selectedItem?.nama_tugas || 'KONFIRMASI')"
              >
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
import { useToast } from '@/composables/useToast'
import { debounce } from 'lodash'

const { showToast } = useToast()

// State
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterUnit = ref('')
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const deleteConfirmationInput = ref('')

// Data
const dataList = ref([])
const unitKerjaList = ref([])
const selectedItem = ref(null)

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  total: 0,
  lastPage: 1,
  from: 1,
  to: 10,
})

// Form Data
const formData = ref({
  nama_tugas: '',
  unit_kerja_id: '',
  keterangan: '',
})

// Computed
const hasActiveFilters = computed(() => {
  return filterUnit.value || searchQuery.value
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

const getUnitName = (id) => {
    const unit = unitKerjaList.value.find(u => u.id == id)
    return unit ? unit.nama_unit : '...'
}

// API Functions
const fetchReferences = async () => {
  try {
    const response = await api.get('/super-admin/unit-kerja')
    unitKerjaList.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching unit kerja:', error)
  }
}

const fetchData = async () => {
    try {
        loading.value = true
        errorMessage.value = ''
        
        // Simulating search and filter client-side if backend doesn't support it tailored for this simple table
        // Or using params if backend supports it. The controller seems to return all data in index().
        // Let's assume we fetch all and filter client side for now or adjust if backend supports filtering params.
        // Based on controller: TugasTambahan::with('unitKerja')->orderBy('id', 'asc')->get(); 
        // It does NOT support query params for search/filter in the index method shown previously.
        
        const response = await api.get('/super-admin/tugas-tambahan')
        let allData = response.data.data || []
        
        // Client-side filtering
        if (searchQuery.value) {
            const lower = searchQuery.value.toLowerCase()
            allData = allData.filter(item => 
                item.nama_tugas.toLowerCase().includes(lower) || 
                (item.keterangan && item.keterangan.toLowerCase().includes(lower))
            )
        }
        
        if (filterUnit.value) {
            allData = allData.filter(item => item.unit_kerja_id == filterUnit.value)
        }
        
        // Manual Pagination
        pagination.value.total = allData.length
        pagination.value.lastPage = Math.ceil(allData.length / pagination.value.perPage)
        
        const start = (pagination.value.currentPage - 1) * pagination.value.perPage
        const end = start + pagination.value.perPage
        
        dataList.value = allData.slice(start, end)
        
        pagination.value.from = start + 1
        pagination.value.to = Math.min(end, pagination.value.total)
        
        if (pagination.value.total === 0) {
             pagination.value.from = 0
        }

    } catch (error) {
        console.error('Error fetching data:', error)
        errorMessage.value = 'Gagal memuat data.'
    } finally {
        loading.value = false
    }
}

const createData = async () => {
    try {
        submitting.value = true
        await api.post('/super-admin/tugas-tambahan', formData.value)
        showToast('Berhasil menambahkan tugas tambahan')
        closeFormModal()
        fetchData()
    } catch (error) {
        console.error('Create error:', error)
        showToast(error.response?.data?.message || 'Gagal menambahkan data', 'error')
    } finally {
        submitting.value = false
    }
}

const updateData = async () => {
    try {
        submitting.value = true
        await api.put(`/super-admin/tugas-tambahan/${selectedItem.value.id}`, formData.value)
        showToast('Berhasil memperbarui data')
        closeFormModal()
        fetchData()
    } catch (error) {
        console.error('Update error:', error)
        showToast(error.response?.data?.message || 'Gagal memperbarui data', 'error')
    } finally {
        submitting.value = false
    }
}

const deleteData = async () => {
    try {
        deleting.value = true
        await api.delete(`/super-admin/tugas-tambahan/${selectedItem.value.id}`)
        showToast('Data berhasil dihapus')
        closeDeleteModal()
        fetchData()
    } catch (error) {
        console.error('Delete error:', error)
        showToast(error.response?.data?.message || 'Gagal menghapus data', 'error')
    } finally {
        deleting.value = false
    }
}

// UI Functions
const refreshData = () => {
    searchQuery.value = ''
    filterUnit.value = ''
    pagination.value.currentPage = 1
    fetchData()
}

const searchData = () => {
    pagination.value.currentPage = 1
    fetchData()
}

const applyFilters = () => {
    pagination.value.currentPage = 1
    fetchData()
}

const clearFilters = () => {
    refreshData()
}

const changePage = (page) => {
    if (page === '...') return
    if (page >= 1 && page <= pagination.value.lastPage) {
        pagination.value.currentPage = page
        fetchData()
    }
}

const debounceSearch = debounce(() => {
    searchData()
}, 500)

const truncateText = (text, len) => {
    if (!text) return ''
    if (text.length <= len) return text
    return text.substring(0, len) + '...'
}

const formatDate = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Modal Functions
const openAddModal = () => {
    resetForm()
    isEditMode.value = false
    showFormModal.value = true
}

const openEditModal = (item) => {
    selectedItem.value = item
    isEditMode.value = true
    formData.value = {
        nama_tugas: item.nama_tugas,
        unit_kerja_id: item.unit_kerja_id,
        keterangan: item.keterangan || '',
    }
    showFormModal.value = true
}

const confirmDelete = (item) => {
    selectedItem.value = item
    deleteConfirmationInput.value = ''
    showDeleteModal.value = true
}

const closeFormModal = () => {
    showFormModal.value = false
    selectedItem.value = null
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    selectedItem.value = null
}

const resetForm = () => {
    formData.value = {
        nama_tugas: '',
        unit_kerja_id: '',
        keterangan: '',
    }
}

const submitForm = () => {
    if (isEditMode.value) {
        updateData()
    } else {
        createData()
    }
}

// Lifecycle
onMounted(async () => {
    await fetchReferences()
    fetchData()
})

</script>

<style scoped>
/* Reuse styles from Jabatan.vue or global styles */
/* Reuse styles from Jabatan.vue or global styles */
/* @import '../assets/css/admin-styles.css'; */ 

/* =========================================
   STYLES COPIED FROM Jabatan.vue
   (Since admin-styles.css is missing)
   ========================================= */

.app-container {
  display: flex; flex-direction: column; height: 100vh; background-color: #f3f4f6;
}
.content-wrapper {
  padding: 24px; overflow-y: auto; flex: 1;
}

/* Header */
.modern-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
}
.header-content { display: flex; align-items: center; gap: 16px; }
.header-icon {
  width: 48px; height: 48px; background: white; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: #4f46e5; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.header-text h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0; letter-spacing: -0.025em; }
.header-text p { margin: 4px 0 0; color: #6b7280; font-size: 14px; }

.header-actions { display: flex; gap: 12px; }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 14px;
  cursor: pointer; transition: all 0.2s; border: 1px solid transparent;
}
.btn-primary { background-color: #4f46e5; color: white; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
.btn-primary:hover { background-color: #4338ca; transform: translateY(-1px); }
.btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; transform: none; }

.btn-secondary { background-color: white; color: #374151; border-color: #d1d5db; }
.btn-secondary:hover { background-color: #f9fafb; border-color: #9ca3af; }

.btn-text { background: transparent; color: #6b7280; }
.btn-text:hover { color: #111827; background: #f3f4f6; }

.btn-danger { background-color: #ef4444; color: white; }
.btn-danger:hover { background-color: #dc2626; }

/* Main Card */
.main-card {
  background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden; border: 1px solid #f3f4f6;
}

/* Toolbar */
.toolbar {
  padding: 20px; border-bottom: 1px solid #f3f4f6;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}

.search-wrapper { position: relative; width: 300px; }
.search-wrapper i {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;
}
.search-wrapper input {
  width: 100%; padding: 10px 12px 10px 38px; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; background-color: #f9fafb; transition: all 0.2s;
}
.search-wrapper input:focus {
  background-color: white; border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filter-wrapper { display: flex; gap: 12px; }
.select-wrapper { position: relative; min-width: 160px; }
.select-wrapper select {
  width: 100%; padding: 10px 32px 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: white; appearance: none; font-size: 14px; color: #374151; cursor: pointer;
}
.select-wrapper select:focus { border-color: #4f46e5; outline: none; }
.dropdown-icon {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; font-size: 12px;
}

.btn-icon-only {
  width: 40px; height: 40px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: white; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.btn-icon-only:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* Active Filters */
.active-filters-bar {
  padding: 12px 20px; background: #f8fafc; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; border-bottom: 1px solid #e5e7eb;
}
.filter-label { font-size: 12px; font-weight: 600; color: #6b7280; margin-right: 5px; }
.chip {
  background: white; border: 1px solid #e2e8f0; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 6px;
}
.chip i { cursor: pointer; color: #94a3b8; font-size: 10px; }
.chip i:hover { color: #ef4444; }

/* Table */
.table-wrapper { position: relative; overflow-x: auto; min-height: 300px; }
.modern-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.modern-table thead th {
  background-color: #f9fafb; color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding: 16px 20px; text-align: left; border-bottom: 1px solid #e5e7eb;
}
.modern-table tbody tr { border-bottom: 1px solid #f3f4f6; transition: background-color 0.15s ease; }
.modern-table tbody tr:hover { background-color: #f8fafc; }
.modern-table td { padding: 16px 20px; vertical-align: middle; color: #374151; }

.font-bold { font-weight: 600; }
.text-dark { color: #111827; }
.text-muted { color: #9ca3af; }
.text-danger { color: #ef4444; }
.text-right { text-align: right; }
.small-note { font-size: 11px; margin-top: 2px; }

.badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.badge-blue { background: #e0f2fe; color: #0369a1; }

.date-cell { display: flex; flex-direction: column; }
.date-main { font-weight: 500; color: #374151; }

.action-group { display: flex; gap: 8px; justify-content: flex-end; }
.btn-action {
  width: 32px; height: 32px; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 13px;
}
.btn-action.edit { background: #fef3c7; color: #d97706; }
.btn-action.edit:hover { background: #d97706; color: white; }
.btn-action.delete { background: #fee2e2; color: #ef4444; }
.btn-action.delete:hover { background: #ef4444; color: white; }

/* Footer & Pagination */
.card-footer {
  padding: 16px 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}
.footer-info { font-size: 13px; color: #6b7280; }
.pagination-modern { display: flex; gap: 6px; }
.page-btn {
  min-width: 32px; height: 32px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; color: #6b7280; transition: all 0.2s; padding: 0 6px;
}
.page-btn:hover:not(:disabled) { background: #f3f4f6; color: #1f2937; }
.page-btn.active { background: #4f46e5; color: white; border-color: #4f46e5; }
.page-btn:disabled { opacity: 0.5; cursor: default; }

/* States */
.state-container { padding: 48px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; }
.state-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px; }
.bg-red { background: #fee2e2; color: #ef4444; }
.bg-blue { background: #eff6ff; color: #3b82f6; }
.state-container h3 { margin: 0 0 8px; font-size: 18px; }
.state-container p { margin: 0 0 16px; color: #6b7280; }

.loading-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.8); display: flex; align-items: center; justify-content: center; z-index: 10;
}
.spinner {
  width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Modals */
.modal-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(17, 24, 39, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px;
}
.modal-card {
  background: white; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; animation: modalUp 0.3s ease-out;
}
.modal-md { max-width: 500px; }
.modal-sm { max-width: 400px; }

@keyframes modalUp {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { margin: 0; font-size: 18px; color: #1f2937; }
.btn-close { background: transparent; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; }
.btn-close:hover { color: #4b5563; }

.modal-body { padding: 24px; }

/* Form */
.modern-form { display: flex; flex-direction: column; gap: 20px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151; }
.form-group input, .form-group textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: all 0.2s;
}
.form-group input:focus, .form-group textarea:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.fluid { width: 100%; }
.form-actions-right { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }

/* Delete Modal */
.warning-icon {
  font-size: 40px; color: #ef4444; background: #fef2f2; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
}
.modal-desc { color: #6b7280; margin-bottom: 20px; }
.modal-actions-center { display: flex; justify-content: center; gap: 12px; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
