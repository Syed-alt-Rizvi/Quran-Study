import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, Loader2, Link as LinkIcon, Microscope, Maximize2, Minimize2 } from 'lucide-react';
import { fetchSurahDetail, Ayah } from '../api';
import { fetchTafseer } from '../services/tafseerScraper';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface ScienceArticleProps {
  article: any;
  onSelectSurah?: (surah: number) => void;
}

export default function ScienceArticle({ article, onSelectSurah }: ScienceArticleProps) {
  const [expandedAyah, setExpandedAyah] = useState<string | null>(null);
  const [ayahData, setAyahData] = useState<Record<string, { ayah: Ayah, tafseer: any, loading: boolean }>>({});
  const [isArticleExpanded, setIsArticleExpanded] = useState(false);

  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => {
    return () => setIsMounted(false);
  }, []);

  const toggleAyah = async (surahNumber: number, ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    if (expandedAyah === key) {
      setExpandedAyah(null);
      return;
    }
    
    setExpandedAyah(key);
    
    if (!ayahData[key]) {
      setAyahData(prev => ({ ...prev, [key]: { loading: true, ayah: {} as Ayah, tafseer: null } }));
      try {
        const [surahDetail, tafseer] = await Promise.all([
          fetchSurahDetail(surahNumber),
          fetchTafseer(surahNumber, ayahNumber).catch(() => null)
        ]);
        
        const ayah = surahDetail.ayahs.find(a => a.numberInSurah === ayahNumber);
        
        if (!isMounted) return;
        setAyahData(prev => ({
          ...prev,
          [key]: {
            loading: false,
            ayah: ayah || {} as Ayah,
            tafseer: tafseer
          }
        }));
      } catch (e) {
        console.error(e);
        setAyahData(prev => ({ ...prev, [key]: { loading: false, ayah: {} as Ayah, tafseer: null } }));
      }
    }
  };

  return (
    <div className={`bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl p-6 border-[0.5px] border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden group`}>
      <div 
        className={`flex items-start justify-between gap-4 cursor-pointer`}
        onClick={() => setIsArticleExpanded(!isArticleExpanded)}
      >
        <div className="w-full">
          <div className="flex items-center gap-3 mb-4">
             <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
                Quran & Science Insights
             </span>
             <span className="w-8 h-[2px] bg-emerald-500/40"></span>
          </div>

          <h3 className={`font-bold font-serif text-2xl mb-3 text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors`}>{article.title}</h3>
          
          {!isArticleExpanded && article.content && (
            <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm leading-relaxed">
              {article.content.substring(0, 300).replace(/[*#>`_-]/g, '')}...
            </p>
          )}
        </div>
        
        <button className="p-2.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors flex-shrink-0 mt-1 shadow-sm">
          {isArticleExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
      
      <AnimatePresence initial={false}>
        {isArticleExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-slate-800 dark:text-slate-200 text-base leading-relaxed mb-6">
              <Markdown
                components={{
                  h2: ({node, ...props}) => <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-slate-900 dark:text-slate-50 border-b-[0.5px] border-slate-200 dark:border-slate-800 pb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-serif font-semibold mt-8 mb-3 text-slate-800 dark:text-slate-100" {...props} />,
                  p: ({node, ...props}) => <p className="mb-5 font-serif text-lg text-slate-700 dark:text-slate-300 leading-relaxed tracking-wide" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-emerald-500 pl-5 py-2 my-8 text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-r-xl shadow-sm text-lg font-serif" {...props} />
                  ),
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-5 space-y-2 text-slate-700 dark:text-slate-300 font-serif text-lg" {...props} />,
                  li: ({node, ...props}) => <li {...props} />,
                  a: ({node, href, children, ...props}) => {
                    if (href?.startsWith('surah:')) {
                      const parts = href.split(':');
                      const surah = parseInt(parts[1], 10);
                      const ayah = parseInt(parts[2], 10);
                      return (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (ayah) {
                              window.location.hash = `#ayah-${ayah}`;
                            } else {
                              window.location.hash = ''; // clear hash
                            }
                            onSelectSurah?.(surah);
                          }}
                          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 px-2 py-1 -mx-2 rounded transition-colors cursor-pointer text-left inline-block w-full"
                        >
                          {children}
                        </button>
                      );
                    }
                    return <a href={href} className="text-teal-600 hover:underline" {...props}>{children}</a>;
                  }
                }}
              >
                {article.content.replace(/\{source\}[\s\S]*?\{\/source\}/g, '')}
              </Markdown>
            </div>
            
            {article.relations && article.relations.length > 0 && (
              <div className="mt-6 space-y-3 border-t-[0.5px] border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-emerald-600" />
                  Related Ayahs & Tafseer Insights
                </h4>
                
                {article.relations.map((rel: any) => {
                  const key = `${rel.surahNumber}:${rel.ayahNumber}`;
                  const isExpanded = expandedAyah === key;
                  const data = ayahData[key];
                  
                  return (
                    <div key={key} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border-[0.5px] border-slate-200/60 dark:border-slate-700/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-medium text-xs">

                      {rel.surahNumber}:{rel.ayahNumber}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Surah {rel.surahNumber}, Ayah {rel.ayahNumber}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onSelectSurah && (
                      <button 
                        onClick={() => onSelectSurah(rel.surahNumber)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <LinkIcon size={14} /> Open Surah
                      </button>
                    )}
                    <button 
                      onClick={() => toggleAyah(rel.surahNumber, rel.ayahNumber)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md border border-white/40 dark:border-slate-700/50 border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {isExpanded ? 'Hide Insights' : 'Read Insights'}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t-[0.5px] border-slate-200/60 dark:border-slate-700/50"
                    >
                      <div className="p-4 sm:p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6">
                        {data?.loading ? (
                          <div className="flex items-center justify-center py-8 text-slate-400">
                            <Loader2 size={24} className="animate-spin" />
                          </div>
                        ) : data?.ayah ? (
                          <>
                            <div className="text-right">
                              <p className="font-arabic text-2xl sm:text-3xl leading-loose text-slate-800 dark:text-slate-200" dir="rtl">
                                {data.ayah.text}
                              </p>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Translation (English)</h5>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {data.ayah.translationEn}
                                </p>
                              </div>
                              
                              {data.tafseer && (
                                <div className="mt-6 p-4 sm:p-5 bg-amber-50 dark:bg-amber-900/10 border-[0.5px] border-amber-100 dark:border-amber-900/30 rounded-xl">
                                  <h5 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Microscope size={14} />
                                    Tafseer-e-Namoona Insights
                                  </h5>
                                  <div className="markdown-body text-sm text-slate-700 dark:text-slate-300">
                                    <Markdown>{data.tafseer.text}</Markdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 text-center py-4">Failed to load Ayah details.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
      
            <div className="mt-6 pt-4 border-t-[0.5px] border-slate-100 dark:border-slate-800 flex justify-end">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Credit: QuranAndScience.com
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
