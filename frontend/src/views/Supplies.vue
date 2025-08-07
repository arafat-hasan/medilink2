<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Medical Supplies</h1>
            <p class="mt-2 text-gray-600">Manage medical supply inventory</p>
          </div>
          <button
            v-if="authStore.isAdmin"
            @click="showSupplyModal = true"
            class="btn-primary flex items-center"
          >
            <Plus class="h-4 w-4 mr-2" />
            Add Supply
          </button>
        </div>

        <!-- Supplies List -->
        <div class="card">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Supply Inventory</h3>
              <div class="flex space-x-2">
                <button
                  @click="showLowStockOnly = !showLowStockOnly"
                  :class="showLowStockOnly ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'"
                  class="px-3 py-1 text-sm rounded-full"
                >
                  {{ showLowStockOnly ? 'Show All' : 'Low Stock Only' }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Stock
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th v-if="authStore.isAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="supply in filteredSupplies" :key="supply.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ supply.name }}</div>
                    <div class="text-sm text-gray-500">{{ supply.description }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ supply.current_stock }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ supply.minimum_stock }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ supply.expiry_date ? formatDate(supply.expiry_date) : 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ supply.unit_price?.toFixed(2) || '0.00' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStockStatusClass(supply)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStockStatus(supply) }}
                    </span>
                  </td>
                  <td v-if="authStore.isAdmin" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="editSupply(supply)"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteSupply(supply.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                      <button
                        v-if="getStockStatus(supply) !== 'In Stock'"
                        @click="openReorderModal(supply)"
                        class="text-green-600 hover:text-green-900 ml-2"
                      >
                        Reorder
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

    <!-- Add/Edit Supply Modal -->
    <div v-if="showSupplyModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingSupply ? 'Edit Supply' : 'Add New Supply' }}
            </h3>
            <button @click="closeSupplyModal" class="text-gray-400 hover:text-gray-600">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveSupply" class="space-y-4">
            <div v-if="supplyError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ supplyError }}
            </div>
            
            <div>
              <label class="form-label">Name</label>
              <input
                v-model="supplyForm.name"
                type="text"
                required
                class="form-input"
                placeholder="Supply name"
              />
            </div>
            
            <div>
              <label class="form-label">Description</label>
              <textarea
                v-model="supplyForm.description"
                class="form-input"
                rows="3"
                placeholder="Supply description"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Current Stock</label>
                <input
                  v-model.number="supplyForm.current_stock"
                  type="number"
                  min="0"
                  required
                  class="form-input"
                />
              </div>
              <div>
                <label class="form-label">Minimum Stock</label>
                <input
                  v-model.number="supplyForm.minimum_stock"
                  type="number"
                  min="0"
                  required
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Unit Price</label>
                <input
                  v-model.number="supplyForm.unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="form-label">Expiry Date</label>
                <input
                  v-model="supplyForm.expiry_date"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>
            
            <div>
              <label class="form-label">Supplier</label>
              <input
                v-model="supplyForm.supplier"
                type="text"
                class="form-input"
                placeholder="Supplier name"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeSupplyModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="supplyLoading"
                class="btn-primary"
              >
                {{ supplyLoading ? 'Saving...' : (editingSupply ? 'Update' : 'Add') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reorder Modal -->
    <div v-if="showReorderModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Reorder Supply</h3>
            <button @click="showReorderModal = false" class="text-gray-400 hover:text-gray-600">
              <X class="h-6 w-6" />
            </button>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              <strong>{{ reorderSupply?.name }}</strong>
            </p>
            <p class="text-xs text-gray-500">
              Current Stock: {{ reorderSupply?.current_stock }} | 
              Minimum: {{ reorderSupply?.minimum_stock }}
            </p>
          </div>
          
          <form @submit.prevent="submitReorder" class="space-y-4">
            <div v-if="reorderError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ reorderError }}
            </div>
            
            <div>
              <label class="form-label">Quantity to Order</label>
              <input
                v-model.number="reorderForm.quantity"
                type="number"
                min="1"
                required
                class="form-input"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showReorderModal = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="reorderLoading"
                class="btn-primary"
              >
                {{ reorderLoading ? 'Ordering...' : 'Place Order' }}
              </button>
            </div>
          </form>
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
import axios from 'axios'

const authStore = useAuthStore()

const supplies = ref([])
const showSupplyModal = ref(false)
const showLowStockOnly = ref(false)
const editingSupply = ref(null)
const supplyLoading = ref(false)
const supplyError = ref('')

const supplyForm = ref({
  name: '',
  description: '',
  current_stock: 0,
  minimum_stock: 0,
  unit_price: 0,
  expiry_date: '',
  supplier: ''
})

// Add manual reorder functionality

// Add reorder modal and functionality

const showReorderModal = ref(false)
const reorderSupply = ref(null)
const reorderForm = ref({
  quantity: 0
})
const reorderLoading = ref(false)
const reorderError = ref('')

// Add reorder method
const openReorderModal = (supply) => {
  reorderSupply.value = supply
  reorderForm.value.quantity = supply.minimum_stock - supply.current_stock + 10
  showReorderModal.value = true
}

const submitReorder = async () => {
  reorderLoading.value = true
  reorderError.value = ''
  
  try {
    await axios.post(`/api/supplies/${reorderSupply.value.id}/reorder`, reorderForm.value)
    showReorderModal.value = false
    await fetchSupplies()
  } catch (error) {
    reorderError.value = error.response?.data?.error || 'Failed to reorder supply'
  } finally {
    reorderLoading.value = false
  }
}

const filteredSupplies = computed(() => {
  if (!showLowStockOnly.value) return supplies.value
  return supplies.value.filter(supply => supply.current_stock <= supply.minimum_stock)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US')
}

const getStockStatus = (supply) => {
  if (supply.current_stock <= 0) return 'Out of Stock'
  if (supply.current_stock <= supply.minimum_stock) return 'Low Stock'
  return 'In Stock'
}

const getStockStatusClass = (supply) => {
  if (supply.current_stock <= 0) return 'bg-red-100 text-red-800'
  if (supply.current_stock <= supply.minimum_stock) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const fetchSupplies = async () => {
  try {
    const response = await axios.get('/api/supplies')
    supplies.value = response.data
  } catch (error) {
    console.error('Error fetching supplies:', error)
  }
}

const editSupply = (supply) => {
  editingSupply.value = supply
  supplyForm.value = { ...supply }
  showSupplyModal.value = true
}

const closeSupplyModal = () => {
  showSupplyModal.value = false
  editingSupply.value = null
  supplyForm.value = {
    name: '',
    description: '',
    current_stock: 0,
    minimum_stock: 0,
    unit_price: 0,
    expiry_date: '',
    supplier: ''
  }
  supplyError.value = ''
}

const saveSupply = async () => {
  supplyLoading.value = true
  supplyError.value = ''
  
  try {
    if (editingSupply.value) {
      await axios.put(`/api/supplies/${editingSupply.value.id}`, supplyForm.value)
    } else {
      await axios.post('/api/supplies', supplyForm.value)
    }
    closeSupplyModal()
    await fetchSupplies()
  } catch (error) {
    supplyError.value = error.response?.data?.error || 'Failed to save supply'
  } finally {
    supplyLoading.value = false
  }
}

const deleteSupply = async (supplyId) => {
  if (confirm('Are you sure you want to delete this supply?')) {
    try {
      await axios.delete(`/api/supplies/${supplyId}`)
      await fetchSupplies()
    } catch (error) {
      console.error('Error deleting supply:', error)
    }
  }
}

onMounted(() => {
  fetchSupplies()
})
</script>
