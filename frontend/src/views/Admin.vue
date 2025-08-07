<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="mt-2 text-gray-600">Manage doctors, supplies, users, and system settings</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Users class="h-8 w-8 text-primary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Users</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalUsers }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Stethoscope class="h-8 w-8 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Doctors</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalDoctors }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Package class="h-8 w-8 text-blue-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Supplies</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalSupplies }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Calendar class="h-8 w-8 text-purple-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Appointments</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalAppointments }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Management Tabs -->
        <div class="card">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
              <button
                v-for="tab in tabs"
                :key="tab.name"
                @click="activeTab = tab.name"
                :class="[
                  activeTab === tab.name
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div class="p-6">
            <!-- Doctors Management -->
            <div v-if="activeTab === 'doctors'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">Manage Doctors</h3>
                <button
                  @click="showDoctorModal = true"
                  class="btn-primary flex items-center"
                >
                  <Plus class="h-4 w-4 mr-2" />
                  Add Doctor
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        License
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
                    <tr v-for="doctor in doctors" :key="doctor.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span class="text-sm font-medium text-primary-600">
                                {{ doctor.first_name.charAt(0) }}{{ doctor.last_name.charAt(0) }}
                              </span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                              Dr. {{ doctor.first_name }} {{ doctor.last_name }}
                            </div>
                            <div class="text-sm text-gray-500">{{ doctor.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ doctor.specialization }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ doctor.license_number }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                          <button
                            @click="editDoctor(doctor)"
                            class="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            @click="deleteDoctor(doctor.id)"
                            class="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Users Management -->
            <div v-if="activeTab === 'users'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">Manage Users</h3>
                <button
                  @click="showUserModal = true"
                  class="btn-primary flex items-center"
                >
                  <Plus class="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
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
                    <tr v-for="user in users" :key="user.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span class="text-sm font-medium text-primary-600">
                                {{ user.first_name.charAt(0) }}{{ user.last_name.charAt(0) }}
                              </span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                              {{ user.first_name }} {{ user.last_name }}
                            </div>
                            <div class="text-sm text-gray-500">{{ user.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="getRoleClass(user.role)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                          {{ user.role }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                          <button
                            @click="editUser(user)"
                            class="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            @click="deleteUser(user.id)"
                            class="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- System Settings -->
            <div v-if="activeTab === 'settings'" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">System Settings</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- General Settings -->
                <div class="card">
                  <div class="px-6 py-4 border-b border-gray-200">
                    <h4 class="text-md font-medium text-gray-900">General Settings</h4>
                  </div>
                  <div class="p-6 space-y-4">
                    <div>
                      <label class="form-label">System Name</label>
                      <input
                        v-model="settings.systemName"
                        type="text"
                        class="form-input"
                        placeholder="MediLink Healthcare"
                      />
                    </div>
                    <div>
                      <label class="form-label">Default Appointment Duration (minutes)</label>
                      <input
                        v-model="settings.defaultAppointmentDuration"
                        type="number"
                        class="form-input"
                        min="15"
                        max="120"
                      />
                    </div>
                    <div>
                      <label class="form-label">Low Stock Alert Threshold (%)</label>
                      <input
                        v-model="settings.lowStockThreshold"
                        type="number"
                        class="form-input"
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                </div>

                <!-- Notification Settings -->
                <div class="card">
                  <div class="px-6 py-4 border-b border-gray-200">
                    <h4 class="text-md font-medium text-gray-900">Notification Settings</h4>
                  </div>
                  <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700">Email Notifications</span>
                      <button
                        @click="settings.emailNotifications = !settings.emailNotifications"
                        :class="settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      >
                        <span
                          :class="settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'"
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                      </button>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700">Low Stock Alerts</span>
                      <button
                        @click="settings.lowStockAlerts = !settings.lowStockAlerts"
                        :class="settings.lowStockAlerts ? 'bg-primary-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      >
                        <span
                          :class="settings.lowStockAlerts ? 'translate-x-6' : 'translate-x-1'"
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                      </button>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700">Appointment Reminders</span>
                      <button
                        @click="settings.appointmentReminders = !settings.appointmentReminders"
                        :class="settings.appointmentReminders ? 'bg-primary-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      >
                        <span
                          :class="settings.appointmentReminders ? 'translate-x-6' : 'translate-x-1'"
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  @click="saveSettings"
                  class="btn-primary"
                  :disabled="savingSettings"
                >
                  {{ savingSettings ? 'Saving...' : 'Save Settings' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Doctor Modal -->
    <div v-if="showDoctorModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingDoctor ? 'Edit Doctor' : 'Add New Doctor' }}
          </h3>
          
          <form @submit.prevent="saveDoctor" class="space-y-4">
            <div>
              <label class="form-label">First Name</label>
              <input
                v-model="doctorForm.first_name"
                type="text"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Last Name</label>
              <input
                v-model="doctorForm.last_name"
                type="text"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Email</label>
              <input
                v-model="doctorForm.email"
                type="email"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Phone</label>
              <input
                v-model="doctorForm.phone"
                type="tel"
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Specialization</label>
              <input
                v-model="doctorForm.specialization"
                type="text"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">License Number</label>
              <input
                v-model="doctorForm.license_number"
                type="text"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Bio</label>
              <textarea
                v-model="doctorForm.bio"
                rows="3"
                class="form-input"
              ></textarea>
            </div>
            
            <div v-if="!editingDoctor">
              <label class="form-label">Password</label>
              <input
                v-model="doctorForm.password"
                type="password"
                required
                class="form-input"
              />
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeDoctorModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="savingDoctor"
              >
                {{ savingDoctor ? 'Saving...' : 'Save Doctor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingUser ? 'Edit User' : 'Add New User' }}
          </h3>
          
          <form @submit.prevent="saveUser" class="space-y-4">
            <div>
              <label class="form-label">First Name</label>
              <input
                v-model="userForm.first_name"
                type="text"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Last Name</label>
              <input
                v-model="userForm.last_name"
                type="text"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Email</label>
              <input
                v-model="userForm.email"
                type="email"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Phone</label>
              <input
                v-model="userForm.phone"
                type="tel"
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Role</label>
              <select
                v-model="userForm.role"
                required
                class="form-input"
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            
            <div v-if="!editingUser">
              <label class="form-label">Password</label>
              <input
                v-model="userForm.password"
                type="password"
                required
                class="form-input"
              />
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeUserModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="savingUser"
              >
                {{ savingUser ? 'Saving...' : 'Save User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/Navbar.vue'
import { 
  Users, 
  Stethoscope, 
  Package, 
  Calendar, 
  Plus 
} from 'lucide-vue-next'
import axios from 'axios'

const authStore = useAuthStore()

// Reactive data
const activeTab = ref('doctors')
const doctors = ref([])
const users = ref([])
const stats = ref({
  totalUsers: 0,
  totalDoctors: 0,
  totalSupplies: 0,
  totalAppointments: 0
})

// Doctor management
const showDoctorModal = ref(false)
const editingDoctor = ref(null)
const savingDoctor = ref(false)
const doctorForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  specialization: '',
  license_number: '',
  bio: '',
  password: ''
})

// User management
const showUserModal = ref(false)
const editingUser = ref(null)
const savingUser = ref(false)
const userForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'patient',
  password: ''
})

// Settings
const savingSettings = ref(false)
const settings = ref({
  systemName: 'MediLink Healthcare',
  defaultAppointmentDuration: 30,
  lowStockThreshold: 20,
  emailNotifications: true,
  lowStockAlerts: true,
  appointmentReminders: true
})

// Tabs
const tabs = [
  { name: 'doctors', label: 'Doctors' },
  { name: 'users', label: 'Users' },
  { name: 'settings', label: 'Settings' }
]

// Methods
const fetchDoctors = async () => {
  try {
    const response = await axios.get('/api/doctors')
    doctors.value = response.data
  } catch (error) {
    console.error('Error fetching doctors:', error)
  }
}

const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/users')
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const fetchStats = async () => {
  try {
    const [usersRes, doctorsRes, suppliesRes, appointmentsRes] = await Promise.all([
      axios.get('/api/users'),
      axios.get('/api/doctors'),
      axios.get('/api/supplies'),
      axios.get('/api/appointments')
    ])
    
    stats.value = {
      totalUsers: usersRes.data.length,
      totalDoctors: doctorsRes.data.length,
      totalSupplies: suppliesRes.data.length,
      totalAppointments: appointmentsRes.data.length
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const editDoctor = (doctor) => {
  editingDoctor.value = doctor
  doctorForm.value = { ...doctor }
  showDoctorModal.value = true
}

const closeDoctorModal = () => {
  showDoctorModal.value = false
  editingDoctor.value = null
  doctorForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    license_number: '',
    bio: '',
    password: ''
  }
}

const saveDoctor = async () => {
  savingDoctor.value = true
  try {
    if (editingDoctor.value) {
      await axios.put(`/api/doctors/${editingDoctor.value.id}`, doctorForm.value)
    } else {
      await axios.post('/api/doctors', doctorForm.value)
    }
    closeDoctorModal()
    await fetchDoctors()
  } catch (error) {
    console.error('Error saving doctor:', error)
  } finally {
    savingDoctor.value = false
  }
}

const deleteDoctor = async (doctorId) => {
  if (confirm('Are you sure you want to delete this doctor?')) {
    try {
      await axios.delete(`/api/doctors/${doctorId}`)
      await fetchDoctors()
    } catch (error) {
      console.error('Error deleting doctor:', error)
    }
  }
}

const editUser = (user) => {
  editingUser.value = user
  userForm.value = { ...user }
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
  userForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'patient',
    password: ''
  }
}

const saveUser = async () => {
  savingUser.value = true
  try {
    if (editingUser.value) {
      await axios.put(`/api/users/${editingUser.value.id}`, userForm.value)
    } else {
      await axios.post('/api/users', userForm.value)
    }
    closeUserModal()
    await fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    savingUser.value = false
  }
}

const deleteUser = async (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await axios.delete(`/api/users/${userId}`)
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
}

const saveSettings = async () => {
  savingSettings.value = true
  try {
    await axios.put('/api/settings', settings.value)
    // Show success message
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    savingSettings.value = false
  }
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    doctor: 'bg-blue-100 text-blue-800',
    patient: 'bg-green-100 text-green-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchDoctors()
  fetchUsers()
  fetchStats()
})
</script> 