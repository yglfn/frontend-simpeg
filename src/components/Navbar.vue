<template>
  <header class="navbar">
    <div class="container navbar-content">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-image">
          <img src="https://ridergalau.id/wp-content/uploads/2025/12/Logo-UIN-Imam-Bonjol-Padang-RiderGalau.png" 
               alt="Logo UIN Imam Bonjol Padang" 
               class="logo-img" />
        </div>
        <div class="logo-text">
          <div class="logo-main">
            <h1>SIMPEG <span>UINIB</span></h1>
            <p>Sistem Informasi Kepegawaian Terintegrasi</p>
          </div>
        </div>
      </div>

      <!-- User Info & Menu -->
      <div class="user-info" ref="userInfoRef">
        <div class="user-info-horizontal" @click="toggleUserMenu">
          <div class="user-details-horizontal">
            <p class="user-name">
              <strong>{{ userName }}</strong>
            </p>
            <div class="role-badge" :class="roleBadgeClass">{{ userRoleDisplay }}</div>
          </div>
          <div class="user-avatar">
            {{ getUserInitials }}
          </div>
          <i class="fas fa-chevron-down user-dropdown-icon" :class="{ rotated: showUserMenu }"></i>
        </div>

        <!-- User Menu Dropdown -->
        <div v-if="showUserMenu" class="user-menu" ref="userMenuRef">
          <div class="menu-header">
            <div class="menu-user-info">
              <div class="menu-user-avatar">{{ getUserInitials }}</div>
              <div class="menu-user-details">
                <p class="menu-user-name">{{ userName }}</p>
                <p class="menu-user-email">{{ user?.email || 'No email' }}</p>
                <p class="menu-user-role">{{ userRoleDisplay }}</p>
              </div>
            </div>
          </div>

          <div class="menu-divider"></div>

          <!-- Menu items for Admin -->
          <div v-if="isAdmin" class="menu-item" @click="goToAdminDashboard">
            <i class="fas fa-tachometer-alt"></i>
            <span>Dashboard Admin</span>
          </div>

          <div v-if="isAdmin" class="menu-item" @click="goToAdminUsers">
            <i class="fas fa-users"></i>
            <span>Kelola Pengguna</span>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-item logout" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            <span>Keluar</span>
          </div>

          <!-- Debug info (only in development) -->
          <div v-if="debugMode" class="menu-debug">
            <small> ID: {{ user?.id }} | Role: {{ user?.role }} </small>
          </div>
        </div>
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

// Refs
const userInfoRef = ref(null)
const userMenuRef = ref(null)
const showUserMenu = ref(false)

// ==================== COMPUTED PROPERTIES ====================

// User object
const user = computed(() => authStore.user)

// User name for display
const userName = computed(() => {
  if (!user.value) return 'User'
  return (
    user.value.nama_lengkap || user.value.nama || user.value.username || user.value.email || 'User'
  )
})

// Check if user is admin
const isAdmin = computed(() => {
  // Prioritas 1: role_id (1 = Admin, 2 = Pegawai)
  if (user.value?.role_id === 1) {
    return true
  }

  // Prioritas 2: role string
  if (user.value?.role) {
    const roleLower = String(user.value.role).toLowerCase().trim()
    return ['admin', 'administrator', 'super_admin'].includes(roleLower)
  }

  return false
})

// Role display text
const userRoleDisplay = computed(() => {
  // Prioritas: role_id mapping
  if (user.value?.role_id !== undefined && user.value?.role_id !== null) {
    const roleMap = {
      1: 'Administrator',
      2: 'Pegawai',
    }
    return roleMap[user.value.role_id] || 'Pengguna'
  }

  // Fallback ke role string
  if (user.value?.role) {
    const roleLower = user.value.role.toLowerCase()
    if (roleLower.includes('admin')) return 'Administrator'
    if (roleLower.includes('pegawai')) return 'Pegawai'
    return user.value.role
  }

  return 'Pengguna'
})

// Role badge class for styling
const roleBadgeClass = computed(() => {
  const roleId = user.value?.role_id
  if (roleId === 1) return 'badge-admin'
  if (roleId === 2) return 'badge-pegawai'

  // Fallback berdasarkan nama role
  const role = user.value?.role
  if (role?.includes('admin')) return 'badge-admin'
  if (role?.includes('pegawai')) return 'badge-pegawai'

  return 'badge-default'
})

// User initials
const getUserInitials = computed(() => {
  const name = userName.value
  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
  return initials || 'US'
})

// Debug mode
const debugMode = computed(() => import.meta.env.DEV || false)

// ==================== METHODS ====================

