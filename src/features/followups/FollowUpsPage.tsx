import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setViewMode } from './followupsSlice';
import { KanbanBoard } from './components/KanbanBoard';
import { FollowUpTable } from './components/FollowUpTable';
import { Button } from '@/components/ui';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

export function FollowUpsPage() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector((state) => state.followups.viewMode);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-Ups</h1>
          <p className="text-sm text-gray-500 mt-1">Manage treatment renewal workflow</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => dispatch(setViewMode('kanban'))}
          >
            <Squares2X2Icon className="h-4 w-4" />
            Kanban
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => dispatch(setViewMode('table'))}
          >
            <ListBulletIcon className="h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanBoard /> : <FollowUpTable />}
    </div>
  );
}
