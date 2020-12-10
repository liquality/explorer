<template>
  <div>
    <DataViz class="mb-5" />

    <h2 class="h5 mb-3 d-flex align-items-center">
      Most recent swaps
      <router-link to="/browse" class="small ml-3">Browse &rsaquo;</router-link>
    </h2>

    <OrderList :list="history" noSort />
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
      history: []
    }
  },
  async created () {
    const { data } = await agent.get('/api/dash/orders', {
      params: {
        start: 0,
        limit: 10,
        excludeStatus: ['QUOTE']
      }
    })

    this.history = data.result
  }
}
</script>
