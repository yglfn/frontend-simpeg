<template>
  <div class="app-container">
    <div class="content-wrapper">
      <header class="modern-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="header-text">
            <h1>Manajemen Data Pegawai</h1>
            <p>Kelola data pegawai, jabatan, dan unit kerja.</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-icon-text" @click="refreshData" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>{{ loading ? 'Memuat...' : 'Refresh' }}</span>
          </button>
          <button class="btn btn-primary btn-icon-text" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Pegawai Baru</span>
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
              placeholder="Cari NIP, nama, atau email..."
              @keyup.enter="searchData"
              @input="debounceSearch"
            />
          </div>

          <div class="filter-wrapper">
            <div class="select-wrapper">
              <select v-model="filterPosition" @change="applyFilters">
                <option value="" disabled selected>Filter Jabatan</option>
                <option value="">Semua Jabatan</option>
                <option v-for="position in positions" :key="position.id" :value="position.id">
                  {{ position.nama_jabatan }}
                </option>
              </select>
              <i class="fas fa-chevron-down dropdown-icon"></i>
            </div>

            <div class="select-wrapper">
              <select v-model="filterWorkUnit" @change="applyFilters">
                <option value="" disabled selected>Filter Unit Kerja</option>
                <option value="">Semua Unit</option>
                <option v-for="unit in work_units" :key="unit.id" :value="unit.id">
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
          <span v-if="filterPosition" class="chip">
             Jabatan: {{ getPositionName(filterPosition) }} <i class="fas fa-times" @click="filterPosition = ''; applyFilters()"></i>
          </span>
          <span v-if="filterWorkUnit" class="chip">
             Unit: {{ getWorkUnitName(filterWorkUnit) }} <i class="fas fa-times" @click="filterWorkUnit = ''; applyFilters()"></i>
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
            <button class="btn btn-primary" @click="fetchEmployees">Coba Lagi</button>
          </div>

          <table class="modern-table" v-if="!errorMessage">
            <thead>
              <tr>
                <th width="50">No</th>
                <th>NIP</th>
                <th>Nama Pegawai</th>
                <th>Jabatan</th>
                <th>Unit Kerja</th>
                <th>Status</th>
                <th>Terakhir Diubah</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && employeeList.length === 0">
                <td colspan="8">
                  <div class="state-container empty">
                    <div class="state-icon bg-blue">
                      <i class="fas fa-inbox"></i>
                    </div>
                    <h3>Data Kosong</h3>
                    <p>Belum ada data pegawai yang ditemukan.</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="(employee, index) in employeeList" :key="employee.id">
                <td class="text-muted">{{ pagination.from + index }}</td>
                <td>
                  <span class="code-badge">{{ employee.profile?.nip || '-' }}</span>
                </td>
                <td>
                  <div class="cell-primary">
                    <span class="font-bold text-dark">{{ employee.profile?.nama_lengkap || employee.user?.username || 'Tidak Ada Nama' }}</span>
                    <span class="small-note text-muted">{{ employee.profile?.nip || '-' }}<br>{{ employee.user?.email || '-' }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge badge-indigo" v-if="employee.jabatan">
                    {{ employee.jabatan.nama_jabatan || '-' }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span class="badge badge-blue" v-if="employee.unit_kerja">
                    {{ employee.unit_kerja.nama_unit || '-' }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(employee.status_kepegawaian?.nama_status)">
                    {{ employee.status_kepegawaian?.nama_status || 'Tidak Ada Status' }}
                  </span>
                </td>
                <td>
                    <div class="date-cell">
                        <span class="date-main">{{ formatDate(employee.updated_at || employee.created_at) }}</span>
                        <span class="date-sub">{{ formatTime(employee.updated_at || employee.created_at) }}</span>
                    </div>
                </td>
                <td>
                  <div class="action-group">
                    <button class="btn-action view" @click="viewDetail(employee)" title="Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" @click="openEditModal(employee)" title="Edit">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-action delete" @click="confirmDelete(employee)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer" v-if="employeeList.length > 0">
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

    <!-- Detail Modal -->
    <Transition name="modal-fade">
      <div v-if="showDetailModal" class="modal-backdrop" @click="closeDetailModal">
        <div class="modal-card modal-lg" @click.stop>
          <div class="modal-header">
            <div class="header-title">
              <h2>Detail Pegawai</h2>
              <span class="id-badge">ID: {{ selectedEmployee.id }}</span>
            </div>
            <button class="btn-close" @click="closeDetailModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <!-- Header Pegawai -->
            <div class="detail-header-block">
              <div class="icon-circle bg-indigo">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="detail-titles">
                <h3>{{ selectedEmployee.profile?.nama_lengkap || 'Tidak Ada Nama' }}</h3>
                <span class="badge badge-green">{{ selectedEmployee.status_kepegawaian?.nama_status || '-' }}</span>
              </div>
            </div>

            <!-- ========== SECTION: Data Pribadi ========== -->
            <div class="detail-section">
              <div class="detail-section-header">
                <i class="fas fa-id-card"></i>
                <span>Data Pribadi</span>
              </div>
              <div class="detail-grid">
                <div class="info-box">
                  <label>NIP</label>
                  <p>{{ selectedEmployee.profile?.nip || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Email</label>
                  <p>{{ selectedEmployee.profile?.user?.email || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Tempat, Tanggal Lahir</label>
                  <p>
                    {{ selectedEmployee.profile?.tempat_lahir ? selectedEmployee.profile.tempat_lahir + ', ' : '' }}
                    {{ formatDate(selectedEmployee.profile?.tanggal_lahir) }}
                  </p>
                </div>
                <div class="info-box">
                  <label>Jenis Kelamin</label>
                  <p>{{ selectedEmployee.profile?.jenis_kelamin === 'L' ? 'Laki-laki' : (selectedEmployee.profile?.jenis_kelamin === 'P' ? 'Perempuan' : '-') }}</p>
                </div>
                <div class="info-box">
                  <label>Agama</label>
                  <p>{{ selectedEmployee.profile?.agama?.nama_agama || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Status Pernikahan</label>
                  <p>{{ selectedEmployee.profile?.status_kawin?.status || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Pendidikan Terakhir</label>
                  <p>{{ selectedEmployee.profile?.pendidikan?.nama_jenjang || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Golongan Darah</label>
                  <p>{{ selectedEmployee.profile?.golongan_darah?.golongan_darah || '-' }}</p>
                </div>
                <div class="info-box full-width">
                  <label>Telepon</label>
                  <p>{{ selectedEmployee.profile?.telepon || '-' }}</p>
                </div>
              </div>
            </div>

            <!-- ========== SECTION: Data Kepegawaian ========== -->
            <div class="detail-section">
              <div class="detail-section-header">
                <i class="fas fa-briefcase"></i>
                <span>Data Kepegawaian</span>
              </div>
              <div class="detail-grid">
                <div class="info-box">
                  <label>Jenis Pegawai</label>
                  <p>{{ selectedEmployee.jenis_pegawai?.nama_jenis || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Status Kepegawaian</label>
                  <p>{{ selectedEmployee.status_kepegawaian?.nama_status || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Jabatan</label>
                  <p>{{ selectedEmployee.jabatan?.nama_jabatan || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Unit Kerja</label>
                  <p>{{ selectedEmployee.unit_kerja?.nama_unit || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Pangkat</label>
                  <p>{{ selectedEmployee.pangkat?.nama_pangkat || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>Golongan</label>
                  <p>{{ selectedEmployee.golongan?.nama_golongan || '-' }}</p>
                </div>
                <div class="info-box">
                  <label>TMT CPNS</label>
                  <p>{{ formatDate(selectedEmployee.profile?.tmt_cpns) }}</p>
                </div>
                <div class="info-box">
                  <label>TMT PNS</label>
                  <p>{{ formatDate(selectedEmployee.profile?.tmt_pns) }}</p>
                </div>
              </div>
            </div>

            <!-- ========== SECTION: Informasi Lainnya ========== -->
            <div class="detail-section">
              <div class="detail-section-header">
                <i class="fas fa-info-circle"></i>
                <span>Informasi Lainnya</span>
              </div>
              <div class="detail-grid">
                <div class="info-box">
                  <label>Dibuat Pada</label>
                  <p>{{ formatDateTime(selectedEmployee.created_at) }}</p>
                </div>
                <div class="info-box">
                  <label>Terakhir Diubah</label>
                  <p>{{ formatDateTime(selectedEmployee.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDetailModal">Tutup</button>
            <button class="btn btn-primary" @click="openEditModal(selectedEmployee)">Edit Data</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Form Modal (Add/Edit) -->
    <Transition name="modal-fade">
      <div v-if="showFormModal" class="modal-backdrop" @click="closeFormModal">
        <div class="modal-card modal-lg" @click.stop>
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Edit Pegawai' : 'Tambah Pegawai Baru' }}</h2>
            <button class="btn-close" @click="closeFormModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm" class="modern-form">
              <!-- Data User -->
              <div class="form-section-title">Informasi Akun</div>
              
              <div class="info-alert" v-if="!isEditMode">
                <i class="fas fa-info-circle"></i>
                <p>
                  <strong>Info Login Otomatis:</strong><br>
                  Username: Tanpa Spasi (NIP)<br>
                  Password Default: Tanggal Lahir (YYYYMMDD)
                </p>
              </div>

              <div class="form-row">
                <div class="form-group fluid">
                  <label for="email">Email</label>
                  <input type="email" id="email" v-model="formData.email" placeholder="Email pribadi (opsional)" />
                </div>
              </div>

              <!-- Data Profile -->
              <div class="form-section-title">Identitas Pribadi</div>
              <div class="form-row">
                <div class="form-group half">
                  <label for="nip">NIP <span class="text-danger">*</span></label>
                  <input type="text" id="nip" v-model="formData.nip" required placeholder="NIP Baru" />
                </div>
                <div class="form-group half">
                  <label for="nama_lengkap">Nama Lengkap (Tanpa Gelar) <span class="text-danger">*</span></label>
                  <input type="text" id="nama_lengkap" v-model="formData.nama_lengkap" required placeholder="Nama Sesuai KTP" />
                </div>
              </div>

              <div class="form-row three-cols">
                <div class="form-group">
                  <label for="gelar_depan_1">Gelar Depan 1</label>
                  <input type="text" id="gelar_depan_1" v-model="formData.gelar_depan_1" placeholder="Contoh: Dr." />
                </div>
                <div class="form-group">
                  <label for="gelar_depan_2">Gelar Depan 2</label>
                  <input type="text" id="gelar_depan_2" v-model="formData.gelar_depan_2" placeholder="Contoh: H." />
                </div>
                <div class="form-group">
                  <label for="gelar_belakang">Gelar Belakang</label>
                  <input type="text" id="gelar_belakang" v-model="formData.gelar_belakang" placeholder="Contoh: S.Kom, M.T" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label for="tempat_lahir">Tempat Lahir</label>
                  <input type="text" id="tempat_lahir" v-model="formData.tempat_lahir" />
                </div>
                <div class="form-group half">
                  <label for="tanggal_lahir">Tanggal Lahir <span class="text-danger">*</span></label>
                  <input type="date" id="tanggal_lahir" v-model="formData.tanggal_lahir" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label for="jenis_kelamin">Jenis Kelamin <span class="text-danger">*</span></label>
                  <div class="select-wrapper fluid">
                    <select id="jenis_kelamin" v-model="formData.jenis_kelamin" required>
                      <option value="">Pilih...</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="form-group half">
                  <label for="golongan_darah_id">Golongan Darah</label>
                  <div class="select-wrapper fluid">
                    <select id="golongan_darah_id" v-model="formData.golongan_darah_id">
                      <option value="">Pilih...</option>
                      <option v-for="blood in bloodTypes" :key="blood.id" :value="blood.id">{{ blood.kode }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label for="agama_id">Agama</label>
                  <div class="select-wrapper fluid">
                    <select id="agama_id" v-model="formData.agama_id">
                      <option value="">Pilih...</option>
                      <option v-for="rel in religions" :key="rel.id" :value="rel.id">{{ rel.nama_agama }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                 <div class="form-group half">
                  <label for="status_kawin_id">Status Pernikahan</label>
                  <div class="select-wrapper fluid">
                    <select id="status_kawin_id" v-model="formData.status_kawin_id">
                      <option value="">Pilih...</option>
                      <option v-for="status in maritalStatuses" :key="status.id" :value="status.id">{{ status.status }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
              </div>

              <div class="form-row">
                 <div class="form-group fluid">
                  <label for="pendidikan_id">Pendidikan Terakhir</label>
                  <div class="select-wrapper fluid">
                    <select id="pendidikan_id" v-model="formData.pendidikan_id">
                      <option value="">Pilih...</option>
                      <option v-for="edu in educations" :key="edu.id" :value="edu.id">{{ edu.nama_jenjang }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                 <div class="form-group fluid">
                  <label for="telepon">Nomor Telepon</label>
                  <input type="text" id="telepon" v-model="formData.telepon" placeholder="08..." />
                </div>
              </div>

              <!-- Data Kepegawaian -->
              <div class="form-section-title">Data Kepegawaian</div>
              <div class="form-row">
                <div class="form-group half">
                  <label for="employment_status_id">Status Pegawai <span class="text-danger">*</span></label>
                  <div class="select-wrapper fluid">
                    <select id="employment_status_id" v-model="formData.status_kepegawaian_id" required>
                      <option value="">Pilih...</option>
                      <option v-for="status in employmentStatuses" :key="status.id" :value="status.id">{{ status.nama_status }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="form-group half">
                   <label for="jenis_pegawai_id">Jenis Pegawai</label>
                   <div class="select-wrapper fluid">
                    <select id="jenis_pegawai_id" v-model="formData.jenis_pegawai_id">
                      <option value="">Pilih...</option>
                      <option v-for="type in employeeTypes" :key="type.id" :value="type.id">{{ type.nama }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                   </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                   <label for="jabatan_id">Jabatan <span class="text-danger">*</span></label>
                   <div class="select-wrapper fluid">
                    <select id="jabatan_id" v-model="formData.jabatan_id" required>
                      <option value="">Pilih...</option>
                      <option v-for="pos in positions" :key="pos.id" :value="pos.id">{{ pos.nama_jabatan }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                   </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                   <label for="unit_kerja_id">Unit Kerja</label>
                   <div class="select-wrapper fluid">
                    <select id="unit_kerja_id" v-model="formData.unit_kerja_id">
                      <option value="">Pilih...</option>
                      <option v-for="unit in work_units" :key="unit.id" :value="unit.id">{{ unit.nama_unit }}</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                   </div>
                </div>
                <div class="form-group half">
                   <label for="pangkat_id">Pangkat/Golongan</label>
                   <div class="select-wrapper fluid">
                    <select id="pangkat_id" v-model="formData.pangkat_id" @change="formData.golongan_id = ranks.find(r => r.id === formData.pangkat_id)?.golongan_id || ''">
                      <option value="">Pilih...</option>
                      <option v-for="rank in ranks" :key="rank.id" :value="rank.id">{{ rank.nama_pangkat }} ({{ rank.nama_golongan }})</option>
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                   </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label for="tmt_cpns">TMT CPNS</label>
                  <input type="date" id="tmt_cpns" v-model="formData.tmt_cpns" />
                </div>
                <div class="form-group half">
                  <label for="tmt_pns">TMT PNS</label>
                  <input type="date" id="tmt_pns" v-model="formData.tmt_pns" />
                </div>
              </div>

              <div class="form-row three-cols">
                <div class="form-group">
                   <label for="no_sk_jabatan">Nomor SK Jabatan <span class="text-danger">*</span></label>
                   <input type="text" id="no_sk_jabatan" v-model="formData.no_sk_jabatan" required placeholder="Nomor SK" />
                </div>
                <div class="form-group">
                   <label for="tanggal_sk_jabatan">Tanggal SK <span class="text-danger">*</span></label>
                   <input type="date" id="tanggal_sk_jabatan" v-model="formData.tanggal_sk_jabatan" required />
                </div>
                <div class="form-group">
                   <label for="tmt_jabatan">TMT Jabatan <span class="text-danger">*</span></label>
                   <input type="date" id="tmt_jabatan" v-model="formData.tmt_jabatan" required />
                </div>
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
            <h3>Hapus Pegawai?</h3>
            <p class="modal-desc">
              Anda akan menghapus pegawai <strong>{{ selectedEmployee?.profile?.nama_lengkap || 'Tidak Ada Nama' }}</strong>.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div class="modal-actions-center">
              <button class="btn btn-secondary" @click="closeDeleteModal">Batal</button>
              <button class="btn btn-danger" @click="deleteEmployee" :disabled="deleting">
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
const filterPosition = ref('')
const filterWorkUnit = ref('')
const showDetailModal = ref(false)
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const deleting = ref(false)

// Data
const employeeList = ref([])
const selectedEmployee = ref(null)
const positions = ref([])
const work_units = ref([])
const ranks = ref([])
const employmentStatuses = ref([])
const religions = ref([])
const educations = ref([])
const maritalStatuses = ref([])
const bloodTypes = ref([])
const employeeTypes = ref([])


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
  // Profile Data
  nip: '',
  nama_lengkap: '',
  gelar_depan_1: '',
  gelar_depan_2: '',
  gelar_belakang: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: '',
  agama_id: '',
  pendidikan_id: '',
  status_kawin_id: '',
  alamat_1_id: null,
  alamat_2_id: null,
  kode_pos: '',
  telepon: '',
  golongan_darah_id: '',
  bank_id: '',
  tmt_cpns: '',
  tmt_pns: '',
  
  // Pegawai Data
  jenis_pegawai_id: '',
  status_kepegawaian_id: '', // Mapped from employment_status_id
  jabatan_id: '',            // Mapped from position_id
  unit_kerja_id: '',         // Mapped from work_unit_id
  pangkat_id: '',            // Mapped from rank_id (Assuming Pangkat includes Golongan via relation or selected separate? Backend uses pangkat_id and golongan_id can be derived or selected separate)
  golongan_id: '',           // Added if needed, but often derived from Pangkat
  // Riwayat Jabatan Awal (Required by Backend Store)
  tmt_jabatan: '',
  no_sk_jabatan: '', // Added for no_sk
  tanggal_sk_jabatan: '', // Added for tanggal_sk
})

// Computed Properties
const hasActiveFilters = computed(() => {
  return filterPosition.value || filterWorkUnit.value || searchQuery.value
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

// Helper Functions for UI (Chips)
const getPositionName = (id) => {
    const pos = positions.value.find(p => p.id == id)
    return pos ? pos.nama_jabatan : '...'
}

const getWorkUnitName = (id) => {
    const unit = work_units.value.find(u => u.id == id)
    return unit ? unit.nama_unit : '...'
}

const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-gray'
    if (status.toLowerCase().includes('pns')) return 'badge-green'
    if (status.toLowerCase().includes('pppk')) return 'badge-blue'
    if (status.toLowerCase().includes('honorer')) return 'badge-orange'
    return 'badge-gray'
}

// ... existing code ...

const createEmployee = async () => {
  try {
    submitting.value = true
    
    // Ensure IDs are null if empty string
    const payload = { ...formData.value }
    for (const key in payload) {
        if (payload[key] === '') payload[key] = null
    }
    
    await api.post('/super-admin/profile-pegawai', payload)
    ElMessage.success('Pegawai berhasil ditambahkan')
    closeFormModal()
    fetchEmployees()
  } catch (error) {
    console.error('Create Error', error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors
        // Show first error message
        const firstError = Object.values(errors)[0][0]
        ElMessage.error(firstError)
    } else {
        ElMessage.error(error.response?.data?.message || 'Gagal menambah pegawai')
    }
  } finally {
    submitting.value = false
  }
}

const updateEmployee = async () => {
  try {
    submitting.value = true
     // Ensure IDs are null if empty string
    const payload = { ...formData.value }
    for (const key in payload) {
        if (payload[key] === '') payload[key] = null
    }
    
    await api.put(`/super-admin/profile-pegawai/${selectedEmployee.value.profile_id}`, payload)
    ElMessage.success('Pegawai berhasil diperbarui')
    closeFormModal()
    fetchEmployees()
  } catch (error) {
     console.error('Update Error', error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors
        const firstError = Object.values(errors)[0][0]
        ElMessage.error(firstError)
    } else {
        ElMessage.error(error.response?.data?.message || 'Gagal memperbarui pegawai')
    }
  } finally {
    submitting.value = false
  }
}

const deleteEmployee = async () => {
  try {
    deleting.value = true
    await api.delete(`/super-admin/profile-pegawai/${selectedEmployee.value.profile_id}`)
    ElMessage.success('Pegawai berhasil dihapus')
    closeDeleteModal()
    fetchEmployees()
  } catch (error) {
    ElMessage.error('Gagal menghapus pegawai')
  } finally {
    deleting.value = false
  }
}

// Ensure openEditModal maps correctly
const openEditModal = (employee) => {
    selectedEmployee.value = employee
    isEditMode.value = true
    showFormModal.value = true
    showDetailModal.value = false
    
    // Map Profile fields
    formData.value = {
        nip: employee.profile?.nip || '',
        nama_lengkap: employee.profile?.nama_lengkap || '',
        gelar_depan_1: employee.profile?.gelar_depan_1 || '',
        gelar_depan_2: employee.profile?.gelar_depan_2 || '',
        gelar_belakang: employee.profile?.gelar_belakang || '',
        tempat_lahir: employee.profile?.tempat_lahir || '',
        tanggal_lahir: formatDateForInput(employee.profile?.tanggal_lahir),
        jenis_kelamin: employee.profile?.jenis_kelamin || '',
        agama_id: employee.profile?.agama_id || '',
        pendidikan_id: employee.profile?.pendidikan_id || '',
        status_kawin_id: employee.profile?.status_kawin_id || '',
        alamat_1_id: employee.profile?.alamat_1_id || '',
        alamat_2_id: employee.profile?.alamat_2_id || '',
        kode_pos: employee.profile?.kode_pos || '',
        telepon: employee.profile?.telepon || '',
        golongan_darah_id: employee.profile?.golongan_darah_id || '',
        bank_id: employee.profile?.bank_id || '',
        tmt_cpns: formatDateForInput(employee.profile?.tmt_cpns),
        tmt_pns: formatDateForInput(employee.profile?.tmt_pns),
        
        // Map Pegawai fields (Directly from employee object now)
        jenis_pegawai_id: employee.jenis_pegawai_id || '',
        status_kepegawaian_id: employee.status_kepegawaian_id || '',
        jabatan_id: employee.jabatan_id || '',
        unit_kerja_id: employee.unit_kerja_id || '',
        pangkat_id: employee.pangkat_id || '',
        golongan_id: employee.golongan_id || '',

        // Map Riwayat Jabatan (ambil yang aktif, atau yang terakhir)
        no_sk_jabatan: (() => {
          const riwayat = employee.profile?.riwayat_jabatan
          if (!riwayat || riwayat.length === 0) return ''
          const aktif = riwayat.find(r => r.is_aktif) || riwayat[riwayat.length - 1]
          return aktif?.no_sk || ''
        })(),
        tanggal_sk_jabatan: (() => {
          const riwayat = employee.profile?.riwayat_jabatan
          if (!riwayat || riwayat.length === 0) return ''
          const aktif = riwayat.find(r => r.is_aktif) || riwayat[riwayat.length - 1]
          return formatDateForInput(aktif?.tanggal_sk)
        })(),
        tmt_jabatan: (() => {
          const riwayat = employee.profile?.riwayat_jabatan
          if (!riwayat || riwayat.length === 0) return ''
          const aktif = riwayat.find(r => r.is_aktif) || riwayat[riwayat.length - 1]
          return formatDateForInput(aktif?.tmt_jabatan)
        })(),
    }
}

// Reset Form
const resetForm = () => {
    formData.value = {
      nip: '',
      nama_lengkap: '',
      gelar_depan_1: '',
      gelar_depan_2: '',
      gelar_belakang: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      agama_id: '',
      pendidikan_id: '',
      status_kawin_id: '',
      alamat_1_id: null,
      alamat_2_id: null,
      kode_pos: '',
      telepon: '',
      golongan_darah_id: '',
      bank_id: '',
      tmt_cpns: '',
      tmt_pns: '',
      jenis_pegawai_id: '',
      status_kepegawaian_id: '',
      jabatan_id: '',
      unit_kerja_id: '',
      pangkat_id: '',
      golongan_id: '',
      tmt_jabatan: '',
      no_sk_jabatan: '',
      tanggal_sk_jabatan: '',
    }
}

const openAddModal = () => {
  resetForm()
  isEditMode.value = false
  showFormModal.value = true
}

const viewDetail = (employee) => {
    selectedEmployee.value = employee
    showDetailModal.value = true
}

const confirmDelete = (employee) => {
    selectedEmployee.value = employee
    showDeleteModal.value = true
}

const closeDetailModal = () => {
    showDetailModal.value = false
    selectedEmployee.value = null
}

const closeFormModal = () => {
    showFormModal.value = false
    selectedEmployee.value = null
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    selectedEmployee.value = null
}

// ==================== API FUNCTIONS ====================

const fetchReferences = async () => {
  try {
    const [
      positionsRes,
      unitsRes,
      ranksRes,
      statusesRes,
      religionsRes,
      educationsRes,
      maritalRes,
      bloodRes,
      typeRes
    ] = await Promise.all([
      api.get('/super-admin/jabatan'),
      api.get('/super-admin/unit-kerja'),
      api.get('/super-admin/reference/pangkat'),
      api.get('/super-admin/reference/status-kepegawaian'),
      api.get('/super-admin/reference/agama'),
      api.get('/super-admin/reference/pendidikan'),
      api.get('/super-admin/reference/status-kawin'),
      api.get('/super-admin/reference/golongan-darah'),
      api.get('/super-admin/reference/jenis-pegawai'),
    ])
    
    positions.value = positionsRes.data.data
    work_units.value = unitsRes.data.data
    ranks.value = ranksRes.data.data
    employmentStatuses.value = statusesRes.data.data
    religions.value = religionsRes.data.data
    educations.value = educationsRes.data.data
    maritalStatuses.value = maritalRes.data.data
    bloodTypes.value = bloodRes.data.data
    employeeTypes.value = typeRes.data.data
    
  } catch(error) {
    console.error('Error fetching references:', error)
  }
}

const fetchEmployees = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const params = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
      search: searchQuery.value,
      jabatan_id: filterPosition.value || undefined,   // Mapped: position_id -> jabatan_id
      unit_kerja_id: filterWorkUnit.value || undefined // Mapped: work_unit_id -> unit_kerja_id
    }

    const response = await api.get('/super-admin/profile-pegawai', { params })
    const result = response.data

    if (result.data) {
      employeeList.value = result.data
      
      // Backend (ProfilePegawaiController) returns a simple list (get()), manual pagination fallback might be needed
      // unless backend is updated to paginate().
      // Assuming Controller uses get(), so we handle all data client-side for now or assume backend returns all.
      
      // If result.data is all records:
       pagination.value = {
          currentPage: 1,
          perPage: employeeList.value.length || 10,
          total: employeeList.value.length || 0,
          lastPage: 1,
          from: 1,
          to: employeeList.value.length || 0
        }
      
      // If backend adds metadata in future, this block is ready
      if (result.meta) {
        pagination.value = {
          currentPage: result.meta.current_page || 1,
          perPage: result.meta.per_page || 10,
          total: result.meta.total || 0,
          lastPage: result.meta.last_page || 1,
          from: result.meta.from || 1,
          to: result.meta.to || 0,
        }
      }
    }
  } catch (error) {
    console.error('Error loading employees:', error)
    errorMessage.value = 'Gagal memuat data pegawai.'
  } finally {
    loading.value = false
  }
}




// ==================== UI FUNCTIONS ====================

const refreshData = () => {
  searchQuery.value = ''
  filterPosition.value = ''
  filterWorkUnit.value = ''
  pagination.value.currentPage = 1
  fetchEmployees()
}

const searchData = () => {
  pagination.value.currentPage = 1
  fetchEmployees()
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  fetchEmployees()
}

const clearFilters = () => {
  refreshData()
}

const changePage = (page) => {
  if (page === '...') return
  if (page >= 1 && page <= pagination.value.lastPage) {
    pagination.value.currentPage = page
    fetchEmployees()
  }
}

const debounceSearch = debounce(() => {
  searchData()
}, 500)

const submitForm = async () => {
  if (isEditMode.value) {
    await updateEmployee()
  } else {
    await createEmployee()
  }
}

// ==================== UTILITY FUNCTIONS ====================

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
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

// Convert ISO date string to YYYY-MM-DD for HTML date inputs
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  fetchEmployees()
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
  max-width: 1400px;
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

/* Specific Column Styles */
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
  max-height: 90vh;
  overflow-y: auto;
}
.modal-lg { max-width: 800px; }
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
  font-size: 24px;
}
.icon-circle.bg-indigo { background: #e0e7ff; color: #4338ca; }
.detail-titles h3 { margin: 0 0 6px 0; font-size: 20px; color: #111827; }

/* Detail Sections */
.detail-section {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.detail-section:last-child { margin-bottom: 0; }

.detail-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.detail-section-header i {
  font-size: 14px;
  color: #4f46e5;
}

.detail-section .detail-grid {
  padding: 20px;
}

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: 1 / -1; }
.info-box label { display: block; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.info-box p { margin: 0; font-size: 15px; color: #374151; font-weight: 500; }

/* Form Styling */
.modern-form { display: flex; flex-direction: column; gap: 20px; }
.info-alert {
  background-color: #e0f2fe;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.info-alert i {
  color: #0284c7;
  font-size: 18px;
  margin-top: 2px;
}

.info-alert p {
  color: #0c4a6e;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.form-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}
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

.text-center { text-align: center; }
</style>
