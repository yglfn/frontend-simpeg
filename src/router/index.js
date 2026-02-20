import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/auth',
            component: () => import('@/layouts/AuthLayout.vue'),
            children: [
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('@/views/auth/Login.vue'),
                    meta: { guest: true }
                }
            ]
        },
        {
            path: '/',
            component: () => import('@/layouts/DashboardLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true }
                },
                // Employee Routes (renamed or mapped as needed)
                // {
                //     path: 'super-admin/pegawai',
                //     name: 'employee-list',
                //     component: () => import('@/views/employee/EmployeeList.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: 'employees/create', // Keep original or update? Keeping structure flexible
                //     name: 'employee-create',
                //     component: () => import('@/views/employee/EmployeeForm.vue'),
                //     meta: { requiresAuth: true }
                // },
                // Master Data Routes
                {
                    path: 'super-admin/jabatan',
                    name: 'admin-jabatan',
                    component: () => import('@/views/admin/Jabatan.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: 'super-admin/unit-kerja',
                    name: 'admin-unit-kerja',
                    component: () => import('@/views/admin/UnitKerja.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: 'super-admin/referensi',
                    name: 'admin-referensi',
                    component: () => import('@/views/admin/ReferenceData.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: 'super-admin/tugas-tambahan',
                    name: 'admin-tugas-tambahan',
                    component: () => import('@/views/admin/TugasTambahan.vue'),
                    meta: { requiresAuth: true }
                },

                {
                    path: 'super-admin/data-pegawai',
                    name: 'admin-data-pegawai',
                    component: () => import('@/views/admin/DataPegawai.vue'),
                    meta: { requiresAuth: true }
                },

                // Pegawai Routes
                {
                    path: 'pegawai/profile',
                    name: 'pegawai-profile',
                    component: () => import('@/views/pegawai/PegawaiProfile.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: 'pegawai/dokumen',
                    name: 'pegawai-dokumen',
                    component: () => import('@/views/pegawai/Dokumen.vue'),
                    meta: { requiresAuth: true }
                },
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/auth/login'
        }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');

    if (to.meta.requiresAuth && !token) {
        next({ name: 'login' });
    } else if (to.meta.guest && token) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

export default router
