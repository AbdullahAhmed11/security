import { createApi } from '@reduxjs/toolkit/query/react'

import { apiBaseQuery } from './baseQuery'

import type { ArchiveDocument, DocumentType } from '../types'

export type CreateArchivePayload = Omit<ArchiveDocument, 'id' | 'serialNumber'>
export type UpdateArchivePayload = Partial<
  Omit<ArchiveDocument, 'id' | 'serialNumber'>
> & { id: string }

export type ArchiveAttachment = {
  id: string
  documentId: string
  originalName: string
  mimeType: string
  size: number
  kind: 'image' | 'document'
  notes: string
  createdAt: string
  url: string
}

export const archiveApi = createApi({
  reducerPath: 'archiveApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Archive', 'ArchiveAttachments'],
  endpoints: (builder) => ({
    getArchive: builder.query<
      ArchiveDocument[],
      { type?: string; q?: string; personId?: string } | void
    >({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.type) search.set('type', params.type)
        if (params?.q) search.set('q', params.q)
        if (params?.personId) search.set('personId', params.personId)
        const qs = search.toString()
        return qs ? `/archive?${qs}` : '/archive'
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Archive' as const, id })),
              { type: 'Archive', id: 'LIST' },
            ]
          : [{ type: 'Archive', id: 'LIST' }],
    }),

    getArchiveById: builder.query<ArchiveDocument, string>({
      query: (id) => `/archive/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Archive', id }],
    }),

    createArchive: builder.mutation<ArchiveDocument, CreateArchivePayload>({
      query: (body) => ({
        url: '/archive',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Archive', id: 'LIST' }],
    }),

    updateArchive: builder.mutation<ArchiveDocument, UpdateArchivePayload>({
      query: ({ id, ...body }) => ({
        url: `/archive/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Archive', id },
        { type: 'Archive', id: 'LIST' },
      ],
    }),

    deleteArchive: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/archive/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Archive', id },
        { type: 'Archive', id: 'LIST' },
        { type: 'ArchiveAttachments', id: 'LIST' },
      ],
    }),

    seedArchive: builder.mutation<
      { message: string; count: number; documents?: ArchiveDocument[] },
      void
    >({
      query: () => ({
        url: '/archive/seed',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Archive', id: 'LIST' }],
    }),

    getArchiveAttachments: builder.query<
      ArchiveAttachment[],
      { documentId?: string } | void
    >({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.documentId) search.set('documentId', params.documentId)
        const qs = search.toString()
        return qs ? `/archive/attachments?${qs}` : '/archive/attachments'
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'ArchiveAttachments' as const,
                id,
              })),
              { type: 'ArchiveAttachments', id: 'LIST' },
            ]
          : [{ type: 'ArchiveAttachments', id: 'LIST' }],
    }),

    uploadArchiveAttachment: builder.mutation<
      ArchiveAttachment,
      { file: File; documentId: string; notes?: string }
    >({
      query: ({ file, documentId, notes }) => {
        const form = new FormData()
        form.append('file', file)
        form.append('documentId', documentId)
        if (notes) form.append('notes', notes)
        return {
          url: '/archive/attachments',
          method: 'POST',
          body: form,
        }
      },
      invalidatesTags: [{ type: 'ArchiveAttachments', id: 'LIST' }],
    }),

    deleteArchiveAttachment: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/archive/attachments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ArchiveAttachments', id },
        { type: 'ArchiveAttachments', id: 'LIST' },
      ],
    }),
  }),
})

export type { DocumentType }

export const {
  useGetArchiveQuery,
  useGetArchiveByIdQuery,
  useCreateArchiveMutation,
  useUpdateArchiveMutation,
  useDeleteArchiveMutation,
  useSeedArchiveMutation,
  useGetArchiveAttachmentsQuery,
  useUploadArchiveAttachmentMutation,
  useDeleteArchiveAttachmentMutation,
} = archiveApi
