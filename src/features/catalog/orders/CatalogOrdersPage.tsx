import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCatalogOrders } from './catalogOrdersSlice';
import { DataGrid, Card, Dialog, Button, Input } from '@/components/ui';
import type { CatalogOrder } from '@/types';
import { formatDate, formatPrice } from '@/utils';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

export function CatalogOrdersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.catalogOrders.orders);
  const loading = useAppSelector((state) => state.catalogOrders.loading);

  useEffect(() => {
    dispatch(fetchCatalogOrders());
  }, [dispatch]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [viewing, setViewing] = useState<CatalogOrder | null>(null);
  const displayedRef = useRef<CatalogOrder | null>(null);

  if (viewing) displayedRef.current = viewing;
  const displayed = displayedRef.current;

  const filtered = orders.filter((o) =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search),
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const columns = [
    {
      key: 'createdAt',
      header: t('catalog.orderDate'),
      sortable: true,
      render: (o: CatalogOrder) => formatDate(o.createdAt),
    },
    {
      key: 'customerName',
      header: t('catalog.customerName'),
      render: (o: CatalogOrder) => <span className="font-medium text-gray-900">{o.customerName}</span>,
    },
    {
      key: 'customerPhone',
      header: t('catalog.customerPhone'),
      render: (o: CatalogOrder) => o.customerPhone,
    },
    {
      key: 'deliveryMethod',
      header: t('catalog.delivery'),
      render: (o: CatalogOrder) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {o.deliveryMethod === 'pickup' ? t('catalog.pickup') : t('catalog.delivery')}
        </span>
      ),
    },
    {
      key: 'total',
      header: t('catalog.total'),
      render: (o: CatalogOrder) => <span className="font-bold text-gray-900">{formatPrice(o.total)}</span>,
    },
    {
      key: 'actions',
      header: t('catalog.actions'),
      render: (o: CatalogOrder) => (
        <button onClick={() => setViewing(o)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('catalog.orders')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('catalog.orderCount', { count: orders.length })}</p>
      </div>

      <Card>
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder={t('catalog.searchOrders')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <DataGrid columns={columns} data={paginated} keyExtractor={(o) => o.id} page={page} totalPages={totalPages} onPageChange={setPage} emptyMessage={t('catalog.empty')} />
      </Card>

      <Dialog open={!!viewing} onClose={() => setViewing(null)} afterLeave={() => { displayedRef.current = null; }} title={t('catalog.orderDetail')} size="lg">
        {displayed && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('catalog.customerName')}</p>
                <p className="font-medium">{displayed.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('catalog.customerPhone')}</p>
                <p className="font-medium">{displayed.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('catalog.delivery')}</p>
                <p className="font-medium">{displayed.deliveryMethod === 'pickup' ? t('catalog.pickup') : t('catalog.delivery')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('catalog.payment')}</p>
                <p className="font-medium">{displayed.paymentMethod === 'cash' ? t('catalog.cash') : t('catalog.card')}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">{t('catalog.items')}</p>
              <div className="border rounded-lg divide-y">
                {displayed.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-bold">{t('catalog.total')}</span>
              <span className="text-lg font-bold text-blue-600">{formatPrice(displayed.total)}</span>
            </div>

            <div className="text-sm text-gray-500">
              {t('catalog.orderDate')}: {formatDate(displayed.createdAt)}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => setViewing(null)}>{t('catalog.close')}</Button>
        </div>
      </Dialog>
    </div>
  );
}
