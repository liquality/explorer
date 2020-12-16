<template>
  <div>
    <h1 class="h4 mb-4">Browse</h1>
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

import agent from '@/utils/agent'
import Filters from '@/components/Filters.vue'
import Pagination from '@/components/Pagination.vue'
import OrderList from '@/components/OrderList.vue'

export default {
  metaInfo () {
    return {
      title: 'Browse' + (this.query ? ' ' + this.query : '')
    }
  },
  components: {
    Filters,
    Pagination,
    OrderList
  },
  data () {
    return {
      swaps: [],
      page: 1,
      sort: '-createdAt',
      filters: {},
      loading: true
    }
  },
  computed: {
    query () {
      return this.$route.query.q
    }
  },
  methods: {
    safeBrowse: debounce(function () { this.browse() }, 500),
    async browse () {
      this.loading = true

      const { data } = await agent.get('/api/dash/orders', {
        params: {
          ...this.filters,
          page: this.page,
          sort: this.sort,
          q: this.query
        }
      })

      this.loading = false

      this.swaps = data.result
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
