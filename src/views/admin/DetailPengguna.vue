<template>
  <div class="app-container">
    <div class="content-wrapper">
      <!-- Back Button & Header -->
      <header class="modern-header">
        <div class="header-content">
          <div class="header-left">
            <button class="btn btn-secondary btn-icon-text" @click="$router.push({ name: 'admin-data-pegawai' })">
              <i class="fas fa-arrow-left"></i>
              <span>Kembali</span>
            </button>
            <div class="header-text" style="margin-left: 16px;">
              <h1>Detail Pengguna</h1>
              <p>Informasi lengkap data pegawai</p>
            </div>
          </div>
          <div class="header-actions" v-if="profile">
            <button class="btn btn-edit" @click="openEditModal" title="Edit Data Pegawai">
              <i class="fas fa-pen"></i>
              <span>Edit</span>
            </button>
            <button class="btn btn-password" @click="openPasswordModal" title="Reset Password">
              <i class="fas fa-key"></i>
              <span>Keamanan</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Memuat data pegawai...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="state-container error">
        <div class="state-icon bg-red"><i class="fas fa-exclamation-triangle"></i></div>
        <h3>Gagal Memuat Data</h3>
        <p>{{ errorMessage }}</p>
        <button class="btn btn-primary" @click="loadAllData">Coba Lagi</button>
      </div>

      <!-- Main Content -->
      <div v-else-if="profile" class="detail-page">
        <!-- Profile Header Card -->
        <div class="profile-header-card">
          <div class="profile-header-content">
            <div class="profile-avatar">
              <img v-if="profilePhotoUrl" :src="profilePhotoUrl" alt="Foto Profil" class="avatar-img" @error="photoError = true">
              <span v-else class="avatar-initial">{{ (profile?.nama_lengkap || '?').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="profile-info">
              <div class="profile-name-row">
                <h2 class="profile-name">{{ formattedName }}</h2>
                <span class="badge badge-green" v-if="pegawai?.status_kepegawaian">{{ pegawai.status_kepegawaian.nama_status }}</span>
              </div>
              <div class="profile-nip">
                <i class="fas fa-id-badge"></i>
                <span>NIP: {{ profile?.nip || '-' }}</span>
              </div>
              <div class="profile-meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Jabatan</span>
                  <span class="meta-value">{{ pegawai?.jabatan?.nama_jabatan || '-' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Unit Kerja</span>
                  <span class="meta-value">{{ pegawai?.unit_kerja?.nama_unit || '-' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Pangkat / Golongan</span>
                  <span class="meta-value">{{ pegawai?.pangkat?.nama_pangkat || '-' }} ({{ pegawai?.golongan?.nama_golongan || '-' }})</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Jenis Pegawai</span>
                  <span class="meta-value">{{ pegawai?.jenis_pegawai?.nama || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content-card">

          <!-- ==================== TAB: Informasi Umum ==================== -->
          <div v-if="activeTab === 'umum'" class="tab-panel">
            <div class="two-column-layout">
              <!-- Column Left: Umum -->
              <div class="info-column">
                <h3 class="section-title section-title-blue">Identitas Pribadi</h3>
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-label">Jenis Kelamin</span>
                    <span class="info-value">{{ profile?.jenis_kelamin === 'L' ? 'Laki-Laki' : (profile?.jenis_kelamin === 'P' ? 'Perempuan' : '-') }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Tempat Lahir</span>
                    <span class="info-value">{{ profile?.tempat_lahir || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Tanggal Lahir</span>
                    <span class="info-value">{{ formatDate(profile?.tanggal_lahir) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Agama</span>
                    <span class="info-value">{{ profile?.agama?.nama_agama || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Status Pernikahan</span>
                    <span class="info-value">{{ profile?.status_kawin?.status || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Golongan Darah</span>
                    <span class="info-value">{{ profile?.golongan_darah?.kode || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Pendidikan Terakhir</span>
                    <span class="info-value">{{ profile?.pendidikan?.nama_jenjang || '-' }}</span>
                  </div>

                  <h3 class="section-title section-title-green" style="margin-top: 24px;">Kontak</h3>
                  <div class="info-row">
                    <span class="info-label">Telepon / WhatsApp</span>
                    <span class="info-value">{{ profile?.telepon || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ profile?.email || profile?.user?.email || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Kode Pos</span>
                    <span class="info-value">{{ profile?.kode_pos || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Column Right: Administrasi & Pekerjaan -->
              <div class="info-column">
                <h3 class="section-title section-title-blue">Administrasi</h3>
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-label">NIP / No. Identitas</span>
                    <span class="info-value font-mono">{{ profile?.nip || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Gelar Depan</span>
                    <span class="info-value">{{ [profile?.gelar_depan_1, profile?.gelar_depan_2].filter(Boolean).join(' ') || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Gelar Belakang</span>
                    <span class="info-value">{{ profile?.gelar_belakang || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">TMT CPNS</span>
                    <span class="info-value">{{ formatDate(profile?.tmt_cpns) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">TMT PNS</span>
                    <span class="info-value">{{ formatDate(profile?.tmt_pns) }}</span>
                  </div>
                </div>

                <h3 class="section-title section-title-green" style="margin-top: 24px;">Pekerjaan</h3>
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-label">Jabatan</span>
                    <span class="info-value">{{ pegawai?.jabatan?.nama_jabatan || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Unit Kerja</span>
                    <span class="info-value">{{ pegawai?.unit_kerja?.nama_unit || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Pangkat / Golongan</span>
                    <span class="info-value">{{ pegawai?.pangkat?.nama_pangkat || '-' }} ({{ pegawai?.golongan?.nama_golongan || '-' }})</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Status Pegawai</span>
                    <span class="info-value">{{ pegawai?.status_kepegawaian?.nama_status || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">No. SK Jabatan</span>
                    <span class="info-value">{{ activeRiwayat?.no_sk || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Tanggal SK</span>
                    <span class="info-value">{{ formatDate(activeRiwayat?.tanggal_sk) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">TMT Jabatan</span>
                    <span class="info-value">{{ formatDate(activeRiwayat?.tmt_jabatan) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ==================== TAB: Domisili ==================== -->
          <div v-if="activeTab === 'domisili'" class="tab-panel">
            <div v-if="alamatLoading" class="text-center py-8 text-muted">Memuat data alamat...</div>
            <div v-else class="two-column-layout">
              <!-- Alamat KTP -->
              <div class="info-column">
                <h3 class="section-title section-title-blue">
                  <i class="fas fa-id-card" style="margin-right: 6px;"></i>Alamat Sesuai KTP
                </h3>
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-label">Jalan / Alamat</span>
                    <span class="info-value">{{ alamatData?.alamat_utama?.alamat || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Desa / Kelurahan</span>
                    <span class="info-value">{{ alamatData?.alamat_utama?.desa_kelurahan || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Kecamatan</span>
                    <span class="info-value">{{ alamatData?.alamat_utama?.kecamatan || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Kabupaten / Kota</span>
                    <span class="info-value">{{ alamatData?.alamat_utama?.kabupaten_kota || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Provinsi</span>
                    <span class="info-value">{{ alamatData?.alamat_utama?.provinsi || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Alamat Domisili -->
              <div class="info-column">
                <h3 class="section-title section-title-green">
                  <i class="fas fa-map-marked-alt" style="margin-right: 6px;"></i>Alamat Domisili Saat Ini
                </h3>
                <div class="info-list">
                  <div class="info-row">
                    <span class="info-label">Jalan / Alamat</span>
                    <span class="info-value">{{ alamatData?.alamat_domisili?.alamat || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Desa / Kelurahan</span>
                    <span class="info-value">{{ alamatData?.alamat_domisili?.desa_kelurahan || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Kecamatan</span>
                    <span class="info-value">{{ alamatData?.alamat_domisili?.kecamatan || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Kabupaten / Kota</span>
                    <span class="info-value">{{ alamatData?.alamat_domisili?.kabupaten_kota || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Provinsi</span>
                    <span class="info-value">{{ alamatData?.alamat_domisili?.provinsi || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ==================== TAB: Riwayat Jabatan ==================== -->
          <div v-if="activeTab === 'riwayat'" class="tab-panel">
            <!-- Tugas Tambahan -->
            <div v-if="activeTugasTambahan" class="tugas-tambahan-card">
              <h3 class="section-title section-title-blue" style="margin-bottom: 12px;">
                <i class="fas fa-tasks" style="margin-right: 6px;"></i>Tugas Tambahan Aktif
              </h3>
              <div class="info-list" style="max-width: 600px;">
                <div class="info-row">
                  <span class="info-label">Nama Tugas</span>
                  <span class="info-value">{{ activeTugasTambahan?.tugas_tambahan?.nama_tugas || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">TMT Tugas</span>
                  <span class="info-value">{{ formatDate(activeTugasTambahan?.tmt_mulai) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Unit Kerja Tugas</span>
                  <span class="info-value">{{ activeTugasTambahan?.tugas_tambahan?.unit_kerja?.nama_unit || '-' }}</span>
                </div>
                <div class="info-row" v-if="activeTugasTambahan?.keterangan">
                  <span class="info-label">Keterangan</span>
                  <span class="info-value">{{ activeTugasTambahan?.keterangan }}</span>
                </div>
              </div>
            </div>

            <!-- Riwayat Jabatan Table -->
            <h3 class="section-title section-title-blue" style="margin-bottom: 12px;">
              <i class="fas fa-file-contract" style="margin-right: 6px;"></i>Riwayat Jabatan
            </h3>
            <div class="table-wrapper" v-if="riwayatJabatan?.length > 0">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Jabatan</th>
                    <th>Unit Kerja</th>
                    <th>No SK / Tgl SK</th>
                    <th>TMT</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="riwayat in riwayatJabatan" :key="riwayat.id">
                    <td>
                      <div class="font-bold">{{ riwayat.jabatan?.nama_jabatan || '-' }}</div>
                      <div class="text-muted small-note">{{ riwayat.bidang_studi || '' }}</div>
                    </td>
                    <td>{{ riwayat.unit_kerja?.nama_unit || '-' }}</td>
                    <td>
                      <div>{{ riwayat.no_sk || '-' }}</div>
                      <div class="text-muted small-note">{{ formatDate(riwayat.tanggal_sk) }}</div>
                    </td>
                    <td>{{ formatDate(riwayat.tmt_jabatan) }}</td>
                    <td>
                      <span class="badge" :class="riwayat.is_aktif ? 'badge-green' : 'badge-gray'">
                        {{ riwayat.is_aktif ? 'Aktif' : 'Tidak Aktif' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Belum ada riwayat jabatan.</p>
            </div>
          </div>

          <!-- ==================== TAB: Pendidikan ==================== -->
          <div v-if="activeTab === 'pendidikan'" class="tab-panel">
            <div v-if="pendidikanLoading" class="text-center py-8 text-muted">Memuat data pendidikan...</div>
            <div v-else-if="pendidikanData?.length > 0">
              <div class="education-cards">
                <div v-for="edu in pendidikanData" :key="edu.id" class="education-card">
                  <div class="edu-header">
                    <div class="edu-icon">
                      <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="edu-title">
                      <h4>{{ edu.pendidikan?.nama_jenjang || '-' }}</h4>
                      <p class="edu-school">{{ edu.nama_institusi || '-' }}</p>
                    </div>
                    <span class="edu-year" v-if="edu.tahun_lulus">{{ edu.tahun_lulus }}</span>
                  </div>
                  <div class="edu-details">
                    <div class="info-row" v-if="edu.program_studi">
                      <span class="info-label">Program Studi</span>
                      <span class="info-value">{{ edu.program_studi }}</span>
                    </div>
                    <div class="info-row" v-if="edu.fakultas">
                      <span class="info-label">Fakultas</span>
                      <span class="info-value">{{ edu.fakultas }}</span>
                    </div>
                    <div class="info-row" v-if="edu.nomor_ijazah">
                      <span class="info-label">No. Ijazah</span>
                      <span class="info-value">{{ edu.nomor_ijazah }}</span>
                    </div>
                    <div class="info-row" v-if="edu.kota_pendidikan">
                      <span class="info-label">Kota Pendidikan</span>
                      <span class="info-value">{{ edu.kota_pendidikan }}</span>
                    </div>
                    <div class="info-row" v-if="edu.penandatangan_ijazah">
                      <span class="info-label">Penandatangan Ijazah</span>
                      <span class="info-value">{{ edu.penandatangan_ijazah }}</span>
                    </div>
                    <div class="info-row" v-if="edu.keterangan">
                      <span class="info-label">Keterangan</span>
                      <span class="info-value">{{ edu.keterangan }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-graduation-cap"></i>
              <p>Belum ada data riwayat pendidikan.</p>
            </div>
          </div>

          <!-- ==================== TAB: Keluarga ==================== -->
          <div v-if="activeTab === 'keluarga'" class="tab-panel">
            <div v-if="keluargaLoading" class="text-center py-8 text-muted">Memuat data keluarga...</div>
            <div v-else-if="keluargaData?.length > 0">
              <div class="table-wrapper">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Hubungan</th>
                      <th>Tempat, Tanggal Lahir</th>
                      <th>Pekerjaan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(member, index) in keluargaData" :key="member.id">
                      <td class="text-muted">{{ index + 1 }}</td>
                      <td class="font-bold">{{ member.nama || '-' }}</td>
                      <td>{{ member.hubungan || '-' }}</td>
                      <td>
                        <span>{{ member.tempat_lahir || '' }}{{ member.tempat_lahir && member.tanggal_lahir ? ', ' : '' }}{{ formatDate(member.tanggal_lahir) }}</span>
                      </td>
                      <td>{{ member.pekerjaan || '-' }}</td>
                      <td>
                        <span class="badge" :class="member.status_hidup === 'Hidup' ? 'badge-green' : 'badge-gray'">
                          {{ member.status_hidup || '-' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-users"></i>
              <p>Belum ada data anggota keluarga.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Edit Form Modal -->
  <Transition name="modal-fade">
    <div v-if="showFormModal" class="modal-backdrop" @click="closeFormModal">
      <div class="modal-card modal-lg" @click.stop>
        <div class="modal-header">
          <h2>Edit Pegawai</h2>
          <button class="btn-close" @click="closeFormModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm" class="modern-form">
            <!-- Identitas Pribadi -->
            <div class="form-section-title">Identitas Pribadi</div>
            <div class="form-row"><div class="form-group fluid"><label>NIP / NIK <span class="text-danger">*</span></label><input type="text" v-model="formData.nip" required placeholder="NIP / NIK / Nomor Identitas" /></div></div>
            <div class="form-row three-cols">
              <div class="form-group"><label>Gelar Depan 1</label><input type="text" v-model="formData.gelar_depan_1" placeholder="Dr." /></div>
              <div class="form-group"><label>Gelar Depan 2</label><input type="text" v-model="formData.gelar_depan_2" placeholder="H." /></div>
              <div class="form-group"><label>Gelar Belakang</label><input type="text" v-model="formData.gelar_belakang" placeholder="S.Kom" /></div>
            </div>
            <div class="form-row"><div class="form-group fluid"><label>Nama Lengkap (Tanpa Gelar) <span class="text-danger">*</span></label><input type="text" v-model="formData.nama_lengkap" required placeholder="Nama Sesuai KTP" /></div></div>
            <div class="form-row">
              <div class="form-group half"><label>Tempat Lahir</label><input type="text" v-model="formData.tempat_lahir" /></div>
              <div class="form-group half"><label>Tanggal Lahir <span class="text-danger">*</span></label><el-date-picker v-model="formData.tanggal_lahir" type="date" placeholder="Pilih Tanggal" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width:100%" /></div>
            </div>
            <div class="form-row">
              <div class="form-group half"><label>Jenis Kelamin <span class="text-danger">*</span></label><div class="select-wrapper fluid"><select v-model="formData.jenis_kelamin" required><option value="">Pilih...</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
              <div class="form-group half"><label>Golongan Darah</label><div class="select-wrapper fluid"><select v-model="formData.golongan_darah_id"><option value="">Pilih...</option><option v-for="b in bloodTypes" :key="b.id" :value="b.id">{{ b.kode }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
            </div>
            <div class="form-row three-cols">
              <div class="form-group"><label>Agama</label><div class="select-wrapper fluid"><select v-model="formData.agama_id"><option value="">Pilih...</option><option v-for="r in religions" :key="r.id" :value="r.id">{{ r.nama_agama }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
              <div class="form-group"><label>Status Pernikahan</label><div class="select-wrapper fluid"><select v-model="formData.status_kawin_id"><option value="">Pilih...</option><option v-for="s in maritalStatuses" :key="s.id" :value="s.id">{{ s.status }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
              <div class="form-group"><label>Pendidikan Terakhir</label><div class="select-wrapper fluid"><select v-model="formData.pendidikan_id"><option value="">Pilih...</option><option v-for="e in educations" :key="e.id" :value="e.id">{{ e.nama_jenjang }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
            </div>

            <!-- Kontak -->
            <div class="form-section-title">Kontak</div>
            <div class="form-row">
              <div class="form-group half"><label>Nomor Telepon</label><input type="text" v-model="formData.telepon" placeholder="08..." /></div>
              <div class="form-group half"><label>Email</label><input type="email" v-model="formData.email" placeholder="Email (opsional)" /></div>
            </div>

            <!-- Status Kepegawaian -->
            <div class="form-section-title">Status Kepegawaian</div>
            <div class="form-row three-cols">
              <div class="form-group"><label>Status Pegawai <span class="text-danger">*</span></label><div class="select-wrapper fluid"><select v-model="formData.status_kepegawaian_id" required><option value="">Pilih...</option><option v-for="s in employmentStatuses" :key="s.id" :value="s.id">{{ s.nama_status }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
              <div class="form-group"><label>Jenis Pegawai</label><div class="select-wrapper fluid"><select v-model="formData.jenis_pegawai_id"><option value="">Pilih...</option><option v-for="t in employeeTypes" :key="t.id" :value="t.id">{{ t.nama }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
              <div class="form-group"><label>Unit Kerja</label><div class="select-wrapper fluid"><select v-model="formData.unit_kerja_id"><option value="">Pilih...</option><option v-for="u in work_units" :key="u.id" :value="u.id">{{ u.nama_unit }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
            </div>

            <!-- Jabatan & Kepangkatan -->
            <div class="form-section-title">Jabatan & Kepangkatan</div>
            <div class="form-row">
              <div class="form-group half"><label>Jabatan <span class="text-danger">*</span></label><div class="select-wrapper fluid"><select v-model="formData.jabatan_id" @change="onJabatanChange" required><option value="">Pilih...</option><option v-for="p in positions" :key="p.id" :value="p.id">{{ p.nama_jabatan }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
              <div class="form-group half"><label>Pangkat/Golongan</label><div class="select-wrapper fluid"><select v-model="formData.pangkat_id" @change="formData.golongan_id = ranks.find(r => r.id === formData.pangkat_id)?.golongan_id || ''"><option value="">Pilih...</option><option v-for="r in ranks" :key="r.id" :value="r.id">{{ r.nama_pangkat }} ({{ r.nama_golongan }})</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
            </div>
            <div class="form-row three-cols">
              <div class="form-group"><label>Nomor SK Jabatan</label><input type="text" v-model="formData.no_sk_jabatan" placeholder="Nomor SK" /></div>
              <div class="form-group"><label>Tanggal SK</label><el-date-picker v-model="formData.tanggal_sk_jabatan" type="date" placeholder="Pilih Tanggal" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width:100%" /></div>
              <div class="form-group"><label>TMT Jabatan</label><el-date-picker v-model="formData.tmt_jabatan" type="date" placeholder="Pilih Tanggal" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width:100%" /></div>
            </div>

            <!-- Tugas Tambahan -->
            <div class="form-row three-cols">
              <div class="form-group"><label>Tugas Tambahan</label><div class="select-wrapper"><select v-model="formData.tugas_tambahan_id"><option value="">Pilih Tugas Tambahan</option><option v-for="t in additionalDuties" :key="t.id" :value="t.id">{{ t.nama_tugas }}</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
              <div class="form-group"><label>TMT Tugas Tambahan</label><el-date-picker v-model="formData.tmt_tugas_tambahan" type="date" placeholder="Pilih Tanggal" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width:100%" /></div>
              <div class="form-group"><label>Keterangan Tugas</label><input type="text" v-model="formData.keterangan_tugas" placeholder="Keterangan (Opsional)" /></div>
            </div>

            <!-- Masa Kerja -->
            <div class="form-section-title">Masa Kerja</div>
            <div class="form-row">
              <div class="form-group half"><label>TMT CPNS</label><el-date-picker v-model="formData.tmt_cpns" type="date" placeholder="Pilih Tanggal" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width:100%" /></div>
              <div class="form-group half"><label>TMT PNS</label><el-date-picker v-model="formData.tmt_pns" type="date" placeholder="Pilih Tanggal" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width:100%" /></div>
            </div>

            <!-- Detail Akademik -->
            <div class="form-section-title">Detail Akademik</div>
            <div class="form-row three-cols">
              <div class="form-group"><label>Bidang Studi</label><input type="text" v-model="formData.bidang_studi" placeholder="Pendidikan Agama Islam" /></div>
              <div class="form-group"><label>Keterangan Jabatan</label><input type="text" v-model="formData.keterangan_jabatan" placeholder="Dosen Tetap" /></div>
              <div class="form-group"><label>Diperbantukan</label><div class="select-wrapper fluid"><select v-model="formData.is_diperbantukan"><option :value="false">Tidak</option><option :value="true">Ya</option></select><i class="fas fa-chevron-down dropdown-icon"></i></div></div>
            </div>
            <div class="form-row" v-if="formData.is_diperbantukan"><div class="form-group fluid"><label>Keterangan Diperbantukan</label><input type="text" v-model="formData.keterangan_diperbantukan" placeholder="Keterangan..." /></div></div>

            <!-- Tunjangan -->
            <div class="form-section-title">Tunjangan</div>
            <div class="form-row"><div class="form-group fluid"><label>Tunjangan Jabatan (Rp)</label><input type="number" v-model="formData.tunjangan_jabatan" placeholder="0" /></div></div>

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

  <!-- Password Management Modal -->
  <Transition name="modal-fade">
    <div v-if="showPasswordModal" class="modal-backdrop" @click="closePasswordModal">
      <div class="modal-card modal-sm" @click.stop>
        <div class="modal-header">
          <h2>Manajemen Password</h2>
          <button class="btn-close" @click="closePasswordModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="state-container" style="padding: 20px 0;">
            <div class="state-icon bg-blue" style="width: 50px; height: 50px; font-size: 20px;"><i class="fas fa-key"></i></div>
            <h3 style="font-size: 16px; margin-bottom: 5px;">{{ formattedName }}</h3>
            <p style="font-size: 12px; margin-bottom: 20px;">Username: {{ profile?.user?.username || '-' }}</p>
          </div>
          <div class="password-actions">
            <!-- Reset to Default -->
            <div style="margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h4 style="margin: 0 0 10px; font-size: 14px; color: #374151;">Opsi 1: Reset ke Default</h4>
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">Password direset menjadi tanggal lahir (YYYYMMDD).<br>Contoh: <strong>{{ getDefaultPasswordExample() }}</strong></p>
              <button class="btn btn-secondary fluid" @click="resetPasswordToDefault" :disabled="submittingPassword"><i class="fas fa-sync-alt"></i> Reset Password Default</button>
            </div>
            <!-- Custom Password -->
            <div style="padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h4 style="margin: 0 0 10px; font-size: 14px; color: #374151;">Opsi 2: Ubah Password Manual</h4>
              <div style="margin-bottom: 10px;">
                <input type="password" v-model="customPassword" placeholder="Password baru..." style="width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 6px;" />
                <input type="password" v-model="customPasswordConfirm" placeholder="Konfirmasi password..." style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ddd; border-radius: 6px;" />
              </div>
              <button class="btn btn-primary fluid" @click="changeCustomPassword" :disabled="!isCustomPasswordValid || submittingPassword"><i class="fas fa-save"></i> Simpan Password Baru</button>
              <div style="margin-top: 5px;">
                <p v-if="customPassword && customPassword.length < 6" style="font-size: 11px; color: #ef4444; margin: 0;">Minimal 6 karakter.</p>
                <p v-if="customPassword && customPasswordConfirm && customPassword !== customPasswordConfirm" style="font-size: 11px; color: #ef4444; margin: 0;">Password tidak cocok.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Toast -->
  <Transition name="toast-fade">
    <div v-if="toastVisible" class="toast-notification" :class="'toast-' + toastType">
      <i :class="toastType === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
      <span>{{ toastMessage }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

// Props
const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

// State
const loading = ref(true)
const errorMessage = ref('')
const activeTab = ref('umum')
const photoError = ref(false)

// Data
const profile = ref(null)
const pegawai = ref(null)
const riwayatJabatan = ref([])

const alamatData = ref(null)
const alamatLoading = ref(false)
const pendidikanData = ref([])
const pendidikanLoading = ref(false)
const keluargaData = ref([])
const keluargaLoading = ref(false)

// Tabs Configuration
const tabs = [
  { key: 'umum', label: 'Informasi Umum', icon: 'fas fa-user' },
  { key: 'domisili', label: 'Domisili', icon: 'fas fa-map-marker-alt' },
  { key: 'riwayat', label: 'Riwayat Jabatan', icon: 'fas fa-sitemap' },
  { key: 'pendidikan', label: 'Pendidikan', icon: 'fas fa-graduation-cap' },
  { key: 'keluarga', label: 'Keluarga', icon: 'fas fa-users' },
]

// Computed
const profilePhotoUrl = computed(() => {
  if (photoError.value) return null
  return profile.value?.foto_url || null
})

const formattedName = computed(() => {
  if (!profile.value) return '-'
  const d = profile.value
  let name = d.nama_lengkap || ''
  if (!name) return '-'

  const gDepan1 = d.gelar_depan_1 || ''
  const gDepan2 = d.gelar_depan_2 || ''
  const gBelakang = d.gelar_belakang || ''

  let prefix = ''
  if (gDepan1) prefix += `${gDepan1} `
  if (gDepan2) prefix += `${gDepan2} `

  let fullName = `${prefix}${name}`.trim()
  if (gBelakang) fullName = `${fullName}, ${gBelakang}`

  return fullName
})

const activeRiwayat = computed(() => {
  if (!riwayatJabatan.value?.length) return null
  return riwayatJabatan.value.find(r => r.is_aktif) || riwayatJabatan.value[riwayatJabatan.value.length - 1]
})

const activeTugasTambahan = computed(() => {
  if (!activeRiwayat.value?.riwayat_tugas_tambahan?.length) return null
  return activeRiwayat.value.riwayat_tugas_tambahan.find(t => !t.tmt_selesai) || null
})

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// Load main profile data
const loadAllData = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const profileId = props.id

    // Fetch full profile via super-admin endpoint
    const res = await api.get(`/super-admin/profile-pegawai/${profileId}`)
    const data = res.data.data

    profile.value = data
    pegawai.value = data.pegawai || null
    riwayatJabatan.value = data.riwayat_jabatan || []

    // Extract alamat from profile relations (alamat1 = KTP, alamat2 = Domisili)
    // The profile-pegawai show endpoint loads alamat1 and alamat2 (desa_kelurahan) relations
    alamatData.value = {
      alamat_utama: formatAlamatFromProfile(data.alamat1, data.alamat_jalan_ktp),
      alamat_domisili: formatAlamatFromProfile(data.alamat2, data.alamat_jalan_domisili),
    }

  } catch (e) {
    console.error('Error loading profile', e)
    errorMessage.value = e.response?.data?.message || 'Gagal memuat data pegawai.'
  } finally {
    loading.value = false
  }
}

// Format alamat from the profile's alamat1/alamat2 desa_kelurahan relation
const formatAlamatFromProfile = (desa, alamatJalan) => {
  if (!desa && !alamatJalan) return null
  const kec = desa?.kecamatan
  const kab = kec?.kabupaten_kota
  const prov = kab?.provinsi

  return {
    alamat: alamatJalan || null,
    desa_kelurahan: desa?.nama_desa_kelurahan || null,
    kecamatan: kec?.nama_kecamatan || null,
    kabupaten_kota: kab?.nama_kab_kota || null,
    provinsi: prov?.nama_provinsi || null,
  }
}

// Lazy load tab data
const loadAlamatData = async () => {
  // Alamat is already extracted from profile in loadAllData
  // Nothing to do here
}

const loadPendidikanData = async () => {
  if (pendidikanData.value?.length) return
  pendidikanLoading.value = true
  try {
    const res = await api.get(`/super-admin/riwayat-pendidikan`, {
      params: { profile_id: props.id }
    })
    pendidikanData.value = res.data.data || []
  } catch (e) {
    console.warn('Error loading pendidikan', e)
    pendidikanData.value = []
  } finally {
    pendidikanLoading.value = false
  }
}

const loadKeluargaData = async () => {
  if (keluargaData.value?.length) return
  keluargaLoading.value = true
  try {
    const res = await api.get(`/super-admin/keluarga`, {
      params: { profile_id: props.id }
    })
    // The super-admin keluarga endpoint returns paginated data
    const rawData = res.data.data
    keluargaData.value = rawData?.data || rawData || []
  } catch (e) {
    console.warn('Error loading keluarga', e)
    keluargaData.value = []
  } finally {
    keluargaLoading.value = false
  }
}

// Watch tab changes for lazy loading
watch(activeTab, (newTab) => {
  if (newTab === 'domisili') loadAlamatData()
  if (newTab === 'pendidikan') loadPendidikanData()
  if (newTab === 'keluarga') loadKeluargaData()
})

onMounted(() => {
  loadAllData()
})

// ==================== EDIT FORM ====================
const showFormModal = ref(false)
const submitting = ref(false)
const referencesLoaded = ref(false)

// Reference Data
const positions = ref([])
const work_units = ref([])
const ranks = ref([])
const employmentStatuses = ref([])
const religions = ref([])
const educations = ref([])
const maritalStatuses = ref([])
const bloodTypes = ref([])
const employeeTypes = ref([])
const additionalDuties = ref([])

// Form Data
const formData = ref({
  nip: '', nama_lengkap: '', gelar_depan_1: '', gelar_depan_2: '', gelar_belakang: '',
  tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '', agama_id: '', pendidikan_id: '',
  status_kawin_id: '', kode_pos: '', telepon: '', golongan_darah_id: '', bank_id: '',
  tmt_cpns: '', tmt_pns: '', email: '',
  jenis_pegawai_id: '', status_kepegawaian_id: '', jabatan_id: '', unit_kerja_id: '',
  pangkat_id: '', golongan_id: '',
  tmt_jabatan: '', no_sk_jabatan: '', tanggal_sk_jabatan: '',
  bidang_studi: '', keterangan_jabatan: '', is_diperbantukan: false, keterangan_diperbantukan: '',
  tunjangan_jabatan: '',
  tugas_tambahan_id: '', tmt_tugas_tambahan: '', keterangan_tugas: '',
})

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const fetchReferences = async () => {
  try {
    const [posRes, unitRes, rankRes, statusRes, relRes, eduRes, marRes, bloodRes, typeRes, dutyRes] = await Promise.all([
      api.get('/super-admin/jabatan'), api.get('/super-admin/unit-kerja'),
      api.get('/super-admin/reference/pangkat'), api.get('/super-admin/reference/status-kepegawaian'),
      api.get('/super-admin/reference/agama'), api.get('/super-admin/reference/pendidikan'),
      api.get('/super-admin/reference/status-kawin'), api.get('/super-admin/reference/golongan-darah'),
      api.get('/super-admin/reference/jenis-pegawai'), api.get('/super-admin/reference/tugas-tambahan'),
    ])
    positions.value = posRes.data.data; work_units.value = unitRes.data.data
    ranks.value = rankRes.data.data; employmentStatuses.value = statusRes.data.data
    religions.value = relRes.data.data; educations.value = eduRes.data.data
    maritalStatuses.value = marRes.data.data; bloodTypes.value = bloodRes.data.data
    employeeTypes.value = typeRes.data.data; additionalDuties.value = dutyRes.data.data
    referencesLoaded.value = true
  } catch (e) { console.error('Error fetching references:', e) }
}

const openEditModal = async () => {
  showFormModal.value = true
  if (!referencesLoaded.value) await fetchReferences()
  try {
    const res = await api.get(`/super-admin/profile-pegawai/${props.id}`)
    const fp = res.data.data
    const peg = fp.pegawai
    const rj = fp.riwayat_jabatan
    const aktif = rj?.find(r => r.is_aktif) || rj?.[rj.length - 1]
    const activeDuty = aktif?.riwayat_tugas_tambahan?.find(t => !t.tmt_selesai)
    formData.value = {
      nip: fp.nip || '', nama_lengkap: fp.nama_lengkap || '', email: fp.user?.email || '',
      gelar_depan_1: fp.gelar_depan_1 || '', gelar_depan_2: fp.gelar_depan_2 || '',
      gelar_belakang: fp.gelar_belakang || '', tempat_lahir: fp.tempat_lahir || '',
      tanggal_lahir: formatDateForInput(fp.tanggal_lahir), jenis_kelamin: fp.jenis_kelamin || '',
      agama_id: fp.agama_id || '', pendidikan_id: fp.pendidikan_id || '',
      status_kawin_id: fp.status_kawin_id || '', kode_pos: fp.kode_pos || '',
      telepon: fp.telepon || '', golongan_darah_id: fp.golongan_darah_id || '',
      bank_id: fp.bank_id || '', tmt_cpns: formatDateForInput(fp.tmt_cpns), tmt_pns: formatDateForInput(fp.tmt_pns),
      jenis_pegawai_id: peg?.jenis_pegawai_id || '', status_kepegawaian_id: peg?.status_kepegawaian_id || '',
      jabatan_id: peg?.jabatan_id || '', unit_kerja_id: peg?.unit_kerja_id || '',
      pangkat_id: peg?.pangkat_id || '', golongan_id: peg?.golongan_id || '',
      no_sk_jabatan: aktif?.no_sk || '', tanggal_sk_jabatan: formatDateForInput(aktif?.tanggal_sk),
      tmt_jabatan: formatDateForInput(aktif?.tmt_jabatan), bidang_studi: aktif?.bidang_studi || '',
      keterangan_jabatan: aktif?.keterangan_jabatan || '', is_diperbantukan: aktif?.is_diperbantukan || false,
      keterangan_diperbantukan: aktif?.keterangan_diperbantukan || '', tunjangan_jabatan: aktif?.tunjangan_jabatan || '',
      tugas_tambahan_id: activeDuty?.tugas_tambahan_id || '',
      tmt_tugas_tambahan: formatDateForInput(activeDuty?.tmt_mulai), keterangan_tugas: activeDuty?.keterangan || '',
    }
  } catch (e) {
    console.error('Error loading edit data:', e)
    showToastMsg('Gagal memuat data untuk edit', 'error')
    showFormModal.value = false
  }
}

const closeFormModal = () => { showFormModal.value = false }

const submitForm = async () => {
  try {
    submitting.value = true
    const payload = { ...formData.value }
    for (const key in payload) { if (payload[key] === '') payload[key] = null }
    await api.put(`/super-admin/profile-pegawai/${props.id}`, payload)
    showToastMsg('Pegawai berhasil diperbarui')
    closeFormModal()
    await loadAllData() // Refresh detail page data
  } catch (e) {
    console.error('Update Error', e)
    if (e.response?.status === 422 && e.response?.data?.errors) {
      showToastMsg(Object.values(e.response.data.errors)[0][0], 'error')
    } else {
      showToastMsg(e.response?.data?.message || 'Gagal memperbarui pegawai', 'error')
    }
  } finally { submitting.value = false }
}

const onJabatanChange = () => {
  const sel = positions.value.find(p => p.id === formData.value.jabatan_id)
  if (sel) {
    if (sel.tunjangan_jabatan) formData.value.tunjangan_jabatan = sel.tunjangan_jabatan
    if (!formData.value.keterangan_jabatan) formData.value.keterangan_jabatan = sel.nama_jabatan
  }
}

// ==================== PASSWORD MANAGEMENT ====================
const showPasswordModal = ref(false)
const submittingPassword = ref(false)
const customPassword = ref('')
const customPasswordConfirm = ref('')

const isCustomPasswordValid = computed(() => {
  return customPassword.value && customPassword.value.length >= 6 && customPassword.value === customPasswordConfirm.value
})

const openPasswordModal = () => {
  if (!profile.value?.user?.id) {
    showToastMsg('Pegawai ini belum memiliki akun user.', 'error')
    return
  }
  customPassword.value = ''
  customPasswordConfirm.value = ''
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  customPassword.value = ''
  customPasswordConfirm.value = ''
}

const getDefaultPasswordExample = () => {
  if (!profile.value?.tanggal_lahir) return 'YYYYMMDD'
  return String(profile.value.tanggal_lahir).replace(/-/g, '')
}

const resetPasswordToDefault = async () => {
  if (!profile.value?.tanggal_lahir) {
    showToastMsg('Tanggal lahir tidak tersedia.', 'error')
    return
  }
  const defaultPass = String(profile.value.tanggal_lahir).replace(/-/g, '')
  try {
    submittingPassword.value = true
    await api.post(`/super-admin/users/${profile.value.user.id}/reset-password`, { new_password: defaultPass })
    showToastMsg(`Password berhasil direset menjadi: ${defaultPass}`)
    closePasswordModal()
  } catch (e) {
    showToastMsg('Gagal mereset password.', 'error')
  } finally { submittingPassword.value = false }
}

const changeCustomPassword = async () => {
  if (!isCustomPasswordValid.value) return
  try {
    submittingPassword.value = true
    await api.post(`/super-admin/users/${profile.value.user.id}/reset-password`, { new_password: customPassword.value })
    showToastMsg('Password berhasil diubah.')
    closePasswordModal()
  } catch (e) {
    showToastMsg('Gagal mengubah password.', 'error')
  } finally { submittingPassword.value = false }
}

// ==================== TOAST ====================
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showToastMsg = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3000)
}
</script>

<style scoped>
/* ==================== Layout ==================== */
.app-container {
  padding: 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #64748b;
}

.loading-container .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==================== Header ==================== */
.modern-header {
  margin-bottom: 24px;
}

/* Header is defined below with header-actions layout */

.header-text h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-text p {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0;
}

/* ==================== Profile Header Card ==================== */
.profile-header-card {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.profile-header-content {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.profile-avatar {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffffff;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  font-size: 3rem;
  font-weight: 700;
  color: #94a3b8;
}

.profile-info {
  flex: 1;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.profile-nip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.profile-nip i {
  color: #6366f1;
}

.profile-nip span {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #475569;
}

.profile-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.meta-item {
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.meta-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 4px;
}

.meta-value {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

/* ==================== Tab Navigation ==================== */
.tab-navigation {
  display: flex;
  gap: 4px;
  background: #ffffff;
  border-radius: 12px 12px 0 0;
  border: 1px solid #e2e8f0;
  border-bottom: none;
  padding: 8px 8px 0;
  overflow-x: auto;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.tab-btn:hover {
  color: #334155;
  background: #f8fafc;
}

.tab-btn.active {
  color: #4f46e5;
  background: #eef2ff;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 3px;
  background: #6366f1;
  border-radius: 3px 3px 0 0;
}

.tab-btn i {
  font-size: 0.85rem;
}

/* ==================== Tab Content ==================== */
.tab-content-card {
  background: #ffffff;
  border-radius: 0 0 16px 16px;
  border: 1px solid #e2e8f0;
  border-top: 2px solid #6366f1;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 300px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== Two Column Layout ==================== */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

@media (max-width: 768px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .profile-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-name-row {
    justify-content: center;
  }

  .profile-nip {
    justify-content: center;
  }
}

/* ==================== Section Titles ==================== */
.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid;
}

.section-title-blue {
  color: #2563eb;
  border-color: #3b82f6;
}

.section-title-green {
  color: #16a34a;
  border-color: #22c55e;
}

/* ==================== Info Rows ==================== */
.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  gap: 16px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  min-width: 140px;
  flex-shrink: 0;
}

.info-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
  text-align: right;
  word-break: break-word;
}

.font-mono {
  font-family: 'Courier New', monospace;
}

/* ==================== Table ==================== */
.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.modern-table thead {
  background: #f8fafc;
}

.modern-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

.modern-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

.modern-table tr:hover {
  background: #f8fafc;
}

.font-bold {
  font-weight: 700;
}

.text-muted {
  color: #94a3b8;
}

.small-note {
  font-size: 0.75rem;
  margin-top: 2px;
}

/* ==================== Badges ==================== */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.badge-green {
  background: #dcfce7;
  color: #16a34a;
}

.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}

.badge-blue {
  background: #dbeafe;
  color: #2563eb;
}

/* ==================== Education Cards ==================== */
.education-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.education-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s;
}

.education-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.edu-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.edu-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.edu-title {
  flex: 1;
}

.edu-title h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.edu-school {
  margin: 2px 0 0;
  font-size: 0.83rem;
  color: #64748b;
}

.edu-year {
  background: #eef2ff;
  color: #4f46e5;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.edu-details {
  padding-left: 58px;
}

/* ==================== Tugas Tambahan ==================== */
.tugas-tambahan-card {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

/* ==================== Empty State ==================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #94a3b8;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.9rem;
  margin: 0;
}

/* ==================== Buttons ==================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-icon-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* ==================== Error State ==================== */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.state-container.error h3 {
  color: #dc2626;
  margin: 12px 0 8px;
}

.state-container.error p {
  color: #64748b;
  margin-bottom: 16px;
}

.state-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.bg-red {
  background: #fef2f2;
  color: #dc2626;
}

/* ==================== Utility ==================== */
.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 32px;
  padding-bottom: 32px;
}

/* ==================== Header Layout ==================== */
.header-left {
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-edit {
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.btn-edit:hover { background: #e0e7ff; }

.btn-password {
  background: #f3e8ff;
  color: #9333ea;
  border: 1px solid #d8b4fe;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.btn-password:hover { background: #ede9fe; }

/* ==================== MODALS ==================== */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
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
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
}

.modal-body {
  padding: 24px;
}

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

/* ==================== FORMS ==================== */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row.three-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.fluid { flex: 1; }
.form-group.half { flex: 1; }

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background: white;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.select-wrapper {
  position: relative;
  min-width: 160px;
}

.select-wrapper select {
  width: 100%;
  padding: 10px 32px 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  appearance: none;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}
.select-wrapper select:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.dropdown-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  font-size: 12px;
}

.text-danger { color: #ef4444; }
.fluid { width: 100%; }

.form-actions-right {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-text {
  background: transparent;
  border: none;
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s;
}
.btn-text:hover { color: #374151; background: #f3f4f6; }

/* ==================== STATES ==================== */
.state-container {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.state-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
}
.bg-blue { background: #eff6ff; color: #3b82f6; }
.state-container h3 { margin: 0 0 8px; font-size: 18px; }
.state-container p { margin: 0 0 16px; color: #6b7280; }

/* ==================== TOAST ==================== */
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  color: white;
}
.toast-success { background: #16a34a; }
.toast-error { background: #dc2626; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(20px); }

/* ==================== TRANSITIONS ==================== */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
