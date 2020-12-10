import { formatDistance, formatDistanceStrict, format, isEqual, parseISO as parseISOMain } from 'date-fns'
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
  WBTC: 6,
  UNI: 6
}

function parseISO (value) {
  if (value instanceof Date) return value
  return parseISOMain(value)
}

const EXPLORER_MAP = {
  BTC: {
    tx: 'https://blockstream.info/tx/',
    address: 'https://blockstream.info/address/',
    block: 'https://blockstream.info/block/',
    formatter: value => value
  },
  ETH: {
    tx: 'https://etherscan.io/tx/',
    address: 'https://etherscan.io/address/',
    block: 'https://etherscan.io/block/',
    formatter: value => value.startsWith('0x') ? value : `0x${value}`
  }
}

export default {
  methods: {
    isEqual (a, b) {
      return isEqual(parseISO(a), parseISO(b))
    },
    parseISO,
    formatUnitToCurrency (value, asset) {
      return cryptoassets[asset].unitToCurrency(value)
    },
    formatAssetValue (value, asset, trim = false) {
      if (trim) {
        const prettyAmount = BN(value).dp(DP_PRETTY_MAP[asset], BN.ROUND_FLOOR)
        const [n, d] = String(prettyAmount).split('.')
        return coinFormatter.format(Number(n)) + (d ? `.${d}` : '')
      }

      return value
    },
    formatAmount (value, asset, trim = false) {
      if (asset === 'USD') {
        const amount = usdFormatter.format(value)

        const [n, d] = String(amount).split('.')
        return n + ((d && d !== '00') ? `.${d}` : '')
      }

      const amount = cryptoassets[asset].unitToCurrency(value)

      if (trim) {
        const prettyAmount = BN(amount).dp(DP_PRETTY_MAP[asset], BN.ROUND_FLOOR)
        const [n, d] = String(prettyAmount).split('.')
        return coinFormatter.format(Number(n)) + (d ? `.${d}` : '')
      }

      return amount
    },
    formatDuration (value, ref = new Date(), suffix = true) {
      return formatDistance(parseISO(value), parseISO(ref), {
        addSuffix: suffix
      })
    },
    formatDurationStrict (value, ref = new Date(), suffix = true) {
      return formatDistanceStrict(parseISO(value), parseISO(ref), {
        addSuffix: suffix
      })
    },
    formatDate (value) {
      return format(parseISO(value), 'd MMM yyyy p')
    },
    formatAddress (address, asset) {
      return cryptoassets[asset].formatAddress(address)
    },
    formatTxHash (txHash, asset) {
      const obj = EXPLORER_MAP[asset] || EXPLORER_MAP.ETH
      return obj.formatter(txHash)
    },
    formatTxHashLink (txHash, asset) {
      const obj = EXPLORER_MAP[asset] || EXPLORER_MAP.ETH
      return obj.tx + obj.formatter(txHash)
    },
    formatBlockLink (block, asset) {
      const obj = EXPLORER_MAP[asset] || EXPLORER_MAP.ETH
      return obj.block + obj.formatter(block)
    },
    formatPlural (number, singular, plural) {
      return number === 1 ? singular : plural
    }
  }
}
