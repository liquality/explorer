<template>
  <div>
    <h1 class="h4 mb-3">
      Markets
    </h1>

    <div class="table-responsive table-top-addresses mb-3">
      <table class="table border bg-white mb-0">
        <thead>
          <tr>
            <td scope="col" class="text-muted">Market</td>
            <td scope="col" class="text-muted text-center">
              Rate
            </td>
            <td scope="col" class="text-muted text-center">
              Min
            </td>
            <td scope="col" class="text-muted text-center">
              Max
            </td>
            <td scope="col" class="text-muted text-right">Updated At</td>
          </tr>
        </thead>
        <LoadingTableBody :trCount="25" :tdCount="5" v-if="loading" />
        <tbody class="font-weight-normal" v-else>
          <tr v-for="item in markets" :key="item.from + '-' + item.to">
            <td>{{ item.from }} - {{ item.to }}</td>
            <td class="text-center">{{ item.rate }}</td>
            <td class="text-center">{{ formatAmount(item.min, item.from, true) }} {{ item.from }}</td>
            <td class="text-center">{{ formatAmount(item.max, item.from, true) }} {{ item.from }}</td>
            <td class="text-right">{{ formatDurationStrict(item.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import agent from '@/utils/agent'
import format from '@/mixins/format'
import LoadingTableBody from '@/components/LoadingTableBody.vue'

export default {
  metaInfo() {
    return {
      title: 'Markets'
    }
  },
  mixins: [format],
  components: {
    LoadingTableBody
  },
  data() {
    return {
      loading: false,
      markets: []
    }
  },
  created() {
    this.submit()
  },
  methods: {
    async submit() {
      this.loading = true
      const { data } = await agent.get('/api/swap/marketinfo')

      data.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))

      this.markets = data
      this.loading = false
    }
  }
}
</script>
