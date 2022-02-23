<template>
  <div class="row">
    <div class="col-md-8">
      <h1 class="h4 mb-1">
        Order
        <span v-if="backgroundLoading">...</span>
      </h1>
      <p class="lead font-weight-light text-muted">
        {{orderId}}
      </p>
      <div v-if="user">
        <div class="card mb-3" v-if="showTable && noFlags">
          <div class="card-body">
            <form @submit.prevent="approveReject" class="form-inline">
              <label class="mr-2">Approve/Reject</label>
              <select class="form-control mr-2" v-model="action" :disabled="loading" required>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
              <select class="form-control mr-2" v-model="type" :disabled="loading">
                <option value="reciprocate-init-swap">Reciprocate Swap</option>
              </select>
              <input type="text" class="form-control mr-2" placeholder="Message" v-model="message" required :disabled="loading">
              <button type="submit" class="btn btn-primary" :disabled="loading">Update</button>
            </form>
          </div>
        </div>
        <div class="card mb-3">
          <div class="card-body">
            <form @submit.prevent="orderRetryNow" class="form-inline">
              <label class="mr-2">Retry</label>
              <select class="form-control mr-2" v-model="retryJobName" :disabled="loading" required>
                <option value="verify-user-init-tx">verify-user-init-tx</option>
                <option value="reciprocate-init-swap">reciprocate-init-swap</option>
                <option value="fund-swap">fund-swap</option>
                <option value="find-claim-tx-or-refund">find-claim-tx-or-refund</option>
                <option value="agent-claim">agent-claim</option>
              </select>
              <button type="submit" class="btn btn-primary" :disabled="loading">Submit</button>
            </form>
          </div>
        </div>
        <div class="card mb-3">
          <div class="card-body">
            <form @submit.prevent="orderIgnoreNow" class="form-inline">
              <label class="mr-2">Ignore</label>
              <input type="checkbox" id="ignoreSetQuoteExpired" v-model="ignoreSetQuoteExpired" class="form-check-input">
              <label for="ignoreSetQuoteExpired" class="mr-2">Mark as expired</label>
              <button type="submit" class="btn btn-primary" :disabled="loading">Submit</button>
            </form>
          </div>
        </div>
      </div>
      <div class="card border-top-0 mb-3">
        <div class="table-responsive">
          <table class="table bg-white m-0 table-order-details">
            <LoadingTableBody :trCount="20" :tdCount="2" v-if="!order" />
            <tbody class="font-weight-normal" v-else>
              <tr>
                <td class="text-muted text-right small-12">User Agent</td>
                <td>{{order.userAgent || 'UI'}}</td>
              </tr>
              <tr>
                <td class="text-muted text-right small-12">
                  Quote
                  <span v-if="isFuture(new Date(order.expiresAt))">Expires</span>
                  <span v-else>Expired</span>
                </td>
                <td>{{formatDurationStrict(new Date(order.expiresAt))}}</td>
              </tr>
              <tr>
                <td class="text-muted text-right small-12">
                  Swap
                  <span v-if="isFuture(new Date(order.swapExpiration * 1000))">Expires</span>
                  <span v-else>Expired</span>
                </td>
                <td>{{formatDurationStrict(new Date(order.swapExpiration * 1000))}}</td>
              </tr>
              <tr>
                <td class="text-muted text-right small-12">
                  Node Swap
                  <span v-if="isFuture(new Date(order.nodeSwapExpiration * 1000))">Expires</span>
                  <span v-else>Expired</span>
                </td>
                <td>{{formatDurationStrict(new Date(order.nodeSwapExpiration * 1000))}}</td>
              </tr>
              <tr>
                <td class="text-muted text-right small-12">Amount</td>
                <td>
                  {{formatAmount(order.fromAmount, order.from, true)}} {{order.from}}
                  <span class="font-weight-bold text-muted mx-1">&rsaquo;</span>
                  {{formatAmount(order.toAmount, order.to, true)}} {{order.to}}
                </td>
              </tr>
              <tr v-if="!isNaN(order.spread)">
                <td class="text-muted text-right small-12">Spread</td>
                <td>{{order.spread * 100}}%</td>
              </tr>
              <tr>
                <td class="text-muted text-right small-12">Net P&amp;L</td>
                <td :class="{
                  'text-danger': ((order.fromAmountUsd - order.totalAgentFeeUsd) - order.toAmountUsd) < 0,
                  'text-success': ((order.fromAmountUsd - order.totalAgentFeeUsd) - order.toAmountUsd) >= 0
                }">
                  ${{formatAmount((order.fromAmountUsd - order.totalAgentFeeUsd) - order.toAmountUsd, 'USD')}}
                  ({{percProfit(order.fromAmountUsd - order.totalAgentFeeUsd, order.toAmountUsd)}}%)
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
                <td class="text-muted text-right small-12">Cost of Swap</td>
                <td>
                  ${{formatAmount(order.totalFeeUsd, 'USD')}} <span class="text-muted">(Agent: ${{formatAmount(order.totalAgentFeeUsd, 'USD')}}, User: ${{formatAmount(order.totalUserFeeUsd, 'USD')}})</span>
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
                  <a :href="formatAddressLink(order.fromAddress, order.from)" target="_blank" rel="noopener">{{formatAddress(order.fromAddress, order.from)}}</a>
                  <router-link :to="'/address/' + formatAddress(order.fromAddress, order.from)" class="d-block text-muted small" v-if="statsByAddresses[order.fromAddress] && statsByAddresses[order.fromAddress].count > 0">
                    {{statsByAddresses[order.fromAddress].count}} {{formatPlural(statsByAddresses[order.fromAddress].count, 'order', 'orders')}} worth ${{formatAmount(statsByAddresses[order.fromAddress]['sum:fromAmountUsd'], 'USD')}}
                  </router-link>
                </td>
              </tr>
              <tr v-if="order.toAddress">
                <td class="text-muted text-right small-12">User's {{order.to}}<br>address</td>
                <td>
                  <a :href="formatAddressLink(order.toAddress, order.to)" target="_blank" rel="noopener">{{formatAddress(order.toAddress, order.to)}}</a>
                  <router-link :to="'/address/' + formatAddress(order.toAddress, order.to)" class="d-block text-muted small" v-if="order.fromAddress !== order.toAddress && statsByAddresses[order.toAddress] && statsByAddresses[order.toAddress].count > 0">
                    {{statsByAddresses[order.toAddress].count}} {{formatPlural(statsByAddresses[order.toAddress].count, 'order', 'orders')}} worth ${{formatAmount(statsByAddresses[order.toAddress]['sum:fromAmountUsd'], 'USD')}}
                  </router-link>
                </td>
              </tr>
              <tr v-if="order.fromCounterPartyAddress">
                <td class="text-muted text-right small-12">Agent's {{order.from}}<br>address</td>
                <td>
                  <a :href="formatAddressLink(order.fromCounterPartyAddress, order.from)" target="_blank" rel="noopener">
                    {{formatAddress(order.fromCounterPartyAddress, order.from)}}
                  </a>
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
              <tr v-if="order.fromRefundHash" :class="{
                'unconfirmed-tx': isPendingTx(order, 'fromRefundHash')
              }">
                <td class="text-muted text-right small-12">User's {{order.from}}<br>refund transaction</td>
                <td>
                  <Tx :order="order" type="fromRefundHash" />
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

      <div v-if="order" class="mb-5">
        <div class="card border-top-0 mb-3" v-for="(job, index) in order.job_data" :key="index">
          <div class="table-responsive">
            <table class="table bg-white m-0 table-order-details">
              <tbody class="font-weight-normal">
                <tr>
                  <td class="text-muted text-right small-12">Job</td>
                  <td>{{job.name}}</td>
                </tr>
                <tr v-if="job.failReason">
                  <td class="text-right small-12 text-danger">Error</td>
                  <td>
                    <pre class="text-danger mb-0"><code>{{job.failReason}}</code></pre>
                  </td>
                </tr>
                <tr v-if="job.failReason">
                  <td class="text-right small-12 text-danger">Failed At</td>
                  <td class="text-danger">
                    <span>{{formatDate(job.failedAt)}}</span>
                    <span class="ml-2">({{formatDurationStrict(job.failedAt)}})</span>
                  </td>
                </tr>
                <tr v-if="job.failReason">
                  <td class="text-right small-12 text-danger">Fail Count</td>
                  <td class="text-danger">
                    {{job.failCount}}
                  </td>
                </tr>
                <tr v-if="job.lastFinishedAt">
                  <td class="text-right small-12 text-muted">Last Finished At</td>
                  <td>
                    <span>{{formatDate(job.lastFinishedAt)}}</span>
                    <span class="text-muted ml-2">({{formatDurationStrict(job.lastFinishedAt)}})</span>
                  </td>
                </tr>
                <tr v-if="job.lastRunAt">
                  <td class="text-right small-12 text-muted">Last Run At</td>
                  <td>
                    <span>{{formatDate(job.lastRunAt)}}</span>
                    <span class="text-muted ml-2">({{formatDurationStrict(job.lastRunAt)}})</span>
                  </td>
                </tr>
                <tr v-if="job.nextRunAt">
                  <td class="text-right small-12 text-muted">Next Run At</td>
                  <td>
                    <span>{{formatDate(job.nextRunAt)}}</span>
                    <span class="text-muted ml-2">({{formatDurationStrict(job.nextRunAt)}})</span>
                  </td>
                </tr>
                <tr v-if="job.lockedAt">
                  <td class="text-right small-12 text-muted">Locked At</td>
                  <td>
                    <span>{{formatDate(job.lockedAt)}}</span>
                    <span class="text-muted ml-2">({{formatDurationStrict(job.lockedAt)}})</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4" v-if="auditLogs && auditLogs.length > 0">
      <h2 class="h5 mb-4">Timeline</h2>
      <AuditLog :order="order" :auditLogs="auditLogs" :auditMap="auditMap" :rates="rates" />
    </div>
  </div>
