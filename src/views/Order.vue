<template>
  <div v-if="order">
    <div class="row">
      <div class="col-md-8">
        <h1 class="h4 mb-4">Order Details</h1>
        <div class="card border-top-0 mb-5">
          <div class="table-responsive">
            <table class="table bg-white m-0 table-order-details">
              <tbody class="font-weight-normal">
                <tr>
                  <td class="text-muted text-right small-12">Order ID</td>
                  <td><router-link :to="'/order/' + order.orderId">{{order.orderId}}</router-link></td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">User Agent</td>
                  <td>{{order.userAgent === 'wallet' ? 'Wallet' : 'UI'}}</td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Amount</td>
                  <td>
                    {{formatAmount(order.fromAmount, order.from, true)}} {{order.from}}
                    <span class="font-weight-bold text-muted mx-1">&rsaquo;</span>
                    {{formatAmount(order.toAmount, order.to, true)}} {{order.to}}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Time</td>
                  <td>
                    {{formatDate(order.createdAt)}}
                    <span v-if="!isEqual((order.createdAt), (order.updatedAt)) && order.updatedAt">
                      <span class="font-weight-bold text-muted mx-1">&rsaquo;</span>
                      {{formatDate(order.updatedAt)}}
                      <span class="ml-1 text-success">{{formatDurationStrict((order.createdAt), (order.updatedAt), false)}}</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Rate</td>
                  <td>
                    1 {{order.from}} = {{formatAssetValue(order.rate, order.to)}} {{order.to}}
                    <span v-if="latestMarketRate">
                      <span class="text-muted mx-1">&rsaquo;</span>
                      {{formatAssetValue(latestMarketRate, order.to)}}
                      <span :class="{
                        'ml-1': true,
                        'text-danger': changeInMarketRate < 0,
                        'text-success': changeInMarketRate >= 0
                      }">{{changeInMarketRate}}%</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">{{order.from}}/USD</td>
                  <td>
                    ${{formatAmount(order.fromRateUsd, 'USD')}}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">{{order.to}}/USD</td>
                  <td>
                    ${{formatAmount(order.toRateUsd, 'USD')}}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">{{order.from}} Value</td>
                  <td>
                    ${{formatAmount(order.fromAmountUsd, 'USD')}}
                    <span v-if="latestfromAmountUsd">
                      <span class="text-muted mx-1">&rsaquo;</span>
                      <span>
                        ${{formatAmount(latestfromAmountUsd, 'USD')}}
                        <span class="ml-1" :class="{
                          'text-danger': changeInfromAmountUsd < 0,
                          'text-success': changeInfromAmountUsd >= 0
                        }">{{changeInfromAmountUsd}}%</span>
                      </span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">{{order.to}} Value</td>
                  <td>
                    ${{formatAmount(order.toAmountUsd, 'USD')}}
                    <span v-if="latesttoAmountUsd">
                      <span class="text-muted mx-1">&rsaquo;</span>
                      <span>
                        ${{formatAmount(latesttoAmountUsd, 'USD')}}
                        <span :class="{
                          'ml-1': true,
                          'text-danger': changeIntoAmountUsd < 0,
                          'text-success': changeIntoAmountUsd >= 0
                        }">{{changeIntoAmountUsd}}%</span>
                      </span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">USD Difference</td>
                  <td>
                    <span :class="{
                      'text-danger': percProfit(order.fromAmountUsd, order.toAmountUsd) < 0,
                      'text-success': percProfit(order.fromAmountUsd, order.toAmountUsd) >= 0
                    }">${{formatAmount(order.fromAmountUsd - order.toAmountUsd, 'USD')}} ({{percProfit(order.fromAmountUsd, order.toAmountUsd)}}%)</span>
                    <span class="text-muted mx-2">&rsaquo;</span>
                    <span :class="{
                      'text-danger': percProfit(latestfromAmountUsd, latesttoAmountUsd) < 0,
                      'text-success': percProfit(latestfromAmountUsd, latesttoAmountUsd) >= 0
                    }">${{formatAmount(latestfromAmountUsd - latesttoAmountUsd, 'USD')}} ({{percProfit(latestfromAmountUsd, latesttoAmountUsd)}}%)</span>
                    <span class="text-muted mx-2">&rsaquo;</span>
                    <span :class="{
                      'text-danger': (latestfromAmountUsd - latesttoAmountUsd - (order.fromAmountUsd - order.toAmountUsd)) < 0,
                      'text-success': (latestfromAmountUsd - latesttoAmountUsd - (order.fromAmountUsd - order.toAmountUsd)) >= 0
                    }">
                      ${{formatAmount(latestfromAmountUsd - latesttoAmountUsd - (order.fromAmountUsd - order.toAmountUsd), 'USD')}}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Total Tx Fees<br>Agent Paid</td>
                  <td>
                    ${{formatAmount(agentFees, 'USD')}}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Total Tx Fees<br>User Paid</td>
                  <td>
                    ${{formatAmount(userFees, 'USD')}}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Status</td>
                  <td>{{order.status}}</td>
                </tr>
                <tr v-if="order.secretHash">
                  <td class="text-muted text-right small-12">Secret Hash</td>
                  <td>{{formatTxHash(order.secretHash, 'ETH')}}</td>
                </tr>
                <tr v-if="order.fromAddress">
                  <td class="text-muted text-right small-12">User's {{order.from}}<br>address</td>
                  <td>
                    <router-link :to="'/address/' + formatAddress(order.fromAddress, order.from)">
                      {{formatAddress(order.fromAddress, order.from)}}
                    </router-link>
                    <small class="d-block text-muted" v-if="statsByAddresses[order.fromAddress] && statsByAddresses[order.fromAddress].count > 0">
                      {{statsByAddresses[order.fromAddress].count}} {{formatPlural(statsByAddresses[order.fromAddress].count, 'order', 'orders')}} worth ${{formatAmount(statsByAddresses[order.fromAddress]['sum:fromAmountUsd'], 'USD')}}
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
                      {{statsByAddresses[order.toAddress].count}} {{formatPlural(statsByAddresses[order.toAddress].count, 'order', 'orders')}} worth ${{formatAmount(statsByAddresses[order.toAddress]['sum:fromAmountUsd'], 'USD')}}
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
                <tr v-if="order.fromFundHash" :class="{
                  'unconfirmed-tx': isPendingTx(order, 'fromFundHash')
                }">
                  <td class="text-muted text-right small-12">User's {{order.from}}<br>funding transaction</td>
                  <td>
                    <Tx :order="order" type="fromFundHash" />
                  </td>
                </tr>
                <tr v-if="order.fromSecondaryFundHash" :class="{
                  'unconfirmed-tx': isPendingTx(order, 'fromSecondaryFundHash')
                }">
                  <td class="text-muted text-right small-12">User's {{order.from}}<br>secondary funding transaction</td>
                  <td>
                    <Tx :order="order" type="fromSecondaryFundHash" />
                  </td>
                </tr>
                <tr v-if="order.toClaimHash" :class="{
                  'unconfirmed-tx': isPendingTx(order, 'toClaimHash')
                }">
                  <td class="text-muted text-right small-12">User's {{order.to}}<br>claim transaction</td>
                  <td>
                    <Tx :order="order" type="toClaimHash" />
                  </td>
                </tr>
                <tr v-if="order.toFundHash" :class="{
                  'unconfirmed-tx': isPendingTx(order, 'toFundHash')
                }">
                  <td class="text-muted text-right small-12">Agent's {{order.to}}<br>funding transaction</td>
                  <td>
                    <Tx :order="order" type="toFundHash" />
                  </td>
                </tr>
                <tr v-if="order.toSecondaryFundHash" :class="{
                  'unconfirmed-tx': isPendingTx(order, 'toSecondaryFundHash')
                }">
                  <td class="text-muted text-right small-12">Agent's {{order.to}} secondary<br> funding transaction</td>
                  <td>
                    <Tx :order="order" type="toSecondaryFundHash" />
                  </td>
                </tr>
                <tr v-if="order.fromClaimHash" :class="{
                  'unconfirmed-tx': isPendingTx(order, 'fromClaimHash')
                }">
                  <td class="text-muted text-right small-12">Agent's {{order.from}}<br>claim transaction</td>
                  <td>
                    <Tx :order="order" type="fromClaimHash" />
                  </td>
                </tr>
                <tr v-if="order.toRefundHash" :class="{
                  'unconfirmed-tx': isPendingTx(order, 'toRefundHash')
                }">
                  <td class="text-muted text-right small-12">Agent's {{order.to}}<br>refund transaction</td>
                  <td>
                    <Tx :order="order" type="toRefundHash" />
                  </td>
                </tr>
                <tr>
                  <td class="text-muted text-right small-12">Recovery Options</td>
                  <td>
                    <details v-if="order.userAgent === 'wallet'">
                      <summary>Recovery Code</summary>
                      <pre class="mt-3"><code class="p-0">chrome.storage.local.get(['liquality-wallet'], function(result) {
    const missingOrder = {{JSON.stringify(recoveryCode, null, 4)}}
    const data = result['liquality-wallet']

    missingOrder.walletId = data.activeWalletId

    if(!data.history.mainnet) {
      data.history.mainnet = {}
      data.history.mainnet[data.activeWalletId] = []
    }

    data.history.mainnet[data.activeWalletId] = data.history.mainnet[data.activeWalletId]
      .filter(order => order.orderId !== missingOrder.orderId)
    data.history.mainnet[data.activeWalletId].push(missingOrder)

    chrome.storage.local.set({ 'liquality-wallet': data }, function() {
      chrome.runtime.reload()
    })
  })</code></pre>
                    </details>
                    <a v-else :href="recoveryLink" target="_blank" rel="noopener">Recovery Link</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div v-if="auditLogs && auditLogs.length > 0">
          <h2 class="h5 mb-4">Timeline</h2>
          <AuditLog :order="order" :auditLogs="auditLogs" :auditMap="auditMap" :rates="rates" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { min, max } from 'date-fns'

