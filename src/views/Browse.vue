<template>
  <div>
    <h1 class="h4 text-center mb-4">
      Browse
      <span v-if="backgroundLoading">...</span>
    </h1>

    <DataViz class="mb-5" @rangeUpdate="rangeUpdate" :filters="filters" />

    <div class="row">
      <div class="col-md-2">
        <Filters @update="filters = $event" />
      </div>
      <div class="col-md-10">
        <OrderList :list="swaps" class="mb-3" @sort="sort = $event" :loading="loading" />

        <Pagination
          :page="page"
          :totalSwaps="swaps.length"
          @update="page = $event"/>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash-es/debounce'
import { getTime } from 'date-fns'

import agent from '@/utils/agent'
import Filters from '@/components/Filters.vue'
import Pagination from '@/components/Pagination.vue'
import OrderList from '@/components/OrderList.vue'
import DataViz from '@/components/DataViz.vue'

export default {
  metaInfo () {
    return {
      title: 'Browse' + (this.query ? ' ' + this.query : '')
    }
  },
  components: {
    Filters,
    Pagination,
    OrderList,
    DataViz
  },
  data () {
    return {
      swaps: [],
      page: 1,
      sort: '-createdAt',
      filters: {},
      loading: true,
      backgroundLoading: false,
      httpPending: false,
      range: null
    }
  },
  computed: {
    query () {
      return this.$route.query.q
    }
  },
  methods: {
    rangeUpdate (range) {
      this.range = range
      this.safeBrowse()
    },
    safeBrowse: debounce(function (fromTimeout) { this.browse(fromTimeout) }, 500),
    async browse (fromTimeout) {
      clearTimeout(this.fetchTimeout)
      if (this.httpPending) return
      this.httpPending = true

      if (fromTimeout === true) {
        this.backgroundLoading = true
      } else {
        this.loading = true
      }

      const { data } = await agent.get('/api/dash/orders', {
        params: {
          ...this.filters,
          page: this.page,
          sort: this.sort,
          q: this.query,
          start: getTime(this.range.current.start),
          end: getTime(this.range.current.end)
        }
      })

      this.loading = false

      this.backgroundLoading = false

      this.swaps = data.result

      this.fetchTimeout = setTimeout(this.browse, 2500, true)

      this.httpPending = false
    }
  },
  watch: {
    page: 'safeBrowse',
    sort: 'safeBrowse',
    filters: 'safeBrowse',
    query: 'safeBrowse'
  }
}
</script>
