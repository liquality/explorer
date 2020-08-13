<template>
  <div v-if="order">
    <div class="row">
      <div class="col-md-8">
        <h1 class="h4 mb-4">Order Details</h1>
        <div class="card border-top-0 mb-5">
          <div class="table-responsive">
            <table class="table bg-white m-0 table-order-details">
              <tbody class="font-weight-normal">
                <tr v-if="order.fromAddress">
                  <td class="text-muted text-right small-12">Order ID</td>
                  <td><router-link :to="'/order/' + order.orderId">{{order.orderId}}</router-link></td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Amount</td>
                  <td>
                    {{formatAmount(order.fromAmount, order.from)}} {{order.from}}
                    <span class="font-weight-bold text-muted mx-1">&rsaquo;</span>
                    {{formatAmount(order.toAmount, order.to)}} {{order.to}}
                    <span class="text-muted mx-1">@</span>
                    <span class="text-muted">1 {{order.from}} = {{formatAmount(order.rate, 'USD')}} {{order.to}}</span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Value</td>
                  <td>
                    ${{formatAmount(order.fromUsdValue, 'USD')}}
                    <span class="text-muted mx-1">&rsaquo;</span>
                    <span v-if="latestFromUsdValue">
                      ${{formatAmount(latestFromUsdValue, 'USD')}}
                      <span class="ml-1" :class="{
                        'text-danger': changeInUsdValue < 0,
                        'text-success': changeInUsdValue >= 0
                      }">{{changeInUsdValue}}%</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Status</td>
                  <td>{{order.status}}</td>
                </tr>
                <tr v-if="order.fromAddress">
                  <td class="text-muted text-right small-12">User's {{order.from}}<br>address</td>
                  <td>
                    <router-link :to="'/address/' + formatAddress(order.fromAddress, order.from)">
                      {{formatAddress(order.fromAddress, order.from)}}
                    </router-link>
                    <small class="d-block text-muted" v-if="statsByAddresses[order.fromAddress] && statsByAddresses[order.fromAddress].count > 0">
                      {{statsByAddresses[order.fromAddress].count}} {{formatPlural(statsByAddresses[order.fromAddress].count, 'order', 'orders')}} worth ${{formatAmount(statsByAddresses[order.fromAddress].usd_volume, 'USD')}}
                    </small>
                  </td>
                </tr>
                <tr v-if="order.toAddress">
                  <td class="text-muted text-right small-12">User's {{order.to}}<br>address</td>
                  <td>
                    <router-link :to="'/address/' + formatAddress(order.toAddress, order.to)">
                      {{formatAddress(order.toAddress, order.to)}}
                    </router-link>
                    <small class="d-block text-muted" v-if="order.fromAddress !== order.toAddress && statsByAddresses[order.toAddress] && statsByAddresses[order.toAddress].count > 0">
                      {{statsByAddresses[order.toAddress].count}} {{formatPlural(statsByAddresses[order.toAddress].count, 'order', 'orders')}} worth ${{formatAmount(statsByAddresses[order.toAddress].usd_volume, 'USD')}}
                    </small>
                  </td>
                </tr>
                <tr v-if="order.fromCounterPartyAddress">
                  <td class="text-muted text-right small-12">Agent's {{order.from}}<br>address</td>
                  <td>
                    <router-link :to="'/address/' + formatAddress(order.fromCounterPartyAddress, order.from)">
                      {{formatAddress(order.fromCounterPartyAddress, order.from)}}
                    </router-link>
                  </td>
                </tr>
                <tr v-if="order.toCounterPartyAddress">
                  <td class="text-muted text-right small-12">Agent's {{order.to}}<br>address</td>
                  <td>
                    <router-link :to="'/address/' + formatAddress(order.toCounterPartyAddress, order.to)">
                      {{formatAddress(order.toCounterPartyAddress, order.to)}}
                    </router-link>
                  </td>
                </tr>
                <tr v-if="order.fromFundHash">
                  <td class="text-muted text-right small-12">User's {{order.from}}<br>funding transaction</td>
                  <td>
                    <a :href="formatTxHashLink(order.fromFundHash, order.from)" target="_blank" rel="noopener">{{formatTxHash(order.fromFundHash, order.from)}}</a>
                  </td>
                </tr>
                <tr v-if="order.secretHash">
                  <td class="text-muted text-right small-12">Secret Hash</td>
                  <td>{{formatTxHash(order.secretHash, 'ETH')}}</td>
                </tr>
                <tr v-if="order.toClaimHash">
                  <td class="text-muted text-right small-12">User's {{order.to}}<br>claim transaction</td>
                  <td>
                    <a :href="formatTxHashLink(order.toClaimHash, order.to)" target="_blank" rel="noopener">{{formatTxHash(order.toClaimHash, order.to)}}</a>
                  </td>
                </tr>
                <tr v-if="order.toFundHash">
                  <td class="text-muted text-right small-12">Agent's {{order.to}}<br>funding transaction</td>
                  <td>
                    <a :href="formatTxHashLink(order.toFundHash, order.to)" target="_blank" rel="noopener">{{formatTxHash(order.toFundHash, order.to)}}</a>
                  </td>
                </tr>
                <tr v-if="order.fromClaimHash">
                  <td class="text-muted text-right small-12">Agent's {{order.from}}<br>claim transaction</td>
                  <td>
                    <a :href="formatTxHashLink(order.fromClaimHash, order.from)" target="_blank" rel="noopener">{{formatTxHash(order.fromClaimHash, order.from)}}</a>
                  </td>
                </tr>
                <tr v-if="order.toRefundHash">
                  <td class="text-muted text-right small-12">Agent's {{order.to}}<br>refund transaction</td>
                  <td>
                    <a :href="formatTxHashLink(order.toRefundHash, order.to)" target="_blank" rel="noopener">{{formatTxHash(order.toRefundHash, order.to)}}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <h2 class="h5 mb-4">Timeline</h2>
        <div class="order-timeline">
          <div class="card font-weight-normal" v-for="(audit, idx) in auditLogs" :key="audit._id">
            <div class="card-body">
              <div v-if="audit.orderStatus === 'QUOTE'">
                <Check />
                <p class="mb-0">User requested a quote</p>
              </div>
              <div v-else-if="audit.context === 'SWAP_UPDATE'">
                <Check />
                <p class="mb-0">User has informed the agent about the funding transaction</p>
              </div>
              <div v-else-if="audit.context === 'VERIFY_USER_INIT_TX' && audit.status === 'USER_FUNDING_NOT_FOUND'" class="invert-icon-colors">
                <Check />
                <p class="mb-0">Agent is looking for user's funding transaction</p>
              </div>
              <div v-else-if="audit.context === 'VERIFY_USER_INIT_TX' && audit.status === 'USER_FUNDING_NEED_MORE_CONF'" class="invert-icon-colors">
                <Check />
                <p class="mb-0">Agent is waiting for {{audit.extra.minConf}} {{ audit.extra.minConf === 1 ? 'confirmation' : 'confirmations' }} on user's funding transaction</p>
              </div>
              <div v-else-if="audit.orderStatus === 'USER_FUNDED'" class="invert-icon-colors">
                <Check />
                <p class="mb-0">Agent has confirmed user's funding transaction</p>
              </div>
              <div v-else-if="audit.context === 'RECIPROCATE_INIT_SWAP'" class="invert-icon-colors">
                <Check />
                <p class="mb-0">Agent has reciprocated funding transaction</p>
              </div>
              <div v-else-if="audit.status === 'AGENT_CLAIM_WAITING'" class="invert-icon-colors">
                <Check />
                <p class="mb-0">Agent is waiting for user to claim</p>
              </div>
              <div v-else-if="audit.orderStatus === 'USER_CLAIMED'">
                <Check />
                <p class="mb-0">User has claimed agent's funding transaction</p>
              </div>
              <div v-else-if="audit.orderStatus === 'AGENT_CLAIMED'" class="invert-icon-colors">
                <Check />
                <p class="mb-0">Agent has claimed user's funding transaction</p>
              </div>
              <div v-else-if="audit.orderStatus === 'AGENT_REFUNDED'" class="invert-icon-colors">
                <Check />
                <p class="mb-0">Agent has refunded</p>
              </div>
              <div v-else>
                <Check />
                <p class="mb-0">
                  <time :datetime="audit.createdAt">{{audit.createdAt}}</time> - {{audit.orderStatus}} - {{audit.status}} - {{audit.context}}
                  <br>
                  <pre>{{JSON.stringify(audit.extra, null, 2)}}</pre>
                </p>
              </div>
              <div class="mt-1 text-muted small d-block">
                <time :datetime="audit.createdAt">{{formatDate(auditMap[audit.key].end)}}</time>
                <span v-if="auditMap[audit.key].count > 1" class="ml-1">
                  ({{auditMap[audit.key].count}} attempts, first attempt at {{formatDate(auditMap[audit.key].start)}}, took {{formatDuration(auditMap[audit.key].start, auditMap[audit.key].end, false)}})
                </span>
              </div>
            </div>
            <div class="card-body" v-if="idx < (auditLogs.length - 1)">
              <div class="text-muted small align-items-center">
                <div class="time-diff"><div></div></div>
                <p class="mb-0"><em>+{{formatDurationStrict(auditMap[audit.key].end, auditMap[auditLogs[idx + 1].key].start, false)}}</em></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { min, max, isEqual } from 'date-fns'

