export type UserRole = 'admin' | 'smm';
export type UserAccountStatus = 'invited' | 'pending_verification' | 'active' | 'rejected' | 'suspended';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  rewardPoints: number;
  dailyTaskCompletionReward?: number;
  lastDailyRewardDate?: string;
  avatar?: string;
  phone?: string;
  nidFront?: string;
  nidBack?: string;
  nidNumber?: string;
  address?: string;
  termsAgreed?: boolean;
  termsAgreedAt?: string;
  verificationSubmittedAt?: string;
  verifiedBy?: string | { _id: string; name: string; email: string };
  verifiedAt?: string;
  rejectionReason?: string;
  streakDays: number;
  lastActiveDate?: string;
  createdAt?: string;
}

export type AccountStatus = 'active' | 'warmup' | 'restricted' | 'checkpoint' | 'banned';
export type AccountApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface RoutineTargets {
  feedComments: number;
  communityReplies: number;
  storyPost: boolean;
  groupShare: number;
  feedScrollMinutes: number;
}

export interface FacebookAccount {
  _id: string;
  smmId: string | User;
  accountName: string;
  profileUrl: string;
  profileUid?: string;
  password?: string;
  passwordHint?: string;
  emailOrPhone?: string;
  twoFactorSecret?: string;
  avatarUrl?: string;
  status: AccountStatus;
  approvalStatus?: AccountApprovalStatus;
  approvedBy?: string | User;
  approvedAt?: string;
  adminNote?: string;
  pointsAwarded?: number;
  accountCategory?: string;
  targetRegion?: string;
  friendsCount: number;
  groupsCount: number;
  notes?: string;
  routineTargets: RoutineTargets;
  isActive: boolean;
  createdAt?: string;
}

export type TaskType = 'create_account' | 'comment_post' | 'community_reply' | 'group_join' | 'story_post' | 'custom';
export type TaskStatus = 'active' | 'paused' | 'completed' | 'archived';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface TaskSubmission {
  _id: string;
  taskId: string | Task;
  smmId: string | User;
  facebookAccountId?: string | FacebookAccount;
  profileUrl: string;
  proofUrl: string;
  screenshotUrl: string;
  screenshotPublicId?: string;
  smmNotes?: string;
  status: SubmissionStatus;
  adminNote?: string;
  pointsAwarded: number;
  verifiedBy?: string | User;
  verifiedAt?: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  taskType: TaskType;
  category: string;
  rewardPoints: number;
  targetUrl?: string;
  instructions?: string;
  assignedTo?: string | User | null;
  isBroadcast: boolean;
  screenshotRequired: boolean;
  profileLinkRequired: boolean;
  deadline?: string | null;
  createdBy: string | User;
  status: TaskStatus;
  mySubmission?: TaskSubmission | null;
  createdAt?: string;
}

// Admin Daily Task Manager Types
export type DailyTaskType =
  | 'personal_profile_post'
  | 'react_group_post'
  | 'comment_group_post'
  | 'group_join'
  | 'story_post'
  | 'feed_scroll_warmup'
  | 'custom_engagement';

export type DailyTaskMode = 'global_rotation' | 'targeted_quota';
export type DailyTaskRotationSchedule = 'alternate_days' | 'every_day' | 'odd_days' | 'even_days' | 'weekday_only';

export interface DailyTaskAssignment {
  _id?: string;
  accountId: string | FacebookAccount;
  smmId: string | User;
  date?: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface DailyTaskTemplate {
  _id: string;
  title: string;
  taskType: DailyTaskType;
  description?: string;
  targetUrl?: string;
  instructions?: string;
  sampleCaption?: string;
  mode: DailyTaskMode;
  rotationSchedule?: DailyTaskRotationSchedule;
  rotationBatch?: number;
  targetExecutionsCount: number;
  completedExecutionsCount: number;
  assignedAssignments?: DailyTaskAssignment[];
  status: 'active' | 'paused' | 'completed' | 'archived';
  validFrom?: string;
  validUntil?: string;
  createdBy?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicTaskItem {
  _id?: string;
  templateId?: string;
  assignmentId?: string;
  title: string;
  taskType: DailyTaskType;
  mode: DailyTaskMode;
  description?: string;
  targetUrl?: string;
  instructions?: string;
  sampleCaption?: string;
  isDone: boolean;
  completedAt?: string;
}

export interface RoutineItemState {
  feedScrollDone: boolean;
  commentsCount: number;
  communityRepliesCount: number;
  storyPostDone: boolean;
  groupShareCount: number;
  customChecklist?: Array<{ taskName: string; isDone: boolean }>;
  dynamicChecklist?: DynamicTaskItem[];
}

export interface DailyRoutine {
  _id: string;
  smmId: string;
  facebookAccountId: string;
  date: string;
  items: RoutineItemState;
  completionPercentage: number;
  isCompleted: boolean;
  notes?: string;
  account?: Partial<FacebookAccount>;
}

export interface DailyRoutineCardData {
  routine: DailyRoutine;
  account: {
    id: string;
    accountName: string;
    profileUrl: string;
    avatarUrl?: string;
    status: AccountStatus;
    approvalStatus?: AccountApprovalStatus;
    routineTargets: RoutineTargets;
  };
}

export interface PointTransaction {
  _id: string;
  userId: string;
  amount: number;
  type:
    | 'task_reward'
    | 'daily_bonus'
    | 'streak_reward'
    | 'admin_bonus'
    | 'manual_adjustment'
    | 'account_reward'
    | 'milestone_bonus';
  description: string;
  referenceId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface SystemSettings {
  _id?: string;
  facebookAccountReward: number;
  facebookMilestoneReward: number;
  facebookMilestoneStep: number;
  defaultDailyCompletionReward: number;
  updatedAt?: string;
}

export interface AccountMilestoneProgress {
  approvedAccounts: number;
  pendingAccounts: number;
  milestoneStep: number;
  currentProgressInStep: number;
  percentage: number;
  accountsNeededForNext: number;
  nextRewardPoints: number;
  accountCreationReward: number;
  totalMilestonesUnlocked: number;
  totalBonusPointsEarned: number;
}

export interface AdminStats {
  totalSmms: number;
  totalTasks: number;
  activeTasks: number;
  pendingVerifications: number;
  pendingTaskVerifications?: number;
  pendingAccountVerifications?: number;
  pendingSmmVerifications?: number;
  totalAccounts: number;
  totalPointsAwarded: number;
}

export interface SMMStats {
  rewardPoints: number;
  dailyProgress: number;
  myAccountsCount: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  streakDays: number;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rewardPoints: number;
  streakDays: number;
  completedTasks: number;
  managedAccounts: number;
}
