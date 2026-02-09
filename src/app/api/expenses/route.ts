import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation could go here, relying on Mongoose schema for now
        const expense = await Expense.create(body);

        return NextResponse.json(expense, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const condominiumId = searchParams.get('condominiumId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        if (!condominiumId) {
            return NextResponse.json({ error: 'Condominium ID required' }, { status: 400 });
        }

        const query: any = { condominiumId };

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const expenses = await Expense.find(query).sort({ date: -1 });

        return NextResponse.json(expenses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await Expense.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


