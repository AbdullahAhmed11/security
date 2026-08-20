import { configureStore } from '@reduxjs/toolkit'

import { archiveApi } from './archiveApi'
import { dutiesApi } from './dutiesApi'
import { excellenceApi } from './excellenceApi'
import { leavesApi } from './leavesApi'
import { personnelApi } from './personnelApi'
import { reportsApi } from './reportsApi'

export const store = configureStore({
  reducer: {
    [personnelApi.reducerPath]: personnelApi.reducer,
    [leavesApi.reducerPath]: leavesApi.reducer,
    [dutiesApi.reducerPath]: dutiesApi.reducer,
    [excellenceApi.reducerPath]: excellenceApi.reducer,
    [archiveApi.reducerPath]: archiveApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(personnelApi.middleware)
      .concat(leavesApi.middleware)
      .concat(dutiesApi.middleware)
      .concat(excellenceApi.middleware)
      .concat(archiveApi.middleware)
      .concat(reportsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
