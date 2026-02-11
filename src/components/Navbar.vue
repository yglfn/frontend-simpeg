<template>
  <header class="navbar">
    <div class="navbar-content">

      <!-- LEFT: Brand -->
      <div class="navbar-left">
        <div class="brand-wrapper" @click="goHome">
          <div class="logo-wrap">
            <img
              src="https://ridergalau.id/wp-content/uploads/2025/12/Logo-UIN-Imam-Bonjol-Padang-RiderGalau.png"
              alt="Logo UIN IB"
              class="logo-img"
            />
          </div>
          <div class="brand-text">
            <h1 class="app-name">SIMPEG <span class="highlight">UINIB</span></h1>
            <span class="app-desc">Sistem Kepegawaian Terintegrasi</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: User -->
      <div class="navbar-right">
        <div
          class="user-trigger"
          :class="{ active: showUserMenu }"
          @click="toggleUserMenu"
          ref="userInfoRef"
        >
          <div class="user-avatar">
            <span v-if="!userPhoto">{{ getUserInitials }}</span>
            <img v-else :src="userPhoto" alt="User" />
          </div>

          <div class="user-meta">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role-badge" :class="roleBadgeClass">{{ userRoleLabel }}</span>
          </div>

          <i class="fas fa-chevron-down dropdown-arrow" :class="{ rotated: showUserMenu }"></i>
        </div>

        <transition name="slide-fade">
          <div v-if="showUserMenu" class="user-dropdown" ref="userMenuRef">
            <!-- Dropdown Header -->
            <div class="dropdown-header">
              <div class="header-avatar">{{ getUserInitials }}</div>
              <div class="header-info">
                <p class="header-name">{{ userName }}</p>
                <p class="header-role">{{ userRoleLabel }}</p>
              </div>
            </div>

            <!-- Dropdown Body -->
            <div class="dropdown-body">
              <!-- <div class="dropdown-section-label">MENU</div> -->

              <!-- <template v-if="isAdmin">
                <div class="dropdown-item" @click="goToAdminDashboard">
                  <i class="fas fa-th-large"></i>
                  <span>Dashboard Admin</span>
                </div>
                <div class="dropdown-item" @click="goToAdminUsers">
                  <i class="fas fa-users-cog"></i>
                  <span>Kelola Pengguna</span>
                </div>
              </template> -->

              <!-- <div class="dropdown-item" @click="goToProfile">
                <i class="fas fa-user-circle"></i>
                <span>Profil Saya</span>
              </div> -->

              <div class="dropdown-divider"></div>

              <div class="dropdown-item danger" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Keluar Aplikasi</span>
              </div>
            </div>
          </div>
        </transition>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const userInfoRef = ref(null)
const userMenuRef = ref(null)
const showUserMenu = ref(false)

const user = computed(() => authStore.user)
const userName = computed(() => user.value?.username || 'Pengguna')
const userPhoto = computed(() => user.value?.photo_url || null)

const isAdmin = computed(() => {
  return user.value?.role_id === 1 || String(user.value?.role?.kode_role).includes('ADMIN')
})

const userRoleLabel = computed(() => {
  if (user.value?.role_id === 1) return 'Super Admin'
  if (user.value?.role_id === 2) return 'Pegawai'
  return user.value?.role || 'User'
})

const roleBadgeClass = computed(() => {
  const roleId = user.value?.role_id
  if (roleId === 1) return 'badge-admin'
  if (roleId === 2) return 'badge-pegawai'
  return 'badge-default'
})

const getUserInitials = computed(() => {
  const name = userName.value
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'US'
})

const toggleUserMenu = (e) => {
  e?.stopPropagation()
  showUserMenu.value = !showUserMenu.value
}

const goHome = () => router.push('/')

const goToProfile = () => {
  router.push(isAdmin.value ? '/admin/profile' : '/pegawai/profile')
  showUserMenu.value = false
}

const goToAdminDashboard = () => {
  router.push('/super-admin/dashboard')
  showUserMenu.value = false
}

const goToAdminUsers = () => {
  router.push('/admin/users')
  showUserMenu.value = false
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      'Apakah Anda yakin ingin mengakhiri sesi?',
      'Konfirmasi Logout',
      {
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )
    await authStore.logout()
    router.push('/login')
  } catch (e) {
    // Cancelled
  }
  showUserMenu.value = false
}

