import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateGeneral } from './settingsSlice';
import { Card, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { useSnackbar } from '@/components/ui';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const { showSnackbar } = useSnackbar();

  const [generalForm, setGeneralForm] = useState(settings.general);

  const handleSaveGeneral = () => {
    dispatch(updateGeneral(generalForm));
    showSnackbar(t('settings.saved'), 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.generalTitle')}</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input
            label={t('settings.pharmacyName')}
            value={generalForm.pharmacyName}
            onChange={(e) => setGeneralForm({ ...generalForm, pharmacyName: e.target.value })}
          />
          <Input
            label={t('settings.address')}
            value={generalForm.pharmacyAddress}
            onChange={(e) => setGeneralForm({ ...generalForm, pharmacyAddress: e.target.value })}
          />
          <Input
            label={t('settings.phone')}
            value={generalForm.pharmacyPhone}
            onChange={(e) => setGeneralForm({ ...generalForm, pharmacyPhone: e.target.value })}
          />
          <Input
            label={t('settings.email')}
            value={generalForm.pharmacyEmail}
            onChange={(e) => setGeneralForm({ ...generalForm, pharmacyEmail: e.target.value })}
          />
          <Input
            label={t('settings.timezone')}
            value={generalForm.timezone}
            onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.language')}</label>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveGeneral}>{t('common.saving')}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
