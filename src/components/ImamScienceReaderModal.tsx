import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  Share2, 
  ArrowUp, 
  ArrowLeft, 
  Quote, 
  Check, 
  Sparkles, 
  Layers, 
  Type, 
  Bookmark, 
  BookOpen, 
  AlignLeft, 
  Sun, 
  Moon, 
  Coffee,
  Globe
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { formatImamArticleContent } from '../utils/imamContentFormatter';
import { getApiUrl } from '../utils/apiBase';
import { hapticImpact, hapticSelection } from '../utils/haptics';
import { registerModal } from '../utils/modalBackHandler';
import { ImpactStyle } from '@capacitor/haptics';

export interface ImamArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categories: string[];
  primaryCategory: string;
  imageUrl: string;
  imageAlt?: string;
  highlights?: string[];
  headings?: { level: string; text: string }[];
  readingTime?: string;
  wordCount?: number;
  sourceUrl: string;
  author?: string;
  publishedDate?: string;
}

interface ReaderModalProps {
  article: ImamArticle | null;
  onClose: () => void;
  onSelectCategory?: (category: string) => void;
}

type FontSize = 'sm' | 'base' | 'lg' | 'xl';
type ReaderTheme = 'paper' | 'clean' | 'twilight';

export default function ImamScienceReaderModal({ article, onClose, onSelectCategory }: ReaderModalProps) {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isSerif, setIsSerif] = useState(true);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('paper');
  const [activeContent, setActiveContent] = useState<string>(article?.content || '');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (!article) return;
    setActiveContent(article.content || '');

    // If content ends with ... or is under 600 chars while article wordCount > 150, fetch full content
    const isTruncated = !article.content || article.content.endsWith('...') || 
      (article.wordCount && article.wordCount > 150 && article.content.length < 800);

    if (isTruncated) {
      setIsLoadingContent(true);
      // Try local offline bundled file first (/imam_science_articles/${article.slug}.json)
      fetch(`/imam_science_articles/${article.slug}.json`)
        .then(res => {
          if (!res.ok) throw new Error('Offline file not found');
          return res.json();
        })
        .then(data => {
          if (data && data.content) {
            setActiveContent(data.content);
            setIsLoadingContent(false);
          } else {
            throw new Error('No content in offline json');
          }
        })
        .catch(() => {
          // Fallback to backend API
          return fetch(getApiUrl(`/api/imam-science/articles/${article.slug}`))
            .then(res => res.json())
            .then(data => {
              if (data && data.content) {
                setActiveContent(data.content);
              }
            });
        })
        .catch(err => console.warn('Could not fetch full article text:', err))
        .finally(() => setIsLoadingContent(false));
    }
  }, [article?.slug, article?.content]);

  const contentRef = useRef<HTMLDivElement>(null);

  // Handle Android hardware back button and escape key
  useEffect(() => {
    if (!article) return;

    const handleCloseEvent = () => {
      if (showToc) {
        setShowToc(false);
      } else {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseEvent();
      }
    };

    const unregister = registerModal(handleCloseEvent);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('close-science-modal', handleCloseEvent);
    return () => {
      unregister();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('close-science-modal', handleCloseEvent);
    };
  }, [article, onClose, showToc]);

  // Lock body scroll when reader is active
  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [article]);

  if (!article) return null;

  // Run content formatting
  const formatted = formatImamArticleContent(activeContent || article.content || '', article.title);
  const displayHeadings = (article.headings && article.headings.length > 0) 
    ? article.headings 
    : formatted.tocHeadings.map(h => ({ level: `h${h.level}`, text: h.title }));

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const progress = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));
    setScrollProgress(progress);
    setShowBackToTop(scrollTop > 450);
  };

  const handleShare = async () => {
    const url = article.sourceUrl || window.location.href;
    const shareData = {
      title: article.title,
      text: article.excerpt || `Read "${article.title}" on Shia Quran & Science`,
      url
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // User cancelled or unsupported, fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const scrollToHeading = (text: string) => {
    const cleanId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const el = document.getElementById(cleanId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowToc(false);
    }
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Font size classes
  const fontSizes: Record<FontSize, { body: string; h2: string; h3: string }> = {
    sm: { body: 'text-[16px] leading-[1.7]', h2: 'text-2xl', h3: 'text-xl' },
    base: { body: 'text-[18px] sm:text-[19px] leading-[1.8]', h2: 'text-2xl sm:text-3xl', h3: 'text-xl sm:text-2xl' },
    lg: { body: 'text-[21px] leading-[1.85]', h2: 'text-3xl sm:text-4xl', h3: 'text-2xl' },
    xl: { body: 'text-[24px] leading-[1.9]', h2: 'text-4xl', h3: 'text-2xl sm:text-3xl' }
  };

  // Theme styles
  const themeClasses = {
    paper: 'bg-[#faf7f0] text-[#2c2621] dark:bg-[#111726] dark:text-slate-100',
    clean: 'bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100',
    twilight: 'bg-[#0a0f1d] text-slate-100'
  };

  const surfaceClasses = {
    paper: 'bg-[#f4efe4] dark:bg-[#192237] border-amber-900/10 dark:border-slate-800',
    clean: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    twilight: 'bg-[#11182c] border-slate-800 text-slate-200'
  };

  return (
    <AnimatePresence>
      <div 
        key="imam-reader-modal-overlay"
        id="imam-reader-overlay"
        data-modal="imam-science-reader"
        className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-md transition-opacity duration-300"
      >
        {/* Main Reader Stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full h-full flex flex-col ${themeClasses[readerTheme]} overflow-hidden pb-safe`}
        >
          {/* Top Reading Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-transparent z-40 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Sticky Reader Header */}
          <header className={`sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-black/5 dark:border-white/10 backdrop-blur-md transition-colors pt-safe ${
            readerTheme === 'twilight' ? 'bg-[#0a0f1d]/90' : readerTheme === 'paper' ? 'bg-[#faf7f0]/90 dark:bg-[#111726]/90' : 'bg-white/90 dark:bg-slate-950/90'
          }`}>
            {/* Left: Back & Category Pill */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="reader-back-btn"
                onClick={() => {
                  hapticSelection();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Back to Topics"
              >
                <ArrowLeft size={16} className="text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline font-sans">Back</span>
              </button>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                <Sparkles size={11} className="mr-1 opacity-75" />
                {article.primaryCategory || 'Ahlebait Teachings'}
              </span>

              {/* Table of Contents Trigger */}
              {displayHeadings && displayHeadings.length > 1 && (
                <button
                  onClick={() => setShowToc(!showToc)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    showToc ? 'bg-emerald-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Table of Contents"
                >
                  <Layers size={14} />
                  <span className="hidden md:inline font-sans">Contents</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-bold ml-0.5">
                    {displayHeadings.length}
                  </span>
                </button>
              )}
            </div>

            {/* Center: Typography & Theme Controls */}
            <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
              {/* Font Size decrease */}
              <button
                onClick={() => {
                  if (fontSize === 'xl') setFontSize('lg');
                  else if (fontSize === 'lg') setFontSize('base');
                  else if (fontSize === 'base') setFontSize('sm');
                }}
                disabled={fontSize === 'sm'}
                className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 disabled:opacity-40 font-bold text-xs transition-all"
                title="Decrease font size"
              >
                A-
              </button>
              {/* Font Size increase */}
              <button
                onClick={() => {
                  if (fontSize === 'sm') setFontSize('base');
                  else if (fontSize === 'base') setFontSize('lg');
                  else if (fontSize === 'lg') setFontSize('xl');
                }}
                disabled={fontSize === 'xl'}
                className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 disabled:opacity-40 font-bold text-sm transition-all"
                title="Increase font size"
              >
                A+
              </button>

              <div className="w-px h-4 bg-black/10 dark:bg-white/15 mx-1" />

              {/* Serif / Sans Toggle */}
              <button
                onClick={() => setIsSerif(!isSerif)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isSerif ? 'bg-white dark:bg-white/10 shadow-xs font-serif' : 'font-sans opacity-70'
                }`}
                title="Toggle Serif / Sans font"
              >
                {isSerif ? 'Serif' : 'Sans'}
              </button>

              <div className="w-px h-4 bg-black/10 dark:bg-white/15 mx-1" />

              {/* Theme toggles */}
              <button
                onClick={() => setReaderTheme('paper')}
                className={`p-1.5 rounded-lg transition-all ${readerTheme === 'paper' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400/50' : 'opacity-60 hover:opacity-100'}`}
                title="Sepia / Warm Paper Theme"
              >
                <Coffee size={13} />
              </button>
              <button
                onClick={() => setReaderTheme('clean')}
                className={`p-1.5 rounded-lg transition-all ${readerTheme === 'clean' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-400/50' : 'opacity-60 hover:opacity-100'}`}
                title="Clean Light Theme"
              >
                <Sun size={13} />
              </button>
              <button
                onClick={() => setReaderTheme('twilight')}
                className={`p-1.5 rounded-lg transition-all ${readerTheme === 'twilight' ? 'bg-slate-900 text-emerald-400 ring-1 ring-emerald-500/50' : 'opacity-60 hover:opacity-100'}`}
                title="Twilight Dark Theme"
              >
                <Moon size={13} />
              </button>
            </div>

            {/* Right Top Corner: Source Link, Share, and Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Direct Link button if available */}
              {article.sourceUrl && (
                <a
                  id="reader-ext-link"
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 transition-all"
                  title="Open Original Publication"
                >
                  <Globe size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Original Reference</span>
                  <ExternalLink size={12} />
                </a>
              )}

              {/* Share button */}
              <button
                id="reader-share-btn"
                onClick={handleShare}
                className="relative p-2 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Share Article Link"
              >
                {copied ? (
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-emerald-600 dark:text-emerald-400 flex items-center">
                    <Check size={17} />
                  </motion.div>
                ) : (
                  <Share2 size={17} />
                )}
              </button>

              {/* Close button */}
              <button
                id="reader-close-btn"
                onClick={onClose}
                className="p-2 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-0.5"
                title="Close Reader (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Toast Notification when link copied */}
          <AnimatePresence>
            {copied && (
              <motion.div 
                key="toast-copied"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700"
              >
                <Check size={14} className="text-emerald-400" />
                <span>Article link copied to clipboard!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table of Contents Drawer Popover */}
          <AnimatePresence>
            {showToc && displayHeadings && displayHeadings.length > 0 && (
              <motion.div
                key="toc-drawer-popover"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-14 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 max-h-[70vh] z-40 rounded-2xl shadow-2xl p-4 sm:p-5 overflow-y-auto border backdrop-blur-xl ${surfaceClasses[readerTheme]}`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <Layers size={15} />
                    <span>Table of Contents ({displayHeadings.length})</span>
                  </div>
                  <button onClick={() => setShowToc(false)} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {displayHeadings.map((h, idx) => (
                    <button
                      key={`toc-heading-${idx}-${h.text}`}
                      onClick={() => scrollToHeading(h.text)}
                      className={`w-full text-left text-xs sm:text-sm py-2 px-3 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors flex items-start gap-2 ${
                        h.level === 'h3' ? 'pl-6 opacity-85' : 'font-semibold'
                      }`}
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">•</span>
                      <span className="line-clamp-2">{h.text}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Reading Content Body */}
          <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
          >
            {/* Constrained Editorial Reading Container */}
            <article className={`max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-14 space-y-10 ${isSerif ? 'font-serif' : 'font-sans'}`}>
              
              {/* Article Header & Typography Hero */}
              <header className="space-y-6">
                {/* Mobile Meta Header for small screens */}
                <div className="sm:hidden flex items-center justify-between pb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    <Sparkles size={12} />
                    <span>Qur'an & Science Archive</span>
                  </span>
                  {article.readingTime && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {article.readingTime}
                    </span>
                  )}
                </div>

                {/* Main Article Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-[1.18] text-slate-900 dark:text-slate-50">
                  {article.title}
                </h1>

                {/* Subtitle / Excerpt Lead */}
                {article.excerpt && (
                  <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-light leading-relaxed italic border-l-2 border-emerald-600/40 pl-4 py-1">
                    {article.excerpt}
                  </p>
                )}

                {/* Elegant Byline Metadata Card */}
                <div className="flex flex-wrap items-center justify-between gap-y-3 py-4 border-y border-black/5 dark:border-white/10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Author: <strong className="font-semibold">{article.author || 'Imam & Science Research'}</strong>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} className="text-emerald-600" />
                      {article.readingTime || '5 min read'}
                    </span>
                    {article.wordCount ? (
                      <>
                        <span>•</span>
                        <span>{article.wordCount.toLocaleString()} words</span>
                      </>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Imam & Science Research Archive
                    </span>
                  </div>
                </div>
              </header>

              {/* Hero Featured Image */}
              {article.imageUrl && (
                <figure className="relative rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 shadow-lg bg-black/5">
                  <img
                    src={article.imageUrl}
                    alt={article.imageAlt || article.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[460px] object-cover"
                  />
                  {article.imageAlt && article.imageAlt !== article.title && (
                    <figcaption className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 italic font-sans bg-black/5 dark:bg-white/5">
                      {article.imageAlt}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Key Reflection / Highlight Callout */}
              {article.highlights && article.highlights.length > 0 && (
                <section className="relative p-6 sm:p-8 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-3">
                    <Quote size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Central Theme & Invaluable Insight</span>
                  </div>
                  <div className="space-y-3">
                    {article.highlights.map((h, idx) => (
                      <p key={`highlight-${idx}`} className="text-lg sm:text-xl italic font-serif leading-relaxed text-slate-800 dark:text-slate-200">
                        "{h}"
                      </p>
                    ))}
                  </div>
                </section>
              )}

              {/* In-Page Quick Table of Contents Card */}
              {displayHeadings && displayHeadings.length > 2 && (
                <nav className={`p-5 sm:p-6 rounded-3xl border ${surfaceClasses[readerTheme]}`}>
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    <Layers size={15} />
                    <span>Key Sections in This Topic</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {displayHeadings.slice(0, 8).map((h, i) => (
                      <button
                        key={`quick-heading-${i}-${h.text}`}
                        onClick={() => scrollToHeading(h.text)}
                        className="text-left text-xs sm:text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 px-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors truncate flex items-center gap-2"
                      >
                        <span className="text-emerald-600 font-bold text-xs">{(i + 1)}.</span>
                        <span className="truncate">{h.text}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              )}

              {/* Pristine Semantic Markdown Body */}
              {isLoadingContent && (!activeContent || activeContent.endsWith('...')) ? (
                <div className="space-y-4 py-8 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Loading complete unabridged treatise...
                  </div>
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-3/4"></div>
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-full"></div>
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-5/6"></div>
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-2/3"></div>
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-4/5"></div>
                </div>
              ) : (
                <div className={`prose dark:prose-invert max-w-none ${fontSizes[fontSize].body}`}>
                  <Markdown
                  components={{
                    h2: ({ node, ...props }) => {
                      const text = String(props.children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <h2
                          id={id}
                          className={`${fontSizes[fontSize].h2} font-serif font-black mt-12 mb-6 text-slate-900 dark:text-slate-50 border-b border-black/10 dark:border-white/10 pb-3 flex items-center gap-2`}
                          {...props}
                        />
                      );
                    },
                    h3: ({ node, ...props }) => {
                      const text = String(props.children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <h3
                          id={id}
                          className={`${fontSizes[fontSize].h3} font-serif font-bold mt-8 mb-4 text-emerald-900 dark:text-emerald-300 flex items-center gap-2`}
                          {...props}
                        />
                      );
                    },
                    h4: ({ node, ...props }) => (
                      <h4 className="text-lg font-serif font-semibold mt-6 mb-3 text-slate-800 dark:text-slate-200" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-6 text-slate-800 dark:text-slate-200 font-normal leading-relaxed" {...props} />
                    ),
                    blockquote: ({ node, children, ...props }) => {
                      const raw = String(children);
                      const isQuran = raw.includes('📖') || raw.toLowerCase().includes('qur’an') || raw.toLowerCase().includes('quran');
                      const isHadith = raw.includes('💫') || raw.toLowerCase().includes('hadith');

                      if (isQuran) {
                        return (
                          <div className="my-8 p-5 sm:p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-emerald-600 dark:border-emerald-400 shadow-xs">
                            <div className="text-emerald-900 dark:text-emerald-200 font-serif italic text-lg sm:text-xl leading-relaxed">
                              {children}
                            </div>
                          </div>
                        );
                      }

                      if (isHadith) {
                        return (
                          <div className="my-8 p-5 sm:p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-600 dark:border-amber-400 shadow-xs">
                            <div className="text-amber-950 dark:text-amber-200 font-serif italic text-lg sm:text-xl leading-relaxed">
                              {children}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <blockquote
                          className="border-l-4 border-emerald-500 pl-6 py-3 my-7 text-slate-700 dark:text-slate-300 italic bg-black/5 dark:bg-white/5 rounded-r-2xl"
                          {...props}
                        >
                          {children}
                        </blockquote>
                      );
                    },
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 sm:pl-8 mb-6 space-y-3 text-slate-700 dark:text-slate-300 marker:text-emerald-600" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 sm:pl-8 mb-6 space-y-3 text-slate-700 dark:text-slate-300 marker:text-emerald-600 marker:font-bold" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-relaxed" {...props} />
                    ),
                    img: ({ node, src, alt, ...props }) => (
                      <figure className="my-8 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-md">
                        <img
                          src={src}
                          alt={alt || 'Visual reference'}
                          referrerPolicy="no-referrer"
                          className="w-full max-h-[500px] object-cover"
                          {...props}
                        />
                        {alt && <figcaption className="p-2.5 text-center text-xs text-slate-500 italic font-sans">{alt}</figcaption>}
                      </figure>
                    ),
                    a: ({ node, href, children, ...props }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline underline-offset-2 inline-flex items-center gap-1"
                        {...props}
                      >
                        {children}
                        <ExternalLink size={12} className="inline opacity-70" />
                      </a>
                    ),
                  }}
                >
                  {formatted.cleanedMarkdown || article.content}
                </Markdown>
              </div>
              )}

              {/* Bottom Footer & Attribution Card */}
              <footer className="pt-10 border-t border-black/10 dark:border-white/10 space-y-6">
                {/* Category Tags */}
                {article.categories && article.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                      Topics & Categories:
                    </span>
                    {article.categories.map((cat, idx) => (
                      <button
                        key={`article-cat-${cat}-${idx}`}
                        onClick={() => {
                          onSelectCategory?.(cat);
                          onClose();
                        }}
                        className="text-xs px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-900 transition-colors font-medium font-sans"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Source Credit Box */}
                <div className={`p-6 rounded-3xl border ${surfaceClasses[readerTheme]} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <Globe size={14} />
                      <span>Original Research Source</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Preserved in the Qur'an, Hadith & Scientific Wisdom Archive
                    </p>
                    <p className="text-xs text-slate-500">
                      Islamic & Scientific Research • Authored by {article.author || 'Scholars & Researchers'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      <span>Visit Original</span>
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold transition-colors"
                    >
                      <Share2 size={13} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </footer>
            </article>
          </div>

          {/* Floating Back to Top Button */}
          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                key="back-to-top-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center hover:-translate-y-0.5"
                title="Back to Top"
              >
                <ArrowUp size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
