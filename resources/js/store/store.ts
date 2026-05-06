import { configureStore } from '@reduxjs/toolkit';
import smartBinsReducer from './slices/smartBinsSlice';
import usersReducer from './slices/usersSlice';
import dashboardReducer from './slices/dashboardSlice';
import staffReducer from './slices/staffSlice';
import rolesReducer from './slices/rolesSlice';
import financeReducer from './slices/financeSlice';

export const store = configureStore({
    reducer: {
        smartBins: smartBinsReducer,
        users: usersReducer,
        dashboard: dashboardReducer,
        staff: staffReducer,
        roles: rolesReducer,
        finance: financeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
