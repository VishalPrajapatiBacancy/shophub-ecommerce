import { useRef, useState } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin';

interface MultiImageUploadFieldProps {
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxImages?: number;
}

export function MultiImageUploadField({
  values,
  onChange,
  folder = 'general',
  maxImages = 10,
}: MultiImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = maxImages - values.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5 MB`);
        continue;
      }
    }

    const validFiles = toUpload.filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    if (!validFiles.length) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of validFiles) {
        const res = await adminApi.uploadImage(file, folder);
        uploaded.push(res.url);
      }
      onChange([...values, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const canAddMore = values.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23f3f4f6"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10">Error</text></svg>';
                }}
              />
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 text-center text-[9px] font-medium text-white py-0.5">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {canAddMore && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-primary-400 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 animate-pulse" />
                Uploading…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Image{values.length === 0 ? 's' : ''}
              </>
            )}
          </button>
          <span className="text-xs text-gray-400">
            {values.length}/{maxImages} · PNG, JPG, WebP · max 5 MB each
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
