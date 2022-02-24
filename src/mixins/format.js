import { isFuture, formatDistance, formatDistanceStrict, format, isEqual, parseISO as parseISOMain } from 'date-fns'
import { assets, chains, unitToCurrency } from '@liquality/cryptoassets'
import BN from 'bignumber.js'

const usdFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2
})
const coinFormatter = new Intl.NumberFormat('en-US')

function parseISO(value) {
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
    formatter: value => (value.startsWith('0x') ? value : `0x${value}`)
  },
  MATIC: {
    tx: 'https://polygonscan.com/tx/',
    address: 'https://polygonscan.com/address/',
    block: 'https://polygonscan.com/block/',
    formatter: value => (value.startsWith('0x') ? value : `0x${value}`)
  },
  RBTC: {
    tx: 'https://explorer.rsk.co/tx/',
    address: 'https://explorer.rsk.co/address/',
    block: 'https://explorer.rsk.co/blocks/',
    formatter: value => (value.startsWith('0x') ? value : `0x${value}`)
  }
}

export default {
  methods: {
    calculatePerc(a, b) {
      return Math.ceil(((a - b) / b) * 10000) / 100
    },
    isEqual(a, b) {
      return isEqual(parseISO(a), parseISO(b))
    },
    parseISO,
    formatUnitToCurrency(value, asset) {
      return unitToCurrency(assets[asset], value)
    },
    formatAssetValue(value, asset, trim = false) {
      if (trim) {
        const prettyAmount = BN(value).dp(6, BN.ROUND_FLOOR)
        const [n, d] = String(prettyAmount).split('.')
        return coinFormatter.format(Number(n)) + (d ? `.${d}` : '')
      }

      return value
    },
    formatAmount(value, asset, trim = false) {
      if (asset === 'USD') {
        const amount = usdFormatter.format(value)

        const [n, d] = String(amount).split('.')
        return n + (d && d !== '00' ? `.${d}` : '')
      }

      const amount = unitToCurrency(assets[asset], value)

      if (trim) {
        const prettyAmount = BN(amount).dp(6, BN.ROUND_FLOOR)
        const [n, d] = String(prettyAmount).split('.')
        return coinFormatter.format(Number(n)) + (d ? `.${d}` : '')
      }

      return amount
    },
    formatDuration(value, ref = new Date(), suffix = true) {
      return formatDistance(parseISO(value), parseISO(ref), {
        addSuffix: suffix
      })
    },
    formatDurationStrict(value, ref = new Date(), suffix = true) {
      return formatDistanceStrict(parseISO(value), parseISO(ref), {
        addSuffix: suffix
      })
    },
    isFuture,
    formatDate(value) {
      return format(parseISO(value), 'd MMM yyyy p')
    },
    formatAddress(address, asset) {
      return chains[assets[asset].chain].formatAddress(address)
    },
    formatTxHash(txHash, asset) {
      const obj = EXPLORER_MAP[asset] || EXPLORER_MAP.ETH
      return obj.formatter(txHash)
    },
    formatTxHashLink(txHash, asset) {
      const obj = EXPLORER_MAP[asset] || EXPLORER_MAP.ETH
      return obj.tx + obj.formatter(txHash)
    },
    formatBlockLink(block, asset) {
      const obj = EXPLORER_MAP[asset] || EXPLORER_MAP.ETH
      return obj.block + obj.formatter(block)
    },
    formatAddressLink(address, asset) {
      const obj = EXPLORER_MAP[asset] || EXPLORER_MAP.ETH
      return obj.address + obj.formatter(address)
    },
    formatPlural(number, singular, plural) {
      return number === 1 ? singular : plural
    }
  }
}
