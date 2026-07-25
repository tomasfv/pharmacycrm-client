import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearchQuery, setStatusFilter, selectFilteredPatients, selectPatient, fetchPatients, deletePatient, addPatient, updatePatientAsync } from './patientsSlice';
import { DataGrid, Button, Badge, Card, Input, Select, Dialog, Tooltip } from '@/components/ui';
import type { Patient } from '@/types';
import { formatDate, getInitials, getLocalDateString, getLocalDateDaysFromNow } from '@/utils';
import { PencilSquareIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '@/components/ui';

interface PatientForm {
  name: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
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
  address: '',
  healthInsurance: '',
  memberNumber: '',
  notes: '',
  status: 'active',
};

export function PatientsListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const { searchQuery, statusFilter, patients, loading } = useAppSelector((state) => state.patients);

  const statusOptions = [
    { value: 'active', label: t('patient.statusActive') },
    { value: 'inactive', label: t('patient.statusInactive') },
  ];

  const statusBadge = (status: string) => {
    if (status === 'active') return <Badge variant="success">{t('patient.statusActive')}</Badge>;
    return <Badge variant="default">{t('patient.statusInactive')}</Badge>;
  };

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);
  const filteredPatients = useAppSelector(selectFilteredPatients);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
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
    setEditPatient(patient);
    setForm({
      name: patient.name,
      dni: patient.dni,
      phone: patient.phone,
      email: patient.email,
      address: patient.address || '',
      healthInsurance: patient.healthInsurance,
      memberNumber: patient.memberNumber,
      notes: patient.notes || '',
      status: patient.status,
    });
  };

  const handleEditSave = async () => {
    if (!editPatient) return;
    if (!form.name.trim()) {
      showSnackbar(t('patient.nameRequired'), 'error');
      return;
    }
    try {
      await dispatch(updatePatientAsync({
        id: editPatient.id,
        data: { ...form, notes: form.notes.trim() || undefined },
      })).unwrap();
      setEditPatient(null);
      setForm(emptyForm);
      showSnackbar(t('patient.updatedSuccess'), 'success');
    } catch {
      showSnackbar(t('patient.updateFailed'), 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deletePatient(deleteId)).unwrap();
        setDeleteId(null);
        showSnackbar(t('patient.deletedSuccess'), 'success');
      } catch {
        showSnackbar(t('patient.deleteFailed'), 'error');
      }
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showSnackbar(t('patient.nameRequired'), 'error');
      return;
    }
    try {
      await dispatch(addPatient({
        name: form.name.trim(),
        dni: form.dni.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim() || undefined,
        healthInsurance: form.healthInsurance.trim() || 'N/A',
        memberNumber: form.memberNumber.trim() || 'N/A',
        notes: form.notes.trim() || undefined,
        status: form.status,
        nextFollowUpDate: getLocalDateDaysFromNow(30),
      })).unwrap();
      setShowCreate(false);
      setForm(emptyForm);
      showSnackbar(t('patient.createdSuccess'), 'success');
    } catch {
      showSnackbar(t('patient.createFailed'), 'error');
    }
  };

  const updateForm = (field: keyof PatientForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const columns = [
    {
      key: 'name',
      header: t('patient.name'),
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
    { key: 'dni', header: t('patient.nationalId') },
    { key: 'healthInsurance', header: t('patient.healthInsurance') },
    { key: 'memberNumber', header: t('patient.memberNumber') },
    { key: 'phone', header: t('patient.phone') },
    {
      key: 'createdAt',
      header: t('patient.createdDate'),
      render: (p: Patient) => formatDate(p.createdAt),
    },
    {
      key: 'notes',
      header: t('patient.notes'),
      render: (p: Patient) => {
        if (!p.notes) return <span className="text-gray-400">{'\u2014'}</span>;
        const lines = p.notes.split('\n').filter(Boolean);
        return (
          <Tooltip
            content={
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t('patient.notes')}
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
      header: t('patient.clientStatus'),
      render: (p: Patient) => statusBadge(p.status),
    },
    {
      key: 'actions',
      header: t('patient.actions'),
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
          <h1 className="text-2xl font-bold text-gray-900">{t('patient.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('patient.totalPatients', { count: filteredPatients.length })}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('patient.newPatient')}
        </Button>
      </div>

      <Card>
        <div className="space-y-3 mb-4">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('patient.searchPlaceholder')}
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
            placeholder={t('patient.allStatuses')}
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
          emptyMessage={t('patient.noPatientsFound')}
        />
      </Card>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t('patient.deletePatient')}
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          {t('patient.deleteConfirm')}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={!!editPatient}
        onClose={() => { setEditPatient(null); setForm(emptyForm); }}
        title={t('patient.editPatient')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.fullName')}</label>
            <Input
              placeholder={t('patient.fullNamePlaceholder')}
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.nationalId')}</label>
              <Input
                placeholder={t('patient.dniPlaceholder')}
                value={form.dni}
                onChange={(e) => updateForm('dni', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.phone')}</label>
              <Input
                placeholder={t('patient.phonePlaceholder')}
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.email')}</label>
            <Input
              placeholder={t('patient.emailPlaceholder')}
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.address')}</label>
            <Input
              placeholder={t('patient.addressPlaceholder')}
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.healthInsurance')}</label>
              <Input
                placeholder={t('patient.insurancePlaceholder')}
                value={form.healthInsurance}
                onChange={(e) => updateForm('healthInsurance', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.memberNumber')}</label>
              <Input
                placeholder={t('patient.memberPlaceholder')}
                value={form.memberNumber}
                onChange={(e) => updateForm('memberNumber', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.status')}</label>
            <Select
              options={statusOptions}
              value={form.status}
              onChange={(e) => updateForm('status', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.notes')}</label>
            <Input
              placeholder={t('patient.notesPlaceholder')}
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setEditPatient(null); setForm(emptyForm); }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleEditSave}>
            {t('common.save')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={showCreate}
        onClose={() => { setShowCreate(false); setForm(emptyForm); }}
        title={t('patient.newPatient')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.fullName')}</label>
            <Input
              placeholder={t('patient.fullNamePlaceholder')}
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.nationalId')}</label>
              <Input
                placeholder={t('patient.dniPlaceholder')}
                value={form.dni}
                onChange={(e) => updateForm('dni', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.phone')}</label>
              <Input
                placeholder={t('patient.phonePlaceholder')}
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.email')}</label>
            <Input
              placeholder={t('patient.emailPlaceholder')}
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.address')}</label>
            <Input
              placeholder={t('patient.addressPlaceholder')}
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.healthInsurance')}</label>
              <Input
                placeholder={t('patient.insurancePlaceholder')}
                value={form.healthInsurance}
                onChange={(e) => updateForm('healthInsurance', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.memberNumber')}</label>
              <Input
                placeholder={t('patient.memberPlaceholder')}
                value={form.memberNumber}
                onChange={(e) => updateForm('memberNumber', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.status')}</label>
            <Select
              options={statusOptions}
              value={form.status}
              onChange={(e) => updateForm('status', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.notes')}</label>
            <Input
              placeholder={t('patient.notesPlaceholder')}
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowCreate(false); setForm(emptyForm); }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreate}>
            {t('patient.createPatient')}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
