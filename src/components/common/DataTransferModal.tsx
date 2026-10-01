import React, { useState } from 'react';
import { 
  X, Copy, Check, CloudUpload, CloudDownload, RefreshCw, 
  ArrowRight, ShieldCheck, Share2, Download, Upload, Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  exportUserData, 
  importUserData, 
  generateTransferUrl, 
  createCloudSyncCode, 
  restoreFromCloudSync 
} from '../../utils/dataTransfer';
import { getApiUrl } from '../../utils/apiBase';
import { hapticNotification, hapticSelection } from '../../utils/haptics';

interface DataTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataTransferModal({ isOpen, onClose }: DataTransferModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'link' | 'cloud' | 'file' | 'backend'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Cloud Sync state
  const [syncCode, setSyncCode] = useState<string>(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('shia_active_sync_code')) || '';
  });
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // File import/export state
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Custom backend URL
  const [customBackend, setCustomBackend] = useState<string>(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('shia_custom_backend_url')) || '';
  });
  const [backendSaved, setBackendSaved] = useState(false);

  if (!isOpen) return null;

  const transferUrl = generateTransferUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(transferUrl);
    setCopiedLink(true);
    hapticSelection();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await createCloudSyncCode(syncCode || undefined);
      setSyncCode(res.syncCode);
      setSyncStatus({ message: `Data backed up! Sync Code: ${res.syncCode}`, type: 'success' });
      hapticNotification('SUCCESS');
    } catch (err: any) {
      setSyncStatus({ message: err.message || 'Failed to sync to cloud', type: 'error' });
      hapticNotification('ERROR');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!inputSyncCode.trim()) {
      setSyncStatus({ message: 'Please enter a valid sync code', type: 'error' });
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await restoreFromCloudSync(inputSyncCode);
      setSyncCode(inputSyncCode.trim().toUpperCase());
      setSyncStatus({ message: `Successfully transferred ${res.importedCount} items!`, type: 'success' });
      hapticNotification('SUCCESS');
    } catch (err: any) {
      setSyncStatus({ message: err.message || 'Sync code not found', type: 'error' });
      hapticNotification('ERROR');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJson = () => {
    const data = exportUserData();
    const str = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(str);
    setCopiedJson(true);
    hapticSelection();
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleDownloadFile = () => {
    const data = exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shia_markaz_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    hapticSelection();
  };

  const handleImportJson = () => {
    if (!rawJsonInput.trim()) return;
    try {
      const parsed = JSON.parse(rawJsonInput);
      const res = importUserData(parsed);
      setImportStatus(`Successfully restored ${res.importedCount} items!`);
      hapticNotification('SUCCESS');
    } catch (e: any) {
      setImportStatus('Invalid JSON format. Please verify and try again.');
      hapticNotification('ERROR');
    }
  };

  const handleSaveBackend = () => {
    const clean = customBackend.trim();
    if (clean) {
      localStorage.setItem('shia_custom_backend_url', clean);
    } else {
      localStorage.removeItem('shia_custom_backend_url');
    }
    setBackendSaved(true);
    hapticNotification('SUCCESS');
    setTimeout(() => setBackendSaved(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <RefreshCw size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Transfer Data to Forwarded / Secondary Site</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sync bookmarks, notes, reading progress, and settings across domains
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 bg-slate-100/60 dark:bg-slate-950/40">
            {[
              { id: 'link', label: '1-Click Link' },
              { id: 'cloud', label: 'Cloud Sync Code' },
              { id: 'file', label: 'Backup & Restore' },
              { id: 'backend', label: 'Backend Server' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 text-center ${
                  activeSubTab === tab.id
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* TAB 1: 1-CLICK TRANSFER LINK */}
            {activeSubTab === 'link' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Instant Cross-Domain Data Migration</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    Because browsers isolate localStorage per domain, your secondary site starts empty. Opening this link on your secondary site transfers all bookmarks, reading progress, and notes instantly without signing in.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Your Encrypted Transfer Link:
                  </label>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-600 dark:text-slate-300 break-all max-h-24 overflow-y-auto">
                    {transferUrl}
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check size={16} />
                      <span>Transfer Link Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy 1-Click Transfer Link</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center italic">
                  Tip: Send or open this link in the browser where your secondary forwarded domain is loaded.
                </p>
              </div>
            )}

            {/* TAB 2: CLOUD SYNC CODE */}
            {activeSubTab === 'cloud' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <CloudUpload size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Step 1: Backup Data & Generate Sync Code
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saves your reading state, bookmarks, and notes securely to Cloud Firestore under a memorable 6-character code.
                  </p>
                  <button
                    onClick={handleCreateCloudSync}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                    <span>{syncCode ? 'Update Cloud Backup' : 'Generate Cloud Sync Code'}</span>
                  </button>

                  {syncCode && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Active Sync Code:</span>
                        <span className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400 block tracking-widest">
                          {syncCode}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(syncCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                      >
                        {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <CloudDownload size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Step 2: Enter Sync Code on Secondary Site
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. M7R892"
                      value={inputSyncCode}
                      onChange={(e) => setInputSyncCode(e.target.value.toUpperCase())}
                      maxLength={12}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      onClick={handleRestoreFromCloud}
                      disabled={isSyncing || !inputSyncCode.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      {isSyncing ? <RefreshCw size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                      <span>Restore</span>
                    </button>
                  </div>
                </div>

                {syncStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      syncStatus.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {syncStatus.message}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BACKUP FILE & JSON */}
            {activeSubTab === 'file' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadFile}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={14} className="text-emerald-600" />
                    <span>Download JSON File</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedJson ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-emerald-600" />}
                    <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Restore Data from JSON / Backup:
                  </label>
                  <textarea
                    rows={4}
                    value={rawJsonInput}
                    onChange={(e) => setRawJsonInput(e.target.value)}
                    placeholder="Paste exported backup JSON here..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    onClick={handleImportJson}
                    disabled={!rawJsonInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={14} />
                    <span>Import & Merge Data</span>
                  </button>
                  {importStatus && (
                    <p className="text-xs text-center font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      {importStatus}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: BACKEND SERVER SETTINGS */}
            {activeSubTab === 'backend' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Server size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Primary Cloud Run Backend Server</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    When accessing through your secondary forwarded domain, dynamic requests (Tafseer, Mafatih, Science) route through this backend endpoint.
                  </p>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 break-all select-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'Current Origin'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Custom Backend Override (Optional):
                  </label>
                  <input
                    type="url"
                    value={customBackend}
                    onChange={(e) => setCustomBackend(e.target.value)}
                    placeholder="https://your-custom-backend.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBackend}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                    >
                      {backendSaved ? 'Saved!' : 'Save Configuration'}
                    </button>
                    {customBackend && (
                      <button
                        onClick={() => {
                          setCustomBackend('');
                          localStorage.removeItem('shia_custom_backend_url');
                          hapticSelection();
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
