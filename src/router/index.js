import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import Home from '../views/Home.vue'

Vue.use(VueRouter)
Vue.use(VueMeta, {
  refreshOnceOnNavigation: true
})

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/browse',
    name: 'Browse',
    component: () => import('../views/Browse.vue')
  },
  {
    path: '/order/:orderId',
    name: 'Order',
    component: () => import('../views/Order.vue')
  },
  {
    path: '/address/:address',
    name: 'Address',
    component: () => import('../views/Address.vue')
  },
  {
    path: '/topAddresses',
    name: 'TopAddresses',
    component: () => import('../views/TopAddresses.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/killswitch',
    name: 'KillSwitch',
    component: () => import('../views/KillSwitch.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
