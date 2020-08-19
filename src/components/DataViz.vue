<template>
  <div>
    <div class="row pb-4 justify-content-center">
      <div class="col-md-6">
        <VueCtkDateTimePicker
          v-model="date"
          range
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
    <div class="row pb-4 justify-content-center">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h6 class="mb-3 font-weight-light text-muted d-flex justify-content-between align-items-center">
              <span>Volume</span>
              <span :class="{
                'font-weight-normal': true,
                'text-danger': diffUsdVolume < 0,
                'text-success': diffUsdVolume >= 0
              }">{{diffUsdVolume}}%</span>
            </h6>
            <p class="h3 font-weight-light mb-0">
              ${{formatAmount(totalUsdVolume, 'USD')}}
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h6 class="mb-3 font-weight-light text-muted d-flex justify-content-between align-items-center">
              <span>Swaps</span>
              <span :class="{
                'font-weight-normal': true,
                'text-danger': diffTotalCount < 0,
                'text-success': diffTotalCount >= 0
              }">{{diffTotalCount}}%</span>
            </h6>
            <p class="h3 font-weight-light mb-0">
              {{totalCount}}
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-3" v-if="mostActiveMarket">
        <div class="card">
          <div class="card-body">
            <h6 class="mb-3 font-weight-light text-muted d-flex justify-content-between align-items-center">
              <span>Average Value</span>
              <span :class="{
                'font-weight-normal': true,
                'text-danger': diffAverageOrderValue < 0,
                'text-success': diffAverageOrderValue >= 0
              }">{{diffAverageOrderValue}}%</span>
            </h6>
            <p class="h3 font-weight-light mb-0">
              ${{formatAmount(averageOrderValue, 'USD')}}
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-3" v-if="mostActiveMarket">
        <div class="card">
          <div class="card-body">
            <h6 class="mb-3 font-weight-light text-muted d-flex justify-content-between align-items-center">
              <span>Top Market</span>
              <span :class="{
                'font-weight-normal': true,
                'text-danger': diffActiveMarketVolume < 0,
                'text-success': diffActiveMarketVolume >= 0
              }">{{diffActiveMarketVolume}}%</span>
            </h6>
            <p class="h3 font-weight-light mb-0">
              {{mostActiveMarket}}
            </p>
          </div>
        </div>
      </div>
    </div>

    <h2 class="h5">Volume</h2>
    <div class="card mb-4">
      <div class="card-body">
        <LineChart :chartData="lineChartData" :compareLabels="compareLabels" :height="300" />
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="h5">Markets</h2>
        <div class="card">
          <div class="card-body">
            <BarChart :chartData="barChartData" :height="300" key="marketChart" />
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <h2 class="h5">User agents</h2>
        <div class="card">
          <div class="card-body">
            <BarChart :chartData="walletChartData" :height="300" key="walletChart" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { getTime, subDays, differenceInDays } from 'date-fns'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'

import formatMixin from '@/mixins/format'

import BarChart from '@/components/BarChart.vue'
import LineChart from '@/components/LineChart.vue'

