import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  Sparkles,
  Heart,
  MapPin,
  Users,
  Plus,
  Edit,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface FacebookProfileExampleCardProps {
  defaultExpanded?: boolean;
  className?: string;
}

export const FacebookProfileExampleCard: React.FC<FacebookProfileExampleCardProps> = ({
  defaultExpanded = true,
  className = '',
}) => {
  const [selectedExample, setSelectedExample] = useState<'bangla' | 'english'>('bangla');
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const examples = {
    bangla: {
      name: 'সাদিয়া আক্তার',
      avatar: '/assets/examples/fb_avatar_bangla.jpg',
      bio: '🌸 মা ও পরিবারের যত্ন | Proud Homemaker & Mother ❤️',
      location: 'Dhaka, Bangladesh',
      friends: '328 friends',
      status: 'Married (বিবাহিত)',
      label: '🇧🇩 বাংলা নামের নমুনা',
    },
    english: {
      name: 'Nusrat Jahan',
      avatar: '/assets/examples/fb_avatar_english.jpg',
      bio: '🌸 Living with gratitude | Motherhood & Family first ✨',
      location: 'Chattogram, Bangladesh',
      friends: '415 friends',
      status: 'Married (বিবাহিত)',
      label: '🇬🇧 English Name Example',
    },
  };

  const current = examples[selectedExample];

  return (
    <div
      className={`rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 shadow-xl overflow-hidden ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-blue-950/40 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            f
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">
              ফেসবুক প্রোফাইলের সঠিক নমুনা
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              Ideal Example
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Example Language Tabs */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700/80">
            <button
              type="button"
              onClick={() => setSelectedExample('bangla')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                selectedExample === 'bangla'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা নাম
            </button>
            <button
              type="button"
              onClick={() => setSelectedExample('english')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                selectedExample === 'english'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English Name
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse example' : 'Expand example'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3">
          {/* Facebook Mockup Card */}
          <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner">
            {/* Cover Photo */}
            <div className="relative h-28 sm:h-32 w-full bg-slate-800 overflow-hidden">
              <img
                src="/assets/examples/fb_cover_sample.jpg"
                alt="Facebook Cover Example"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

              {/* Cover Photo Camera Button */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
                <Camera className="w-3 h-3 text-slate-300" />
                <span className="hidden sm:inline">Add Cover Photo</span>
              </div>

              {/* Verified Rule Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold border border-emerald-500/40 shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>ন্যাচারাল কভার ফটো</span>
              </div>
            </div>

            {/* Profile Header (Avatar + Details) */}
            <div className="px-3 sm:px-4 pb-3 relative">
              {/* Profile Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 -mt-10 sm:-mt-12 mb-2">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden shadow-2xl relative">
                    <img
                      src={current.avatar}
                      alt={current.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online Badge */}
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  {/* Camera icon badge */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>

                {/* Mock Action Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold shadow-sm">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to story</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-semibold border border-slate-700">
                    <Edit className="w-3 h-3" />
                    <span>Edit profile</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Profile Info Details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                    <span>{current.name}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                    ✓ বাস্তব মেয়ের নাম
                  </span>
                </div>

                <p className="text-xs text-slate-300">{current.bio}</p>

                {/* Intro Pills */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-[11px] text-slate-400 border-t border-slate-800/80">
                  <div className="flex items-center gap-1 text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Relationship: <strong>{current.status}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lives in <strong>{current.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{current.friends}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines & Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Rule 1: Name */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>১. নাম: বাস্তব মেয়ের নাম</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                অ্যাকাউন্টটি অবশ্যই কোনো শালীন মেয়ের নামে হতে হবে। কিছু আইডি{' '}
                <strong className="text-white">বাংলায়</strong> (যেমন: সাদিয়া
                আক্তার) এবং কিছু <strong className="text-white">ইংরেজিতে</strong>{' '}
                (যেমন: Nusrat Jahan) দিতে হবে।
              </p>
            </div>

            {/* Rule 2: Marital Status */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>২. স্ট্যাটাস: "Married" (বিবাহিত)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                প্রোফাইলের Relationship/Marital Status অবশ্যই{' '}
                <strong className="text-rose-300">"Married"</strong> সিলেক্ট
                করতে হবে, কারণ এটি মা ও ফ্যামিলি প্রোডাক্ট অডিয়েন্স।
              </p>
            </div>

            {/* Rule 3: Natural Photos */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>৩. প্রোফাইল ও কভার ফটো</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                ন্যাচারাল লুকিং ছবি ও সুন্দর প্রাকৃতিক কভার দিন। কোনো ট্রাস্টেড,
                পরিচিত সেলিব্রিটি বা পপুলার মডেলের প্রোফাইল ছবি কপি করে দেওয়া যাবে
                না।
              </p>
            </div>

            {/* Rule 4: No Fake Names */}
            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>৪. ফেক / অবাস্তব নাম নিষিদ্ধ</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                <strong className="text-rose-300">
                  "Angel Sadia", "Dimple Queen", "Cute Pori"
                </strong>{' '}
                জাতীয় অপ্রাসঙ্গিক বা অবাস্তব নাম ব্যবহার করা সম্পূর্ণ নিষেধ।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
