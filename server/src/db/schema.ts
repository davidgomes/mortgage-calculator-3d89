
import { serial, numeric, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';

// Table to store mortgage calculation history (optional - for tracking calculations)
export const mortgageCalculationsTable = pgTable('mortgage_calculations', {
  id: serial('id').primaryKey(),
  loan_amount: numeric('loan_amount', { precision: 12, scale: 2 }).notNull(),
  interest_rate: numeric('interest_rate', { precision: 5, scale: 4 }).notNull(), // e.g., 5.2500 for 5.25%
  loan_term_years: integer('loan_term_years').notNull(),
  monthly_payment: numeric('monthly_payment', { precision: 10, scale: 2 }).notNull(),
  total_interest: numeric('total_interest', { precision: 12, scale: 2 }).notNull(),
  total_payment: numeric('total_payment', { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type MortgageCalculation = typeof mortgageCalculationsTable.$inferSelect;
export type NewMortgageCalculation = typeof mortgageCalculationsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { mortgageCalculations: mortgageCalculationsTable };
