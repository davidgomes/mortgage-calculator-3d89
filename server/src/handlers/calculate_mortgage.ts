
import { type MortgageCalculationInput, type MortgageCalculationResult } from '../schema';

export const calculateMortgage = async (input: MortgageCalculationInput): Promise<MortgageCalculationResult> => {
  try {
    const { loan_amount, interest_rate, loan_term_years } = input;
    
    // Convert annual interest rate percentage to monthly decimal rate
    const monthlyInterestRate = (interest_rate / 100) / 12;
    
    // Calculate total number of monthly payments
    const totalPayments = loan_term_years * 12;
    
    // Calculate monthly payment using mortgage formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    // Where: M = monthly payment, P = principal, r = monthly rate, n = number of payments
    let monthly_payment: number;
    
    if (monthlyInterestRate === 0) {
      // Special case: 0% interest rate
      monthly_payment = loan_amount / totalPayments;
    } else {
      const factor = Math.pow(1 + monthlyInterestRate, totalPayments);
      monthly_payment = loan_amount * (monthlyInterestRate * factor) / (factor - 1);
    }
    
    // Round monthly payment to 2 decimal places
    monthly_payment = Math.round(monthly_payment * 100) / 100;
    
    // Calculate totals based on the rounded monthly payment for consistency
    const total_payment = monthly_payment * totalPayments;
    const total_interest = total_payment - loan_amount;
    
    return {
      monthly_payment,
      total_interest: Math.round(total_interest * 100) / 100,
      total_payment: Math.round(total_payment * 100) / 100,
      loan_amount,
      interest_rate,
      loan_term_years
    };
  } catch (error) {
    console.error('Mortgage calculation failed:', error);
    throw error;
  }
};