import Check from '@/components/Icons/Check.vue'
import format from '@/mixins/format'

export default {
  metaInfo () {
    return {
      title: 'Order ' + this.orderId
    }
  },
  components: {
    Check
  },
  mixins: [format],
  data () {
    return {
      order: null,
      auditLogs: [],
      auditMap: {},
      statsByAddresses: {},
      latestFromUsdValue: null,
      changeInUsdValue: null
    }
  },
  computed: {
    orderId () {
      return this.$route.params.orderId
    }
  },
  async created () {
    const { data } = await axios(`https://liquality-dashboard.herokuapp.com/api/swap/order/${this.orderId}`, {
      params: {
        verbose: true
      }
    })

    const auditMap = {}

    const auditLogs = data.audit_log.map(audit => {
      const key = `${audit.context}-${audit.orderStatus}-${audit.status}`
      audit.key = key

      if (!auditMap[key]) {
        auditMap[key] = {
          count: 0,
          start: null,
          end: null
        }
      }

      if (!auditMap[key].count) {
        auditMap[key].start = new Date(audit.createdAt)
        auditMap[key].end = new Date(audit.createdAt)
      } else {
        auditMap[key].start = min([auditMap[key].start, new Date(audit.createdAt)])
        auditMap[key].end = max([auditMap[key].end, new Date(audit.createdAt)])
      }

      auditMap[key].count++

      return audit
    })

    this.auditLogs = auditLogs.filter(audit => isEqual(auditMap[audit.key].start, new Date(audit.createdAt)))
    this.auditMap = auditMap
    this.order = data

    const addresses = new Set([data.toAddress, data.fromAddress].filter(a => !!a))

    const statsByAddresses = await Promise.all([...addresses].map(
      address => axios('https://liquality-dashboard.herokuapp.com/api/dash/statsByAddress', { params: { address } }).then(response => response.data)
    ))

    this.statsByAddresses = statsByAddresses.reduce((acc, obj) => {
      acc[obj.address] = obj.result
      return acc
    }, {})

    const { data: { result: fromUsdRate } } = await axios('https://liquality-dashboard.herokuapp.com/api/dash/usdRate', { params: { asset: data.from } })
    this.latestFromUsdValue = this.formatUnitToCurrency(data.fromAmount, data.from) * fromUsdRate
    this.changeInUsdValue = Math.ceil(((this.latestFromUsdValue - data.fromUsdValue) / data.fromUsdValue) * 10000) / 100
  }
}
</script>

