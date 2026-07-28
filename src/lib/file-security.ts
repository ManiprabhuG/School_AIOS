/**
 * ABS School Management ERP - File Upload Security Utility
 * Provides magic number verification, file size enforcement, extension whitelisting, and secure filename generation.
 */

import { securityConfig } from './config';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

// Magic number signatures for permitted file types
const FILE_SIGNATURES: Record<string, number[][]> = {
  png: [[0x89, 0x50, 0x4e, 0x47]],
  jpeg: [[0xff, 0xd8, 0xff]],
  jpg: [[0xff, 0xd8, 0xff]],
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  zip: [[0x50, 0x4b, 0x03, 0x04]], // Zip/XLSX container format
};

/**
 * Validates uploaded file size and extension.
 */
export function validateFileMetadata(filename: string, sizeBytes: number): FileValidationResult {
  if (!filename || typeof filename !== 'string') {
    return { isValid: false, error: 'Filename is missing or invalid.' };
  }

  // Prevent path traversal in filenames
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return { isValid: false, error: 'Directory traversal detected in filename.' };
  }

  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  if (!securityConfig.fileUpload.allowedExtensions.includes(ext)) {
    return { isValid: false, error: `File type '${ext}' is not permitted.` };
  }

  if (sizeBytes <= 0) {
    return { isValid: false, error: 'File is empty.' };
  }

  if (sizeBytes > securityConfig.fileUpload.maxSizeBytes) {
    const maxMb = Math.round(securityConfig.fileUpload.maxSizeBytes / (1024 * 1024));
    return { isValid: false, error: `File size exceeds maximum allowed limit of ${maxMb}MB.` };
  }

  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const cleanBaseName = filename
    .substring(0, filename.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  
  const sanitizedFilename = `${cleanBaseName}_${Date.now()}_${randomSuffix}${ext}`;

  return { isValid: true, sanitizedFilename };
}

/**
 * Validates magic number signature of binary files.
 */
export async function validateFileSignature(file: File): Promise<FileValidationResult> {
  const metaResult = validateFileMetadata(file.name, file.size);
  if (!metaResult.isValid) return metaResult;

  const ext = file.name.substring(file.name.lastIndexOf('.')).replace('.', '').toLowerCase();

  // CSV files are plain text, skip magic bytes check
  if (ext === 'csv' || ext === 'txt') {
    return metaResult;
  }

  const validSignatures = FILE_SIGNATURES[ext] || (ext === 'xlsx' || ext === 'xls' ? FILE_SIGNATURES.zip : null);
  if (!validSignatures) {
    return metaResult;
  }

  try {
    const slice = file.slice(0, 8);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const matchesSignature = validSignatures.some((sig) =>
      sig.every((byte, idx) => bytes[idx] === byte)
    );

    if (!matchesSignature) {
      return { isValid: false, error: 'File content signature does not match its file extension.' };
    }

    return metaResult;
  } catch (error) {
    return { isValid: false, error: 'Failed to verify file integrity.' };
  }
}
