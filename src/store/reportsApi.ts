import { createApi } from '@reduxjs/toolkit/query/react'

import { apiBaseQuery } from './baseQuery'

export type ReportKey =
  | 'people'
  | 'leaves'
  | 'duties'
  | 'excellence'
  | 'archive'

export type ReportsQuery = {
  type: ReportKey
  dateFrom?: string
  dateTo?: string
  personId?: string
}

export type ReportResponse = {
  type: ReportKey
  title: string
  rows: Record<string, unknown>[]
}

export type ReportFile = {
  id: string
  originalName: string
  mimeType: string
  size: number
  kind: 'image' | 'document'
  reportType: string
  notes: string
  createdAt: string
  url: string
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['ReportFiles'],
  endpoints: (builder) => ({
    getReport: builder.query<ReportResponse, ReportsQuery>({
      query: ({ type, dateFrom, dateTo, personId }) => {
        const search = new URLSearchParams({ type })
        if (dateFrom) search.set('dateFrom', dateFrom)
        if (dateTo) search.set('dateTo', dateTo)
        if (personId) search.set('personId', personId)
        return `/reports?${search.toString()}`
      },
    }),

    getReportFiles: builder.query<ReportFile[], { reportType?: string } | void>({
      query: (params) => {
        const search = new URLSearchParams()
        if (params?.reportType) search.set('reportType', params.reportType)
        const qs = search.toString()
        return qs ? `/reports/files?${qs}` : '/reports/files'
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ReportFiles' as const, id })),
              { type: 'ReportFiles', id: 'LIST' },
            ]
          : [{ type: 'ReportFiles', id: 'LIST' }],
    }),

    uploadReportFile: builder.mutation<
      ReportFile,
      { file: File; reportType?: string; notes?: string }
    >({
      query: ({ file, reportType, notes }) => {
        const form = new FormData()
        form.append('file', file)
        if (reportType) form.append('reportType', reportType)
        if (notes) form.append('notes', notes)
        return {
          url: '/reports/files',
          method: 'POST',
          body: form,
        }
      },
      invalidatesTags: [{ type: 'ReportFiles', id: 'LIST' }],
    }),

    deleteReportFile: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/reports/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ReportFiles', id },
        { type: 'ReportFiles', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetReportQuery,
  useGetReportFilesQuery,
  useUploadReportFileMutation,
  useDeleteReportFileMutation,
} = reportsApi
