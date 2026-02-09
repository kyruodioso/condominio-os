import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { calculateSettlement } from '@/lib/services/financialService';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { condominiumId, month, year, interestRate, reserveFundRate } = await req.json();

        if (!condominiumId || !month || !year) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await calculateSettlement({
            condominiumId,
            month: parseInt(month),
            year: parseInt(year),
            interestRate: parseFloat(interestRate) || 0,
            reserveFundRate: parseFloat(reserveFundRate) || 0
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Calculation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

