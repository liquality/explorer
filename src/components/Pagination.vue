<template>
  <div class="btn-group d-block text-right">
    <button
      v-if="page > 1" @click="$emit('update', page - 1)"
      type="button"
      class="btn btn-outline-secondary">&lsaquo; Previous</button>
    <button
      v-if="totalSwaps > 0" @click="$emit('update', page + 1)"
      type="button"
      class="btn btn-outline-secondary">Next &rsaquo;</button>
  </div>
</template>

<script>
export default {
  props: {
    page: Number,
    totalSwaps: Number
  }
}
</script>
