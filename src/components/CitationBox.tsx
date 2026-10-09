import React, { useState } from 'react';
import { FileText, Video, Headphones, BookOpen, ExternalLink, Copy, Check, Quote, Filter } from 'lucide-react';
import { SupportingCitation } from '../data/tafseerData';

interface CitationBoxProps {
  surahNumber: number;
  ayahNumber: number;
  citations: SupportingCitation[];
}

export const CitationBox: React.FC<CitationBoxProps> = ({ surahNumber, ayahNumber, citations }) => {
  const [filter, setFilter] = useState<'all' | 'research_paper' | 'document' | 'video' | 'audio'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCitations = filter === 'all' 
    ? citations 
    : citations.filter(c => c.type === filter);

  const handleCopyCitation = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getTypeIcon = (type: SupportingCitation['type']) => {
    switch (type) {
      case 'research_paper':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTypeLabel = (type: SupportingCitation['type']) => {
    switch (type) {
      case 'research_paper':
        return 'Research Paper';
      case 'document':
        return 'Document / Exegesis';
      case 'video':
        return 'Video Lecture';
      case 'audio':
        return 'Audio Commentary';
    }
  };

  const getTypeBadgeClass = (type: SupportingCitation['type']) => {
    switch (type) {
      case 'research_paper':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'document':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'video':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'audio':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="mt-8 border border-slate-800 bg-slate-900/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Supporting External Resources & Citations
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Ayah {surahNumber}:{ayahNumber}
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Peer-reviewed papers, primary manuscripts, and multimedia commentary directly supporting this Tafsir
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-500 flex items-center gap-1 text-[11px] mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({citations.length})
          </button>
          <button
            onClick={() => setFilter('research_paper')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'research_paper'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Papers
          </button>
          <button
            onClick={() => setFilter('document')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'document'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Docs
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'video'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setFilter('audio')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === 'audio'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Audio
          </button>
        </div>
      </div>

      {/* Citations List */}
      <div className="mt-5 space-y-4">
        {filteredCitations.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500">
            No resources found for the selected category.
          </div>
        ) : (
          filteredCitations.map((citation) => (
            <div
              key={citation.id}
              className="group border border-slate-800 bg-slate-950/60 hover:border-slate-700/80 rounded-xl p-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${getTypeBadgeClass(
                        citation.type
                      )}`}
                    >
                      {getTypeIcon(citation.type)}
                      {getTypeLabel(citation.type)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {citation.authorOrSource}
                    </span>
                    {citation.yearOrEdition && (
                      <span className="text-xs text-slate-500">
                        • {citation.yearOrEdition}
                      </span>
                    )}
                  </div>

                  <h5 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {citation.title}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                    <span className="text-emerald-400 font-medium">Tafsir Relevance: </span>
                    {citation.relevanceSummary}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end sm:self-start">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all"
                    title="Open external source in new tab"
                  >
                    <span>Access Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleCopyCitation(citation.id, citation.citationFormat)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                    title="Copy full academic citation"
                  >
                    {copiedId === citation.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dedicated Citation Box (Academic formatting box) */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-start gap-2 bg-slate-900/30 px-3 py-2 rounded-lg">
                <Quote className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono text-slate-400 break-all select-all leading-normal">
                  {citation.citationFormat}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
