<template>
  <div>
    <DataViz class="mb-5" />

    <h2 class="h5 mb-3 d-flex align-items-center">
      Most recent swaps
      <router-link to="/browse" class="small ml-3">Browse &rsaquo;</router-link>
    </h2>

    <OrderList :list="history" noSort :loading="loading" />
  </div>
</template>

<script>
import agent from '@/utils/agent'
import OrderList from '@/components/OrderList.vue'
import DataViz from '@/components/DataViz.vue'

export default {
  components: {
    DataViz,
    OrderList
  },
  data () {
    return {
      history: [],
      loading: false
    }
  },
  async created () {
    this.loading = true

    const { data } = await agent.get('/api/dash/orders', {
      params: {
        start: 0,
        limit: 10,
        excludeStatus: ['QUOTE']
      }
    })

    this.loading = false

    this.history = data.result
  }
}
</script>
