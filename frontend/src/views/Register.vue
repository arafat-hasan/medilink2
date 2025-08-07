<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
          <Heart class="h-8 w-8 text-primary-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join MediLink today
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="form-label">First Name</label>
              <input
                id="first_name"
                v-model="form.first_name"
                type="text"
                required
                class="form-input"
                placeholder="First name"
              />
            </div>
            <div>
              <label for="last_name" class="form-label">Last Name</label>
              <input
                id="last_name"
                v-model="form.last_name"
                type="text"
                required
                class="form-input"
                placeholder="Last name"
              />
            </div>
          </div>
          
          <div>
            <label for="email" class="form-label">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="phone" class="form-label">Phone Number</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="form-input"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label for="role" class="form-label">Role</label>
            <select
              id="role"
              v-model="form.role"
              required
              class="form-input"
            >
              <option value="">Select your role</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="form-input"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="authStore.loading">Creating account...</span>
            <span v-else>Create account</span>
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: '',
  password: ''
})

const error = ref('')

const handleRegister = async () => {
  error.value = ''
  const result = await authStore.register(form.value)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>
