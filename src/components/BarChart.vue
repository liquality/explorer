<script>
import { Bar, mixins } from 'vue-chartjs'

import formatMixin from '@/mixins/format'

export default {
  extends: Bar,
  mixins: [
    mixins.reactiveProp,
    formatMixin
  ],
  mounted () {
    this.renderChart(this.chartData, this.options)
  },
  computed: {
    options () {
      return {
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        tooltips: {
          mode: 'nearest',
          intersect: false,
          xPadding: 14,
          yPadding: 10,
          callbacks: {
            label: (tooltipItem, data) => {
              return `$${this.formatAmount(tooltipItem.yLabel, 'USD')}`
            }
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: true,
              borderDash: [3, 6],
              color: '#ccc'
            }
          }],
          yAxes: [{
            gridLines: {
              display: true,
              color: '#ccc'
            },
            ticks: {
              autoSkipPadding: 80,
              callback: value => `${value / 1000}K`
            }
          }]
        }
      }
    }
  }
}
</script>
