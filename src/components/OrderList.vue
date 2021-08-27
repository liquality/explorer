<template>
  <div class="table-responsive table-order-list">
    <table class="table border bg-white mb-0">
      <thead>
        <tr>
          <td scope="col" class="text-muted">UA</td>
          <td scope="col" :class="{
            'text-muted': true,
            'cursor-pointer': !noSort
          }" @click="!loading && setSort('createdAt')">
            When
            <span v-if="!noSort">
              <span v-if="sort === 'createdAt'">&#8595;</span>
              <span v-else-if="sort === '-createdAt'">&#8593;</span>
            </span>
          </td>
          <td scope="col" :class="{
            'text-muted': true,
            'cursor-pointer': !noSort
          }" @click="!loading && setSort('fromAmountUsd')">
            Value
            <span v-if="!noSort">
              <span v-if="sort === 'fromAmountUsd'">&#8595;</span>
              <span v-else-if="sort === '-fromAmountUsd'">&#8593;</span>
            </span>
          </td>
          <td scope="col" colspan="3" class="text-muted">Swap</td>
          <td scope="col" class="text-muted" v-if="user">Approve/Reject</td>
          <td scope="col" class="text-muted">Status</td>
        </tr>
      </thead>
      <LoadingTableBody :trCount="50" :tdCount="user ? 8 : 7" v-if="loading" />
      <tbody class="font-weight-normal" v-else>
        <OrderListItem v-for="item in list" :key="item.orderId" :class="{
          'unconfirmed-tx': !['SWAP_EXPIRED', 'QUOTE_EXPIRED', 'AGENT_REFUNDED', 'AGENT_CLAIMED'].includes(item.status)
        }" />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import format from '@/mixins/format'
import LoadingTableBody from './LoadingTableBody.vue'
import OrderListItem from './OrderListItem.vue'

export default {
  components: { LoadingTableBody, OrderListItem },
  data () {
    return {
      sort: '-createdAt',
      orderCheckMap: false
    }
  },
  mixins: [format],
  props: {
    list: {
      type: Array
    },
    noSort: {
      type: Boolean
    },
    loading: {
      type: Boolean
    }
  },
  methods: {
    setSort (sort) {
      if (this.noSort) return

      if (this.sort === sort) this.sort = `-${sort}`
      else if (this.sort === `-${sort}`) this.sort = sort
      else this.sort = `-${sort}`
    }
  },
  watch: {
    sort (sort) {
      this.$emit('sort', sort)
    }
  },
  computed: mapState(['user'])
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
