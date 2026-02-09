<template>
  <div class="app-container">
    <div class="content-wrapper">
      <header class="modern-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-sitemap"></i>
          </div>
          <div class="header-text">
            <h1>Manajemen Jabatan</h1>
            <p>Kelola data jabatan, kelas, dan struktur organisasi.</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-icon-text" @click="refreshData" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>{{ loading ? 'Memuat...' : 'Refresh' }}</span>
          </button>
          <button class="btn btn-primary btn-icon-text" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Jabatan Baru</span>
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
              placeholder="Cari kode, nama, atau keterangan..."
              @keyup.enter="searchData"
              @input="debounceSearch"
            />
          </div>

          <div class="filter-wrapper">
            <div class="select-wrapper">
              <select v-model="filterJenis" @change="applyFilters">
                <option value="" disabled selected>Filter Jenis</option>
                <option value="">Semua Jenis</option>
                <option v-for="jenis in positionTypes" :key="jenis.id" :value="jenis.id">
                  {{ jenis.nama_jenis }}
                </option>
              </select>
              <i class="fas fa-chevron-down dropdown-icon"></i>
            </div>

            <div class="select-wrapper">
              <select v-model="filterGolongan" @change="applyFilters">
                <option value="" disabled selected>Filter Golongan</option>
                <option value="">Semua Golongan</option>
                <option v-for="golongan in groups" :key="golongan.id" :value="golongan.id">
                  {{ golongan.nama_golongan }}
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
             Jenis: {{ getJenisName(filterJenis) }} <i class="fas fa-times" @click="filterJenis = ''; applyFilters()"></i>
          </span>
          <span v-if="filterGolongan" class="chip">
             Golongan: {{ getGolonganName(filterGolongan) }} <i class="fas fa-times" @click="filterGolongan = ''; applyFilters()"></i>
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
            <button class="btn btn-primary" @click="fetchJabatan">Coba Lagi</button>
          </div>

          <table class="modern-table" v-if="!errorMessage">
            <thead>
              <tr>
                <th width="50">No</th>
                <th>Kode</th>
                <th>Nama Jabatan</th>
                <th>Jenis & Golongan</th>
                <th>Kelas</th>
                <th>Tunjangan</th>
                <th>Terakhir Diubah</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && jabatanList.length === 0">
                <td colspan="8">
                  <div class="state-container empty">
                    <div class="state-icon bg-blue">
                      <i class="fas fa-inbox"></i>
                    </div>
                    <h3>Data Kosong</h3>
                    <p>Belum ada data jabatan yang ditemukan.</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="(jabatan, index) in jabatanList" :key="jabatan.id">
                <td class="text-muted">{{ pagination.from + index }}</td>
                <td>
                  <span class="code-badge">{{ jabatan.kode_jabatan }}</span>
                </td>
                <td>
                  <div class="cell-primary">
                    <span class="font-bold text-dark">{{ jabatan.nama_jabatan }}</span>
                    <span v-if="jabatan.keterangan" class="small-note text-muted">{{ truncateText(jabatan.keterangan, 30) }}</span>
                  </div>
                </td>
                <td>
                  <div class="stacked-badges">
                    <span class="badge" :class="getJenisBadgeClass(jabatan.jenis_jabatan_nama)">
                      {{ jabatan.jenis_jabatan_nama || '-' }}
                    </span>
                    <span class="badge badge-gray" v-if="jabatan.golongan_id">
                      Gol: {{ jabatan.golongan_nama }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="class-circle">{{ jabatan.kelas_jabatan }}</div>
                </td>
                <td>
                  <span class="currency-text">
                    {{ formatCurrency(jabatan.tunjangan_jabatan) }}
                  </span>
                </td>
                <td>
                    <div class="date-cell">
                        <span class="date-main">{{ formatDate(jabatan.updated_at || jabatan.created_at) }}</span>
                        <span class="date-sub">{{ formatTime(jabatan.updated_at || jabatan.created_at) }}</span>
                    </div>
                </td>
                <td>
                  <div class="action-group">
                    <button class="btn-action view" @click="viewDetail(jabatan)" title="Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" @click="openEditModal(jabatan)" title="Edit">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-action delete" @click="confirmDelete(jabatan)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer" v-if="jabatanList.length > 0">
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

    <Transition name="modal-fade">
      <div v-if="showDetailModal" class="modal-backdrop" @click="closeDetailModal">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <div class="header-title">
              <h2>Detail Jabatan</h2>
              <span class="id-badge">ID: {{ selectedJabatan.id }}</span>
            </div>
            <button class="btn-close" @click="closeDetailModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="detail-header-block">
              <div class="icon-circle bg-indigo">
                <span class="code-text">{{ selectedJabatan.kode_jabatan }}</span>
              </div>
              <div class="detail-titles">
                <h3>{{ selectedJabatan.nama_jabatan }}</h3>
                <span class="badge" :class="getJenisBadgeClass(selectedJabatan.jenis_jabatan_nama)">
                  {{ selectedJabatan.jenis_jabatan_nama }}
                </span>
              </div>
            </div>

            <div class="detail-grid">
              <div class="info-box">
                <label>Golongan</label>
                <p>{{ selectedJabatan.golongan_nama || '-' }}</p>
              </div>
              <div class="info-box">
                <label>Kelas Jabatan</label>
                <div class="class-circle small">{{ selectedJabatan.kelas_jabatan }}</div>
              </div>
              <div class="info-box full-width">
                <label>Tunjangan Jabatan</label>
                <p class="currency-large">{{ formatCurrency(selectedJabatan.tunjangan_jabatan) }}</p>
              </div>
              <div class="info-box">
                <label>Dibuat Pada</label>
                <p>{{ formatDateTime(selectedJabatan.created_at) }}</p>
              </div>
              <div class="info-box">
                <label>Terakhir Diubah</label>
                <p>{{ formatDateTime(selectedJabatan.updated_at) }}</p>
              </div>
              <div class="info-box full-width" v-if="selectedJabatan.keterangan">
                <label>Keterangan / Catatan</label>
                <div class="note-box">
                  {{ selectedJabatan.keterangan }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDetailModal">Tutup</button>
            <button class="btn btn-primary" @click="openEditModal(selectedJabatan)">Edit Data</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="showFormModal" class="modal-backdrop" @click="closeFormModal">
        <div class="modal-card modal-lg" @click.stop>
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Edit Jabatan' : 'Tambah Jabatan Baru' }}</h2>
            <button class="btn-close" @click="closeFormModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm" class="modern-form">
              <div class="form-row">
                <div class="form-group half">
                  <label for="kode_jabatan">Kode Jabatan <span class="text-danger">*</span></label>
                  <input type="text" id="kode_jabatan" v-model="formData.position_code" placeholder="Contoh: RKT, WKT" required />
                </div>
                <div class="form-group half">
                  <label for="nama_jabatan">Nama Jabatan <span class="text-danger">*</span></label>
                  <input type="text" id="nama_jabatan" v-model="formData.position_name" placeholder="Contoh: Rektor" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label for="jenis_jabatan">Jenis Jabatan <span class="text-danger">*</span></label>
                  <div class="select-wrapper fluid">
                    <select id="jenis_jabatan" v-model="formData.position_type_id" required>
                      <option value="">Pilih Jenis...</option>
                      <option v-for="jenis in positionTypes" :key="jenis.id" :value="jenis.id">
                        {{ jenis.nama_jenis }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="form-group half">
                  <label for="golongan">Golongan <span class="text-danger">*</span></label>
                  <div class="select-wrapper fluid">
                    <select id="golongan" v-model="formData.group_id" required>
                      <option value="">Pilih Golongan...</option>
                      <option v-for="golongan in groups" :key="golongan.id" :value="golongan.id">
                        {{ golongan.nama_golongan }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label for="kelas_jabatan">Kelas Jabatan <span class="text-danger">*</span></label>
                  <input type="number" id="kelas_jabatan" v-model="formData.position_class" min="1" max="20" placeholder="1-18" required />
                </div>
                <div class="form-group half">
                  <label for="tunjangan">Tunjangan (Rp) <span class="text-danger">*</span></label>
                  <input type="number" id="tunjangan" v-model="formData.position_allowance" min="0" placeholder="0" required />
                </div>
              </div>

              <div class="form-group">
                <label for="keterangan">Keterangan / Catatan</label>
                <textarea id="keterangan" v-model="formData.notes" rows="3" placeholder="Tambahkan keterangan opsional..."></textarea>
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

    <Transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-backdrop" @click="closeDeleteModal">
        <div class="modal-card modal-sm text-center" @click.stop>
          <div class="modal-body">
            <div class="warning-icon">
              <i class="fas fa-trash"></i>
            </div>
            <h3>Hapus Jabatan?</h3>
            <p class="modal-desc">
              Anda akan menghapus jabatan <strong>{{ selectedJabatan?.nama_jabatan }}</strong>.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div class="modal-actions-center">
              <button class="btn btn-secondary" @click="closeDeleteModal">Batal</button>
              <button class="btn btn-danger" @click="deleteJabatan" :disabled="deleting">
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

// State
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const filterJenis = ref('')
const filterGolongan = ref('')
const showDetailModal = ref(false)
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const deleting = ref(false)

// Data
const jabatanList = ref([])
const selectedJabatan = ref(null)
const positionTypes = ref([])
const groups = ref([])

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  total: 0,
  lastPage: 1,
  from: 1,
  to: 10,
})

// Form Data - SESUAIKAN DENGAN BACKEND
const formData = ref({
  kode_jabatan: '',
  nama_jabatan: '',
  jenis_jabatan_id: '',
  golongan_id: '',
  kelas_jabatan: '',
  tunjangan_jabatan: '',
  keterangan: '',
})

// Computed Properties
const hasActiveFilters = computed(() => {
  return filterJenis.value || filterGolongan.value || searchQuery.value
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

// ==================== API FUNCTIONS ====================

const fetchReferences = async () => {
  try {
    // Sesuaikan endpoint dengan backend yang ada
    const [types, grps] = await Promise.all([
      api.get('/super-admin/reference/jenis-jabatan'), // Updated endpoint
      api.get('/super-admin/reference/golongan') // Updated endpoint
    ])
    positionTypes.value = types.data.data || types.data
    groups.value = grps.data.data || grps.data
  } catch(e) {
    console.error('Error fetching references:', e)
    // Fallback data jika tidak ada endpoint
    positionTypes.value = []
    groups.value = []
  }
}

const fetchJabatan = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    // Sesuaikan parameter dengan backend
    const params = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
      search: searchQuery.value || undefined,
      jenis_jabatan_id: filterJenis.value || undefined,
      golongan_id: filterGolongan.value || undefined
    }

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

    // Endpoint mungkin '/jabatan' atau '/positions'
    const response = await api.get('super-admin/jabatan', { params })
    const result = response.data

    if (result.success && result.data) {
      jabatanList.value = result.data
      
      // Jika backend punya meta untuk pagination
      if (result.meta) {
        pagination.value = {
          currentPage: result.meta.current_page || 1,
          perPage: result.meta.per_page || 10,
          total: result.meta.total || 0,
          lastPage: result.meta.last_page || 1,
          from: result.meta.from || 1,
          to: result.meta.to || 0,
        }
      } else {
        // Jika tidak ada meta, hitung manual
        pagination.value = {
          currentPage: 1,
          perPage: jabatanList.value.length || 10,
          total: jabatanList.value.length || 0,
          lastPage: 1,
          from: 1,
          to: jabatanList.value.length || 0
        }
      }
    } else {
      // Jika response format berbeda
      jabatanList.value = result.data || result
      pagination.value = {
        currentPage: 1,
        perPage: jabatanList.value.length || 10,
        total: jabatanList.value.length || 0,
        lastPage: 1,
        from: 1,
        to: jabatanList.value.length || 0
      }
    }
  } catch (error) {
    console.error('Error loading jabatan:', error.response || error)
    errorMessage.value = error.response?.data?.message || 'Gagal memuat data jabatan.'
    
    // Fallback untuk development: coba endpoint alternatif
    if (error.response?.status === 404) {
      console.log('Trying alternative endpoint...')
      // Anda bisa menambahkan fallback logic di sini
    }
  } finally {
    loading.value = false
  }
}

const createJabatan = async () => {
  try {
    submitting.value = true
    
    // Sesuaikan payload dengan backend
    const payload = {
      kode_jabatan: formData.value.kode_jabatan,
      nama_jabatan: formData.value.nama_jabatan,
      jenis_jabatan_id: formData.value.jenis_jabatan_id,
      golongan_id: formData.value.golongan_id,
      kelas_jabatan: Number(formData.value.kelas_jabatan) || null,
      tunjangan_jabatan: Number(formData.value.tunjangan_jabatan) || 0,
      keterangan: formData.value.keterangan || ''
    }
    
    console.log('Creating jabatan with payload:', payload)
    
    const response = await api.post('super-admin/jabatan', payload)
    
    if (response.data.success) {
      ElMessage.success('Jabatan berhasil ditambahkan')
      closeFormModal()
      fetchJabatan()
    } else {
      ElMessage.error(response.data.message || 'Gagal menambah jabatan')
    }
  } catch (error) {
    console.error('Error creating jabatan:', error.response || error)
    
    // Tampilkan error validasi jika ada
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0]?.[0]
      ElMessage.error(firstError || 'Data tidak valid')
    } else {
      ElMessage.error(error.response?.data?.message || 'Gagal menambah jabatan')
    }
  } finally {
    submitting.value = false
  }
}

