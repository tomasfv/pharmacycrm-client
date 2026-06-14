import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';
import patientsReducer from '@/features/patients/patientsSlice';
import prescriptionsReducer from '@/features/prescriptions/prescriptionsSlice';
import followupsReducer from '@/features/followups/followupsSlice';
import contactsReducer from '@/features/contacts/contactsSlice';
import reportsReducer from '@/features/reports/reportsSlice';
import notificationsReducer from '@/features/notifications/notificationsSlice';
import settingsReducer from '@/features/settings/settingsSlice';
import medicationsReducer from '@/features/medications/medicationsSlice';
import usersReducer from '@/features/users/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    patients: patientsReducer,
    prescriptions: prescriptionsReducer,
    followups: followupsReducer,
    contacts: contactsReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    settings: settingsReducer,
    medications: medicationsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
