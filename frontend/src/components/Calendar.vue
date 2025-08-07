<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Doctor Availability</h3>
        <div class="flex items-center space-x-2">
          <button
            @click="previousMonth"
            class="p-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>
          <span class="text-sm font-medium text-gray-700">
            {{ currentMonthYear }}
          </span>
          <button
            @click="nextMonth"
            class="p-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="calendar-grid">
      <!-- Day headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-xs font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar days -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="[
            'relative p-2 text-sm border rounded-lg cursor-pointer transition-colors',
            day.isCurrentMonth
              ? 'bg-white hover:bg-gray-50 border-gray-200'
              : 'bg-gray-50 text-gray-400 border-gray-100',
            day.isToday ? 'ring-2 ring-primary-500' : '',
            day.isSelected ? 'bg-primary-100 border-primary-300' : '',
            day.hasAppointments ? 'bg-green-50 border-green-200' : ''
          ]"
          @click="selectDate(day)"
        >
          <span class="block text-center">{{ day.dayNumber }}</span>
          
          <!-- Availability indicator -->
          <div v-if="day.isCurrentMonth && day.availability" class="mt-1">
            <div class="flex justify-center">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <!-- Appointment count -->
          <div v-if="day.appointmentCount > 0" class="mt-1">
            <div class="flex justify-center">
              <span class="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                {{ day.appointmentCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Time slots for selected date -->
    <div v-if="selectedDate && selectedDateAvailability" class="mt-6">
      <h4 class="text-md font-medium text-gray-900 mb-3">
        Available Times for {{ formatSelectedDate }}
      </h4>
      
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="timeSlot in availableTimeSlots"
          :key="timeSlot"
          :class="[
            'px-3 py-2 text-sm rounded-md border transition-colors',
            isTimeSlotBooked(timeSlot)
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-primary-50 hover:border-primary-300 cursor-pointer'
          ]"
          :disabled="isTimeSlotBooked(timeSlot)"
          @click="selectTimeSlot(timeSlot)"
        >
          {{ timeSlot }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import axios from 'axios'

const props = defineProps({
  doctorId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['date-selected', 'time-selected'])

const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedDateAvailability = ref(null)
const bookedSlots = ref([])

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = selectedDate.value && date.toDateString() === selectedDate.value.toDateString()
    
    // Check if this date has availability
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const availability = selectedDateAvailability.value?.availability || []
    
    // Count appointments for this date
    const appointmentCount = bookedSlots.value.filter(slot => {
      const slotDate = new Date(slot)
      return slotDate.toDateString() === date.toDateString()
    }).length
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday,
      isSelected,
      hasAppointments: appointmentCount > 0,
      appointmentCount,
      availability: availability.length > 0
    })
  }
  
  return days
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const availableTimeSlots = computed(() => {
  if (!selectedDateAvailability.value?.availability) return []
  
  const [startTime, endTime] = selectedDateAvailability.value.availability
  const slots = []
  
  if (startTime && endTime) {
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    
    while (start < end) {
      slots.push(start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }))
      start.setMinutes(start.getMinutes() + 30) // 30-minute slots
    }
  }
  
  return slots
})

const fetchAvailability = async (date) => {
  try {
    const response = await axios.get(`/api/appointments/doctor/${props.doctorId}/availability`, {
      params: { date: date.toISOString().split('T')[0] }
    })
    selectedDateAvailability.value = response.data
    bookedSlots.value = response.data.booked_slots
  } catch (error) {
    console.error('Error fetching availability:', error)
  }
}

const selectDate = (day) => {
  if (!day.isCurrentMonth) return
  
  selectedDate.value = new Date(day.date)
  fetchAvailability(selectedDate.value)
  emit('date-selected', selectedDate.value)
}

const selectTimeSlot = (timeSlot) => {
  if (isTimeSlotBooked(timeSlot)) return
  
  const selectedDateTime = new Date(selectedDate.value)
  const [hours, minutes] = timeSlot.split(':')
  selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  emit('time-selected', selectedDateTime)
}

const isTimeSlotBooked = (timeSlot) => {
  return bookedSlots.value.some(slot => {
    const slotTime = new Date(slot)
    const slotTimeString = slotTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    return slotTimeString === timeSlot
  })
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

onMounted(() => {
  // Set initial selected date to today
  selectedDate.value = new Date()
  fetchAvailability(selectedDate.value)
})

watch(() => props.doctorId, () => {
  if (selectedDate.value) {
    fetchAvailability(selectedDate.value)
  }
})
</script>

<style scoped>
.calendar-container {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4;
}

.calendar-grid {
  @apply space-y-2;
}
</style> 