import axios from 'axios'

const instance = axios.create({
  baseURL: '/agent'
})

export default instance