export default {
  mixins: [
    formatMixin
  ],
  components: {
    LineChart,
    BarChart,
    VueCtkDateTimePicker
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
      mostActiveMarket: null,
      compareLabels: [],
      diffUsdVolume: 0,
      diffTotalCount: 0,
      diffActiveMarketVolume: 0,
      averageOrderValue: 0,
      diffAverageOrderValue: 0
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
      const [data, compare] = await Promise.all([this.getData(this.range), this.getData(this.range.compare)])

      if (data.barChart.labels.length <= 2) {
        data.barChart.labels.push('')
        data.barChart.values.push(0)
      }

      this.barChartData = {
        labels: data.barChart.labels, // [...data.barChart.labels, ''],
        datasets: [{
          data: data.barChart.values, // [..., 0],
          borderWidth: 2,
          borderColor: '#243B53',
          backgroundColor: '#243B53',
          lineTension: 0,
          pointRadius: 2,
          pointBackgroundColor: '#243B53',
          fill: true
        }]
      }

      this.walletChartData = {
        labels: data.walletUi.map(a => a[0]),
        datasets: [{
          data: data.walletUi.map(a => a[1]),
          borderWidth: 2,
          borderColor: '#243B53',
          backgroundColor: '#243B53',
          lineTension: 0,
          pointRadius: 2,
          pointBackgroundColor: '#243B53',
          fill: true
        }]
      }

      this.lineChartData = {
        labels: data.lineChart.labels,
        datasets: [{
          data: data.lineChart.values,
          borderWidth: 2,
          borderColor: '#243B53',
          backgroundColor: 'transparent',
          lineTension: 0,
          pointRadius: 0
        }, {
          data: compare.lineChart.values,
          borderWidth: 2,
          borderColor: '#243a5233',
          backgroundColor: 'transparent',
          lineTension: 0,
          pointRadius: 0
        }]
      }

      this.compareLabels = compare.lineChart.labels
      this.totalUsdVolume = data.totalUsdVolume
      this.totalCount = data.totalCount
      this.averageOrderValue = data.averageOrderValue

      this.diffAverageOrderValue = (Math.ceil(((data.averageOrderValue - compare.averageOrderValue) / compare.averageOrderValue) * 10000) / 100) || 0
      this.diffUsdVolume = (Math.ceil(((data.totalUsdVolume - compare.totalUsdVolume) / compare.totalUsdVolume) * 10000) / 100) || 0
      this.diffTotalCount = (Math.ceil(((data.totalCount - compare.totalCount) / compare.totalCount) * 10000) / 100) || 0

      const mostActiveMarket = data.mostActiveMarket && data.mostActiveMarket[0]
      if (!mostActiveMarket) {
        this.mostActiveMarket = null
        return
      }

      this.mostActiveMarket = mostActiveMarket

      const dataIndex = data.barChart.labels.findIndex(label => label === mostActiveMarket)
      const dataValue = data.barChart.values[dataIndex]

      const compareIndex = compare.barChart.labels.findIndex(label => label === mostActiveMarket)
      const compareValue = compare.barChart.values[compareIndex]

      this.diffActiveMarketVolume = (Math.ceil(((dataValue - compareValue) / compareValue) * 10000) / 100) || 0
    },
    async getData (range) {
      const { data: { result: { stats: data } } } = await axios('https://liquality-dashboard.herokuapp.com/api/dash/stats', {
        params: {
          start: getTime(range.start),
          end: getTime(range.end),
          address: this.address
        }
      })

      let totalCount = 0
      let totalUsdVolume = 0

      let walletCount = 0
      let walletUsdVolume = 0

      const _barChart = data.reduce((acc, { count, volume, wallet_count, wallet_volume, markets }) => { /* eslint-disable-line */
        if (wallet_count) { /* eslint-disable-line */
          walletCount += wallet_count /* eslint-disable-line */
          walletUsdVolume += wallet_volume /* eslint-disable-line */
        }

        Object.keys(markets).forEach(market => {
          if (!acc[market]) acc[market] = 0
          acc[market] += markets[market].usd_volume

          totalUsdVolume += markets[market].usd_volume
          totalCount += markets[market].count
        })

        return acc
      }, {})

      const sortedPieChart = Object.entries(_barChart).sort((a, b) => b[1] - a[1])
      const mostActiveMarket = sortedPieChart[0]
      const barChart = sortedPieChart.reduce((acc, [key, value]) => {
        if (value) {
          acc.labels.push(key)
          acc.values.push(value)
        }

        return acc
      }, { labels: [], values: [] })

      const walletUi = [['Wallet', walletUsdVolume], ['UI', totalUsdVolume - walletUsdVolume]]

      walletUi.sort((a, b) => b[1] - a[1])

      return {
        mostActiveMarket,
        totalCount,
        totalUsdVolume,
        averageOrderValue: totalUsdVolume / totalCount,
        walletCount,
        walletUsdVolume,
        walletUi,
        barChart,
        lineChart: {
          labels: data.map(point => point.date),
          values: data.map(point => point.usd_volume)
        }
      }
    }
  }
}
</script>
