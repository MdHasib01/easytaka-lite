import React, { useEffect } from 'react';
import { useStatsStore } from '../stores/useStatsStore';
import { useAuthStore } from '../stores/useAuthStore';
import {
  Trophy,
  Medal,
  Flame,
  Coins,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { leaderboard, fetchLeaderboard } = useStatsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-400" /> SMM Performance Rankings
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Team Leaderboard & Rewards
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ranked by total earned reward points, completed task proofs, and daily streak consistency.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto items-end pt-4">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="glass-card rounded-3xl p-6 border border-slate-700/80 text-center relative overflow-hidden order-2 md:order-1">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 to-slate-200" />
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-200 font-black text-sm mb-3 shadow-md">
                2
              </div>
              <img
                src={
                  top3[1].avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[1].name)}&background=475569&color=fff`
                }
                alt={top3[1].name}
                className="w-16 h-16 rounded-2xl mx-auto object-cover ring-2 ring-slate-400/40 mb-3"
              />
              <h3 className="font-bold text-white text-base">{top3[1].name}</h3>
              <div className="flex items-center justify-center gap-1 text-amber-300 font-extrabold text-lg mt-1">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{top3[1].rewardPoints} pts</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {top3[1].completedTasks} Tasks
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> {top3[1].streakDays}d
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Taller Card) */}
          {top3[0] && (
            <div className="glass-card rounded-3xl p-7 border border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-slate-900/90 to-slate-900/90 text-center relative overflow-hidden order-1 md:order-2 shadow-glow-brand md:-translate-y-2">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-base mb-3 shadow-lg">
                👑 1
              </div>
              <img
                src={
                  top3[0].avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[0].name)}&background=f59e0b&color=000`
                }
                alt={top3[0].name}
                className="w-20 h-20 rounded-2xl mx-auto object-cover ring-4 ring-amber-400/40 mb-3 shadow-xl"
              />
              <h3 className="font-extrabold text-white text-lg">{top3[0].name}</h3>
              <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-2xl mt-1">
                <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>{top3[0].rewardPoints} pts</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {top3[0].completedTasks} Tasks
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> {top3[0].streakDays}d Streak
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="glass-card rounded-3xl p-6 border border-amber-900/60 text-center relative overflow-hidden order-3">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 to-amber-600" />
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-800 text-amber-200 font-black text-sm mb-3 shadow-md">
                3
              </div>
              <img
                src={
                  top3[2].avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[2].name)}&background=b45309&color=fff`
                }
                alt={top3[2].name}
                className="w-16 h-16 rounded-2xl mx-auto object-cover ring-2 ring-amber-700/40 mb-3"
              />
              <h3 className="font-bold text-white text-base">{top3[2].name}</h3>
              <div className="flex items-center justify-center gap-1 text-amber-300 font-extrabold text-lg mt-1">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{top3[2].rewardPoints} pts</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {top3[2].completedTasks} Tasks
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> {top3[2].streakDays}d
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden max-w-4xl mx-auto shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            All Agent Rankings
          </span>
          <span className="text-xs text-slate-400">{leaderboard.length} SMM Agents</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {leaderboard.map((smm) => {
            const isMe = user?._id === smm.id || user?.id === smm.id;

            return (
              <div
                key={smm.id}
                className={`flex items-center justify-between px-6 py-3.5 transition-colors ${
                  isMe ? 'bg-indigo-950/20 border-l-4 border-indigo-500' : 'hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center font-bold text-slate-400 text-sm">
                    {smm.rank}
                  </span>

                  <img
                    src={
                      smm.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(smm.name)}&background=4f46e5&color=fff`
                    }
                    alt={smm.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{smm.name}</span>
                      {isMe && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{smm.managedAccounts} Accounts</span>
                      <span>• {smm.completedTasks} Tasks Done</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {smm.streakDays > 0 && (
                    <div className="hidden sm:flex items-center gap-1 text-xs text-orange-400 font-semibold bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-xl">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{smm.streakDays}d</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 font-bold text-amber-300 text-sm bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{smm.rewardPoints} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
