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
      <LoadingTableBody :trCount="25" :tdCount="user ? 10 : 9" v-if="loading" />
      <tbody class="font-weight-normal" v-else>
        <tr v-for="item in list" :key="item.orderId" :class="{
          'unconfirmed-tx': !['SWAP_EXPIRED', 'QUOTE_EXPIRED', 'AGENT_REFUNDED', 'AGENT_CLAIMED'].includes(item.status)
        }">
          <td>
            <router-link :to="'/order/' + item.orderId">
              {{item.userAgent.split(' ')[0]}}
            </router-link>
          </td>
          <td>
            <router-link :to="'/order/' + item.orderId">
              {{formatDate(item.createdAt)}}<br>
              <small class="text-muted">{{formatDuration(item.createdAt)}}</small>
            </router-link>
          </td>
          <td>
            <router-link :to="'/order/' + item.orderId">
              ${{formatAmount(item.fromAmountUsd, 'USD')}}<br>
              <small :class="{
                'text-danger': percProfit(item.fromAmountUsd, item.toAmountUsd) < 0,
                'text-success': percProfit(item.fromAmountUsd, item.toAmountUsd) >= 0
              }">{{percProfit(item.fromAmountUsd, item.toAmountUsd)}}%</small>
            </router-link>
          </td>
          <td class="text-right">
            <router-link :to="'/order/' + item.orderId">
              {{formatAmount(item.fromAmount, item.from, true)}} {{item.from}}
              <br>
              <small class="text-muted">1 {{item.from}}</small>
            </router-link>
          </td>
          <td class="px-0 font-weight-bold">
            &rsaquo;
          </td>
          <td class="text-left">
            <router-link :to="'/order/' + item.orderId">
              {{formatAmount(item.toAmount, item.to, true)}} {{item.to}}
              <br>
              <small class="text-muted">{{formatAssetValue(item.rate, item.to)}} {{item.to}}</small>
            </router-link>
          </td>
          <td v-if="user">
            <router-link :to="'/order/' + item.orderId">
              <span v-if="!orderCheckMap">...</span>
              <span v-else>
                <span v-if="orderCheckMap[item.orderId] && orderCheckMap[item.orderId]['reciprocate-init-swap']">
                  <span class="text-success" v-if="orderCheckMap[item.orderId]['reciprocate-init-swap'].approve">
                    Approved
                  </span>
                  <span class="text-danger" v-else-if="orderCheckMap[item.orderId]['reciprocate-init-swap'].reject">
                    Rejected
                  </span>
                </span>
                <span v-else-if="['SWAP_EXPIRED', 'QUOTE_EXPIRED', 'AGENT_REFUNDED', 'AGENT_CLAIMED', 'USER_CLAIMED', 'AGENT_FUNDED'].includes(item.status)">
                  -
                </span>
                <span v-else>
                  Pending
                </span>
              </span>
            </router-link>
          </td>
          <td>
            <router-link :to="'/order/' + item.orderId">
              {{item.status.replace('_', '\n')}}<br>
              <small class="text-muted">
                {{item.hasUnconfirmedTx ? 'has unconfirmed txs -' : ''}}
                took {{formatDurationStrict(item.createdAt, item.updatedAt, false)}}
              </small>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import format from '@/mixins/format'
import LoadingTableBody from './LoadingTableBody.vue'

export default {
  components: { LoadingTableBody },
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
    ...mapActions(['checkOrder']),
    percProfit (from, to) {
      return Math.ceil(((from - to) / from) * 10000) / 100
    },
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
  computed: mapState(['user']),
  async beforeUpdate () {
    if (this.user) {
      const orderCheckMap = {}

      await Promise.all(this.list.map(async ({ orderId }) => {
        const check = await this.checkOrder({ orderId })

        if (check && check.flags) {
          orderCheckMap[orderId] = check.flags
        }
      }))

      this.orderCheckMap = orderCheckMap
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
