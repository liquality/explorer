<template>
  <tr :class="{
    'unconfirmed-tx': !['SWAP_EXPIRED', 'QUOTE_EXPIRED', 'AGENT_REFUNDED', 'AGENT_CLAIMED'].includes(item.status)
  }">
    <td>
      <router-link :to="'/order/' + item.orderId">
        {{item.userAgent ? item.userAgent.split(' ')[0] : '-'}}
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
          'text-danger': percProfit(item.fromAmountUsd - item.totalAgentFeeUsd, item.toAmountUsd) < 0,
          'text-success': percProfit(item.fromAmountUsd - item.totalAgentFeeUsd, item.toAmountUsd) >= 0
        }">{{percProfit(item.fromAmountUsd - item.totalAgentFeeUsd, item.toAmountUsd)}}%</small>
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
        <span v-if="!checks">...</span>
        <span v-else>
          <span v-if="checks[item.orderId] && checks[item.orderId]['reciprocate-init-swap']">
            <span class="text-success" v-if="checks[item.orderId]['reciprocate-init-swap'].approve">
              Approved
            </span>
            <span class="text-danger" v-else-if="checks[item.orderId]['reciprocate-init-swap'].reject">
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
</template>

<script>
import { mapState, mapActions } from 'vuex'
import format from '@/mixins/format'

export default {
  data () {
    return {
      sort: '-createdAt',
      checks: false
    }
  },
  mixins: [format],
  props: {
    item: {
      type: Object
    }
  },
  methods: {
    ...mapActions(['checkOrder']),
    percProfit (from, to) {
      return Math.ceil(((from - to) / from) * 10000) / 100
    }
  },
  computed: mapState(['user']),
  async created () {
    if (this.user) {
      const check = await this.checkOrder({ orderId: this.item.orderId })

      if (check && check.flags) {
        this.checks = check.flags
      }
    }
  }
}
</script>
