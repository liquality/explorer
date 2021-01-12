<template>
  <div>
    <h1 class="h4 mb-4 text-center">KillSwitch&trade;</h1>
    <div class="row">
      <div class="col-md-4 mx-auto text-center" v-if="success === null">
        <button v-if="step === 0" class="btn btn-secondary" @click="step++">Kill-It</button>
        <h1 v-if="step === 1" class="text-danger mb-4">Are you sure?</h1>
        <button v-if="step === 1" class="btn btn-danger" @click="submit" :disabled="loading">Yes</button>
        <button v-if="step === 1" class="btn btn-secondary ml-3" @click="goHome" :disabled="loading">No</button>
      </div>
      <div class="col-md-4 mx-auto text-center" v-else-if="success === true">
        <h1 class="text-danger mb-4">You did it!</h1>
      </div>
      <div class="col-md-4 mx-auto text-center" v-else>
        <h1 class="text-danger mb-4">Something went wrong</h1>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  metaInfo () {
    return {
      title: 'KillSwitch'
    }
  },
  data () {
    return {
      step: 0,
      success: null,
      loading: false
    }
  },
  computed: {
    ...mapState(['user']),
    query () {
      return this.$route.query.q
    }
  },
  created () {
    if (!this.user) {
      // this.goHome()
    }
  },
  methods: {
    goHome () {
      this.$router.replace({ name: 'Home' })
    },
    ...mapActions(['killswitch']),
    async submit () {
      if (!this.user) return
      if (this.loading) return

      this.loading = true

      const success = await this.killswitch()

      this.loading = false

      this.success = success
    }
  }
}
</script>
