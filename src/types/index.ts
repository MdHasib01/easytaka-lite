export type UserRole = 'admin' | 'smm';
export type UserAccountStatus = 'invited' | 'pending_verification' | 'active' | 'rejected' | 'suspended';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  isActive?: boolean;
  requirePasswordChange?: boolean;
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

// SMM Multi-Persona Roles & Modes from SMM Guideline
export type FacebookAccountMode = 'reviewer' | 'question' | 'support' | 'navigation' | 'general';
export type FacebookAssignedProduct = 'milkimom' | 'milkready' | 'smoothflow' | 'stableflow' | 'all_products' | 'none';
export type FacebookWorkloadTier = 'active' | 'light' | 'rest';

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
  createdBy?: string | User;
  assignedTo?: string | User;
  assignedAt?: string;
  assignedBy?: string | User;
  accountName: string;
  profileUrl: string;
  profileUid?: string;
  password?: string;
  passwordHint?: string;
  emailOrPhone?: string;
  emailPassword?: string;
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
  accountMode?: FacebookAccountMode;
  assignedProduct?: FacebookAssignedProduct;
  workloadTier?: FacebookWorkloadTier;
  childAge?: string;
  purchaseDate?: string;
  purchaseHistory?: string;
  writingStyle?: string;
  personaBio?: string;
  customGuideline?: string;
  friendsCount: number;
  groupsCount: number;
  notes?: string;
  routineTargets: RoutineTargets;
  isActive: boolean;
  createdAt?: string;
}

export type TaskType =
  | 'reviewer'
  | 'question'
  | 'support'
  | 'navigation'
  | 'create_account'
  | 'comment_post'
  | 'community_reply'
  | 'group_join'
  | 'story_post'
  | 'custom';

export type TaskTargetMode = 'all' | 'reviewer' | 'question' | 'support' | 'navigation';
export type TaskTargetProduct = 'all' | 'milkimom' | 'milkready' | 'smoothflow' | 'stableflow' | 'all_products';
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
  rating?: number;
  verifiedBy?: string | User;
  verifiedAt?: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  taskType: TaskType;
  targetMode?: TaskTargetMode;
  targetProduct?: TaskTargetProduct;
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

export type MandatoryTaskType =
  | 'profile_pic'
  | 'cover_photo'
  | 'marital_status'
  | 'school_college'
  | 'identity_post'
  | 'group_join'
  | 'custom';

export interface MandatoryDailyTask {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  taskType: MandatoryTaskType;
  groupName?: string;
  targetUrl?: string;
  isEnabled: boolean;
  order?: number;
}

export interface MandatoryChecklistItem {
  taskId: string;
  isDone: boolean;
  completedAt?: string;
}

export interface RoutineItemState {
  mandatoryChecklist?: MandatoryChecklistItem[];
  profilePicUploaded?: boolean;
  coverPhotoUploaded?: boolean;
  maritalStatusUpdated?: boolean;
  schoolCollegeUpdated?: boolean;
  identityPostDone?: boolean;
  feedScrollDone?: boolean;
  commentsCount?: number;
  communityRepliesCount?: number;
  storyPostDone?: boolean;
  groupShareCount?: number;
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
    accountMode?: FacebookAccountMode;
    assignedProduct?: FacebookAssignedProduct;
    workloadTier?: FacebookWorkloadTier;
    childAge?: string;
    purchaseDate?: string;
    purchaseHistory?: string;
    writingStyle?: string;
    personaBio?: string;
    customGuideline?: string;
    routineTargets: RoutineTargets;
  };
}

export interface DailyTaskScoreRules {
  score5Points: number;
  score4Points: number;
  score3Points: number;
  score2Points: number;
  score1Points: number;
}

export interface DailyAccountSummary {
  facebookAccountId?: string;
  accountName: string;
  profileUrl?: string;
  avatarUrl?: string;
  accountMode?: string;
  assignedProduct?: string;
  completionPercentage: number;
  isCompleted: boolean;
  profilePicUploaded?: boolean;
  coverPhotoUploaded?: boolean;
  maritalStatusUpdated?: boolean;
  schoolCollegeUpdated?: boolean;
  identityPostDone?: boolean;
  mandatoryChecklist?: Array<{
    taskId: string;
    isDone: boolean;
    title?: string;
  }>;
  commentsCount?: number;
  communityRepliesCount?: number;
  storyPostDone?: boolean;
  feedScrollDone?: boolean;
  groupShareCount?: number;
  dynamicChecklist?: Array<{
    title: string;
    taskType: string;
    mode: string;
    isDone: boolean;
  }>;
  notes?: string;
}

