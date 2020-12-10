import axios from 'axios'

const instance = axios.create({
  baseURL: process.env.VUE_APP_AGENT_URL
})

export default instance
