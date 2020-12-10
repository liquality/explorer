<template>
<div class="order-timeline">
  <div class="card font-weight-normal" v-for="(audit, idx) in auditLogs" :key="audit._id">
    <div class="card-body">
      <div v-if="audit.orderStatus === 'QUOTE'">
        <Check />
        <p class="mb-0">User requested a quote</p>
      </div>
      <div v-else-if="audit.context === 'SWAP_UPDATE'">
        <Check />
        <p class="mb-0">User has informed the agent about the funding transaction</p>
      </div>
      <div v-else-if="audit.context === 'VERIFY_USER_INIT_TX' && audit.status === 'USER_FUNDING_NOT_FOUND'" class="invert-icon-colors">
        <Check />
        <p class="mb-0">Agent is looking for user's funding transaction</p>
      </div>
      <div v-else-if="audit.context === 'VERIFY_USER_INIT_TX' && audit.status === 'USER_FUNDING_NEED_MORE_CONF'" class="invert-icon-colors">
        <Check />
        <p class="mb-0">Agent is waiting for {{audit.extra.minConf}} {{ audit.extra.minConf === 1 ? 'confirmation' : 'confirmations' }} on user's funding transaction</p>
      </div>
      <div v-else-if="audit.orderStatus === 'USER_FUNDED'" class="invert-icon-colors">
        <Check />
        <p class="mb-0">Agent has confirmed user's funding transaction</p>
      </div>
      <div v-else-if="audit.context === 'RECIPROCATE_INIT_SWAP'" class="invert-icon-colors">
        <Check />
        <p class="mb-0">Agent has reciprocated funding transaction</p>
      </div>
      <div v-else-if="audit.status === 'AGENT_CLAIM_WAITING'" class="invert-icon-colors">
        <Check />
        <p class="mb-0">Agent is waiting for user to claim</p>
      </div>
      <div v-else-if="audit.orderStatus === 'USER_CLAIMED'">
        <Check />
        <p class="mb-0">User has claimed agent's funding transaction</p>
      </div>
      <div v-else-if="audit.orderStatus === 'AGENT_CLAIMED'" class="invert-icon-colors">
        <Check />
        <p class="mb-0">Agent has claimed user's funding transaction</p>
      </div>
      <div v-else-if="audit.orderStatus === 'AGENT_REFUNDED'" class="invert-icon-colors">
        <Check />
        <p class="mb-0">Agent has refunded</p>
      </div>
      <div v-else>
        <Check />
        <p class="mb-0">
          <time :datetime="audit.createdAt">{{audit.createdAt}}</time> - {{audit.orderStatus}} - {{audit.status}} - {{audit.context}}
          <br>
          <pre>{{JSON.stringify(audit.extra, null, 2)}}</pre>
        </p>
      </div>
      <div class="mt-1 text-muted small d-block">
        <time :datetime="audit.createdAt">{{formatDate(auditMap[audit.key].end)}}</time>
        <span v-if="rates"> ({{formatAssetValue(rates[auditMap[audit.key].end.getTime()], order.to)}})</span>
        <br v-if="auditMap[audit.key].count > 1">
        <span v-if="auditMap[audit.key].count > 1">
          First attempt at {{formatDate(auditMap[audit.key].start)}}<span v-if="rates"> ({{formatAssetValue(rates[auditMap[audit.key].start.getTime()], order.to)}})</span><br>
          {{auditMap[audit.key].count}} attempts, took {{formatDurationStrict(auditMap[audit.key].start, auditMap[audit.key].end, false)}}
        </span>
      </div>
    </div>
    <div class="card-body" v-if="idx < (auditLogs.length - 1)">
      <div class="text-muted small align-items-center">
        <div class="time-diff"><div></div></div>
        <p class="mb-0"><em>+{{formatDurationStrict(auditMap[audit.key].end, auditMap[auditLogs[idx + 1].key].start, false)}}</em></p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import format from '@/mixins/format'
import Check from '@/components/Icons/Check.vue'

export default {
  mixins: [format],
  components: {
    Check
  },
  props: {
    auditLogs: Array,
    auditMap: Object,
    rates: Object,
    order: Object
  }
}
</script>
