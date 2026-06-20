import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { moveFollowUp } from '../followupsSlice';
import { statusLabels, statusColors, formatDate } from '@/utils';
import { Badge, Tooltip } from '@/components/ui';
import type { FollowUp, FollowUpStatus } from '@/types';

const columns: FollowUpStatus[] = [
  'pending_contact',
  'contacted',
  'order_received',
  'prepared',
  'delivered',
];

const columnIcons: Record<FollowUpStatus, string> = {
  pending_contact: '\uD83D\uDD14',
  contacted: '\uD83D\uDCDE',
  order_received: '\uD83D\uDCC4',
  prepared: '\uD83D\uDCE6',
  delivered: '\u2705',
};

export function KanbanBoard() {
  const dispatch = useAppDispatch();
  const followUps = useAppSelector((state) => state.followups.followUps);
  const orders = useAppSelector((state) => state.orders.orders);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const followUpId = result.draggableId;
    const newStatus = result.destination.droppableId as FollowUpStatus;
    dispatch(moveFollowUp({ followUpId, newStatus }));
  };

  const MedicationPills = ({ orderId }: { orderId: string | null }) => {
    const rx = orderId
      ? orders.find((o) => o.id === orderId)
      : null;
    if (!rx || rx.medications.length === 0) return null;
    const meds = rx.medications;
    const maxVisible = 2;
    const visible = meds.slice(0, maxVisible);
    const remaining = meds.length - maxVisible;

    return (
      <Tooltip
        content={
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Order ({formatDate(rx.createdAt)})
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
        <div className="flex flex-wrap gap-1 mt-1.5 cursor-default">
          {visible.map((m) => (
            <span
              key={m.medicationId}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary-50 text-primary-700 border border-primary-200"
            >
              {m.medicationName}
            </span>
          ))}
          {remaining > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
              +{remaining}
            </span>
          )}
        </div>
      </Tooltip>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto">
        {columns.map((status) => {
          const items = followUps.filter((f) => f.status === status);
          return (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-50 rounded-xl p-3 min-h-[200px] ${
                    snapshot.isDraggingOver ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-lg">{columnIcons[status]}</span>
                    <h3 className="text-sm font-semibold text-gray-700">{statusLabels[status]}</h3>
                    <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((followUp, idx) => (
                      <Draggable
                        key={followUp.id}
                        draggableId={followUp.id}
                        index={idx}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg p-3 border border-gray-200 shadow-sm ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {followUp.patientName}
                            </p>
                            <MedicationPills orderId={followUp.orderId} />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDate(followUp.scheduledDate)}
                              </span>
                              <Badge className={statusColors[followUp.status]}>
                                {statusLabels[followUp.status]}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
