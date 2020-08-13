<template>
  <div>
    <div class="pb-2 text-center">
      <button
        v-for="r in rangeOptions" :key="r"
        type="button" :class="{
          'btn btn-sm btn-link': true,
          'text-muted': range.label !== r,
          'font-weight-bold': range.label === r
        }" @click="updateRange(r)">{{r}}</button>
    </div>
    <div class="row pb-3 justify-content-center">
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
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <LineChart :chartData="lineChartData" :compareLabels="compareLabels" :height="300" />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <BarChart :chartData="barChartData" :height="300" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { getTime, startOfDay, endOfDay, startOfMonth, lastDayOfMonth, subMonths, subDays, subHours, startOfYear, lastDayOfYear, min, subYears, getDaysInMonth } from 'date-fns'

import formatMixin from '@/mixins/format'

import BarChart from '@/components/BarChart.vue'
import LineChart from '@/components/LineChart.vue'

export default {
  mixins: [
    formatMixin
  ],
  components: {
    LineChart,
    BarChart
  },
  props: ['address'],
  data () {
    return {
      lineChartData: {},
      barChartData: {},
      range: {},
      totalUsdVolume: 0,
      totalCount: 0,
      mostActiveMarket: null,
      compareLabels: [],
      diffUsdVolume: 0,
      diffTotalCount: 0,
      diffActiveMarketVolume: 0
    }
  },
  computed: {
    rangeOptions () {
      return ['24h', '7d', '15d', '30d', 'this month', 'last month', 'this year']
    }
  },
  async mounted () {
    this.updateRange('30d')
  },
  methods: {
    async fillData () {
      const [data, compare] = await Promise.all([this.getData(this.range), this.getData(this.range.compare)])

      this.barChartData = {
        labels: data.barChart.labels,
        datasets: [{
          data: data.barChart.values,
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
          // pointBackgroundColor: 'transparent',
          // fill: true
        }, {
          data: compare.lineChart.values,
          borderWidth: 2,
          borderColor: '#243a5233',
          backgroundColor: 'transparent',
          lineTension: 0,
          pointRadius: 0
          // pointBackgroundColor: '#243a5233',
          // fill: true
        }]
      }

      this.compareLabels = compare.lineChart.labels
      this.totalUsdVolume = data.totalUsdVolume
      this.totalCount = data.totalCount

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
      const { data: { result: { stats: data } } } = await axios('http://localhost:3030/api/dash/stats', {
        params: {
          start: getTime(range.start),
          end: getTime(range.end),
          address: this.address
        }
      })

      let totalCount = 0
      let totalUsdVolume = 0

      const _barChart = data.reduce((acc, { markets }) => {
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

      return {
        mostActiveMarket,
        totalCount,
        totalUsdVolume,
        barChart,
        lineChart: {
          labels: data.map(point => point.date),
          values: data.map(point => point.usd_volume)
        }
      }
    },
    updateRange (label) {
      let today = new Date()

      switch (label) {
        case '24h':
          {
            const start = subHours(today, 24)
            const end = today

            this.range = {
              label,
              start: subHours(today, 24),
              end: today,
              compare: {
                start: subHours(start, 24),
                end: subHours(end, 24)
              }
            }
          }
          break

        case '7d':
          {
            const start = startOfDay(subDays(today, 7))
            const end = endOfDay(today)

            this.range = {
              label,
              start,
              end,
              compare: {
                start: subDays(start, 7),
                end: subDays(end, 7)
              }
            }
          }
          break

        case '15d':
          {
            const start = startOfDay(subDays(today, 15))
            const end = endOfDay(today)

            this.range = {
              label,
              start,
              end,
              compare: {
                start: subDays(start, 15),
                end: subDays(end, 15)
              }
            }
          }
          break

        case '30d':
          {
            const start = startOfDay(subDays(today, 30))
            const end = endOfDay(today)

            this.range = {
              label,
              start,
              end,
              compare: {
                start: subDays(start, 30),
                end: subDays(end, 30)
              }
            }
          }
          break

        case 'this month':
          {
            const start = startOfMonth(today)
            const end = min([endOfDay(lastDayOfMonth(today)), endOfDay(today)])

            this.range = {
              label,
              start,
              end,
              compare: {
                start: subDays(start, getDaysInMonth(start)),
                end: subDays(end, getDaysInMonth(end))
              }
            }
          }
          break

        case 'last month':
          {
            today = subMonths(today, 1)

            const start = startOfMonth(today)
            const end = endOfDay(lastDayOfMonth(today))

            this.range = {
              label,
              start,
              end,
              compare: {
                start: subDays(start, getDaysInMonth(start)),
                end: subDays(end, getDaysInMonth(end))
              }
            }
          }
          break

        case 'this year':
          {
            const start = startOfYear(today)
            const end = min([endOfDay(lastDayOfYear(today)), endOfDay(today)])

            this.range = {
              label,
              start,
              end,
              compare: {
                start: subYears(start, 1),
                end: subYears(end, 1)
              }
            }
          }
          break
      }

      this.fillData()
    }
  }
}
</script>