const updateJabatan = async () => {
  try {
    submitting.value = true
    
    // Sesuaikan payload dengan backend
    const payload = {
      kode_jabatan: formData.value.kode_jabatan,
      nama_jabatan: formData.value.nama_jabatan,
      jenis_jabatan_id: formData.value.jenis_jabatan_id,
      golongan_id: formData.value.golongan_id,
      kelas_jabatan: Number(formData.value.kelas_jabatan) || null,
      tunjangan_jabatan: Number(formData.value.tunjangan_jabatan) || 0,
      keterangan: formData.value.keterangan || ''
    }
    
    console.log('Updating jabatan with payload:', payload)
    
    const response = await api.put(`super-admin/jabatan/${selectedJabatan.value.id}`, payload)
    
    if (response.data.success) {
      ElMessage.success('Jabatan berhasil diperbarui')
      closeFormModal()
      fetchJabatan()
    } else {
      ElMessage.error(response.data.message || 'Gagal memperbarui jabatan')
    }
  } catch (error) {
    console.error('Error updating jabatan:', error.response || error)
    
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0]?.[0]
      ElMessage.error(firstError || 'Data tidak valid')
    } else {
      ElMessage.error(error.response?.data?.message || 'Gagal memperbarui jabatan')
    }
  } finally {
    submitting.value = false
  }
}

