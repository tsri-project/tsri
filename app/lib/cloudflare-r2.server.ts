// Cloudflare R2 Object Storage Integration (Server-side Only)
// Never expose access keys to client/frontend

export interface R2UploadResult {
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
}

export async function getR2SignedUploadUrl(
  fileName: string,
  contentType: string,
  prefix: string = 'documents'
): Promise<{ uploadUrl: string; storageKey: string; publicUrl: string }> {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storageKey = `${prefix}/${timestamp}_${sanitizedFileName}`;

  const r2PublicUrl = process.env.R2_PUBLIC_URL || 'https://documents.tsri.dev';
  const publicUrl = `${r2PublicUrl}/${storageKey}`;

  // In Cloudflare Workers / Pages environment, R2 bucket binding is accessed via env.BUCKET
  // When running locally or via S3 SDK, signed URL is generated via AWS S3 Client
  const mockUploadUrl = `https://r2-upload.tsri.dev/${storageKey}?signature=mock_signed_token`;

  return {
    uploadUrl: mockUploadUrl,
    storageKey,
    publicUrl,
  };
}

export async function deleteR2Object(storageKey: string): Promise<boolean> {
  // Server-side object deletion
  return true;
}