import Tx from '@/components/Order/Tx.vue'
import AuditLog from '@/components/Order/AuditLog.vue'
import format from '@/mixins/format'
import agent from '@/utils/agent'

export default {
  metaInfo () {
    return {
      title: 'Order ' + this.orderId
    }
  },
  components: {
    AuditLog,
    Tx
  },
  mixins: [format],
  data () {
    return {
      order: null,
      auditLogs: null,
      auditMap: null,
      statsByAddresses: {},
      latestfromAmountUsd: null,
      latesttoAmountUsd: null,
      changeInfromAmountUsd: null,
      changeIntoAmountUsd: null,
      rates: null,
      latestMarketRate: null,
      changeInMarketRate: null
    }
  },
  computed: {
    agentFees () {
      let fees = 0

      fees += this.getFeeForTxType('toFundHash')
      fees += this.getFeeForTxType('toSecondaryFundHash')
      fees += this.getFeeForTxType('fromClaimHash')
      fees += this.getFeeForTxType('toRefundHash')

      return fees
    },
    userFees () {
      let fees = 0

      fees += this.getFeeForTxType('fromFundHash')
      fees += this.getFeeForTxType('fromSecondaryFundHash')
      fees += this.getFeeForTxType('toClaimHash')
      fees += this.getFeeForTxType('fromRefundHash')

      return fees
    },
    orderId () {
      return this.$route.params.orderId
    },
    recoveryLink () {
      const { order } = this

      const urlParams = {
        ccy1: order.from.toLowerCase(),
        ccy1v: this.formatUnitToCurrency(order.fromAmount, order.from).toNumber(),
        ccy1Addr: order.fromAddress,
        ccy1CounterPartyAddr: order.fromCounterPartyAddress,

        ccy2: order.to.toLowerCase(),
        ccy2v: this.formatUnitToCurrency(order.toAmount, order.to).toNumber(),
        ccy2Addr: order.toAddress,
        ccy2CounterPartyAddr: order.toCounterPartyAddress,

        aFundHash: order.fromFundHash,
        bFundHash: order.toFundHash,

        secretHash: order.secretHash,
        expiration: order.swapExpiration,
        isPartyB: false
      }

      return `https://liquality.io/swap/#${qs.stringify(urlParams)}`
    },
    recoveryCode () {
      const { order } = this

      return {
        id: order.orderId,
        orderId: order.orderId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        agent: 'https://liquality.io/swap/agent',
        auto: false,

        expiresAt: order.expiresAt,

        from: order.from,
        to: order.to,

        fromAddress: order.fromAddress,
        toAddress: order.toAddress,

        fromCounterPartyAddress: order.fromCounterPartyAddress,
        toCounterPartyAddress: order.toCounterPartyAddress,

        rate: order.rate,
        fromAmount: order.fromAmount,
        toAmount: order.toAmount,

        fromFundHash: order.fromFundHash,
        secretHash: order.secretHash,

        minConf: order.minConf,
        network: 'mainnet',
        swapExpiration: order.swapExpiration,
        nodeSwapExpiration: order.nodeSwapExpiration,
        sendTo: null,
        startTime: (new Date(order.createdAt)).getTime() - 10000,
        status: 'GET_REFUND',
        type: 'SWAP',
        userAgent: 'wallet',
        waitingForLock: false
      }
    }
  },
  methods: {
    isPendingTx (order, type) {
      const hash = order[type]

      if (!hash) return true
      if (!order.txMap[hash]) return true
      if (!order.txMap) return true
      if (!order.txMap[hash].blockHash) return true

      return false
    },
    percProfit (from, to) {
      return Math.ceil(((from - to) / from) * 10000) / 100
    },
    getFeeForTxType (type) {
      const tx = this.order[type]

      if (tx && this.order.txMap) {
        const obj = this.order.txMap[tx]
        if (obj) return obj.feeAmountUsd
      }

      return 0
    }
  },
  async created () {
    const { data } = await agent.get(`/api/swap/order/${this.orderId}`, {
      params: {
        verbose: true
      }
    })

    const auditMap = {}
    const timestampSet = new Set()

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

      timestampSet.add(auditMap[key].start.getTime())
      timestampSet.add(auditMap[key].end.getTime())

      auditMap[key].count++

      return audit
    })

    this.auditLogs = auditLogs.filter(audit => this.isEqual(this.parseISO(auditMap[audit.key].start), new Date(audit.createdAt)))
    this.auditMap = auditMap
    this.order = data

    const addresses = new Set([data.toAddress, data.fromAddress].filter(a => !!a))

    const statsByAddresses = await Promise.all([...addresses].map(
      address => agent.get('/api/dash/statsByAddress', { params: { address } }).then(response => response.data)
    ))

    this.statsByAddresses = statsByAddresses.reduce((acc, obj) => {
      acc[obj.address] = obj.result
      return acc
    }, {})

    const latestTimeStamp = auditLogs.length > 0
      ? Object.entries(auditMap).sort((a, b) => b[1].end - a[1].end)[0][1].end
      : (data.updatedAt || data.createdAt)

    if (latestTimeStamp) {
      const timestamp = new Date(latestTimeStamp).getTime()

      const markets = [`${data.from}-USD`, `${data.to}-USD`, `${data.from}-${data.to}`].map(market => {
        return agent.get('/api/dash/rate', { params: { market, timestamp } })
          .then(response => response.data.result)
      })

      const [fromUsdRate, toUsdRate, marketRate] = await Promise.all(markets)

      this.latestfromAmountUsd = this.formatUnitToCurrency(data.fromAmount, data.from) * fromUsdRate
      this.changeInfromAmountUsd = Math.ceil(((this.latestfromAmountUsd - data.fromAmountUsd) / data.fromAmountUsd) * 10000) / 100

      this.latesttoAmountUsd = this.formatUnitToCurrency(data.toAmount, data.to) * toUsdRate
      this.changeIntoAmountUsd = Math.ceil(((this.latesttoAmountUsd - data.toAmountUsd) / data.toAmountUsd) * 10000) / 100

      this.latestMarketRate = marketRate
      this.changeInMarketRate = Math.ceil(((marketRate - data.rate) / data.rate) * 10000) / 100
    }

    const rates = await Promise.all([...timestampSet].map(
      timestamp => agent.get('/api/dash/rate', { params: { market: `${data.from}-${data.to}`, timestamp } }
      ).then(response => ({ timestamp, rate: response.data.result }))
    ))

    this.rates = rates.reduce((acc, { timestamp, rate }) => {
      acc[timestamp] = rate
      return acc
    }, {})
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
