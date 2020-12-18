<template>
  <div>
    <div class="row pb-4 justify-content-center">
      <div class="col-md-4">
        <VueCtkDateTimePicker
          v-model="date"
          range
          formatted="D MMM YYYY"
          label="Select date range"
          color="#334E68"
          buttonColor="#334E68"
          :customShortcuts="[
            { key: 'today', label: 'Today', value: 'day' },
            { key: 'yesterday', label: 'Yesterday', value: '-day' },
            { key: 'thisWeek', label: 'This week', value: 'isoWeek' },
            { key: 'lastWeek', label: 'Last week', value: '-isoWeek' },
            { key: 'last7Days', label: 'Last 7 days', value: 7 },
            { key: 'last30Days', label: 'Last 30 days', value: 30 },
            { key: 'thisMonth', label: 'This month', value: 'month' },
            { key: 'lastMonth', label: 'Last month', value: '-month' },
            { key: 'thisYear', label: 'This year', value: 'year' },
            { key: 'lastYear', label: 'Last year', value: '-year' }
          ]"
          @validate="fillData" />
      </div>
    </div>
    <div class="row justify-content-center mb-4">
      <div class="col-md-3 mb-3">
        <div class="card">
          <LoadingCardBody v-if="!summary || loading" />
          <SummaryCard v-else heading="Incoming Volume" :summary="summary" type="sum:fromAmountUsd" />
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card">
          <LoadingCardBody v-if="!summary || loading" />
          <SummaryCard v-else heading="Number of Swaps" :summary="summary" type="count" :plain="true" />
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card">
          <LoadingCardBody v-if="!summary || loading" />
          <SummaryCard v-else heading="Average Value" :summary="summary" type="average:fromAmountUsd" />
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card">
          <LoadingCardBody v-if="!summary || loading" />
          <SummaryCard v-else heading="Tx Fee" :summary="summary" type="sum:totalAgentFeeUsd" />
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card">
          <LoadingCardBody v-if="!summary || loading" />
          <SummaryCard v-else heading="Profit/Loss" :summary="summary" type="sum:totalFromToAmountUsdDiffWithFees" />
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card">
          <LoadingCardBody v-if="!summary || loading" />
          <SummaryCard v-else heading="Wallet Volume" :summary="summary" type="wallet:sum:fromAmountUsd" />
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card">
          <LoadingCardBody v-if="!summary || loading" />
          <SummaryCard v-else heading="UI Volume" :summary="summary" type="ui:sum:fromAmountUsd" />
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card mb-4">
          <LoadingChart v-if="!lineCharts || loading" />
          <div class="card-body" v-else>
            <h2 class="h6 mb-4 font-weight-light text-muted">Incoming Volume</h2>
            <LineChart :chartData="lineCharts['sum:fromAmountUsd'].data" :compareLabels="lineCharts['sum:fromAmountUsd'].compareLabels" :height="300" :usd="true" />
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card mb-4">
          <LoadingChart v-if="!lineCharts || loading" />
          <div class="card-body" v-else>
            <h2 class="h6 mb-4 font-weight-light text-muted">Number of Swaps</h2>
            <LineChart :chartData="lineCharts['count'].data" :compareLabels="lineCharts['count'].compareLabels" :height="300" />
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card mb-4">
          <LoadingChart v-if="!lineCharts || loading" />
          <div class="card-body" v-else>
            <h2 class="h6 mb-4 font-weight-light text-muted">Profit/Loss</h2>
            <LineChart :chartData="lineCharts['sum:totalFromToAmountUsdDiffWithFees'].data" :compareLabels="lineCharts['sum:totalFromToAmountUsdDiffWithFees'].compareLabels" :height="300" :usd="true" />
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card mb-4">
          <LoadingChart v-if="!lineCharts || loading" />
          <div class="card-body" v-else>
            <h2 class="h6 mb-4 font-weight-light text-muted">Tx Fees</h2>
            <LineChart :chartData="lineCharts['sum:totalAgentFeeUsd'].data" :compareLabels="lineCharts['sum:totalAgentFeeUsd'].compareLabels" :height="300" :usd="true" />
          </div>
        </div>
      </div>
      <div class="col-md-6" v-if="topMarketsByVolumeChart">
        <div class="card">
          <LoadingChart v-if="!lineCharts || loading" />
          <div class="card-body" v-else>
            <h2 class="h6 mb-4 font-weight-light text-muted">Top 5 Markets By Incoming Volume</h2>
            <BarChart :chartData="topMarketsByVolumeChart" :height="300" key="marketChart" />
          </div>
        </div>
      </div>
      <div class="col-md-6" v-if="volumeByApplicationsChart">
        <div class="card">
          <LoadingChart v-if="!lineCharts || loading" />
          <div class="card-body" v-else>
            <h2 class="h6 mb-4 font-weight-light text-muted">Incoming Volume By Application</h2>
            <BarChart :chartData="volumeByApplicationsChart" :height="300" key="walletChart" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTime, subDays, differenceInDays } from 'date-fns'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'

