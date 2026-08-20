import { createApi } from '@reduxjs/toolkit/query/react'

import { apiBaseQuery } from './baseQuery'

import type { ExcellenceRecord } from '../types'

export type CreateExcellencePayload = Omit<ExcellenceRecord, 'id'>
export type UpdateExcellencePayload = Partial<Omit<ExcellenceRecord, 'id'>> & {
  id: string
}

export const excellenceApi = createApi({
  reducerPath: 'excellenceApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Excellence'],
  endpoints: (builder) => ({
    getExcellence: builder.query<
      ExcellenceRecord[],
      { personId?: string } | void
    >({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.personId) search.set('personId', params.personId)
        const qs = search.toString()
        return qs ? `/excellence?${qs}` : '/excellence'
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Excellence' as const, id })),
              { type: 'Excellence', id: 'LIST' },
            ]
          : [{ type: 'Excellence', id: 'LIST' }],
    }),

    getExcellenceById: builder.query<ExcellenceRecord, string>({
      query: (id) => `/excellence/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Excellence', id }],
    }),

    createExcellence: builder.mutation<ExcellenceRecord, CreateExcellencePayload>({
      query: (body) => ({
        url: '/excellence',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Excellence', id: 'LIST' }],
    }),

    updateExcellence: builder.mutation<ExcellenceRecord, UpdateExcellencePayload>({
      query: ({ id, ...body }) => ({
        url: `/excellence/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Excellence', id },
        { type: 'Excellence', id: 'LIST' },
      ],
    }),

    deleteExcellence: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/excellence/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Excellence', id },
        { type: 'Excellence', id: 'LIST' },
      ],
    }),

    seedExcellence: builder.mutation<
      { message: string; count: number; excellence?: ExcellenceRecord[] },
      void
    >({
      query: () => ({
        url: '/excellence/seed',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Excellence', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetExcellenceQuery,
  useGetExcellenceByIdQuery,
  useCreateExcellenceMutation,
  useUpdateExcellenceMutation,
  useDeleteExcellenceMutation,
  useSeedExcellenceMutation,
} = excellenceApi
