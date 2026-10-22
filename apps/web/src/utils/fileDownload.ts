/**
 * Triggers a client-side browser file download for text or binary data.
 */
export function downloadAsFile(
  filename: string,
  content: string | Blob | Uint8Array,
  mimeType = 'text/plain;charset=utf-8'
): void {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content as any], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
