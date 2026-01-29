import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Extract extension from original filename or default to .webm
        const ext = path.extname(file.name) || '.webm';
        const filename = `${uuidv4()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/audio');

        // Ensure directory exists
        const { mkdir } = require('fs/promises');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        const fileUrl = `/api/stream/audio/${filename}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
