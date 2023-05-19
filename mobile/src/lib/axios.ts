import axios from 'axios'

// your local network ip
export const api = axios.create({
  baseURL: 'http://192.168.1.169:3333',
})
