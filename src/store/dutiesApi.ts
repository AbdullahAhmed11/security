import { createApi } from '@reduxjs/toolkit/query/react'

import { apiBaseQuery } from './baseQuery'

import type { DutyRecord } from '../types'

export type CreateDutyPayload = Omit<DutyRecord, 'id'>
export type UpdateDutyPayload = Partial<Omit<DutyRecord, 'id'>> & { id: string }

export const dutiesApi = createApi({
  reducerPath: 'dutiesApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Duties'],
  endpoints: (builder) => ({
    getDuties: builder.query<
      DutyRecord[],
      { personId?: string; date?: string; dutyType?: string } | void
    >({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.personId) search.set('personId', params.personId)
        if (params?.date) search.set('date', params.date)
        if (params?.dutyType) search.set('dutyType', params.dutyType)
        const qs = search.toString()
        return qs ? `/duties?${qs}` : '/duties'
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Duties' as const, id })),
              { type: 'Duties', id: 'LIST' },
            ]
          : [{ type: 'Duties', id: 'LIST' }],
    }),

    getDutyById: builder.query<DutyRecord, string>({
      query: (id) => `/duties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Duties', id }],
    }),

    createDuty: builder.mutation<DutyRecord, CreateDutyPayload>({
      query: (body) => ({
        url: '/duties',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Duties', id: 'LIST' }],
    }),

    updateDuty: builder.mutation<DutyRecord, UpdateDutyPayload>({
      query: ({ id, ...body }) => ({
        url: `/duties/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Duties', id },
        { type: 'Duties', id: 'LIST' },
      ],
    }),

    deleteDuty: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/duties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Duties', id },
        { type: 'Duties', id: 'LIST' },
      ],
    }),

    seedDuties: builder.mutation<
      { message: string; count: number; duties?: DutyRecord[] },
      void
    >({
      query: () => ({
        url: '/duties/seed',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Duties', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetDutiesQuery,
  useGetDutyByIdQuery,
  useCreateDutyMutation,
  useUpdateDutyMutation,
  useDeleteDutyMutation,
  useSeedDutiesMutation,
} = dutiesApi
