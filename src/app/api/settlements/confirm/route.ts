'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import { calculateSettlement } from '@/lib/services/financialService';
import ExpenseSettlement from '@/models/ExpenseSettlement';
import UnitAccountStatus from '@/models/UnitAccountStatus';
import { can, PERMISSIONS, PlanType } from '@/lib/permissions';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.condominiumId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { condominiumId, month, year, interestRate, reserveFundRate } = await req.json();

        if (session.user.condominiumId !== condominiumId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!can(session.user, PERMISSIONS.MANAGE_EXPENSES, session.user.planType as PlanType)) {
             return NextResponse.json({ error: 'Forbidden: Upgrade to PRO' }, { status: 403 });
        }

        await dbConnect();

        const period = `${month.toString().padStart(2, '0')}-${year}`;

        // Check if already exists
        const existing = await ExpenseSettlement.findOne({ condominiumId, period });
        if (existing) {
            return NextResponse.json({ error: 'Settlement for this period already exists' }, { status: 400 });
        }

        // Calculate
        const calculation = await calculateSettlement({
            condominiumId,
            month,
            year,
            interestRate,
            reserveFundRate
        });

        // Create Settlement
        const settlement = await ExpenseSettlement.create({
            condominiumId,
            period,
            totalAmountA: calculation.totalAmountA,
            totalAmountB: calculation.totalAmountB,
            totalAmountC: calculation.totalAmountC,
            reserveFundPercentage: reserveFundRate,
            status: 'SENT', // Assuming "Confirm" means send/close
            processedAt: new Date()
        });

        // Create Unit Statuses
        const statuses = calculation.units.map((u: any) => ({
            settlementId: settlement._id,
            unitId: u.unitId,
            ownerName: u.ownerName, // Snapshot
            coefficient: u.coefficient, // Snapshot
            previousBalance: u.previousBalance,
            paymentsAmount: u.paymentsAmount,
            interestAmount: u.interestAmount,
            currentPeriodShare: u.currentPeriodShare,
            reserveFundAmount: u.reserveFundAmount,
            totalToPay: u.totalToPay
        }));

        await UnitAccountStatus.insertMany(statuses);

        return NextResponse.json({ success: true, settlementId: settlement._id });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
