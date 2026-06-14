import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ReminderTemplate {
  id: string;
  name: string;
  message: string;
}

interface FollowUpSettings {
  defaultReminderDays: number;
  autoContact: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
}

interface SettingsState {
  general: {
    pharmacyName: string;
    pharmacyAddress: string;
    pharmacyPhone: string;
    pharmacyEmail: string;
    timezone: string;
  };
  followUp: FollowUpSettings;
  reminderTemplates: ReminderTemplate[];
}

const initialState: SettingsState = {
  general: {
    pharmacyName: 'PharmaCare Plus',
    pharmacyAddress: 'Av. Reforma 123, Col. Centro, CDMX',
    pharmacyPhone: '+52 55 1234 5678',
    pharmacyEmail: 'contacto@pharmacare.com',
    timezone: 'America/Mexico_City',
  },
  followUp: {
    defaultReminderDays: 7,
    autoContact: true,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
  },
  reminderTemplates: [
    {
      id: 'RT-001',
      name: 'Pickup Reminder',
      message:
        'Hello {{patient}}, this is a reminder that your medication {{medication}} is ready for pickup at PharmaCare Plus.',
    },
    {
      id: 'RT-002',
      name: 'Follow-Up Due',
      message:
        'Dear {{patient}}, your treatment follow-up for {{medication}} is due. Please contact us to schedule your appointment.',
    },
    {
      id: 'RT-003',
      name: 'Overdue Alert',
      message:
        'Urgent: {{patient}}, your follow-up for {{medication}} is overdue. Please contact us immediately to avoid treatment interruption.',
    },
  ],
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateGeneral(state, action: PayloadAction<Partial<SettingsState['general']>>) {
      state.general = { ...state.general, ...action.payload };
    },
    updateFollowUp(state, action: PayloadAction<Partial<FollowUpSettings>>) {
      state.followUp = { ...state.followUp, ...action.payload };
    },
    updateTemplate(state, action: PayloadAction<ReminderTemplate>) {
      const idx = state.reminderTemplates.findIndex(
        (t) => t.id === action.payload.id,
      );
      if (idx >= 0) {
        state.reminderTemplates[idx] = action.payload;
      }
    },
  },
});

export const { updateGeneral, updateFollowUp, updateTemplate } = settingsSlice.actions;

export default settingsSlice.reducer;
