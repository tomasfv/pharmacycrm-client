import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { moveFollowUp } from '../followupsSlice';
import { DataGrid, Input, Tooltip } from '@/components/ui';
import type { FollowUp, FollowUpStatus, Prescription, Patient } from '@/types';
import { formatDate, statusLabels, statusColors } from '@/utils';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const statusOptions: { value: FollowUpStatus; label: string }[] = [
  { value: 'pending_contact', label: 'Pending Contact' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'prescription_received', label: 'Prescription Received' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'delivered', label: 'Delivered' },
];

function StatusDropdown({
  value,
  onChange,
}: {
  value: FollowUpStatus;
  onChange: (status: FollowUpStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest?.('[data-status-menu]')
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(!open);
  };

  const select = (status: FollowUpStatus) => {
    onChange(status);
    setOpen(false);
  };

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${statusColors[value]}`}
      >
        {statusLabels[value]}
        <ChevronDownIcon className="h-3 w-3 opacity-60" />
      </button>
      {open &&
        createPortal(
          <div
            data-status-menu
            className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
            style={{ top: menuPos.top, left: menuPos.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => select(opt.value)}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 ${
                  opt.value === value ? 'bg-gray-50' : ''
                }`}
              >
                <span
                  className={`inline-block px-2 py-0.5 rounded-md ${statusColors[opt.value]}`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

function getLatestPrescription(list: Prescription[]): Prescription | null {
  if (list.length === 0) return null;
  return list.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
}

export function FollowUpTable() {
  const dispatch = useAppDispatch();
  const followUps = useAppSelector((state) => state.followups.followUps);
  const prescriptions = useAppSelector((state) => state.prescriptions.prescriptions);
  const patients = useAppSelector((state) => state.patients.patients);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const patientMap = useMemo(() => {
    const map = new Map<string, Patient>();
    for (const p of patients) map.set(p.id, p);
    return map;
  }, [patients]);

  const latestRxMap = useMemo(() => {
    const grouped = new Map<string, Prescription[]>();
    for (const rx of prescriptions) {
      const arr = grouped.get(rx.patientId);
      if (arr) arr.push(rx);
      else grouped.set(rx.patientId, [rx]);
    }
    const latest = new Map<string, Prescription>();
    for (const [patientId, list] of grouped) {
      const l = getLatestPrescription(list);
      if (l) latest.set(patientId, l);
    }
    return latest;
  }, [prescriptions]);

  const filtered = useMemo(
    () =>
      followUps.filter((f) => {
        const patient = patientMap.get(f.patientId);
        if (!patient) return true;
        const q = search.toLowerCase();
        return (
          !search ||
          patient.name.toLowerCase().includes(q) ||
          patient.dni.toLowerCase().includes(q) ||
          patient.healthInsurance.toLowerCase().includes(q) ||
          patient.memberNumber.toLowerCase().includes(q) ||
          patient.phone.toLowerCase().includes(q)
        );
      }),
    [followUps, search, patientMap],
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleStatusChange = (followUpId: string, newStatus: FollowUpStatus) => {
    dispatch(moveFollowUp({ followUpId, newStatus }));
  };

  const getLastPickup = (patientId: string) => {
    const rx = latestRxMap.get(patientId);
    if (!rx) return '\u2014';
    return formatDate(rx.lastPickupDate);
  };

  const getNextPickup = (patientId: string) => {
    const rx = latestRxMap.get(patientId);
    if (!rx) return '\u2014';
    return formatDate(rx.nextPickupDate);
  };

  const columns = [
    {
      key: 'patientName',
      header: 'NAME',
      sortable: true,
      render: (f: FollowUp) => {
        const patient = patientMap.get(f.patientId);
        return <span className="font-medium text-gray-900">{patient?.name || f.patientName}</span>;
      },
    },
    {
      key: 'dni',
      header: 'NATIONAL ID',
      render: (f: FollowUp) => {
        const patient = patientMap.get(f.patientId);
        return <span className="text-gray-700">{patient?.dni || '\u2014'}</span>;
      },
    },
    {
      key: 'healthInsurance',
      header: 'HEALTH INSURANCE',
      render: (f: FollowUp) => {
        const patient = patientMap.get(f.patientId);
        return <span className="text-gray-700">{patient?.healthInsurance || '\u2014'}</span>;
      },
    },
    {
      key: 'memberNumber',
      header: 'MEMBER #',
      render: (f: FollowUp) => {
        const patient = patientMap.get(f.patientId);
        return <span className="text-gray-700">{patient?.memberNumber || '\u2014'}</span>;
      },
    },
    {
      key: 'phone',
      header: 'PHONE',
      render: (f: FollowUp) => {
        const patient = patientMap.get(f.patientId);
        return <span className="text-gray-700">{patient?.phone || '\u2014'}</span>;
      },
    },
    {
      key: 'lastPickupDate',
      header: 'LAST PICKUP',
      render: (f: FollowUp) => (
        <span className="text-gray-700">{getLastPickup(f.patientId)}</span>
      ),
    },
    {
      key: 'nextPickupDate',
      header: 'NEXT PICKUP',
      render: (f: FollowUp) => (
        <span className="text-gray-700">{getNextPickup(f.patientId)}</span>
      ),
    },
    {
      key: 'medications',
      header: 'MEDICATION',
      render: (f: FollowUp) => {
        const rx = latestRxMap.get(f.patientId);
        if (!rx || rx.medications.length === 0) return '\u2014';
        const meds = rx.medications;
        const maxVisible = 2;
        const visible = meds.slice(0, maxVisible);
        const remaining = meds.length - maxVisible;
        return (
          <Tooltip
            content={
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Latest Prescription ({formatDate(rx.createdAt)})
                </p>
                <ul className="space-y-1">
                  {meds.map((m) => (
                    <li key={m.medicationId} className="text-sm text-gray-700">
                      {m.medicationName}
                      <span className="text-gray-400 ml-1">({m.quantity})</span>
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <div className="flex flex-wrap gap-1.5 cursor-default">
              {visible.map((m) => (
                <span
                  key={m.medicationId}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
                >
                  {m.medicationName}
                </span>
              ))}
              {remaining > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                  +{remaining}
                </span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: 'status',
      header: 'FOLLOW UP STATUS',
      render: (f: FollowUp) => (
        <StatusDropdown
          value={f.status}
          onChange={(newStatus) => handleStatusChange(f.id, newStatus)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, ID, insurance, member # or phone..."
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
        keyExtractor={(f) => f.id}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No follow-ups found."
      />
    </div>
  );
}
