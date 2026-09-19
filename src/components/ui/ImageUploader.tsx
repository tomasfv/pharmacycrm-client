import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadApi } from '@/api/upload';
import { useSnackbar } from '@/components/ui';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder?: string;
  className?: string;
}

export function ImageUploader({ value, onChange, folder, className }: ImageUploaderProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showSnackbar(t('catalog.imageInvalidType'), 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar(t('catalog.imageTooLarge'), 'error');
      return;
    }
    setUploading(true);
    try {
      const { data } = await uploadApi.uploadImage(file, folder);
      onChange(data.data.url);
    } catch {
      showSnackbar(t('catalog.imageUploadError'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  if (value) {
    return (
      <div className={`relative inline-block ${className || ''}`}>
        <img src={value} alt="" className="h-32 w-32 object-cover rounded-lg border" />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      } ${className || ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />
      {uploading ? (
        <p className="text-sm text-gray-500">{t('catalog.uploading')}...</p>
      ) : (
        <>
          <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{t('catalog.imageDropOrClick')}</p>
        </>
      )}
    </div>
  );
}
