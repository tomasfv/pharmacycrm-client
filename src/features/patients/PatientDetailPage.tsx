import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPrescriptions, addPrescription } from '@/features/prescriptions/prescriptionsSlice';
import { fetchMedications, selectMedicationOptions, addMedication } from '@/features/medications/medicationsSlice';
import { fetchFollowUps } from '@/features/followups/followupsSlice';
import { Card, CardHeader, CardTitle, Badge, Button, Tabs, Dialog, Input, Select } from '@/components/ui';
import { formatDate, statusLabels, statusColors, getLocalDateString, getLocalDateDaysFromNow } from '@/utils';
import { ArrowLeftIcon, UserIcon, DocumentTextIcon, CubeIcon, ArrowPathIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '@/components/ui';
import type { Prescription, PrescriptionMedication, FollowUpStatus } from '@/types';

type TabId = 'info' | 'prescriptions' | 'history';

interface ActivityEvent {
  id: string;
  date: string;
  type: 'patient_created' | 'prescription_issued' | 'prescription_pickup' | 'follow_up';
  description: string;
  details?: string;
  status?: string;
}

interface MedicationRow {
  medicationId: string;
  medicationName: string;
  quantity: string;
  frequency: string;
}

const eventIcons: Record<ActivityEvent['type'], React.ElementType> = {
  patient_created: UserIcon,
  prescription_issued: DocumentTextIcon,
  prescription_pickup: CubeIcon,
  follow_up: ArrowPathIcon,
};

const eventColors: Record<ActivityEvent['type'], string> = {
  patient_created: 'bg-green-100 text-green-600',
  prescription_issued: 'bg-blue-100 text-blue-600',
  prescription_pickup: 'bg-amber-100 text-amber-600',
  follow_up: 'bg-purple-100 text-purple-600',
};

function buildTimeline(
  patient: { id: string; createdAt: string; name: string },
  prescriptions: Prescription[],
  followUps: { id: string; scheduledDate: string; status: FollowUpStatus; notes?: string }[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  events.push({
    id: 'evt-patient-created',
    date: patient.createdAt,
    type: 'patient_created',
    description: 'Patient registered in the system',
  });

  for (const rx of prescriptions) {
    const names = rx.medications.map((m) => m.medicationName).join(', ');
    events.push({
      id: `evt-rx-issued-${rx.id}`,
      date: rx.createdAt,
      type: 'prescription_issued',
      description: `Prescription issued: ${names}`,
    });
    events.push({
      id: `evt-rx-pickup-${rx.id}`,
      date: rx.lastPickupDate,
      type: 'prescription_pickup',
      description: `Prescription picked up: ${names}`,
    });
  }

  for (const fu of followUps) {
    const label = statusLabels[fu.status] || fu.status.replace(/_/g, ' ');
    events.push({
      id: `evt-fu-${fu.id}`,
      date: fu.scheduledDate,
      type: 'follow_up',
      description: `Follow-up: ${label}`,
      details: fu.notes || undefined,
      status: fu.status,
    });
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

const emptyMedicationRow: MedicationRow = {
  medicationId: '',
  medicationName: '',
  quantity: '',
  frequency: '',
};

export function PatientDetailPage() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const patient = useAppSelector((state) =>
    state.patients.patients.find((p) => p.id === id),
  );
  const prescriptions = useAppSelector((state) => state.prescriptions.prescriptions);
  const medicationOptions = useAppSelector(selectMedicationOptions);

  useEffect(() => {
    dispatch(fetchMedications());
    dispatch(fetchPrescriptions(id));
    dispatch(fetchFollowUps());
  }, [dispatch, id]);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxMeds, setRxMeds] = useState<MedicationRow[]>([{ ...emptyMedicationRow }]);
  const [rxNotes, setRxNotes] = useState('');
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medBrand, setMedBrand] = useState('');
  const [medDrug, setMedDrug] = useState('');
  const [medLab, setMedLab] = useState('');

  const patientPrescriptions = useMemo(
    () => prescriptions.filter((p) => p.patientId === id),
    [id, prescriptions],
  );

  const allFollowUps = useAppSelector((state) => state.followups.followUps);
  const patientFollowUps = useMemo(
    () => allFollowUps.filter((f) => f.patientId === id),
    [id, allFollowUps],
  );

  const timeline = useMemo(
    () => (patient ? buildTimeline(patient, patientPrescriptions, patientFollowUps) : []),
    [patient, patientPrescriptions, patientFollowUps],
  );

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/patients')}>
          Back to Patients
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Personal Information' },
    { id: 'prescriptions', label: 'Prescriptions', count: patientPrescriptions.length },
    { id: 'history', label: 'Activity', count: timeline.length },
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
    setMedBrand('');
    setMedDrug('');
    setMedLab('');
  };

  const handleCreateMedication = async () => {
    if (!medName.trim()) {
      showSnackbar('Medication name is required', 'error');
      return;
    }
    try {
      await dispatch(addMedication({
        name: medName.trim(),
        brand: medBrand.trim(),
        drug: medDrug.trim(),
        laboratory: medLab.trim(),
      })).unwrap();
      setShowMedForm(false);
      resetMedForm();
      showSnackbar('Medication created successfully', 'success');
    } catch {
      showSnackbar('Failed to create medication', 'error');
    }
  };

  const handleCreateRx = async () => {
    const validMeds = rxMeds.filter((m) => m.medicationId && m.quantity && m.frequency);
    if (validMeds.length === 0) {
      showSnackbar('Add at least one medication with quantity and frequency', 'error');
      return;
    }
    const medications: PrescriptionMedication[] = validMeds.map((m) => ({
      medicationId: m.medicationId,
      medicationName: m.medicationName,
      quantity: m.quantity,
      frequency: m.frequency,
    }));
    try {
      await dispatch(addPrescription({
        patientId: patient.id,
        patientName: patient.name,
        medications,
        lastPickupDate: getLocalDateString(),
        nextPickupDate: getLocalDateDaysFromNow(30),
      })).unwrap();
      dispatch(fetchFollowUps());
      setShowRxForm(false);
      setRxMeds([{ ...emptyMedicationRow }]);
      setRxNotes('');
      showSnackbar('Prescription created successfully', 'success');
    } catch {
      showSnackbar('Failed to create prescription', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
        </div>
        <Badge variant={patient.status === 'active' ? 'success' : 'default'}>
          {patient.status === 'active' ? 'Active' : 'Inactive'}
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
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.email}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Health Insurance</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.healthInsurance}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Member Number</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.memberNumber}</dd>
              </div>
            </dl>
          </Card>

          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <p className="text-sm text-gray-700">{patient.notes}</p>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(patient.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(patient.updatedAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Next Follow-Up</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(patient.nextFollowUpDate)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Prescriptions ({patientPrescriptions.length})</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowMedForm(true)}>
                <PlusIcon className="h-4 w-4" />
                New Medication
              </Button>
              <Button size="sm" onClick={() => setShowRxForm(true)}>
                <PlusIcon className="h-4 w-4" />
                New Prescription
              </Button>
            </div>
          </CardHeader>
          {patientPrescriptions.length === 0 ? (
            <p className="text-sm text-gray-500">No prescriptions registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase border-b">
                    <th className="pb-3 pr-4 font-medium">Issue Date</th>
                    <th className="pb-3 pr-4 font-medium">Medications</th>
                    <th className="pb-3 pr-4 font-medium">Last Pickup</th>
                    <th className="pb-3 font-medium">Next Pickup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patientPrescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{formatDate(rx.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <div className="space-y-1">
                          {rx.medications.map((med) => (
                            <div key={med.medicationId} className="text-gray-900">
                              <span className="font-medium">{med.medicationName}</span>
                              <span className="text-gray-500 ml-2">{med.quantity} &middot; {med.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{formatDate(rx.lastPickupDate)}</td>
                      <td className="py-3 text-gray-600 whitespace-nowrap">{formatDate(rx.nextPickupDate)}</td>
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
            <CardTitle>Activity Timeline ({timeline.length} events)</CardTitle>
          </CardHeader>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">No activity recorded.</p>
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
        onClose={() => { setShowRxForm(false); setRxMeds([{ ...emptyMedicationRow }]); setRxNotes(''); }}
        title="New Prescription"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
            <div className="space-y-3">
              {rxMeds.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      options={medicationOptions}
                      placeholder="Select medication"
                      value={row.medicationId}
                      onChange={(e) => handleMedicationChange(idx, 'medicationId', e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleMedicationChange(idx, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      placeholder="Freq"
                      value={row.frequency}
                      onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
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
              Add medication
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <Input
              placeholder="Optional notes for this prescription"
              value={rxNotes}
              onChange={(e) => setRxNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => { setShowRxForm(false); setRxMeds([{ ...emptyMedicationRow }]); setRxNotes(''); }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateRx}>
            Create Prescription
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={showMedForm}
        onClose={() => { setShowMedForm(false); resetMedForm(); }}
        title="New Medication"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
            <Input
              placeholder="e.g. Metformina 850mg"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <Input
              placeholder="e.g. Glucophage"
              value={medBrand}
              onChange={(e) => setMedBrand(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drug</label>
            <Input
              placeholder="e.g. Metformina"
              value={medDrug}
              onChange={(e) => setMedDrug(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
            <Input
              placeholder="e.g. Merck"
              value={medLab}
              onChange={(e) => setMedLab(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowMedForm(false); resetMedForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleCreateMedication}>
            Create Medication
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
