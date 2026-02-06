'use server';

import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';
import ExpenseBill from '@/models/ExpenseBill';
import Unit from '@/models/Unit';
import { auth } from '@/auth';
import { can, PERMISSIONS } from '@/lib/permissions';

// --- EXPENSES ---

export async function createExpense(data: { description: string; amount: number; category: string; date: Date; attachmentUrl?: string }) {
    await dbConnect();
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    if (!can(session.user, PERMISSIONS.MANAGE_EXPENSES, session.user.planType)) {
        throw new Error('Upgrade to PRO to manage expenses');
    }

    const expense = await Expense.create({
        ...data,
        condominiumId: session.user.condominiumId
    });

    return JSON.parse(JSON.stringify(expense));
}

export async function getExpenses(month: number, year: number) {
    await dbConnect();
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    if (!can(session.user, PERMISSIONS.VIEW_FINANCE, session.user.planType)) {
        throw new Error('Unauthorized');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({
        condominiumId: session.user.condominiumId,
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    return JSON.parse(JSON.stringify(expenses));
}

// --- LIQUIDATION & PRORATION ---

export async function generateMonthlyLiquidation(month: number, year: number) {
    await dbConnect();
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    if (!can(session.user, PERMISSIONS.MANAGE_EXPENSES, session.user.planType)) {
        throw new Error('Upgrade to PRO');
    }

    const condoId = session.user.condominiumId;

    // 1. Get total expenses for the period
    const expenses = await getExpenses(month, year);
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    if (totalExpenses === 0) {
        throw new Error('No expenses to liquidate for this period');
    }

    // 2. Get all units with coefficients
    const units = await Unit.find({ condominiumId: condoId });

    // Validate coefficients sum approx 1 (or 100)
    // const totalCoef = units.reduce((sum, u) => sum + (u.coefficient || 0), 0);
    // if (totalCoef < 0.99) throw new Error('Unit coefficients do not sum to 100%');

    const period = `${year}-${String(month).padStart(2, '0')}`;
    const bills = [];

    // 3. Generate Bills
    for (const unit of units) {
        // Calculate amount based on coefficient
        // If coefficient is percentage (e.g. 5.5), divide by 100. If it's ratio (0.055), just multiply.
        // Assuming user enters percentage (0-100) in UI as per Unit model max:100.
        const share = (unit.coefficient || 0) / 100;
        const amount = Number((totalExpenses * share).toFixed(2));

        if (amount > 0) {
            const billData = {
                condominiumId: condoId,
                unitId: unit._id,
                period,
                totalAmount: amount,
                status: 'PENDING',
                issueDate: new Date(),
                dueDate: new Date(new Date().setDate(new Date().getDate() + 10)), // 10 days to pay
                items: [
                    {
                        description: `Expensas ${period} (Coef: ${unit.coefficient}%)`,
                        amount: amount,
                        category: 'Liquidación Mensual'
                    }
                ]
            };

            // Upsert: Update if exists, Insert if new
            await ExpenseBill.findOneAndUpdate(
                { unitId: unit._id, period },
                billData,
                { upsert: true, new: true }
            );
            bills.push(billData);
        }
    }

    return { success: true, totalLiquidation: totalExpenses, billsGenerated: bills.length };
}

export async function getBillsByPeriod(period: string) {
    await dbConnect();
    const session = await auth();
    // basic auth check...

    const bills = await ExpenseBill.find({
        condominiumId: session.user.condominiumId,
        period
    }).populate('unitId', 'number contactName');

    return JSON.parse(JSON.stringify(bills));
}
