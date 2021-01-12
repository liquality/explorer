<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-light">
      <div class="container">
        <div class="collapse navbar-collapse">
          <router-link to="/" class="navbar-brand">
            <img src="@/assets/liquality.svg" height="20">
          </router-link>
          <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
            <li class="nav-item">
              <router-link to="/browse" class="nav-link" active-class="active">
                Browse
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/topAddresses" class="nav-link" active-class="active">
                Top Addresses
              </router-link>
            </li>
            <li class="nav-item" v-if="user">
              <a class="nav-link cursor-pointer" @click="logout">
                Logout
              </a>
            </li>
          </ul>
          <form @submit.prevent="submit" class="ml-3 my-2 my-lg-0 d-inline w-100">
            <input type="text" class="form-control mr-sm-2" placeholder="Search for address, transaction, secret hash, or order ID" v-model="query" required>
          </form>
        </div>
      </div>
    </nav>
    <div class="container py-5">
      <router-view v-if="!loading" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  metaInfo: {
    title: 'Home',
    titleTemplate: '%s - Liquality Explorer'
  },
  data () {
    return {
      query: null
    }
  },
  async created () {
    if (this.$route.query.q) {
      this.query = this.$route.query.q
    }

    this.loading = true

    await this.checkUser()

    this.loading = false
  },
  computed: mapState(['user']),
  methods: {
    ...mapActions(['logout', 'checkUser']),
    submit (e) {
      if (this.$route.query.q === this.query) return
      if (!this.query) return

      this.$router.push({ path: '/browse', query: { q: this.query } })
    }
  }
}
</script>
