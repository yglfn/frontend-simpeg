<template>
    <Teleport to="body">
        <Transition name="toast">
            <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] max-w-sm">
                <div :class="[
                    'flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium',
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                    toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'
                ]">
                    <i :class="[
                        toast.type === 'success' ? 'fas fa-check-circle text-emerald-500' : 
                        toast.type === 'error' ? 'fas fa-exclamation-circle text-red-500' :
                        'fas fa-info-circle text-blue-500'
                    ]"></i>
                    {{ toast.message }}
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toast } = useToast()
</script>

<style scoped>
.toast-enter-active { animation: slideIn 0.3s ease-out; }
.toast-leave-active { animation: slideOut 0.25s ease-in; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
</style>
