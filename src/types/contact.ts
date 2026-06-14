import type { ContactCategory } from './common';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: ContactCategory;
  notes: string;
  createdAt: string;
}
