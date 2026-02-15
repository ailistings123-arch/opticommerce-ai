'use client';

import { useState } from 'react';
import { Optimization } from '@/types';
import { formatDistanceToNow } from '@/lib/utils/date';
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check } from 'lucide-react';

interface HistoryTableProps {
  optimizations: Optimization[];
}

export default function HistoryTable({ optimizations }: HistoryTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (optimizations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
          <p className="text-gray-500">
            Your optimization history will appear here. Create your first optimization to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-10"></th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Platform</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Mode</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Title Preview</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">SEO Score</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {optimizations.map((opt: any) => {
              const isExpanded = expandedRow === opt.id;
              const mode = opt.mode || 'optimize-existing';
              const titlePreview = opt.optimized?.title || opt.original?.title || 'N/A';
              
              return (
                <>
                  <tr 
                    key={opt.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleRow(opt.id)}
                  >
                    <td className="py-4 px-4">
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {opt.platform}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {mode === 'optimize-existing' && '🔄 Optimize'}
                        {mode === 'create-new' && '✨ Create'}
                        {mode === 'analyze-url' && '🔍 Analyze'}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-sm text-gray-900 truncate">{titlePreview}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600">
                          {opt.optimized?.seoScore || 'N/A'}
                        </span>
                        {opt.optimized?.seoScore && (
                          <span className="text-xs text-gray-400">/100</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDistanceToNow(opt.createdAt)}
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-4 py-6">
                        <div className="max-w-5xl mx-auto space-y-6">
                          {/* Original Content (if exists) */}
                          {opt.original && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                📝 Original Content
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-medium text-gray-600">Title</label>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(opt.original.title, `original-title-${opt.id}`);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      {copiedField === `original-title-${opt.id}` ? (
                                        <><Check size={12} /> Copied</>
                                      ) : (
                                        <><Copy size={12} /> Copy</>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{opt.original.title}</p>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-medium text-gray-600">Description</label>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(opt.original.description, `original-desc-${opt.id}`);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      {copiedField === `original-desc-${opt.id}` ? (
                                        <><Check size={12} /> Copied</>
                                      ) : (
                                        <><Copy size={12} /> Copy</>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                                    {opt.original.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* URL Info (for analyze-url mode) */}
                          {opt.url && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                🔗 Source URL
                              </h4>
                              <a 
                                href={opt.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 break-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {opt.url} <ExternalLink size={12} />
                              </a>
                            </div>
                          )}

                          {/* Optimized Content */}
                          {opt.optimized && (
                            <div className="bg-white rounded-lg border border-green-200 p-4">
                              <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                                ✨ Optimized Content
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-medium text-gray-600">Title</label>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(opt.optimized.title, `optimized-title-${opt.id}`);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      {copiedField === `optimized-title-${opt.id}` ? (
                                        <><Check size={12} /> Copied</>
                                      ) : (
                                        <><Copy size={12} /> Copy</>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">{opt.optimized.title}</p>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-medium text-gray-600">Description</label>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(opt.optimized.description, `optimized-desc-${opt.id}`);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      {copiedField === `optimized-desc-${opt.id}` ? (
                                        <><Check size={12} /> Copied</>
                                      ) : (
                                        <><Copy size={12} /> Copy</>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-700 bg-green-50 p-2 rounded max-h-32 overflow-y-auto">
                                    {opt.optimized.description}
                                  </p>
                                </div>
                                {opt.optimized.tags && opt.optimized.tags.length > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Tags</label>
                                    <div className="flex flex-wrap gap-1">
                                      {opt.optimized.tags.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {opt.optimized.improvements && opt.optimized.improvements.length > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Key Improvements</label>
                                    <ul className="text-xs text-gray-700 space-y-1">
                                      {opt.optimized.improvements.slice(0, 3).map((imp: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1">
                                          <span className="text-green-600">✓</span>
                                          <span>{imp}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
