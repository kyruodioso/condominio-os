'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';
import ExpenseBill from '@/models/ExpenseBill';
import Unit from '@/models/Unit';
import { can, PERMISSIONS, PlanType } from '@/lib/permissions';

export async function liquidateExpenses(month: number, year: number) {
    const session = await auth();

    if (!session || !session.user || !session.user.condominiumId) {
        return { success: false, message: 'Unauthorized' };
    }

    const planType = session.user.planType as PlanType;
    if (!can(session.user, PERMISSIONS.MANAGE_EXPENSES, planType)) {
        return { success: false, message: 'Forbidden: Upgrade to PRO plan to manage expenses.' };
    }

    await dbConnect();

    const condominiumId = session.user.condominiumId;

    // 1. Find the expense for the given month/year
    const expense = await Expense.findOne({
        condominiumId,
        month,
        year,
    });

    if (!expense) {
        return { success: false, message: 'No expense record found for this period.' };
    }

    if (expense.status === 'PUBLISHED') {
        return { success: false, message: 'Expenses for this period are already published.' };
    }

    // 2. Fetch all units
    const units = await Unit.find({ condominiumId });

    if (!units || units.length === 0) {
        return { success: false, message: 'No units found in this condominium.' };
    }

    // 3. Calculate bills
    const totalAmount = expense.totalAmount;
    const period = `${month.toString().padStart(2, '0')}-${year}`;

    // Validate coefficients sum to ~100 or ~1? Let's assume coefficient is a percentage (0-100)
    // If sum is not 100, we might warn, but for now we proceed.

    // We wipe existing DRAFT/PENDING bills for this expense if any?
    await ExpenseBill.deleteMany({ expenseId: expense._id, status: 'PENDING' });

    const bills = [];

    for (const unit of units) {
        // If coefficient is 0, they pay 0.
        // Formula: (Amount * Coefficient) / 100
        const amount = (totalAmount * (unit.coefficient || 0)) / 100;

        if (amount > 0) {
            bills.push({
                condominiumId,
                unitId: unit._id,
                expenseId: expense._id,
                period,
                amount: parseFloat(amount.toFixed(2)),
                status: 'PENDING',
                issueDate: new Date(),
            });
        }
    }

    if (bills.length > 0) {
        await ExpenseBill.insertMany(bills);
    }

    // 4. Update Expense status
    expense.status = 'PUBLISHED';
    expense.publishedAt = new Date();
    await expense.save();

    return { success: true, message: `Successfully liquidated expenses. Generated ${bills.length} bills.` };
}
