import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FacebookAccount, AccountStatus } from '../../types';
import { Users, Link as LinkIcon, Shield, Layers, Plus } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<FacebookAccount>) => Promise<any>;
  initialAccount?: FacebookAccount | null;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialAccount,
}) => {
  const [accountName, setAccountName] = useState(initialAccount?.accountName || '');
  const [profileUrl, setProfileUrl] = useState(initialAccount?.profileUrl || '');
  const [profileUid, setProfileUid] = useState(initialAccount?.profileUid || '');
  const [status, setStatus] = useState<AccountStatus>(initialAccount?.status || 'warmup');
  const [accountCategory, setAccountCategory] = useState(initialAccount?.accountCategory || 'Personal / Engagement');
  const [targetRegion, setTargetRegion] = useState(initialAccount?.targetRegion || 'Global');
  const [friendsCount, setFriendsCount] = useState(initialAccount?.friendsCount || 0);
  const [groupsCount, setGroupsCount] = useState(initialAccount?.groupsCount || 0);
  const [notes, setNotes] = useState(initialAccount?.notes || '');

  // Daily Routine Targets
  const [feedComments, setFeedComments] = useState(initialAccount?.routineTargets?.feedComments || 5);
  const [communityReplies, setCommunityReplies] = useState(initialAccount?.routineTargets?.communityReplies || 3);
  const [storyPost, setStoryPost] = useState(
    initialAccount?.routineTargets?.storyPost !== undefined ? initialAccount.routineTargets.storyPost : true
  );
  const [groupShare, setGroupShare] = useState(initialAccount?.routineTargets?.groupShare || 2);
  const [feedScrollMinutes, setFeedScrollMinutes] = useState(
    initialAccount?.routineTargets?.feedScrollMinutes || 10
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !profileUrl.trim()) {
      setError('Account name and Profile URL are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: Partial<FacebookAccount> = {
      accountName: accountName.trim(),
      profileUrl: profileUrl.trim(),
      profileUid: profileUid.trim(),
      status,
      accountCategory,
      targetRegion,
      friendsCount: Number(friendsCount),
      groupsCount: Number(groupsCount),
      notes: notes.trim(),
      routineTargets: {
        feedComments: Number(feedComments),
        communityReplies: Number(communityReplies),
        storyPost,
        groupShare: Number(groupShare),
        feedScrollMinutes: Number(feedScrollMinutes),
      },
    };

    const res = await onSubmit(payload);
    setIsSubmitting(false);

    if (res) {
      onClose();
    } else {
      setError('Failed to save account details.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAccount ? 'Edit Facebook Account' : 'Add Facebook Account'}
      subtitle="Register a new Facebook account profile and configure its daily engagement targets."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Profile Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Profile / Account Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. John Doe (Tech Marketer)"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Facebook Profile URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://facebook.com/username"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                required
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Status, Category & UID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            >
              <option value="warmup">Warmup (New / Aging)</option>
              <option value="active">Active (Full Posting)</option>
              <option value="restricted">Restricted / Review</option>
              <option value="checkpoint">Checkpoint / 2FA</option>
              <option value="banned">Banned / Suspended</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Niche / Category</label>
            <input
              type="text"
              value={accountCategory}
              onChange={(e) => setAccountCategory(e.target.value)}
              placeholder="e.g. SaaS / E-com / General"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">FB UID / Username</label>
            <input
              type="text"
              value={profileUid}
              onChange={(e) => setProfileUid(e.target.value)}
              placeholder="10008892182..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Friends & Groups counts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Current Friends Count</label>
            <input
              type="number"
              min="0"
              value={friendsCount}
              onChange={(e) => setFriendsCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Joined Groups Count</label>
            <input
              type="number"
              min="0"
              value={groupsCount}
              onChange={(e) => setGroupsCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Daily Routine Targets Config Box */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Must-Do Daily Routine Targets (Fixed for this Account)
            </span>
            <span className="text-[11px] text-slate-400">Daily Checklist targets</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Post Comments</label>
              <input
                type="number"
                min="0"
                value={feedComments}
                onChange={(e) => setFeedComments(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg glass-input text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Community Replies</label>
              <input
                type="number"
                min="0"
                value={communityReplies}
                onChange={(e) => setCommunityReplies(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg glass-input text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Group Shares</label>
              <input
                type="number"
                min="0"
                value={groupShare}
                onChange={(e) => setGroupShare(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg glass-input text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Feed Scroll (Min)</label>
              <input
                type="number"
                min="0"
                value={feedScrollMinutes}
                onChange={(e) => setFeedScrollMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg glass-input text-xs"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={storyPost}
              onChange={(e) => setStoryPost(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Include Daily Story / Reel post in must-do checklist</span>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Internal Notes (Proxy info, warmup schedule, 2FA backup)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Use US residential IP, 2FA stored in Bitwarden, warm-up day 12."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            isLoading={isSubmitting}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {initialAccount ? 'Save Account' : 'Register Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
