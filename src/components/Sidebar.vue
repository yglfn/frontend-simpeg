<template>
  <aside
    class="sidebar"
    :class="{ collapsed: isCollapsed }"
  >
    <!-- Sidebar Header dengan Hamburger Toggle -->
    <div class="sidebar-header">
      <button class="hamburger-toggle" @click="toggleSidebar">
        <i class="fas fa-bars"></i>
      </button>
    </div>


    <!-- Sidebar Menu -->
    <nav class="sidebar-menu">
      <ul class="menu-list">
        <!-- Dashboard -->
        <li class="menu-item" :class="{ active: isActiveRoute('/dashboard') }">
          <router-link 
            to="/dashboard" 
            class="menu-link"
            @click="handleMenuClick('dashboard')"
            :title="isCollapsed ? 'Dashboard' : ''"
          >
            <i class="fas fa-tachometer-alt"></i>
            <span v-if="!isCollapsed">Dashboard</span>
          </router-link>
        </li>

        <!-- Admin Menu (Hanya untuk Super Admin) -->
        <template v-if="isSuperAdmin">
          <!-- Pegawai Management -->
          <template v-if="!isCollapsed">
            <li class="menu-section">
              <span class="section-label">MANAJEMEN PEGAWAI</span>
            </li>
          </template>
          <li class="menu-item" :class="{ active: isActiveRoute('/super-admin/data-pegawai') }">
            <router-link 
              to="/super-admin/data-pegawai" 
              class="menu-link"
              @click="handleMenuClick('data-pegawai')"
              :title="isCollapsed ? 'Data Pegawai' : ''"
            >
              <i class="fas fa-user-tie"></i>
              <span v-if="!isCollapsed">Data Pegawai</span>
            </router-link>
          </li>

          <!-- Jabatan & Unit Kerja -->
          <template v-if="!isCollapsed">
            <li class="menu-section">
              <span class="section-label">ORGANISASI</span>
            </li>
          </template>
          <li class="menu-item" :class="{ active: isActiveRoute('/super-admin/jabatan') }">
            <router-link 
              to="/super-admin/jabatan" 
              class="menu-link"
              @click="handleMenuClick('jabatan')"
              :title="isCollapsed ? 'Jabatan' : ''"
            >
              <i class="fas fa-sitemap"></i>
              <span v-if="!isCollapsed">Jabatan</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ active: isActiveRoute('/super-admin/unit-kerja') }">
            <router-link 
              to="/super-admin/unit-kerja" 
              class="menu-link"
              @click="handleMenuClick('unit-kerja')"
              :title="isCollapsed ? 'Unit Kerja' : ''"
            >
              <i class="fas fa-building"></i>
              <span v-if="!isCollapsed">Unit Kerja</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ active: isActiveRoute('/super-admin/tugas-tambahan') }">
            <router-link 
              to="/super-admin/tugas-tambahan" 
              class="menu-link"
              @click="handleMenuClick('tugas-tambahan')"
              :title="isCollapsed ? 'Tugas Tambahan' : ''"
            >
              <i class="fas fa-tasks"></i>
              <span v-if="!isCollapsed">Tugas Tambahan</span>
            </router-link>
          </li>
          
          <!-- Referensi (Read Only) -->
          <template v-if="!isCollapsed">
            <li class="menu-section">
              <span class="section-label">SYSTEM</span>
            </li>
          </template>
          <li class="menu-item" :class="{ active: isActiveRoute('/super-admin/referensi') }">
            <router-link 
              to="/super-admin/referensi" 
              class="menu-link"
              @click="handleMenuClick('referensi')"
              :title="isCollapsed ? 'Tabel Referensi' : ''"
            >
              <i class="fas fa-book"></i>
              <span v-if="!isCollapsed">Tabel Referensi</span>
            </router-link>
          </li>
        </template>

        <!-- Pegawai Menu (Untuk non-admin) -->
        <template v-else>
          <template v-if="!isCollapsed">
            <li class="menu-section">
              <span class="section-label">PROFIL SAYA</span>
            </li>
          </template>
          <li class="menu-item" :class="{ active: isActiveRoute('/pegawai/profile') && (!$route.query.tab || $route.query.tab === 'umum') }">
            <router-link 
              to="/pegawai/profile?tab=umum" 
              class="menu-link"
              @click="handleMenuClick('profile-umum')"
              :title="isCollapsed ? 'Data Umum' : ''"
            >
              <i class="fas fa-user"></i>
              <span v-if="!isCollapsed">Data Umum</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ active: $route.query.tab === 'alamat' }">
            <router-link 
              to="/pegawai/profile?tab=alamat" 
              class="menu-link"
              @click="handleMenuClick('profile-alamat')"
              :title="isCollapsed ? 'Alamat' : ''"
            >
              <i class="fas fa-map-marker-alt"></i>
              <span v-if="!isCollapsed">Alamat</span>
            </router-link>
          </li> 

                    <li class="menu-item" :class="{ active: $route.query.tab === 'riwayat-jabatan' }">
            <router-link 
              to="/pegawai/profile?tab=riwayat-jabatan" 
              class="menu-link"
              @click="handleMenuClick('profile-riwayat-jabatan')"
              :title="isCollapsed ? 'Riwayat Jabatan' : ''"
            >
              <i class="fas fa-sitemap"></i>
              <span v-if="!isCollapsed"> Riwayat Jabatan</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ active: $route.query.tab === 'pendidikan' }">
            <router-link 
              to="/pegawai/profile?tab=pendidikan" 
              class="menu-link"
              @click="handleMenuClick('profile-pendidikan')"
              :title="isCollapsed ? 'Pendidikan' : ''"
            >
              <i class="fas fa-graduation-cap"></i>
              <span v-if="!isCollapsed"> Riwayat Pendidikan</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ active: $route.query.tab === 'keluarga' }">
            <router-link 
              to="/pegawai/profile?tab=keluarga" 
              class="menu-link"
              @click="handleMenuClick('profile-keluarga')"
              :title="isCollapsed ? 'Keluarga' : ''"
            >
              <i class="fas fa-users"></i>
              <span v-if="!isCollapsed"> Data Keluarga</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ active: $route.query.tab === 'keamanan' }">
            <router-link 
              to="/pegawai/profile?tab=keamanan" 
              class="menu-link"
              @click="handleMenuClick('profile-keamanan')"
              :title="isCollapsed ? 'Keamanan' : ''"
            >
              <i class="fas fa-shield-alt"></i>
              <span v-if="!isCollapsed">Keamanan</span>
            </router-link>
          </li>
        </template>
      </ul>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer" v-if="!isCollapsed">
      <div class="system-info">
        <p class="system-version">v1.0.0</p>
        <p class="system-status">
          <i class="fas fa-circle status-active"></i>
          Sistem Aktif
        </p>
      </div>
      <div class="debug-info" v-if="debugMode">
        <small>
          User ID: {{ user?.id }}<br />
          Role ID: {{ user?.role_id }}
        </small>
      </div>
    </div>
    <div v-else class="sidebar-footer-collapsed">
      <i class="fas fa-circle status-active" title="Sistem Aktif"></i>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-collapse', 'menu-click'])

