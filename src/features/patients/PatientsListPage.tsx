import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearchQuery, setStatusFilter, selectFilteredPatients, selectPatient, deletePatient, addPatient } from './patientsSlice';
import { DataGrid, Button, Badge, Card, Input, Select, Dialog, Tooltip } from '@/components/ui';
import type { Patient } from '@/types';
import { formatDate, getInitials, getLocalDateString, getLocalDateDaysFromNow } from '@/utils';
import { PencilSquareIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '@/components/ui';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const statusBadge = (status: string) => {
  if (status === 'active') return <Badge variant="success">Active</Badge>;
  return <Badge variant="default">Inactive</Badge>;
};

interface PatientForm {
  name: string;
  dni: string;
  phone: string;
  email: string;
  healthInsurance: string;
  memberNumber: string;
  notes: string;
  status: 'active' | 'inactive';
}

const emptyForm: PatientForm = {
  name: '',
  dni: '',
  phone: '',
  email: '',
  healthInsurance: '',
  memberNumber: '',
  notes: '',
  status: 'active',
};

export function PatientsListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { searchQuery, statusFilter, patients } = useAppSelector((state) => state.patients);
  const filteredPatients = useAppSelector(selectFilteredPatients);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PatientForm>(emptyForm);

  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(filteredPatients.length / perPage);

  const paginated = filteredPatients.slice((page - 1) * perPage, page * perPage);

  const handleView = (patient: Patient) => {
    dispatch(selectPatient(patient.id));
    navigate(`/patients/${patient.id}`);
  };

  const handleEdit = (patient: Patient) => {
    dispatch(selectPatient(patient.id));
    navigate(`/patients/${patient.id}`);
  };

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deletePatient(deleteId));
      setDeleteId(null);
      showSnackbar('Patient deleted successfully', 'success');
    }
  };

  const handleCreate = () => {
    if (!form.name.trim()) {
      showSnackbar('Patient name is required', 'error');
      return;
    }
    const maxId = patients.reduce((max, p) => {
      const num = parseInt(p.id.replace('P-', ''), 10);
      return num > max ? num : max;
    }, 0);
    const newPatient: Patient = {
      id: `P-${String(maxId + 1).padStart(3, '0')}`,
      name: form.name.trim(),
      dni: form.dni.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      healthInsurance: form.healthInsurance.trim() || 'N/A',
      memberNumber: form.memberNumber.trim() || 'N/A',
      notes: form.notes.trim() || undefined,
      status: form.status,
      nextFollowUpDate: getLocalDateDaysFromNow(30),
      createdAt: getLocalDateString(),
      updatedAt: getLocalDateString(),
    };
    dispatch(addPatient(newPatient));
    setShowCreate(false);
    setForm(emptyForm);
    showSnackbar('Patient created successfully', 'success');
  };

  const updateForm = (field: keyof PatientForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const columns = [
    {
      key: 'name',
      header: 'NAME',
      sortable: true,
      render: (p: Patient) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-primary-700">{getInitials(p.name)}</span>
          </div>
          <p className="font-medium text-gray-900">{p.name}</p>
        </div>
      ),
    },
    { key: 'dni', header: 'NATIONAL ID' },
    { key: 'healthInsurance', header: 'HEALTH INSURANCE' },
    { key: 'memberNumber', header: 'MEMBER #' },
    { key: 'phone', header: 'PHONE' },
    {
      key: 'createdAt',
      header: 'CREATED DATE',
      render: (p: Patient) => formatDate(p.createdAt),
    },
    {
      key: 'notes',
      header: 'NOTES',
      render: (p: Patient) => {
        if (!p.notes) return <span className="text-gray-400">{'\u2014'}</span>;
        const lines = p.notes.split('\n').filter(Boolean);
        return (
          <Tooltip
            content={
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Notes
                </p>
                {lines.length > 1 ? (
                  <ul className="space-y-1">
                    {lines.map((line, i) => (
                      <li key={i} className="text-sm text-gray-700">{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700">{p.notes}</p>
                )}
              </div>
            }
          >
            <span className="text-gray-500 text-sm truncate block max-w-xs cursor-default">
              {p.notes}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: 'status',
      header: 'CLIENT STATUS',
      render: (p: Patient) => statusBadge(p.status),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      render: (p: Patient) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleView(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <EyeIcon className="h-4 w-4" />
          </button>
          <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredPatients.length} total patients</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon className="h-4 w-4" />
          New Patient
        </Button>
      </div>

      <Card>
        <div className="space-y-3 mb-4">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, DNI, phone, or member #..."
              value={searchQuery}
              onChange={(e) => {
                dispatch(setSearchQuery(e.target.value));
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            options={statusOptions}
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => {
              dispatch(setStatusFilter(e.target.value));
              setPage(1);
            }}
            className="w-full sm:w-44"
          />
        </div>

        <DataGrid
          columns={columns}
          data={paginated}
          keyExtractor={(p) => p.id}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="No patients found matching your search."
        />
      </Card>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Patient"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this patient? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={showCreate}
        onClose={() => { setShowCreate(false); setForm(emptyForm); }}
        title="New Patient"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <Input
              placeholder="Patient full name"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
              <Input
                placeholder="e.g. 45.678.901"
                value={form.dni}
                onChange={(e) => updateForm('dni', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                placeholder="e.g. +52 55 1234 5678"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              placeholder="patient@email.com"
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Health Insurance</label>
              <Input
                placeholder="e.g. IMSS, ISSSTE"
                value={form.healthInsurance}
                onChange={(e) => updateForm('healthInsurance', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member #</label>
              <Input
                placeholder="Insurance member number"
                value={form.memberNumber}
                onChange={(e) => updateForm('memberNumber', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              options={statusOptions}
              value={form.status}
              onChange={(e) => updateForm('status', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <Input
              placeholder="Optional notes"
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowCreate(false); setForm(emptyForm); }}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Patient
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
