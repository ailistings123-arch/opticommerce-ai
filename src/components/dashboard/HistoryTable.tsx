'use client';

import { Optimization } from '@/types';
import { formatDistanceToNow } from '@/lib/utils/date';

interface HistoryTableProps {
  optimizations: Optimization[];
}

export default function HistoryTable({ optimizations }: HistoryTableProps) {
  if (optimizations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-500">
          No optimization history yet. Create your first optimization to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Platform</th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Original Title</th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">SEO Score</th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {optimizations.map((opt) => (
              <tr key={opt.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {opt.platform}
                  </span>
                </td>
                <td className="py-4 px-6 max-w-xs">
                  <div className="text-sm text-gray-900 truncate">{opt.original.title}</div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-semibold text-blue-600">
                    {opt.optimized.seoScore}/100
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {formatDistanceToNow(opt.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