// Reactive state
// Reactive state
const isCollapsed = computed(() => props.collapsed)

// ==================== COMPUTED PROPERTIES ====================

const user = computed(() => authStore.user)

// FIXED: Check if user is super admin (role_id: 1)
const isSuperAdmin = computed(() => {
  if (user.value?.role_id === 1) return true
  if (authStore.isAdmin) return true
  if (user.value?.role) {
    const roleLower = String(user.value.role).toLowerCase().trim()
    return ['super_admin', 'admin', 'administrator'].includes(roleLower)
  }
  return false
})

// Debug mode
const debugMode = computed(() => import.meta.env.DEV || false)

// ==================== METHODS ====================

const toggleSidebar = () => {
  emit('toggle-collapse', !props.collapsed)
}



const handleMenuClick = (menuName) => {
  emit('menu-click', menuName)
}

const isActiveRoute = (path) => {
  return route.path.startsWith(path)
}

// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
  console.log('=== SIDEBAR MOUNTED ===')
  console.log('User:', user.value)
  console.log('Role ID:', user.value?.role_id)
  console.log('isSuperAdmin:', isSuperAdmin.value)
  console.log('========================')
})

// Watch for prop changes
defineExpose({
  isSuperAdmin,
})
</script>


<style scoped>
/* Sidebar Base Styles */
.sidebar {
  width: 250px;
  background: #ffffff;
  color: #1e293b; /* Slate-800 */
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #e2e8f0; /* Slate-200 */
  margin-top: 90px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 70px;
}