</template>

<script>
import Bluebird from 'bluebird'
import { mapState, mapActions } from 'vuex'
import qs from 'qs'
import { min, max } from 'date-fns'

import Tx from '@/components/Order/Tx.vue'
import AuditLog from '@/components/Order/AuditLog.vue'
import format from '@/mixins/format'
import agent from '@/utils/agent'
import LoadingTableBody from '../components/LoadingTableBody.vue'

export default {
  metaInfo () {
    return {
      title: 'Order ' + this.orderId
    }
  },
  components: {
    AuditLog,
    Tx,
    LoadingTableBody
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
      changeInMarketRate: null,

      check: null,
      action: 'reject',
      type: null,
      message: null,
      loading: false,
      backgroundLoading: false,

      retryJobName: null,
      ignoreSetQuoteExpired: null
    }
  },
  created () {
    this.fetchOrderPeriodically()
  },
  computed: {
    ...mapState(['user']),
    showTable () {
      if (!this.order) return false
      return !['SWAP_EXPIRED', 'QUOTE_EXPIRED', 'AGENT_REFUNDED', 'AGENT_CLAIMED', 'USER_CLAIMED', 'AGENT_FUNDED'].includes(this.order.status)
    },
    noFlags () {
      const check = (this.check || {}).flags || {}
      return Object.keys(check).length === 0
    },
    orderId () {
      return this.$route.params.orderId
    },
    recoveryLink () {
      const { order } = this

      const urlParams = {
        ccy1: order.from,
        ccy1v: this.formatUnitToCurrency(order.fromAmount, order.from).toNumber(),
        ccy1Addr: order.fromAddress,
        ccy1CounterPartyAddr: order.fromCounterPartyAddress,

        ccy2: order.to,
        ccy2v: this.formatUnitToCurrency(order.toAmount, order.to).toNumber(),
        ccy2Addr: order.toAddress,
        ccy2CounterPartyAddr: order.toCounterPartyAddress,

        aInitiationHash: order.fromFundHash,
        bInitiationHash: order.toFundHash,

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
    ...mapActions(['checkOrder', 'updateOrder', 'orderRetry', 'orderIgnore']),
    async approveReject () {
      this.loading = true

      await this.updateOrder({
        orderId: this.order.orderId,
        type: this.type,
        message: this.message,
        action: this.action
      })

      this.check = await this.checkOrder({ orderId: this.orderId })

      this.loading = false
    },
    async orderRetryNow () {
      this.loading = true

      await this.orderRetry({
        orderId: this.order.orderId,
        jobName: this.retryJobName
      })

      this.loading = false
    },
    async orderIgnoreNow () {
      this.loading = true

      await this.orderIgnore({
        orderId: this.order.orderId,
        setQuoteExpired: this.ignoreSetQuoteExpired
      })

      this.loading = false
    },
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
    async fetchOrderPeriodically (periodic) {
      clearTimeout(this.fetchTimeout)

      if (periodic) {
        this.backgroundLoading = true
      }

      await this.fetchOrder()

      this.backgroundLoading = false

      this.fetchTimeout = setTimeout(this.fetchOrderPeriodically, 2500, true)
    },
    async fetchOrder () {
      const { data } = await agent.get(`/api/swap/order/${this.orderId}`, {
        params: {
          verbose: true
        }
      })

      if (this.user) {
        this.check = await this.checkOrder({ orderId: this.orderId })
      }

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

      const rates = await Bluebird.map(
        [...timestampSet],
        timestamp => agent.get(
          '/api/dash/rate',
          { params: { market: `${data.from}-${data.to}`, timestamp } }
        ).then(response => ({ timestamp, rate: response.data.result })), { concurrency: 2 })

      this.rates = rates.reduce((acc, { timestamp, rate }) => {
        acc[timestamp] = rate
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
.table-order-details {
  td {
    vertical-align: middle;
  }

  tr > td:first-child {
    width: 1%;
    white-space: nowrap;
    text-align: left;
  }

  .loading-table {
    tr > td:first-child {
      width: 20%;
    }
  }
}
</style>
