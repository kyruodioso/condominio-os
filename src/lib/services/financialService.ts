import Expense from '../../models/Expense';
import Unit from '../../models/Unit';
import Payment from '../../models/Payment';
import ExpenseSettlement from '../../models/ExpenseSettlement';
import UnitAccountStatus from '../../models/UnitAccountStatus';
import mongoose from 'mongoose';

// Helper to handle Decimal128 operations safely
const toDecimal = (val: any) => {
    if (val === undefined || val === null) return 0;
    return parseFloat(val.toString());
};

interface CalculationParams {
    condominiumId: string;
    month: number;
    year: number;
    interestRate: number;
    reserveFundRate: number;
}

export async function calculateSettlement({ condominiumId, month, year, interestRate, reserveFundRate }: CalculationParams) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const period = `${month.toString().padStart(2, '0')}-${year}`;

    // 1. Sum Expenses by Type
    const expenses = await Expense.find({
        condominiumId,
        date: { $gte: startDate, $lte: endDate }
    });

    let totalAmountA = 0;
    let totalAmountB = 0;
    let totalAmountC = 0;

    expenses.forEach(exp => {
        const amount = toDecimal(exp.amount);
        if (exp.type === 'GASTO_A') totalAmountA += amount;
        else if (exp.type === 'GASTO_B') totalAmountB += amount;
        else if (exp.type === 'GASTO_C') totalAmountC += amount;
    });

    const totalExpenses = totalAmountA + totalAmountB + totalAmountC;

    // 2. Fetch Units
    const units = await Unit.find({ condominiumId });

    // 3. Calculate Draft Settlement Data per Unit
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
    }
    const prevPeriod = `${prevMonth.toString().padStart(2, '0')}-${prevYear}`;
    
    // Find last CLOSED settlement for this condo.
    const prevSettlement = await ExpenseSettlement.findOne({
        condominiumId,
        period: prevPeriod,
        status: 'CLOSED'
    });

    const unitCalculations = [];

    for (const unit of units) {
        let previousBalance = 0;

        if (prevSettlement) {
            const prevStatus = await UnitAccountStatus.findOne({
                settlementId: prevSettlement._id,
                unitId: unit._id
            });
            if (prevStatus) {
                previousBalance = toDecimal(prevStatus.totalToPay);
            }
        }

        // Get Payments in current period
        const payments = await Payment.find({
            condominiumId,
            unitId: unit._id,
            date: { $gte: startDate, $lte: endDate },
            status: 'CONFIRMED'
        });

        let paymentsAmount = payments.reduce((sum, p) => sum + toDecimal(p.amount), 0);

        // Interest Calculation
        let interestAmount = 0;
        let debt = previousBalance - paymentsAmount;
        
        if (debt > 0 && interestRate > 0) {
            interestAmount = debt * (interestRate / 100);
        }

        // Current Period Share
        const coefficient = toDecimal(unit.coefficient) || 0;
        const currentPeriodShare = (totalExpenses * coefficient) / 100;
        
        // Reserve Fund
        const reserveFundAmount = (currentPeriodShare * reserveFundRate) / 100;

        const totalToPay = previousBalance - paymentsAmount + interestAmount + currentPeriodShare + reserveFundAmount;

        unitCalculations.push({
            unitId: unit._id,
            unitNumber: unit.number,
            ownerName: unit.contactName || 'Unknown', 
            coefficient,
            previousBalance,
            paymentsAmount,
            interestAmount,
            currentPeriodShare,
            reserveFundAmount,
            totalToPay
        });
    }

    return {
        period,
        totalAmountA,
        totalAmountB,
        totalAmountC,
        totalExpenses,
        reserveFundPercentage: reserveFundRate,
        units: unitCalculations
    };
}
