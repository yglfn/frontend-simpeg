<template>
  <div class="login-container">
    <!-- Left Side - Info Panel -->
    <div class="info-panel">
      <!-- Background Image -->
      <div class="background-image"></div>
      
      <!-- Overlay for better text readability -->
      <div class="background-overlay"></div>
      
      <div class="logo">
        <!-- Logo UIN Imam Bonjol -->
        <div class="logo-image">
          <img src="https://ridergalau.id/wp-content/uploads/2025/12/Logo-UIN-Imam-Bonjol-Padang-RiderGalau.png" alt="Logo UIN Imam Bonjol Padang" />
        </div>
        <div class="logo-text">
          <h1>SIMPEG <span>UIN Imam Bonjol Padang</span></h1>
          <p>Sistem Informasi Kepegawaian Terintegrasi</p>
        </div>
      </div>

      <div class="system-info">
        <h2>Keunggulan Sistem</h2>
        <ul class="features-list">
          <li class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-database"></i>
            </div>
            <div class="feature-text">
              <h4>Single Source of Truth</h4>
              <p>Data pegawai terpusat dan terintegrasi untuk semua unit kerja</p>
            </div>
          </li>
          <li class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-user-shield"></i>
            </div>
            <div class="feature-text">
              <h4>Role-Based Access</h4>
              <p>Akses terkontrol berdasarkan peran dan wewenang pengguna</p>
            </div>
          </li>
          <li class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-project-diagram"></i>
            </div>
            <div class="feature-text">
              <h4>Workflow Terstruktur</h4>
              <p>Proses administratif dan manajerial yang sistematis dan terdokumentasi</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="role-info">
        <h4>Akses Berdasarkan Peran</h4>
        <div class="role-badges">
          <div class="role-badge">Admin Universitas</div>
          <div class="role-badge">Admin Fakultas</div>
          <div class="role-badge">Pimpinan</div>
          <div class="role-badge">Dosen</div>
          <div class="role-badge">Tenaga Kependidikan</div>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="login-form-panel">
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-header mb-8">
             <h2 class="text-2xl font-bold">Selamat Datang</h2>
             <p class="text-slate-500">Silakan masuk ke akun Anda</p>
        </div>

        <div v-if="authStore.error" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
            <p>{{ authStore.error }}</p>
        </div>

        <div class="form-group">
          <label for="username" class="form-label">Email / NIP / NIK / Nomor Identitas</label>
          <div class="input-with-icon">
            <i class="fas fa-user"></i>
            <input
              type="text"
              id="username"
              class="form-input"
              v-model="form.username"
              placeholder="Masukkan identitas anda"
              required
            />
          </div>

        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-input"
              v-model="form.password"
              placeholder="Masukkan password anda"
              required
            />
            <button type="button" class="password-toggle" @click="togglePasswordVisibility">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
          </p>
        </div>

        <div class="remember-forgot">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="form.remember" />
            <label for="remember" class="ml-2">Ingat saya</label>
          </div>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            Lupa password?
          </a>
        </div>

        <button type="submit" class="btn-login" :disabled="loading || authStore.loading">
          <i :class="(loading || authStore.loading) ? 'fas fa-spinner fa-spin' : 'fas fa-sign-in-alt'" class="mr-2"></i>
          {{ (loading || authStore.loading) ? 'Memproses...' : 'Masuk ke Sistem' }}
        </button>

        <!-- Info tambahan -->
        <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
          <i class="fas fa-info-circle mr-1"></i>
          <strong>Catatan:</strong> Sistem akan otomatis mendeteksi apakah Anda login dengan email atau NIP.
        </div>

        <div class="login-footer">
          <p class="mb-1">© {{ currentYear }} TIPD UINIB. Hak cipta dilindungi.</p>
          <div class="support-info">
            Butuh bantuan? Hubungi
            <a href="#" @click.prevent="showSupportInfo">Biro Kepegawaian Universitas</a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const loading = ref(false)

