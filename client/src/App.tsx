
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { MortgageCalculationInput, MortgageCalculationResult } from '../../server/src/schema';

function App() {
  const [formData, setFormData] = useState<MortgageCalculationInput>({
    loan_amount: 0,
    interest_rate: 0,
    loan_term_years: 0
  });

  const [result, setResult] = useState<MortgageCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const calculationResult = await trpc.calculateMortgage.mutate(formData);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during calculation');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(3)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Mortgage Calculator</h1>
          <p className="text-lg text-gray-600">Calculate your monthly payments and total loan costs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Loan Details</CardTitle>
              <CardDescription>Enter your mortgage information below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loan_amount" className="text-sm font-medium text-gray-700">
                    Loan Amount ($)
                  </Label>
                  <Input
                    id="loan_amount"
                    type="number"
                    placeholder="e.g., 300000"
                    value={formData.loan_amount || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: MortgageCalculationInput) => ({
                        ...prev,
                        loan_amount: parseFloat(e.target.value) || 0
                      }))
                    }
                    min="1"
                    step="1000"
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest_rate" className="text-sm font-medium text-gray-700">
                    Annual Interest Rate (%)
                  </Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    placeholder="e.g., 6.5"
                    value={formData.interest_rate || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: MortgageCalculationInput) => ({
                        ...prev,
                        interest_rate: parseFloat(e.target.value) || 0
                      }))
                    }
                    min="0.01"
                    max="100"
                    step="0.01"
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan_term_years" className="text-sm font-medium text-gray-700">
                    Loan Term (Years)
                  </Label>
                  <Input
                    id="loan_term_years"
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.loan_term_years || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: MortgageCalculationInput) => ({
                        ...prev,
                        loan_term_years: parseInt(e.target.value) || 0
                      }))
                    }
                    min="1"
                    max="50"
                    step="1"
                    required
                    className="text-lg"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 text-lg"
                >
                  {isLoading ? '🔄 Calculating...' : '💰 Calculate Mortgage'}
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">📊 Calculation Results</CardTitle>
              <CardDescription>Your mortgage payment breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                      <p className="text-3xl font-bold text-green-700">
                        {formatCurrency(result.monthly_payment)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Principal & Interest</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Detailed Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Loan Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Loan Amount</p>
                        <p className="text-xl font-semibold text-gray-800">
                          {formatCurrency(result.loan_amount)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Interest Rate</p>
                        <p className="text-xl font-semibold text-gray-800">
                          {formatPercentage(result.interest_rate)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Loan Term</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {result.loan_term_years} years
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Total Interest Paid</span>
                        <span className="text-blue-700 font-bold text-lg">
                          {formatCurrency(result.total_interest)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Total Payment</span>
                        <span className="text-purple-700 font-bold text-lg">
                          {formatCurrency(result.total_payment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏡</div>
                  <p className="text-gray-500 text-lg">Enter your loan details to see calculations</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Fill out the form on the left to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>💡 This calculator provides estimates for planning purposes only.</p>
          <p>Consult with a mortgage professional for detailed loan information.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
