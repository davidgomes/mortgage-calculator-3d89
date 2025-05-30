
import { z } from 'zod';

// Mortgage calculation input schema
export const mortgageCalculationInputSchema = z.object({
  loan_amount: z.number().positive().min(1, 'Loan amount must be greater than 0'),
  interest_rate: z.number().positive().min(0.01, 'Interest rate must be greater than 0').max(100, 'Interest rate cannot exceed 100%'),
  loan_term_years: z.number().int().positive().min(1, 'Loan term must be at least 1 year').max(50, 'Loan term cannot exceed 50 years')
});

export type MortgageCalculationInput = z.infer<typeof mortgageCalculationInputSchema>;

// Mortgage calculation result schema
export const mortgageCalculationResultSchema = z.object({
  monthly_payment: z.number(),
  total_interest: z.number(),
  total_payment: z.number(),
  loan_amount: z.number(),
  interest_rate: z.number(),
  loan_term_years: z.number()
});

export type MortgageCalculationResult = z.infer<typeof mortgageCalculationResultSchema>;