const currentYear = computed(() => {
  return new Date().getFullYear()
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleForgotPassword = () => {
  showToast('Silakan hubungi Biro Kepegawaian Universitas untuk reset password. Email: kepegawaian@uinib.ac.id', 'info')
}

const showSupportInfo = () => {
  showToast('Bantuan: Hubungi Biro Kepegawaian Universitas (0751) 30071', 'info')
}

const handleLogin = async () => {
  // Validasi
  if (!form.username.trim() || !form.password) {
    showToast('Silakan lengkapi username dan password', 'error')
    return
  }

  loading.value = true

  try {
    // Deteksi otomatis tipe login
    const credentials = {}
    const username = form.username.trim()
    
    // Deteksi apakah input adalah email atau NIP
    const isEmail = username.includes('@')
    const isLikelyDate = /^\d{4}-\d{2}-\d{2}$/.test(form.password)
    
    if (isEmail) {
      // Login dengan email (OLD_USER)
      credentials.email = username
      credentials.password = form.password
      console.log('Mode: Email login')
    } else {
      // Login dengan NIP (NEW_USER)
      // Asumsi password field berisi tanggal lahir untuk mode NIP
      credentials.nip = username
      credentials.tanggal_lahir = form.password
      console.log('Mode: NIP login')
    }
    
    console.log('Mengirim credentials:', credentials)
    
    // Panggil auth store dengan credentials yang sudah diformat
    const result = await authStore.login(credentials)

    if (result && result.success !== false) {
      showToast('Login berhasil! Selamat datang.')
      
      // Redirect ke dashboard untuk semua user yang berhasil login
      router.push('/')
    } else {
      // Show explicit error notification
      showToast(authStore.error || 'Login gagal. Silakan coba lagi.', 'error')
    }
  } catch (error) {
    console.error('Login error:', error)
    showToast('Terjadi kesalahan pada sistem. Silakan coba lagi nanti.', 'error')
  } finally {
    loading.value = false
  }
}

// Add interactive effects on mount
onMounted(() => {
  const formInputs = document.querySelectorAll('.form-input')

  formInputs.forEach((input) => {
    input.addEventListener('focus', function () {
      this.parentElement.style.transform = 'scale(1.02)'
    })

    input.addEventListener('blur', function () {
      this.parentElement.style.transform = 'scale(1)'
    })
  })
  
  // Load remembered username jika ada
  const rememberedUser = localStorage.getItem('rememberedUser')
  if (rememberedUser) {
    form.username = rememberedUser
    form.remember = true
  }
})
</script>

<style scoped>
/* Root Layout */
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
  position: relative;
}

/* ================= LEFT PANEL ================= */
.info-panel {
  flex: 1.2;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* Background Image */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://uinib.ac.id/2022/wp-content/uploads/2021/12/Rektorat_UIN_Imam_Bonjol.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}

/* Overlay for better text readability */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(160deg, rgba(7, 82, 144, 0.85), rgba(3, 67, 69, 0.9));
  z-index: -1;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  backdrop-filter: blur(2px);
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-image {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  padding: 5px;
}

.logo-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-text h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.logo-text span {
  color: #93c5fd;
}

.logo-text p {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  opacity: 0.85;
}

/* System Info */
.system-info {
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.system-info h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-icon {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  font-size: 1.2rem;
  color: #bfdbfe;
}

.feature-text h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.feature-text p {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  opacity: 0.85;
}

/* Role Info */
.role-info {
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.role-info h4 {
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.role-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ================= RIGHT PANEL ================= */
.login-form-panel {
  flex: 1;
  background: #f8fafc;
  color: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
}

.login-form {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

/* Header */
.form-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.form-header p {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

/* Form */
.form-group {
  margin-top: 1.25rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  display: block;
}

.input-with-icon {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.65rem 0.75rem;
  transition: all 0.25s ease;
  background: #f8fafc;
}

.input-with-icon i {
  color: #64748b;
  margin-right: 0.5rem;
}

.form-input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 0.9rem;
}

.input-with-icon:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  background: #ffffff;
}

/* Password Toggle */
.password-toggle {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
}

/* Remember & Forgot */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  font-size: 0.8rem;
}

.forgot-password {
  color: #2563eb;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* Button */
.btn-login {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Footer */
.login-footer {
  margin-top: 1.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
}

.login-footer a {
  color: #2563eb;
  text-decoration: none;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
  }

  .info-panel {
    display: none;
  }

  .login-form-panel {
    min-height: 100vh;
  }
}

/* Animation for logo */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo {
  animation: fadeIn 0.8s ease-out;
}

.system-info, .role-info {
  animation: fadeIn 0.8s ease-out 0.2s both;
}
</style>