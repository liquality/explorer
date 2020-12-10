<template>
  <div>
    <h1 class="h4 mb-1">Address Details</h1>
    <p class="lead font-weight-light text-muted">{{address}}</p>

    <DataViz :address="address" class="mb-5" />

    <h2 class="h5 mb-3 d-flex align-items-center">
      Most recent swaps
      <router-link :to="{ path: '/browse', query: { q: this.address } }" class="small ml-3">Browse &rsaquo;</router-link>
    </h2>
    <OrderList :list="list" />
  </div>
</template>

<script>
import agent from '@/utils/agent'
import DataViz from '@/components/DataViz.vue'
import OrderList from '@/components/OrderList.vue'

export default {
  metaInfo () {
    return {
      title: 'Address ' + this.address
    }
  },
  components: {
    DataViz,
    OrderList
  },
  data () {
    return {
      list: []
    }
  },
  async created () {
    this.search()
  },
  computed: {
    address () {
      return this.$route.params.address
    }
  },
  methods: {
    async search () {
      const { data } = await agent.get('/api/dash/orders', {
        params: {
          q: this.address,
          start: 0,
          limit: 10,
          excludeStatus: ['QUOTE']
        }
      })

      this.list = data.result
    }
  }
}
</script>
