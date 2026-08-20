import { createApi } from '@reduxjs/toolkit/query/react'

import { apiBaseQuery } from './baseQuery'

import type { Person } from '../types'

// Same-origin `/api` → Vite proxies to backend (see vite.config.ts)
export type CreatePersonPayload = Omit<Person, 'id'>
export type UpdatePersonPayload = Partial<Omit<Person, 'id'>> & { id: string }

export const personnelApi = createApi({
  reducerPath: 'personnelApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Personnel'],
  endpoints: (builder) => ({
    getPersonnel: builder.query<Person[], void>({
      query: () => '/personnel',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Personnel' as const, id })),
              { type: 'Personnel', id: 'LIST' },
            ]
          : [{ type: 'Personnel', id: 'LIST' }],
    }),

    getPersonById: builder.query<Person, string>({
      query: (id) => `/personnel/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Personnel', id }],
    }),

    createPerson: builder.mutation<Person, CreatePersonPayload>({
      query: (body) => ({
        url: '/personnel',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Personnel', id: 'LIST' }],
    }),

    updatePerson: builder.mutation<Person, UpdatePersonPayload>({
      query: ({ id, ...body }) => ({
        url: `/personnel/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Personnel', id },
        { type: 'Personnel', id: 'LIST' },
      ],
    }),

    deletePerson: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/personnel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Personnel', id },
        { type: 'Personnel', id: 'LIST' },
      ],
    }),

    seedPersonnel: builder.mutation<
      { message: string; count: number; people?: Person[] },
      void
    >({
      query: () => ({
        url: '/personnel/seed',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Personnel', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPersonnelQuery,
  useGetPersonByIdQuery,
  useCreatePersonMutation,
  useUpdatePersonMutation,
  useDeletePersonMutation,
  useSeedPersonnelMutation,
} = personnelApi
