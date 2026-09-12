import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCatalogCategories, addCatalogCategory, updateCatalogCategory, deleteCatalogCategory } from './catalogCategoriesSlice';
import { DataGrid, Button, Card, Dialog, Input } from '@/components/ui';
import type { CatalogCategory } from '@/types';
import { formatDate } from '@/utils';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from '@/components/ui';

export function CatalogCategoriesPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();
  const categories = useAppSelector((state) => state.catalogCategories.categories);
  const loading = useAppSelector((state) => state.catalogCategories.loading);

  useEffect(() => {
    dispatch(fetchCatalogCategories());
  }, [dispatch]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CatalogCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const resetForm = () => { setEditing(null); setName(''); };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (cat: CatalogCategory) => { setEditing(cat); setName(cat.name); setShowForm(true); };

  const handleSave = async () => {
    if (!name.trim()) {
      showSnackbar(t('catalog.nameRequired'), 'error');
      return;
    }
    try {
      if (editing) {
        await dispatch(updateCatalogCategory({ ...editing, name: name.trim() })).unwrap();
        showSnackbar(t('catalog.updatedSuccess'), 'success');
      } else {
        await dispatch(addCatalogCategory({ name: name.trim() })).unwrap();
        showSnackbar(t('catalog.createdSuccess'), 'success');
      }
      setShowForm(false);
      resetForm();
    } catch {
      showSnackbar(t('catalog.saveError'), 'error');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteCatalogCategory(deleteId)).unwrap();
        setDeleteId(null);
        showSnackbar(t('catalog.deletedSuccess'), 'success');
      } catch {
        showSnackbar(t('catalog.deleteError'), 'error');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('catalog.categoryName'),
      sortable: true,
      render: (c: CatalogCategory) => <span className="font-medium text-gray-900">{c.name}</span>,
    },
    {
      key: 'createdAt',
      header: t('catalog.created'),
      render: (c: CatalogCategory) => formatDate(c.createdAt),
    },
    {
      key: 'actions',
      header: t('catalog.actions'),
      render: (c: CatalogCategory) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
          <h1 className="text-2xl font-bold text-gray-900">{t('catalog.categories')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('catalog.categoryCount', { count: categories.length })}</p>
        </div>
        <Button onClick={openCreate}><PlusIcon className="h-4 w-4" />{t('catalog.newCategory')}</Button>
      </div>

      <Card>
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder={t('catalog.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <DataGrid columns={columns} data={paginated} keyExtractor={(c) => c.id} page={page} totalPages={totalPages} onPageChange={setPage} emptyMessage={t('catalog.empty')} />
      </Card>

      <Dialog open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? t('catalog.editCategory') : t('catalog.newCategory')} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('catalog.categoryName')} *</label>
            <Input placeholder={t('catalog.categoryNamePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>{t('common.cancel')}</Button>
          <Button onClick={handleSave}>{editing ? t('common.save') : t('catalog.create')}</Button>
        </div>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title={t('catalog.deleteCategory')} size="sm">
        <p className="text-sm text-gray-600 mb-4">{t('catalog.deleteConfirm')}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleDelete}>{t('common.delete')}</Button>
        </div>
      </Dialog>
    </div>
  );
}