import agent from '@/utils/agent'
import formatMixin from '@/mixins/format'

import BarChart from '@/components/BarChart.vue'
import LineChart from '@/components/LineChart.vue'
import LoadingCardBody from '@/components/LoadingCardBody.vue'
import LoadingChart from '@/components/LoadingChart.vue'
import SummaryCard from '@/components/SummaryCard.vue'

export default {
  mixins: [
    formatMixin
  ],
  components: {
    LineChart,
    BarChart,
    VueCtkDateTimePicker,
    LoadingCardBody,
    LoadingChart,
    SummaryCard
  },
  props: ['address'],
  data () {
    return {
      date: null,
      lineChartData: {},
      barChartData: {},
      walletChartData: {},
      totalUsdVolume: 0,
      totalCount: 0,
      compareLabels: [],
      diffUsdVolume: 0,
      diffTotalCount: 0,
      diffActiveMarketVolume: 0,
      averageOrderValue: 0,
      diffAverageOrderValue: 0,
      totalAgentFeeUsd: 0,
      totalUserFeeUsd: 0,
      totalFeeUsd: 0,
      amountUsdDiff: 0,
      summary: null,
      profitLossChart: null,
      lineCharts: null,
      topMarketsByVolumeChart: null,
      volumeByApplicationsChart: null,
      loading: false
    }
  },
  computed: {
    range () {
      const start = new Date(this.date.start)
      const end = new Date(this.date.end)
      const days = differenceInDays(new Date(end), new Date(start)) + 1

      return {
        start: start,
        end: end,
        compare: {
          start: subDays(start, days),
          end: subDays(end, days)
        }
      }
    }
  },
  async created () {
    const now = new Date()

    this.date = {
      start: subDays(now, 30),
      end: now,
      shortcut: 30
    }

    this.fillData()
  },
  methods: {
    async fillData () {
      this.loading = true
      const [current, compare] = await Promise.all([this.getData(this.range), this.getData(this.range.compare)])
      this.loading = false

      this.summary = {
        current: current.summary,
        compare: compare.summary
      }

      const lineCharts = Object
        .keys(current.timeseries.values)
        .reduce((acc, key) => {
          acc[key] = {
            compareLabels: compare.timeseries.labels,
            data: {
              labels: current.timeseries.labels,
              datasets: [{
                data: current.timeseries.values[key],
                borderWidth: 2,
                borderColor: '#243B53',
                backgroundColor: 'transparent',
                lineTension: 0,
                pointRadius: 0,
                showLine: true
              }, {
                data: compare.timeseries.values[key],
                borderWidth: 2,
                borderColor: '#243a5233',
                backgroundColor: 'transparent',
                lineTension: 0,
                pointRadius: 0,
                showLine: true
              }]
            }
          }

          return acc
        }, {})

      this.lineCharts = lineCharts

      const topMarketsByVolume = current.markets.slice(0, 5).reduce((acc, [key, value]) => {
        acc.labels.push(key)
        acc.values.current.push(value['sum:fromAmountUsd'])

        const cmp = compare.markets.find(market => market[0] === key)
        acc.values.compare.push(cmp ? cmp[1]['sum:fromAmountUsd'] : 0)

        return acc
      }, {
        labels: [],
        values: {
          current: [],
          compare: []
        }
      })

      this.topMarketsByVolumeChart = {
        labels: topMarketsByVolume.labels,
        datasets: [{
          data: topMarketsByVolume.values.current,
          borderWidth: 2,
          borderColor: '#243B53',
          backgroundColor: '#243B53',
          lineTension: 0,
          pointRadius: 2,
          pointBackgroundColor: '#243B53',
          fill: true
        }, {
          data: topMarketsByVolume.values.compare,
          borderWidth: 0,
          backgroundColor: '#243a5233',
          lineTension: 0,
          pointRadius: 2,
          pointBackgroundColor: '#243a5233',
          fill: true
        }]
      }

      this.volumeByApplicationsChart = {
        labels: [
          'Wallet', 'Swap UI'
        ],
        datasets: [{
          data: [
            current.summary['wallet:sum:fromAmountUsd'],
            current.summary['ui:sum:fromAmountUsd']
          ],
          borderWidth: 2,
          borderColor: '#243B53',
          backgroundColor: '#243B53',
          lineTension: 0,
          pointRadius: 2,
          pointBackgroundColor: '#243B53',
          fill: true
        }, {
          data: [
            compare.summary['wallet:sum:fromAmountUsd'],
            compare.summary['ui:sum:fromAmountUsd']
          ],
          borderWidth: 0,
          backgroundColor: '#243a5233',
          lineTension: 0,
          pointRadius: 2,
          pointBackgroundColor: '#243a5233',
          fill: true
        }]
      }
    },
    async getData (range) {
      const { data: { result: { stats: data } } } = await agent.get('/api/dash/stats', {
        params: {
          start: getTime(range.start),
          end: getTime(range.end),
          address: this.address
        }
      })

      const returnValue = data.reduce((acc, point) => {
        acc.timeseries.labels.push(point.date)

        Object
          .keys(point)
          .filter(key => key.includes('sum:') || key.includes('count'))
          .forEach(key => {
            if (!acc.summary[key]) acc.summary[key] = 0
            if (!acc.timeseries.values[key]) acc.timeseries.values[key] = []

            const value = point[key]
            acc.summary[key] += value
            acc.timeseries.values[key].push(value)
          })

        const usdDiff = point['sum:fromAmountUsd'] - point['sum:toAmountUsd']
        const finalDiff = usdDiff - point['sum:totalAgentFeeUsd']
        acc.timeseries.values['sum:totalFromToAmountUsdDiffWithFees'].push(finalDiff)
        acc.summary['sum:totalFromToAmountUsdDiffWithFees'] += finalDiff

        return acc
      }, {
        summary: {
          'sum:totalFromToAmountUsdDiffWithFees': 0
        },
        timeseries: {
          labels: [],
          values: {
            'sum:totalFromToAmountUsdDiffWithFees': []
          }
        }
      })

      const markets = Object
        .keys(returnValue.summary)
        .filter(key => key.startsWith('market:'))
        .reduce((acc, key) => {
          const arr = key.split(':')
          arr.shift() // remove 'market'

          const market = arr.shift()
          const newKey = arr.join(':')

          if (!acc[market]) acc[market] = {}
          acc[market][newKey] = returnValue.summary[key]

          return acc
        }, {})

      const arr = Object.entries(markets)
      arr.sort((a, b) => b[1]['sum:fromAmountUsd'] - a[1]['sum:fromAmountUsd'])

      returnValue.markets = arr
      returnValue.summary['average:fromAmountUsd'] = (Math.ceil((returnValue.summary['sum:fromAmountUsd'] / returnValue.summary.count) * 100) / 100) || 0
      returnValue.summary['ui:sum:fromAmountUsd'] = returnValue.summary['sum:fromAmountUsd'] - returnValue.summary['wallet:sum:fromAmountUsd']

      return returnValue
    }
  }
}
</script>

<style lang="scss">
.header-picker {
  font-weight: 400;
}
</style>
