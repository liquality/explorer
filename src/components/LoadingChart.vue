<template>
<div class="card-body">
  <div class="loading-chart">
    <div class="loading-block" v-for="i in count" :key="i"></div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      default: 4
    }
  }
}
</script>

<style lang="scss">
.loading-chart {
  display: flex;

  .loading-block {
    border-radius: 0.25rem;
    height: 300px;
    width: 100%;
    margin: 0 6px;
    @extend .animated-background-light;

    &.loading-block-big {
      height: 24px;
      margin: 12px 0;
    }

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
