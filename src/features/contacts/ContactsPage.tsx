import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchContacts, addContact, updateContact, deleteContact } from './contactsSlice';
import { Card, Button, Input, Select, Dialog, DataGrid, Badge, Tooltip } from '@/components/ui';
import { useSnackbar } from '@/components/ui';
import { getLocalDateString } from '@/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Contact, ContactCategory } from '@/types';
import { getInitials } from '@/utils';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const categoryColors: Record<ContactCategory, string> = {
  supplier: 'bg-blue-100 text-blue-800',
  delivery: 'bg-orange-100 text-orange-800',
  doctor: 'bg-green-100 text-green-800',
  lab: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-700',
};

export function ContactsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const contacts = useAppSelector((state) => state.contacts.contacts);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const categoryLabels: Record<ContactCategory, string> = {
    supplier: t('contact.categorySupplier'),
    delivery: t('contact.categoryDelivery'),
    doctor: t('contact.categoryDoctor'),
    lab: t('contact.categoryLab'),
    other: t('contact.categoryOther'),
  };

  const categoryOptions = useMemo(() => [
    { value: 'supplier', label: t('contact.categorySupplier') },
    { value: 'delivery', label: t('contact.categoryDelivery') },
    { value: 'doctor', label: t('contact.categoryDoctor') },
    { value: 'lab', label: t('contact.categoryLab') },
    { value: 'other', label: t('contact.categoryOther') },
  ], [t]);

  const contactSchema = useMemo(() => z.object({
    name: z.string().min(1, t('contact.nameRequired')),
    phone: z.string().min(1, t('contact.phoneRequired')),
    email: z.string().email(t('contact.invalidEmail')).or(z.literal('')),
    category: z.enum(['supplier', 'delivery', 'doctor', 'lab', 'other']),
    notes: z.string(),
  }), [t]);

  type ContactForm = z.infer<typeof contactSchema>;

  const filtered = useMemo(
    () =>
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          c.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [contacts, search],
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const openAdd = () => {
    setEditing(null);
    form.reset({ name: '', phone: '', email: '', category: 'other', notes: '' });
    setOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    form.reset({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      category: contact.category,
      notes: contact.notes,
    });
    setOpen(true);
  };

  const onSubmit = async (data: ContactForm) => {
    try {
      if (editing) {
        await dispatch(updateContact({ ...editing, ...data })).unwrap();
        showSnackbar(t('contact.updated'), 'success');
      } else {
        await dispatch(addContact(data as any)).unwrap();
        showSnackbar(t('contact.added'), 'success');
      }
      setOpen(false);
    } catch {
      showSnackbar(t('contact.saveError'), 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteContact(deleteId)).unwrap();
        setDeleteId(null);
        showSnackbar(t('contact.deleted'), 'success');
      } catch {
        showSnackbar(t('contact.deleteError'), 'error');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('contact.name'),
      sortable: true,
      render: (c: Contact) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-primary-700">{getInitials(c.name)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{c.name}</p>
            <p className="text-xs text-gray-500">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: t('contact.phone') },
    {
      key: 'category',
      header: t('contact.category'),
      render: (c: Contact) => <Badge className={categoryColors[c.category]}>{categoryLabels[c.category]}</Badge>,
    },
    {
      key: 'notes',
      header: t('contact.notes'),
      render: (c: Contact) => (
        <Tooltip content={<p className="text-sm text-gray-700 max-w-xs">{c.notes}</p>}>
          <span className="text-sm text-gray-500 truncate block max-w-[200px] cursor-default">
            {c.notes}
          </span>
        </Tooltip>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c: Contact) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('contact.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('contact.count', { count: contacts.length })}</p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon className="h-4 w-4" />
          {t('contact.addContact')}
        </Button>
      </div>

      <Card>
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('contact.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <DataGrid
          columns={columns}
          data={paginated}
          keyExtractor={(c) => c.id}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={t('contact.noContacts')}
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? t('contact.editContact') : t('contact.addContact')}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label={t('contact.name')} placeholder={t('contact.namePlaceholder')} error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input id="phone" label={t('contact.phone')} placeholder={t('contact.phonePlaceholder')} error={form.formState.errors.phone?.message} {...form.register('phone')} />
          <Input id="email" label={t('contact.email')} placeholder={t('contact.emailPlaceholder')} error={form.formState.errors.email?.message} {...form.register('email')} />
          <Select id="category" label={t('contact.category')} options={categoryOptions} error={form.formState.errors.category?.message} {...form.register('category')} />
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">{t('contact.notes')}</label>
            <textarea
              id="notes"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder={t('contact.notesPlaceholder')}
              {...form.register('notes')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit">{editing ? t('common.save') : t('contact.addContact')}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title={t('contact.deleteContact')} size="sm">
        <p className="text-sm text-gray-600 mb-4">{t('contact.deleteConfirm')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleDelete}>{t('common.delete')}</Button>
        </div>
      </Dialog>
    </div>
  );
}
