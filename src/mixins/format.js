import { formatDistance, formatDistanceStrict, format } from 'date-fns'
import cryptoassets from '@liquality/cryptoassets'
import BN from 'bignumber.js'

const usdFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const coinFormatter = new Intl.NumberFormat('en-US')

const DP_PRETTY_MAP = {
  BTC: 6,
  ETH: 6,
  DAI: 6,
  USDC: 6,
  USDT: 6,
  WBTC: 6
}

const EXPLORER_MAP = {
  btc: {
    tx: 'https://blockstream.info/tx/',
    address: 'https://blockstream.info/address/',
    block: 'https://blockstream.info/block/',
    formatter: value => value
  },
  eth: {
    tx: 'https://etherscan.io/tx/',
    address: 'https://etherscan.io/address/',
    block: 'https://etherscan.io/block/',
    formatter: value => value.startsWith('0x') ? value : `0x${value}`
  }
}

export default {
  methods: {
    formatUnitToCurrency (value, asset) {
      asset = asset.toLowerCase()

      return cryptoassets[asset].unitToCurrency(value)
    },
    formatAmount (value, asset, trim = false) {
      asset = asset.toLowerCase()

      if (asset === 'usd') {
        const amount = usdFormatter.format(value)

        const [n, d] = String(amount).split('.')
        return n + ((d && d !== '00') ? `.${d}` : '')
      }

      const amount = cryptoassets[asset].unitToCurrency(value)

      if (trim) {
        const prettyAmount = BN(amount).dp(DP_PRETTY_MAP[asset.toUpperCase()], BN.ROUND_FLOOR)
        const [n, d] = String(prettyAmount).split('.')
        return coinFormatter.format(Number(n)) + (d ? `.${d}` : '')
      }

      return amount
    },
    formatDuration (value, ref = new Date(), suffix = true) {
      return formatDistance(new Date(value), ref, {
        addSuffix: suffix
      })
    },
    formatDurationStrict (value, ref = new Date(), suffix = true) {
      return formatDistanceStrict(new Date(value), ref, {
        addSuffix: suffix
      })
    },
    formatDate (value) {
      return format(new Date(value), 'd MMM yyyy p')
    },
    formatAddress (address, asset) {
      return cryptoassets[asset.toLowerCase()].formatAddress(address)
    },
    formatTxHash (txHash, asset) {
      const obj = EXPLORER_MAP[asset.toLowerCase()] || EXPLORER_MAP.eth
      return obj.formatter(txHash)
    },
    formatTxHashLink (txHash, asset) {
      const obj = EXPLORER_MAP[asset.toLowerCase()] || EXPLORER_MAP.eth
      return obj.tx + obj.formatter(txHash)
    },
    formatPlural (number, singular, plural) {
      return number === 1 ? singular : plural
    }
  }
}
