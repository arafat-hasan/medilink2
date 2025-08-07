export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return new Date(dateString).toLocaleDateString('en-US', {
    ...defaultOptions,
    ...options
  })
}

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (date - now) / (1000 * 60 * 60)
  
  if (diffInHours < 24 && diffInHours > 0) {
    return `In ${Math.round(diffInHours)} hours`
  } else if (diffInHours < 0 && diffInHours > -24) {
    return `${Math.round(Math.abs(diffInHours))} hours ago`
  } else {
    return formatDate(dateString)
  }
}
