<template>
  <div>
    <h1 class="h4 mb-4 text-center">Login</h1>
    <div class="row">
      <div class="col-md-4 mx-auto">
        <form @submit.prevent="submit" class="text-center">
          <input type="password" class="form-control text-center mb-4" placeholder="Password" v-model="password" required :disabled="user || loading">
          <button type="submit" class="btn btn-primary" :disabled="user || loading">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  metaInfo () {
    return {
      title: 'Login'
    }
  },
  data () {
    return {
      password: null,
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
    if (this.user) {
      this.$router.replace({ name: 'Home' })
    }
  },
  methods: {
    ...mapActions(['login']),
    async submit () {
      if (this.user) return
      if (this.loading) return

      const password = this.password

      this.loading = true

      const success = await this.login({ password })

      this.loading = false

      if (success) {
        this.$router.replace({ name: 'Home' })
      }
    }
  }
}
</script>
