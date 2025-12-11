// app/api/company/upload-cloudinary/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';
import { promisify } from 'util';

export const config = { api: { bodyParser: false } };

// Configure Cloudinary using env vars (ensure .env.local set and server restarted)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  // fail fast in dev so you notice missing env
  throw new Error('Missing Cloudinary env variables. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pipeline = promisify(stream.pipeline);

/**
 * POST multipart/form-data
 * fields:
 *  - file (binary)
 *  - companyId (string)
 *  - field (logo_url | banner_url)  // optional, used for logging
 *
 * Returns: { success: true, url: string }
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const companyId = formData.get('companyId') as string | null;
    const field = (formData.get('field') as string | null) ?? 'uploads';

    if (!file || !companyId) {
      return NextResponse.json({ error: 'file and companyId are required' }, { status: 400 });
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create upload stream wrapper
    const uploadFromBuffer = (bufferToUpload: Buffer, folderPath = '') =>
      new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `careers/${companyId}/${field}`, // organize files by company
            resource_type: 'image',
            overwrite: true,
            use_filename: true,
          },
          (error, result) => {
            if (error) return reject(error);
            // result is normalizer type: ensure it's present
            if (!result || !result.secure_url) return reject(new Error('No result returned from Cloudinary'));
            resolve({ secure_url: result.secure_url });
          }
        );

        const readable = stream.Readable.from(bufferToUpload);
        pipeline(readable, uploadStream).catch(reject);
      });

    const { secure_url } = await uploadFromBuffer(buffer, `careers/${companyId}/${field}`);
    return NextResponse.json({ success: true, url: secure_url }, { status: 200 });
  } catch (err: any) {
    console.error('[cloudinary upload] error', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
