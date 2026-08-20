import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getApiBase } from '../lib/apiUrl'

export const apiBaseQuery = fetchBaseQuery({
  baseUrl: getApiBase(),
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})
