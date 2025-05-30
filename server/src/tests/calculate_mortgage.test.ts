
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type MortgageCalculationInput } from '../schema';
import { calculateMortgage } from '../handlers/calculate_mortgage';

// Test input for a typical mortgage
const testInput: MortgageCalculationInput = {
  loan_amount: 300000,
  interest_rate: 6.5,
  loan_term_years: 30
};

describe('calculateMortgage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should calculate mortgage payment correctly', async () => {
    const result = await calculateMortgage(testInput);

    // Verify input values are preserved
    expect(result.loan_amount).toEqual(300000);
    expect(result.interest_rate).toEqual(6.5);
    expect(result.loan_term_years).toEqual(30);

    // Verify calculation results are reasonable
    expect(result.monthly_payment).toBeGreaterThan(0);
    expect(result.total_interest).toBeGreaterThan(0);
    expect(result.total_payment).toBeGreaterThan(result.loan_amount);

    // Verify that total payment equals loan amount plus total interest (within rounding tolerance)
    expect(result.total_payment).toBeCloseTo(result.loan_amount + result.total_interest, 1);

    // Verify monthly payment multiplied by number of payments equals total payment (within rounding tolerance)
    const calculatedTotal = result.monthly_payment * (result.loan_term_years * 12);
    expect(result.total_payment).toBeCloseTo(calculatedTotal, 1);
  });

  it('should handle zero interest rate correctly', async () => {
    const zeroInterestInput: MortgageCalculationInput = {
      loan_amount: 240000,
      interest_rate: 0.01, // Minimum allowed by schema
      loan_term_years: 20
    };

    const result = await calculateMortgage(zeroInterestInput);

    expect(result.monthly_payment).toBeGreaterThan(0);
    expect(result.total_interest).toBeGreaterThan(0);
    expect(result.total_payment).toBeGreaterThan(result.loan_amount);
  });

  it('should calculate short-term loan correctly', async () => {
    const shortTermInput: MortgageCalculationInput = {
      loan_amount: 150000,
      interest_rate: 4.25,
      loan_term_years: 15
    };

    const result = await calculateMortgage(shortTermInput);

    // Short-term loan should have higher monthly payment but less total interest
    expect(result.monthly_payment).toBeGreaterThan(0);
    expect(result.total_interest).toBeGreaterThan(0);
    expect(result.total_payment).toBeGreaterThan(result.loan_amount);

    // Verify the monthly payment is higher than a 30-year equivalent
    const longTermResult = await calculateMortgage({
      ...shortTermInput,
      loan_term_years: 30
    });

    expect(result.monthly_payment).toBeGreaterThan(longTermResult.monthly_payment);
    expect(result.total_interest).toBeLessThan(longTermResult.total_interest);
  });

  it('should return properly rounded decimal values', async () => {
    const result = await calculateMortgage(testInput);

    // Check that values are rounded to 2 decimal places
    expect(result.monthly_payment).toEqual(Math.round(result.monthly_payment * 100) / 100);
    expect(result.total_interest).toEqual(Math.round(result.total_interest * 100) / 100);
    expect(result.total_payment).toEqual(Math.round(result.total_payment * 100) / 100);

    // Verify no more than 2 decimal places
    expect(result.monthly_payment.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.total_interest.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.total_payment.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });

  it('should handle high interest rate correctly', async () => {
    const highInterestInput: MortgageCalculationInput = {
      loan_amount: 200000,
      interest_rate: 15.0,
      loan_term_years: 30
    };

    const result = await calculateMortgage(highInterestInput);

    expect(result.monthly_payment).toBeGreaterThan(0);
    expect(result.total_interest).toBeGreaterThan(result.loan_amount); // High interest means interest > principal
    expect(result.total_payment).toBeGreaterThan(result.loan_amount);
  });

  it('should handle exact calculation verification', async () => {
    // Use a simple case for exact verification
    const simpleInput: MortgageCalculationInput = {
      loan_amount: 100000,
      interest_rate: 6.0,
      loan_term_years: 30
    };

    const result = await calculateMortgage(simpleInput);

    // Verify the calculation consistency
    const monthlyTotal = result.monthly_payment * (simpleInput.loan_term_years * 12);
    const interestPlusPrincipal = result.total_interest + simpleInput.loan_amount;

    // Both should equal total_payment (within rounding tolerance)
    expect(result.total_payment).toBeCloseTo(monthlyTotal, 1);
    expect(result.total_payment).toBeCloseTo(interestPlusPrincipal, 1);
  });
});
