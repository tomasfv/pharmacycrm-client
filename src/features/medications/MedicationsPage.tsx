import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMedications, addMedication, updateMedication, deleteMedication, selectMedicationOptions } from './medicationsSlice';
import { DataGrid, Button, Card, Dialog, Input } from '@/components/ui';
import type { Medication } from '@/types';
import { formatDate, getLocalDateString } from '@/utils';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '@/components/ui';

export function MedicationsPage() {
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
      showSnackbar('Medication name is required', 'error');
      return;
    }
    try {
      if (editing) {
        await dispatch(updateMedication({
          ...editing,
          name: name.trim(),
        })).unwrap();
        showSnackbar('Medication updated successfully', 'success');
      } else {
        await dispatch(addMedication({
          name: name.trim(),
        })).unwrap();
        showSnackbar('Medication created successfully', 'success');
      }
      setShowForm(false);
      resetForm();
    } catch {
      showSnackbar('Failed to save medication', 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteMedication(deleteId)).unwrap();
        setDeleteId(null);
        showSnackbar('Medication deleted successfully', 'success');
      } catch {
        showSnackbar('Failed to delete medication', 'error');
      }
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'name',
      header: 'NAME',
      sortable: true,
      render: (m: Medication) => <span className="font-medium text-gray-900">{m.name}</span>,
    },
    {
      key: 'createdAt',
      header: 'CREATED',
      render: (m: Medication) => formatDate(m.createdAt),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      render: (m: Medication) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(m)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteId(m.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
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
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-sm text-gray-500 mt-1">{medications.length} medications</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          New Medication
        </Button>
      </div>

      <Card>
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <DataGrid
          columns={columns}
          data={paginated}
          keyExtractor={(m) => m.id}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="No medications found."
        />
      </Card>

      <Dialog
        open={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editing ? 'Edit Medication' : 'New Medication'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
            <Input
              placeholder="e.g. Metformina 850mg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editing ? 'Save Changes' : 'Create Medication'}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Medication"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this medication? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
