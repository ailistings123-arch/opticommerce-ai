'use client';

import { useState } from 'react';
import { OptimizationInput, ApiResponse, OptimizedContent } from '@/types';
import { auth } from '@/lib/firebase/config';

export function useOptimization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizedContent | null>(null);

  const optimize = async (input: OptimizationInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      const data: ApiResponse<{ optimized: OptimizedContent; usageRemaining: number }> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Optimization failed');
      }

      setResult(data.data!.optimized);
      return data.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    optimize,
    loading,
    error,
    result,
  };
}
