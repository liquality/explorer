<template>
  <div>
    <h1 class="h4 mb-3">
      Top Addresses
    </h1>

    <div class="table-responsive table-top-addresses mb-3">
      <table class="table border bg-white mb-0">
        <thead>
          <tr>
            <td scope="col" class="text-muted">Address</td>
            <td scope="col" class="text-muted cursor-pointer text-center" @click="setSort('volume')">
              Volume
              <span v-if="sort === 'volume'">&#8595;</span>
              <span v-else-if="sort === '-volume'">&#8593;</span>
            </td>
            <td scope="col" class="text-muted cursor-pointer text-center" @click="setSort('count')">
              Count
              <span v-if="sort === 'count'">&#8595;</span>
              <span v-else-if="sort === '-count'">&#8593;</span>
            </td>
            <td scope="col" class="text-muted text-right">Markets</td>
          </tr>
        </thead>
        <tbody class="font-weight-normal">
          <tr v-for="item in addresses" :key="item.address">
            <td>
              <router-link :to="'/address/' + item.address">
                {{item.address}}
              </router-link>
            </td>
            <td class="text-center">
              <router-link :to="'/address/' + item.address">
                ${{formatAmount(item.usd_volume, 'USD')}}
                <small v-if="accumulate">{{perc(item.usd_volume, 'usd_volume')}}%</small>
              </router-link>
            </td>
            <td class="text-center">
              <router-link :to="'/address/' + item.address">
                {{item.count}}
                <small v-if="accumulate">{{perc(item.count, 'count')}}%</small>
              </router-link>
            </td>
            <td class="text-right">
              <router-link :to="'/address/' + item.address">
                {{printMarkets(item.markets)}}
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      :page="page"
      :totalSwaps="addresses.length"
      @update="page = $event"/>
  </div>
</template>

<script>
import axios from 'axios'

import format from '@/mixins/format'
import Pagination from '@/components/Pagination.vue'

export default {
  metaInfo () {
    return {
      title: 'Top Addresses'
    }
  },
  mixins: [format],
  components: {
    Pagination
  },
  data () {
    return {
      addresses: [],
      sort: '-volume',
      page: 1,
      accumulate: null
    }
  },
  created () {
    this.submit()
  },
  methods: {
    perc (value, type) {
      return Math.ceil((value / this.accumulate[type]) * 10000) / 100
    },
    async submit () {
      const { data } = await axios('https://liquality-dashboard.herokuapp.com/api/dash/topAddresses', {
        params: {
          sort: this.sort,
          page: this.page
        }
      })

      this.addresses = data.result

      const { data: { result: accumulate } } = await axios('https://liquality-dashboard.herokuapp.com/api/dash/accumulate')
      this.accumulate = accumulate
    },
    printMarkets (markets) {
      const prefix = markets.slice(0, 2).join(', ')
      const diff = markets.length - 2

      if (diff > 0) {
        return `${prefix} + ${diff}`
      }

      return prefix
    },
    setSort (sort) {
      if (this.sort === sort) this.sort = `-${sort}`
      else if (this.sort === `-${sort}`) this.sort = sort
      else this.sort = `-${sort}`
    }
  },
  watch: {
    sort: 'submit',
    page: 'submit'
  }
}
</script>

<style lang="scss">
.table-top-addresses {
  tr > td {
    vertical-align: middle;

    &:first-child {
      width: 1%;
      white-space: nowrap;
    }

    &:last-child {
      width: 1%;
      white-space: nowrap;
    }
  }
}
</style>
