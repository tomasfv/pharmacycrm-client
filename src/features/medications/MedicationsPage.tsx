import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMedications, addMedication, updateMedication, deleteMedication, selectMedicationOptions } from './medicationsSlice';
import { DataGrid, Button, Card, Dialog, Input } from '@/components/ui';
import type { Medication } from '@/types';
import { formatDate, getLocalDateString } from '@/utils';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '@/components/ui';

export function MedicationsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();
  const medications = useAppSelector((state) => state.medications.medications);
  const loading = useAppSelector((state) => state.medications.loading);

  useEffect(() => {
    dispatch(fetchMedications());
  }, [dispatch]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const filtered = medications.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const resetForm = () => {
    setEditing(null);
    setName('');
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (med: Medication) => {
    setEditing(med);
    setName(med.name);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showSnackbar(t('medication.nameRequired'), 'error');
      return;
    }
    try {
      if (editing) {
        await dispatch(updateMedication({
          ...editing,
          name: name.trim(),
        })).unwrap();
        showSnackbar(t('medication.updatedSuccess'), 'success');
      } else {
        await dispatch(addMedication({
          name: name.trim(),
        })).unwrap();
        showSnackbar(t('medication.createdSuccess'), 'success');
      }
      setShowForm(false);
      resetForm();
    } catch {
      showSnackbar(t('medication.saveError'), 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteMedication(deleteId)).unwrap();
        setDeleteId(null);
        showSnackbar(t('medication.deletedSuccess'), 'success');
      } catch {
        showSnackbar(t('medication.deleteError'), 'error');
      }
    }
  };

  const columns = [
    { key: 'id', header: t('medication.id') },
    {
      key: 'name',
      header: t('medication.name'),
      sortable: true,
      render: (m: Medication) => <span className='font-medium text-gray-900'>{m.name}</span>,
    },
    {
      key: 'createdAt',
      header: t('medication.created'),
      render: (m: Medication) => formatDate(m.createdAt),
    },
    {
      key: 'actions',
      header: t('medication.actions'),
      render: (m: Medication) => (
        <div className='flex gap-2' onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(m)}
            className='p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors'
          >
            <PencilSquareIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => setDeleteId(m.id)}
            className='p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors'
          >
            <TrashIcon className='h-4 w-4' />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>{t('medication.medications')}</h1>
          <p className='text-sm text-gray-500 mt-1'>{t('medication.medicationCount', { count: medications.length })}</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className='h-4 w-4' />
          {t('medication.new')}
        </Button>
      </div>

      <Card>
        <div className='relative mb-4'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            placeholder={t('medication.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className='pl-9'
          />
        </div>
        <DataGrid
          columns={columns}
          data={paginated}
          keyExtractor={(m) => m.id}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={t('medication.empty')}
        />
      </Card>

      <Dialog
        open={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editing ? t('medication.edit') : t('medication.new')}
        size='md'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>{t('medication.name')} *</label>
            <Input
              placeholder={t('medication.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className='flex justify-end gap-3 mt-6'>
          <Button variant='secondary' onClick={() => { setShowForm(false); resetForm(); }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {editing ? t('common.save') : t('medication.create')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t('medication.delete')}
        size='sm'
      >
        <p className='text-sm text-gray-600 mb-4'>
          {t('medication.deleteConfirm')}
        </p>
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={() => setDeleteId(null)}>{t('common.cancel')}</Button>
          <Button variant='danger' onClick={handleDelete}>{t('common.delete')}</Button>
        </div>
      </Dialog>
    </div>
  );
}