const deleteJabatan = async () => {
  try {
    deleting.value = true
    
    const response = await api.delete(`super-admin/jabatan/${selectedJabatan.value.id}`)
    
    if (response.data.success) {
      ElMessage.success('Jabatan berhasil dihapus')
      closeDeleteModal()
      fetchJabatan()
    } else {
      ElMessage.error(response.data.message || 'Gagal menghapus jabatan')
    }
  } catch (error) {
    console.error('Error deleting jabatan:', error.response || error)
    ElMessage.error(error.response?.data?.message || 'Gagal menghapus jabatan')
  } finally {
    deleting.value = false
  }
}

// ==================== UI FUNCTIONS ====================

const refreshData = () => {
  searchQuery.value = ''
  filterJenis.value = ''
  filterGolongan.value = ''
  pagination.value.currentPage = 1
  fetchJabatan()
}

const searchData = () => {
  pagination.value.currentPage = 1
  fetchJabatan()
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  fetchJabatan()
}

const clearFilters = () => {
  refreshData()
}

const changePage = (page) => {
  if (page === '...') return
  if (page >= 1 && page <= pagination.value.lastPage) {
    pagination.value.currentPage = page
    fetchJabatan()
  }
}

const debounceSearch = debounce(() => {
  searchData()
}, 500)

