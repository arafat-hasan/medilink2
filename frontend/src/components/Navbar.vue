<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <Heart class="h-8 w-8 text-primary-600" />
            <span class="ml-2 text-xl font-bold text-gray-900">MediLink</span>
          </router-link>
          
          <div class="hidden md:ml-10 md:flex md:space-x-8">
            <router-link
              to="/"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/' }"
            >
              Dashboard
            </router-link>
            <router-link
              to="/appointments"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/appointments' }"
            >
              Appointments
            </router-link>
            <router-link
              v-if="!authStore.isPatient"
              to="/supplies"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/supplies' }"
            >
              Supplies
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/admin"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/admin' }"
            >
              Admin
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/reports"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === '/reports' }"
            >
              Reports
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="hidden md:flex md:items-center md:space-x-4">
            <span class="text-sm text-gray-700">
              {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
            </span>
            <span class="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {{ authStore.user?.role }}
            </span>
          </div>
          
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <User class="h-5 w-5 text-white" />
              </div>
            </button>
            
            <div
              v-if="showUserMenu"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            >
              <div class="py-1">
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Profile
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
          
          <!-- Mobile menu button -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="showMobileMenu" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
        <router-link
          to="/"
          class="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          @click="showMobileMenu = false"
        >
          Dashboard
        </router-link>
        <router-link
          to="/appointments"
          class="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          @click="showMobileMenu = false"
        >
          Appointments
        </router-link>
        <router-link
          v-if="!authStore.isPatient"
          to="/supplies"
          class="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          @click="showMobileMenu = false"
        >
          Supplies
        </router-link>
        <router-link
          v-if="authStore.isAdmin"
          to="/reports"
          class="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
          @click="showMobileMenu = false"
        >
          Reports
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, User, Menu } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
