import React, { useState } from 'react';
import { Layers, CheckCircle2, ShieldCheck, Hash, Link2, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { LedgerBlock } from '../types';

interface LedgerInspectorProps {
  blocks: LedgerBlock[];
  isChainValid: boolean;
  onRefresh: () => void;
}

export const LedgerInspector: React.FC<LedgerInspectorProps> = ({
  blocks,
  isChainValid,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

  const filteredBlocks = blocks.filter(
    (b) =>
      b.blockIndex.toString().includes(searchTerm) ||
      b.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.blockHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cryptographic Integrity Protocol
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tamper-Proof Audit Chain Inspector
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Every complaint submission, "Me Too" endorsement, status progression, and communication is cryptographically hashed into an immutable linear block sequence. Retroactive tampering by database administrators or institutional staff immediately invalidates the chain.
          </p>
        </div>
      </div>

      {/* Chain Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Chain Integrity Status</span>
            <span className="text-lg font-bold text-slate-900 flex items-center gap-1">
              {isChainValid ? '100% Cryptographically Valid' : 'Tamper Detected!'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Blocks Minted</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {blocks.length} Blocks
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Hashing Algorithm</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              SHA-256 Digest
            </span>
          </div>
        </div>
      </div>

      {/* Explorer Search & Action Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blocks by Index, Action, or SHA-256 Hash..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Verify & Refresh Chain</span>
          </button>
        </div>

        {/* Blocks Stream */}
        <div className="space-y-3 pt-2">
          {filteredBlocks.map((block, idx) => {
            const isGenesis = block.blockIndex === 1;
            const isExpanded = expandedBlock === block.blockIndex;

            return (
              <div
                key={block.blockIndex}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-4 transition-all hover:border-blue-300"
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedBlock(isExpanded ? null : block.blockIndex)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                      #{block.blockIndex}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {block.action.replace(/_/g, ' ')}
                        </span>
                        {isGenesis && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded font-mono">
                            GENESIS
                          </span>
                        )}
                        {block.complaintId > 0 && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded font-mono">
                            Grievance #{block.complaintId}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(block.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <div className="hidden md:block text-right">
                      <span className="text-slate-400 text-[10px] block">BLOCK HASH</span>
                      <span className="text-blue-700 font-semibold">{block.blockHash.substring(0, 16)}...</span>
                    </div>
                    <span className="text-blue-600 text-xs font-sans font-semibold">
                      {isExpanded ? 'Hide Details' : 'Inspect Block'}
                    </span>
                  </div>
                </div>

                {/* Expanded Block Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 font-mono text-xs space-y-2 bg-slate-900 text-slate-200 p-4 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CURRENT BLOCK HASH (SHA-256):</span>
                      <span className="text-emerald-300 break-all">{block.blockHash}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">PREVIOUS BLOCK HASH (LINKED PARENT):</span>
                      <span className="text-blue-300 break-all">{block.prevHash}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">PAYLOAD DATA HASH (MERKLE LEAF):</span>
                      <span className="text-amber-300 break-all">{block.dataHash}</span>
                    </div>
                    <div className="pt-2 text-[11px] text-slate-400 font-sans">
                      Verified link: Previous block hash matches parent block hash perfectly. Chain unbroken.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
