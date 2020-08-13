<script>
import { Line, mixins } from 'vue-chartjs'
import { format, parseISO } from 'date-fns'

import formatMixin from '@/mixins/format'

export default {
  extends: Line,
  mixins: [mixins.reactiveProp, formatMixin],
  props: ['compareLabels'],
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
            title: (tooltipItem, data) => {
              if (!tooltipItem[0].xLabel) return

              const label = tooltipItem[0].datasetIndex === 1
                ? this.compareLabels[tooltipItem[0].index]
                : tooltipItem[0].xLabel

              return format(parseISO(label), 'd LLL yyyy')
            },
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
            },
            ticks: {
              maxRotation: 0,
              autoSkipPadding: 80,
              callback: value => format(parseISO(value), 'd LLL')
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
