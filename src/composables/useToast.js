import { reactive } from 'vue'

const toast = reactive({
    show: false,
    message: '',
    type: 'success'
})

let timeout = null

export function useToast() {
    const showToast = (message, type = 'success') => {
        toast.show = true
        toast.message = message
        toast.type = type

        if (timeout) clearTimeout(timeout)

        timeout = setTimeout(() => {
            toast.show = false
        }, 3000)
    }

    return {
        toast,
        showToast
    }
}
