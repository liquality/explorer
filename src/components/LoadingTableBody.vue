<template>
<tbody class="loading-table">
  <tr v-for="i in trCount" :key="i">
    <td v-for="j in tdCount" :key="j">
      <span class="loading-text-line"></span>
    </td>
  </tr>
</tbody>
</template>

<script>
export default {
  props: {
    trCount: {
      type: Number,
      default: 4
    },
    tdCount: {
      type: Number,
      default: 2
    }
  }
}
</script>

<style lang="scss">
.loading-table {
  .loading-text-line {
    display: block;
    border-radius: 0.25rem;
    height: 12px;
    width: 100%;
    margin: 0;
    @extend .animated-background-light;
  }
}
</style>