/* Sidebar Header */
.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  border-bottom: 1px solid #f1f5f9; /* Slate-100 */
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 0;
}

/* Hamburger Toggle */
.hamburger-toggle {
  background: transparent;
  border: none;
  color: #64748b; /* Slate-500 */
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.hamburger-toggle:hover {
  background: #f1f5f9; /* Slate-100 */
  color: #334155; /* Slate-700 */
}

/* Sidebar Menu */
.sidebar-menu {
  flex: 1;
  padding: 15px 0;
  overflow-y: auto;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-section {
  padding: 12px 20px;
  margin-top: 15px;
}

.section-label {
  font-size: 0.7rem;
  color: #94a3b8; /* Slate-400 */
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.menu-item {
  margin: 3px 10px;
  border-radius: 8px;
  overflow: hidden;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #64748b; /* Slate-500 */
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
}

/* Hover Effect */
.menu-link:hover {
  background: #f8fafc; /* Slate-50 */
  color: #0f172a; /* Slate-900 */
  padding-left: 20px;
}

/* Active Menu */
.menu-item.active .menu-link {
  background: #eff6ff; /* Blue-50 */
  color: #2563eb; /* Blue-600 */
  box-shadow: none;
  font-weight: 600;
}

.menu-item.active .menu-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #3b82f6; /* Blue-500 */
  border-radius: 0 4px 4px 0;
}

/* Icon Styling */
.menu-link i {
  font-size: 1.1rem;
  min-width: 24px;
  text-align: center;
  color: #94a3b8; /* Slate-400 */
  transition: all 0.3s ease;
}

.menu-item.active .menu-link i {
  color: #3b82f6; /* Blue-500 */
  transform: scale(1.1);
}

.menu-link:hover i {
  color: #3b82f6; /* Blue-500 */
  transform: scale(1.1);
}

/* Text Styling */
.menu-link span {
  margin-left: 12px;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Collapsed State */
.sidebar.collapsed .menu-link {
  padding: 14px 0;
  justify-content: center;
  border-radius: 8px;
  margin: 0 8px 4px 8px;
}

.sidebar.collapsed .menu-item.active .menu-link {
  background: #eff6ff; /* Blue-50 */
}

.sidebar.collapsed .menu-item.active .menu-link::before {
  width: 100%;
  height: 3px;
  top: auto;
  bottom: 0;
  left: 0;
  border-radius: 3px;
}

/* Tooltip untuk collapsed state */
.sidebar.collapsed .menu-link {
  position: relative;
}

.sidebar.collapsed .menu-link:hover::after {
  content: attr(title);
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: #1e293b; /* Slate-800 */
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 3px solid #3b82f6;
  font-weight: 500;
  pointer-events: none;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 20px 15px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.8rem;
  color: #64748b;
  background: #ffffff;
}

.system-info {
  text-align: center;
}

.system-version {
  margin: 0 0 8px 0;
  font-weight: 500;
  color: #cbd5e1;
}

.system-status {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  color: #475569;
}

.status-active {
  color: #22c55e; /* Green-500 */
  font-size: 0.6rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.debug-info {
  text-align: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
}

.sidebar-footer-collapsed {
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
}

.sidebar-footer-collapsed .status-active {
  color: #22c55e;
  font-size: 0.8rem;
  animation: pulse 2s infinite;
}

/* Scrollbar Styling */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* Slate-300 */
  border-radius: 4px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; /* Slate-400 */
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 250px;
    transform: translateX(-100%);
    margin-top: 0;
    z-index: 1100;
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.1);
  }

  .sidebar.collapsed {
    width: 70px;
    transform: translateX(0);
  }
  
  .sidebar-header {
    justify-content: flex-start;
    padding-left: 15px;
  }
  
  /* Overlay untuk mobile */
  .sidebar:not(.collapsed)::before {
    content: '';
    position: fixed;
    top: 0;
    left: 250px;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}

/* Menu item animation */
.menu-link {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.sidebar {
  transition-property: width, transform;
}

.menu-item:not(.active) .menu-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.menu-item:not(.active) .menu-link:hover {
  transform: translateX(5px);
}

.sidebar.collapsed .menu-item:not(.active) .menu-link:hover {
  transform: scale(1.1);
}
</style>