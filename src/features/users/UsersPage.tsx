import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers, addUser, updateUser, deleteUser } from './usersSlice';
import { Card, Button, Input, Select, Dialog, DataGrid, Badge } from '@/components/ui';
import { useSnackbar } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/types';
import { getInitials } from '@/utils';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-gray-100 text-gray-700',
};

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
  role: z.enum(['admin', 'staff']),
});

type UserForm = z.infer<typeof userSchema>;

export function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);
  const currentUser = useAppSelector((state) => state.auth.user);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'staff' },
  });

  const openAdd = () => {
    setEditing(null);
    form.reset({ name: '', email: '', password: '', role: 'staff' });
    setOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    form.reset({ name: user.name, email: user.email, password: '', role: user.role });
    setOpen(true);
  };

  const onSubmit = async (data: UserForm) => {
    try {
      if (editing) {
        const payload: Partial<User> & { id: string; password?: string } = { id: editing.id };
        if (data.name !== editing.name) payload.name = data.name;
        if (data.email !== editing.email) payload.email = data.email;
        if (data.role !== editing.role) payload.role = data.role;
        if (data.password) payload.password = data.password;
        await dispatch(updateUser(payload)).unwrap();
        showSnackbar('User updated', 'success');
      } else {
        await dispatch(addUser(data)).unwrap();
        showSnackbar('User created', 'success');
      }
      setOpen(false);
    } catch {
      showSnackbar('Failed to save user', 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteUser(deleteId)).unwrap();
        setDeleteId(null);
        showSnackbar('User deleted', 'success');
      } catch {
        showSnackbar('Failed to delete user', 'error');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-primary-700">{getInitials(u.name)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (u: User) => <Badge className={roleColors[u.role]}>{u.role}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (u: User) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteId(u.id)}
            disabled={currentUser?.id === u.id}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} users</p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <div className="relative mb-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <DataGrid
          columns={columns}
          data={paginated}
          keyExtractor={(u) => u.id}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage="No users found."
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label="Name" placeholder="Full name" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input id="email" label="Email" type="email" placeholder="email@example.com" error={form.formState.errors.email?.message} {...form.register('email')} />
          <Input
            id="password"
            label={editing ? 'New Password (leave blank to keep)' : 'Password'}
            type="password"
            placeholder={editing ? 'Leave blank to keep current' : 'At least 6 characters'}
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          <Select id="role" label="Role" options={roleOptions} error={form.formState.errors.role?.message} {...form.register('role')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Add User'}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" size="sm">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this user?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Dialog>
    </div>
  );
}
