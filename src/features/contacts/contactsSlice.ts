import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Contact } from '@/types';
import { mockContacts } from '@/mock';

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
}

const initialState: ContactsState = {
  contacts: mockContacts,
  loading: false,
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    addContact(state, action: PayloadAction<Contact>) {
      state.contacts.unshift(action.payload);
    },
    updateContact(state, action: PayloadAction<Contact>) {
      const idx = state.contacts.findIndex((c) => c.id === action.payload.id);
      if (idx >= 0) state.contacts[idx] = action.payload;
    },
    deleteContact(state, action: PayloadAction<string>) {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addContact, updateContact, deleteContact } = contactsSlice.actions;

export default contactsSlice.reducer;