const handleClickOutside = (e) => {
  if (
    userInfoRef.value && !userInfoRef.value.contains(e.target) &&
    userMenuRef.value && !userMenuRef.value.contains(e.target)
  ) {
    showUserMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

/* =============================================
   NAVBAR — tema dark selaras dengan sidebar
   rail-bg  : #12131f   (sidebar icon rail)
   panel-bg : #1a1c2e   (sidebar label panel)
   ============================================= */

.navbar {
  height: 90px;
  background: #12131f;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  font-family: 'Sora', sans-serif;
  box-shadow: 0 1px 0 rgba(255,255,255,0.04);
}

.navbar-content {
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ---- Brand ---- */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hamburger-btn {
  background: transparent;
  border: none;
  color: #a0aec0;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 11px;
  cursor: pointer;
  padding: 6px 10px 6px 0;
  border-radius: 10px;
  transition: opacity 0.2s;
}

.brand-wrapper:hover { opacity: 0.85; }

.logo-wrap {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.logo-img {
  width: 42px;
  height: 42px;
  object-fit: contain;
  /* filter agar logo terlihat di background gelap */
  filter: brightness(0) invert(1);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.app-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e8eaf2;
  margin: 0;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.app-name .highlight {
  color: #7c83f5;   /* indigo terang di atas gelap */
}

.app-desc {
  font-size: 0.75rem;
  color: #ecf0f1;
  font-weight: 400;
  margin-top: 2px;
  white-space: nowrap;
}

/* ---- User Trigger ---- */
.navbar-right {
  display: flex;
  align-items: center;
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px 5px 6px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s, border-color 0.2s;
}

.user-trigger:hover,
.user-trigger.active {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.08);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: linear-gradient(135deg, #5b5ff0, #7c83f5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 0.84rem;
  font-weight: 600;
  color: #c8cce0;
  line-height: 1.2;
  white-space: nowrap;
}

.user-role-badge {
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 1px 7px;
  border-radius: 5px;
  margin-top: 3px;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.badge-admin {
  background: rgba(124,131,245,0.18);
  color: #9da5f8;
}

.badge-pegawai {
  background: rgba(255,255,255,0.07);
  color: #6b7090;
}

.badge-default {
  background: rgba(255,255,255,0.05);
  color: #6b7090;
}

.dropdown-arrow {
  color: #4a5080;
  font-size: 0.72rem;
  transition: transform 0.25s ease;
  margin-left: 2px;
  flex-shrink: 0;
}

.dropdown-arrow.rotated { transform: rotate(180deg); }

/* ---- Dropdown ---- */
.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 256px;
  background: #1a1c2e;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.45);
  overflow: hidden;
  z-index: 2000;
}

.dropdown-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 11px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.header-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #5b5ff0, #7c83f5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.05rem;
  flex-shrink: 0;
}

.header-info { flex: 1; overflow: hidden; }

.header-name {
  margin: 0;
  font-weight: 600;
  color: #c8cce0;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-role {
  margin: 3px 0 0;
  font-size: 0.72rem;
  color: #4a5080;
}

.dropdown-body { padding: 8px; }

.dropdown-section-label {
  padding: 6px 10px 4px;
  font-size: 0.6rem;
  font-weight: 600;
  color: #3e4260;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: #8b8fa8;
  font-size: 0.84rem;
  font-weight: 400;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.18s, color 0.18s;
}

.dropdown-item i {
  width: 16px;
  text-align: center;
  font-size: 0.85rem;
  color: #4a5080;
  transition: color 0.18s;
  flex-shrink: 0;
}

.dropdown-item:hover {
  background: rgba(255,255,255,0.06);
  color: #c0c4d8;
}

.dropdown-item:hover i { color: #7c83f5; }

.dropdown-divider {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 6px 0;
}

.dropdown-item.danger { color: #f87171; }
.dropdown-item.danger i { color: #f87171; }
.dropdown-item.danger:hover { background: rgba(248,113,113,0.08); }
.dropdown-item.danger:hover i { color: #f87171; }

/* ---- Transition ---- */
.slide-fade-enter-active {
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
}
.slide-fade-leave-active {
  transition: all 0.15s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .app-desc { display: none; }

  .user-meta { display: none; }

  .dropdown-arrow { display: none; }

  .user-trigger {
    padding: 4px;
    border-radius: 50%;
  }

  .user-avatar {
    border-radius: 50%;
  }
}
</style>