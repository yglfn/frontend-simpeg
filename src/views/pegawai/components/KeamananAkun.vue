<template>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-red-500 rounded-full"></span>
                Ubah Password
            </h3>
        </div>
        <div class="p-8 max-w-2xl">
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800 flex gap-3">
                <i class="fas fa-exclamation-triangle mt-0.5"></i>
                <div>
                    <p class="font-bold">Perhatian</p>
                    <p>Demi keamanan akun Anda, gunakan password yang kuat (minimal 8 karakter, kombinasi huruf dan angka).</p>
                </div>
            </div>

            <div class="space-y-5">
                <div v-if="authStore.loginType !== 'nip'">
                    <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Password Saat Ini</label>
                    <input v-model="form.current_password" type="password" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow" placeholder="********">
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Password Baru</label>
                        <input v-model="form.new_password" type="password" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow" placeholder="********">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Konfirmasi Password Baru</label>
                        <input v-model="form.new_password_confirmation" type="password" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow" placeholder="********">
                    </div>
                </div>
                
                <p v-if="error" class="text-red-500 text-sm italic">{{ error }}</p>

                <div class="pt-2">
                    <button @click="changePassword" :disabled="saving || !isValid" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
                        {{ saving ? 'Menyimpan...' : 'Update Password' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()
import api from '@/services/api'

const authStore = useAuthStore()
const saving = ref(false)
const error = ref('')

const form = reactive({ 
    current_password: '', 
    new_password: '', 
    new_password_confirmation: '' 
})

const isValid = computed(() => {
  const isNipLogin = authStore.loginType === 'nip'
  const hasCurrentPassword = isNipLogin ? true : !!form.current_password
  return hasCurrentPassword && form.new_password && form.new_password.length >= 8 &&
         form.new_password === form.new_password_confirmation
})

const changePassword = async () => {
    if (!isValid.value) return
    saving.value = true
    error.value = ''
    
    try {
        await api.post('/change-password', form)
        showToast('Password berhasil diperbarui')
        form.current_password = ''
        form.new_password = ''
        form.new_password_confirmation = ''
    } catch (e) {
        console.error('Error changing password', e)
        error.value = e.response?.data?.message || 'Gagal mengubah password'
        showToast(error.value, 'error')
    } finally {
        saving.value = false
    }
}
</script>
