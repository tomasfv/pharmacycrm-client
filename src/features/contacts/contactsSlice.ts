import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactsApi } from '@/api/contacts';
import type { Contact } from '@/types';

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
}

const initialState: ContactsState = {
  contacts: [],
  loading: false,
};

export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await contactsApi.getAll();
      return data.data as Contact[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch contacts');
    }
  },
);

export const addContact = createAsyncThunk(
  'contacts/add',
  async (contactData: Omit<Contact, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const { data } = await contactsApi.create(contactData);
      return data.data as Contact;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create contact');
    }
  },
);

export const updateContact = createAsyncThunk(
  'contacts/update',
  async (contact: Contact, { rejectWithValue }) => {
    try {
      const { id, ...rest } = contact;
      const { data } = await contactsApi.update(id, rest);
      return data.data as Contact;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update contact');
    }
  },
);

export const deleteContact = createAsyncThunk(
  'contacts/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await contactsApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete contact');
    }
  },
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.loading = true; })
      .addCase(fetchContacts.fulfilled, (state, action) => { state.loading = false; state.contacts = action.payload; })
      .addCase(fetchContacts.rejected, (state) => { state.loading = false; })
      .addCase(addContact.fulfilled, (state, action) => { state.contacts.unshift(action.payload); })
      .addCase(updateContact.fulfilled, (state, action) => {
        const idx = state.contacts.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.contacts[idx] = action.payload;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter((c) => c.id !== action.payload);
      });
  },
});

export default contactsSlice.reducer;
