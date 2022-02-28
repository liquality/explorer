<template>
  <div>
    <h1 class="h4 mb-3">
      Assets
    </h1>

    <div class="table-responsive table-top-addresses mb-3">
      <table class="table border bg-white mb-0">
        <thead>
          <tr>
            <td scope="col" class="text-muted">Asset</td>
            <td scope="col" class="text-muted text-center">
              Balance
            </td>
            <td scope="col" class="text-muted text-center">
              Min Conf
            </td>
            <td scope="col" class="text-muted text-right">Updated At</td>
          </tr>
        </thead>
        <LoadingTableBody :trCount="25" :tdCount="5" v-if="loading" />
        <tbody class="font-weight-normal" v-else>
          <tr v-for="item in assets" :key="item.code">
            <td>{{ item.code }}</td>
            <td class="text-center">{{ formatAmount(item.actualBalance, item.code, true) }} {{ item.code }}</td>
            <td class="text-center">{{ item.minConf }}</td>
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
      title: 'Assets'
    }
  },
  mixins: [format],
  components: {
    LoadingTableBody
  },
  data() {
    return {
      loading: false,
      assets: []
    }
  },
  created() {
    this.submit()
  },
  methods: {
    async submit() {
      this.loading = true
      const { data } = await agent.get('/api/swap/assetinfo')

      data.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))

      this.assets = data
      this.loading = false
    }
  }
}
</script>
