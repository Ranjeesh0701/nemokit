import { useState, type DragEvent, type ReactNode } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropzoneWrapperProps {
  readonly children: ReactNode;
  readonly onFileLoaded: (content: string, filename: string) => void;
  readonly allowedExtensions?: ReadonlyArray<string>;
  readonly disabled?: boolean;
  readonly label?: string;
}

export function DropzoneWrapper({
  children,
  onFileLoaded,
  allowedExtensions,
  disabled = false,
  label = 'Drop file here to load content',
}: DropzoneWrapperProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    if (allowedExtensions && allowedExtensions.length > 0) {
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      if (!allowedExtensions.includes(ext)) {
        alert(`Unsupported file type. Please upload one of: ${allowedExtensions.join(', ')}`);
        return;
      }
    }

    try {
      const text = await file.text();
      onFileLoaded(text, file.name);
    } catch (err) {
      console.error('Failed to read dropped file:', err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-full"
    >
      {children}

      {isDragging && !disabled && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-stone-900/80 backdrop-blur-xs text-white border-2 border-dashed border-stone-300 animate-in fade-in duration-100">
          <UploadCloud className="h-10 w-10 text-stone-200 animate-bounce" />
          <p className="mt-2 text-sm font-semibold">{label}</p>
          {allowedExtensions && (
            <p className="text-xs text-stone-300 mt-1">
              Supports: {allowedExtensions.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
