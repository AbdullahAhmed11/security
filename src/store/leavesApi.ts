import { createApi } from '@reduxjs/toolkit/query/react'

import { apiBaseQuery } from './baseQuery'

import type { LeaveRecord, LeaveReturnStatus } from '../types'
import { personnelApi } from './personnelApi'

export type CreateLeavePayload = Omit<LeaveRecord, 'id'>
export type UpdateLeavePayload = Partial<Omit<LeaveRecord, 'id'>> & { id: string }
export type ReturnLeavePayload = {
  id: string
  actualReturnDate: string
  returnStatus: LeaveReturnStatus
  notes?: string
}

export const leavesApi = createApi({
  reducerPath: 'leavesApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Leaves'],
  endpoints: (builder) => ({
    getLeaves: builder.query<
      LeaveRecord[],
      { personId?: string; status?: string } | void
    >({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.personId) search.set('personId', params.personId)
        if (params?.status) search.set('status', params.status)
        const qs = search.toString()
        return qs ? `/leaves?${qs}` : '/leaves'
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Leaves' as const, id })),
              { type: 'Leaves', id: 'LIST' },
            ]
          : [{ type: 'Leaves', id: 'LIST' }],
    }),

    getLeaveById: builder.query<LeaveRecord, string>({
      query: (id) => `/leaves/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Leaves', id }],
    }),

    createLeave: builder.mutation<LeaveRecord, CreateLeavePayload>({
      query: (body) => ({
        url: '/leaves',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Leaves', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            personnelApi.util.invalidateTags([{ type: 'Personnel', id: 'LIST' }]),
          )
        } catch {
          /* ignore */
        }
      },
    }),

    updateLeave: builder.mutation<LeaveRecord, UpdateLeavePayload>({
      query: ({ id, ...body }) => ({
        url: `/leaves/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Leaves', id },
        { type: 'Leaves', id: 'LIST' },
      ],
    }),

    returnLeave: builder.mutation<LeaveRecord, ReturnLeavePayload>({
      query: ({ id, ...body }) => ({
        url: `/leaves/${id}/return`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Leaves', id },
        { type: 'Leaves', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            personnelApi.util.invalidateTags([{ type: 'Personnel', id: 'LIST' }]),
          )
        } catch {
          /* ignore */
        }
      },
    }),

    deleteLeave: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/leaves/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Leaves', id },
        { type: 'Leaves', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            personnelApi.util.invalidateTags([{ type: 'Personnel', id: 'LIST' }]),
          )
        } catch {
          /* ignore */
        }
      },
    }),

    seedLeaves: builder.mutation<
      { message: string; count: number; leaves?: LeaveRecord[] },
      void
    >({
      query: () => ({
        url: '/leaves/seed',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Leaves', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            personnelApi.util.invalidateTags([{ type: 'Personnel', id: 'LIST' }]),
          )
        } catch {
          /* ignore */
        }
      },
    }),
  }),
})

export const {
  useGetLeavesQuery,
  useGetLeaveByIdQuery,
  useCreateLeaveMutation,
  useUpdateLeaveMutation,
  useReturnLeaveMutation,
  useDeleteLeaveMutation,
  useSeedLeavesMutation,
} = leavesApi
