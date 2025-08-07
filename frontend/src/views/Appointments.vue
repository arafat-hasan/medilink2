<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Appointments</h1>
            <p class="mt-2 text-gray-600">Manage your healthcare appointments</p>
          </div>
          <button
            v-if="authStore.isPatient"
            @click="showBookingModal = true"
            class="btn-primary flex items-center"
          >
            <Plus class="h-4 w-4 mr-2" />
            Book Appointment
          </button>
        </div>

        <!-- Appointments List -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Your Appointments</h3>
              <div class="flex space-x-2">
                <select
                  v-model="statusFilter"
                  class="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ authStore.isPatient ? 'Doctor' : 'Patient' }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="appointment in filteredAppointments" :key="appointment.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(appointment.appointment_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ authStore.isPatient ? 
                        `Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}` :
                        `${appointment.patient_first_name} ${appointment.patient_last_name}`
                      }}
                    </div>
                    <div v-if="authStore.isPatient" class="text-sm text-gray-500">
                      {{ appointment.specialization }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ appointment.appointment_type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(appointment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ appointment.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        v-if="appointment.status === 'scheduled' && authStore.isPatient"
                        @click="rescheduleAppointment(appointment)"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Reschedule
                      </button>
                      <button
                        v-if="appointment.status === 'scheduled' && canCancelAppointment(appointment)"
                        @click="cancelAppointment(appointment.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                      <button
                        v-if="appointment.status === 'scheduled' && authStore.isDoctor"
                        @click="completeAppointment(appointment.id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Book Appointment Modal -->
    <div v-if="showBookingModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Book New Appointment</h3>
            <button @click="closeBookingModal" class="text-gray-400 hover:text-gray-600">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="bookAppointment" class="space-y-4">
            <div v-if="bookingError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ bookingError }}
            </div>
            
            <div>
              <label class="form-label">Doctor</label>
              <select v-model="bookingForm.doctor_id" required class="form-input">
                <option value="">Select a doctor</option>
                <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                  Dr. {{ doctor.first_name }} {{ doctor.last_name }} - {{ doctor.specialization }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="form-label">Appointment Type</label>
              <select v-model="bookingForm.appointment_type" @change="onAppointmentTypeChange" required class="form-input">
                <option value="">Select type</option>
                <option v-for="(supplies, type) in appointmentTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
            
            <!-- Supply Availability Status -->
            <div v-if="supplyAvailability" class="mt-2">
              <div v-if="supplyAvailability.available" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm font-medium">{{ supplyAvailability.message }}</span>
                </div>
              </div>
              <div v-else class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span class="text-sm font-medium">{{ supplyAvailability.message }}</span>
                </div>
                <div class="mt-2 text-xs">
                  <p>Unavailable supplies: {{ supplyAvailability.unavailable_count }}</p>
                  <p>Low stock supplies: {{ supplyAvailability.low_stock_count }}</p>
                </div>
              </div>
            </div>
            
            <div>
              <label class="form-label">Date & Time</label>
              <input
                v-model="bookingForm.appointment_date"
                type="datetime-local"
                required
                class="form-input"
                :min="minDateTime"
              />
            </div>
            
            <div>
              <label class="form-label">Notes (Optional)</label>
              <textarea
                v-model="bookingForm.notes"
                class="form-input"
                rows="3"
                placeholder="Any additional notes..."
              ></textarea>
            </div>

            <div v-if="selectedSupplies.length > 0" class="mt-2">
              <p class="text-sm text-gray-600">Required supplies:</p>
              <div class="flex flex-wrap gap-1 mt-1">
                <span v-for="supplyId in selectedSupplies" :key="supplyId" 
                      class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Supply #{{ supplyId }}
                </span>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showBookingModal = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="bookingLoading"
                class="btn-primary"
              >
                {{ bookingLoading ? 'Booking...' : 'Book Appointment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reschedule Appointment Modal -->
    <div v-if="showRescheduleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Reschedule Appointment</h3>
            <button @click="closeRescheduleModal" class="text-gray-400 hover:text-gray-600">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Calendar View -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">Select New Date</h4>
              <Calendar 
                :doctor-id="rescheduleForm.doctor_id"
                @date-selected="onDateSelected"
                @time-selected="onTimeSelected"
              />
            </div>
            
            <!-- Appointment Details -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">Appointment Details</h4>
              <div class="space-y-4">
                <div>
                  <label class="form-label">Doctor</label>
                  <p class="text-sm text-gray-700">
                    Dr. {{ rescheduleForm.doctor_name }}
                  </p>
                </div>
                
                <div>
                  <label class="form-label">Appointment Type</label>
                  <p class="text-sm text-gray-700">
                    {{ rescheduleForm.appointment_type }}
                  </p>
                </div>
                
                <div>
                  <label class="form-label">Current Date & Time</label>
                  <p class="text-sm text-gray-700">
                    {{ formatDate(rescheduleForm.current_date) }}
                  </p>
                </div>
                
                <div v-if="rescheduleForm.new_date">
                  <label class="form-label">New Date & Time</label>
                  <p class="text-sm text-gray-700">
                    {{ formatDate(rescheduleForm.new_date) }}
                  </p>
                </div>
                
                <div v-if="rescheduleForm.notes">
                  <label class="form-label">Notes</label>
                  <p class="text-sm text-gray-700">
                    {{ rescheduleForm.notes }}
                  </p>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  @click="closeRescheduleModal"
                  class="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  @click="confirmReschedule"
                  :disabled="!rescheduleForm.new_date || rescheduleLoading"
                  class="btn-primary"
                >
                  {{ rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/Navbar.vue'
import Calendar from '../components/Calendar.vue'
import axios from 'axios'

const authStore = useAuthStore()

const appointments = ref([])
const doctors = ref([])
const statusFilter = ref('')
const showBookingModal = ref(false)
const showRescheduleModal = ref(false)
const bookingLoading = ref(false)
const rescheduleLoading = ref(false)
const bookingError = ref('')

const bookingForm = ref({
  doctor_id: '',
  appointment_type: '',
  appointment_date: '',
  notes: '',
  required_supplies: []
})

const rescheduleForm = ref({
  appointment_id: null,
  doctor_id: '',
  doctor_name: '',
  appointment_type: '',
  current_date: '',
  new_date: '',
  notes: ''
})

const appointmentTypes = ref([])
const selectedSupplies = ref([])
const supplyAvailability = ref(null)

const minDateTime = computed(() => {
  const now = new Date()
  now.setHours(now.getHours() + 1) // Minimum 1 hour from now
  return now.toISOString().slice(0, 16)
})

const filteredAppointments = computed(() => {
  if (!statusFilter.value) return appointments.value
  return appointments.value.filter(apt => apt.status === statusFilter.value)
})

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

const getStatusClass = (status) => {
  const classes = {
    scheduled: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const canCancelAppointment = (appointment) => {
  const appointmentDate = new Date(appointment.appointment_date)
  const now = new Date()
  const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60)
  return hoursDiff > 24 // Can cancel if more than 24 hours away
}

const fetchAppointments = async () => {
  try {
    const response = await axios.get('/api/appointments')
    appointments.value = response.data
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}

const fetchDoctors = async () => {
  try {
    const response = await axios.get('/api/doctors')
    doctors.value = response.data
  } catch (error) {
    console.error('Error fetching doctors:', error)
  }
}

// Add method to fetch appointment types with required supplies
const fetchAppointmentTypes = async () => {
  try {
    const response = await axios.get('/api/appointments/types')
    appointmentTypes.value = response.data
  } catch (error) {
    console.error('Error fetching appointment types:', error)
  }
}

// Add method to handle appointment type change
const onAppointmentTypeChange = async () => {
  if (bookingForm.value.appointment_type && appointmentTypes.value[bookingForm.value.appointment_type]) {
    bookingForm.value.required_supplies = appointmentTypes.value[bookingForm.value.appointment_type]
    selectedSupplies.value = appointmentTypes.value[bookingForm.value.appointment_type]
    
    // Check supply availability
    await checkSupplyAvailability(bookingForm.value.appointment_type)
  } else {
    supplyAvailability.value = null
  }
}

// Add method to check supply availability
const checkSupplyAvailability = async (appointmentType) => {
  try {
    const response = await axios.get('/api/appointments/check-supply-availability', {
      params: { appointment_type: appointmentType }
    })
    supplyAvailability.value = response.data
  } catch (error) {
    console.error('Error checking supply availability:', error)
    supplyAvailability.value = {
      available: false,
      message: 'Unable to check supply availability'
    }
  }
}

const bookAppointment = async () => {
  bookingLoading.value = true
  bookingError.value = ''
  
  try {
    const response = await axios.post('/api/appointments', bookingForm.value)
    
    // Show warnings if any
    if (response.data.warnings && response.data.warnings.length > 0) {
      alert(`Appointment booked successfully!\n\nWarnings:\n${response.data.warnings.join('\n')}`)
    }
    
    showBookingModal.value = false
    bookingForm.value = {
      doctor_id: '',
      appointment_type: '',
      appointment_date: '',
      notes: '',
      required_supplies: []
    }
    supplyAvailability.value = null
    await fetchAppointments()
  } catch (error) {
    if (error.response?.data?.unavailable_supplies) {
      const unavailableSupplies = error.response.data.unavailable_supplies
      bookingError.value = `Cannot book appointment. Unavailable supplies: ${unavailableSupplies.map(s => s.name).join(', ')}`
    } else {
      bookingError.value = error.response?.data?.error || 'Failed to book appointment'
    }
  } finally {
    bookingLoading.value = false
  }
}

const cancelAppointment = async (appointmentId) => {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    try {
      await axios.delete(`/api/appointments/${appointmentId}`)
      await fetchAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }
}

const completeAppointment = async (appointmentId) => {
  try {
    await axios.put(`/api/appointments/${appointmentId}`, { status: 'completed' })
    await fetchAppointments()
  } catch (error) {
    console.error('Error completing appointment:', error)
  }
}

const rescheduleAppointment = (appointment) => {
  rescheduleForm.value = {
    appointment_id: appointment.id,
    doctor_id: appointment.doctor_id,
    doctor_name: `${appointment.doctor_first_name} ${appointment.doctor_last_name}`,
    appointment_type: appointment.appointment_type,
    current_date: appointment.appointment_date,
    new_date: '',
    notes: appointment.notes
  }
  showRescheduleModal.value = true
}

const closeBookingModal = () => {
  showBookingModal.value = false
  bookingForm.value = {
    doctor_id: '',
    appointment_type: '',
    appointment_date: '',
    notes: '',
    required_supplies: []
  }
  bookingError.value = ''
}

const closeRescheduleModal = () => {
  showRescheduleModal.value = false
  rescheduleForm.value = {
    appointment_id: null,
    doctor_id: '',
    doctor_name: '',
    appointment_type: '',
    current_date: '',
    new_date: '',
    notes: ''
  }
}

const onDateSelected = (date) => {
  // Date is already handled by the Calendar component
}

const onTimeSelected = (dateTime) => {
  rescheduleForm.value.new_date = dateTime.toISOString()
}

const confirmReschedule = async () => {
  rescheduleLoading.value = true
  try {
    await axios.put(`/api/appointments/${rescheduleForm.value.appointment_id}`, {
      appointment_date: rescheduleForm.value.new_date
    })
    closeRescheduleModal()
    await fetchAppointments()
  } catch (error) {
    console.error('Error rescheduling appointment:', error)
  } finally {
    rescheduleLoading.value = false
  }
}

onMounted(() => {
  fetchAppointments()
  fetchAppointmentTypes()
  if (authStore.isPatient) {
    fetchDoctors()
  }
})
</script>
