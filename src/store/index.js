import Vue from 'vue'
import Vuex from 'vuex'

import agent from '@/utils/agent'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: false
  },
  mutations: {
    SET_USER (state) {
      state.user = true
    },
    UNSET_USER (state) {
      state.user = false
    }
  },
  actions: {
    async checkOrder ({ commit }, { orderId }) {
      try {
        const { data } = await agent.get('/api/user/order', {
          params: {
            orderId
          }
        })

        if (data && data.success) {
          return data.data
        }
      } catch (e) {
        console.error(e)
      }

      return false
    },
    async updateOrder ({ commit }, { orderId, type, message, action }) {
      try {
        const { data } = await agent.post('/api/user/order', {
          orderId,
          type,
          message,
          action
        })

        if (data && data.success) {
          return true
        }
      } catch (e) {
        console.error(e)
      }

      return false
    },
    async checkUser ({ commit }) {
      try {
        const { data } = await agent.get('/api/user')

        if (data && data.success) {
          commit('SET_USER')
          return true
        }
      } catch (e) {
        console.error(e)
      }

      commit('UNSET_USER')
      return false
    },
    async login ({ commit }, { password }) {
      try {
        const { data } = await agent.post('/api/user/login', {
          password
        })

        if (data && data.success) {
          commit('SET_USER')
          return true
        }
      } catch (e) {
        console.error(e)
      }

      commit('UNSET_USER')
      return false
    },
    async killswitch ({ commit }) {
      try {
        const { data } = await agent.post('/api/user/killswitch')

        if (data && data.success) {
          return true
        }
      } catch (e) {
        console.error(e)
      }

      return false
    },
    async logout ({ commit }) {
      try {
        const { data } = await agent.post('/api/user/logout')

        if (data && data.success) {
          commit('UNSET_USER')
          return true
        }
      } catch (e) {
        console.error(e)
      }

      return false
    }
  }
})
