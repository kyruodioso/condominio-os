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

import Payment from '@/models/Payment';
import ExpenseSettlement from '@/models/ExpenseSettlement';
import UnitAccountStatus from '@/models/UnitAccountStatus';

export async function getFinancialStats() {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.condominiumId) return null;
    const condoId = session.user.condominiumId;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. Get Last Settlement to determine Billed and Total Debt context
    const lastSettlement = await ExpenseSettlement.findOne({ 
        condominiumId: condoId, 
        status: 'SENT' 
    }).sort({ processedAt: -1 });

    let totalBilled = 0;
    let totalCollected = 0;
    let totalDebt = 0;

    if (lastSettlement) {
        // Stats from the last closed settlement
        const statuses = await UnitAccountStatus.find({ settlementId: lastSettlement._id });
        
        // Total Billed for the last period (this includes previous debt usually, but if "Billed" means "New Charges", it's currentPeriodShare + reserveFund. If it means "Total Coupon Value", it's totalToPay)
        // Let's assume "Facturación (Mes)" means the total amount requested in the last bills.
        totalBilled = statuses.reduce((sum: number, s: any) => sum + parseFloat(s.totalToPay.toString()), 0);

        // Total Debt (at the time of settlement)
        // This is tricky without a live "CurrentBalance" on Unit. 
        // We will use TotalBilled as a proxy for "Debt at start of month" + "New Expenses".
        // Real-time debt = TotalToPay - Payments made AFTER settlement date.
        
        // Let's calculate payments made in the current month
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0);
        
        const payments = await Payment.find({
            condominiumId: condoId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            status: 'CONFIRMED'
        });

        totalCollected = payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount.toString()), 0);
        
        // Rough estimate of current outstanding debt
        totalDebt = Math.max(0, totalBilled - totalCollected);
    }

    const collectionPercentage = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    // 2. Current Expense (Accumulated for Next Settlement)
    // We look for expenses in the CURRENT month (which might not be settled yet)
    const currentExpenses = await Expense.find({
        condominiumId: condoId,
        month: currentMonth,
        year: currentYear
    });

    const currentExpenseTotal = currentExpenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount.toString()), 0);

    return {
        billed: parseFloat(totalBilled.toFixed(2)),
        collected: parseFloat(totalCollected.toFixed(2)),
        collectionPercentage: parseFloat(collectionPercentage.toFixed(1)),
        totalDebt: parseFloat(totalDebt.toFixed(2)),
        currentExpenseTotal: parseFloat(currentExpenseTotal.toFixed(2))
    };
}

export async function getExpenseDraft(month: number, year: number) {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.condominiumId) throw new Error('Unauthorized');
    const condoId = session.user.condominiumId;

    let expense = await Expense.findOne({ condominiumId: condoId, month, year });

    if (!expense) {
        expense = await Expense.create({
            condominiumId: condoId,
            month,
            year,
            status: 'DRAFT',
            totalAmount: 0,
            items: []
        });
    }

    return JSON.parse(JSON.stringify(expense));
}

export async function addExpenseItem(expenseId: string, item: { description: string, amount: number, category: string, date?: Date }) {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.condominiumId) throw new Error('Unauthorized');

    const expense = await Expense.findById(expenseId);
    if (!expense) throw new Error('Expense not found');
    if (expense.status === 'PUBLISHED') throw new Error('Cannot edit published expenses');

    expense.items.push(item);

    // Recalculate total
    expense.totalAmount = expense.items.reduce((sum: number, i: any) => sum + i.amount, 0);

    await expense.save();
    return JSON.parse(JSON.stringify(expense));
}

export async function deleteExpenseItem(expenseId: string, itemId: string) {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.condominiumId) throw new Error('Unauthorized');

    const expense = await Expense.findById(expenseId);
    if (!expense) throw new Error('Expense not found');
    if (expense.status === 'PUBLISHED') throw new Error('Cannot edit published expenses');

    expense.items = expense.items.filter((i: any) => i._id.toString() !== itemId);

    // Recalculate total
    expense.totalAmount = expense.items.reduce((sum: number, i: any) => sum + i.amount, 0);

    await expense.save();
    return JSON.parse(JSON.stringify(expense));
}
