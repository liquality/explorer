<template>
<span>
  <a :href="formatTxHashLink(hash, asset)" target="_blank" rel="noopener">{{formatTxHash(hash, asset)}}</a>
  <small class="d-block text-muted" v-if="txObject">
    Fee ${{formatAmount(txObject.feeAmountUsd, 'USD')}}
    &bull;
    {{txObject.feePrice}} {{feeUnit}}
    <span v-if="txObject.blockHash">
      &bull;
      <a :href="formatBlockLink(txObject.blockHash, asset)" target="_blank" rel="noopener" class="text-muted">
        Block #{{formatAmount(txObject.blockNumber, 'USD')}}
      </a>
    </span>
  </small>
</span>
</template>

<script>
import { assets, chains } from '@liquality/cryptoassets'
import format from '@/mixins/format'

export default {
  mixins: [format],
  props: {
    order: Object,
    type: String
  },
  computed: {
    hash () {
      return this.order[this.type]
    },
    asset () {
      const side = this.type.match(/^from|^to/)
      if (!side) throw new Error(`Invalid tx type: ${this.type}`)
      return this.order[side[0]]
    },
    txObject () {
      if (!this.order.txMap) return
      return this.order.txMap[this.hash]
    },
    feeUnit () {
      return chains[assets[this.asset].chain].fees.unit
    }
  }
}
</script>