<style lang="scss">
.time-diff {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8px;
  height: 8px;
  background: $blue-light-3;
  border-radius: 50%;
  margin-left: 1px;
  margin-right: 21px;

  div {
    width: 4px;
    height: 4px;
    background: $body-bg;
    border-radius: 50%;
  }
}

.table-order-details {
  td {
    vertical-align: middle;
  }

  tr > td:first-child {
    width: 1%;
    white-space: nowrap;
    text-align: left;
  }
}

.order-timeline {
  position: relative;

  > div:last-child {
    z-index: 1;

    &:after {
      display: block;
      content: '';
      position: absolute;
      left: 2px;
      top: 0;
      bottom: 0;
      width: 4px;
      border-left: 6px solid $body-bg;
      z-index: -1;
    }
  }

  &:before {
    display: block;
    content: '';
    position: absolute;
    left: 14px;
    top: 0;
    bottom: 0;
    width: 1px;
    border-left: 2px solid $blue-light-3;
  }

  .card {
    background: transparent;
    margin-left: 10px;
    border: 0;
  }

  .card + .card, .card-body + .card-body {
    margin-top: 1.5rem;
  }

  svg {
    height: 30px;
    margin: -1px 10px -10px -10px;
    border: 2px solid $blue-light-3;
    border-radius: 50%;
    background: $body-bg;
    flex-shrink: 0;
  }

  .primary {
    fill: $body-bg;
  }

  .invert-icon-colors {
    .primary {
      fill: $blue-dark-5;
    }

    .secondary {
      fill: $body-bg;
    }

    svg {
      border-color: $blue-dark-5;
      background: $blue-dark-5;
    }
  }

  .card-body {
    padding: 0;

    > div {
      display: flex;
      align-items: flex-start;

      &:nth-child(2) {
        margin-left: 30px;
      }
    }
  }
}
</style>
