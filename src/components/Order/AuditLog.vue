<template>
<div class="order-timeline">
  <div class="card font-weight-normal" v-for="(audit, idx) in logs" :key="audit._id">
    <div class="card-body">
      <div v-if="audit.orderStatus === 'QUOTE'">
        <User class="icon-user" />
        <p class="mb-0">User requested a quote</p>
      </div>
      <div v-else-if="audit.context === 'SWAP_UPDATE'">
        <User class="icon-user" />
        <p class="mb-0">User has informed the agent about the funding transaction</p>
      </div>
      <div v-else-if="audit.context === 'VERIFY_USER_INIT_TX' && audit.status === 'USER_FUNDING_NOT_FOUND'">
        <User class="icon-user" />
        <p class="mb-0">Agent is looking for user's funding transaction</p>
      </div>
      <div v-else-if="audit.context === 'VERIFY_USER_INIT_TX' && audit.status === 'USER_FUNDING_NEED_MORE_CONF'">
        <User class="icon-user" />
        <p class="mb-0">Agent is waiting for {{audit.extra.minConf}} {{ audit.extra.minConf === 1 ? 'confirmation' : 'confirmations' }} on user's funding transaction</p>
      </div>
      <div v-else-if="audit.context === 'FIND_REFUND_TX'">
        <User />
        <p class="mb-0">User has refunded the swap</p>
      </div>
      <div v-else-if="audit.context === 'AUTH' && audit.status === 'AUTO_APPROVED'">
        <Approve />
        <p class="mb-0">
          Agent has auto approved the order<br>
          <em v-if="audit.extra.message" class="small text-muted">({{audit.extra.message}})</em>
        </p>
      </div>
      <div v-else-if="audit.context === 'AUTH' && audit.status === 'APPROVED'">
        <Approve />
        <p class="mb-0">
          Agent has approved the order
          <em v-if="audit.extra.message" class="ml-2 small text-muted">({{audit.extra.message}})</em>
        </p>
      </div>
      <div v-else-if="audit.context === 'AUTH' && audit.status === 'REJECTED'">
        <Reject />
        <p class="mb-0">Agent has rejected the order</p>
        <em v-if="audit.extra.message" class="ml-2 small text-muted">({{audit.extra.message}})</em>
      </div>
      <div v-else-if="audit.orderStatus === 'USER_FUNDED' && audit.context === 'VERIFY_USER_INIT_TX' && !audit.waiting">
        <Robot />
        <p class="mb-0">Agent has confirmed user's funding transaction</p>
      </div>
      <div v-else-if="audit.orderStatus === 'USER_FUNDED' && audit.context === 'VERIFY_USER_INIT_TX'">
        <Robot />
        <p class="mb-0">Agent is waiting for order approval</p>
      </div>
      <div v-else-if="audit.context === 'RECIPROCATE_INIT_SWAP'">
        <Robot />
        <p class="mb-0">Agent has created the swap contract</p>
      </div>
      <div v-else-if="audit.context === 'FUND_SWAP'">
        <Robot />
        <p class="mb-0">Agent has funded the swap contract</p>
      </div>
      <div v-else-if="audit.status === 'AGENT_CLAIM_WAITING'">
        <Robot />
        <p class="mb-0">Agent is waiting for user to claim</p>
      </div>
      <div v-else-if="audit.orderStatus === 'USER_CLAIMED'">
        <User class="icon-user" />
        <p class="mb-0">User has claimed agent's funding transaction</p>
      </div>
      <div v-else-if="audit.orderStatus === 'AGENT_CLAIMED'">
        <Robot />
        <p class="mb-0">Agent has claimed user's funding transaction</p>
      </div>
      <div v-else-if="audit.orderStatus === 'AGENT_REFUNDED'">
        <Robot />
        <p class="mb-0">Agent has refunded</p>
      </div>
      <div v-else>
        <User class="icon-user" />
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
    <div class="card-body" v-if="idx < (auditLogs.length - 1) && !audit.nextWaiting">
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
import User from '@/components/Icons/User.vue'
import Robot from '@/components/Icons/Robot.vue'
import Approve from '@/components/Icons/Approve.vue'
import Reject from '@/components/Icons/Reject.vue'

export default {
  mixins: [format],
  components: {
    User,
    Robot,
    Approve,
    Reject
  },
  props: {
    auditLogs: Array,
    auditMap: Object,
    rates: Object,
    order: Object
  },
  computed: {
    logs () {
      const logs = [...this.auditLogs]
      const index = logs.findIndex(l => l.orderStatus === 'USER_FUNDED' && l.context === 'VERIFY_USER_INIT_TX')

      if (index >= 0) {
        const thatLog = {
          ...logs[index],
          nextWaiting: true
        }
        const newLog = {
          ...logs[index],
          waiting: true
        }

        logs.splice(index, 1, thatLog)
        logs.splice(index + 1, 0, newLog)
      }

      return logs
    }
  }
}
</script>

<style lang="scss">
.order-timeline {
  position: relative;

  .time-diff {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 8px;
    height: 8px;
    background: $blue-light-4;
    border-radius: 50%;
    margin-left: 1px;
    margin-right: 21px;

    div {
      width: 4px;
      height: 4px;
      background: $body-bg;
      border-radius: 50%;
    }
  }

  > div:last-child {
    z-index: 1;

    &:after {
      display: block;
      content: '';
      position: absolute;
      left: 2px;
      top: 0;
      bottom: 0;
      width: 4px;
      border-left: 6px solid $body-bg;
      z-index: -1;
    }
  }

  &:before {
    display: block;
    content: '';
    position: absolute;
    left: 14px;
    top: 0;
    bottom: 0;
    width: 1px;
    border-left: 2px solid $blue-light-4;
  }

  .card {
    background: transparent;
    margin-left: 10px;
    border: 0;
  }

  .card + .card, .card-body + .card-body {
    margin-top: 1.5rem;
  }

  .card-body {
    padding: 0;

    > div {
      display: flex;
      align-items: flex-start;

      &:nth-child(2) {
        margin-left: 34px;
      }
    }
  }

  svg {
    height: 34px;
    margin: -4px 10px -10px -12px;
    padding: 4px;
    background: $body-bg;
    flex-shrink: 0;
  }

  .icon-user {
    margin-left: -9px;
  }
}
</style>
