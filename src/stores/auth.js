import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        // Restore user dari localStorage saat inisialisasi
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
        loginType: localStorage.getItem('loginType') || null, // 'email' atau 'nip'
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => {
            if (!state.user) return false;

            // Check by role_id (1 = super_admin/admin - heuristic, better to rely on code)
            if (state.user.role_id === 1) return true;

            // Check by role object (Backend uses kode_role)
            if (state.user.role?.kode_role) {
                return ['ADMIN', 'SUPER_ADMIN'].includes(state.user.role.kode_role);
            }

            // Fallback for older structure (optional, but good for safety)
            if (state.user.roles?.some) {
                return state.user.roles.some(role => ['ADMIN', 'SUPER_ADMIN'].includes(role.kode_role || role.role_code));
            }

            return false;
        },

        // Helper untuk menentukan apakah user perlu melengkapi data
        needsProfileCompletion: (state) => {
            return state.user?.status === 'NEW_USER' || !state.user?.email;
        }
    },

    actions: {
        async login(credentials) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Login attempt with:', credentials);

                // Deteksi tipe login berdasarkan input yang diberikan
                let payload = {};
                let loginType = '';

                // Prioritas 1: Login dengan NIP (NEW_USER)
                if (credentials.nip && credentials.tanggal_lahir) {
                    loginType = 'nip';
                    payload = {
                        nip: credentials.nip,
                        tanggal_lahir: credentials.tanggal_lahir // Format: YYYY-MM-DD
                    };

                    console.log('Using NIP login:', payload);

                }
                // Prioritas 2: Login dengan Email (OLD_USER)
                else if (credentials.email && credentials.password) {
                    loginType = 'email';
                    payload = {
                        email: credentials.email,
                        password: credentials.password
                    };

                    console.log('Using Email login:', {
                        email: payload.email,
                        password_length: payload.password?.length
                    });

                }
                // Error: Format tidak dikenali
                else {
                    throw new Error('Masukkan email dan password ATAU NIP dan tanggal lahir');
                }

                // Kirim request ke API
                const response = await api.post('/login', payload);

                // Debug response
                console.log('Login response:', response.data);

                if (!response.data.success) {
                    throw new Error(response.data.message || 'Login failed');
                }

                // Backend returns: { success: true, data: { token, user: {...}, status: 'NEW_USER'/'OLD_USER' } }
                const { token, user, status } = response.data.data;

                // Tambahkan status ke user object jika ada
                if (status) {
                    user.status = status;
                }

                this.token = token;
                this.user = user;
                this.loginType = loginType;

                // Simpan token dan user ke localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('loginType', loginType);

                // Set default header for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                console.log('Login successful. Login type:', loginType, 'Status:', status);

                return {
                    success: true,
                    status: status,
                    needsProfile: status === 'NEW_USER' || !user.email
                };

            } catch (err) {
                // Tangani error dengan lebih baik
                console.error('Login error details:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });

                // Prioritaskan error dari backend, lalu error validation, lalu default
                if (err.response?.data?.errors) {
                    // Error validasi Laravel (422)
                    const errors = err.response.data.errors;
                    const firstError = Object.values(errors)[0]?.[0];
                    this.error = firstError || 'Data tidak valid';

                } else if (err.response?.data?.message) {
                    // Error dari backend (401, 403, dll)
                    this.error = err.response.data.message;

                } else if (err.message) {
                    // Error dari frontend
                    this.error = err.message;

                } else {
                    this.error = 'Login gagal. Periksa koneksi internet Anda.';
                }

                return false;

            } finally {
                this.loading = false;
            }
        },

        async fetchUser() {
            if (!this.token) return;

            try {
                console.log('Fetching user data...');
                const response = await api.get('/me');

                if (!response.data.success) {
                    throw new Error(response.data.message || 'Failed to fetch user');
                }

                // Backend: { success: true, data: user }
                this.user = response.data.data;

                // Update status jika ada di localStorage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (storedUser.status) {
                    this.user.status = storedUser.status;
                }

                // Update user di localStorage
                localStorage.setItem('user', JSON.stringify(this.user));

                console.log('User data fetched successfully');

            } catch (err) {
                console.error('Failed to fetch user:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });

                // If 401, logout
                if (err.response && err.response.status === 401) {
                    this.logout();
                }
            }
        },

        // Method baru untuk inisialisasi auth saat app load
        async initializeAuth() {
            // Jika sudah ada user dan token, set header dan return
            if (this.user && this.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                console.log('Auth initialized from localStorage. User:', this.user.email || this.user.username || 'NIP user');

                // Optional: Validate token validity by fetching user in background
                // Untuk sekarang, kita fetch user untuk memastikan data terbaru
                setTimeout(() => {
                    this.fetchUser();
                }, 1000);

                return;
            }

            // Jika ada token tapi tidak ada user, fetch user dari API
            if (this.token && !this.user) {
                console.log('Token found but no user data. Fetching user...');
                api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                await this.fetchUser();
            }
        },

        async logout() {
            try {
                if (this.token) {
                    await api.post('/logout');
                }
            } catch (err) {
                console.error('Logout error', err);
                // Tetap lanjutkan logout meskipun API error
            } finally {
                this.token = null;
                this.user = null;
                this.loginType = null;

                // Clear localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('loginType');

                delete api.defaults.headers.common['Authorization'];

                console.log('Logged out successfully');
                // Force reload untuk membersihkan state
                window.location.reload();
            }
        },

        // Helper untuk clear error
        clearError() {
            this.error = null;
        }
    }
});