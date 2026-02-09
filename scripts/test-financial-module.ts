
// Mock standard console logs to clean output
const originalLog = console.log;
console.log = (...args) => {
    // Filter out some Mongoose connection logs if needed, but for now keep them
    originalLog(...args);
};

// We need to setup environment variables if not present, but for a script we can rely on defaults or hardcode for test
// Using dotenv would be better
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import dbConnect from '../src/lib/dbConnect';
import Expense from '../src/models/Expense';
import Unit from '../src/models/Unit';
import Condominium from '../src/models/Condominium';
import Payment from '../src/models/Payment';
import { calculateSettlement } from '../src/lib/services/financialService';
import ExpenseSettlement from '../src/models/ExpenseSettlement';
import UnitAccountStatus from '../src/models/UnitAccountStatus';


async function runTest() {
    console.log("Starting Financial Module Test...");

    await dbConnect();

    const testCondoName = "Test Condo Financial";
    
    // Cleanup existing test data if any from previous failed runs
    console.log("Cleaning up previous test data...");
    const existingCondo = await Condominium.findOne({ name: testCondoName });
    if (existingCondo) {
        await Expense.deleteMany({ condominiumId: existingCondo._id });
        await Unit.deleteMany({ condominiumId: existingCondo._id });
        await ExpenseSettlement.deleteMany({ condominiumId: existingCondo._id });
        await Payment.deleteMany({ condominiumId: existingCondo._id });
        // Also cleanup UnitAccountStatus? We'd need to find settlements first but deleting condo cascades conceptually.
        // For strictness:
        const settlements = await ExpenseSettlement.find({ condominiumId: existingCondo._id });
        for (const s of settlements) {
            await UnitAccountStatus.deleteMany({ settlementId: s._id });
        }
        await Condominium.deleteOne({ _id: existingCondo._id });
    }
    // Also force delete units with specific numbers just in case they are orphaned
    await Unit.deleteOne({ number: "TEST-101" }); 
    await Unit.deleteOne({ number: "TEST-102" });

    // 1. Create Dummy Data
    // Create Condominium
    console.log("Creating Condominium...");
    const condo = await Condominium.create({
        name: testCondoName,
        address: "123 Test St",
        unitCount: 2,
    });
    const condoId = condo._id;

    // Create Units
    console.log("Creating Units...");
    // Unit 1: 50%
    const unit1 = await Unit.create({
        condominiumId: condoId,
        number: "TEST-101",
        coefficient: 50,
        contactName: "John Doe"
    });
    // Unit 2: 50%
    const unit2 = await Unit.create({
        condominiumId: condoId,
        number: "TEST-102",
        coefficient: 50,
        contactName: "Jane Smith"
    });

    // Create Expenses for current month (Year 2026, Month 2 - February)
    console.log("Creating Expenses...");
    const year = 2026;
    const month = 2; // Feb
    const expenseData = [
        {
            condominiumId: condoId,
            description: "Cleaning Service",
            provider: "CleanCo",
            amount: 1000,
            category: "MANTENIMIENTO",
            type: "GASTO_A",
            date: new Date(2026, 1, 15), // Feb 15
            paymentMethod: "BANCO"
        },
        {
            condominiumId: condoId,
            description: "Security",
            provider: "SecureCorp",
            amount: 2000,
            category: "SERVICIOS",
            type: "GASTO_B",
            date: new Date(2026, 1, 20),
            paymentMethod: "BANCO"
        }
    ];

    for (const exp of expenseData) {
        await Expense.create(exp);
    }
    
    // Total Expenses: 3000
    // Unit 1 Share: 1500
    // Unit 2 Share: 1500

    // Create a previous settlement for January to test balances
    // Let's say Unit 1 had a debt of 500
    console.log("Creating Previous Settlement...");
    const prevSettlement = await ExpenseSettlement.create({
        condominiumId: condoId,
        period: "01-2026",
        totalAmountA: 1000,
        status: "CLOSED",
        reserveFundPercentage: 0
    });

    await UnitAccountStatus.create({
        settlementId: prevSettlement._id,
        unitId: unit1._id,
        ownerName: "John Doe",
        coefficient: 50,
        totalToPay: 500, // Debt
    });
    
    // Unit 2 had 0 debt

    // Create a Payment for Unit 1 in Feb
    console.log("Creating Payment...");
    await Payment.create({
        condominiumId: condoId,
        unitId: unit1._id,
        amount: 200,
        date: new Date(2026, 1, 5),
        status: "CONFIRMED"
    });

    // 2. Run Calculation
    console.log("Running Calculation...");
    const result = await calculateSettlement({
        condominiumId: condoId.toString(),
        month: 2,
        year: 2026,
        interestRate: 4, // 4% interest on debt
        reserveFundRate: 10 // 10% reserve fund
    });

    // 3. Verify Results
    console.log("Verifying Results...");
    
    // Expected Total Expenses: 3000
    console.log(`Total Expenses: ${result.totalExpenses} (Expected: 3000)`);

    // Unit 1:
    // Prev Balance: 500
    // Payments: 200
    // Debt Base: 300
    // Interest: 300 * 0.04 = 12
    // Current Share: 3000 * 0.5 = 1500
    // Reserve Fund: 1500 * 0.10 = 150
    // Total: 300 + 12 + 1500 + 150 = 1962
    
    const u1Res = result.units.find(u => u.unitId.toString() === unit1._id.toString());
    if (!u1Res) throw new Error("Unit 1 result not found");
    
    console.log(`Unit 1 Total: ${u1Res.totalToPay} (Expected: 1962)`);
    console.log(`Unit 1 Interest: ${u1Res.interestAmount} (Expected: 12)`);
    console.log(`Unit 1 Reserve: ${u1Res.reserveFundAmount} (Expected: 150)`);

    // Unit 2:
    // Prev Balance: 0
    // Payments: 0
    // Debt Base: 0
    // Interest: 0
    // Current Share: 1500
    // Reserve Fund: 150
    // Total: 1650

    const u2Res = result.units.find(u => u.unitId.toString() === unit2._id.toString());
    if (!u2Res) throw new Error("Unit 2 result not found");
    
    console.log(`Unit 2 Total: ${u2Res.totalToPay} (Expected: 1650)`);

    // 4. Persistence Test (Simulate Confirm)
    console.log("Testing Persistence (Simulating Confirm)...");
    const newSettlement = await ExpenseSettlement.create({
        condominiumId: condoId,
        period: "02-2026",
        totalAmountA: result.totalAmountA,
        totalAmountB: result.totalAmountB,
        totalAmountC: result.totalAmountC,
        reserveFundPercentage: 10,
        status: "SENT",
        processedAt: new Date()
    });

    const accountStatuses = result.units.map((u: any) => ({
        settlementId: newSettlement._id,
        unitId: u.unitId,
        ownerName: u.ownerName,
        coefficient: u.coefficient,
        previousBalance: u.previousBalance,
        paymentsAmount: u.paymentsAmount,
        interestAmount: u.interestAmount,
        currentPeriodShare: u.currentPeriodShare,
        reserveFundAmount: u.reserveFundAmount,
        totalToPay: u.totalToPay
    }));

    await UnitAccountStatus.insertMany(accountStatuses);

    // Verify DB
    const savedSettlement = await ExpenseSettlement.findById(newSettlement._id);
    if (!savedSettlement) throw new Error("Settlement not saved");
    console.log("Settlement saved:", savedSettlement.period);

    const savedStatuses = await UnitAccountStatus.find({ settlementId: newSettlement._id });
    if (savedStatuses.length !== 2) throw new Error("Statuses not saved correctly");
    console.log(`Saved ${savedStatuses.length} unit statuses.`);
    
    // Verify values in DB
    const savedU1 = savedStatuses.find(s => s.unitId.toString() === unit1._id.toString());
    // Use toString() for Decimal comparison or parseFloat
    if (parseFloat(savedU1.totalToPay.toString()) !== 1962) {
        console.error(`DB Value Mismatch for U1: ${savedU1.totalToPay}`);
    } else {
        console.log("DB Value for U1 verified (1962)");
    }

    // Cleanup
    console.log("Cleaning up...");
    await Expense.deleteMany({ condominiumId: condoId });
    await Unit.deleteMany({ condominiumId: condoId });
    await Condominium.deleteOne({ _id: condoId });
    await ExpenseSettlement.deleteMany({ condominiumId: condoId });
    await UnitAccountStatus.deleteMany({ settlementId: prevSettlement._id });
    await Payment.deleteMany({ condominiumId: condoId });

    console.log("Test Complete.");
    process.exit(0);
}

runTest().catch(console.error);
