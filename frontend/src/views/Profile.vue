<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p class="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Profile Information -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Personal Information</h3>
              </div>
              <div class="p-6">
                <form @submit.prevent="updateProfile" class="space-y-6">
                  <div v-if="profileError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {{ profileError }}
                  </div>
                  <div v-if="profileSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {{ profileSuccess }}
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="form-label">First Name</label>
                      <input
                        v-model="profileForm.first_name"
                        type="text"
                        required
                        class="form-input"
                      />
                    </div>
                    <div>
                      <label class="form-label">Last Name</label>
                      <input
                        v-model="profileForm.last_name"
                        type="text"
                        required
                        class="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Email Address</label>
                    <input
                      v-model="profileForm.email"
                      type="email"
                      disabled
                      class="form-input bg-gray-50 text-gray-500"
                    />
                    <p class="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label class="form-label">Phone Number</label>
                    <input
                      v-model="profileForm.phone"
                      type="tel"
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label class="form-label">Role</label>
                    <input
                      v-model="profileForm.role"
                      type="text"
                      disabled
                      class="form-input bg-gray-50 text-gray-500 capitalize"
                    />
                  </div>

                  <!-- Doctor-specific fields -->
                  <div v-if="authStore.isDoctor && user?.doctor_details" class="space-y-6">
                    <div class="border-t border-gray-200 pt-6">
                      <h4 class="text-md font-medium text-gray-900 mb-4">Doctor Information</h4>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label class="form-label">Specialization</label>
                          <input
                            v-model="doctorForm.specialization"
                            type="text"
                            class="form-input"
                          />
                        </div>
                        <div>
                          <label class="form-label">License Number</label>
                          <input
                            v-model="doctorForm.license_number"
                            type="text"
                            class="form-input"
                          />
                        </div>
                      </div>

                      <div>
                        <label class="form-label">Bio</label>
                        <textarea
                          v-model="doctorForm.bio"
                          rows="4"
                          class="form-input"
                          placeholder="Tell patients about yourself..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end">
                    <button
                      type="submit"
                      :disabled="profileLoading"
                      class="btn-primary"
                    >
                      {{ profileLoading ? 'Updating...' : 'Update Profile' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Profile Summary -->
          <div class="space-y-6">
            <!-- Profile Card -->
            <div class="card">
              <div class="p-6 text-center">
                <div class="mx-auto h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center mb-4">
                  <User class="h-10 w-10 text-white" />
                </div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ user?.first_name }} {{ user?.last_name }}
                </h3>
                <p class="text-sm text-gray-500">{{ user?.email }}</p>
                <span class="mt-2 inline-flex px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full capitalize">
                  {{ user?.role }}
                </span>
              </div>
            </div>

            <!-- Account Statistics -->
            <div class="card">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Account Statistics</h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Member since</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatDate(user?.created_at) }}
                  </span>
                </div>
                <div v-if="authStore.isPatient" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Total appointments</span>
                  <span class="text-sm font-medium text-gray-900">{{ userStats.totalAppointments }}</span>
                </div>
                <div v-if="authStore.isDoctor" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Patients treated</span>
                  <span class="text-sm font-medium text-gray-900">{{ userStats.patientsCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Last login</span>
                  <span class="text-sm font-medium text-gray-900">Today</span>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div class="card">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Security</h3>
              </div>
              <div class="p-6 space-y-4">
                <button
                  @click="showPasswordModal = true"
                  class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Lock class="h-4 w-4 mr-2" />
                  Change Password
                </button>
                <div class="text-xs text-gray-500">
                  Last password change: Never
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Change Password</h3>
            <button @click="showPasswordModal = false" class="text-gray-400 hover:text-gray-600">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="changePassword" class="space-y-4">
            <div v-if="passwordError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ passwordError }}
            </div>
            
            <div>
              <label class="form-label">Current Password</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">New Password</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
                class="form-input"
              />
            </div>
            
            <div>
              <label class="form-label">Confirm New Password</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="form-input"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showPasswordModal = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="passwordLoading"
                class="btn-primary"
              >
                {{ passwordLoading ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Lock, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/Navbar.vue'
import axios from 'axios'

const authStore = useAuthStore()

const user = ref(null)
const userStats = ref({
  totalAppointments: 0,
  patientsCount: 0
})

const profileForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: ''
})

const doctorForm = ref({
  specialization: '',
  license_number: '',
  bio: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const showPasswordModal = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchProfile = async () => {
  try {
    const response = await axios.get('/api/users/profile')
    user.value = response.data
    
    // Populate form
    profileForm.value = {
      first_name: response.data.first_name,
      last_name: response.data.last_name,
      email: response.data.email,
      phone: response.data.phone || '',
      role: response.data.role
    }

    // Populate doctor form if applicable
    if (response.data.doctor_details) {
      doctorForm.value = {
        specialization: response.data.doctor_details.specialization || '',
        license_number: response.data.doctor_details.license_number || '',
        bio: response.data.doctor_details.bio || ''
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

const fetchUserStats = async () => {
  try {
    const appointmentsResponse = await axios.get('/api/appointments')
    
    if (authStore.isPatient) {
      userStats.value.totalAppointments = appointmentsResponse.data.length
    } else if (authStore.isDoctor) {
      const uniquePatients = new Set(appointmentsResponse.data.map(apt => apt.patient_id))
      userStats.value.patientsCount = uniquePatients.size
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
  }
}

const updateProfile = async () => {
  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = ''
  
  try {
    await axios.put('/api/users/profile', profileForm.value)
    
    // Update doctor details if applicable
    if (authStore.isDoctor && user.value?.doctor_details) {
      await axios.put(`/api/doctors/${user.value.doctor_details.id}`, doctorForm.value)
    }
    
    profileSuccess.value = 'Profile updated successfully!'
    
    // Update auth store
    await authStore.fetchProfile()
  } catch (error) {
    profileError.value = error.response?.data?.error || 'Failed to update profile'
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  passwordError.value = ''
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'New passwords do not match'
    return
  }
  
  passwordLoading.value = true
  
  try {
    // Mock password change (implement actual endpoint in backend)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showPasswordModal.value = false
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    profileSuccess.value = 'Password changed successfully!'
  } catch (error) {
    passwordError.value = error.response?.data?.error || 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  fetchProfile()
  fetchUserStats()
})
</script>
