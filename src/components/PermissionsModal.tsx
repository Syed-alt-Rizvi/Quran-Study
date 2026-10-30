import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, MapPin, Zap, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { requestAppPermissions, markPermissionsHandled } from '../utils/permissionManager';
import { hapticImpact, ImpactStyle } from '../utils/haptics';
import { useSettingsStore } from '../store';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionsModal({ isOpen, onClose }: PermissionsModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [granted, setGranted] = useState(false);
  const { appLanguage } = useSettingsStore();
  const isUrdu = appLanguage === 'ur';

  const handleGrant = async () => {
    setIsRequesting(true);
    hapticImpact(ImpactStyle.Medium);
    try {
      const res = await requestAppPermissions();
      if (res.notifications || res.location) {
        setGranted(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        onClose();
      }
    } catch {
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    hapticImpact(ImpactStyle.Light);
    markPermissionsHandled();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md liquid-glass-dock rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/15 overflow-hidden"
          dir={isUrdu ? 'rtl' : 'ltr'}
        >
          {/* Specular Ambient Accent */}
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />

          {/* Top Emblem & Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-arabic font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-white/50 shrink-0">
              ش
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>{isUrdu ? 'اجازت نامہ برائے خدمات' : 'Permissions Setup'}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {isUrdu ? 'ایپ کی مکمل خصوصیات فعال کریں' : 'Enable Essential Features'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
            {isUrdu
              ? 'مستند شیعہ اوقاتِ نماز، اذان اور قبلہ نما کے درست نتائج کیلئے درج ذیل بنیادی اجازتیں درکار ہیں:'
              : 'To calculate accurate prayer times for your city, sound the holy Adhan, and align the Qibla compass, Shia Markaz requires these permissions:'}
          </p>

          {/* Permission Features List */}
          <div className="space-y-3 mb-6">
            {/* 1. Location */}
            <div className="flex items-start gap-3 p-3 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                <MapPin size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isUrdu ? 'مقام (Location Access)' : 'City Location Access'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  {isUrdu
                    ? 'آپ کے شہر کے متناسقات (Coordinates) کے مطابق فجر، ظہر و مغرب کے درست اوقات اور قبلہ سمت۔'
                    : 'Computes exact Shia prayer times for your geographic coordinates and aligns the Qibla compass.'}
                </p>
              </div>
            </div>

            {/* 2. Notifications & Adhan */}
            <div className="flex items-start gap-3 p-3 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/30">
                <Bell size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isUrdu ? 'نوٹیفیکیشن و اذان (Adhan & Alerts)' : 'Adhan & Prayer Alerts'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  {isUrdu
                    ? 'اوقاتِ نماز پر روح پرور اذان کا نشر اور تلاوتِ قرآن کی روزانہ یاد دہانی۔'
                    : 'Broadcasts the melodic Shia Adhan at exact prayer times and provides daily Quran reading reminders.'}
                </p>
              </div>
            </div>

            {/* 3. High Precision Alarm */}
            <div className="flex items-start gap-3 p-3 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                <Zap size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isUrdu ? 'بے عیب پس منظر عملداری (Reliability)' : 'Precise Background Alarms'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  {isUrdu
                    ? 'فون اسکرین بند یا لاک ہونے کی صورت میں بھی اذان بر وقت بجانے کی ضمانت۔'
                    : 'Ensures the Adhan sounds promptly on schedule even when your device screen is locked.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              id="grant-permissions-btn"
              type="button"
              onClick={handleGrant}
              disabled={isRequesting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 border border-white/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {granted ? (
                <>
                  <Check size={18} className="text-emerald-200" />
                  <span>{isUrdu ? 'اجازت منظور ہو گئی!' : 'Permissions Granted!'}</span>
                </>
              ) : isRequesting ? (
                <span>{isUrdu ? 'درخواست جاری ہے...' : 'Requesting Access...'}</span>
              ) : (
                <>
                  <span>{isUrdu ? 'تمام اجازتیں منظور کریں' : 'Enable All Permissions'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              id="skip-permissions-btn"
              type="button"
              onClick={handleSkip}
              className="w-full py-2.5 px-4 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer text-center"
            >
              {isUrdu ? 'بعد میں فیصلہ کریں' : 'I will configure later'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
