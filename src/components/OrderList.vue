<template>
  <div class="table-responsive table-order-list">
    <table class="table border bg-white mb-0">
      <thead>
        <tr>
          <td scope="col" class="text-muted cursor-pointer" @click="setSort('createdAt')">
            When
            <span v-if="sort === 'createdAt'">&#8595;</span>
            <span v-else-if="sort === '-createdAt'">&#8593;</span>
          </td>
          <td scope="col" class="text-muted cursor-pointer" @click="setSort('fromUsdValue')">
            Value
            <span v-if="sort === 'fromUsdValue'">&#8595;</span>
            <span v-else-if="sort === '-fromUsdValue'">&#8593;</span>
          </td>
          <td scope="col" colspan="3" class="text-muted">Swap</td>
          <td scope="col" colspan="3" class="text-muted">Rate</td>
          <td scope="col" class="text-muted">Status</td>
        </tr>
      </thead>
      <tbody class="font-weight-normal">
        <tr v-for="item in list" :key="item.orderId">
          <td>
            <router-link :to="'/order/' + item.orderId" class="text-muted">
              {{formatDuration(item.createdAt)}}<br>
              <small>{{formatDate(item.createdAt)}}</small>
            </router-link>
          </td>
          <td>
            <router-link :to="'/order/' + item.orderId">
              ${{formatAmount(item.fromUsdValue, 'USD')}}
              <small :class="{
                'text-danger': percProfit(item.fromUsdValue, item.toUsdValue) < 0,
                'text-success': percProfit(item.fromUsdValue, item.toUsdValue) >= 0
              }">{{percProfit(item.fromUsdValue, item.toUsdValue)}}%</small>
            </router-link>
          </td>
          <td class="text-right">
            <router-link :to="'/order/' + item.orderId">
              {{formatAmount(item.fromAmount, item.from, true)}} {{item.from}}
            </router-link>
          </td>
          <td class="px-0 font-weight-bold">
            &rsaquo;
          </td>
          <td class="text-left">
            <router-link :to="'/order/' + item.orderId">
              {{formatAmount(item.toAmount, item.to, true)}} {{item.to}}
            </router-link>
          </td>
          <td class="text-right">
            <router-link :to="'/order/' + item.orderId">
              1 {{item.from}}
            </router-link>
          </td>
          <td class="px-0 font-weight-bold">
            =
          </td>
          <td class="text-left">
            <router-link :to="'/order/' + item.orderId">
              {{formatAmount(item.rate, 'USD')}} {{item.to}}
            </router-link>
          </td>
          <td>
            <router-link :to="'/order/' + item.orderId">
              {{item.status}}
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import format from '@/mixins/format'

export default {
  data () {
    return {
      sort: '-createdAt'
    }
  },
  mixins: [format],
  props: {
    list: {
      type: Array
    }
  },
  methods: {
    percProfit (from, to) {
      return Math.ceil(((from - to) / from) * 10000) / 100
    },
    setSort (sort) {
      if (this.sort === sort) this.sort = `-${sort}`
      else if (this.sort === `-${sort}`) this.sort = sort
      else this.sort = `-${sort}`
    }
  },
  watch: {
    sort (sort) {
      this.$emit('sort', sort)
    }
  }
}
</script>

<style lang="scss">
.table-order-list {
  tr > td {
    text-align: center;
    vertical-align: middle;

    &:first-child {
      width: 1%;
      white-space: nowrap;
      text-align: left;
    }

    &:last-child {
      width: 1%;
      white-space: nowrap;
      text-align: right;
    }
  }
}
</style>
