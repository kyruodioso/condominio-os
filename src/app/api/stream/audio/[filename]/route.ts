import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    { params }: { params: { filename: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const filename = params.filename;
        const filePath = path.join(process.cwd(), 'public/uploads/audio', filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'audio/webm';

        if (ext === '.mp4') contentType = 'audio/mp4';
        else if (ext === '.mp3') contentType = 'audio/mpeg';
        else if (ext === '.wav') contentType = 'audio/wav';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error streaming file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
