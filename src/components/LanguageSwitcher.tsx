import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg bg-white px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  );
}
