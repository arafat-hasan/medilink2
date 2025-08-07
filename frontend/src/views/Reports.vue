<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p class="mt-2 text-gray-600">Comprehensive healthcare system insights</p>
        </div>

        <!-- Report Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Upcoming Appointments -->
          <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                <Calendar class="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div class="p-6">
              <div v-if="upcomingAppointments.length === 0" class="text-gray-500 text-center py-8">
                No upcoming appointments
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="appointment in upcomingAppointments.slice(0, 10)"
                  :key="appointment.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <p class="font-medium text-gray-900">
                        {{ appointment.patient_first_name }} {{ appointment.patient_last_name }}
                      </p>
                      <span class="text-xs text-gray-500">
                        {{ formatDate(appointment.appointment_date) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">
                      Dr. {{ appointment.doctor_first_name }} {{ appointment.doctor_last_name }}
                    </p>
                    <p class="text-xs text-gray-500">{{ appointment.appointment_type }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-4 text-center">
                <p class="text-sm text-gray-600">
                  Total: {{ upcomingAppointments.length }} appointments
                </p>
              </div>
            </div>
          </div>

          <!-- Low Stock Report -->
          <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
                <AlertTriangle class="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div class="p-6">
              <div v-if="lowStockSupplies.length === 0" class="text-gray-500 text-center py-8">
                All supplies are well stocked
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="supply in lowStockSupplies"
                  :key="supply.id"
                  class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ supply.name }}</p>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-sm text-gray-600">
                        Stock: {{ supply.current_stock }} / Min: {{ supply.minimum_stock }}
                      </p>
                      <span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {{ supply.current_stock === 0 ? 'Out of Stock' : 'Low Stock' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Appointment Statistics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Status Distribution -->
          <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Appointment Status Distribution</h3>
            </div>
            <div class="p-6">
              <div v-if="appointmentStats.statusStats.length === 0" class="text-gray-500 text-center py-8">
                No appointment data available
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="stat in appointmentStats.statusStats"
                  :key="stat.status"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <div :class="getStatusColor(stat.status)" class="w-3 h-3 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-gray-900 capitalize">{{ stat.status }}</span>
                  </div>
                  <span class="text-sm text-gray-600">{{ stat.count }}</span>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex justify-between text-sm">
                    <span class="font-medium text-gray-900">Total Appointments</span>
                    <span class="text-gray-600">
                      {{ appointmentStats.statusStats.reduce((sum, stat) => sum + stat.count, 0) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Trends -->
          <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Monthly Appointment Trends</h3>
            </div>
            <div class="p-6">
              <div v-if="appointmentStats.monthlyStats.length === 0" class="text-gray-500 text-center py-8">
                No monthly data available
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="stat in appointmentStats.monthlyStats.slice(-6)"
                  :key="stat.month"
                  class="flex items-center justify-between"
                >
                  <span class="text-sm text-gray-600">{{ formatMonth(stat.month) }}</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        class="bg-primary-600 h-2 rounded-full"
                        :style="{ width: `${(stat.count / maxMonthlyCount) * 100}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900 w-8 text-right">{{ stat.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancellations Report -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Recent Cancellations</h3>
              <XCircle class="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancelled On
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="cancellations.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    No cancellations found
                  </td>
                </tr>
                <tr v-for="cancellation in cancellations.slice(0, 10)" :key="cancellation.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ cancellation.patient_first_name }} {{ cancellation.patient_last_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Dr. {{ cancellation.doctor_first_name }} {{ cancellation.doctor_last_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(cancellation.appointment_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ cancellation.appointment_type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(cancellation.updated_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stock-Related Cancellations -->
        <div class="card mt-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Appointments Affected by Stock Issues</h3>
              <Package class="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">{{ stockIssueStats.blocked }}</div>
                <div class="text-sm text-gray-500">Blocked Bookings</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">{{ stockIssueStats.rescheduled }}</div>
                <div class="text-sm text-gray-500">Rescheduled</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600">{{ stockIssueStats.atRisk }}</div>
                <div class="text-sm text-gray-500">At Risk</div>
              </div>
            </div>
            
            <div class="mt-6">
              <h4 class="text-md font-medium text-gray-900 mb-3">Most Problematic Supplies</h4>
              <div class="space-y-2">
                <div v-for="supply in problematicSupplies" :key="supply.id" 
                     class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span class="text-sm font-medium">{{ supply.name }}</span>
                  <span class="text-sm text-red-600">{{ supply.affected_appointments }} appointments affected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Actions -->
        <div class="mt-8 flex justify-end space-x-4">
          <button
            @click="exportReport('appointments')"
            class="btn-secondary flex items-center"
          >
            <Download class="h-4 w-4 mr-2" />
            Export Appointments
          </button>
          <button
            @click="exportReport('supplies')"
            class="btn-secondary flex items-center"
          >
            <Download class="h-4 w-4 mr-2" />
            Export Supplies
          </button>
          <button
            @click="exportReport('cancellations')"
            class="btn-secondary flex items-center"
          >
            <Download class="h-4 w-4 mr-2" />
            Export Cancellations
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Calendar, AlertTriangle, XCircle, Download, Package } from 'lucide-vue-next'
import Navbar from '../components/Navbar.vue'
import axios from 'axios'

const upcomingAppointments = ref([])
const lowStockSupplies = ref([])
const cancellations = ref([])
const appointmentStats = ref({
  statusStats: [],
  monthlyStats: []
})

const stockIssueStats = ref({
  blocked: 0,
  rescheduled: 0,
  atRisk: 0
})

const problematicSupplies = ref([])

const maxMonthlyCount = computed(() => {
  if (appointmentStats.value.monthlyStats.length === 0) return 1
  return Math.max(...appointmentStats.value.monthlyStats.map(stat => stat.count))
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMonth = (monthString) => {
  const [year, month] = monthString.split('-')
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })
}

const getStatusColor = (status) => {
  const colors = {
    scheduled: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const calculateStockIssueStats = () => {
  // Mock calculation based on low stock supplies and appointments
  const lowStockCount = lowStockSupplies.value.length
  const upcomingCount = upcomingAppointments.value.length
  
  stockIssueStats.value = {
    blocked: Math.floor(lowStockCount * 0.3),
    rescheduled: Math.floor(lowStockCount * 0.2),
    atRisk: Math.floor(upcomingCount * 0.1)
  }
  
  // Mock problematic supplies
  problematicSupplies.value = lowStockSupplies.value.slice(0, 3).map(supply => ({
    ...supply,
    affected_appointments: Math.floor(Math.random() * 5) + 1
  }))
}

const fetchReportsData = async () => {
  try {
    // Fetch upcoming appointments
    const upcomingResponse = await axios.get('/api/reports/upcoming-appointments')
    upcomingAppointments.value = upcomingResponse.data

    // Fetch low stock supplies
    const lowStockResponse = await axios.get('/api/reports/low-stock')
    lowStockSupplies.value = lowStockResponse.data

    // Fetch cancellations
    const cancellationsResponse = await axios.get('/api/reports/cancellations')
    cancellations.value = cancellationsResponse.data

    // Fetch appointment statistics
    const statsResponse = await axios.get('/api/reports/appointment-stats')
    appointmentStats.value = statsResponse.data

    calculateStockIssueStats()
  } catch (error) {
    console.error('Error fetching reports data:', error)
  }
}

const exportReport = (type) => {
  let data = []
  let filename = ''

  switch (type) {
    case 'appointments':
      data = upcomingAppointments.value
      filename = 'upcoming_appointments.csv'
      break
    case 'supplies':
      data = lowStockSupplies.value
      filename = 'low_stock_supplies.csv'
      break
    case 'cancellations':
      data = cancellations.value
      filename = 'cancelled_appointments.csv'
      break
  }

  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Convert to CSV
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => Object.values(row).join(','))
  const csv = [headers, ...rows].join('\n')

  // Download file
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchReportsData()
})
</script>
