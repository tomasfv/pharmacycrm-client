import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateGeneral, updateFollowUp, updateTemplate } from './settingsSlice';
import { Card, CardHeader, CardTitle, Button, Input, Tabs } from '@/components/ui';
import { useSnackbar } from '@/components/ui';

type TabId = 'general' | 'followup' | 'templates';

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const [generalForm, setGeneralForm] = useState(settings.general);
  const [followUpForm, setFollowUpForm] = useState(settings.followUp);

  const handleSaveGeneral = () => {
    dispatch(updateGeneral(generalForm));
    showSnackbar('General settings saved', 'success');
  };

  const handleSaveFollowUp = () => {
    dispatch(updateFollowUp(followUpForm));
    showSnackbar('Follow-up settings saved', 'success');
  };

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'followup', label: 'Follow-Up Settings' },
    { id: 'templates', label: 'Reminder Templates' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your pharmacy CRM</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as TabId)} />

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Pharmacy Name"
              value={generalForm.pharmacyName}
              onChange={(e) => setGeneralForm({ ...generalForm, pharmacyName: e.target.value })}
            />
            <Input
              label="Address"
              value={generalForm.pharmacyAddress}
              onChange={(e) => setGeneralForm({ ...generalForm, pharmacyAddress: e.target.value })}
            />
            <Input
              label="Phone"
              value={generalForm.pharmacyPhone}
              onChange={(e) => setGeneralForm({ ...generalForm, pharmacyPhone: e.target.value })}
            />
            <Input
              label="Email"
              value={generalForm.pharmacyEmail}
              onChange={(e) => setGeneralForm({ ...generalForm, pharmacyEmail: e.target.value })}
            />
            <Input
              label="Timezone"
              value={generalForm.timezone}
              onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
            />
            <div className="pt-2">
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'followup' && (
        <Card>
          <CardHeader>
            <CardTitle>Follow-Up Settings</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Default Reminder Days"
              type="number"
              value={String(followUpForm.defaultReminderDays)}
              onChange={(e) =>
                setFollowUpForm({ ...followUpForm, defaultReminderDays: parseInt(e.target.value) || 7 })
              }
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoContact"
                checked={followUpForm.autoContact}
                onChange={(e) =>
                  setFollowUpForm({ ...followUpForm, autoContact: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="autoContact" className="text-sm text-gray-700">
                Auto-contact patients on scheduled date
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Working Hours Start"
                type="time"
                value={followUpForm.workingHoursStart}
                onChange={(e) =>
                  setFollowUpForm({ ...followUpForm, workingHoursStart: e.target.value })
                }
              />
              <Input
                label="Working Hours End"
                type="time"
                value={followUpForm.workingHoursEnd}
                onChange={(e) =>
                  setFollowUpForm({ ...followUpForm, workingHoursEnd: e.target.value })
                }
              />
            </div>
            <div className="pt-2">
              <Button onClick={handleSaveFollowUp}>Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          {settings.reminderTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <Input
                  label="Template Name"
                  value={template.name}
                  onChange={(e) =>
                    dispatch(updateTemplate({ ...template, name: e.target.value }))
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={template.message}
                    onChange={(e) =>
                      dispatch(updateTemplate({ ...template, message: e.target.value }))
                    }
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Available variables: {'{patient}'}, {'{medication}'}
                </p>
                <div className="pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      showSnackbar('Template saved', 'success');
                    }}
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
