export const formatDate = (dateString, options = { day: 'numeric', month: 'long', year: 'numeric' }) => {
    if (!dateString) return '-'
    try {
        const date = new Date(dateString)
        // Check for invalid date
        if (isNaN(date.getTime())) return dateString

        return new Intl.DateTimeFormat('id-ID', options).format(date)
    } catch (error) {
        console.warn('Error formatting date:', error)
        return dateString
    }
}