const toggleUserMenu = (event) => {
  if (event) {
    event.stopPropagation()
  }
  showUserMenu.value = !showUserMenu.value

  // Debug info ketika menu dibuka
  if (showUserMenu.value && debugMode.value) {
    console.log('=== NAVBAR DEBUG INFO ===')
    console.log('User object:', user.value)
    console.log('Role ID:', user.value?.role_id)
    console.log('Role string:', user.value?.role)
    console.log('isAdmin:', isAdmin.value)
    console.log('userRoleDisplay:', userRoleDisplay.value)
    console.log('========================')
  }
}

const goToProfile = () => {
  if (isAdmin.value) {
    router.push('/admin/profile')
  } else {
    router.push('/pegawai/profile')
  }
  showUserMenu.value = false
}

const goToAdminDashboard = () => {
  if (isAdmin.value) {
    router.push('/super-admin/dashboard')
    showUserMenu.value = false
  }
}

const goToAdminUsers = () => {
  if (isAdmin.value) {
    router.push('/admin/users')
    showUserMenu.value = false
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('Apakah Anda yakin ingin keluar dari sistem?', 'Konfirmasi Logout', {
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      type: 'warning',
      customClass: 'logout-confirm-modal',
    })

    await authStore.logout()
    router.push('/login')
  } catch (error) {
    // User cancelled
    console.log('Logout cancelled')
  }
  showUserMenu.value = false
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (userInfoRef.value && !userInfoRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

// Handle escape key
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    showUserMenu.value = false
  }
}

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)

  // Debug on mount
  if (debugMode.value) {
    console.log('Navbar mounted - User data:', user.value)
    console.log('LocalStorage user:', localStorage.getItem('user'))
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

// Expose methods if needed
defineExpose({
  toggleUserMenu,
  goToProfile,
  handleLogout,
  isAdmin,
  userRoleDisplay,
})
</script>

<style scoped>
/* Navbar Base Styles */
.navbar {
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  padding: 12px 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 70px;
  width: 100%;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.logo:hover {
  opacity: 0.9;
}

.logo-image {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  padding: 5px;
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-text h1 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 2px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.logo-text span {
  color: #3498db;
  font-weight: 500;
  margin-left: 5px;
}

.logo-text p {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.1;
}

/* User Info Horizontal Layout */
.user-info {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.user-info-horizontal {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
  height: 100%;
  align-items: center;
}

.user-info-horizontal:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* User Details Horizontal */
.user-details-horizontal {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* Role Badge - Simplified for 2 roles */
.role-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  margin-top: 4px;
  color: white;
  text-align: center;
}

.badge-admin {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.badge-pegawai {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.badge-default {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

/* User Avatar */
.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  color: white;
  transition: transform 0.3s;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.user-avatar:hover {
  transform: scale(1.1);
}

/* Dropdown Icon */
.user-dropdown-icon {
  font-size: 0.9rem;
  opacity: 0.8;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.user-dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* User Menu Dropdown */
.user-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  z-index: 1001;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  border: 1px solid #e0e0e0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Menu Header */
.menu-header {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #e0e0e0;
}

.menu-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-user-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.menu-user-details {
  flex: 1;
  min-width: 0;
}

.menu-user-name {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-user-email {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-user-role {
  font-size: 0.75rem;
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  margin: 0;
}

/* Menu Items */
.menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
  user-select: none;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background-color: #f5f5f5;
  border-left-color: #3498db;
}

.menu-item i {
  width: 16px;
  color: #666;
  text-align: center;
  font-size: 1rem;
}

.menu-item.logout {
  color: #e74c3c;
  border-left-color: #e74c3c;
}

.menu-item.logout:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.menu-item.logout i {
  color: #e74c3c;
}

/* Menu Divider */
.menu-divider {
  height: 1px;
  background-color: #eee;
  margin: 4px 0;
}

/* Debug Info */
.menu-debug {
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  font-size: 0.7rem;
  color: #95a5a6;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .logo-text h1 {
    font-size: 1.3rem;
    flex-wrap: wrap;
  }

  .logo-text span {
    margin-left: 0;
    display: block;
  }

  .logo-text p {
    font-size: 0.75rem;
  }

  .logo-image {
    width: 45px;
    height: 45px;
  }

  .user-details-horizontal {
    max-width: 100px;
  }

  .user-name {
    font-size: 0.8rem;
  }

  .role-badge {
    font-size: 0.7rem;
    padding: 2px 6px;
    max-width: 100px;
  }

  .user-info-horizontal {
    padding: 8px;
  }

  .user-menu {
    min-width: 250px;
    right: -10px;
  }
}

@media (max-width: 480px) {
  .logo-image {
    width: 40px;
    height: 40px;
  }

  .logo-text h1 {
    font-size: 1.1rem;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .logo-text p {
    display: none;
  }

  .user-details-horizontal {
    display: none;
  }
}
</style>