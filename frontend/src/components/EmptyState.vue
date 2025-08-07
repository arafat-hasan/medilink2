<template>
  <div class="text-center py-12">
    <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
      <component :is="icon" class="h-full w-full" />
    </div>
    <h3 class="mt-2 text-sm font-medium text-gray-900">{{ title }}</h3>
    <p class="mt-1 text-sm text-gray-500">{{ description }}</p>
    <div v-if="actionText && actionClick" class="mt-6">
      <button
        @click="actionClick"
        class="btn-primary"
      >
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { Calendar } from 'lucide-vue-next'

defineProps({
  icon: {
    type: Object,
    default: () => Calendar
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actionText: {
    type: String,
    default: ''
  },
  actionClick: {
    type: Function,
    default: null
  }
})
</script>
