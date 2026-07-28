export interface NewsPost {
  id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  content: string;
  contentEn?: string;
  category: "Security" | "Human Rights" | "Environment" | "MUN News" | "Delegate Guide";
  author: string;
  authorEn?: string;
  date: string;
  readTime: string;
  featuredImg: string;
  tags: string[];
}

export interface MUNConference {
  id: string;
  name: string;
  nameEn?: string;
  location: string;
  locationEn?: string;
  type: "International" | "Regional" | "National";
  startDate: string;
  endDate: string;
  committees: string[];
  committeesEn?: string[];
  status: "Open" | "Closing Soon" | "Closed";
  registrationFee: string;
  org: string;
  orgEn?: string;
  description: string;
  descriptionEn?: string;
  logoUrl?: string;
  applyUrl: string;
  creatorId?: string; // Links conference to the organizer who created it
  earlyBirdStartDate?: string;
  earlyBirdEndDate?: string;
  standardStartDate?: string;
  standardEndDate?: string;
  registrationDeadline?: string;
  registrationPhase?: "early-bird" | "standard" | "closed";
}

export interface CountryProfile {
  countryName: string;
  capital: string;
  bloc: string;
  generalStance: string;
  keyAllies: string[];
  historicalAdversaries: string[];
  votingTrends: string;
  resolutionPragmatics: {
    redLines: string;
    priorityClauses: string;
  };
  tacticalAdvice: string;
}

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type UserStatus = "active" | "restricted" | "banned_temporary" | "banned_permanent";

export interface SecurityEvent {
  id: string;
  userId: string;
  userEmail: string;
  type: string;
  riskLevel: RiskLevel;
  deviceInfo: string;
  timestamp: number;
  description: string;
}

export interface AdminActionLog {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserEmail: string;
  actionType: string;
  category?: "Account" | "News" | "Conference" | "Other";
  reason: string;
  comment: string;
  timestamp: number;
  expiryDate?: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "super_admin" | "admin" | "organizer" | "user";
  createdAt: string;
  is_verified?: boolean;
  verification_code?: string;
  verification_expiry?: number;
  isDeleted?: boolean;
  university?: string;
  phone?: string;
  dateOfBirth?: string;
  // Security fields
  status?: UserStatus;
  riskLevel?: RiskLevel;
  banExpiryDate?: number;
  adminComment?: string;
  adminReason?: string;
  
  // Notification Preferences
  preferences?: {
    emailAlerts?: boolean;
    pushNotifications?: boolean;
    newConferences?: boolean;
    conferenceDateChanges?: boolean;
    earlyBirdAlerts?: boolean;
    twoFactorEnabled?: boolean;
  };
}

export interface ConferenceJoinRequest {
  id: string;
  conferenceId: string;
  userId: string;
  userEmail: string;
  fullName: string;
  school: string;
  desiredCommittee: string;
  education?: string;
  experience: string;
  motivation?: string;
  receiptFile?: string;
  phone: string;
  telegram: string;
  source?: string; // e.g. Instagram, Friends, Telegram, Other
  status: "pending" | "awaiting_payment" | "payment_review" | "payment_rejected" | "confirmed" | "rejected";
  paymentDetails?: string;
  paymentReceiptUrl?: string;
  chatLink?: string;
  createdAt: string;
  rejectionReason?: string;
}

export interface ConferenceCreationRequest {
  id: string;
  userId: string;
  userEmail: string;
  confData: Partial<MUNConference>;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
}

export interface ResolutionDraft {
  id: string;
  committee: string;
  country: string;
  topic: string;
  clauseType: "preambulatory" | "operative" | "both";
  customFocus?: string;
  generatedText: string;
  createdAt: string;
}

export interface ConferenceRating {
  id: string;
  conferenceId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export type NotificationType = "early_bird" | "committee_update" | "schedule_change" | "system" | "new_conference" | "conference_cancelled";

export interface AppNotification {
  id: string;
  userId?: string; // Global if null
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  type: NotificationType;
  date: string;
  read: boolean;
  actionUrl?: string;
}
