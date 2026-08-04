import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders, addOrder, updateOrder } from '@/features/orders/ordersSlice';
import { fetchMedications, selectMedicationOptions, addMedication } from '@/features/medications/medicationsSlice';
import { fetchFollowUps } from '@/features/followups/followupsSlice';
import { Card, CardHeader, CardTitle, Badge, Button, Tabs, Dialog, Input, DropdownSelect } from '@/components/ui';
import { formatDate, statusLabels, statusColors } from '@/utils';
import { ArrowLeftIcon, UserIcon, DocumentTextIcon, CubeIcon, ArrowPathIcon, PlusIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '@/components/ui';
import type { Order, OrderMedication, FollowUpStatus } from '@/types';

type TabId = 'info' | 'orders' | 'history';

interface ActivityEvent {
  id: string;
  date: string;
  sortDate: string;
  type: 'patient_created' | 'order_issued' | 'order_pickup' | 'follow_up';
  description: string;
  details?: string;
  status?: string;
}

interface MedicationRow {
  medicationId: string;
  medicationName: string;
  quantity: string;
}

const eventIcons: Record<ActivityEvent['type'], React.ElementType> = {
  patient_created: UserIcon,
  order_issued: DocumentTextIcon,
  order_pickup: CubeIcon,
  follow_up: ArrowPathIcon,
};

const eventColors: Record<ActivityEvent['type'], string> = {
  patient_created: 'bg-green-100 text-green-600',
  order_issued: 'bg-blue-100 text-blue-600',
  order_pickup: 'bg-amber-100 text-amber-600',
  follow_up: 'bg-purple-100 text-purple-600',
};

function buildTimeline(
  patient: { id: string; createdAt: string; name: string },
  orders: Order[],
  followUps: { id: string; scheduledDate: string; status: FollowUpStatus; notes?: string; createdAt: string }[],
  t: (key: string, options?: Record<string, string>) => string,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  events.push({
    id: 'evt-patient-created',
    date: patient.createdAt,
    sortDate: patient.createdAt,
    type: 'patient_created',
    description: t('patient.registeredInSystem'),
  });

  for (const rx of orders) {
    const names = rx.medications.map((m) => m.medicationName).join(', ');
    events.push({
      id: `evt-rx-issued-${rx.id}`,
      date: rx.createdAt,
      sortDate: rx.createdAt,
      type: 'order_issued',
      description: t('order.issuedWithMedications', { names }),
    });
    events.push({
      id: `evt-rx-pickup-${rx.id}`,
      date: rx.lastPickupDate ?? rx.createdAt,
      sortDate: rx.createdAt,
      type: 'order_pickup',
      description: t('order.pickedUpWithMedications', { names }),
    });
  }

  for (const fu of followUps) {
    const label = statusLabels[fu.status] || fu.status.replace(/_/g, ' ');
    events.push({
      id: `evt-fu-${fu.id}`,
      date: fu.scheduledDate,
      sortDate: fu.createdAt,
      type: 'follow_up',
      description: t('followUp.withStatus', { label }),
      details: fu.notes || undefined,
      status: fu.status,
    });
  }

  events.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  return events;
}

const emptyMedicationRow: MedicationRow = {
  medicationId: '',
  medicationName: '',
  quantity: '',
};

export function PatientDetailPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const patient = useAppSelector((state) =>
    state.patients.patients.find((p) => p.id === id),
  );
  const orders = useAppSelector((state) => state.orders.orders);
  const medicationOptions = useAppSelector(selectMedicationOptions);

  useEffect(() => {
    dispatch(fetchMedications());
    dispatch(fetchOrders(id));
    dispatch(fetchFollowUps());
  }, [dispatch, id]);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxMeds, setRxMeds] = useState<MedicationRow[]>([{ ...emptyMedicationRow }]);
  const [rxNotes, setRxNotes] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState('');

  const patientOrders = useMemo(
    () => orders.filter((p) => p.patientId === id),
    [id, orders],
  );

  const allFollowUps = useAppSelector((state) => state.followups.followUps);
  const patientFollowUps = useMemo(
    () => allFollowUps.filter((f) => f.patientId === id),
    [id, allFollowUps],
  );

  const timeline = useMemo(
    () => (patient ? buildTimeline(patient, patientOrders, patientFollowUps, t) : []),
    [patient, patientOrders, patientFollowUps, t],
  );

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('patient.notFound')}</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/patients')}>
          {t('common.backToPatients')}
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: t('patient.patientInfo') },
    { id: 'orders', label: t('patient.orders'), count: patientOrders.length },
    { id: 'history', label: t('patient.activityLog'), count: timeline.length },
  ];

  const handleAddMedicationRow = () => {
    setRxMeds((prev) => [...prev, { ...emptyMedicationRow }]);
  };

  const handleRemoveMedicationRow = (idx: number) => {
    setRxMeds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMedicationChange = (idx: number, field: keyof MedicationRow, value: string) => {
    setRxMeds((prev) => {
      const updated = prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row));
      if (field === 'medicationId') {
        const opt = medicationOptions.find((o) => o.value === value);
        updated[idx].medicationName = opt?.label || '';
      }
      return updated;
    });
  };

  const resetMedForm = () => {
    setMedName('');
  };

  const handleCreateMedication = async () => {
    if (!medName.trim()) {
      showSnackbar(t('medication.nameRequired'), 'error');
      return;
    }
    try {
      await dispatch(addMedication({
        name: medName.trim(),
      })).unwrap();
      setShowMedForm(false);
      resetMedForm();
      showSnackbar(t('medication.createdSuccess'), 'success');
    } catch {
      showSnackbar(t('medication.createFailed'), 'error');
    }
  };

  const handleEditRx = (order: Order) => {
    setEditingOrderId(order.id);
    setRxMeds(order.medications.map((m) => ({
      medicationId: m.medicationId,
      medicationName: m.medicationName,
      quantity: m.quantity,
    })));
    setRxNotes(order.notes || '');
    setShowRxForm(true);
  };

  const handleCreateRx = async () => {
    const validMeds = rxMeds.filter((m) => m.medicationId && m.quantity);
    if (validMeds.length === 0) {
      showSnackbar(t('order.requireMedication'), 'error');
      return;
    }
    const medications: OrderMedication[] = validMeds.map((m) => ({
      medicationId: m.medicationId,
      medicationName: m.medicationName,
      quantity: m.quantity,
    }));
    try {
      if (editingOrderId) {
        await dispatch(updateOrder({
          id: editingOrderId,
          data: { medications, notes: rxNotes.trim() || undefined },
        })).unwrap();
        setEditingOrderId(null);
        showSnackbar(t('order.updatedSuccess'), 'success');
      } else {
        await dispatch(addOrder({
          patientId: patient.id,
          patientName: patient.name,
          medications,
          notes: rxNotes.trim() || undefined,
        })).unwrap();
        dispatch(fetchFollowUps());
        showSnackbar(t('order.createdSuccess'), 'success');
      }
      setShowRxForm(false);
      setRxMeds([{ ...emptyMedicationRow }]);
      setRxNotes('');
    } catch {
      showSnackbar(editingOrderId ? t('order.updateFailed') : t('order.createFailed'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-sm text-gray-500">{t('patient.patientId')}: {patient.id}</p>
        </div>
        <Badge variant={patient.status === 'active' ? 'success' : 'default'}>
          {patient.status === 'active' ? t('common.active') : t('common.inactive')}
        </Badge>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as TabId)}
      />

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('patient.contactInfo')}</CardTitle>
            </CardHeader>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('patient.phone')}</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('patient.dni')}</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.dni || '\u2014'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('patient.address')}</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.address || '\u2014'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('patient.email')}</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.email}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('patient.insuranceInfo')}</CardTitle>
            </CardHeader>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('patient.healthInsurance')}</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.healthInsurance}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('patient.memberNumber')}</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.memberNumber}</dd>
              </div>
            </dl>
          </Card>

          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle>{t('patient.notes')}</CardTitle>
              </CardHeader>
              <p className="text-sm text-gray-700">{patient.notes}</p>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('patient.timeline')}</CardTitle>
            </CardHeader>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('common.created')}</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(patient.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('common.lastUpdated')}</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(patient.updatedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">{t('patient.nextFollowUp')}</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(patient.nextFollowUpDate)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{`${t('patient.orders')} (${patientOrders.length})`}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowMedForm(true)}>
                <PlusIcon className="h-4 w-4" />
                {t('medication.new')}
              </Button>
              <Button size="sm" onClick={() => setShowRxForm(true)}>
                <PlusIcon className="h-4 w-4" />
                {t('order.newOrder')}
              </Button>
            </div>
          </CardHeader>
          {patientOrders.length === 0 ? (
            <p className="text-sm text-gray-500">{t('order.noOrders')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase border-b">
                    <th className="pb-3 pr-4 font-medium">{t('order.issueDate')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('order.medications')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('order.lastPickup')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('order.nextPickup')}</th>
                    <th className="pb-3 pr-4 font-medium">{t('order.notes')}</th>
                    <th className="pb-3 font-medium">{t('order.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patientOrders.map((rx) => (
                    <tr key={rx.id}>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{formatDate(rx.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <div className="space-y-1">
                          {rx.medications.map((med) => (
                            <div key={med.medicationId} className="text-gray-900">
                              <span className="font-medium">{med.medicationName}</span>
                              <span className="text-gray-500 ml-2">{med.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{rx.lastPickupDate ? formatDate(rx.lastPickupDate) : '\u2014'}</td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{rx.nextPickupDate ? formatDate(rx.nextPickupDate) : '\u2014'}</td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap text-sm">{rx.notes || <span className="text-gray-400">{'\u2014'}</span>}</td>
                      <td className="py-3">
                        <button onClick={() => handleEditRx(rx)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>{`${t('patient.activityLog')} (${timeline.length})`}</CardTitle>
          </CardHeader>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">{t('activity.none')}</p>
          ) : (
            <div className="relative px-1">
              <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gray-200" />
              <div className="space-y-0">
                {timeline.map((evt) => {
                  const Icon = eventIcons[evt.type];
                  return (
                    <div key={evt.id} className="relative flex gap-4 pb-6 last:pb-0">
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full ${eventColors[evt.type]} flex items-center justify-center`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">{evt.description}</p>
                          {evt.status && (
                            <Badge className={statusColors[evt.status as FollowUpStatus]}>
                              {statusLabels[evt.status as FollowUpStatus]}
                            </Badge>
                          )}
                        </div>
                        {evt.details && (
                          <p className="text-sm text-gray-500 mt-0.5">{evt.details}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(evt.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      <Dialog
        open={showRxForm}
        onClose={() => { setShowRxForm(false); setEditingOrderId(null); setRxMeds([{ ...emptyMedicationRow }]); setRxNotes(''); }}
        title={editingOrderId ? t('order.editOrder') : t('order.newOrder')}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('order.medications')}</label>
            <div className="space-y-3">
              {rxMeds.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <DropdownSelect
                      searchable
                      options={medicationOptions}
                      placeholder={t('order.selectMedication')}
                      value={row.medicationId}
                      onChange={(value) => handleMedicationChange(idx, 'medicationId', value)}
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      placeholder={t('order.quantity')}
                      value={row.quantity}
                      onChange={(e) => handleMedicationChange(idx, 'quantity', e.target.value)}
                    />
                  </div>

                  {rxMeds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicationRow(idx)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-0.5"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddMedicationRow}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              {t('common.add')}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('order.notes')}</label>
            <Input
              placeholder={t('order.notesPlaceholder')}
              value={rxNotes}
              onChange={(e) => setRxNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => { setShowRxForm(false); setEditingOrderId(null); setRxMeds([{ ...emptyMedicationRow }]); setRxNotes(''); }}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateRx}>
            {editingOrderId ? t('order.updateOrder') : t('order.createOrder')}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={showMedForm}
        onClose={() => { setShowMedForm(false); resetMedForm(); }}
        title={t('medication.new')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('medication.name')}</label>
            <Input
              placeholder={t('medication.namePlaceholder')}
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowMedForm(false); resetMedForm(); }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateMedication}>
            {t('medication.create')}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
