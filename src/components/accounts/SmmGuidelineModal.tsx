import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  LifeBuoy,
  Compass,
  Award,
  Copy,
  Check,
  Milk,
  Heart,
  Droplet,
  Waves,
  MessageSquare,
  ShieldCheck,
  Mic,
  Bot,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type { FacebookAccount, FacebookAccountMode, FacebookAssignedProduct } from '../../types';

interface SmmGuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: FacebookAccount | null;
  initialMode?: FacebookAccountMode;
  initialProduct?: FacebookAssignedProduct;
}

export const SmmGuidelineModal: React.FC<SmmGuidelineModalProps> = ({
  isOpen,
  onClose,
  account,
  initialMode,
  initialProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'modes' | 'products' | 'playbooks' | 'ai_rules'>(
    'modes'
  );
  const effectiveMode = account?.accountMode || initialMode || 'reviewer';
  const [selectedMode, setSelectedMode] = useState<FacebookAccountMode>(
    effectiveMode !== 'general' ? effectiveMode : 'reviewer'
  );
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<string | null>(null);

  // Sync selected mode when modal opens or account changes
  React.useEffect(() => {
    if (account?.accountMode && account.accountMode !== 'general') {
      setSelectedMode(account.accountMode);
    } else if (initialMode && initialMode !== 'general') {
      setSelectedMode(initialMode);
    }
  }, [account, initialMode, isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptIndex(id);
    setTimeout(() => setCopiedScriptIndex(null), 2500);
  };

  const modeInfo = {
    reviewer: {
      code: 'R',
      title: 'Reviewer / Experience ID',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: Award,
      mentalModel: '“আমি সত্যি ব্যবহার করেছি”',
      definition:
        'বাস্তব অভিজ্ঞতার ভিত্তিতে কথা বলবে। শুধুমাত্র নির্ধারিত প্রোডাক্ট ও ফিক্সড পারচেজ হিস্ট্রির ওপর রিভিউ পোস্ট এবং রিভিউ রিপ্লাই দিবে।',
      rules: [
        'যে প্রোডাক্টের হিস্ট্রি ফিক্সড (যেমন R01=Milkimom, R02=MilkReady), শুধুই সেই প্রোডাক্টের ব্যবহারকারী হিসেবে কথা বলবে।',
        'অন্য কোনো অপরিচিত প্রোডাক্ট বা প্রতিযোগী প্রোডাক্ট নিয়ে বানিয়ে বানিয়ে মিথ্যা নেগেটিভ রিভিউ দেওয়া যাবে না।',
        'বাচ্চার বয়স এবং ক্রয়ের তারিখের সাথে সামঞ্জস্য রেখে কথা বলবে।',
      ],
      examples: [
        {
          scenario: 'নিজের টাইমলাইন বা গ্রুপে রিভিউ পোস্ট',
          script:
            'আমার বাবুর বয়স যখন ৩ মাস ছিল, তখন মিল্ক সাপ্লাই কমে গিয়ে খুব টেনশনে ছিলাম। তখন ডক্টরের সাজেশনে মিল্কিমম ব্যবহার শুরু করি। আলহামদুলিল্লাহ ২ সপ্তাহের মধ্যে ভালো ইমপ্রুভমেন্ট পেয়েছি।',
        },
        {
          scenario: 'গ্রুপ কমেন্টে কেউ অভিজ্ঞতা জানতে চাইলে',
          script:
            'আপু, আমি মিল্কিমম ব্যবহার করে ভালো ফল পেয়েছি। তবে আপনার বাচ্চার বয়স আর মূল সমস্যাটা কী সেটা বুঝে শুরু করলে ভালো হয়।',
        },
        {
          scenario: 'অন্য কোনো ব্র‍্যান্ড/সাপ্লিমেন্ট নিয়ে জিজ্ঞাসা করলে',
          script:
            'আমি ওই ব্র্যান্ডটা ব্যবহার করিনি তাই বলতে পারব না আপু, তবে আমার লো সাপ্লাইয়ের ক্ষেত্রে মিল্কিমম খুব ভালো কাজ করেছে।',
        },
      ],
    },
    question: {
      code: 'Q',
      title: 'Question / Curious ID',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: HelpCircle,
      mentalModel: '“আপনার problemটা ঠিক কী?”',
      definition:
        'প্রাসঙ্গিক প্রশ্ন, কৌতূহল ও সমস্যার গভীর অনুসন্ধানকারী আইডি। কোনো প্রোডাক্ট পারচেজ হিস্ট্রি ছাড়া সরাসরি রিভিউ দেবে না।',
      rules: [
        'মায়ের বা বাচ্চার সমস্যা স্পষ্টভাবে জানার জন্য প্রশ্ন করবে (বাচ্চার বয়স, সমস্যাটি কতদিনের, মূল কারণ)।',
        'বানিয়ে প্রোডাক্ট ব্যবহারের গল্প বলবে না; শুধু প্রাসঙ্গিক তথ্য ও প্রশ্ন তুলবে।',
        'আলোচনাকে সঠিক ও প্রাসঙ্গিক বিষয়ের দিকে পরিচালিত করবে।',
      ],
      examples: [
        {
          scenario: 'পাবলিক গ্রুপে ফিডিং প্রশ্ন পোস্ট',
          script:
            'নতুন মায়েদের উদ্দেশ্যে প্রশ্ন: ডেলিভারির পর প্রথম ২ মাসে ব্রেস্টফিডিং নিয়ে আপনাদের সবচেয়ে বড় চ্যালেঞ্জ কী ছিল? সাপ্লাই কম নাকি অস্বস্তি/পেইন?',
        },
        {
          scenario: 'কমেন্টে সমস্যার কারণ জানা',
          script:
            'বাবুর বয়স কত আপু? দুধ কম মনে হচ্ছে নাকি খাওয়ানোর পরও বাবু কান্নাকাটি বা অস্বস্তি ফিল করে?',
        },
        {
          scenario: 'সাপ্লিমেন্ট সম্পর্কিত পোস্টে প্রশ্ন',
          script:
            'আপনার মূল সমস্যাটা কীসের জন্য—দুধের সাপ্লাই বাড়ানো, নাকি ডেলিভারির আগের প্রস্তুতি, নাকি অতিরিক্ত ফ্লো বা ব্লকেজ?',
        },
      ],
    },
    support: {
      code: 'S',
      title: 'Support / Knowledge ID',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: LifeBuoy,
      mentalModel: '“এই situationটা এভাবে বুঝুন”',
      definition:
        'এডুকেশনাল গাইডেন্স, সঠিক তথ্য ও ফিডিং সমস্যার বিজ্ঞানসম্মত সচেতনতা মূলক আইডি। কোনো মেডিকেল ডায়াগনোসিস না করে সঠিক নির্দেশনা দেয়।',
      rules: [
        'সমস্যাকে ৪টি ক্যাটাগরিতে ক্লাসিফাই করতে সাহায্য করবে (Low Supply, Pre-delivery, Clogged/Pain, Fast Flow)।',
        'ফর্মুলা মিল্ক বা সাপ্লিমেন্ট নিয়ে মায়েদের মধ্যে কোনো অপরাধবোধ (guilt) তৈরি হতে দেবে না; শিশুর পুষ্টিকেই প্রাধান্য দেবে।',
        'নলেজ ও এক্সপার্ট টোন বজায় রাখবে।',
      ],
      examples: [
        {
          scenario: 'ফর্মুলা মিল্ক সংক্রান্ত পোস্টে কমেন্ট',
          script:
            'বেবি ফিডিং নিয়ে চিন্তা হলে আগে সিচুয়েশনটা সঠিকভাবে অ্যাসেস করা জরুরি। ফর্মুলা প্রয়োজন হলে সেটা নিয়ে অপরাধবোধ করার কিছু নেই—বাবুর পুষ্টি নিশ্চিত করাই মূল অগ্রাধিকার।',
        },
        {
          scenario: 'চার ধরনের সমস্যা ক্লাসিফিকেশন পোস্ট',
          script:
            'চারটি ভিন্ন ফিডিং সিচুয়েশন: ১. কম সাপ্লাই, ২. ডেলিভারির পূর্ব প্রস্তুতি, ৩. ব্লকেজ/অস্বস্তি, ৪. অতিরিক্ত ফ্লো—সবগুলোর সমাধানের ধরন এক নয়। নিজের প্রয়োজন বুঝে সঠিক পথ বেছে নিন।',
        },
        {
          scenario: 'অফিসিয়াল পেজের পোস্টে সাপোর্ট রিপ্লাই',
          script:
            'StableFlow-এর উদ্দেশ্য দুধ বন্ধ করা নয়; বরং অতিরিক্ত ও ফাস্ট ফ্লো স্বাভাবিকভাবে ম্যানেজ করতে সাপোর্ট দেওয়া। আপনার নির্দিষ্ট সমস্যা বিস্তারিত জানাতে পেজে মেসেজ দিন।',
        },
      ],
    },
    navigation: {
      code: 'N',
      title: 'Navigation / Community ID',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: Compass,
      mentalModel: '“চলুন, correct official জায়গায় নিয়ে যাই”',
      definition:
        'কমিউনিটি গাইড ও মডারেটর আইডি। সোশ্যাল মিডিয়া কনভারসেশন ও কৌতূহলী গ্রাহককে সরাসরি অফিশিয়াল পেজ ও ইনবক্সে সঠিক লেনে পৌঁছে দেয়।',
      rules: [
        'অর্ডার, সঠিক মূল্য বা ব্যক্তিগত স্বাস্থ্য তথ্যের জন্য অফিশিয়াল পেজের ইনবক্সে হ্যান্ডঅফ করবে।',
        '৪টি প্রোডাক্ট লেনের মধ্যে কোন লেনে কথা বলবে তা চিহ্নিত করে ইনবক্স লিঙ্ক শেয়ার করবে।',
        'ফ্রেন্ডলি, হেল্পফুল এবং অফিশিয়াল ব্র্যান্ড অ্যাম্বাসেডর টোন বজায় রাখবে।',
      ],
      examples: [
        {
          scenario: 'গ্রুপে দাম বা অর্ডার জানতে চাইলে',
          script:
            'আপু, বর্তমান অফার ও বিস্তারিত তথ্যের জন্য অফিশিয়াল Milkimom পেইজের ইনবক্সে একটি মেসেজ দিন—আমাদের টিম দ্রুত রেসপন্স করবে।',
        },
        {
          scenario: 'কোন প্রোডাক্টটি কার জন্য সঠিক জানতে চাইলে',
          script:
            'আপনার সিচুয়েশন অনুযায়ী সঠিক প্রোডাক্টটি বেছে নিতে ৩টি বিষয় জানান—ডেলিভারি হয়েছে কি না, বাবুর বয়স এবং মূল সমস্যা কী? তারপর সঠিক লেনে গাইড করে দেওয়া হবে।',
        },
        {
          scenario: 'অফিশিয়াল পেইজের কমেন্ট হ্যান্ডলিং',
          script:
            'ধন্যবাদ আপু! বিস্তারিত তথ্য ও হেল্পের জন্য ইনবক্সে মেসেজ পাঠানো হয়েছে। দয়া করে মেসেজ অপশন চেক করুন।',
        },
      ],
    },
    general: {
      code: 'GEN',
      title: 'General Engagement ID',
      badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      icon: Layers,
      mentalModel: '“স্বাভাবিক কমিউনিটি সক্রিয়তা”',
      definition: 'সাধারণ ফেসবুক এনগেজমেন্ট ও রিঅ্যাকশন প্রোফাইল।',
      rules: ['স্বাভাবিক বন্ধুদের মত আচরণ ও পোস্ট শেয়ারিং।'],
      examples: [],
    },
  };

  const products = [
    {
      code: 'M',
      name: 'Milkimom (মাদার টিংচার / ড্রপস)',
      focus: 'Low Milk Supply (বুকের দুধ কম হওয়া)',
      icon: Milk,
      color: 'from-blue-600 to-indigo-600',
      description: 'যাদের ব্রেস্ট মিল্ক সাপ্লাই অপর্যাপ্ত বা কমে গেছে তাদের জন্য ল্যাকটেশন সাপোর্ট।',
      symptoms: ['বাবু বারবার কেঁদে ওঠে', 'দুধের প্রবাহ কম', 'পাম্পে পর্যাপ্ত মিল্ক আসে না'],
    },
    {
      code: 'MR',
      name: 'MilkReady (প্রি-ডেলিভারি টি)',
      focus: 'Pre-delivery / Pregnancy Preparation',
      icon: Heart,
      color: 'from-rose-600 to-pink-600',
      description: 'প্রেগন্যান্সির শেষ পর্যায়ে ডেলিভারির পর দ্রুত দুধের প্রবাহ শুরু করার প্রস্তুতিমূলক সাপোর্ট।',
      symptoms: ['গর্ভবতী মায়েরা', 'ডেলিভারির পর দুধ না আসার ভয়', 'প্রথমবারের মা'],
    },
    {
      code: 'SF',
      name: 'SmoothFlow (পেইন ও ব্লকেজ রিলিফ)',
      focus: 'Clogged Duct / Painful Flow (ব্লকেজ ও অস্বস্তি)',
      icon: Droplet,
      color: 'from-amber-600 to-orange-600',
      description: 'নালী বন্ধ হয়ে যাওয়া, শক্ত হয়ে থাকা এবং ব্যথাযুক্ত প্রবাহ স্বাভাবিক করতে সাহায্য করে।',
      symptoms: ['বুকের মধ্যে শক্ত দলা অনুভব', 'দুধ বের হতে তীব্র ব্যথা', 'ফ্লো আটকে যাওয়া'],
    },
    {
      code: 'ST',
      name: 'StableFlow (অতিরিক্ত ফ্লো কন্ট্রোল)',
      focus: 'Excessive / Fast Flow (অতিরিক্ত দুধের প্রবাহ)',
      icon: Waves,
      color: 'from-cyan-600 to-teal-600',
      description: 'অতিরিক্ত ও তীব্র দুধের প্রবাহকে শিশুর খাওয়ার উপযোগী স্বাভাবিক মাত্রায় নিয়ে আসে।',
      symptoms: ['দুধের ফ্লো বেশি হওয়ায় বাবু বিষম খায়', 'অতিরিক্ত স্পিলিং বা চোকিং', 'হাইপার-ল্যাকটেশন'],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? `SMM Playbook — ${account.accountName}` : "SMM Mission Guidelines & Response Playbook"}
      subtitle={
        account
          ? `Operating persona, scripts, and rules for ${account.accountName}`
          : "Comprehensive rules, multi-persona response scripts, product lines, and AI writing guidelines."
      }
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Account Persona Identity Header (When opened from a specific account) */}
        {account && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <img
                  src={
                    account.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(account.accountName)}&background=1877f2&color=fff`
                  }
                  alt={account.accountName}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm leading-snug">{account.accountName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                      Mode: {account.accountMode || 'General'}
                    </span>
                  </div>
                  <a
                    href={account.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5 truncate max-w-[240px]"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{account.profileUrl}</span>
                  </a>
                </div>
              </div>

              {/* Persona Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {account.assignedProduct && account.assignedProduct !== 'none' && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                    Product: {account.assignedProduct.toUpperCase()}
                  </span>
                )}
                {account.workloadTier && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase">
                    Tier: {account.workloadTier}
                  </span>
                )}
              </div>
            </div>

            {/* Persona Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-indigo-500/20 text-xs">
              {account.childAge && (
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 font-semibold">👶 বাচ্চার বয়স: </span>
                  <span className="text-white font-medium">{account.childAge}</span>
                </div>
              )}

              {account.writingStyle && (
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 font-semibold">✍️ লেখার ধরন: </span>
                  <span className="text-slate-200">{account.writingStyle}</span>
                </div>
              )}

              {account.purchaseHistory && (
                <div className="sm:col-span-2 bg-purple-950/30 p-2 rounded-xl border border-purple-500/30 text-purple-200">
                  <span className="font-semibold text-purple-300">🧾 ক্রয়ের তারিখ ও ইতিহাস: </span>
                  <span>{account.purchaseHistory}</span>
                </div>
              )}

              {account.customGuideline && (
                <div className="sm:col-span-2 bg-amber-950/30 p-2 rounded-xl border border-amber-500/30 text-amber-200">
                  <span className="font-semibold text-amber-300">📌 স্পেশাল নির্দেশনা: </span>
                  <span>{account.customGuideline}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          {[
            { id: 'modes', label: '4 ID Modes (R/Q/S/N)', icon: Award },
            { id: 'products', label: '4 Product Lanes', icon: Milk },
            { id: 'playbooks', label: 'Response Playbooks & Scripts', icon: MessageSquare },
            { id: 'ai_rules', label: 'Voice AI & Writing Style', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 4 ID MODES */}
        {activeTab === 'modes' && (
          <div className="space-y-4">
            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['reviewer', 'question', 'support', 'navigation'] as FacebookAccountMode[]).map(
                (m) => {
                  const mData = modeInfo[m];
                  const Icon = mData.icon;
                  const isSelected = selectedMode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMode(m)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 shadow-glow-brand ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center border ${mData.badgeClass}`}
                        >
                          {mData.code}
                        </span>
                        <Icon
                          className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}
                        />
                      </div>
                      <div className="mt-2">
                        <h5 className="text-xs font-bold text-white truncate">{mData.title}</h5>
                        <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">
                          {mData.mentalModel}
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {/* Selected Mode Detail Card */}
            {selectedMode && modeInfo[selectedMode] && (
              <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-xl text-xs font-extrabold border ${modeInfo[selectedMode].badgeClass}`}
                      >
                        MODE {modeInfo[selectedMode].code}
                      </span>
                      <h4 className="font-extrabold text-white text-base">
                        {modeInfo[selectedMode].title}
                      </h4>
                    </div>
                    <p className="text-xs text-indigo-300 font-semibold mt-1">
                      Mental Model: {modeInfo[selectedMode].mentalModel}
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {modeInfo[selectedMode].definition}
                    </p>
                  </div>
                </div>

                {/* Key Persona Rules */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    📌 Persona Operation Rules:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {modeInfo[selectedMode].rules.map((rule, rIdx) => (
                      <li key={rIdx}>{rule}</li>
                    ))}
                  </ul>
                </div>

                {/* Ready-to-use Bengali Scripts */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Copyable Scripts & Response Templates:
                  </span>
                  <div className="space-y-2">
                    {modeInfo[selectedMode].examples.map((ex, eIdx) => (
                      <div
                        key={eIdx}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-indigo-400">{ex.scenario}</span>
                          <button
                            onClick={() => handleCopy(ex.script, `mode-${selectedMode}-${eIdx}`)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            {copiedScriptIndex === `mode-${selectedMode}-${eIdx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Script
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-sans">
                          "{ex.script}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 4 PRODUCT LANES */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
              💡 <strong>৪টি ভিন্ন প্রয়োজন, ৪টি নির্দিষ্ট সমাধান:</strong> কোনো গ্রাহকের সাথে
              কথা বলার সময় সমস্যা আইডেন্টিফাই করে নির্দিষ্ট প্রোডাক্ট লেনে আলোচনা করুন।
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.code}
                    className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-sm shadow-md`}
                        >
                          {p.code}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{p.name}</h4>
                          <span className="text-[11px] text-amber-300 font-semibold block">
                            🎯 {p.focus}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <strong className="text-slate-400 block font-semibold">লক্ষণ বা সিচুয়েশন:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.symptoms.map((sym, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]"
                          >
                            • {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RESPONSE PLAYBOOKS & DECISION FLOW */}
        {activeTab === 'playbooks' && (
          <div className="space-y-4">
            {/* Scenario 1: Formula Milk Post */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    Scenario 1
                  </span>
                  Baby Formula Milk Post দেখলে আইডিগুলোর রেসপন্স ক্রম
                </h4>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Order: S ➔ Q ➔ N ➔ R
                </span>
              </div>

              <p className="text-xs text-slate-400 italic">
                উদাহরণ পোস্ট: “Baby-r pet vorche na, formula dibo kina?”
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <strong className="text-amber-400 block text-[11px]">1. Support (S) Comment:</strong>
                  <p className="text-slate-300 text-[11px]">
                    "Baby feeding নিয়ে চিন্তা থাকলে আগে সিচুয়েশন বুঝে নেওয়া ভালো। ফর্মুলা দরকার হলে
                    অপরাধবোধের কিছু নেই—বাবুর পুষ্টিই অগ্রাধিকার।"
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <strong className="text-sky-400 block text-[11px]">2. Question (Q) Follow-up:</strong>
                  <p className="text-slate-300 text-[11px]">
                    "বাবুর বয়স কত আপু? দুধ কম মনে হচ্ছে নাকি খাওয়ানোর পরও অস্বস্তি করছে?"
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block text-[11px]">3. Navigation (N) Handoff:</strong>
                  <p className="text-slate-300 text-[11px]">
                    "আপনার সমস্যা যদি লো-সাপ্লাই হয়, অফিশিয়াল Milkimom টিমের সাথে কথা বলে পরামর্শ নিতে
                    পারেন।"
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <strong className="text-purple-400 block text-[11px]">4. Reviewer (R) (Only if genuine):</strong>
                  <p className="text-slate-300 text-[11px]">
                    "আমারও সেম হয়েছিল, সাপ্লাই কমে গেলে আমি মিল্কিমম ব্যবহার করে সাপোর্ট পেয়েছিলাম।"
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario 2: Competitor Supplement Post */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    Scenario 2
                  </span>
                  অন্য কোনো সাপ্লিমেন্ট নিয়ে পোস্ট দেখলে রেসপন্স
                </h4>
              </div>

              <p className="text-xs text-slate-400 italic">
                উদাহরণ পোস্ট: “X সাপ্লিমেন্টটা কেমন? কেনা কি ঠিক হবে?”
              </p>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-indigo-300">স্মার্ট ও পজিটিভ রিপ্লাই কৌশল:</strong>
                  <button
                    onClick={() =>
                      handleCopy(
                        'আমি X ব্যবহার করিনি আপু, তাই ওটা নিয়ে বলতে পারব না। তবে লো সাপ্লাইয়ের জন্য মিল্কিমম ব্যবহার করে আমার ভালো অভিজ্ঞতা হয়েছে।',
                        'comp-script'
                      )
                    }
                    className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedScriptIndex === 'comp-script' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Script
                      </>
                    )}
                  </button>
                </div>
                <p className="italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  "আমি X ব্যবহার করিনি আপু, তাই ওটা নিয়ে বলতে পারব না। তবে লো সাপ্লাইয়ের জন্য
                  মিল্কিমম ব্যবহার করে আমার ভালো অভিজ্ঞতা হয়েছে।"
                </p>
                <span className="text-[11px] text-slate-400 block">
                  💡 <strong>সুবিধা:</strong> প্রতিযোগী পণ্য নিয়ে মিথ্যা নেগেটিভ মন্তব্য করতে হয় না,
                  বরং নিজস্ব ব্র্যান্ডের বিশ্বাসযোগ্যতা বৃদ্ধি পায়।
                </span>
              </div>
            </div>

            {/* Daily Execution Flow */}
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
              <strong className="text-white block font-bold">
                🔄 প্রতিদিনের ID Execution সিকোয়েন্স:
              </strong>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-300">
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  1. Timeline
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  2. Notification
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  3. Old Reply
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  4. Inbox
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  5. Group Post/Scan
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  6. Comments & Replies
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 rounded bg-indigo-900/60 border border-indigo-700 text-indigo-200 font-bold">
                  7. Daily Log
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VOICE AI & WRITING STYLE GUIDELINE */}
        {activeTab === 'ai_rules' && (
          <div className="space-y-4 text-xs">
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-white text-sm">
                  AI & ChatGPT ভয়েস-টু-টেক্সট রাইটিং গাইডলাইন
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed">
                AI থেকে কখনো সরাসরি জেনেরিক কনটেন্ট কপি-পেস্ট করা যাবে না। AI-কে আপনার{' '}
                <strong>Voice-to-Text Writing Assistant</strong> হিসেবে ব্যবহার করুন।
              </p>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-slate-300">
                <strong className="text-indigo-300 block font-semibold">
                  ChatGPT / AI প্রম্পট নির্দেশনা:
                </strong>
                <p className="italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
                  "আমি ভয়েসে যা বলব, তুমি শুধু সেটিকে পরিষ্কার, স্বাভাবিক বাংলায় সুন্দর করে লিখে দেবে।
                  কিছু Banglish বা স্বাভাবিক ইংরেজি শব্দ বজায় রাখবে। কোনো কৃত্রিম বা বইয়ের মতো ভারি
                  ভাষা ব্যবহার করবে না।"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <strong className="text-emerald-300 block font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> যা করবেন:
                  </strong>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    <li>আইডির লেখার ধরন (Bangla, Banglish, Short) বজায় রাখা।</li>
                    <li>আগের পোস্ট ও কমেন্ট হিস্ট্রি দেখে টোন ঠিক রাখা।</li>
                    <li>বাচ্চার বয়স ও নিজস্ব আইডি পরিচয়ে স্থির থাকা।</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                  <strong className="text-rose-300 block font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> যা করবেন না:
                  </strong>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    <li>AI-এর জেনেরিক বট লেখা সরাসরি পোস্ট করা।</li>
                    <li>Question আইডিতে বানিয়ে রিভিউ পোস্ট করা।</li>
                    <li>প্রতিযোগী ব্র‍্যান্ড নিয়ে মিথ্যা তথ্য ছড়ানো।</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            Easytaka Lite • SMM Multi-Persona Standard Operating Procedure
          </span>
          <Button variant="glow" size="sm" onClick={onClose}>
            Got It, Close Guide
          </Button>
        </div>
      </div>
    </Modal>
  );
};
