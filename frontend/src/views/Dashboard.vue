<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Welcome back, {{ authStore.user?.first_name }}!
          </h1>
          <p class="mt-2 text-gray-600">
            Here's what's happening with your healthcare today.
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Calendar class="h-8 w-8 text-primary-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Appointments</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalAppointments }}</p>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Users class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Active Doctors</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.activeDoctors }}</p>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Package class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Medical Supplies</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalSupplies }}</p>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <AlertTriangle class="h-8 w-8 text-red-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Low Stock Items</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.lowStockItems }}</p>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <XCircle class="h-8 w-8 text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Blocked Appointments</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.blockedAppointments }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Upcoming Appointments -->
          <div class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            </div>
            <div class="p-6">
              <LoadingSpinner v-if="loading" text="Loading appointments..." />
              <EmptyState
                v-if="!loading && upcomingAppointments.length === 0"
                title="No upcoming appointments"
                description="You don't have any appointments scheduled."
                :action-text="authStore.isPatient ? 'Book Appointment' : ''"
                :action-click="authStore.isPatient ? () => $router.push('/appointments') : null"
              />
              <div v-else class="space-y-4">
                <div
                  v-for="appointment in upcomingAppointments.slice(0, 5)"
                  :key="appointment.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ appointment.appointment_type }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ authStore.isPatient ? 
                        `Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}` :
                        `${appointment.patient_first_name} ${appointment.patient_last_name}`
                      }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ formatDate(appointment.appointment_date) }}
                    </p>
                  </div>
                  <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {{ appointment.status }}
                  </span>
                </div>
              </div>
              <div class="mt-4">
                <router-link
                  to="/appointments"
                  class="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View all appointments →
                </router-link>
              </div>
            </div>
          </div>

          <!-- Low Stock Alerts (Admin/Doctor only) -->
          <div v-if="!authStore.isPatient" class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
            </div>
            <div class="p-6">
              <div v-if="lowStockSupplies.length === 0" class="text-gray-500 text-center py-4">
                All supplies are well stocked
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="supply in lowStockSupplies.slice(0, 5)"
                  :key="supply.id"
                  class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p class="font-medium text-gray-900">{{ supply.name }}</p>
                    <p class="text-sm text-gray-600">
                      Current: {{ supply.current_stock }} | Min: {{ supply.minimum_stock }}
                    </p>
                  </div>
                  <span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Low Stock
                  </span>
                </div>
              </div>
              <div class="mt-4">
                <router-link
                  to="/supplies"
                  class="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  Manage supplies →
                </router-link>
              </div>
            </div>
          </div>

          <!-- Quick Actions (Patient only) -->
          <div v-if="authStore.isPatient" class="card">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div class="p-6 space-y-4">
              <button
                @click="$router.push('/appointments')"
                class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Calendar class="h-4 w-4 mr-2" />
                Book New Appointment
              </button>
              <button
                @click="$router.push('/profile')"
                class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <User class="h-4 w-4 mr-2" />
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Calendar, Users, Package, AlertTriangle, User, XCircle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/Navbar.vue'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'

const authStore = useAuthStore()

// Add appointment cancellation due to stock issues tracking

// Add new stat for blocked appointments
const blockedAppointments = ref(0)

// Update stats object
const stats = ref({
  totalAppointments: 0,
  activeDoctors: 0,
  totalSupplies: 0,
  lowStockItems: 0,
  blockedAppointments: 0
})

const upcomingAppointments = ref([])
const lowStockSupplies = ref([])
const loading = ref(true)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Add method to fetch blocked appointments (mock data for now)
const fetchBlockedAppointments = async () => {
  // In a real system, you'd track this in the database
  // For now, we'll estimate based on low stock items and upcoming appointments
  const lowStockCount = lowStockSupplies.value.length
  const upcomingCount = upcomingAppointments.value.length
  
  // Estimate blocked appointments (this would be actual data in production)
  stats.value.blockedAppointments = Math.min(lowStockCount, Math.floor(upcomingCount * 0.1))
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    // Fetch appointments
    const appointmentsResponse = await axios.get('/api/appointments')
    upcomingAppointments.value = appointmentsResponse.data.filter(apt => 
      apt.status === 'scheduled' && new Date(apt.appointment_date) > new Date()
    )
    stats.value.totalAppointments = appointmentsResponse.data.length

    // Fetch doctors
    const doctorsResponse = await axios.get('/api/doctors')
    stats.value.activeDoctors = doctorsResponse.data.length

    // Fetch supplies
    const suppliesResponse = await axios.get('/api/supplies')
    stats.value.totalSupplies = suppliesResponse.data.length

    // Fetch low stock supplies
    if (!authStore.isPatient) {
      const lowStockResponse = await axios.get('/api/supplies/low-stock')
      lowStockSupplies.value = lowStockResponse.data
      stats.value.lowStockItems = lowStockResponse.data.length
    }

    // Update the fetchDashboardData method to include blocked appointments
    // Add this line after fetching other data:
    fetchBlockedAppointments()
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  authStore.initializeAuth()
  fetchDashboardData()
})
</script>
