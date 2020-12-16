<template>
<div class="card-body">
  <div class="loading-box">
    <div class="loading-text-line" v-for="i in count" :key="i"></div>
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
.loading-box {
  .loading-text-line {
    border-radius: 0.25rem;
    height: 12px;
    width: 100%;
    margin: 6px 0;
    @extend .animated-background-light;

    &.loading-text-line-big {
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