// ==================== MODAL FUNCTIONS ====================

const openAddModal = () => {
  resetForm()
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = (jabatan) => {
  selectedJabatan.value = jabatan
  isEditMode.value = true
  showFormModal.value = true
  showDetailModal.value = false

  // Mapping data dari backend ke formData
  formData.value = {
    kode_jabatan: jabatan.kode_jabatan,
    nama_jabatan: jabatan.nama_jabatan,
    jenis_jabatan_id: jabatan.jenis_jabatan_id,
    golongan_id: jabatan.golongan_id,
    kelas_jabatan: jabatan.kelas_jabatan,
    tunjangan_jabatan: jabatan.tunjangan_jabatan,
    keterangan: jabatan.keterangan,
  }
}

const viewDetail = (jabatan) => {
  selectedJabatan.value = jabatan
  showDetailModal.value = true
}

const confirmDelete = (jabatan) => {
  selectedJabatan.value = jabatan
  showDeleteModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedJabatan.value = null
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedJabatan.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedJabatan.value = null
}

const resetForm = () => {
  formData.value = {
    kode_jabatan: '',
    nama_jabatan: '',
    jenis_jabatan_id: '',
    golongan_id: '',
    kelas_jabatan: '',
    tunjangan_jabatan: '',
    keterangan: '',
  }
}

const submitForm = async () => {
  if (isEditMode.value) {
    await updateJabatan()
  } else {
    await createJabatan()
  }
}

// ==================== UTILITY FUNCTIONS ====================

// Helper untuk mengakses data dengan field yang mungkin berbeda
const getJabatanCode = (jabatan) => {
  return jabatan.kode_jabatan || jabatan.position_code || '-'
}

const getJabatanName = (jabatan) => {
  return jabatan.nama_jabatan || jabatan.position_name || '-'
}

const getJabatanJenis = (jabatan) => {
  return jabatan.jenis_jabatan_nama || jabatan.position_type?.type_name || jabatan.jenisJabatan?.nama_jenis || '-'
}

const getJabatanGolongan = (jabatan) => {
  return jabatan.golongan_nama || jabatan.group?.group_name || jabatan.golongan?.nama_golongan || '-'
}

const getJabatanKelas = (jabatan) => {
  return jabatan.kelas_jabatan || jabatan.position_class || '-'
}

const getJabatanTunjangan = (jabatan) => {
  return jabatan.tunjangan_jabatan || jabatan.position_allowance || 0
}

const getJabatanNotes = (jabatan) => {
  return jabatan.keterangan || jabatan.notes || ''
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getJenisBadgeClass = (typeName) => {
  if (!typeName) return 'badge-gray'
  const name = String(typeName).toLowerCase()
  if (name.includes('struktur')) return 'badge-indigo'
  if (name.includes('fungsi')) return 'badge-green'
  if (name.includes('laksana')) return 'badge-blue'
  return 'badge-gray'
}

const getJenisName = (id) => {
  const jenis = positionTypes.value.find(j => j.id == id)
  return jenis ? (jenis.nama_jenis) : id
}

const getGolonganName = (id) => {
  const golongan = groups.value.find(g => g.id == id)
  return golongan ? (golongan.nama_golongan) : id
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

onMounted(() => {
  fetchReferences()
  fetchJabatan()
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
}

.app-container {
  background-color: #f3f4f6;
  min-height: 100vh;
  padding: 32px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1f2937;
}

.content-wrapper {
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

.btn-icon-text i { font-size: 14px; }

.btn-primary {
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);
}
.btn-primary:hover { background-color: #4338ca; transform: translateY(-1px); }
.btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}
.btn-secondary:hover { background-color: #f9fafb; border-color: #9ca3af; }

.btn-danger { background-color: #ef4444; color: white; }
.btn-danger:hover { background-color: #dc2626; }

.btn-text { background: transparent; color: #6b7280; }
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

.filter-wrapper { display: flex; gap: 12px; }

.select-wrapper { position: relative; min-width: 160px; }

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
  width: 40px; height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-icon-only:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* Active Filters */
.active-filters-bar {
  padding: 12px 20px;
  background: #f8fafc;
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
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
  display: flex; align-items: center; gap: 6px;
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
.modern-table tbody tr:hover { background-color: #f8fafc; }

.modern-table td {
  padding: 16px 20px;
  vertical-align: middle;
  color: #374151;
}

.font-bold { font-weight: 600; }
.text-dark { color: #111827; }
.text-muted { color: #9ca3af; }
.text-danger { color: #ef4444; }
.text-right { text-align: right; }
.cell-primary { display: flex; flex-direction: column; }
.small-note { font-size: 11px; margin-top: 2px; }

/* Specific Jabatan Column Styles */
.code-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.class-circle {
  width: 32px; height: 32px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.class-circle.small { width: 40px; height: 40px; font-size: 16px; margin: 0; }

.currency-text {
  font-family: 'Inter', sans-serif;
  color: #059669;
  font-weight: 600;
}

.stacked-badges { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
.date-cell { display: flex; flex-direction: column; }
.date-main { font-weight: 500; color: #374151; }
.date-sub { font-size: 12px; color: #9ca3af; }

.action-group { display: flex; gap: 8px; justify-content: flex-end; }
.btn-action {
  width: 32px; height: 32px;
  border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; font-size: 13px;
}
.btn-action.view { background: #eff6ff; color: #3b82f6; }
.btn-action.view:hover { background: #3b82f6; color: white; }
.btn-action.edit { background: #fef3c7; color: #d97706; }
.btn-action.edit:hover { background: #d97706; color: white; }
.btn-action.delete { background: #fee2e2; color: #ef4444; }
.btn-action.delete:hover { background: #ef4444; color: white; }

/* ================= BADGES ================= */
.badge {
  display: inline-block; padding: 4px 10px;
  border-radius: 9999px; font-size: 11px;
  font-weight: 600; text-transform: capitalize;
}
.badge-indigo { background: #e0e7ff; color: #4338ca; }
.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-green { background: #d1fae5; color: #065f46; }
.badge-gray { background: #f3f4f6; color: #4b5563; }

/* ================= PAGINATION ================= */
.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}
.footer-info { font-size: 13px; color: #6b7280; }
.pagination-modern { display: flex; gap: 6px; }
.page-btn {
  min-width: 32px; height: 32px;
  border: 1px solid #e5e7eb; background: white; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 13px; color: #6b7280; transition: all 0.2s; padding: 0 6px;
}
.page-btn:hover:not(:disabled) { background: #f3f4f6; color: #1f2937; }
.page-btn.active { background: #4f46e5; color: white; border-color: #4f46e5; }
.page-btn:disabled { opacity: 0.5; cursor: default; }
.page-btn.dots { border: none; background: transparent; cursor: default; }

/* ================= STATES ================= */
.state-container { padding: 48px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; }
.state-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px; }
.bg-red { background: #fee2e2; color: #ef4444; }
.bg-blue { background: #eff6ff; color: #3b82f6; }
.state-container h3 { margin: 0 0 8px; font-size: 18px; }
.state-container p { margin: 0 0 16px; color: #6b7280; }

.loading-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex; align-items: center; justify-content: center; z-index: 10;
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #e5e7eb; border-top-color: #4f46e5;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ================= MODALS ================= */
.modal-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}
.modal-card {
  background: white; border-radius: 16px;
  width: 100%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: modalUp 0.3s ease-out;
}
.modal-lg { max-width: 700px; }
.modal-sm { max-width: 400px; }

@keyframes modalUp {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #f3f4f6;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { margin: 0; font-size: 18px; color: #1f2937; }
.header-title { display: flex; flex-direction: column; }
.id-badge { font-size: 11px; color: #9ca3af; font-family: monospace; }

.modal-body { padding: 24px; }
.modal-footer {
  padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb;
  display: flex; justify-content: flex-end; gap: 12px;
}

/* Detail Styling */
.detail-header-block { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.icon-circle {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.icon-circle.bg-indigo { background: #e0e7ff; color: #4338ca; font-weight: 700; font-family: monospace; }
.detail-titles h3 { margin: 0 0 6px 0; font-size: 20px; color: #111827; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: 1 / -1; }
.info-box label { display: block; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.info-box p { margin: 0; font-size: 15px; color: #374151; font-weight: 500; }
.currency-large { font-size: 18px; color: #059669; font-weight: 700; }
.note-box { background: #f9fafb; padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.5; color: #4b5563; border: 1px solid #e5e7eb; white-space: pre-line; }

/* Form Styling */
.modern-form { display: flex; flex-direction: column; gap: 20px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151; }
.form-group input, .form-group textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 14px; transition: all 0.2s;
}
.form-group input:focus, .form-group textarea:focus { border-color: #4f46e5; outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.form-row { display: flex; gap: 16px; }
.half { flex: 1; }
.fluid { width: 100%; }
.form-actions-right { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }

/* Delete Modal Specifics */
.warning-icon {
  font-size: 40px; color: #ef4444; background: #fef2f2;
  width: 80px; height: 80px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
}
.modal-desc { color: #6b7280; margin-bottom: 20px; }
.modal-actions-center { display: flex; justify-content: center; gap: 12px; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>