export interface DailyWorkSubmission {
  _id: string;
  smmId: string | User;
  date: string;
  overallProgress: number;
  totalAccounts: number;
  completedAccountsCount: number;
  accountSummaries: DailyAccountSummary[];
  smmNotes?: string;
  proofUrl?: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewScore?: number | null;
  pointsAwarded?: number;
  adminFeedback?: string;
  reviewedBy?: string | { _id: string; name: string; email: string };
  reviewedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
    | 'milestone_bonus'
    | 'withdrawal'
    | 'withdrawal_refund';
  description: string;
  referenceId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface RatingBreakpoint {
  _id?: string;
  minRating: number;
  points: number;
  label?: string;
}

export interface SystemSettings {
  _id?: string;
  facebookAccountReward: number;
  facebookMilestoneReward: number;
  facebookMilestoneStep: number;
  defaultDailyCompletionReward: number;
  dailyTaskScoreRules?: DailyTaskScoreRules;
  ratingBreakpoints?: RatingBreakpoint[];
  mandatoryDailyTasks?: MandatoryDailyTask[];
  minWithdrawalPoints?: number;
  maxWithdrawalPoints?: number;
  withdrawalCycleDays?: number;
  pointToBdtRate?: number;
  withdrawalEnabled?: boolean;
  recoveryEmailConfig?: {
    address: string;
    imapHost: string;
    imapPort: number;
    enabled: boolean;
    pollIntervalSeconds: number;
    triggerSender?: string; // e.g. "Facebook <notification@facebook.com>" — only mail from this sender is checked
    appPasswordSet?: boolean; // read-only: true if a password is already stored
    appPassword?: string; // write-only: set to store/replace the stored password
  };
  aiConfig?: {
    provider: 'openai' | 'gemini';
    model: string;
    enabled: boolean;
    apiKeySet?: boolean; // read-only: true if a key is already stored
    apiKey?: string; // write-only: set to store/replace the stored key
  };
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
  pendingWithdrawals?: number;
  totalAccounts: number;
  totalPointsAwarded: number;
  totalPaidWithdrawalsBDT?: number;
}

export interface SMMStats {
  rewardPoints: number;
  dailyProgress: number;
  myAccountsCount: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  pendingWithdrawals?: number;
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

export type NotificationType =
  | 'task_approved'
  | 'task_rejected'
  | 'account_approved'
  | 'account_rejected'
  | 'milestone_unlocked'
  | 'daily_reward'
  | 'new_task'
  | 'new_submission'
  | 'new_account'
  | 'new_smm_verification'
  | 'withdrawal_requested'
  | 'withdrawal_approved'
  | 'withdrawal_paid'
  | 'withdrawal_rejected'
  | 'system_alert';

export interface NotificationItem {
  _id: string;
  userId?: string;
  targetRole?: 'admin' | 'smm' | 'all';
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  points?: number;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket';
export type AccountType = 'personal' | 'agent' | 'merchant';

export interface WithdrawalCycleInfo {
  joinDate?: string;
  daysSinceJoin?: number;
  cycleNumber?: number;
  isEligible?: boolean;
  approvedTasksCount?: number;
  approvedAccountsCount?: number;
}

export interface Withdrawal {
  _id: string;
  userId: string | User;
  points: number;
  amountBDT: number;
  paymentMethod: PaymentMethod;
  accountNumber: string;
  accountType: AccountType;
  status: WithdrawalStatus;
  transactionId?: string;
  adminNote?: string;
  processedBy?: string | User;
  processedAt?: string;
  cycleInfo?: WithdrawalCycleInfo;
  createdAt: string;
  updatedAt?: string;
}

export interface WithdrawalEligibility {
  isEligible: boolean;
  ineligibleReason: string;
  currentPoints: number;
  equivalentBDT: number;
  minWithdrawalPoints: number;
  minWithdrawalBDT: number;
  pointToBdtRate: number;
  joinDate: string;
  daysSinceJoin: number;
  cycleDays: number;
  currentCycleNumber: number;
  daysInCurrentCycle: number;
  daysUntilNextCycle: number;
  nextEligibleDate: string;
  lastWithdrawalDate?: string | null;
  daysSinceLastWithdrawal?: number | null;
  pendingWithdrawalsCount: number;
  workStats: {
    approvedTasksCount: number;
    approvedAccountsCount: number;
    streakDays: number;
    hasWorkActivity: boolean;
  };
}

export interface WithdrawalStats {
  totalPendingCount?: number;
  totalPaidCount?: number;
  totalRejectedCount?: number;
  totalPaidBDT?: number;
  totalPaidPoints?: number;
  totalPendingBDT?: number;
  totalPendingPoints?: number;
  myPendingCount?: number;
  myPaidCount?: number;
}

