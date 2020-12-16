<template>
<div class="card-body">
  <h6 class="mb-3 font-weight-light text-muted d-flex justify-content-between align-items-center">
    <span>{{heading}}</span>
    <span :class="{
      'font-weight-normal': true,
      'text-danger': perc < 0,
      'text-success': perc >= 0
    }">{{perc}}%</span>
  </h6>
  <p class="h3 font-weight-light mb-0">
    ${{formatAmount(summary.current[type], 'USD')}}
  </p>
</div>
</template>

<script>
import formatMixin from '@/mixins/format'

export default {
  mixins: [
    formatMixin
  ],
  props: {
    heading: String,
    type: String,
    summary: Object
  },
  computed: {
    perc () {
      return this.calculatePerc(this.summary.current[this.type], this.summary.compare[this.type])
    }
  }
}
</script>
