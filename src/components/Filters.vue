<template>
  <div class="toolbar">
    <nav class="nav flex-column mb-3">
      <span class="nav-link small">Pending Txs</span>
      <span :class="{
        'nav-link': true,
        active: pending.includes('USER')
      }" @click="setPending('USER')">Agent</span>
      <span :class="{
        'nav-link d-flex align-items-center': true,
        active: pending.includes('AGENT')
      }" @click="setPending('AGENT')">User</span>
    </nav>

    <nav class="nav flex-column mb-3">
      <span class="nav-link small">User</span>
      <span :class="{
        'nav-link': true,
        active: status.includes('USER_FUNDED')
      }" @click="setStatus('USER_FUNDED')">Funded</span>
      <span :class="{
        'nav-link d-flex align-items-center': true,
        active: status.includes('USER_FUNDED_UNVERIFIED')
      }" @click="setStatus('USER_FUNDED_UNVERIFIED')">Funded <sup class="ml-2 text-muted">Pending</sup></span>
      <span :class="{
        'nav-link': true,
        active: status.includes('USER_CLAIMED')
      }" @click="setStatus('USER_CLAIMED')">Claimed</span>
    </nav>

    <nav class="nav flex-column mb-3">
      <span class="nav-link small">Agent</span>
      <span :class="{
        'nav-link': true,
        active: status.includes('AGENT_FUNDED')
      }" @click="setStatus('AGENT_FUNDED')">Funded</span>
      <span :class="{
        'nav-link': true,
        active: status.includes('AGENT_CLAIMED')
      }" @click="setStatus('AGENT_CLAIMED')">Claimed</span>
      <span :class="{
        'nav-link': true,
        active: status.includes('AGENT_REFUNDED')
      }" @click="setStatus('AGENT_REFUNDED')">Refunded</span>
      <span :class="{
        'nav-link': true,
        active: status.includes('SWAP_EXPIRED')
      }" @click="setStatus('SWAP_EXPIRED')">Swap Expired</span>
    </nav>

    <nav class="nav flex-column mb-3">
      <span class="nav-link small">User Agent</span>
      <span :class="{
        'nav-link': true,
        active: userAgent.includes('WALLET')
      }" @click="setUserAgent('WALLET')">Wallet</span>
      <span :class="{
        'nav-link': true,
        active: userAgent.includes('UI')
      }" @click="setUserAgent('UI')">UI</span>
    </nav>

    <nav class="nav flex-column mb-3">
      <span class="nav-link small">From</span>
      <span
        v-for="market in markets" :key="market"
        :class="{
          'nav-link': true,
          active: fromMarkets.includes(market)
        }" @click="setMarket(market, 'from')">{{market}}</span>
    </nav>

    <nav class="nav flex-column mb-3">
      <span class="nav-link small">To</span>
      <span
        v-for="market in markets" :key="market"
        :class="{
          'nav-link': true,
          active: toMarkets.includes(market)
        }" @click="setMarket(market, 'to')">{{market}}</span>
    </nav>
  </div>
</template>

<script>
import agent from '@/utils/agent'

export default {
  data () {
    return {
      pending: [],
      status: [
        'USER_FUNDED',
        'USER_FUNDED_UNVERIFIED',
        'USER_CLAIMED',
        'AGENT_CLAIMED',
        'AGENT_FUNDED',
        'AGENT_CLAIMED',
        'AGENT_REFUNDED',
        'SWAP_EXPIRED'
      ],
      userAgent: [
        'WALLET',
        'UI'
      ],
      fromMarkets: [],
      toMarkets: [],
      markets: []
    }
  },
  async created () {
    const { data } = await agent.get('/api/swap/assetinfo')

    this.markets = data.map(data => data.code)
    this.fromMarkets = [...this.markets]
    this.toMarkets = [...this.markets]
  },
  methods: {
    safeEmit () {
      this.$emit('update', { status: this.status, from: this.fromMarkets, to: this.toMarkets, userAgent: this.userAgent, pending: this.pending })
    },
    setStatus (status) {
      if (this.status.includes(status)) {
        if (this.status.length > 1) {
          this.status = this.status.filter(s => status !== s)
        }
      } else {
        this.status.push(status)
      }
    },
    setPending (pending) {
      if (this.pending.includes(pending)) {
        this.pending = this.pending.filter(s => pending !== s)
      } else {
        this.pending.push(pending)
      }
    },
    setUserAgent (userAgent) {
      if (this.userAgent.includes(userAgent)) {
        if (this.userAgent.length > 1) {
          this.userAgent = this.userAgent.filter(s => userAgent !== s)
        }
      } else {
        this.userAgent.push(userAgent)
      }
    },
    setMarket (market, direction) {
      const ref = direction === 'from' ? this.fromMarkets : this.toMarkets

      if (ref.includes(market)) {
        if (ref.length > 1) {
          this[`${direction}Markets`] = ref.filter(s => market !== s)
        }
      } else {
        ref.push(market)
      }
    }
  },
  watch: {
    status: 'safeEmit',
    pending: 'safeEmit',
    fromMarkets: 'safeEmit',
    toMarkets: 'safeEmit',
    userAgent: 'safeEmit'
  }
}
</script>

<style lang="scss">
.toolbar {
  .nav-link.small {
    text-transform: uppercase;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    @extend .text-muted;

    &:not(.small) {
      cursor: pointer;
    }

    &.active {
      color: $primary!important;
      background-color: transparent!important;
      font-weight: 500;

      &:after {
        display: inline;
        content: '✓';
        margin-left: 5px;
        font-size: 90%;
      }
    }
  }
}
</style>
