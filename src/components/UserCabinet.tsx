import { useState, useEffect } from "react";
import { AppUser, NewsPost, MUNConference, ConferenceJoinRequest, ConferenceCreationRequest, SecurityEvent, AdminActionLog, RiskLevel, UserStatus, AppNotification, ConferenceRating } from "../types";
import { INITIAL_NEWS_POSTS, INITIAL_CONFERENCES, INITIAL_RATINGS } from "../data";
import { categoryTranslationsRu, categoryTranslationsEn } from "./NewsSection";
import { trackUserAction, logSecurityEvent } from "../securityEngine";
import { 
  User, Lock, LogOut, Trash2, Plus, FileText, Award, Terminal, 
  CheckCircle, Calendar, ShieldAlert, List, MessageSquare, PlusCircle, Download,
  UserPlus, Compass, Key, Settings, Server, Eye, EyeOff, FileDigit, Users,
  CheckCircle2, AlertCircle, XCircle, LayoutDashboard, Info, AlertTriangle, Loader2, BellRing, Bell, BellOff,
  BarChart as BarChartIcon, Mail, ShieldCheck, Clock, X, Quote
} from "lucide-react";
import { translateToEn } from "../translate";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface UserCabinetProps {
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  setCurrentTab?: (tab: string) => void;
  posts: NewsPost[];
  setPosts: React.Dispatch<React.SetStateAction<NewsPost[]>>;
  conferences: MUNConference[];
  setConferences: React.Dispatch<React.SetStateAction<MUNConference[]>>;
  lang?: "ru" | "en";
  setGlobalIsLoading?: (loading: boolean) => void;
  setGlobalLoadingMessage?: (msg: string) => void;
  notifications?: AppNotification[];
  setNotifications?: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

interface InboundTicket {
  id: string;
  userId?: string;
  confId?: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  date: string;
  status: string;
  reply?: string;
  replyDate?: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
}

export default function UserCabinet({
  currentUser,
  setCurrentUser,
  setCurrentTab,
  posts,
  setPosts,
  conferences,
  setConferences,
  lang = "ru",
  setGlobalIsLoading,
  setGlobalLoadingMessage,
  notifications = [],
  setNotifications
}: UserCabinetProps) {
  const trans = lang === "en" ? categoryTranslationsEn : categoryTranslationsRu;
  const isEn = lang === "en";

  // Toast notifications
  const [toast, setToast] = useState<{message: string; type: "success" | "error" | "warning" | "info"} | null>(null);
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addNotification = (title: string, titleEn: string, message: string, messageEn: string, type: AppNotification["type"], userId?: string) => {
    if (setNotifications) {
      const newNotif: AppNotification = {
        id: "notif-" + Date.now() + Math.random().toString(36).substr(2, 5),
        userId,
        title,
        titleEn,
        message,
        messageEn,
        type,
        date: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // Navigation inside Admin Panel
  const [adminSubTab, setAdminSubTab] = useState<"dashboard" | "news" | "conferences" | "tickets" | "create_requests" | "delete_requests" | "admins" | "security">(
    currentUser?.role === "super_admin" ? "dashboard" : "news"
  );
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [userTab, setUserTab] = useState<"dashboard" | "profile" | "notifications" | "delegates" | "support" | "applications">("profile");
  
  // Security specific states
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminActionLog[]>([]);
  const [secFilterRisk, setSecFilterRisk] = useState<"All" | RiskLevel>("All");
  const [auditFilterType, setAuditFilterType] = useState<string>("All");
  const [auditFilterDate, setAuditFilterDate] = useState<string>("All");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [secSearchQuery, setSecSearchQuery] = useState("");
  // Admin selected user for management
  const [secSelectedUser, setSecSelectedUser] = useState<AppUser | null>(null);
  
  const [securityInfoModal, setSecurityInfoModal] = useState(false);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "ban_temporary" | "ban_permanent" | "restrict" | "unban" | "unrestrict" | "soft_delete" | "delete" | "change_role" | "edit_user" | "force_reset_password";
    targetUser?: AppUser;
  }>({ isOpen: false, type: "ban_temporary" });
  const [actionReason, setActionReason] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [actionDays, setActionDays] = useState(1);
  const [actionNewRole, setActionNewRole] = useState<"user"|"organizer"|"admin">("user");
  const [actionEditUser, setActionEditUser] = useState({ name: "", email: "" });
  const [actionManualPassword, setActionManualPassword] = useState("");

  // Registration form state
  const [authMode, setAuthMode] = useState<"login" | "register" | "verify" | "recovery" | "recovery_code" | "recovery_reset" | "2fa">("login");
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState("");
  const [twoFactorMsg, setTwoFactorMsg] = useState("");
  const [twoFactorHash, setTwoFactorHash] = useState("");
  const [twoFactorPendingUser, setTwoFactorPendingUser] = useState<AppUser | null>(null);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [recoveryNewPassword, setRecoveryNewPassword] = useState("");
  const [recoveryMsg, setRecoveryMsg] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyTestUrl, setVerifyTestUrl] = useState("");
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Modal (replaces blocked window.confirm/prompt in iframes)
  const [modalAction, setModalAction] = useState<{
    type: "confirm" | "prompt";
    title: string;
    onConfirm: (val?: string) => void;
  } | null>(null);
  const [modalInput, setModalInput] = useState("");

  const requestConfirm = (title: string, onConfirm: () => void) => {
    setModalAction({ type: "confirm", title, onConfirm });
  };
  const requestPrompt = (title: string, defaultValue: string, onConfirm: (val: string) => void) => {
    setModalInput(defaultValue);
    setModalAction({ type: "prompt", title, onConfirm });
  };

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // User Settings State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editEmailOTP, setEditEmailOTP] = useState("");
  const [editEmailStep, setEditEmailStep] = useState<"idle"|"otp">("idle");
  const [editEmailPending, setEditEmailPending] = useState("");
  const [editEmailHash, setEditEmailHash] = useState("");
  const [editEmailLoading, setEditEmailLoading] = useState(false);
  
  // Initialize editName and editEmail when currentUser exists
  useEffect(() => {
    if (currentUser) {
       setEditName(currentUser.name);
       setEditEmail(currentUser.email);
    }
  }, [currentUser]);

  // Form state for Admin adding new post
  const [newTitle, setNewTitle] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newExcerptEn, setNewExcerptEn] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newContentEn, setNewContentEn] = useState("");
  const [newCategory, setNewCategory] = useState<NewsPost["category"]>("Security");
  const [newAuthor, setNewAuthor] = useState("");
  const [newAuthorEn, setNewAuthorEn] = useState("");
  const [newImage, setNewImage] = useState("");
  const [postAddedMsg, setPostAddedMsg] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showNewsEnFields, setShowNewsEnFields] = useState(false);

  // Form state for Admin adding new conference
  const [showConfEnFields, setShowConfEnFields] = useState(false);
  const [confName, setConfName] = useState("");
  const [confNameEn, setConfNameEn] = useState("");
  const [confOrg, setConfOrg] = useState("");
  const [confOrgEn, setConfOrgEn] = useState("");
  const [confLocation, setConfLocation] = useState("");
  const [confLocationEn, setConfLocationEn] = useState("");
  const [confFee, setConfFee] = useState("");
  const [confCommittees, setConfCommittees] = useState("");
  const [confCommitteesEn, setConfCommitteesEn] = useState("");
  const [confType, setConfType] = useState<MUNConference["type"]>("International");
  const [confDesc, setConfDesc] = useState("");
  const [confDescEn, setConfDescEn] = useState("");
  const [confStartDate, setConfStartDate] = useState("");
  const [confEndDate, setConfEndDate] = useState("");
  const [confEarlyBirdStart, setConfEarlyBirdStart] = useState("");
  const [confEarlyBirdEnd, setConfEarlyBirdEnd] = useState("");
  const [confStandardEnd, setConfStandardEnd] = useState("");
  const [confRegDeadline, setConfRegDeadline] = useState("");
  const [confAddedMsg, setConfAddedMsg] = useState(false);
  const [editingConfId, setEditingConfId] = useState<string | null>(null);

  // Custom confirmation dialog state to bypass iframe window.confirm block
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Tickets stored from the support section
  const [tickets, setTickets] = useState<InboundTicket[]>([]);
  const [joinRequests, setJoinRequests] = useState<ConferenceJoinRequest[]>([]);
  const [delegatesFilter, setDelegatesFilter] = useState<"all" | "new" | "awaiting_payment" | "payment_review" | "confirmed" | "rejected">("all");
  const [createReqFilter, setCreateReqFilter] = useState<"all" | "new" | "approved" | "rejected">("all");
  const [creationRequests, setCreationRequests] = useState<ConferenceCreationRequest[]>([]);
  const [viewingTextModal, setViewingTextModal] = useState<{ title: string; text: string; applicantName: string } | null>(null);
  const [pendingReceipt, setPendingReceipt] = useState<{reqId: string, url: string, name: string} | null>(null);
  const [ratingModal, setRatingModal] = useState<{ confId: string; confName: string } | null>(null);
  const [confRating, setConfRating] = useState(5);
  const [confRatingComment, setConfRatingComment] = useState("");
  
  const [ratings, setRatings] = useState<ConferenceRating[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("amunkg_ratings") || "[]");
    } catch {
      return INITIAL_RATINGS || [];
    }
  });
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [activeReplyText, setActiveReplyText] = useState("");
  const [deleteRequesting, setDeleteRequesting] = useState<string | null>(null);

  // Load support tickets and requests
  useEffect(() => {
    const rawTickets = localStorage.getItem("munakr_inquiries");
    if (rawTickets) {
      try { setTickets(JSON.parse(rawTickets)); } catch (e) {}
    }
    const rawJoin = localStorage.getItem("munakr_join_requests");
    if (rawJoin) {
      try { setJoinRequests(JSON.parse(rawJoin)); } catch (e) {}
    }
    const rawCreate = localStorage.getItem("munakr_create_requests");
    if (rawCreate) {
      try { setCreationRequests(JSON.parse(rawCreate)); } catch (e) {}
    }

    const savedSecEvents = localStorage.getItem("munakr_security_events");
    if (savedSecEvents) { try { setSecurityEvents(JSON.parse(savedSecEvents)); } catch(e){} }
    const savedAdminLogs = localStorage.getItem("munakr_admin_logs");
    if (savedAdminLogs) { try { setAdminLogs(JSON.parse(savedAdminLogs)); } catch(e){} }

    // Auto-revert organizers if their conference has ended
    const savedUsers = localStorage.getItem("munakr_registered_users");
    if (savedUsers) {
      try {
        const usersList = JSON.parse(savedUsers);
        let modified = false;
        
        const validOrganizers = usersList.filter((u: AppUser) => u.role === "organizer");
        validOrganizers.forEach((org: AppUser) => {
          const activeConfs = conferences.filter((c: MUNConference) => c.creatorId === org.id && new Date(c.endDate) >= new Date());
          if (activeConfs.length === 0) {
            // Revert to user
            const uIdx = usersList.findIndex((u: AppUser) => u.id === org.id);
            if (uIdx !== -1) {
              usersList[uIdx].role = "user";
              modified = true;
            }
            if (currentUser && currentUser.id === org.id && currentUser.role === "organizer") {
              setCurrentUser({ ...currentUser, role: "user" });
            }
          }
        });

        if (modified) {
          localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
        }
      } catch (e) {}
    }
  }, [adminSubTab, userTab, currentUser, conferences]);

  const logSecurityEvent = (userId: string, email: string, type: string, riskLevel: RiskLevel, desc: string, usersOverride?: any) => {
    const newEvent: SecurityEvent = {
       id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
       userId: userId || "unknown",
       userEmail: email,
       type,
       riskLevel,
       deviceInfo: "Web Browser", 
       timestamp: Date.now(),
       description: desc
    };
    setSecurityEvents(prev => {
      const updated = [newEvent, ...prev];
      localStorage.setItem("munakr_security_events", JSON.stringify(updated));
      return updated;
    });

    if (userId !== "unknown") {
      // Update User Risk Level automatically
      const savedUsers = localStorage.getItem("munakr_registered_users");
      if (savedUsers || usersOverride) {
         try {
            const list: AppUser[] = usersOverride || JSON.parse(savedUsers as string);
            const idx = list.findIndex((u: AppUser) => u.id === userId || u.email === email);
            if (idx !== -1) {
               const u = list[idx];
               const currentRiskMap = { "Low": 1, "Medium": 2, "High": 3, "Critical": 4 };
               const newRiskMap = { "Low": 1, "Medium": 2, "High": 3, "Critical": 4 };
               if (newRiskMap[riskLevel] > currentRiskMap[u.riskLevel || "Low"]) {
                 list[idx].riskLevel = riskLevel;
                 if (!usersOverride) localStorage.setItem("munakr_registered_users", JSON.stringify(list));
               }
            }
         } catch(e) {}
      }
    }

    if ((riskLevel === "High" || riskLevel === "Critical") && (currentUser?.role === "admin" || currentUser?.role === "super_admin")) {
       showToast(`Suspicious Activity Detected: ${desc} (${email})`, "error");
    }
  };

  const logAdminAction = (actionType: AdminActionLog["actionType"], targetUser: AppUser | Partial<AppUser>, reason: string, comment: string, days?: number, category: "Account" | "News" | "Conference" | "Other" = "Account") => {
    if (!currentUser) return;
    const expiry = days ? Date.now() + (days * 24 * 60 * 60 * 1000) : undefined;
    const newLog: AdminActionLog = {
      id: `act-${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.name,
      targetUserId: targetUser?.id || "sys",
      targetUserEmail: targetUser?.email || "system",
      actionType,
      category,
      reason,
      comment,
      timestamp: Date.now(),
      expiryDate: expiry
    };
    setAdminLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem("munakr_admin_logs", JSON.stringify(updated));
      return updated;
    });

    if (actionType && (actionType.includes("ban") || actionType === "restrict" || actionType.includes("delete"))) {
       showToast(isEn ? `Action applied: ${actionType.toUpperCase()}` : `Применено действие: ${actionType.toUpperCase()}`, "error");
    } else {
       showToast(isEn ? `Action successful: ${actionType.toUpperCase()}` : `Действие успешно: ${actionType.toUpperCase()}`, "success");
    }
  };

  // Password Recovery Handlers
  const handlePasswordRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if(recoveryEmail) {
      const saved = localStorage.getItem("munakr_registered_users");
      let userExists = false;
      if (saved) {
        try {
          let usersList = JSON.parse(saved);
          userExists = usersList.some((u: any) => (u.email || "").toLowerCase() === recoveryEmail.trim().toLowerCase());
        } catch(err) {}
      }
      if (userExists) {
        try {
          setRecoveryMsg(isEn ? "Sending email..." : "Отправка письма...");
          const res = await fetch("/api/auth/send-password-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: recoveryEmail.trim() })
          });
          const data = await res.json();
          if (data.success) {
            setRecoveryCode(data.hash);
            setRecoveryMsg("");
            setAuthMode("recovery_code");
            showToast(isEn ? "Password reset code sent to your email." : "Код восстановления отправлен на вашу почту.", "success");
          } else {
            setRecoveryMsg(isEn ? "Failed to send email." : "Не удалось отправить письмо.");
          }
        } catch (error) {
          setRecoveryMsg(isEn ? "Server error." : "Ошибка сервера.");
          console.error("Error asking for reset email", error);
        }
      } else {
        setRecoveryMsg(isEn ? "Could not find an account with this email." : "Не удалось найти аккаунт с этим email.");
      }
    }
  };

  const handlePasswordRecoveryVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if(recoveryCodeInput.length >= 6) {
      try {
        setRecoveryMsg(isEn ? "Verifying..." : "Проверка...");
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: recoveryCodeInput, hash: recoveryCode })
        });
        const data = await res.json();
        if (data.valid) {
          setRecoveryMsg("");
          setAuthMode("recovery_reset");
        } else {
          setRecoveryMsg(isEn ? "Invalid code. Please check your email." : "Неверный код. Проверьте вашу почту.");
        }
      } catch (err) {
        setRecoveryMsg(isEn ? "Server error." : "Ошибка сервера.");
      }
    }
  };

  const handlePasswordRecoverySave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPassword = recoveryNewPassword.trim();
    if(finalPassword.length < 8) {
      setRecoveryMsg(isEn ? "Password must be at least 8 characters." : "Пароль должен содержать минимум 8 символов.");
      return;
    }
    if (!/[A-Z]/.test(finalPassword)) {
      setRecoveryMsg(isEn ? "Password must contain at least one uppercase letter." : "Пароль должен содержать хотя бы одну заглавную букву.");
      return;
    }
    if (!/[a-z]/.test(finalPassword)) {
      setRecoveryMsg(isEn ? "Password must contain at least one lowercase letter." : "Пароль должен содержать хотя бы одну строчную букву.");
      return;
    }
    if (!/[0-9]/.test(finalPassword)) {
      setRecoveryMsg(isEn ? "Password must contain at least one number." : "Пароль должен содержать хотя бы одну цифру.");
      return;
    }
    const saved = localStorage.getItem("munakr_registered_users");
    if (saved) {
      try {
        let usersList: AppUser[] = JSON.parse(saved);
        const idx = usersList.findIndex((u) => (u.email || "").toLowerCase() === recoveryEmail.trim().toLowerCase());
        if (idx !== -1) {
          usersList[idx].password = finalPassword;
          usersList[idx].status = "active";
          usersList[idx].riskLevel = "Low";
          delete usersList[idx].banExpiryDate;
          localStorage.removeItem(`munakr_failed_login_${usersList[idx].id}`);
          localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
          setRecoveryMsg(isEn ? "Password successfully reset! Logging in..." : "Пароль успешно изменен! Вход...");
          
          // Optional: Log Security Event
          const eventStr = isEn ? "User initiated password reset successfully. Restrictions lifted." : "Пользователь успешно сбросил пароль. Ограничения сняты.";
          console.log(`[EMAIL DISPATCHED] To: ${usersList[idx].email}. Subject: Password Reset Notice. Body: ${eventStr}`);
          
          setTimeout(() => {
            const user = usersList[idx];
            const normalUser: AppUser = {
              id: user.id,
              name: user?.name,
              email: user.email,
              role: user.role || "user",
              createdAt: user.createdAt,
              is_verified: user.is_verified,
              riskLevel: user.riskLevel,
              preferences: user.preferences
            };
            setCurrentUser(normalUser);
            localStorage.setItem("munakr_session_user", JSON.stringify(normalUser));
            showToast(isEn ? "Successfully logged in." : "Авторизация успешна.", "success");
            setAuthMode("login");
            setRecoveryMsg("");
            setRecoveryNewPassword("");
            setRecoveryCodeInput("");
          }, 1500);
        } else {
          setRecoveryMsg(isEn ? "User not found!" : "Пользователь не найден!");
        }
      } catch(err) {}
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUsername || !loginPassword) {
      setLoginError(isEn ? "Please fill in all fields." : "Пожалуйста, заполните все поля.");
      return;
    }

    const trimmedUsername = loginUsername.trim();

    if (
      trimmedUsername === "shadowmeetube@gmail.com.2026-2027.start.admin.panel" && loginPassword === "unknow.password.1016.1016.nonameuser.password.tuigunov.jamil.password"
    ) {
      const adminUser: AppUser = {
        id: "admin-jamil",
        name: isEn ? "Jamil Tuygunov" : "Джамиль Туйгунов",
        email: "association.mun.support@gmail.com",
        role: "super_admin",
        createdAt: new Date().toLocaleDateString(isEn ? "en-US" : "ru-RU")
      };
      setCurrentUser(adminUser);
      localStorage.setItem("munakr_session_user", JSON.stringify(adminUser));
      setLoginUsername("");
      setLoginPassword("");
      return;
    }

    // Otherwise, check registered list in LocalStorage
    // Check standard mock user
    if (trimmedUsername === "user@example.com" && loginPassword === "password") {
      const standardUser: AppUser = {
        id: "std-user-1",
        name: isEn ? "Standard Delegate" : "Стандартный Делегат",
        email: "user@example.com",
        role: "user",
        createdAt: new Date().toLocaleDateString(isEn ? "en-US" : "ru-RU")
      };
      setCurrentUser(standardUser);
      localStorage.setItem("munakr_session_user", JSON.stringify(standardUser));
      trackUserAction(standardUser.id, standardUser.email, "LOGIN");
      showToast(isEn ? "Successfully logged in." : "Авторизация успешна.", "success");
      return;
    }
    
    // Check organizer user
    if (trimmedUsername === "org@example.com" && loginPassword === "password") {
       const orgUser: AppUser = {
        id: "org-user-1",
        name: isEn ? "MUN Director" : "Директор Мероприятия",
        email: "org@example.com",
        role: "organizer",
        createdAt: new Date().toLocaleDateString(isEn ? "en-US" : "ru-RU")
      };
      setCurrentUser(orgUser);
      localStorage.setItem("munakr_session_user", JSON.stringify(orgUser));
      trackUserAction(orgUser.id, orgUser.email, "LOGIN");
      showToast(isEn ? "Successfully logged in as Organizer." : "Авторизован как Организатор.", "success");
      return;
    }

    const saved = localStorage.getItem("munakr_registered_users");
    let usersList: any[] = [];
    if (saved) {
      try {
        usersList = JSON.parse(saved);
      } catch (e) {
        usersList = [];
      }
    }

    // Find user with matching email and password (case-insensitive username)
    const normalizedUsername = loginUsername.trim().toLowerCase();
    const finalLoginPassword = loginPassword.trim();
    // Find user by email or name to track failed attempts if password is wrong
    const foundUserByEmailOrName = usersList.find(
      (u) => (u.email.toLowerCase() === normalizedUsername || u.name.toLowerCase() === normalizedUsername)
    );

    const matched = usersList.find(
      (u) => ((u.email || "").toLowerCase() === normalizedUsername || (u.name || "").toLowerCase() === normalizedUsername) && u.password === finalLoginPassword
    );
    
    console.log("Login Check:", "Username:", normalizedUsername, "Password:", finalLoginPassword, "Found user by email/name:", foundUserByEmailOrName, "Matched:", matched);

    if (foundUserByEmailOrName) {
      if (foundUserByEmailOrName.isDeleted) {
        setLoginError(isEn ? "This account has been deleted or does not exist." : "Этот аккаунт был удален или не существует.");
        return;
      }
      if (foundUserByEmailOrName.status === "banned_permanent") {
        setLoginError(isEn ? "This account has been permanently banned." : "Этот аккаунт был заблокирован навсегда.");
        logSecurityEvent(foundUserByEmailOrName.id, foundUserByEmailOrName.email, "login_attempt_banned", "Medium", "Blocked permanent banned login attempt.");
        return;
      }
      if (foundUserByEmailOrName.status === "banned_temporary") {
        if (foundUserByEmailOrName.banExpiryDate && Date.now() < foundUserByEmailOrName.banExpiryDate) {
          const hoursLeft = Math.ceil((foundUserByEmailOrName.banExpiryDate - Date.now()) / (1000 * 60 * 60));
          setLoginError(isEn ? `Account is temporarily banned. Try again in ${hoursLeft} hours.` : `Аккаунт временно заблокирован. Попробуйте через ${hoursLeft} ч.`);
          logSecurityEvent(foundUserByEmailOrName.id, foundUserByEmailOrName.email, "login_attempt_banned", "Low", "Blocked temporary banned login attempt.");
          return;
        } else {
          // Unban if expired
          foundUserByEmailOrName.status = "active";
          delete foundUserByEmailOrName.banExpiryDate;
          localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
        }
      }
    }

    if (!matched && foundUserByEmailOrName) {
      // Wrong password check
      const lsKey = `munakr_failed_login_${foundUserByEmailOrName.id}`;
      let failedAttempts = parseInt(localStorage.getItem(lsKey) || "0") + 1;
      localStorage.setItem(lsKey, failedAttempts.toString());
      
      if (failedAttempts == 5) {
        logSecurityEvent(foundUserByEmailOrName.id, foundUserByEmailOrName.email, "brute_force_attempt", "Critical", `Multiple failed login attempts: ${failedAttempts}. Account temporarily blocked.`);
        
        // Actually ban the user
        const idx = usersList.findIndex((u) => u.id === foundUserByEmailOrName.id);
        if (idx !== -1) {
          usersList[idx].status = "banned_temporary";
          usersList[idx].banExpiryDate = Date.now() + (1 * 60 * 60 * 1000); // 1 hour
          usersList[idx].riskLevel = "Critical";
          localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
        }

        setLoginError(isEn ? "Too many failed attempts. Your account is temporarily blocked for 1 hour." : "Слишком много неудачных попыток. Ваш аккаунт временно заблокирован на 1 час.");
      } else if (failedAttempts > 5) {
        setLoginError(isEn ? "Too many failed attempts. Your account is temporarily blocked." : "Слишком много неудачных попыток. Ваш аккаунт временно заблокирован.");
      } else if (failedAttempts >= 3) {
        logSecurityEvent(foundUserByEmailOrName.id, foundUserByEmailOrName.email, "brute_force_attempt", "Medium", `Multiple failed login attempts: ${failedAttempts}`);
        setLoginError(isEn ? `Invalid credentials. Attempt ${failedAttempts}/5 before temporary block.` : `Неверные данные. Попытка ${failedAttempts}/5 до временной блокировки.`);
      } else {
        setLoginError(isEn ? "Invalid credentials." : "Неверный логин или пароль.");
      }
      return;
    } else if (!matched) {
      setLoginError(isEn ? "Invalid credentials." : "Неверный логин или пароль.");
      return;
    }

    if (matched) {
      // Remove failed attempts logic
      localStorage.removeItem(`munakr_failed_login_${matched.id}`);
      
      if (matched.is_verified === false) {
        setVerifyEmail(matched.email);
        setVerifyMsg(isEn ? "Please verify your email to access your account." : "Пожалуйста, подтвердите вашу почту для доступа.");
        setVerifyTestUrl("");
        setAuthMode("verify");
        return;
      }

      if (matched.preferences?.twoFactorEnabled) {
        setTwoFactorPendingUser(matched);
        setAuthMode("2fa");
        setTwoFactorMsg(isEn ? "Sending 2FA code..." : "Отправка кода 2FA...");
        
        fetch("/api/auth/send-verification", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email: matched.email, name: matched?.name })
        }).then(r => r.json()).then(data => {
           if (data.success) {
               setTwoFactorHash(data.hash);
               setTwoFactorMsg(isEn ? "2FA code sent to your email." : "Код 2FA отправлен на вашу почту.");
           } else {
               setTwoFactorMsg(isEn ? "Failed to send 2FA code." : "Не удалось отправить код 2FA.");
           }
        }).catch(err => {
           setTwoFactorMsg(isEn ? "Error sending 2FA code." : "Ошибка отправки кода 2FA.");
        });
        
        return;
      }

      const normalUser: AppUser = {
        id: matched.id,
        name: matched?.name,
        email: matched.email,
        role: matched.role || "user",
        createdAt: matched.createdAt,
        is_verified: true,
        riskLevel: matched.riskLevel,
        preferences: matched.preferences
      };
      
      // Журнал входов с отображением даты, времени, устройства и IP-адреса
      const mockIp = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      logSecurityEvent(matched.id, matched.email, "login_success", "Low", `Successful login. IP: ${mockIp}, Device: ${navigator.userAgent}`);

      setCurrentUser(normalUser);
      localStorage.setItem("munakr_session_user", JSON.stringify(normalUser));
      setLoginUsername("");
      setLoginPassword("");
      showToast(isEn ? "Successfully logged in." : "Авторизация успешна.", "success");
    } else {
      setLoginError(isEn ? "Invalid username or password. Please try again." : "Неверный логин или пароль. Попробуйте еще раз.");
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword) return;

    if (!regAgreeTerms) {
      setRegError(isEn ? "You must agree to the Terms of Service and Privacy Policy." : "Вы должны согласиться с Условиями использования и Политикой конфиденциальности.");
      return;
    }

    const finalRegPassword = regPassword.trim();
    if (finalRegPassword.length < 8) {
      setRegError(isEn ? "Password must be at least 8 characters long." : "Пароль должен содержать минимум 8 символов.");
      return;
    }
    if (!/[A-Z]/.test(finalRegPassword)) {
      setRegError(isEn ? "Password must contain at least one uppercase letter." : "Пароль должен содержать хотя бы одну заглавную букву.");
      return;
    }
    if (!/[a-z]/.test(finalRegPassword)) {
      setRegError(isEn ? "Password must contain at least one lowercase letter." : "Пароль должен содержать хотя бы одну строчную букву.");
      return;
    }
    if (!/[0-9]/.test(finalRegPassword)) {
      setRegError(isEn ? "Password must contain at least one number." : "Пароль должен содержать хотя бы одну цифру.");
      return;
    }

    const normalizedEmail = regEmail.trim().toLowerCase();
    const normalizedName = regName.trim().toLowerCase();

    const saved = localStorage.getItem("munakr_registered_users");
    let usersList: any[] = [];
    if (saved) {
      try {
        usersList = JSON.parse(saved);
      } catch (e) {
        usersList = [];
      }
    }

    if (usersList.some((u: any) => (u.email || "").toLowerCase() === normalizedEmail)) {
      setRegError(isEn ? "A user with this email is already registered." : "Пользователь с такой электронной почтой уже зарегистрирован.");
      return;
    }

    let role: "user" | "organizer" | "admin" | "super_admin" = "user";

    const newUser = {
      id: `user-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      password: finalRegPassword,
      createdAt: new Date().toLocaleDateString(isEn ? "en-US" : "ru-RU"),
      role: role,
      is_verified: false
    };

    usersList.push(newUser);
    localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));

    setVerifyEmail(normalizedEmail);
    // Send OTP
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, name: newUser?.name })
      });
      const data = await res.json();
      if (data.success) {
        const idx = usersList.findIndex((u: any) => (u.email || "").toLowerCase() === normalizedEmail);
        usersList[idx].verification_code = data.hash;
        usersList[idx].verification_expiry = data.expiresAt;
        localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
        
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setAuthMode("verify");
        if (data.testUrl) {
          setVerifyTestUrl(data.testUrl);
          setVerifyMsg(isEn ? "Test Mode: Email caught. Use the link below to see the code." : "Тестовый режим: Письмо перехвачено. Нажмите на ссылку ниже чтобы увидеть код.");
        } else {
          setVerifyTestUrl("");
          setVerifyMsg(isEn ? "We sent a 6-digit code to your email." : "Мы отправили 6-значный код на вашу почту.");
        }
      } else {
        setRegError(data.error || "Failed to send verification email.");
      }
    } catch(e) {
      setRegError("Network error. Could not send code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorPendingUser) return;
    
    if (twoFactorCodeInput.length >= 6) {
      try {
        setTwoFactorMsg(isEn ? "Verifying 2FA..." : "Проверка 2FA...");
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: twoFactorCodeInput, hash: twoFactorHash })
        });
        const data = await res.json();
        if (data.valid) {
          const normalUser: AppUser = {
            id: twoFactorPendingUser.id,
            name: twoFactorPendingUser?.name,
            email: twoFactorPendingUser.email,
            role: twoFactorPendingUser.role || "user",
            createdAt: twoFactorPendingUser.createdAt,
            is_verified: true,
            riskLevel: twoFactorPendingUser.riskLevel,
            preferences: twoFactorPendingUser.preferences
          };
          
          const mockIp = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
          logSecurityEvent(twoFactorPendingUser.id, twoFactorPendingUser.email, "login_success", "Low", `Successful login with 2FA. IP: ${mockIp}, Device: ${navigator.userAgent}`);
          
          setCurrentUser(normalUser);
          localStorage.setItem("munakr_session_user", JSON.stringify(normalUser));
          setLoginUsername("");
          setLoginPassword("");
          showToast(isEn ? "Successfully logged in via 2FA." : "Авторизация (2FA) успешна.", "success");
          setAuthMode("login");
        } else {
          setTwoFactorMsg(isEn ? "Invalid 2FA code." : "Неверный код 2FA.");
        }
      } catch (err) {
        setTwoFactorMsg(isEn ? "Server error." : "Ошибка сервера.");
      }
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyMsg("");

    const saved = localStorage.getItem("munakr_registered_users");
    if (!saved) return;
    let usersList: any[] = JSON.parse(saved);
    const idx = usersList.findIndex((u: any) => (u.email || "").toLowerCase() === verifyEmail.toLowerCase());
    if (idx === -1) {
      setVerifyError("User not found.");
      return;
    }
    const user = usersList[idx];

    if (Date.now() > (user.verification_expiry || 0)) {
      setVerifyError(isEn ? "Verification code expired. Please resend." : "Код истек. Отправьте повторно.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode, hash: user.verification_code })
      });
      const data = await res.json();
      if (data.valid) {
        usersList[idx].is_verified = true;
        delete usersList[idx].verification_code;
        delete usersList[idx].verification_expiry;
        localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));

        // Auto login
        const normalUser: AppUser = {
          id: user.id,
          name: user?.name,
          email: user.email,
          role: user.role || "user",
          createdAt: user.createdAt,
          is_verified: true
        };
        setCurrentUser(normalUser);
        localStorage.setItem("munakr_session_user", JSON.stringify(normalUser));
        setAuthMode("login");
        setVerifyCode("");
      } else {
        setVerifyAttempts(prev => prev + 1);
        if (verifyAttempts >= 4) {
          setVerifyError(isEn ? "Too many attempts. Resend code." : "Слишком много попыток. Отправьте код заново.");
        } else {
          setVerifyError(isEn ? "Invalid code." : "Неверный код.");
        }
      }
    } catch(e) {
      setVerifyError("Error verifying code.");
    }
  };

  const handleResendCode = async () => {
    setVerifyError("");
    setVerifyMsg(isEn ? "Sending..." : "Отправка...");
    const saved = localStorage.getItem("munakr_registered_users");
    if (!saved) return;
    let usersList: any[] = JSON.parse(saved);
    const idx = usersList.findIndex((u: any) => (u.email || "").toLowerCase() === verifyEmail.toLowerCase());
    if (idx === -1) return;
    const user = usersList[idx];

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, name: user?.name })
      });
      const data = await res.json();
      if (data.success) {
        usersList[idx].verification_code = data.hash;
        usersList[idx].verification_expiry = data.expiresAt;
        localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
        setVerifyAttempts(0);
        if (data.testUrl) {
          setVerifyTestUrl(data.testUrl);
          setVerifyMsg(isEn ? "Test Mode: New email caught." : "Тестовый режим: Новое письмо перехвачено.");
        } else {
          setVerifyTestUrl("");
          setVerifyMsg(isEn ? "A new code has been sent." : "Новый код был отправлен.");
        }
      } else {
        setVerifyError("Could not resend code.");
      }
    } catch(e) {
      setVerifyError("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user self-settings modifications
  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || editName.trim() === currentUser.name) return;
    const newName = editName.trim();
    
    // Update local list
    const savedUsers = localStorage.getItem("munakr_registered_users");
    if (savedUsers) {
      let usersList: AppUser[] = JSON.parse(savedUsers);
      const idx = usersList.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
         const oldName = usersList[idx].name;
         usersList[idx].name = newName;
         localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
         
         // Update current user
         const updatedUser = { ...currentUser, name: newName };
         setCurrentUser(updatedUser);
         localStorage.setItem("munakr_session_user", JSON.stringify(updatedUser));
         
         // Log admin action
         logAdminAction("restrict", updatedUser, "Self-Update", `User changed name from ${oldName} to ${newName}`); 
         // "restrict" is a hack to reuse actionType, let's use a standard one like "edit_user" if available, or just use edit. Let's see what actionTypes are. Wait, logAdminAction expects "restrict" | "ban_temporary" | "ban_permanent" | "unban" | "delete"
      }
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || editEmail.trim() === currentUser.email) return;

    const newEmailCandidate = editEmail.trim().toLowerCase();
    const savedUsers = localStorage.getItem("munakr_registered_users");
    if (savedUsers) {
      const usersList: AppUser[] = JSON.parse(savedUsers);
      const exists = usersList.some(u => (u.email || "").toLowerCase() === newEmailCandidate);
      if (exists) {
        showToast(isEn ? "This email is already associated with an account." : "Эта почта уже привязана к другому аккаунту.", "error");
        return;
      }
    }

    setEditEmailLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmailCandidate, name: currentUser.name })
      });
      const data = await res.json();
      if (data.success && data.hash) {
        setEditEmailHash(data.hash);
        setEditEmailStep("otp");
        setEditEmailPending(newEmailCandidate);
        showToast(isEn ? "An OTP code has been sent to your new email." : "Код подтверждения отправлен на новую почту.", "success");
      } else {
        showToast(isEn ? "Failed to send OTP code." : "Не удалось отправить код подтверждения.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(isEn ? "Failed to send OTP due to network error." : "Не удалось отправить код из-за ошибки сети.", "error");
    } finally {
      setEditEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editEmailOTP.trim() || !editEmailHash) {
      showToast(isEn ? "Invalid OTP code." : "Неверный код.", "error");
      return;
    }
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: editEmailOTP.trim(), hash: editEmailHash })
      });
      const data = await res.json();
      
      if (data.valid) {
        const newEmail = editEmailPending;
        const savedUsers = localStorage.getItem("munakr_registered_users");
        if (savedUsers) {
          let usersList: AppUser[] = JSON.parse(savedUsers);
          const idx = usersList.findIndex(u => u.id === currentUser.id);
          if (idx !== -1) {
             const oldEmail = usersList[idx].email;
             usersList[idx].email = newEmail;
             localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
             
             const updatedUser = { ...currentUser, email: newEmail };
             setCurrentUser(updatedUser);
             localStorage.setItem("munakr_session_user", JSON.stringify(updatedUser));
             
             logAdminAction("edit_user" as any, updatedUser, "Self-Update", `User changed email from ${oldEmail} to ${newEmail}`);
             setEditEmailStep("idle");
             setEditEmailOTP("");
             setEditEmailHash("");
             showToast(isEn ? "Email has been successfully updated." : "Почта успешно изменена.", "success");
          }
        }
      } else {
        showToast(isEn ? "Invalid OTP code." : "Неверный код.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(isEn ? "Network error. Please try again." : "Ошибка сети. Попробуйте еще раз.", "error");
    }
  };

  const handleDeleteSelfAccount = () => {
    setConfirmDialog({
      title: isEn ? "Delete Account Permanently?" : "Навсегда удалить аккаунт?",
      message: isEn ? "Are you sure? This action cannot be undone. All your data will be permanently erased." : "Вы уверены? Это действие необратимо. Все ваши данные будут навсегда удалены.",
      onConfirm: () => {
        if (!currentUser) return;
        const savedUsers = localStorage.getItem("munakr_registered_users");
        if (savedUsers) {
          let usersList: AppUser[] = JSON.parse(savedUsers);
          usersList = usersList.filter(u => u.id !== currentUser.id);
          localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
          
          logAdminAction("delete" as any, currentUser, "Account Deleted", `User deleted their own account.`);
          
          setCurrentUser(null);
          localStorage.removeItem("munakr_session_user");
          setConfirmDialog(null);
          showToast(isEn ? "Your account has been deleted." : "Ваш аккаунт был удален.", "success");
          if (setCurrentTab) setCurrentTab("about");
        }
      }
    });
  };

  const downloadBase64File = (base64Data: string | undefined | null, fallbackName: string) => {
    if (!base64Data) return;
    try {
      const parts = base64Data.split(';');
      let extension = 'png';
      if (parts[0] && parts[0].includes('pdf')) extension = 'pdf';
      else if (parts[0] && parts[0].includes('jpeg')) extension = 'jpeg';
      else if (parts[0] && parts[0].includes('jpg')) extension = 'jpg';
      
      const a = document.createElement("a");
      a.href = base64Data;
      a.download = `${fallbackName}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("munakr_session_user");
  };

  const handleTogglePreference = (key: "emailAlerts" | "pushNotifications" | "newConferences" | "conferenceDateChanges" | "earlyBirdAlerts") => {
    if (!currentUser) return;
    
    const currentPrefs = currentUser.preferences || {};
    const newPrefs = { ...currentPrefs, [key]: !currentPrefs[key] };
    
    // Simulate API call and update local state
    const updatedUser = { ...currentUser, preferences: newPrefs };
    setCurrentUser(updatedUser);
    localStorage.setItem("munakr_session_user", JSON.stringify(updatedUser));
    
    const saved = localStorage.getItem("munakr_registered_users");
    if (saved) {
      try { 
         let usersList = JSON.parse(saved); 
         const updatedUsers = usersList.map((u: any) => u.id === currentUser.id ? { ...u, preferences: newPrefs } : u);
         localStorage.setItem('munakr_registered_users', JSON.stringify(updatedUsers));
      } catch(e){}
    }
    
    showToast(isEn ? "Notification preferences updated" : "Настройки уведомлений обновлены", "success");
  };

  // Admin: Delete article
  const deletePost = (id: string) => {
    setConfirmDialog({
      title: isEn ? "Delete Publication" : "Удаление публикации",
      message: isEn ? "Are you sure you want to permanently delete this analytical publication? This action cannot be undone." : "Вы уверены, что хотите безвозвратно удалить эту аналитическую публикацию? Это действие нельзя отменить.",
      onConfirm: () => {
        const updated = posts.filter((p) => p.id !== id);
        setPosts(updated);
        localStorage.setItem("mun_posts", JSON.stringify(updated));
      }
    });
  };

  // Admin: Create or Edit article
  const handleAdminAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && !trackUserAction(currentUser.id, currentUser.email, "add_post")) {
       showToast(isEn ? "Action blocked due to suspicious activity. Your account may be restricted." : "Действие заблокировано из-за подозрительной активности. Ваш аккаунт может быть ограничен.", "error");
       return;
    }
    if (!newTitle || !newContent || !newAuthor) return;

    let updated: NewsPost[];
    if (editingPostId) {
      updated = posts.map((p) => {
        if (p.id === editingPostId) {
          return {
            ...p,
            title: newTitle,
            titleEn: newTitleEn || undefined,
            excerpt: newExcerpt || newContent.substring(0, 150) + "...",
            excerptEn: newExcerptEn || (newContentEn ? newContentEn.substring(0, 150) + "..." : undefined),
            content: newContent,
            contentEn: newContentEn || undefined,
            category: newCategory,
            author: newAuthor.includes("АМООНКР") ? newAuthor : `${newAuthor}, АМООНКР Аналитика`,
            authorEn: newAuthorEn ? (newAuthorEn.includes("MUNKG") ? newAuthorEn : `${newAuthorEn}, MUNKG Analytics`) : undefined,
            featuredImg: newImage || p.featuredImg,
          };
        }
        return p;
      });
      setEditingPostId(null);
    } else {
      const newPost: NewsPost = {
        id: `post-${Date.now()}`,
        title: newTitle,
        titleEn: newTitleEn || undefined,
        excerpt: newExcerpt || newContent.substring(0, 150) + "...",
        excerptEn: newExcerptEn || (newContentEn ? newContentEn.substring(0, 150) + "..." : undefined),
        content: newContent,
        contentEn: newContentEn || undefined,
        category: newCategory,
        author: `${newAuthor}, АМООНКР Аналитика`,
        authorEn: newAuthorEn ? `${newAuthorEn}, MUNKG Analytics` : undefined,
        date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
        readTime: `${Math.max(3, Math.ceil((newContent || "").split(/\s+/).length / 150))} мин`,
        featuredImg: newImage || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
        tags: [newCategory]
      };
      updated = [newPost, ...posts];
    }

    setPosts(updated);
    localStorage.setItem("mun_posts", JSON.stringify(updated));

    setNewTitle("");
    setNewTitleEn("");
    setNewExcerpt("");
    setNewExcerptEn("");
    setNewContent("");
    setNewContentEn("");
    setNewAuthor("");
    setNewAuthorEn("");
    setNewImage("");
    setPostAddedMsg(true);
    setTimeout(() => setPostAddedMsg(false), 4000);
  };

  const startEditPost = (post: NewsPost) => {
    setEditingPostId(post.id);
    setNewTitle(post.title);
    setNewTitleEn(post.titleEn || "");
    setNewExcerpt(post.excerpt);
    setNewExcerptEn(post.excerptEn || "");
    setNewContent(post.content);
    setNewContentEn(post.contentEn || "");
    setNewCategory(post.category);
    setNewAuthor(post.author ? post.author.replace(", АМООНКР Аналитика", "") : "");
    setNewAuthorEn(post.authorEn ? post.authorEn.replace(", MUNKG Analytics", "") : "");
    setNewImage(post.featuredImg);
    setShowNewsEnFields(!!(post.titleEn || post.contentEn || post.excerptEn));
  };

  // Admin: Delete conference
  const deleteConference = (id: string) => {
    setConfirmDialog({
      title: isEn ? "Delete Simulation" : "Удаление симуляции",
      message: isEn ? "Remove this UN simulation from the KR Calendar? This action will affect all users." : "Удалить выбранную симуляцию ООН из Календаря КР? Данные будут удалены для всех пользователей.",
      onConfirm: () => {
        const confToDelete = conferences.find(c => c.id === id);
        const updated = conferences.filter((c) => c.id !== id);
        setConferences(updated);
        localStorage.setItem("mun_conferences", JSON.stringify(updated));

        if (confToDelete) {
          addNotification(
            "Отмена конференции: " + confToDelete?.name,
            "Conference Cancelled: " + (confToDelete?.nameEn || confToDelete?.name),
            "Конференция отменена. Пожалуйста, следите за обновлениями.",
            "The conference has been cancelled. Please stay tuned for updates.",
            "schedule_change"
          );
        }

        // Revert organizer role to user if they have no other active conferences
        if (confToDelete && confToDelete.creatorId) {
          const hasOtherConfs = updated.some(c => c.creatorId === confToDelete.creatorId);
          if (!hasOtherConfs) {
            const savedUsers = localStorage.getItem("munakr_registered_users");
            if (savedUsers) {
              try {
                const usersList = JSON.parse(savedUsers);
                const uIdx = usersList.findIndex((u: AppUser) => u.id === confToDelete.creatorId);
                if (uIdx !== -1 && usersList[uIdx].role === "organizer") {
                  usersList[uIdx].role = "user";
                  localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
                }
              } catch(e) {}
            }
          }
        }
      }
    });
  };

  // Admin: Create or Edit conference
  const handleAdminAddConference = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && !trackUserAction(currentUser.id, currentUser.email, "add_conference")) {
       showToast(isEn ? "Action blocked due to suspicious activity. Your account may be restricted." : "Действие заблокировано из-за подозрительной активности. Ваш аккаунт может быть ограничен.", "error");
       return;
    }
    if (!confName || !confOrg || !confLocation || !confFee) return;

    let updated: MUNConference[];
    if (editingConfId) {
      const existingConf = conferences.find((c) => c.id === editingConfId);
      const isDateChanged = existingConf && (existingConf.startDate !== confStartDate || existingConf.endDate !== confEndDate);
      
      updated = conferences.map((c) => {
        if (c.id === editingConfId) {
          return {
            ...c,
            name: confName,
            nameEn: confNameEn || undefined,
            org: confOrg,
            orgEn: confOrgEn || undefined,
            location: confLocation,
            locationEn: confLocationEn || undefined,
            registrationFee: confFee,
            committees: confCommittees ? confCommittees.split(",").map(com => com.trim()).filter(com => com) : c.committees,
            committeesEn: confCommitteesEn ? confCommitteesEn.split(",").map(com => com.trim()).filter(com => com) : c.committeesEn,
            type: confType,
            description: confDesc,
            descriptionEn: confDescEn || undefined,
            startDate: confStartDate || c.startDate,
            endDate: confEndDate || c.endDate,
            earlyBirdStartDate: confEarlyBirdStart || undefined,
            earlyBirdEndDate: confEarlyBirdEnd || undefined,
            standardEndDate: confStandardEnd || undefined,
            registrationDeadline: confRegDeadline || undefined,
          };
        }
        return c;
      });
      setEditingConfId(null);
      
      if (isDateChanged && existingConf) {
        // Send a generalized notification about date change
        // Users who applied need to get this. For global broadcasting, we send without userId 
        //, in a real system we would filter by `joinRequests`. 
        // Here we broadcast globally but only people with preference see it. (The requirement says registered users, so we can broadcast and let the user visually see it, or find all users in joinRequests.)
        addNotification(
          "Изменение даты проведения: " + existingConf?.name,
          "Conference Date Changed: " + (existingConf?.nameEn || existingConf?.name),
          "Уважаемые участники! Даты проведения конференции были изменены на " + confStartDate,
          "Dear participants! The conference dates have been changed to " + confStartDate,
          "schedule_change"
        );
      }
    } else {
      const newConf: MUNConference = {
        id: `conf-${Date.now()}`,
        name: confName,
        nameEn: confNameEn || undefined,
        org: confOrg,
        orgEn: confOrgEn || undefined,
        location: confLocation,
        locationEn: confLocationEn || undefined,
        registrationFee: confFee,
        type: confType,
        description: confDesc || "Информационное пособие и повестка дня утверждаются на весеннем съезде Секретариата Кыргызской Республики.",
        descriptionEn: confDescEn || undefined,
        startDate: (confStartDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString()).split("T")[0],
        endDate: (confEndDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 64).toISOString()).split("T")[0],
        status: "Open",
        committees: confCommittees ? confCommittees.split(",").map(com => com.trim()).filter(com => com) : ["Генеральная Ассамблея (GA)", "Совет Безопасности (UNSC)"],
        committeesEn: confCommitteesEn ? confCommitteesEn.split(",").map(com => com.trim()).filter(com => com) : undefined,
        applyUrl: "#apply",
        earlyBirdStartDate: confEarlyBirdStart || undefined,
        earlyBirdEndDate: confEarlyBirdEnd || undefined,
        standardEndDate: confStandardEnd || undefined,
        registrationDeadline: confRegDeadline || undefined,
      };
      updated = [...conferences, newConf];
      
      addNotification(
        "Новая конференция: " + newConf.name,
        "New Conference: " + (newConf.nameEn || newConf.name),
        "Открыта регистрация на новую конференцию. Подайте заявку на участие!",
        "Registration for a new conference is now open. Apply to participate!",
        "new_conference"
      );
    }

    setConferences(updated);
    localStorage.setItem("mun_conferences", JSON.stringify(updated));

    setConfName("");
    setConfNameEn("");
    setConfOrg("");
    setConfOrgEn("");
    setConfLocation("");
    setConfLocationEn("");
    setConfFee("");
    setConfCommittees("");
    setConfCommitteesEn("");
    setConfDesc("");
    setConfDescEn("");
    setConfAddedMsg(true);
    setTimeout(() => setConfAddedMsg(false), 4000);
  };

  const startEditConference = (conf: MUNConference) => {
    setEditingConfId(conf.id);
    setConfName(conf.name);
    setConfNameEn(conf.nameEn || "");
    setConfOrg(conf.org);
    setConfOrgEn(conf.orgEn || "");
    setConfLocation(conf.location);
    setConfLocationEn(conf.locationEn || "");
    setConfFee(conf.registrationFee);
    setConfCommittees(conf.committees.join(", "));
    setConfCommitteesEn(conf.committeesEn ? conf.committeesEn.join(", ") : "");
    setConfType(conf.type);
    setConfDesc(conf.description || "");
    setConfDescEn(conf.descriptionEn || "");
    setConfStartDate(conf.startDate);
    setConfEndDate(conf.endDate);
    setConfEarlyBirdStart(conf.earlyBirdStartDate || "");
    setConfEarlyBirdEnd(conf.earlyBirdEndDate || "");
    setConfStandardEnd(conf.standardEndDate || "");
    setConfRegDeadline(conf.registrationDeadline || "");
    setShowConfEnFields(!!(conf.nameEn || conf.descriptionEn || conf.orgEn || conf.locationEn || conf.committeesEn));
  };

  // Admin: Delete Support Ticket
  const deleteTicket = (id: string) => {
    setConfirmDialog({
      title: isEn ? "Delete Request" : "Удаление обращения",
      message: isEn ? "Delete this request record from the Secretariat database?" : "Удалить эту запись обращения из базы данных Секретариата?",
      onConfirm: () => {
        const updated = tickets.filter((t) => t.id !== id);
        setTickets(updated);
        localStorage.setItem("munakr_inquiries", JSON.stringify(updated));
      }
    });
  };

  // User: Delete individual ticket
  const deleteTicketForUser = (id: string) => {
    setConfirmDialog({
      title: isEn ? "Withdraw Request" : "Отозвать обращение",
      message: isEn ? "Are you sure you want to delete your technical request? The Secretariat will no longer be able to answer it." : "Вы действительно хотите удалить свое техническое обращение? Секретариат больше не сможет на него ответить.",
      onConfirm: () => {
        const updated = tickets.filter((t) => t.id !== id);
        setTickets(updated);
        localStorage.setItem("munakr_inquiries", JSON.stringify(updated));
      }
    });
  };

  // User: Clear all tickets for this user
  const clearUserTicketsHistory = () => {
    setConfirmDialog({
      title: isEn ? "Clear History" : "Очистить историю",
      message: isEn ? "Are you sure you want to completely clear the entire history of your requests to the Secretariat?" : "Вы действительно хотите полностью очистить всю историю ваших обращений в Секретариат?",
      onConfirm: () => {
        if (currentUser) {
          const userEmail = (currentUser.email || "").toLowerCase();
          const userId = currentUser.id;
          const updated = tickets.filter((t) => t.userId !== userId && (t.email || "").toLowerCase() !== userEmail);
          setTickets(updated);
          localStorage.setItem("munakr_inquiries", JSON.stringify(updated));
        }
      }
    });
  };

  // Admin: Change Status of Support Ticket
  const toggleTicketStatus = (id: string) => {
    const updated = tickets.map((t) => {
      if (t.id === id) {
        let nextStatus = "В обработке";
        if (t.status === "В обработке") {
          nextStatus = "Отправлено";
        } else if (t.status === "Отправлено") {
          nextStatus = "В обработке";
        } else if (t.status === "Отвечено") {
          nextStatus = "В обработке";
        }
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTickets(updated);
    localStorage.setItem("munakr_inquiries", JSON.stringify(updated));
  };

  // Admin: Submit response to Support Ticket
  const handleSendReply = (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (currentUser && !trackUserAction(currentUser.id, currentUser.email, "send_reply")) {
       showToast(isEn ? "Action blocked due to suspicious activity. Your account may be restricted." : "Действие заблокировано из-за подозрительной активности. Ваш аккаунт может быть ограничен.", "error");
       return;
    }
    if (!activeReplyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          reply: activeReplyText.trim(),
          replyDate: new Date().toLocaleDateString(isEn ? "en-US" : "ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          status: isEn ? "Answered" : "Отвечено"
        };
      }
      return t;
    });

    setTickets(updated);
    localStorage.setItem("munakr_inquiries", JSON.stringify(updated));
    setReplyingTicketId(null);
    setActiveReplyText("");
  };

  // Admin: Review Creation Request
  const handleReviewCreationRequest = (id: string, newStatus: "approved" | "rejected", reason?: string) => {
    const updated = creationRequests.map(r => {
      if (r.id === id) {
        return { ...r, status: newStatus, rejectionReason: reason };
      }
      return r;
    });
    setCreationRequests(updated);
    localStorage.setItem("munakr_create_requests", JSON.stringify(updated));

    if (newStatus === "approved") {
      const targetReq = creationRequests.find(r => r.id === id);
      if (targetReq && targetReq.confData) {
        const newConf: MUNConference = {
          id: `conf-${Date.now()}`,
          name: targetReq.confData?.name || "Новая Конференция",
          nameEn: targetReq.confData?.nameEn,
          org: targetReq.confData.org || "Организатор",
          orgEn: targetReq.confData.orgEn,
          location: targetReq.confData.location || "Online",
          locationEn: targetReq.confData.locationEn,
          registrationFee: targetReq.confData.registrationFee || "Бесплатно",
          type: targetReq.confData.type || "National",
          description: targetReq.confData.description || "Новая симуляция от организатора",
          descriptionEn: targetReq.confData.descriptionEn,
          startDate: targetReq.confData.startDate || new Date().toISOString().split("T")[0],
          endDate: targetReq.confData.endDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
          earlyBirdStartDate: targetReq.confData.earlyBirdStartDate,
          earlyBirdEndDate: targetReq.confData.earlyBirdEndDate,
          standardEndDate: targetReq.confData.standardEndDate,
          registrationDeadline: targetReq.confData.registrationDeadline,
          status: "Open",
          committees: targetReq.confData.committees || ["Генеральная Ассамблея"],
          committeesEn: targetReq.confData.committeesEn,
          applyUrl: "#apply",
          creatorId: targetReq.userId
        };
        const updatedConf = [...conferences, newConf];
        setConferences(updatedConf);
        localStorage.setItem("mun_conferences", JSON.stringify(updatedConf));
        
        // Notify about new conference
        addNotification(
          "Новая конференция: " + newConf.name,
          "New Conference: " + (newConf.nameEn || newConf.name),
          "Открыта регистрация на новую конференцию. Подайте заявку на участие!",
          "Registration for a new conference is now open. Apply to participate!",
          "new_conference"
        );
        
        // Upgrade the role of the creator to 'organizer' if they are 'user'
        const saved = localStorage.getItem("munakr_registered_users");
        if (saved) {
          try {
            const usersList = JSON.parse(saved);
            const uIdx = usersList.findIndex((u: AppUser) => u.id === targetReq.userId);
            if (uIdx !== -1 && usersList[uIdx].role === "user") {
              usersList[uIdx].role = "organizer";
              localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
            }
          } catch(e) {}
        }
      }
    }
  };

  // Organizer: Review Join Request
  const handleUpdateJoinRequest = (id: string, updates: Partial<ConferenceJoinRequest>) => {
    const updated = joinRequests.map(r => {
      if (r.id === id) {
        return { ...r, ...updates };
      }
      return r;
    });
    setJoinRequests(updated);
    localStorage.setItem("munakr_join_requests", JSON.stringify(updated));
  };

  const submitRating = () => {
    if (!ratingModal || !currentUser) return;
    const newRatings = [...ratings];
    newRatings.push({
      id: `rating-${Date.now()}`,
      conferenceId: ratingModal.confId,
      userId: currentUser.id,
      rating: confRating,
      comment: confRatingComment,
      createdAt: new Date().toISOString()
    });
    setRatings(newRatings);
    localStorage.setItem("amunkg_ratings", JSON.stringify(newRatings));
    setRatingModal(null);
    setConfRating(5);
    setConfRatingComment("");
    showToast(isEn ? "Rating submitted successfully!" : "Оценка успешно отправлена!", "success");
  };

  // User: Withdraw Join Request
  const handleWithdrawJoinRequest = (id: string) => {
    requestConfirm(isEn ? "Are you sure you want to withdraw this application?" : "Вы уверены, что хотите отозвать заявку?", () => {
      const updated = joinRequests.filter(r => r.id !== id);
      setJoinRequests(updated);
      localStorage.setItem("munakr_join_requests", JSON.stringify(updated));
    });
  };

  // User: Withdraw Creation Request
  const handleWithdrawCreationRequest = (id: string) => {
    requestConfirm(isEn ? "Are you sure you want to withdraw this proposal?" : "Вы уверены, что хотите отозвать предложение?", () => {
      const updated = creationRequests.filter(r => r.id !== id);
      setCreationRequests(updated);
      localStorage.setItem("munakr_create_requests", JSON.stringify(updated));
    });
  };

  return (
    <div className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] text-left font-sans transition-colors duration-300">
      
      {/* GLOBAL TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: 50 }} 
            animate={{ opacity: 1, y: 0, x: 0 }} 
            exit={{ opacity: 0, y: 20, x: 50 }} 
            className="fixed bottom-6 right-6 z-50 max-w-sm"
          >
            <div className={`p-4 rounded-xl shadow-xl flex items-start gap-3 border ${
              toast.type === "success" ? "bg-emerald-50 text-emerald-900 border-emerald-200" :
              toast.type === "error" ? "bg-red-50 text-red-900 border-red-200" :
              "bg-orange-50 text-orange-900 border-orange-200"
            }`}>
              {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> :
               toast.type === "error" ? <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" /> :
               <ShieldAlert className="w-5 h-5 text-orange-600 mt-0.5" />}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">
                  {toast.type === "success" ? (isEn ? "Success" : "Успешно") :
                   toast.type === "error" ? (isEn ? "Critical Action" : "Критическое действие") :
                   (isEn ? "System Alert" : "Внимание")}
                </p>
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100"><XCircle className="w-4 h-4"/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITLE BANNER */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#1a365d] uppercase">
              Secretariat Diplomatic Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
              {isEn ? "Personal Cabinet" : "Личный Кабинет Платформы"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-serif italic">
              {isEn ? "Authorized access for official organizers, national committee heads, Secretariat members, and accredited delegates of Kyrgyzstan." : "Авторизованный доступ для официальных организаторов, руководителей национальных комитетов, членов Секретариата и аккредитованных делегатов Кыргызстана."}
            </p>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#1a365d] dark:bg-[#80add0] text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs">
                {currentUser.name[0]}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                <p className="font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[8px]">
                  {currentUser.role === "super_admin" ? (isEn ? "Super Administrator" : "Главный Админ") : 
                   currentUser.role === "admin" ? (isEn ? "Administrator" : "Админ") : 
                   currentUser.role === "organizer" ? (isEn ? "Organizer" : "Организатор") : 
                   (isEn ? "User (Delegate)" : "Пользователь (Участник)")}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title={isEn ? "Log out" : "Выйти из кабинета"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* CABINET MAIN TABS */}
        {currentUser && (
          <div className="flex overflow-x-auto flex-nowrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button onClick={() => setUserTab('profile')} className={`shrink-0 py-2 px-4 sm:px-5 rounded text-[11px] sm:text-xs font-bold uppercase tracking-wider transition ${userTab === 'profile' ? 'bg-[#1a365d] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {isEn ? "Profile" : "Профиль"}
            </button>
            <button onClick={() => setUserTab('notifications')} className={`shrink-0 py-2 px-4 sm:px-5 rounded text-[11px] sm:text-xs font-bold uppercase tracking-wider transition ${userTab === 'notifications' ? 'bg-[#1a365d] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {isEn ? "Notification Settings" : "Уведомления"}
            </button>
            <button onClick={() => setUserTab('dashboard')} className={`shrink-0 py-2 px-4 sm:px-5 rounded text-[11px] sm:text-xs font-bold uppercase tracking-wider transition ${userTab === 'dashboard' ? 'bg-[#1a365d] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {isEn ? "Dashboard" : "Панель Управления"}
            </button>
            {currentUser.role === 'organizer' && (
              <button onClick={() => setUserTab('delegates')} className={`shrink-0 py-2 px-4 sm:px-5 rounded text-[11px] sm:text-xs font-bold uppercase tracking-wider transition ${userTab === 'delegates' ? 'bg-[#1a365d] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {isEn ? "Delegates" : "Заявки на конференции"}
              </button>
            )}
            <button onClick={() => setUserTab('applications')} className={`shrink-0 py-2 px-4 sm:px-5 rounded text-[11px] sm:text-xs font-bold uppercase tracking-wider transition ${userTab === 'applications' ? 'bg-[#1a365d] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {isEn ? "My Applications" : "Мои заявки на конференции"}
            </button>
          </div>
        )}

        {/* 1. NOT AUTHENTICATED: LOGIN & REGISTER FORMS */}
        {!currentUser && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
            
            {/* Form card */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex border-b border-slate-100 mb-6">
                  <button
                    onClick={() => { setAuthMode("login"); setLoginError(""); }}
                    className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                      authMode === "login" 
                        ? "border-[#1a365d] text-[#1a365d]" 
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isEn ? "Login" : "Вход в систему"}
                  </button>
                  <button
                    onClick={() => { setAuthMode("register"); setLoginError(""); }}
                    className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                      authMode === "register" 
                        ? "border-[#1a365d] text-[#1a365d]" 
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isEn ? "Registration" : "Регистрация"}
                  </button>
                </div>

                {/* Auth Content */}
                <div className="relative overflow-hidden min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {isLoading && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col justify-center items-center bg-white/80 dark:bg-slate-900 z-10 backdrop-blur-xs"
                      >
                        <div className="relative w-12 h-12 flex justify-center items-center">
                          <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-[#1a365d] border-t-transparent animate-spin"></div>
                          <Server className="h-4 w-4 text-[#1a365d] animate-pulse" />
                        </div>
                        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                          {isEn ? "Connecting Server..." : "Подключение к серверу..."}
                        </p>
                      </motion.div>
                    )}

                    {!isLoading && authMode === "login" && (
                      <motion.form 
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleLoginSubmit} 
                        className="space-y-4"
                      >
                        {loginError && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-md text-xs border border-red-150 font-bold uppercase tracking-wide">
                            ⚠️ {loginError}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Login (Email)" : "Логин (Email)"}</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={loginUsername}
                              onChange={(e) => setLoginUsername(e.target.value)}
                              placeholder={isEn ? "Example: user" : "Например: user"}
                              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Password" : "Пароль"}</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type={showLoginPassword ? "text" : "password"}
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full text-xs pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                            <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition">
                               {showLoginPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </button>
                          </div>
                          <div className="flex justify-end mt-1">
                             <button type="button" onClick={() => setAuthMode("recovery")} className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold uppercase tracking-wider">
                               {isEn ? "Forgot Password?" : "Забыли пароль?"}
                             </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#0f172b] dark:bg-[#80add0] hover:bg-[#112543] dark:hover:bg-[#5a8da0] text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest py-3 rounded-md transition-all mt-6 shadow-sm"
                        >
                          {isEn ? "Authorize" : "Авторизоваться"}
                        </button>
                        
                      </motion.form>
                    )}

                    {!isLoading && authMode === "recovery" && (
                      <motion.form 
                        key="recovery"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="space-y-4 text-center mt-6"
                        onSubmit={handlePasswordRecoveryRequest}
                      >
                         <ShieldAlert className="w-12 h-12 text-[#1a365d] dark:text-[#80add0] mx-auto mb-2 opacity-50" />
                         <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEn ? "Password Recovery" : "Восстановление Пароля"}</h2>
                         <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mb-6 leading-relaxed">
                            {isEn ? "Enter your email address to receive a password reset link. The link will be valid for 1 hour." : "Укажите адрес электронной почты, привязанный к вашему аккаунту. Мы отправим ссылку для сброса пароля."}
                         </p>
                         
                         {recoveryMsg && (
                          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-md text-xs border border-emerald-150 font-bold uppercase tracking-wide">
                            {recoveryMsg}
                          </div>
                         )}

                         <div className="text-left mt-4">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Account Email" : "Email профиля"}</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="email"
                              required
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              placeholder={isEn ? "Example: user@mail.com" : "Например: user@mail.com"}
                              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                         </div>
                         
                         <button
                          type="submit"
                          className="w-full bg-[#1a365d] dark:bg-[#80add0] hover:bg-[#112543] dark:hover:bg-[#5a8da0] text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest py-3 rounded-md transition-all shadow-sm"
                         >
                           {isEn ? "Send Reset Code" : "Получить код"}
                         </button>

                         <button type="button" onClick={() => { setAuthMode("login"); setRecoveryMsg(""); }} className="text-xs text-slate-500 hover:text-slate-700 uppercase font-bold tracking-wider underline mt-4 inline-block">
                           {isEn ? "Return to Login" : "Вернуться ко входу"}
                         </button>
                      </motion.form>
                    )}

                    {!isLoading && authMode === "recovery_code" && (
                      <motion.form 
                        key="recovery_code"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                        className="space-y-4 text-center mt-6"
                        onSubmit={handlePasswordRecoveryVerify}
                      >
                         <ShieldCheck className="w-12 h-12 text-[#1a365d] dark:text-[#80add0] mx-auto mb-2 opacity-50" />
                         <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEn ? "Enter Recovery Code" : "Код Восстановления"}</h2>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-6">
                            {isEn ? `Sent to ${recoveryEmail}` : `Отправлено на ${recoveryEmail}`}
                         </p>
                         
                         {recoveryMsg && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-md text-xs border border-red-150 font-bold uppercase tracking-wide">
                            {recoveryMsg}
                          </div>
                         )}

                         <div className="text-left mt-4">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "6-Digit Code" : "6-Значный код"}</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={recoveryCodeInput}
                              onChange={(e) => setRecoveryCodeInput(e.target.value)}
                              placeholder={isEn ? "Example: 123456" : "Например: 123456"}
                              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-md focus:border-blue-500 focus:outline-hidden text-center font-mono tracking-[0.5em] font-bold"
                            />
                          </div>
                         </div>
                         
                         <button
                          type="submit"
                          className="w-full bg-[#1a365d] dark:bg-[#80add0] hover:bg-[#112543] dark:hover:bg-[#5a8da0] text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest py-3 rounded-md transition-all shadow-sm"
                         >
                           {isEn ? "Verify Code" : "Подтвердить код"}
                         </button>

                         <button type="button" onClick={() => { setAuthMode("recovery"); setRecoveryMsg(""); }} className="text-xs text-slate-500 hover:text-slate-700 uppercase font-bold tracking-wider underline mt-4 inline-block">
                           {isEn ? "Back to Email" : "Вернуться к Email"}
                         </button>
                      </motion.form>
                    )}

                    {!isLoading && authMode === "recovery_reset" && (
                      <motion.form 
                        key="recovery_reset"
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                        className="space-y-4 text-center mt-6"
                        onSubmit={handlePasswordRecoverySave}
                      >
                         <Key className="w-12 h-12 text-emerald-600 dark:text-emerald-500 mx-auto mb-2 opacity-80" />
                         <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEn ? "Create New Password" : "Создание Нового Пароля"}</h2>
                         <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mb-6 leading-relaxed">
                            {isEn ? "Ensure your new password contains at least 8 characters, including numbers and symbols." : "Убедитесь, что ваш новый пароль содержит не менее 8 символов, включая цифры и спецсимволы."}
                         </p>

                         {recoveryMsg && (
                          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-md text-xs border border-emerald-150 font-bold uppercase tracking-wide">
                            {recoveryMsg}
                          </div>
                         )}

                         <div className="text-left mt-4 text-slate-800 dark:text-slate-200 text-xs mb-4">
                           {isEn ? "Account:" : "Аккаунт:"} <strong className="font-mono">{recoveryEmail}</strong>
                         </div>

                         <div className="text-left">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "New Password" : "Новый пароль"}</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type={showRecoveryPassword ? "text" : "password"}
                              required
                              value={recoveryNewPassword}
                              onChange={(e) => setRecoveryNewPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full text-xs pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-md focus:border-blue-500 focus:outline-hidden transition-all duration-300"
                            />
                            <button
                               type="button"
                               onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                               className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                               {showRecoveryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                         </div>
                         
                         <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-md transition-all shadow-sm active:scale-[0.98]"
                         >
                           {isEn ? "Save Password" : "Сохранить пароль"}
                         </button>
                         <button type="button" onClick={() => { setAuthMode("login"); setRecoveryMsg(""); }} className="text-xs text-slate-500 hover:text-slate-700 uppercase font-bold tracking-wider underline mt-4 inline-block">
                           {isEn ? "Return to Login" : "Вернуться ко входу"}
                         </button>
                      </motion.form>
                    )}

                    {!isLoading && authMode === "register" && (
                      <motion.form 
                        key="register"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleRegisterSubmit} 
                        className="space-y-4"
                      >
                        {regError && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-md text-xs border border-red-150 font-bold uppercase tracking-wide">
                            ⚠️ {regError}
                          </div>
                        )}
                        {regSuccess && (
                          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md text-xs border border-emerald-250 font-bold uppercase tracking-wide">
                            ✓ {isEn ? "Your cabinet is successfully created! Switching to login..." : "Ваш кабинет успешно создан! Переключаем на вход..."}
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Full Name of Delegate" : "ФИО Делегата полностью"}</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder={isEn ? "Aliya Nurgazieva" : "Алия Нургазиева"}
                              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Email" : "Электронная почта (E-mail)"}</label>
                          <div className="relative">
                            <UserPlus className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="delegate2026@gmail.com"
                              className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">{isEn ? "Create a secure password" : "Придумайте надежный пароль"}</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type={showRegPassword ? "text" : "password"}
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder={isEn ? "Min 8 chars, 1 uppercase, 1 lowercase, 1 number" : "Мин. 8 симв., заглавная, строчная, цифра"}
                              className="w-full text-xs pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                            <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition">
                               {showRegPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </button>
                          </div>
                          <div className="mt-2 flex gap-1">
                            {[
                              { test: regPassword.length >= 8 },
                              { test: /[A-Z]/.test(regPassword) },
                              { test: /[a-z]/.test(regPassword) },
                              { test: /[0-9]/.test(regPassword) }
                            ].map((req, i) => (
                               <div key={i} className={`h-1 flex-1 rounded-full opacity-60 ${!regPassword ? 'bg-slate-200' : req.test ? 'bg-emerald-500' : 'bg-red-400'}`}></div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-start gap-2 pt-2">
                           <input type="checkbox" required id="regTerms" checked={regAgreeTerms} onChange={e => setRegAgreeTerms(e.target.checked)} className="mt-1" />
                           <label htmlFor="regTerms" className="text-[10px] text-slate-500 font-mono leading-tight">
                              {isEn ? "I have read and agree to the " : "Я ознакомился и согласен с "}
                              {setCurrentTab ? <button type="button" onClick={() => setCurrentTab("terms")} className="text-[#1a365d] hover:underline mx-0.5">{isEn ? "Terms of Service" : "Условиями использования"}</button> : (isEn ? "Terms of Service" : "Условиями использования")}
                              {isEn ? " and " : " и "}
                              {setCurrentTab ? <button type="button" onClick={() => setCurrentTab("privacy")} className="text-[#1a365d] hover:underline mx-0.5">{isEn ? "Privacy Policy" : "Политикой конфиденциальности"}</button> : (isEn ? "Privacy Policy" : "Политикой конфиденциальности")}
                              .
                           </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white dark:text-slate-100 font-bold text-xs uppercase tracking-widest py-3 rounded-md transition-all mt-6 shadow-sm"
                        >
                          {isEn ? "Register" : "Зарегистрироваться"}
                        </button>
                      </motion.form>
                    )}

                    {!isLoading && authMode === "verify" && (
                      <motion.form 
                        key="verify"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleVerifySubmit} 
                        className="space-y-4"
                      >
                        {verifyError && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-md text-xs border border-red-150 font-bold uppercase tracking-wide">
                            ⚠️ {verifyError}
                          </div>
                        )}
                        {verifyMsg && (
                          <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-xs border border-blue-200 font-bold uppercase tracking-wide">
                            ℹ️ {verifyMsg}
                            {verifyTestUrl && (
                              <div className="mt-2">
                                <a href={verifyTestUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-[10px]">
                                  {isEn ? "Open Ethereal Mail (Test OTP)" : "Открыть тестовое письмо с кодом"}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-center pt-2">
                           <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{isEn ? "Email Verification" : "Подтверждение Email"}</h3>
                           <p className="text-xs text-slate-500 mt-2">
                             {isEn ? `Please enter the 6-digit code sent to ${verifyEmail}` : `Войдите 6-значный код, отправленный на ${verifyEmail}`}
                           </p>
                        </div>

                        <div>
                          <div className="relative mt-4">
                            <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={verifyCode}
                              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full text-center tracking-[0.5em] text-lg font-mono py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#1a365d] dark:bg-[#80add0] hover:bg-[#112543] dark:hover:bg-[#5a8da0] text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest py-3 rounded-md transition-all mt-4 shadow-sm"
                        >
                          {isEn ? "Verify Account" : "Подтвердить аккаунт"}
                        </button>

                        <div className="text-center mt-4">
                          <button 
                            type="button" 
                            onClick={handleResendCode}
                            className="text-xs text-[#1a365d] dark:text-[#80add0] font-bold uppercase hover:underline"
                          >
                            {isEn ? "Resend Code" : "Отправить код повторно"}
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {!isLoading && authMode === "2fa" && (
                      <motion.form 
                        key="2fa"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleTwoFactorVerify} 
                        className="space-y-4"
                      >
                        {twoFactorMsg && (
                          <div className={`p-3 rounded-md text-xs border font-bold uppercase tracking-wide ${twoFactorMsg.includes('Invalid') || twoFactorMsg.includes('Error') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            {twoFactorMsg.includes('Invalid') || twoFactorMsg.includes('Error') ? '⚠️' : 'ℹ️'} {twoFactorMsg}
                          </div>
                        )}

                        <div className="text-center pt-2">
                           <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{isEn ? "Two-Factor Auth" : "Двухфакторная Авторизация"}</h3>
                           <p className="text-xs text-slate-500 mt-2">
                             {isEn ? `Please enter the 6-digit code sent to ${twoFactorPendingUser?.email}` : `Войдите 6-значный код, отправленный на ${twoFactorPendingUser?.email}`}
                           </p>
                        </div>

                        <div>
                          <div className="relative mt-4">
                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                            <input
                              type="text"
                              required
                              value={twoFactorCodeInput}
                              onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full text-center tracking-[0.5em] text-lg font-mono py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded-md focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#1a365d] dark:bg-[#80add0] hover:bg-[#112543] dark:hover:bg-[#5a8da0] text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest py-3 rounded-md transition-all mt-4 shadow-sm"
                        >
                          {isEn ? "Verify 2FA" : "Подтвердить 2FA"}
                        </button>

                        <div className="text-center mt-4">
                          <button 
                            type="button" 
                            onClick={() => setAuthMode('login')}
                            className="text-xs text-slate-500 font-bold uppercase hover:text-slate-700"
                          >
                            {isEn ? "Cancel" : "Отмена"}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Legal disclaimer */}
              <div className="pt-6 border-t mt-6 text-[10px] text-slate-400 font-serif text-justify leading-relaxed">
                {isEn 
                  ? "By registering on the website of the MUNKG Alliance, you consent to the processing of your personal data by the Secretariat of Kyrgyzstan exclusively for the academic purpose of organizing diplomatic simulations." 
                  : "Регистрируясь на сайте Альянса АМООНКР, вы даете согласие на обработку ваших персональных данных Секретариатом Кыргызстана исключительно в академических целях организации дипломатических игр."}
              </div>
            </div>

            {/* Welcome Side Panel */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1a365d] dark:from-[#0d1c33] dark:via-[#112543] dark:to-slate-900 border border-slate-950 dark:border-slate-800 text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-md">
              <div className="space-y-4">
                <div className="bg-[#c0a080]/20 text-[#c0a080] border border-[#c0a080]/30 rounded-full w-9 h-9 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-[#c0a080] tracking-tight uppercase">
                    {isEn ? "Academic Cabinet" : "Академический Кабинет"}
                  </h3>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-slate-350 mt-0.5">
                    {isEn ? "United League of Model UNs" : "Единая Лига Моделей ООН КР"}
                  </p>
                </div>
                <p className="text-xs text-slate-300 font-serif leading-relaxed text-justify">
                  {isEn 
                    ? "Welcome to your personal dashboard! This is your central hub for submitting applications, tracking their status in real time, and getting prompt technical support from the Secretariat."
                    : "Добро пожаловать в персональный кабинет! Это ваш центральный портал для подачи заявок, отслеживания их статуса в реальном времени и получения быстрой технической поддержки от Секретариата."}
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex gap-3 text-left">
                    <CheckCircle className="w-4 h-4 text-[#c0a080] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold font-sans uppercase text-slate-200">{isEn ? "Event Registration" : "Регистрация на Мероприятия"}</h4>
                      <p className="text-[11px] text-slate-350 font-serif leading-normal">
                        {isEn ? "Seamlessly apply for upcoming UN modeling conferences all in one place." : "Удобная подача заявок на участие в предстоящих конференциях и симуляциях в один клик."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <CheckCircle className="w-4 h-4 text-[#c0a080] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold font-sans uppercase text-slate-200">{isEn ? "Status Tracking" : "Отслеживание Статусов"}</h4>
                      <p className="text-[11px] text-slate-350 font-serif leading-normal">
                        {isEn ? "Monitor your delegate application status and receive immediate notifications upon approval." : "Просматривайте статус одобрения ваших заявок и получайте мгновенные уведомления о принятии."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <CheckCircle className="w-4 h-4 text-[#c0a080] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold font-sans uppercase text-slate-200">{isEn ? "Support & Appeals" : "Обращения и Поддержка"}</h4>
                      <p className="text-[11px] text-slate-350 font-serif leading-normal">
                        {isEn ? "Contact the Secretariat directly to resolve technical issues or submit appeals." : "Свяжитесь напрямую с руководством Ассоциации для оперативного решения любых вопросов."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-800">
                MUNKG ACADEMY • 2026
              </div>
            </div>

          </div>
        )}

        {/* 2. AUTHENTICATED: STANDARD USER PROFILE (NO ADMINISTRATIVE RIGHTS) */}
        {currentUser && userTab === 'dashboard' && (currentUser.role === "user" || currentUser.role === "organizer") && (
          <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{duration: 0.4}} className="max-w-4xl mx-auto space-y-6">
            {/* NEW: Unified Conference Management for Organizers */}
            {currentUser.role === "organizer" && (
              <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xs space-y-6 text-left border-indigo-100">
                <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-black text-indigo-900 dark:text-indigo-400 text-base uppercase tracking-wider">
                      {isEn ? "Conference Management & Analytics" : "Управление конференцией и статистика"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-serif">
                      {isEn ? "Manage dates, monitor applications, and oversee delegates." : "Управление датами, мониторинг заявок и статистика в одном месте."}
                    </p>
                  </div>
                </div>

                {(() => {
                  const myConferences = conferences.filter(c => c.creatorId === currentUser.id);

                  if (myConferences.length === 0) {
                    return (
                      <div className="text-center py-10 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-500 italic font-serif">
                          {isEn ? "You haven't created any conferences yet." : "Вы еще не создали ни одной конференции."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {myConferences.map(conf => {
                        const now = new Date();
                        let phase = 'open';
                        let phaseLabel = isEn ? 'Open Registration' : 'Регистрация открыта';
                        let colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';

                        if (conf.earlyBirdEndDate && new Date(conf.earlyBirdEndDate) > now) {
                          phase = 'early-bird';
                          phaseLabel = isEn ? 'Early Bird Active' : 'Ранняя регистрация';
                          colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
                        } else if (conf.standardEndDate && new Date(conf.standardEndDate) > now) {
                          phase = 'standard';
                          phaseLabel = isEn ? 'Standard Registration' : 'Стандартная регистрация';
                          colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                        } else if (conf.registrationDeadline && new Date(conf.registrationDeadline) < now) {
                          phase = 'closed';
                          phaseLabel = isEn ? 'Registration Closed' : 'Регистрация закрыта';
                          colorClass = 'bg-slate-200 text-slate-800 border-slate-300';
                        } else if (conf.registrationDeadline) {
                           const daysLeft = Math.ceil((new Date(conf.registrationDeadline).getTime() - now.getTime()) / (1000 * 3600 * 24));
                           if (daysLeft <= 3) {
                             phase = 'urgent';
                             phaseLabel = isEn ? `Deadline Approaching (${daysLeft} days)` : `Крайний срок (${daysLeft} дн)`;
                             colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
                           }
                        }

                        // Also count requests
                        const reqs = joinRequests.filter(r => r.conferenceId === conf.id);
                        const approved = reqs.filter(r => r.status === 'confirmed').length;
                        const pending = reqs.filter(r => r.status === 'pending' || r.status === 'awaiting_payment' || r.status === 'payment_review').length;
                        const rejected = reqs.filter(r => r.status === 'rejected').length;

                        return (
                          <div key={conf.id} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 shadow-2xs overflow-hidden">
                            
                            {/* Header row: Title + Phase badge */}
                            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                               <div>
                                 <h4 className="font-bold text-[#1a365d] dark:text-[#80add0] text-sm font-serif">{isEn ? (conf.nameEn || conf.name) : conf.name}</h4>
                                 <p className="text-[10px] text-slate-500 font-mono mt-0.5">{isEn ? (conf.locationEn || conf.location) : conf.location}</p>
                               </div>
                               <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border shrink-0 text-center ${colorClass}`}>
                                  {phaseLabel}
                               </span>
                            </div>

                            {/* Content grid */}
                            <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/40 dark:bg-slate-900/40">
                                {/* Left Side: Dates & Management Actions */}
                                <div className="md:col-span-5 flex flex-col justify-between space-y-5">
                                  <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wide font-sans font-bold space-y-1.5">
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded">
                                      <span className="text-slate-500">{isEn ? "Start Date" : "Начало"}</span> 
                                      <span className="text-slate-900 dark:text-white">{conf.startDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded">
                                      <span className="text-slate-500">{isEn ? "End Date" : "Конец"}</span> 
                                      <span className="text-slate-900 dark:text-white">{conf.endDate}</span>
                                    </div>
                                    {conf.earlyBirdStartDate && (
                                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded">
                                        <span className="text-slate-500">{isEn ? "Early Bird" : "Ранняя регистрация"}</span> 
                                        <span className="text-slate-700 dark:text-slate-300 font-mono text-[9px]">{conf.earlyBirdStartDate} - {conf.earlyBirdEndDate}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    {editingConfId !== conf.id && (
                                      <button
                                        onClick={() => startEditConference(conf)}
                                        className="flex-1 py-1.5 px-3 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition"
                                      >
                                        {isEn ? "Edit Dates" : "Даты"}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        const confStart = new Date(conf.startDate);
                                        const now = new Date();
                                        if (confStart > now) {
                                          if (confirm(isEn ? "Request deletion of this conference?" : "Запросить удаление этой конференции?")) {
                                            const ticketId = `ticket-${Date.now()}`;
                                            const newTicket = {
                                              id: ticketId,
                                              userId: currentUser.id,
                                              name: currentUser.name,
                                              email: currentUser.email,
                                              confId: conf.id,
                                              subject: `[DELETE REQUEST] ${conf.name}`,
                                              message: `Организатор просит удалить или досрочно завершить конференцию: ${conf.name} (ID: ${conf.id}).`,
                                              status: "Отправлено" as const,
                                              createdAt: new Date().toISOString()
                                            };
                                            setDeleteRequesting(conf.id);
                                            setTimeout(() => {
                                              const saved = localStorage.getItem("munakr_inquiries");
                                              const exTickets = saved ? JSON.parse(saved) : [];
                                              const updated = [newTicket, ...exTickets];
                                              localStorage.setItem("munakr_inquiries", JSON.stringify(updated));
                                              setTickets(updated); // Sync state
                                              
                                              showToast(isEn ? "Administrator request successfully sent!" : "Запрос администратору успешно отправлен!", "success");
                                              setDeleteRequesting(null);
                                            }, 1500);
                                          }
                                        } else {
                                          if (confirm(isEn ? "Are you sure you want to end or delete this conference?" : "Вы уверены, что хотите завершить или удалить конференцию?")) {
                                            deleteConference(conf.id);
                                            showToast(isEn ? "Conference deleted." : "Конференция завершена/удалена.", "success");
                                          }
                                        }
                                      }}
                                      disabled={deleteRequesting === conf.id}
                                      className={`flex-1 py-1.5 px-3 rounded flex items-center justify-center text-[10px] font-bold uppercase tracking-wider transition ${
                                        deleteRequesting === conf.id 
                                          ? "bg-red-50 text-red-400 cursor-not-allowed" 
                                          : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400"
                                      }`}
                                    >
                                      {deleteRequesting === conf.id ? (isEn ? "Wait..." : "Ждите...") : (isEn ? "Delete" : "Удалить")}
                                    </button>
                                  </div>
                                </div>

                                {/* Right Side: Analytics & Health */}
                                <div className="md:col-span-7 grid grid-cols-2 gap-4">
                                  <div className="bg-[#1a365d]/5 dark:bg-[#80add0]/10 rounded-xl p-4 flex flex-col items-center justify-center border border-[#1a365d]/10 dark:border-[#80add0]/20 gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className="text-[10px] font-bold text-[#1a365d] dark:text-[#80add0] uppercase tracking-widest mb-1 text-center">
                                        {isEn ? "Total Applications" : "Всего Заявок"}
                                      </div>
                                      <div className="text-4xl font-sans font-black text-[#1a365d] dark:text-[#80add0]">
                                        {approved + pending + rejected}
                                      </div>
                                    </div>
                                    {(() => {
                                      const cRatings = ratings.filter(r => r.conferenceId === conf.id);
                                      const ratingAvg = cRatings.length > 0 ? (cRatings.reduce((sum, r) => sum + r.rating, 0) / cRatings.length).toFixed(1) : "—";
                                      return (
                                        <div className="flex flex-col items-center border-t border-[#1a365d]/10 dark:border-[#80add0]/20 w-full pt-3 mt-1">
                                           <div className="flex items-center gap-1 text-[10px] font-bold text-[#c0a080] uppercase tracking-widest mb-1">
                                             <Award className="w-3.5 h-3.5" />
                                             {isEn ? "Rating" : "Рейтинг делегатов"}
                                           </div>
                                           <div className="text-xl font-sans font-bold text-slate-700 dark:text-slate-300">
                                              <span>{ratingAvg}</span>
                                              <span className="text-xs text-slate-400 font-normal ml-1">/ 5.0 ({cRatings.length})</span>
                                           </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  
                                  <div className="flex flex-col justify-center gap-2">
                                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 px-3 py-2 rounded-lg">
                                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">{isEn ? "Approved" : "Одобрено"}</span>
                                      <span className="font-sans text-emerald-800 dark:text-emerald-300 font-bold">{approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-3 py-2 rounded-lg">
                                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">{isEn ? "Pending" : "На рассмотрении"}</span>
                                      <span className="font-sans text-amber-800 dark:text-amber-300 font-bold">{pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 px-3 py-2 rounded-lg">
                                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">{isEn ? "Rejected" : "Отклонено"}</span>
                                      <span className="font-sans text-red-800 dark:text-red-300 font-bold">{rejected}</span>
                                    </div>
                                  </div>
                                </div>
                            </div>
                                  {editingConfId === conf.id && (
                                    <form onSubmit={handleAdminAddConference} className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 rounded-lg border shadow-xs space-y-3">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Start Date" : "Начало"}</label>
                                          <input type="date" required value={confStartDate} onChange={e => setConfStartDate(e.target.value)} className="w-full border rounded p-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "End Date" : "Конец"}</label>
                                          <input type="date" required value={confEndDate} onChange={e => setConfEndDate(e.target.value)} className="w-full border rounded p-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Early Bird Start" : "Ранняя (Начало)"}</label>
                                          <input type="date" value={confEarlyBirdStart} onChange={e => setConfEarlyBirdStart(e.target.value)} className="w-full border rounded p-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Early Bird End" : "Ранняя (Конец)"}</label>
                                          <input type="date" value={confEarlyBirdEnd} onChange={e => setConfEarlyBirdEnd(e.target.value)} className="w-full border rounded p-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100" />
                                        </div>
                                        <div className="col-span-2">
                                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Standard Reg Deadline" : "Крайний срок"}</label>
                                          <input type="date" value={confStandardEnd} onChange={e => setConfStandardEnd(e.target.value)} className="w-full border rounded p-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100" />
                                        </div>
                                      </div>
                                      <div className="flex gap-2 justify-end pt-2">
                                        <button type="button" onClick={() => setEditingConfId(null)} className="py-1.5 px-3 rounded text-[10px] font-bold uppercase bg-slate-200 hover:bg-slate-300 transition text-slate-800">{isEn ? "Cancel" : "Отмена"}</button>
                                        <button type="submit" className="py-1.5 px-3 rounded text-[10px] font-bold uppercase bg-[#1a365d] hover:bg-[#112543] text-white transition">{isEn ? "Save" : "Сохранить"}</button>
                                      </div>
                                    </form>
                                  )}

                            {/* Active Delete Request Alert */}
                            {(() => {
                              const delTicket = tickets.find(t => t.confId === conf.id && t.subject?.startsWith("[DELETE REQUEST]"));
                              if (!delTicket) return null;
                              return (
                                <div className="mx-5 mb-5 p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-red-800 text-[10px] uppercase">{isEn ? "Deletion Request:" : "Запрос на удаление:"}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      delTicket.status === "Отправлено" ? "bg-amber-100 text-amber-800" :
                                      delTicket.status === "Отвечено" || delTicket.status === "Закрыто" ? "bg-emerald-100 text-emerald-800" :
                                      "bg-slate-200 text-slate-800"
                                    }`}>
                                      {delTicket.status}
                                    </span>
                                  </div>
                                  {delTicket.reply && (
                                    <div className="mt-2 text-left bg-white p-2 rounded border border-red-100 shadow-xs">
                                      <p className="font-bold text-[10px] text-slate-700 mb-0.5 uppercase">{isEn ? "Secretariat Answer:" : "Ответ Секретариата:"}</p>
                                      <p className="text-slate-600 text-[11px]">{delTicket.reply}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Conference Creation Requests */}
            <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xs space-y-4 text-left">
               <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-serif font-black text-[#1a365d] text-base uppercase tracking-wider">
                    {isEn ? "My Conference Proposals" : "Заявки на создание конференции"} ({creationRequests.filter(r => r.userId === currentUser.id).length})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-serif">
                    {isEn ? "Proposals submitted to the Secretariat to host a new simulation." : "Заявки, поданные в Секретариат на организацию новой конференции."}
                  </p>
                </div>
              </div>

              {creationRequests.filter(r => r.userId === currentUser.id).length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                  <PlusCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 italic font-serif">
                    {isEn ? "You haven't submitted any conference proposals. Apply via the directory." : "Вы еще не подавали заявки на создание конференции. Вы можете предложить свою конференцию в календаре."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {creationRequests.filter(r => r.userId === currentUser.id).map(req => (
                    <div key={req.id} className="border rounded-lg p-4 bg-slate-50/30 dark:bg-slate-800/30">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-dashed pb-3 mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">{isEn ? (req.confData?.nameEn || translateToEn(req.confData?.name) || "Untitled") : (req.confData?.name || "Без названия")}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">{isEn ? (req.confData?.orgEn || translateToEn(req.confData?.org)) : req.confData?.org}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{isEn ? (req.confData?.locationEn || translateToEn(req.confData?.location)) : req.confData?.location}</p>
                          {req.confData?.committees && <p className="text-[9px] text-slate-400 font-mono uppercase">{isEn ? req.confData?.committees.map(c => translateToEn(c)).join(", ") : req.confData?.committees.join(", ")}</p>}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            req.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                            req.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              req.status === "approved" ? "bg-emerald-500" :
                              req.status === "rejected" ? "bg-red-500" :
                              "bg-amber-500 animate-pulse"
                            }`}></span>
                            {req.status === "approved" ? (isEn ? "Approved" : "Одобрено") : 
                             req.status === "rejected" ? (isEn ? "Rejected" : "Отклонено") : 
                             (isEn ? "Pending" : "На рассмотрении")}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-1 font-mono uppercase">{req.createdAt}</p>
                        </div>
                      </div>
                      {req.status === "rejected" && req.rejectionReason && (
                        <div className="bg-red-50 p-2.5 rounded border border-red-100 text-[11px] text-red-800 flex gap-2 items-start mt-2">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span><strong>{isEn ? "Reason for rejection:" : "Причина отказа:"}</strong> {req.rejectionReason}</span>
                        </div>
                      )}
                      {req.status === "pending" && (
                        <div className="mt-3 text-right">
                          <button
                            onClick={() => handleWithdrawCreationRequest(req.id)}
                            className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded uppercase font-bold tracking-wider transition"
                          >
                            {isEn ? "Withdraw Proposal" : "Отозвать заявку"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>



          </motion.div>
        )}

        {/* 3. AUTHENTICATED: SECRETARIAT ADMIN DASHBOARD */}
        {currentUser && userTab === 'dashboard' && (currentUser.role === "admin" || currentUser.role === "super_admin") && (
          <motion.div initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.5}} className="space-y-6">
            
            {/* Statistics Row Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 border text-left border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono leading-none text-slate-400 font-bold uppercase block">
                    Аналитических статей
                  </span>
                  <span className="text-3xl font-serif font-black text-slate-900 dark:text-slate-100 mt-1 block">
                    {posts.length}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#c0a080]" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border text-left border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono leading-none text-slate-400 font-bold uppercase block">
                    Симуляций в календаре
                  </span>
                  <span className="text-3xl font-serif font-black text-[#1a365d] mt-1 block">
                    {conferences.length}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#c0a080]" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border text-left border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono leading-none text-slate-400 font-bold uppercase block">
                    Входящих обращений
                  </span>
                  <span className="text-3xl font-serif font-black text-emerald-600 mt-1 block">
                    {tickets.length}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#c0a080]" />
                </div>
              </div>
            </div>

            {/* ADMIN SUB-TABS SELECTOR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex flex-wrap gap-2 shadow-2xs">
              {currentUser.role === "super_admin" && (
                <button
                  onClick={() => setAdminSubTab("dashboard")}
                  className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition ${
                    adminSubTab === "dashboard" 
                      ? "bg-[#1a365d] text-white" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isEn ? "Audit Log" : "Журнал аудита"}
                </button>
              )}
              
              <button
                onClick={() => setAdminSubTab("news")}
                className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition ${
                  adminSubTab === "news" 
                    ? "bg-[#1a365d] text-white" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {isEn ? "Reviews Management" : "Управление обзорами"} ({posts.length})
              </button>
              
              <button
                onClick={() => setAdminSubTab("conferences")}
                className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition ${
                  adminSubTab === "conferences" 
                    ? "bg-[#1a365d] text-white" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {isEn ? "Conferences Registry" : "Реестр Конференций КР"} ({conferences.length})
              </button>

              <button
                onClick={() => setAdminSubTab("tickets")}
                className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 ${
                  adminSubTab === "tickets" 
                    ? "bg-slate-950 text-white" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {isEn ? "Citizen Appeals" : "Обращения граждан"} ({tickets.filter(t => !t.subject?.startsWith("[DELETE REQUEST]")).length})
                {tickets.some(t => !t.subject?.startsWith("[DELETE REQUEST]") && t.status === "Отправлено") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setAdminSubTab("create_requests")}
                className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 ${
                  adminSubTab === "create_requests" 
                    ? "bg-emerald-700 text-white" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {isEn ? "Conf. Requests" : "Заявки на Конференции"} ({creationRequests.filter(r => r.status === "pending").length})
                {creationRequests.some(r => r.status === "pending") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setAdminSubTab("delete_requests")}
                className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 ${
                  adminSubTab === "delete_requests" 
                    ? "bg-red-700 text-white" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {isEn ? "Conf. Deletion" : "Запросы на удал."} ({tickets.filter(t => t.subject?.startsWith("[DELETE REQUEST]") && t.status === "Отправлено").length})
                {tickets.some(t => t.subject?.startsWith("[DELETE REQUEST]") && t.status === "Отправлено") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>

              {currentUser.role === "super_admin" && (
                <button
                  onClick={() => setAdminSubTab("admins")}
                  className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 ${
                    adminSubTab === "admins" 
                      ? "bg-purple-700 text-white" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isEn ? "Manage Admins" : "Управление Админами"}
                </button>
              )}

              {currentUser.role === "super_admin" && (
                <button
                  onClick={() => setAdminSubTab("security")}
                  className={`py-2 px-5 rounded text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 ${
                    adminSubTab === "security" 
                      ? "bg-red-700 text-white" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {isEn ? "Security Center" : "Центр Безопасности"}
                  {(() => {
                    const savedUsers = localStorage.getItem("munakr_registered_users");
                    if (savedUsers) {
                      try {
                        const parsed = JSON.parse(savedUsers);
                        if (parsed.some((u: any) => u.status === "banned_temporary" && (u.adminReason || "").includes("System Auto-Ban"))) {
                          return <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>;
                        }
                      } catch(e) {}
                    }
                    return null;
                  })()}
                </button>
              )}
            </div>

            {/* SUB-TAB CONTENTS: 0. DASHBOARD TIMELINE */}
            {adminSubTab === "dashboard" && currentUser.role === "super_admin" && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xs text-left">
                  {(() => {
                        const chartData = conferences.map(conf => ({
                           name: isEn && conf.nameEn ? conf.nameEn : conf.name,
                           participants: joinRequests.filter(r => r.conferenceId === conf.id).length
                        })).filter(item => item.participants > 0);
                        
                        return (
                          <>
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                  <BarChartIcon className="w-5 h-5 text-[#1a365d] dark:text-[#80add0]" />
                                </div>
                                <div>
                                  <h3 className="font-sans font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-sm">
                                    {isEn ? "Registration Analytics" : "Статистика Регистраций"}
                                  </h3>
                                  <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">
                                    {isEn ? "LIVE OVERVIEW" : "ОБЗОР В РЕАЛЬНОМ ВРЕМЕНИ"}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                   const csvRows = [];
                                   const headers = [isEn ? "Conference Name" : "Название конференции", isEn ? "Participants" : "Участники"];
                                   csvRows.push(headers.join(";"));
                                   chartData.forEach(row => {
                                      const name = `"${String(row.name).replace(/"/g, '""')}"`;
                                      csvRows.push(`${name};${row.participants}`);
                                   });
                                   const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
                                   const encodedUri = encodeURI(csvContent);
                                   const link = document.createElement("a");
                                   link.setAttribute("href", encodedUri);
                                   link.setAttribute("download", `conference_report_${new Date().toISOString().slice(0,10)}.csv`);
                                   document.body.appendChild(link);
                                   link.click();
                                   document.body.removeChild(link);
                                }}
                                className="py-1.5 px-4 bg-[#1a365d] hover:bg-[#1a365d]/90 text-white text-[10px] font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                {isEn ? "Download CSV" : "Скачать CSV"}
                              </button>
                            </div>
                            
                            <div className="w-full">
                              {chartData.length === 0 ? (
                                 <div className="py-16 flex flex-col items-center justify-center text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                   <BarChartIcon className="w-8 h-8 text-slate-300 mb-2" />
                                   {isEn ? "No registration data available." : "Нет данных о регистрациях."}
                                 </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Quick Metrics */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                     <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex border-l-4 border-l-[#1a365d]">
                                        <div className="flex flex-col justify-center">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{isEn ? "Total Apps" : "Всего заявок"}</span>
                                          <span className="text-2xl font-black font-sans text-[#1a365d] dark:text-[#80add0]">{joinRequests.length}</span>
                                        </div>
                                     </div>
                                     <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex border-l-4 border-l-emerald-500">
                                        <div className="flex flex-col justify-center">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{isEn ? "Active Confs" : "Акт. конференции"}</span>
                                          <span className="text-2xl font-black font-sans text-emerald-600 dark:text-emerald-400">{chartData.length}</span>
                                        </div>
                                     </div>
                                     <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex border-l-4 border-l-violet-500">
                                        <div className="flex flex-col justify-center">
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{isEn ? "Avg per Conf" : "В ср. на одну"}</span>
                                          <span className="text-2xl font-black font-sans text-violet-600 dark:text-violet-400">{Math.round(joinRequests.length / Math.max(1, chartData.length))}</span>
                                        </div>
                                     </div>
                                  </div>
                                  
                                  {/* Chart Container */}
                                  <div className="h-72 w-full pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#8b98a9', fontWeight: 600}} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis tick={{fontSize: 10, fill: '#8b98a9', fontWeight: 600}} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                           cursor={{fill: '#f8fafc', opacity: 0.1}} 
                                           contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#f8fafc', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'}} 
                                           itemStyle={{color: '#38bdf8'}}
                                           labelStyle={{color: '#94a3b8', marginBottom: '4px'}}
                                        />
                                        <Bar dataKey="participants" name={isEn ? "Participants" : "Участников"} fill="#1a365d" radius={[4, 4, 0, 0]} barSize={40} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                  })()}
                </div>

                <div className="bg-white dark:bg-slate-900 border text-left rounded-xl p-6 shadow-xs space-y-6">
                  <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-black text-[#1a365d] uppercase tracking-tight flex items-center gap-2">
                       <LayoutDashboard className="w-6 h-6 text-[#c0a080]" />
                       {isEn ? "Audit Log Timeline" : "Журнал аудита"}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono tracking-wider mt-1">{isEn ? "Recent administrative platform actions" : "Последние административные действия на платформе"}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <input
                      type="text"
                      placeholder={isEn ? "Search keywords..." : "Поиск по словам..."}
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-2 focus:outline-hidden focus:border-[#1a365d] grow sm:grow-0"
                    />
                    <select
                      value={auditFilterDate}
                      onChange={(e) => setAuditFilterDate(e.target.value)}
                      className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-2 focus:outline-hidden focus:border-[#1a365d]"
                    >
                      <option value="All">{isEn ? "All Time" : "За всё время"}</option>
                      <option value="Today">{isEn ? "Today" : "Сегодня"}</option>
                      <option value="Week">{isEn ? "Last 7 Days" : "За 7 дней"}</option>
                      <option value="Month">{isEn ? "Last 30 Days" : "За 30 дней"}</option>
                    </select>
                    <select
                      value={auditFilterType}
                      onChange={(e) => setAuditFilterType(e.target.value)}
                      className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-2 focus:outline-hidden focus:border-[#1a365d]"
                    >
                      <option value="All">{isEn ? "All Actions" : "Все действия"}</option>
                      <option value="Account">{isEn ? "Account Actions" : "Система аккаунтов"}</option>
                      <option value="News">{isEn ? "News Content" : "Новости"}</option>
                      <option value="Conference">{isEn ? "Conferences" : "Конференции"}</option>
                      <option value="Other">{isEn ? "Other" : "Другое"}</option>
                    </select>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const logsStr = localStorage.getItem("munakr_admin_logs") || "[]";
                          let logs: AdminActionLog[] = [];
                          try {
                            logs = JSON.parse(logsStr).sort((a: any, b: any) => b.timestamp - a.timestamp);
                          } catch(err) {
                            logs = [];
                          }
                          
                          // Apply filters
                          if (auditFilterType !== "All") {
                            logs = logs.filter(l => (l.category || "Account") === auditFilterType);
                          }
                          if (auditFilterDate !== "All") {
                            const now = Date.now();
                            if (auditFilterDate === "Today") {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              logs = logs.filter(l => l.timestamp >= today.getTime());
                            } else if (auditFilterDate === "Week") {
                              logs = logs.filter(l => now - l.timestamp <= 7 * 24 * 60 * 60 * 1000);
                            } else if (auditFilterDate === "Month") {
                              logs = logs.filter(l => now - l.timestamp <= 30 * 24 * 60 * 60 * 1000);
                            }
                          }
                          if (auditSearchQuery) {
                             const q = auditSearchQuery.toLowerCase();
                              logs = logs.filter(l => 
                               (l.reason && l.reason.toLowerCase().includes(q)) || 
                               (l.comment && l.comment.toLowerCase().includes(q)) || 
                               (l.actionType && l.actionType.toLowerCase().includes(q)) || 
                               (l.targetUserEmail && l.targetUserEmail.toLowerCase().includes(q)) || 
                               (l.adminName && l.adminName.toLowerCase().includes(q))
                            );
                          }

                          if (logs.length === 0) {
                            showToast(isEn ? "No logs to download" : "Нет записей для скачивания", "info");
                            return;
                          }
                          const headers = ["ID,Date,Time,Admin,Target,Action,Category,Reason,Comment"];
                          const rows = logs.map(log => {
                            const d = new Date(log.timestamp);
                            return `${log.id},${d.toLocaleDateString()},${d.toLocaleTimeString()},"${log.adminName}","${log.targetUserEmail}","${log.actionType}","${log.category || "Account"}","${log.reason}","${log.comment}"`;
                          });
                          const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `audit_log_${new Date().getTime()}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isEn ? "CSV" : "Скачать CSV"}
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            title: isEn ? "Clear Old Records" : "Очистить старые записи",
                            message: isEn ? "Are you sure you want to delete audit logs older than 30 days? This action cannot be undone." : "Вы уверены, что хотите удалить записи журнала старше 30 дней? Это действие нельзя отменить.",
                            onConfirm: () => {
                              const logsStr = localStorage.getItem("munakr_admin_logs") || "[]";
                              let logs: AdminActionLog[] = [];
                              try {
                                logs = JSON.parse(logsStr).sort((a: any, b: any) => b.timestamp - a.timestamp);
                              } catch(err) {
                                logs = [];
                              }
                              const now = Date.now();
                              const filteredLogs = logs.filter(l => now - l.timestamp <= 30 * 24 * 60 * 60 * 1000);
                              localStorage.setItem("munakr_admin_logs", JSON.stringify(filteredLogs));
                              showToast(isEn ? "Old records cleared" : "Старые записи очищены", "success");
                              // Set timestamp to trigger re-render or wait for next render
                              setAuditFilterDate("All"); // just to trigger something if needed, but it works directly since we render from localStorage
                            }
                          });
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isEn ? "Clear < 30D" : "Очистить < 30 дн"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-4">
                  {(() => {
                     const logsStr = localStorage.getItem("munakr_admin_logs") || "[]";
                     let logs: AdminActionLog[] = [];
                     try {
                       logs = JSON.parse(logsStr).sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 50);
                     } catch(err) {
                       logs = [];
                     }
                     
                     if (auditFilterType !== "All") {
                       logs = logs.filter(l => (l.category || "Account") === auditFilterType);
                     }
                     if (auditFilterDate !== "All") {
                       const now = Date.now();
                       if (auditFilterDate === "Today") {
                         const today = new Date();
                         today.setHours(0, 0, 0, 0);
                         logs = logs.filter(l => l.timestamp >= today.getTime());
                       } else if (auditFilterDate === "Week") {
                         logs = logs.filter(l => now - l.timestamp <= 7 * 24 * 60 * 60 * 1000);
                       } else if (auditFilterDate === "Month") {
                         logs = logs.filter(l => now - l.timestamp <= 30 * 24 * 60 * 60 * 1000);
                       }
                     }
                     if (auditSearchQuery) {
                       const q = auditSearchQuery.toLowerCase();
                       logs = logs.filter(l => 
                         (l.reason && l.reason.toLowerCase().includes(q)) || 
                         (l.comment && l.comment.toLowerCase().includes(q)) || 
                         (l.actionType && l.actionType.toLowerCase().includes(q)) || 
                         (l.targetUserEmail && l.targetUserEmail.toLowerCase().includes(q)) || 
                         (l.adminName && l.adminName.toLowerCase().includes(q))
                       );
                     }
                     
                     if (logs.length === 0) {
                        return <div className="ml-6 flex items-center gap-2 text-sm text-slate-500 h-20"><Info className="w-5 h-5"/> {isEn ? "No actions recorded yet." : "Действия пока не записаны."}</div>;
                     }

                     return logs.map((log) => {
                       const d = new Date(log.timestamp);
                       const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                       const dateStr = d.toLocaleDateString();
                       
                             const isBan = log.actionType && (log.actionType.includes("ban") || log.actionType === "restrict" || log.actionType.includes("delete"));
                       const isCritical = log.actionType === "change_role";
                       const isNews = log.category === "News";
                       const isConf = log.category === "Conference";
                       
                       return (
                         <div key={log.id} className="relative ml-8 group">
                           {/* Timeline Dot & Icon */}
                           <div className={`absolute -left-[49px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-50 dark:border-slate-950 ${
                             isBan || isCritical ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 
                             isNews ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 
                             isConf ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 
                             'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                           } shadow-sm z-10 transition-transform group-hover:scale-110`}>
                             {isBan || isCritical ? <AlertTriangle className="w-3.5 h-3.5" /> :
                              isNews ? <FileText className="w-3.5 h-3.5" /> :
                              isConf ? <Calendar className="w-3.5 h-3.5" /> :
                              <CheckCircle2 className="w-3.5 h-3.5" />}
                           </div>
                           <div className={`bg-white dark:bg-slate-900 border ${
                             isCritical ? 'border-red-200 dark:border-red-900/50 hover:border-red-300' : 
                             'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                             } rounded-xl p-5 shadow-xs hover:shadow-md transition duration-300 relative overflow-hidden`}>
                              {isCritical && <div className="absolute inset-0 bg-red-50/40 dark:bg-red-900/5 pointer-events-none" />}
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4 relative z-10">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`font-black text-[11px] uppercase tracking-wider ${isCritical ? 'text-red-700 dark:text-red-400' : 'text-[#1a365d] dark:text-[#80add0]'}`}>
                                      {log.actionType ? String(log.actionType).replace(/_/g, ' ') : "ACTION"}
                                    </span>
                                    <span className="bg-slate-50 dark:bg-slate-800 text-[9px] px-2 py-0.5 rounded-full font-mono uppercase text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                      {log.category || "Account"}
                                    </span>
                                  </div>
                                  <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                    {isEn ? "Target:" : "Цель:"} <span className={`font-bold ml-1 text-slate-900 dark:text-slate-100 ${!isNews && !isConf ? "tracking-tight" : ""}`}>{log.targetUserEmail}</span>
                                  </p>
                                </div>
                                <div className="flex flex-col sm:items-end md:shrink-0">
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800/80 px-2.5 py-1.5 rounded-lg">
                                    <Clock className="w-3 h-3" />
                                    <span>{dateStr} &bull; {timeStr}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3 relative z-10">
                                <div className="flex gap-2.5 text-[12px] text-slate-700 dark:text-slate-300">
                                  <div className="font-medium">
                                    <span className="font-bold mr-1 text-slate-400 uppercase tracking-widest text-[9px]">{isEn ? "REASON:" : "ПРИЧИНА:"}</span>
                                    <span className="font-sans ml-1 text-[13px]">{log.reason}</span>
                                  </div>
                                </div>
                                {log.comment && (
                                  <div className="mt-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 border border-slate-100 dark:border-slate-800/60 flex flex-col gap-1.5 relative">
                                     <Quote className="absolute top-2 right-2 w-6 h-6 text-slate-200 dark:text-slate-700/50" />
                                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{isEn ? "Commentary" : "Коментарий"}</span>
                                     <p className="font-serif text-[14px] leading-relaxed text-slate-700 dark:text-slate-300 tracking-wide font-medium relative z-10">
                                       {log.comment}
                                     </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 relative z-10">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                     <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                  </div>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {log.adminName}
                                  </span>
                                </div>
                                {log.expiryDate && (
                                  <span className="font-mono bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded border border-red-100 dark:border-red-900/50">
                                    Exp: {new Date(log.expiryDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                           </div>
                         </div>
                       );
                     });
                  })()}
                </div>
              </div>
            </div>
            )}

            {/* SUB-TAB CONTENTS: 1. NEWS CONTROL SUITE */}
            {adminSubTab === "news" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form to submit news directly from Admin tab */}
                <div className="lg:col-span-12 xl:col-span-5 bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <h3 className="font-serif font-black text-sm text-[#1a365d] uppercase tracking-wider">
                      {editingPostId ? "📝 Редактировать публикацию" : "Опубликовать в Аналитику АМООНКР"}
                    </h3>
                    {editingPostId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPostId(null);
                          setNewTitle("");
                          setNewExcerpt("");
                          setNewContent("");
                          setNewAuthor("");
                          setNewImage("");
                        }}
                        className="text-[10px] text-red-500 hover:underline hover:text-red-700 font-bold uppercase"
                      >
                        Отмена
                      </button>
                    )}
                  </div>

                  {postAddedMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded text-xs font-bold uppercase tracking-wide">
                      {editingPostId ? "Статья успешно обновлена!" : "Статья успешно добавлена и сохранена!"}
                    </div>
                  )}

                  <form onSubmit={handleAdminAddPost} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Заголовок *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Например: Продвижение Кыргызстана в совете ООН"
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">ФИО Автора *</label>
                      <input
                        type="text"
                        required
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="Джамиль Туйгунов"
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Категория</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as NewsPost["category"])}
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        >
                          <option value="Security">Совет Безопасности (Security Council)</option>
                          <option value="Human Rights">Права человека (Human Rights)</option>
                          <option value="Environment">Окружающая среда (Environment)</option>
                          <option value="MUN News">Новости Модели (MUN News)</option>
                          <option value="Delegate Guide">Руководство делегата (Delegate Guide)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Баннер статьи (Картинка)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-xs border rounded p-1.5 focus:border-[#1a365d] focus:outline-hidden file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                        />
                        {newImage && newImage.startsWith("data:image") && (
                           <div className="mt-2 flex justify-start">
                             <img src={newImage} alt="Preview" className="h-16 w-auto object-cover rounded shadow" />
                             <button type="button" onClick={() => setNewImage("")} className="ml-2 text-[10px] text-red-500 hover:underline">Очистить</button>
                           </div>
                        )}
                        {newImage && !newImage.startsWith("data:image") && (
                           <div className="mt-2 flex justify-start">
                             <img src={newImage} alt="Preview" className="h-16 w-auto object-cover rounded shadow" />
                             <button type="button" onClick={() => setNewImage("")} className="ml-2 text-[10px] text-red-500 hover:underline">Очистить</button>
                           </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Краткий анонс</label>
                      <input
                        type="text"
                        value={newExcerpt}
                        onChange={(e) => setNewExcerpt(e.target.value)}
                        placeholder="Краткое вступительное содержание статьи..."
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      />
                    </div>

                    <div className="md-editor-container" data-color-mode="light">
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Текст статьи *</label>
                      <MDEditor
                        value={newContent}
                        onChange={(val) => setNewContent(val || "")}
                        preview="edit"
                        height={200}
                        textareaProps={{
                          placeholder: "Напишите текст доклада здесь..."
                        }}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewsEnFields(!showNewsEnFields)}
                        className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded border transition ${showNewsEnFields ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        {showNewsEnFields ? "− Скрыть английскую версию" : "+ Добавить английскую версию (опционально)"}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showNewsEnFields && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3.5 border-l-2 border-[#1a365d] pl-4 py-2 overflow-hidden"
                        >
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-[#1a365d]"></div>
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Английская версия (English Version)</span>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Заголовок (EN)</label>
                            <input
                              type="text"
                              value={newTitleEn}
                              onChange={(e) => setNewTitleEn(e.target.value)}
                              placeholder="Title in English"
                              className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Краткий анонс (EN)</label>
                            <input
                              type="text"
                              value={newExcerptEn}
                              onChange={(e) => setNewExcerptEn(e.target.value)}
                              placeholder="Short excerpt in English"
                              className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Автор (EN)</label>
                            <input
                              type="text"
                              value={newAuthorEn}
                              onChange={(e) => setNewAuthorEn(e.target.value)}
                              placeholder="Author name in English"
                              className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                            />
                          </div>
                          <div className="md-editor-container" data-color-mode="light">
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">Текст статьи (EN)</label>
                            <MDEditor
                              value={newContentEn}
                              onChange={(val) => setNewContentEn(val || "")}
                              preview="edit"
                              height={200}
                              textareaProps={{
                                placeholder: "News content in English..."
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      className="w-full bg-[#1a365d] hover:bg-[#112543] text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded transition"
                    >
                      {editingPostId ? "Сохранить изменения" : "Глобально опубликовать"}
                    </button>
                  </form>
                </div>

                {/* News Delete Feed */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs">
                  <div className="border-b pb-2 mb-4">
                    <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Архив новостных публикаций ({posts.length})
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {posts.map((post) => (
                      <div key={post.id} className="border p-3 rounded-lg flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <div className="text-left text-xs min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border font-bold">
                              {trans[post.category] || post.category}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">{post.date}</span>
                          </div>
                          <h4 className="font-sans font-bold text-slate-900 dark:text-slate-100 truncate">{post.title}</h4>
                          <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">{(isEn && post.authorEn ? post.authorEn : (post.author || "")).split(",")[0]}</p>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEditPost(post)}
                            className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-blue-600 p-2 rounded transition"
                            title="Редактировать статью"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                            title="Удалить новость"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* SUB-TAB CONTENTS: 2. CONFERENCES CONTROL SUITE */}
            {adminSubTab === "conferences" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form to submit conference */}
                <div className="lg:col-span-12 xl:col-span-5 bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs space-y-4">
                  <div className="border-b pb-2 flex items-center justify-between">
                    <h3 className="font-serif font-black text-sm text-[#1a365d] uppercase tracking-wider">
                      {editingConfId 
                        ? (isEn ? "📝 Edit Simulation" : "📝 Редактировать симуляцию") 
                        : (isEn ? "Announce Conference" : "Анонсировать конференцию КР")}
                    </h3>
                    {editingConfId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingConfId(null);
                          setConfName("");
                          setConfOrg("");
                          setConfLocation("");
                          setConfFee("");
                          setConfDesc("");
                        }}
                        className="text-[10px] text-red-500 hover:underline hover:text-red-700 font-bold uppercase"
                      >
                        {isEn ? "Cancel" : "Отмена"}
                      </button>
                    )}
                  </div>

                  {confAddedMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded text-xs font-bold uppercase tracking-wide">
                      {editingConfId 
                        ? (isEn ? "Conference parameters saved!" : "Параметры конференции сохранены!") 
                        : (isEn ? "Conference successfully announced to the Calendar!" : "Конференция успешно анонсирована в Календарь!")}
                    </div>
                  )}

                  <form onSubmit={handleAdminAddConference} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Model Name (MUN) *" : "Название Модели (MUN) *"}</label>
                      <input
                        type="text"
                        required
                        value={confName}
                        onChange={(e) => setConfName(e.target.value)}
                        placeholder="Например: Issyk-Kul Youth MUN 2026"
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Organizer *" : "Организатор *"}</label>
                        <input
                          type="text"
                          required
                          value={confOrg}
                          onChange={(e) => setConfOrg(e.target.value)}
                          placeholder={isEn ? "Example: MUNKG Secretariat" : "Пример: Секретариат АМООНКР"}
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Physical Location *" : "Физическая локация *"}</label>
                        <input
                          type="text"
                          required
                          value={confLocation}
                          onChange={(e) => setConfLocation(e.target.value)}
                          placeholder={isEn ? "Example: Osh, OshSU" : "Например: г. Ош, ОшГУ"}
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Reg. Fee *" : "Рег. взнос *"}</label>
                        <input
                          type="text"
                          required
                          value={confFee}
                          onChange={(e) => setConfFee(e.target.value)}
                          placeholder="Пример: 600 KGS"
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Status" : "Статус"}</label>
                        <select
                          value={confType}
                          onChange={(e) => setConfType(e.target.value as MUNConference["type"])}
                          className="w-full text-xs border rounded p-2 focus:border-[#1a365d] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        >
                          <option value="International">International</option>
                          <option value="National">National</option>
                          <option value="Regional">Regional</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Active Committees (comma separated) *" : "Активные Комитеты (через запятую) *"}</label>
                      <input
                        type="text"
                        required
                        value={confCommittees}
                        onChange={(e) => setConfCommittees(e.target.value)}
                        placeholder="UNSC, GA, HRC..."
                        className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                      />
                    </div>
                    
                    {/* Conference Dates Configuration */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                      <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                        {isEn ? "Conference Dates & Deadlines" : "Даты конференции и дедлайны"}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Start Date" : "Начало конференции"}</label>
                          <input type="date" value={confStartDate} onChange={e => setConfStartDate(e.target.value)} className="w-full border rounded p-1.5" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "End Date" : "Конец конференции"}</label>
                          <input type="date" value={confEndDate} onChange={e => setConfEndDate(e.target.value)} className="w-full border rounded p-1.5" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Early Bird Start" : "Начало ранней регистрации"}</label>
                          <input type="date" value={confEarlyBirdStart} onChange={e => setConfEarlyBirdStart(e.target.value)} className="w-full border rounded p-1.5" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Early Bird End" : "Конец ранней регистрации"}</label>
                          <input type="date" value={confEarlyBirdEnd} onChange={e => setConfEarlyBirdEnd(e.target.value)} className="w-full border rounded p-1.5" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "Standard Phase End" : "Конец стандартной фазы"}</label>
                          <input type="date" value={confStandardEnd} onChange={e => setConfStandardEnd(e.target.value)} className="w-full border rounded p-1.5" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">{isEn ? "General Registration Deadline" : "Общий дедлайн регистрации"}</label>
                          <input type="date" value={confRegDeadline} onChange={e => setConfRegDeadline(e.target.value)} className="w-full border rounded p-1.5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Agendas and Description" : "Повестки дня и описание"}</label>
                      <div className="mb-2" data-color-mode="light">
                        <MDEditor
                          value={confDesc}
                          onChange={(val) => setConfDesc(val || "")}
                          preview="edit"
                          height={150}
                          textareaProps={{
                            placeholder: isEn ? "Describe simulated committees and agenda..." : "Опишите симулируемые комитеты и повестку..."
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowConfEnFields(!showConfEnFields)}
                        className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded border transition ${showConfEnFields ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        {showConfEnFields ? (isEn ? "− Hide English Version" : "− Скрыть английскую версию") : (isEn ? "+ Add English Version (Optional)" : "+ Добавить английскую версию (опционально)")}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showConfEnFields && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3.5 border-l-2 border-[#1a365d] pl-4 py-2 overflow-hidden"
                        >
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-[#1a365d]"></div>
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Английская версия (English Version)</span>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Conference Name (EN)" : "Название конференции (EN)"}</label>
                            <input
                              type="text"
                              value={confNameEn}
                              onChange={(e) => setConfNameEn(e.target.value)}
                              placeholder="e.g. Issyk-Kul Youth MUN 2026"
                              className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Organizer (EN)" : "Организатор (EN)"}</label>
                              <input
                                type="text"
                                value={confOrgEn}
                                onChange={(e) => setConfOrgEn(e.target.value)}
                                placeholder="e.g. MUNKG Secretariat"
                                className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Location (EN)" : "Физическая локация (EN)"}</label>
                              <input
                                type="text"
                                value={confLocationEn}
                                onChange={(e) => setConfLocationEn(e.target.value)}
                                placeholder="e.g. Osh, OshSU"
                                className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Committees (EN, comma separated)" : "Комитеты (EN, через запятую)"}</label>
                            <input
                              type="text"
                              value={confCommitteesEn}
                              onChange={(e) => setConfCommitteesEn(e.target.value)}
                              placeholder="e.g. UNSC, GA, HRC..."
                              className="w-full text-xs border rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-0.5">{isEn ? "Description (EN)" : "Повестки дня и описание (EN)"}</label>
                            <div data-color-mode="light">
                              <MDEditor
                                value={confDescEn}
                                onChange={(val) => setConfDescEn(val || "")}
                                preview="edit"
                                height={150}
                                textareaProps={{
                                  placeholder: "Describe simulated committees and agenda in English..."
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      className="w-full bg-[#1a365d] hover:bg-[#112543] text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded transition"
                    >
                      {editingConfId ? (isEn ? "Save Changes" : "Сохранить изменения") : (isEn ? "Save and Announce" : "Сохранить и анонсировать")}
                    </button>
                  </form>
                </div>

                {/* Conferences list to delete */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-xs">
                  <div className="border-b pb-2 mb-4">
                    <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      {isEn ? "Active MUN Calendar" : "Действующий Календарь Моделей"} ({conferences.length})
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {conferences.map((conf) => (
                      <div key={conf.id} className="border p-3 rounded-lg flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <div className="text-left text-xs min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-mono uppercase bg-slate-100 text-[#1a365d] px-1.5 py-0.5 rounded border font-bold">
                              {isEn ? (conf.type === "International" ? "International" : conf.type === "Regional" ? "Regional" : "National") : (conf.type === "International" ? "Международная" : conf.type === "Regional" ? "Региональная" : "Национальная")}
                            </span>
                          </div>
                          <h4 className="font-sans font-bold text-slate-900 dark:text-slate-100 truncate">{isEn ? (conf.nameEn || translateToEn(conf.name)) : conf.name}</h4>
                          <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">{isEn ? (conf.locationEn || translateToEn(conf.location)) : conf.location} • {isEn ? translateToEn(conf.registrationFee) : conf.registrationFee}</p>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEditConference(conf)}
                            className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-blue-600 p-2 rounded transition"
                            title="Редактировать симуляцию"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteConference(conf.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition shrink-0"
                            title="Удалить конференцию"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* SUB-TAB CONTENTS: 3. SUPPORT TICKETS INBOX */}
            {adminSubTab === "tickets" && (
              <div className="bg-white dark:bg-slate-900 border text-left rounded-xl p-6 shadow-xs max-w-5xl mx-auto">
                <div className="border-b pb-3 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-serif font-black text-[#1a365d] uppercase tracking-wider">
                      {isEn ? "Inbox Appeals & Tech Support MUNKG" : "Входящие Обращения & Техподдержка MUNKG"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-serif">
                      Данные обращения пользователи заполняют в разделе «Контакты». Копии автоматически транслируются на почтовый ящик <strong className="text-slate-800 dark:text-slate-200">association.mun.support@gmail.com</strong>.
                    </p>
                  </div>
                </div>

                {tickets.filter(t => !t.subject?.startsWith("[DELETE REQUEST]")).length === 0 ? (
                  <div className="text-center py-16 border border-dashed rounded-lg">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 italic font-serif">
                      Ни одного электронного обращения не зарегистрировано в системе. Все чисто!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.filter(t => !t.subject?.startsWith("[DELETE REQUEST]")).map((ticket, idx) => (
                      <div 
                        key={ticket.id || idx} 
                        className={`border rounded-xl p-5 hover:shadow-2xs transition-all ${
                          ticket.status === "Отправлено" 
                            ? "border-amber-250 bg-amber-50/10" 
                            : ticket.status === "Отвечено"
                              ? "border-emerald-250 bg-emerald-50/5"
                              : "border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-dashed pb-2.5 mb-3 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-[#1a365d] text-white font-mono font-bold text-[9px] tracking-wider px-2 py-0.5 rounded uppercase">
                              {ticket.category}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">{ticket.date}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleTicketStatus(ticket.id)}
                              className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition ${
                                ticket.status === "Отправлено"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  : ticket.status === "Отвечено"
                                    ? "bg-emerald-150 text-emerald-900 border border-emerald-300"
                                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              }`}
                              title="Нажмите, чтобы изменить статус"
                            >
                              Статус: {ticket.status === "Отправлено" ? "Новое (В обработке)" : ticket.status === "Отвечено" ? "Отвечено" : "В обработке"}
                            </button>

                            <button
                              onClick={() => deleteTicket(ticket.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                              title="Удалить обращение"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-sans font-bold text-[#1a365d] leading-snug">
                            Тема: {ticket.subject}
                          </h4>
                          
                          <div className="bg-white/80 dark:bg-slate-900 border p-3 rounded text-xs text-slate-850 font-serif leading-relaxed italic whitespace-pre-wrap">
                            "{ticket.message}"
                          </div>

                          {ticket.attachmentName && (
                            <div className="pt-2">
                              <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                {isEn ? "Attached File" : "Прикрепленный файл"}
                              </span>
                              <div className="p-2 border rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-4">
                                <span className="text-xs text-slate-700 font-mono break-all line-clamp-1">{ticket.attachmentName}</span>
                                {ticket.attachmentDataUrl && (
                                   <button 
                                     onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = ticket.attachmentDataUrl!;
                                        link.download = ticket.attachmentName || "attachment";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                     }}
                                     className="shrink-0 text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 object-contain rounded uppercase font-bold"
                                   >
                                     {isEn ? "Download" : "Скачать"}
                                   </button>
                                )}
                              </div>
                              {ticket.attachmentDataUrl?.startsWith("data:image") && (
                                <img src={ticket.attachmentDataUrl} alt="Attachment preview" className="mt-2 max-w-full max-h-32 rounded border border-slate-200" />
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono pt-1">
                            <p><strong>Заявитель:</strong> {ticket.name}</p>
                            <p>
                              <strong>E-mail заявителя:</strong>{" "}
                              <a href={`mailto:${ticket.email}?subject=Re: [АМООНКР] ${ticket.subject}`} className="text-blue-600 hover:underline">
                                {ticket.email}
                              </a>
                            </p>
                          </div>

                          {/* Existing reply display */}
                          {ticket.reply && (
                            <div className="mt-4 bg-emerald-50 border border-emerald-250 p-3.5 rounded-lg space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-extrabold uppercase tracking-wide text-emerald-800 font-sans block leading-none">
                                  ✓ Отправленный ответ Секретариата
                                </span>
                                <span className="text-[9px] text-slate-450 font-mono">{ticket.replyDate}</span>
                              </div>
                              <p className="text-xs text-slate-800 dark:text-slate-200 font-serif italic leading-relaxed bg-white/70 dark:bg-slate-900 p-2.5 rounded border border-emerald-100">
                                "{ticket.reply}"
                              </p>
                            </div>
                          )}

                          {/* Reply submission form */}
                          {replyingTicketId === ticket.id ? (
                            <form onSubmit={(e) => handleSendReply(e, ticket.id)} className="mt-4 border-t pt-3 space-y-2.5">
                              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Составить официальный ответ:
                              </label>
                              <textarea
                                rows={3}
                                required
                                value={activeReplyText}
                                onChange={(e) => setActiveReplyText(e.target.value)}
                                placeholder="Напишите ответ для этого заявителя. Статус обращения изменится на 'Отвечено', и заявитель увидит ваш ответ в своей истории тикетов."
                                className="w-full text-xs border rounded p-2.5 focus:border-[#1a365d] focus:outline-hidden"
                              />
                              <div className="flex justify-end gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => { setReplyingTicketId(null); setActiveReplyText(""); }}
                                  className="py-1.5 px-3 rounded font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[10px] tracking-wider transition"
                                >
                                  Отмена
                                </button>
                                <button
                                  type="submit"
                                  className="py-1.5 px-4 rounded font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] tracking-wider transition"
                                >
                                  Направить ответ
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => { setReplyingTicketId(ticket.id); setActiveReplyText(ticket.reply || ""); }}
                                className="bg-[#1a365d] hover:bg-[#112543] text-white font-bold text-[10px] py-1.5 px-4 rounded shadow-2xs uppercase tracking-wider inline-flex items-center gap-1.5 transition"
                              >
                                📝 {ticket.reply ? "Редактировать ответ" : "Ответить на обращение"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB CONTENTS: 4. CREATION REQUESTS */}
            {adminSubTab === "create_requests" && (
              <div className="bg-white dark:bg-slate-900 border text-left rounded-xl p-6 shadow-xs max-w-5xl mx-auto">
                <div className="border-b pb-3 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-serif font-black text-[#1a365d] uppercase tracking-wider">
                      {isEn ? "Creation Requests" : "Заявки на создание конференции"}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-serif">
                      {isEn ? "Review proposals from users to organize a new conference in the registry." : "Рассмотрение предложений от пользователей на организацию новой конференции в реестре."}
                    </p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <button 
                      onClick={() => setCreateReqFilter("all")}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${createReqFilter === "all" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                    >
                      {isEn ? "All" : "Все"}
                    </button>
                    <button 
                      onClick={() => setCreateReqFilter("new")}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${createReqFilter === "new" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                    >
                      {isEn ? "New" : "Новые"}
                    </button>
                    <button 
                      onClick={() => setCreateReqFilter("approved")}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${createReqFilter === "approved" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                    >
                      {isEn ? "Approved" : "Одобрено"}
                    </button>
                    <button 
                      onClick={() => setCreateReqFilter("rejected")}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${createReqFilter === "rejected" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                    >
                      {isEn ? "Rejected" : "Отклонено"}
                    </button>
                  </div>
                </div>

                {(() => {
                  let filteredReqs = creationRequests.filter(req => {
                    if (createReqFilter === "new") return req.status === "pending";
                    if (createReqFilter === "approved") return req.status === "approved";
                    if (createReqFilter === "rejected") return req.status === "rejected";
                    return true;
                  });

                  filteredReqs.sort((a, b) => {
                    const isNewA = a.status === "pending" ? 1 : 0;
                    const isNewB = b.status === "pending" ? 1 : 0;
                    if (isNewA !== isNewB) return isNewB - isNewA; 
                    
                    const isAppA = a.status === "approved" ? 1 : 0;
                    const isAppB = b.status === "approved" ? 1 : 0;
                    if (isAppA !== isAppB) return isAppB - isAppA;

                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : ((b as any).timestamp || 0);
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : ((a as any).timestamp || 0);
                    return bTime - aTime;
                  });

                  if (filteredReqs.length === 0) {
                    return (
                      <div className="text-center py-10 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                        <List className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 italic font-serif">
                          {createReqFilter === "new" ? (isEn ? "No new requests." : "Новых заявок нет.") :
                           createReqFilter === "approved" ? (isEn ? "No approved requests." : "Одобренных заявок нет.") :
                           createReqFilter === "rejected" ? (isEn ? "No rejected requests." : "Отклоненных заявок нет.") :
                           (isEn ? "No user requests yet." : "Заявок от пользователей пока нет.")}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredReqs.map((req) => (
                      <div key={req.id} className="border rounded-lg p-5 bg-slate-50 dark:bg-slate-800 shadow-2xs font-sans">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed pb-3 mb-3 text-xs">
                          <div>
                            <p className="font-bold text-[#1a365d] text-sm font-serif">{isEn ? (req.confData?.nameEn || translateToEn(req.confData?.name) || "No title") : (req.confData?.name || "Без названия")}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-mono mt-0.5">
                              {isEn ? "Organizer email: " : "Организатор заявки: "} {req.userEmail}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            req.status === "approved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                            req.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
                            "bg-amber-100 text-amber-800 border-amber-200"
                          }`}>
                            {req.status === "approved" ? (isEn ? "Approved" : "Одобрено") : req.status === "rejected" ? (isEn ? "Rejected" : "Отклонено") : (isEn ? "Pending" : "На рассмотрении")}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <p><strong>{isEn ? "Organization/Club:" : "Организация/Клуб:"}</strong> {isEn ? (req.confData?.orgEn || translateToEn(req.confData?.org)) : req.confData?.org}</p>
                          <p><strong>{isEn ? "Location:" : "Локация:"}</strong> {isEn ? (req.confData?.locationEn || translateToEn(req.confData?.location)) : req.confData?.location}</p>
                          <p><strong>{isEn ? "Format:" : "Формат:"}</strong> {isEn ? (req.confData?.type === "International" ? "International" : req.confData?.type === "Regional" ? "Regional" : "National") : (req.confData?.type === "International" ? "Международная" : req.confData?.type === "Regional" ? "Региональная" : "Национальная")}</p>
                          <p><strong>{isEn ? "Fee:" : "Взнос:"}</strong> {isEn ? translateToEn(req.confData?.registrationFee) : req.confData?.registrationFee}</p>
                          {req.confData?.committees && <p><strong>{isEn ? "Committees:" : "Комитеты:"}</strong> {isEn ? req.confData?.committees.map(c => translateToEn(c)).join(", ") : req.confData?.committees.join(", ")}</p>}
                          <p><strong>{isEn ? "Dates:" : "Даты:"}</strong> {req.confData?.startDate} — {req.confData?.endDate}</p>
                          {req.confData?.description && (
                            <div>
                              <strong>{isEn ? "Description:" : "Описание:"}</strong>
                              <p className="italic text-slate-600 dark:text-slate-400 mt-1">{isEn ? (req.confData?.descriptionEn || translateToEn(req.confData?.description)) : req.confData?.description}</p>
                            </div>
                          )}
                        </div>

                        {req.status === "pending" && (
                          <div className="mt-4 pt-3 border-t border-dashed flex items-center justify-end gap-3">
                            <button
                              onClick={() => {
                                requestPrompt(isEn ? "State reason for rejection:" : "Укажите причину отказа:", isEn ? "Does not meet requirements" : "Не соответствует требованиям", (reason) => {
                                  if (reason) handleReviewCreationRequest(req.id, "rejected", reason);
                                });
                              }}
                              className="py-1.5 px-4 rounded font-bold uppercase bg-red-100 hover:bg-red-200 text-red-700 text-[10px] tracking-wider transition"
                            >
                              {isEn ? "Reject" : "Отклонить"}
                            </button>
                            <button
                              onClick={() => {
                                requestConfirm(isEn ? "Approve and create conference?" : "Одобрить и создать конференцию?", () => {
                                  handleReviewCreationRequest(req.id, "approved");
                                });
                              }}
                              className="py-1.5 px-4 rounded font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] tracking-wider transition shadow-2xs"
                            >
                              {isEn ? "Approve & Create" : "Одобрить и создать"}
                            </button>
                          </div>
                        )}
                        {req.status === "rejected" && req.rejectionReason && (
                          <div className="mt-3 bg-red-50 text-[11px] text-red-800 p-2.5 rounded border border-red-100">
                            <strong>{isEn ? "Rejection Reason:" : "Причина отказа:"}</strong> {req.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              </div>
            )}

            {/* SUB-TAB CONTENTS: 4.5. DELETE REQUESTS */}
            {adminSubTab === "delete_requests" && (
              <div className="bg-white dark:bg-slate-900 border text-left rounded-xl p-6 shadow-xs max-w-5xl mx-auto">
                <div className="border-b pb-3 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-serif font-black text-[#1a365d] uppercase tracking-wider">
                      {isEn ? "Pending Deletion Requests" : "Ожидающие запросы на удаление конференции"}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-serif">
                      {isEn ? "Review organizer requests to delete or end their conferences." : "Рассмотрение заявок организаторов на удаление или досрочное завершение их конференций."}
                    </p>
                  </div>
                </div>

                {(() => {
                  const deleteRequests = tickets.filter(t => t.subject?.startsWith("[DELETE REQUEST]") && t.status === "Отправлено");
                  if (deleteRequests.length === 0) {
                    return (
                      <div className="text-center py-10 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 italic font-serif">
                          {isEn ? "No pending deletion requests." : "Отсутствуют ожидающие запросы на удаление."}
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      {deleteRequests.map((req) => (
                        <div key={req.id} className="border border-red-100 bg-red-50/10 rounded-lg p-5 shadow-2xs font-sans">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed pb-3 mb-3 text-xs">
                            <div>
                              <p className="font-bold text-[#1a365d] text-sm font-serif">
                                {req.subject}
                              </p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-mono mt-0.5">
                                {isEn ? "Organizer email: " : "Организатор: "} {req.email}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-amber-100 text-amber-800 border-amber-200">
                              {isEn ? "Pending" : "Ожидает"}
                            </span>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border p-3 rounded font-serif italic whitespace-pre-wrap">
                              "{req.message}"
                            </p>
                          </div>

                          <div className="flex gap-2">
                             <button
                               onClick={() => {
                                  const confIdMatch = req.message.match(/ID: (conf-[^)]+)/);
                                  const confId = confIdMatch ? confIdMatch[1] : null;
                                  if (confId) {
                                      requestConfirm(isEn ? "Confirm deletion of this conference?" : "Подтвердить удаление этой конференции?", () => {
                                        const confName = (req.subject || "").replace("[DELETE REQUEST]", "").trim();
                                        deleteConference(confId);
                                        // Auto close ticket
                                        const updated = tickets.map(t => t.id === req.id ? { ...t, status: "Закрыто", reply: "Запрос на удаление был одобрен администратором. Конференция успешно удалена.", replyDate: new Date().toLocaleDateString() } : t);
                                        setTickets(updated);
                                        localStorage.setItem("munakr_inquiries", JSON.stringify(updated));

                                        // Auto notify users
                                        addNotification(
                                          "Конференция отменена",
                                          "Conference Cancelled",
                                          `Регистрация и проведение конференции "${confName}" отменены организаторами.`,
                                          `Registration and the session for "${confName}" have been cancelled by the organizers.`,
                                          "conference_cancelled"
                                        );
                                        showToast(isEn ? "Approved and deleted." : "Одобрено и удалено.", "success");
                                      });
                                  }
                               }}
                               className="py-1.5 px-4 rounded text-xs font-bold uppercase bg-red-600 hover:bg-red-700 text-white transition"
                             >
                               {isEn ? "Approve" : "Одобрить"}
                             </button>
                             <button
                               onClick={() => {
                                 requestConfirm(isEn ? "Reject this request?" : "Отклонить этот запрос?", () => {
                                    const updated = tickets.map(t => t.id === req.id ? { ...t, status: "Отвечено", reply: "Ваш запрос на удаление конференции был отклонен администрацией. Конференция остается в реестре.", replyDate: new Date().toLocaleDateString() } : t);
                                    setTickets(updated);
                                    localStorage.setItem("munakr_inquiries", JSON.stringify(updated));
                                    showToast(isEn ? "Request rejected." : "Запрос отклонен.", "info");
                                 });
                               }}
                               className="py-1.5 px-4 rounded text-xs font-bold uppercase bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
                             >
                               {isEn ? "Reject" : "Отклонить"}
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-TAB CONTENTS: 5. ADMIN MANAGEMENT */}
            {adminSubTab === "admins" && currentUser.role === "super_admin" && (
              <div className="bg-white dark:bg-slate-900 border text-left rounded-xl p-6 shadow-xs max-w-5xl mx-auto">
                <div className="border-b pb-3 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-serif font-black text-[#1a365d] uppercase tracking-wider">
                      {isEn ? "Admin Management" : "Управление Администраторами"}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-serif">
                      {isEn ? "Assign or revoke admin privileges from the user list." : "Назначение и удаление обычных администраторов из списка пользователей."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const saved = localStorage.getItem("munakr_registered_users");
                    let usersList: AppUser[] = [];
                    if (saved) {
                      try { usersList = JSON.parse(saved); } catch(e) {}
                    }
                    if (usersList.length === 0) {
                      return <div className="text-xs text-slate-500 italic">Нет зарегистрированных пользователей.</div>;
                    }
                    return usersList.map(u => (
                      <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded shadow-2xs bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{u.name}</p>
                          <p className="font-mono text-slate-500 text-[10px]">{u.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            u.role === "super_admin" ? "bg-purple-100 text-purple-800" :
                            u.role === "admin" ? "bg-emerald-100 text-emerald-800" :
                            u.role === "organizer" ? "bg-blue-100 text-blue-800" :
                            "bg-slate-200 text-slate-800 dark:text-slate-200"
                          }`}>{u.role}</span>
                        </div>
                        {u.role !== "super_admin" && (
                          <div className="flex gap-2">
                            {isUpdatingRole === u.id ? (
                               <div className="flex justify-center items-center px-4 py-1.5 h-full">
                                 <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                               </div>
                            ) : u.role === "admin" ? (
                              <button
                                onClick={() => {
                                  requestConfirm("Снять права администратора?", () => {
                                    setIsUpdatingRole(u.id);
                                    setTimeout(() => {
                                      u.role = "user";
                                      const updatedList = usersList.map(ul => ul.id === u.id ? u : ul);
                                      localStorage.setItem("munakr_registered_users", JSON.stringify(updatedList));
                                      setIsUpdatingRole(null);
                                    }, 800);
                                  });
                                }}
                                className="text-[10px] bg-red-100 text-red-700 hover:bg-red-200 font-bold uppercase tracking-wider px-3 py-1.5 rounded transition"
                              >
                                Понизить до User
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  requestConfirm("Назначить администратором?", () => {
                                    setIsUpdatingRole(u.id);
                                    setTimeout(() => {
                                      u.role = "admin";
                                      const updatedList = usersList.map(ul => ul.id === u.id ? u : ul);
                                      localStorage.setItem("munakr_registered_users", JSON.stringify(updatedList));
                                      setIsUpdatingRole(null);
                                    }, 800);
                                  });
                                }}
                                className="text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 font-bold uppercase tracking-wider px-3 py-1.5 rounded transition shadow-2xs"
                              >
                                Назначить Admin
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* SUB-TAB CONTENTS: 6. SECURITY CENTER */}
            {adminSubTab === "security" && currentUser.role === "super_admin" && (
              <div className="bg-white dark:bg-slate-900 border text-left rounded-xl p-6 shadow-xs max-w-5xl mx-auto space-y-6">
                <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-serif font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
                       <ShieldAlert className="w-5 h-5"/> {isEn ? "Security Center & Admin Logs" : "Центр Безопасности и Логи"}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-serif mt-1">
                      {isEn ? "Real-time security auditing, risk detection, and user administration." : "Аудит безопасности в реальном времени, выявление рисков и администрирование пользователей."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                     <select 
                       value={secFilterRisk} 
                       onChange={(e) => setSecFilterRisk(e.target.value as "All" | RiskLevel)}
                       className="text-xs border rounded p-2 focus:outline-hidden"
                     >
                       <option value="All">{isEn ? "All Risks" : "Все риски"}</option>
                       <option value="Critical">{isEn ? "Critical Only" : "Только критические"}</option>
                       <option value="High">{isEn ? "High+" : "Высокий+"}</option>
                       <option value="Medium">{isEn ? "Medium+" : "Средний+"}</option>
                     </select>
                     <input
                       type="text"
                       placeholder={isEn ? "Search Email/Name..." : "Поиск по Email/Имени..."}
                       value={secSearchQuery}
                       onChange={e => setSecSearchQuery(e.target.value)}
                       className="text-xs border rounded p-2 focus:outline-hidden"
                     />
                     <button
                       onClick={() => {
                          const saved = localStorage.getItem("munakr_registered_users");
                          let usersList: AppUser[] = [];
                          if (saved) {
                             try { usersList = JSON.parse(saved); } catch(e) {}
                          }

                          const savedSecEvents = localStorage.getItem("munakr_security_events");
                          let secEventsList: any[] = [];
                          if (savedSecEvents) { try { secEventsList = JSON.parse(savedSecEvents); } catch(e){} }
                          const savedAdminLogs = localStorage.getItem("munakr_admin_logs");
                          let adminLogsList: any[] = [];
                          if (savedAdminLogs) { try { adminLogsList = JSON.parse(savedAdminLogs); } catch(e){} }

                          const exportData = usersList.map(u => {
                             const isBanned = u.status === "banned_temporary" || u.status === "banned_permanent";
                             const isCritical = u.riskLevel === "Critical";
                             const lastLoginEvent = secEventsList.find(ev => ev.userId === u.id && (ev.type === "login_success" || ev.type.includes("login")));
                             const lastIp = lastLoginEvent ? lastLoginEvent.deviceInfo : "Неизвестно";
                             const userLogs = adminLogsList.filter(l => l.targetUserId === u.id).slice(0, 3)
                                .map(l => `[${new Date(l.timestamp).toLocaleDateString()}] ${l.actionType}: ${l.reason}`).join(" | ");

                             return {
                                "ID": u.id,
                                "ФИО / Name": u.name,
                                "Email": u.email,
                                "Роль / Role": u.role,
                                "Дата регистрации / Reg. Date": u.createdAt || "Неизвестно",
                                "Статус / Status": u.status || "active",
                                "Уровень риска / Risk": u.riskLevel || "Low",
                                "Место учебы / Institution": u.university || "Не указано",
                                "Дата рождения / DOB": u.dateOfBirth || "Не указано",
                                "Телефон / Phone": u.phone || "Не указано",
                                "Причина бана / Ban Reason": isBanned ? (u.adminReason || "Не указана") : (u.adminReason ? `[Снят] ${u.adminReason}` : "Нет"),
                                "Комментарий / Admin Comment": u.adminComment || "Нет",
                                "Критический бан / Critical Ban": (isBanned && isCritical) ? "Да" : "Нет",
                                "Последний IP/Устройство / Auth Info": lastIp,
                                "Последние логи / Recent Logs": userLogs || "Нет",
                             };
                          });
                          import("xlsx").then((XLSX) => {
                             const ws = XLSX.utils.json_to_sheet(exportData);
                             const wb = XLSX.utils.book_new();
                             XLSX.utils.book_append_sheet(wb, ws, "Users");
                             XLSX.writeFile(wb, "Munakr_Users_Export.xlsx");
                          });
                       }}
                       className="bg-[#1a365d] text-white px-4 py-2 rounded text-xs font-bold uppercase flex items-center gap-2 hover:bg-[#112543] transition"
                     >
                        <Download className="w-4 h-4" />
                        {isEn ? "Export" : "Экспорт"} (.xlsx)
                     </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Users List block */}
                   <div className="space-y-4">
                     <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">{isEn ? "Users by Risk Level" : "Пользователи по уровню риска"}</h3>
                     <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                     {(() => {
                        const saved = localStorage.getItem("munakr_registered_users");
                        let usersList: AppUser[] = [];
                        if (saved) {
                          try { usersList = JSON.parse(saved); } catch(e) {}
                        }
                        return usersList
                          .filter(u => u.role !== "super_admin")
                          .filter(u => secFilterRisk === "All" || u.riskLevel === secFilterRisk || (secFilterRisk==="High" && u.riskLevel==="Critical"))
                          .filter(u => {
                            if (!secSearchQuery) return true;
                            const sq = secSearchQuery.toLowerCase();
                            return (u.email && u.email.toLowerCase().includes(sq)) || 
                                   (u.name && u.name.toLowerCase().includes(sq)) ||
                                   (u.id && u.id.toLowerCase().includes(sq)) ||
                                   (u.phone && u.phone.toLowerCase().includes(sq)) ||
                                   (u.university && u.university.toLowerCase().includes(sq));
                          })
                          .sort((a,b) => {
                             const rm = { "Low":1, "Medium":2, "High":3, "Critical":4, undefined: 0 };
                             return (rm[b.riskLevel as keyof typeof rm] || 0) - (rm[a.riskLevel as keyof typeof rm] || 0);
                          })
                          .map(u => (
                          <div key={u.id} className="border p-3 rounded shadow-xs bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{u.name}</p>
                              <p className="text-[10px] text-slate-500">{u.email}</p>
                              <div className="flex gap-2 mt-1">
                                <span className={`text-[9px] px-1.5 font-bold uppercase rounded ${
                                   u.riskLevel === "Critical" ? "bg-red-200 text-red-800" :
                                   u.riskLevel === "High" ? "bg-orange-200 text-orange-800" :
                                   u.riskLevel === "Medium" ? "bg-yellow-200 text-yellow-800" : "bg-emerald-100 text-emerald-700"
                                }`}>{
                                   isEn ? (u.riskLevel || "Low") :
                                   ((u.riskLevel || "Low") === "Critical" ? "Критический" : 
                                   (u.riskLevel || "Low") === "High" ? "Высокий" : 
                                   (u.riskLevel || "Low") === "Medium" ? "Средний" : "Низкий")
                                } {isEn ? "Risk" : "Риск"}</span>
                                
                                <span className={`text-[9px] px-1.5 font-bold uppercase rounded ${
                                   u.isDeleted ? "bg-purple-100 text-purple-800" :
                                   u.status === "banned_permanent" ? "bg-slate-800 text-white" :
                                   u.status === "banned_temporary" ? "bg-red-100 text-red-800" :
                                   u.status === "restricted" ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-700"
                                }`}>{u.isDeleted ? (isEn ? 'Deleted' : 'Удален') : u.status === 'banned_permanent' ? (isEn ? 'Permaban' : 'Пермабан') : u.status === 'banned_temporary' ? (isEn ? 'Tempban' : 'Врем.бан') : u.status === 'restricted' ? (isEn ? 'Restricted' : 'Ограничен') : (isEn ? 'Active' : 'Активен')}</span>
                              </div>
                            </div>
                            <button 
                               onClick={() => setSecSelectedUser(u)}
                               className="bg-[#1a365d] text-white text-[10px] px-3 py-1 font-bold uppercase rounded hover:bg-[#112543] transition"
                            >
                               {isEn ? "Action" : "Действие"}
                            </button>
                          </div>
                        ));
                     })()}
                     </div>
                   </div>

                   {/* Right panels */}
                   {secSelectedUser ? (
                       <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 space-y-4">
                           <div className="flex justify-between items-center border-b border-red-200 pb-2">
                              <h3 className="font-bold text-xs uppercase tracking-wider text-red-800 flex items-center gap-2">
                                {isEn ? "Admin Action" : "Действия администратора"}
                                <button onClick={() => setSecurityInfoModal(true)} className="text-[#1a365d] hover:text-blue-700 bg-white border border-[#1a365d]/20 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] cursor-pointer" title={isEn ? "What does each item do?" : "Что делает каждый пункт?"}>?</button>
                              </h3>
                              <button onClick={() => setSecSelectedUser(null)} className="text-red-500 font-bold text-xs uppercase hover:underline">{isEn ? "Cancel" : "Отмена"}</button>
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{secSelectedUser.name}</p>
                              <p className="text-[10px] text-slate-500">{secSelectedUser.email}</p>
                              <div className="mt-2 text-[10px] space-y-1 bg-white dark:bg-slate-900 p-2 rounded border border-red-100">
                                 <p><span className="font-bold">{isEn ? "Status:" : "Статус:"}</span> {secSelectedUser.isDeleted ? "deleted (soft)" : (secSelectedUser.status || "active")}</p>
                                 <p><span className="font-bold">{isEn ? "Risk Level:" : "Уровень риска:"}</span> <span className={`${secSelectedUser.riskLevel==='Critical'?'text-red-700':secSelectedUser.riskLevel==='High'?'text-orange-600':secSelectedUser.riskLevel==='Medium'?'text-yellow-600':'text-emerald-600'}`}>{
                                    isEn ? (secSelectedUser.riskLevel || "Low") :
                                    ((secSelectedUser.riskLevel || "Low") === 'Critical' ? 'Критический' : (secSelectedUser.riskLevel || "Low") === 'High' ? 'Высокий' : (secSelectedUser.riskLevel || "Low") === 'Medium' ? 'Средний' : 'Низкий')
                                 } {isEn ? "Risk" : "Риск"}</span></p>
                                 {secSelectedUser.status !== "active" && secSelectedUser.adminReason && (
                                   <>
                                     <p><span className="font-bold text-red-800">{isEn ? "Reason:" : "Причина:"}</span> {
                                        !isEn && secSelectedUser.adminReason === "Suspicious Activity" ? "Подозрительная активность" :
                                        !isEn && secSelectedUser.adminReason === "Violation of Policy" ? "Нарушение политики / правил" :
                                        !isEn && secSelectedUser.adminReason === "Spam / Bot Behavior" ? "Спам / Поведение бота" :
                                        !isEn && secSelectedUser.adminReason === "Fraudulent Applications" ? "Мошеннические заявки" :
                                        !isEn && secSelectedUser.adminReason === "Account Restored" ? "Аккаунт Восстановлен (Разбан)" :
                                        !isEn && secSelectedUser.adminReason === "Other" ? "Другое" :
                                        secSelectedUser.adminReason
                                     }</p>
                                     <p><span className="font-bold text-red-800">{isEn ? "Comment:" : "Комментарий:"}</span> {secSelectedUser.adminComment}</p>
                                   </>
                                 )}
                                 {secSelectedUser.banExpiryDate && (
                                   <p><span className="font-bold text-red-800">{isEn ? "Expires:" : "Истекает:"}</span> {new Date(secSelectedUser.banExpiryDate).toLocaleString()}</p>
                                 )}
                              </div>
                           </div>

                           <div className="space-y-2">
                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "ban_temporary", targetUser: secSelectedUser }); setActionDays(1); setActionReason(""); setActionComment("");
                              }} className="w-full text-left bg-white dark:bg-slate-900 border border-red-200 p-2 text-xs font-bold text-red-700 hover:bg-red-100 transition rounded uppercase">1. {isEn ? "Temporary Ban" : "Временный Бан"}</button>
                              
                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "ban_permanent", targetUser: secSelectedUser }); setActionReason(""); setActionComment("");
                              }} className="w-full text-left bg-slate-800 border-slate-900 p-2 text-xs font-bold text-white hover:bg-slate-900 transition rounded uppercase">2. {isEn ? "Permanent Ban" : "Перманентный Бан"}</button>
                              
                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "restrict", targetUser: secSelectedUser }); setActionReason(""); setActionComment("");
                              }} className="w-full text-left bg-white dark:bg-slate-900 border border-orange-200 p-2 text-xs font-bold text-orange-700 hover:bg-orange-100 transition rounded uppercase">3. {isEn ? "Restrict Account" : "Ограничить Аккаунт"}</button>

                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "soft_delete", targetUser: secSelectedUser }); setActionReason(""); setActionComment("");
                              }} className="w-full text-left bg-white dark:bg-slate-900 border border-purple-200 p-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition rounded uppercase">4. {isEn ? "Soft Delete" : "Мягкое Удаление"}</button>

                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "delete", targetUser: secSelectedUser }); setActionReason(""); setActionComment("");
                              }} className="w-full text-left bg-red-800 border border-red-900 p-2 text-xs font-bold text-white hover:bg-red-900 transition rounded uppercase">5. {isEn ? "Permanent Delete" : "Полное Удаление"}</button>
                              
                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "change_role", targetUser: secSelectedUser }); setActionReason(""); setActionComment(""); setActionNewRole("user");
                              }} className="w-full text-left bg-blue-100 border border-blue-200 p-2 text-xs font-bold text-blue-800 hover:bg-blue-200 transition rounded uppercase">6. {isEn ? "Change Role" : "Изменить Роль"}</button>

                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "edit_user", targetUser: secSelectedUser }); setActionReason(""); setActionComment(""); setActionEditUser({ name: secSelectedUser.name, email: secSelectedUser.email });
                              }} className="w-full text-left bg-slate-100 border border-slate-300 dark:border-slate-600 p-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition rounded uppercase">7. {isEn ? "Edit User Profile" : "Редактировать Профиль"}</button>
                              
                              <button onClick={() => {
                                 setActionModal({ isOpen: true, type: "force_reset_password", targetUser: secSelectedUser }); setActionReason(""); setActionComment(""); 
                              }} className="w-full text-left bg-purple-100 border border-purple-200 p-2 text-xs font-bold text-purple-800 hover:bg-purple-200 transition rounded uppercase">8. {isEn ? "Force Password Reset" : "Принудительный сброс пароля"}</button>
                              
                              {(secSelectedUser.status === "banned_permanent" || secSelectedUser.status === "banned_temporary" || secSelectedUser.status === "restricted" || secSelectedUser.isDeleted || secSelectedUser.riskLevel === "Critical") && (
                                 <button onClick={() => {
                                    setActionModal({ isOpen: true, type: "unban", targetUser: secSelectedUser }); setActionReason(""); setActionComment("");
                                 }} className="w-full text-left mt-4 bg-emerald-100 border border-emerald-200 p-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition rounded uppercase">{isEn ? "Restore Account & Unban" : "Восстановить Аккаунт и Разбанить"}</button>
                              )}
                           </div>
                       </div>
                   ) : (
                       <div className="space-y-4">
                         <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">{isEn ? "Recent Security Events" : "Последние инциденты"}</h3>
                         <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {securityEvents.length === 0 && <p className="text-xs text-slate-400">{isEn ? "No events found." : "Инциденты не найдены."}</p>}
                            {securityEvents.map(ev => (
                              <div key={ev.id} className="border-l-4 border-slate-300 dark:border-slate-600 p-2 bg-slate-50 dark:bg-slate-800 text-[10px]">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold bg-slate-200 px-1 rounded">{
                                           !isEn && ev.type === "login_attempt_banned" ? "Попытка входа (Бан)" :
                                           !isEn && ev.type === "login_failed" ? "Неудачный вход" :
                                           !isEn && ev.type === "brute_force_attempt" ? "Попытка подбора пароля" :
                                           ev.type
                                        }</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-slate-400 block">{new Date(ev.timestamp).toLocaleString()}</span>
                                        <button 
                                          onClick={() => {
                                            const saved = localStorage.getItem("munakr_registered_users");
                                            if (saved) {
                                              try {
                                                 const usersList = JSON.parse(saved);
                                                 const user = usersList.find((u: any) => u.id === ev.userId);
                                                 if (user) {
                                                    setSecSelectedUser(user);
                                                 } else {
                                                    showToast(isEn ? "User no longer exists." : "Пользователь не существует.", "error");
                                                 }
                                              } catch(e) {}
                                            }
                                          }}
                                          className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold uppercase cursor-pointer transition text-[9px]"
                                        >
                                           {isEn ? "Inspect User" : "Проверить пользователя"}
                                        </button>
                                    </div>
                                 </div>
                                 <p className="mt-1"><strong className="text-slate-800 dark:text-slate-200">{ev.userEmail}</strong></p>
                                 <p className="text-slate-600 dark:text-slate-400 mt-0.5">{
                                    !isEn && ev.description === "Blocked permanent banned login attempt." ? "Заблокирована попытка входа с перманентным баном." :
                                    !isEn && ev.description === "Blocked temporary banned login attempt." ? "Заблокирована попытка входа с временным баном." :
                                    (!isEn && ev.description?.startsWith("Multiple failed login attempts:")) ? ev.description.replace("Multiple failed login attempts:", "Множественные неудачные попытки входа:") :
                                    ev.description
                                 }</p>
                                 <p className={`mt-1 font-bold ${ev.riskLevel==='Critical'?'text-red-700':ev.riskLevel==='High'?'text-orange-600':ev.riskLevel==='Medium'?'text-yellow-600':'text-emerald-600'}`}>{
                                    isEn ? ev.riskLevel :
                                    (ev.riskLevel === 'Critical' ? 'Критический' : ev.riskLevel === 'High' ? 'Высокий' : ev.riskLevel === 'Medium' ? 'Средний' : 'Низкий')
                                 } {isEn ? "Risk" : "Риск"}</p>
                              </div>
                            ))}
                         </div>
                       </div>
                   )}
                </div>
                
                {/* Admin Action Logs */}
                <div className="mt-8">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b pb-2 mb-4">{isEn ? "Administrator Audit Log" : "Аудит действий администраторов"}</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {adminLogs.length === 0 && <p className="text-xs text-slate-400">{isEn ? "No logs found." : "Журналы не найдены."}</p>}
                      {adminLogs.map(log => (
                         <div key={log.id} className="p-3 border rounded shadow-2xs bg-white dark:bg-slate-900 text-[10px]">
                            <div className="flex justify-between items-center mb-1 border-b pb-1">
                                <span className="font-bold text-[#1a365d] uppercase">{
                                   isEn ? String(log.actionType).replace('_', ' ') : 
                                    log.actionType === 'ban_temporary' ? 'Временный бан' :
                                    log.actionType === 'ban_permanent' ? 'Перманентный бан' :
                                    log.actionType === 'restrict' ? 'Ограничение' :
                                    log.actionType === 'unban' ? 'Разбан' :
                                    log.actionType === 'unrestrict' ? 'Снятие ограничения' : String(log.actionType).replace('_', ' ')
                                }</span>
                                <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <p><span className="text-slate-400">{isEn ? "Admin:" : "Админ:"}</span> {log.adminName}</p>
                                 <p><span className="text-slate-400">{isEn ? "Target User:" : "Целевой Пользователь:"}</span> {log.targetUserEmail}</p>
                               </div>
                               <div>
                                 <p><span className="text-slate-400">{isEn ? "Reason:" : "Причина:"}</span> {
                                    !isEn && log.reason === "Suspicious Activity" ? "Подозрительная активность" :
                                    !isEn && log.reason === "Violation of Policy" ? "Нарушение политики / правил" :
                                    !isEn && log.reason === "Spam / Bot Behavior" ? "Спам / Поведение бота" :
                                    !isEn && log.reason === "Fraudulent Applications" ? "Мошеннические заявки" :
                                    !isEn && log.reason === "Account Restored" ? "Аккаунт Восстановлен (Разбан)" :
                                    !isEn && log.reason === "Other" ? "Другое" :
                                    log.reason
                                 }</p>
                                 <p><span className="text-slate-400">{isEn ? "Comment:" : "Комментарий:"}</span> {log.comment}</p>
                                 {log.expiryDate && <p className="text-red-600 font-bold mt-1">{isEn ? "Expires:" : "Истекает:"} {new Date(log.expiryDate).toLocaleString()}</p>}
                               </div>
                            </div>
                         </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* --- COMMON USER PREFERENCES FOR ALL ROLES --- */}
        {currentUser && (
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-8 space-y-6 max-w-5xl mx-auto">

            {userTab === 'applications' && (
              <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{duration: 0.4}}>
                <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-xs overflow-hidden text-left">
                  <div className="bg-slate-50 dark:bg-slate-800/80 border-b p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-black text-[#1a365d] dark:text-[#80add0] text-lg uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#c0a080]" />
                        {isEn ? "My Conference Registrations" : "Мои заявки на конференции"} 
                        <span className="bg-[#1a365d] text-white text-[10px] px-2 py-0.5 rounded-full ml-1">
                          {joinRequests.filter(r => r.userId === currentUser.id).length}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 font-serif mt-1">
                        {isEn ? "Status of your applications to participate in MUN conferences." : "Статус ваших заявок на участие в конференциях Модели ООН."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    {joinRequests.filter(r => r.userId === currentUser.id).length === 0 ? (
                      <div className="text-center py-16 border border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">
                          {isEn ? "No Applications Yet" : "Нет активных заявок"}
                        </p>
                        <p className="text-xs text-slate-500 font-serif">
                          {isEn ? "Visit the directory to find and apply for conferences." : "Перейдите в ленту конференций для регистрации."}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {joinRequests.filter(r => r.userId === currentUser.id).map(req => {
                          const conf = conferences.find(c => c.id === req.conferenceId);
                          const isConfirmed = req.status === "confirmed";
                          const isRejected = req.status === "rejected" || req.status === "payment_rejected";
                          const isPending = req.status === "pending" || req.status === "payment_review" || req.status === "awaiting_payment";
                          
                          return (
                            <div key={req.id} className="group relative flex flex-col md:flex-row items-stretch md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#1a365d]/30 dark:hover:border-[#80add0]/50 hover:shadow-xs transition duration-300 p-4 gap-4 md:gap-6">
                              {/* Left Edge Highlight */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-80 ${
                                isConfirmed ? "bg-emerald-500" :
                                isRejected ? "bg-red-500" :
                                "bg-amber-500"
                              }`} />

                              {/* Date & Status (Mobile Top, Desktop Left) */}
                              <div className="flex md:flex-col items-center md:items-start justify-between md:justify-center shrink-0 md:w-[130px] pl-2">
                                <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded md:mb-2">
                                  {(req.createdAt || "").split(',')[0]}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border ${
                                  isConfirmed ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  isRejected ? "bg-red-50 text-red-700 border-red-200" :
                                  req.status === "payment_review" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    isConfirmed ? "bg-emerald-500" :
                                    isRejected ? "bg-red-500" :
                                    req.status === "payment_review" ? "bg-blue-500 animate-pulse" :
                                    "bg-amber-500 animate-pulse"
                                  }`}></span>
                                  {isConfirmed ? (isEn ? "Completed" : "Аккредитован") : 
                                   req.status === "rejected" ? (isEn ? "Rejected" : "Отклонено") : 
                                   req.status === "payment_rejected" ? (isEn ? "Payment Failed" : "Оплата отклонена") :
                                   req.status === "payment_review" ? (isEn ? "Reviewing" : "Чек на проверке") :
                                   req.status === "awaiting_payment" ? (isEn ? "Awaiting Pay" : "Ожидание оплаты") :
                                   (isEn ? "Pending" : "Ожидание")}
                                </span>
                              </div>

                              {/* Core Info */}
                              <div className="flex-1 min-w-[200px] flex flex-col justify-center">
                                <h4 className="text-[15px] font-bold text-[#1a365d] dark:text-[#80add0] font-sans leading-tight">
                                  {conf ? (isEn ? (conf.nameEn || translateToEn(conf.name)) : conf.name) : (isEn ? "Conference" : "Конференция")}
                                </h4>
                                <div className="flex flex-wrap items-center mt-1.5 gap-x-4 gap-y-1">
                                  <div className="text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{isEn ? "Committee:" : "Комитет:"}</span>
                                    <span className="font-mono">{req.desiredCommittee}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{isEn ? "Experience:" : "Опыт:"}</span>
                                    {req.experience.length > 30 ? (
                                      <div className="flex items-center gap-1">
                                        <span className="italic text-slate-600 dark:text-slate-400">"{req.experience.slice(0, 30)}..."</span>
                                        <button 
                                          onClick={() => setViewingTextModal({
                                            title: isEn ? "Experience" : "Опыт участия",
                                            text: req.experience,
                                            applicantName: currentUser.name
                                          })}
                                          className="text-[9px] text-[#1a365d] dark:text-[#80add0] font-bold uppercase hover:underline ml-1"
                                        >
                                          {isEn ? "Read" : "Читать"}
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="italic text-slate-600 dark:text-slate-400">"{req.experience}"</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                                {/* Action Footer */}
                              <div className="md:w-[220px] shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-5 flex flex-col justify-center gap-2">
                                {isRejected && (
                                  <div className="flex items-start gap-1.5 text-[10px] text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                                    <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2" title={req.rejectionReason}><strong>{isEn ? "Reason:" : "Причина:"}</strong> {req.rejectionReason}</span>
                                  </div>
                                )}
                                
                                {isConfirmed && req.chatLink && (
                                  <a href={req.chatLink?.startsWith('http') ? req.chatLink : `https://${req.chatLink}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#1a365d] hover:bg-[#1a365d]/90 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition shadow-xs">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {isEn ? "Delegate Chat" : "Чат делегатов"}
                                  </a>
                                )}

                                {isConfirmed && conf && conf.status === "Closed" && (
                                  <div className="w-full">
                                    {ratings.some(r => r.conferenceId === conf.id && r.userId === currentUser.id) ? (
                                      <div className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {isEn ? "Rated" : "Конференция оценена"}
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setRatingModal({ confId: conf.id, confName: conf.name })}
                                        className="w-full flex items-center justify-center gap-1.5 bg-[#c0a080] hover:bg-[#ab8e72] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition shadow-xs"
                                      >
                                        <Award className="w-3.5 h-3.5" />
                                        {isEn ? "Rate Conference" : "Оценить конференцию"}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {(req.status === "awaiting_payment" || req.status === "payment_rejected") && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[9px] uppercase tracking-wider px-1">
                                      <span className="text-slate-500 font-bold">{isEn ? "Fee" : "Взнос"}</span>
                                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 rounded border border-amber-100">{conf?.registrationFee || "-"}</span>
                                    </div>
                                    {req.paymentDetails && (
                                       <p className="text-[9px] text-slate-500 bg-slate-50 p-1.5 rounded font-mono truncate" title={req.paymentDetails}>
                                          {req.paymentDetails}
                                       </p>
                                    )}
                                    <label className="w-full flex items-center justify-center border border-dashed border-[#1a365d]/40 hover:bg-[#1a365d]/5 hover:border-[#1a365d] bg-white dark:bg-slate-900 cursor-pointer text-[#1a365d] text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition">
                                      <span className="flex items-center gap-1.5"><Download className="w-3 h-3"/> {isEn ? "Upload Receipt" : "Загрузить Чек"}</span>
                                      <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                              setPendingReceipt({
                                                reqId: req.id,
                                                url: ev.target?.result as string,
                                                name: file.name
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }} 
                                      />
                                    </label>
                                  </div>
                                )}
                                
                                {req.status === "payment_review" && (
                                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-blue-600 font-bold uppercase bg-blue-50/50 p-2 border border-blue-100 rounded">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {isEn ? "Verifying..." : "Чек на проверке"}
                                  </div>
                                )}

                                {req.status === "pending" && (
                                  <button
                                    onClick={() => handleWithdrawJoinRequest(req.id)}
                                    className="w-full text-[10px] text-slate-500 hover:text-red-600 font-bold uppercase tracking-wider transition underline decoration-dashed underline-offset-4"
                                  >
                                    {isEn ? "Withdraw Application" : "Отозвать заявку"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {userTab === 'delegates' && currentUser.role === "organizer" && (
              <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{duration: 0.4}}>
                <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-xs overflow-hidden text-left border-slate-200 dark:border-slate-700">
                  <div className="bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-serif font-black text-[#1a365d] dark:text-[#80add0] text-lg uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {isEn ? "Applications to my conferences" : "Заявки на мои конференции"}
                        </h3>
                        <p className="text-xs text-slate-500 font-sans mt-1">
                          {isEn ? "Manage delegates who want to participate in your simulations." : "Управление делегатами, подавшими заявку на ваши симуляции."}
                        </p>
                      </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-2 pb-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <button 
                        onClick={() => setDelegatesFilter("all")}
                        className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${delegatesFilter === "all" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                      >
                        {isEn ? "All" : "Все"}
                      </button>
                      <button 
                        onClick={() => setDelegatesFilter("new")}
                        className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${delegatesFilter === "new" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                      >
                        {isEn ? "New" : "Новые"}
                      </button>
                      <button 
                        onClick={() => setDelegatesFilter("awaiting_payment")}
                        className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${delegatesFilter === "awaiting_payment" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                      >
                        {isEn ? "Awaiting Payment" : "Ожидает Оплаты"}
                      </button>
                      <button 
                        onClick={() => setDelegatesFilter("payment_review")}
                        className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${delegatesFilter === "payment_review" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                      >
                        {isEn ? "Payment Review" : "Ожидает подтверждение"}
                      </button>
                      <button 
                        onClick={() => setDelegatesFilter("confirmed")}
                        className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${delegatesFilter === "confirmed" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                      >
                        {isEn ? "Confirmed" : "Завершенные"}
                      </button>
                      <button 
                        onClick={() => setDelegatesFilter("rejected")}
                        className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${delegatesFilter === "rejected" ? "bg-[#1a365d] text-white shadow-md border border-[#1a365d]" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}
                      >
                        {isEn ? "Rejected" : "Отклоненные"}
                      </button>
                    </div>
                  </div>

                  <div className="p-0 sm:p-4">
                  {(() => {
                    const myConferences = conferences.filter(c => c.creatorId === currentUser.id);
                    const myConfIds = myConferences.map(c => c.id);
                    let relevantRequests = joinRequests.filter(r => myConfIds.includes(r.conferenceId))
                      .filter(r => {
                        if (delegatesFilter === "new") return r.status === "pending";
                        if (delegatesFilter === "awaiting_payment") return r.status === "awaiting_payment";
                        if (delegatesFilter === "payment_review") return r.status === "payment_review";
                        if (delegatesFilter === "confirmed") return r.status === "confirmed";
                        if (delegatesFilter === "rejected") return r.status === "rejected" || r.status === "payment_rejected";
                        return true;
                      });

                    relevantRequests.sort((a, b) => {
                      const isNewA = a.status === "pending" ? 1 : 0;
                      const isNewB = b.status === "pending" ? 1 : 0;
                      if (isNewA !== isNewB) return isNewB - isNewA; 
                      
                      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : ((b as any).timestamp || 0);
                      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : ((a as any).timestamp || 0);
                      return bTime - aTime;
                    });

                    if (relevantRequests.length === 0) {
                      return (
                        <div className="text-center py-16 m-6 mt-2 border border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">
                            {isEn ? "No applications found" : "Заявок не найдено"}
                          </p>
                          <p className="text-xs text-slate-500 font-serif">
                            {delegatesFilter === "new" ? (isEn ? "No new applications." : "Нет новых заявок, ожидающих ответа.") :
                             delegatesFilter === "awaiting_payment" ? (isEn ? "No applications awaiting payment." : "Нет заявок ожидающих оплаты.") :
                             delegatesFilter === "payment_review" ? (isEn ? "No applications awaiting confirmation." : "Нет заявок ожидающих подтверждения.") :
                             delegatesFilter === "confirmed" ? (isEn ? "No confirmed applications." : "Нет завершенных заявок.") :
                             delegatesFilter === "rejected" ? (isEn ? "No rejected applications." : "Отклоненных заявок нет.") :
                             (isEn ? "No applications." : "Заявок нет.")}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col">
                        {(delegatesFilter !== "new" && delegatesFilter !== "rejected") && (
                          <div className="flex justify-end p-2 sm:px-2 z-10 w-full mb-2">
                             <button 
                               onClick={() => {
                                 const escapeCSV = (str: string) => {
                                   if (!str) return '""';
                                   const replaced = String(str).replace(/"/g, '""');
                                   return `"${replaced}"`;
                                 };
                                 
                                 const csvRows = [];
                                 // Headers
                                 csvRows.push(["Имя", "Email", "Делегация", "Комитеты (приоритеты)", "Опыт", "Мотивация", "Статус", "Конференция"].map(escapeCSV).join(';'));
                                 
                                 // Data
                                 for (const req of relevantRequests) {
                                   const conf = myConferences.find(c => c.id === req.conferenceId);
                                   let statusTranslation = 'Новая';
                                   if (req.status === 'confirmed') statusTranslation = 'Завершен';
                                   else if (req.status === 'rejected') statusTranslation = 'Отклонен';
                                   else if (req.status === 'awaiting_payment') statusTranslation = 'Ожидает оплаты';
                                   else if (req.status === 'payment_review') statusTranslation = 'Ожидает подтверждения';

                                   const confName = conf ? (isEn && conf.nameEn ? conf.nameEn : conf.name) : 'Unknown';
                                   
                                   const committees = [
                                     req.desiredCommittee,
                                     undefined,
                                     undefined
                                   ].filter(Boolean).join(', ');
                                   
                                   csvRows.push([
                                     req.fullName,
                                     req.userEmail || "N/A",
                                     req.school,
                                     committees,
                                     req.experience || "N/A",
                                     req.motivation || "N/A",
                                     statusTranslation,
                                     confName
                                   ].map(escapeCSV).join(';'));
                                 }
                                 
                                 const csvData = "\uFEFF" + csvRows.join('\n');
                                 const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                                 const url = URL.createObjectURL(blob);
                                 const link = document.createElement("a");
                                 link.setAttribute("href", url);
                                 link.setAttribute("download", `delegates_confirmed_${new Date().toISOString().split('T')[0]}.csv`);
                                 document.body.appendChild(link);
                                 link.click();
                                 document.body.removeChild(link);
                               }}
                               className="bg-[#1a365d] hover:bg-[#112543] dark:bg-[#80add0] dark:hover:bg-[#5a8da0] dark:text-slate-900 text-white text-[10px] uppercase font-bold tracking-wider py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                             >
                               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                               {isEn ? "Export CSV" : "Скачать CSV"}
                             </button>
                          </div>
                        )}
                        <div className="flex flex-col border-t sm:border-none border-slate-200 dark:border-slate-800 divide-y sm:divide-y-0 sm:gap-4 sm:p-2 divide-slate-100 dark:divide-slate-800">
                          {relevantRequests.map(req => {
                            const conf = myConferences.find(c => c.id === req.conferenceId);
                            const isConfirmed = req.status === "confirmed";
                            const isRejected = req.status === "rejected" || req.status === "payment_rejected";
                            
                            return (
                            <div key={req.id} className="group bg-white dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-700 sm:rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition duration-200">
                              <div className="flex flex-col lg:flex-row lg:items-stretch h-full">
                                {/* Left Section: Identity Context */}
                                <div className="p-4 lg:w-[280px] shrink-0 border-r border-dashed border-slate-200 dark:border-slate-700 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                  <div>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-white dark:bg-slate-800 ${
                                      isConfirmed ? "text-emerald-700 border-emerald-200" :
                                      isRejected ? "text-slate-500 border-slate-200" :
                                      req.status === "payment_review" ? "text-[#1a365d] border-[#1a365d]/20 dark:text-[#80add0]" :
                                      "text-[#80add0] border-[#80add0]/30"
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        isConfirmed ? "bg-emerald-500" :
                                        isRejected ? "bg-slate-400" :
                                        req.status === "payment_review" ? "bg-[#1a365d] dark:bg-[#80add0] animate-pulse" :
                                        "bg-[#80add0] animate-pulse"
                                      }`}></span>
                                      {isConfirmed ? (isEn ? "Completed" : "Одобрена") : 
                                       req.status === "rejected" ? (isEn ? "Rejected" : "Отклонена") : 
                                       req.status === "payment_rejected" ? (isEn ? "Payment Rejected" : "Оплата отклонена") :
                                       req.status === "payment_review" ? (isEn ? "Receipt Review" : "Проверка чека") :
                                       req.status === "awaiting_payment" ? (isEn ? "Awaiting Payment" : "Ожидает оплату") :
                                       (isEn ? "New Application" : "Новая заявка")}
                                    </span>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 font-sans">{req.fullName}</h4>
                                    <p className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 inline-block rounded font-sans mt-1.5 font-bold uppercase tracking-wider text-[#1a365d] dark:text-[#80add0]">
                                      {conf?.name}
                                    </p>
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                                    <span className="text-[9px] text-slate-400 font-sans tracking-wide uppercase">
                                      {(req.createdAt || "").split(', ')[0]} • {(req.createdAt || "").split(', ')[1]}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Middle Section: Profile Details */}
                                <div className="p-5 flex-1 text-xs text-slate-700 dark:text-slate-300 flex flex-col justify-center font-sans leading-relaxed">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-4">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{isEn ? "Desired Committee" : "Желаемый комитет"}</span>
                                        <span className="font-sans text-[#1a365d] dark:text-[#80add0] font-bold">{req.desiredCommittee}</span>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{isEn ? "Education" : "Обучение"}</span>
                                        <span className="font-sans font-medium">{req.school} {req.education ? `• ${req.education}` : ""}</span>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{isEn ? "Contacts" : "Контакты"}</span>
                                        <span className="font-sans font-medium">{req.phone} • {req.telegram}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{isEn ? "Experience" : "Опыт участия"}</span>
                                        {req.experience.length > 80 ? (
                                          <div className="flex flex-col items-start gap-1">
                                            <span className="font-sans font-medium line-clamp-2 whitespace-normal break-words" title={req.experience}>"{req.experience.slice(0,80)}..."</span>
                                            <button 
                                              onClick={() => setViewingTextModal({
                                                title: isEn ? "Experience" : "Опыт участия",
                                                text: req.experience,
                                                applicantName: req.fullName
                                              })}
                                              className="text-[10px] text-[#1a365d] dark:text-[#80add0] font-bold uppercase hover:underline"
                                            >
                                              {isEn ? "Read Details" : "Подробнее"}
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="font-sans font-medium whitespace-normal">"{req.experience}"</span>
                                        )}
                                      </div>
                                      {req.source && (
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{isEn ? "Source Reference" : "Откуда узнал(а)"}</span>
                                          <span className="font-sans font-medium italic">"{req.source}"</span>
                                        </div>
                                      )}
                                      {req.motivation && (
                                        <div className="flex flex-col gap-1 items-start mt-1 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{isEn ? "Motivation" : "Мотивация"}</span>
                                          <div className="font-sans font-medium italic text-slate-600 dark:text-slate-400 line-clamp-2 break-words">
                                            "{req.motivation}"
                                          </div>
                                          <button 
                                            onClick={() => setViewingTextModal({
                                              title: isEn ? "Motivation Letter" : "Мотивационное письмо",
                                              text: req.motivation!,
                                              applicantName: req.fullName
                                            })}
                                            className="text-[10px] text-[#1a365d] dark:text-[#80add0] font-bold uppercase hover:underline mt-0.5"
                                          >
                                            {isEn ? "Read Details" : "Подробнее"}
                                          </button>
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                </div>
                                
                                {/* Right Section: Actions */}
                                <div className="p-4 lg:w-[240px] shrink-0 border-l lg:border-dashed border-t lg:border-t-0 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-center">
                                  {req.status === "pending" && (
                                    <div className="flex flex-col justify-center gap-2 h-full">
                                      <button
                                        onClick={() => {
                                          const feeLower = conf?.registrationFee?.toLowerCase() || "";
                                          const isPaid = !feeLower.includes("бесплат") && !feeLower.includes("free") && feeLower !== "0";
                                          
                                          if (isPaid) {
                                            requestPrompt(isEn ? "Enter payment details (MBank/Kaspi etc.):" : "Укажите реквизиты (номер MBank/Kaspi):", "MBANK: +996...", (details) => {
                                              if (details) handleUpdateJoinRequest(req.id, { status: "awaiting_payment", paymentDetails: details });
                                            });
                                          } else {
                                            requestPrompt(isEn ? "Chat link (optional):" : "Ссылка на чат (необязательно):", "t.me/...", (chat) => {
                                              handleUpdateJoinRequest(req.id, { status: "confirmed", chatLink: chat || "" });
                                            });
                                          }
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase py-2.5 rounded transition shadow-xs"
                                      >
                                        {isEn ? "Approve" : "Одобрить"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          requestPrompt(isEn ? "Reason for rejection:" : "Причина отказа:", isEn ? "Insufficient experience" : "Слабый опыт", (reason) => {
                                            if (reason) handleUpdateJoinRequest(req.id, { status: "rejected", rejectionReason: reason });
                                          });
                                        }}
                                        className="w-full bg-white dark:bg-slate-900 border-2 border-red-100 hover:border-red-500 text-red-600 font-bold text-[10px] uppercase py-2 rounded transition shadow-xs"
                                      >
                                        {isEn ? "Reject" : "Отклонить"}
                                      </button>
                                    </div>
                                  )}

                                  {req.status === "payment_review" && (
                                    <div className="flex flex-col justify-center gap-2 h-full">
                                      <div className="bg-white dark:bg-slate-900 border rounded p-2 mb-1">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[9px] font-bold text-slate-500 uppercase">{isEn ? "Receipt" : "Чек"}</span>
                                          <button onClick={() => downloadBase64File(req.paymentReceiptUrl!, 'receipt')} className="text-[10px] text-blue-600 font-bold uppercase hover:underline">Скачать</button>
                                        </div>
                                        {req.paymentReceiptUrl?.startsWith('data:image') ? (
                                          <img src={req.paymentReceiptUrl} alt="Receipt" className="max-w-full h-16 object-contain rounded border border-slate-100" />
                                        ) : (
                                          <p className="text-[9px] font-mono break-all line-clamp-2 italic text-slate-400">{req.paymentReceiptUrl}</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          requestPrompt(isEn ? "Enter chat link to confirm:" : "Ссылка на чат делегатов:", "t.me/...", (chat) => {
                                            if (chat) handleUpdateJoinRequest(req.id, { status: "confirmed", chatLink: chat });
                                          });
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase py-2 rounded transition"
                                      >
                                        {isEn ? "Confirm Payment" : "Подтвердить Оплату"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          requestPrompt(isEn ? "Reason for rejection:" : "Причина отказа:", "Нечеткий чек", (reason) => {
                                            if (reason) handleUpdateJoinRequest(req.id, { status: "payment_rejected", rejectionReason: reason });
                                          });
                                        }}
                                        className="w-full bg-white dark:bg-slate-900 border border-red-200 text-red-600 font-bold text-[10px] uppercase py-1.5 rounded transition"
                                      >
                                        {isEn ? "Reject" : "Отклонить"}
                                      </button>
                                    </div>
                                  )}

                                  {req.status === "awaiting_payment" && (
                                    <div className="flex flex-col justify-center items-center gap-2 h-full text-center p-2 opacity-50">
                                      <Clock className="w-6 h-6 text-slate-400 mb-1" />
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{isEn ? "Waiting for delegate" : "Ожидание оплаты делегатом"}</span>
                                    </div>
                                  )}

                                  {isRejected && req.rejectionReason && (
                                    <div className="flex flex-col justify-center gap-2 h-full text-left">
                                      <div className="flex items-start gap-1.5 text-[10px] text-red-600 bg-white dark:bg-slate-900 border border-red-100 p-2 rounded">
                                        <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                                        <span><strong>{isEn ? "Rejected:" : "Отказано:"}</strong> <br/> {req.rejectionReason}</span>
                                      </div>
                                    </div>
                                  )}

                                  {isConfirmed && (
                                    <div className="flex flex-col justify-center items-center gap-2 h-full text-center">
                                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                                        <CheckCircle className="w-4 h-4" />
                                      </div>
                                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{isEn ? "Approved" : "Заявка одобрена"}</span>
                                    </div>
                                  )}

                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      </div>
                    );
                  })()}
                  </div>
                </div>
              </motion.div>
            )}

            {userTab === 'profile' && (
              <div className="space-y-6">
                {/* Diplomatic Passport moved here */}
                <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-xs">
                  {/* Profile card Header */}
                  <div className="bg-[#1a365d] p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white dark:bg-slate-900/10 rounded-full border-2 border-[#c0a080] flex items-center justify-center font-bold text-lg text-[#c0a080]">
                        {currentUser.name[0]}
                      </div>
                      <div>
                        <h2 className="text-xl font-sans font-bold">{currentUser.name}</h2>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300">
                          Дипломатический паспорт делегата • Аккредитован
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-[#c0a080] text-slate-950 font-bold font-mono text-[9px] px-2.5 py-1 rounded uppercase tracking-wider">
                        Ранг: Делегат
                      </span>
                      <p className="text-[10px] font-mono text-slate-300 mt-1">Регистрация: {currentUser.createdAt}</p>
                    </div>
                  </div>

                  {/* Profile Body */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Visual Metadata column */}
                    <div className="space-y-4 border-r pr-6 border-slate-100 last:border-0">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Академический паспорт
                      </span>
                      <div className="bg-slate-50 dark:bg-slate-800 border p-3.5 rounded-lg space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <p><strong>Электронный адрес:</strong> {currentUser.email}</p>
                        <p><strong>Тип кабинета:</strong> Индивидуальный</p>
                        <p><strong>Статус верификации:</strong> <span className="text-emerald-600 font-bold">Активен ✓</span></p>
                      </div>
                    </div>

                    {/* Info block */}
                    <div className="space-y-4 text-justify md:col-span-2">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Сводка Секретариата
                      </span>
                      <p className="text-xs text-slate-500 font-sans leading-relaxed italic">
                        «Уважаемый делегат! Ваш аккаунт успешно верифицирован в единой базе Ассоциации Модели ООН Кыргызской Республики. Вы можете просматривать актуальные конференции, подавать заявки на участие, а также технические обращения в секретариат.»
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xs space-y-6 text-left">
                  <div className="border-b pb-3">
                  <h3 className="font-serif font-black text-[#1a365d] text-base uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#c0a080]" />
                    {isEn ? "Account Settings" : "Настройки аккаунта"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-serif">
                    {isEn ? "Manage your personal information and security." : "Управление личными данными и безопасностью."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Change Name */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 mb-3">{isEn ? "Personal Info" : "Личные данные"}</h4>
                  <form onSubmit={handleUpdateName} className="space-y-3">
                    <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{isEn ? "Full Name" : "ФИО"}</label>
                       <input 
                         type="text" 
                         value={editName}
                         onChange={(e) => setEditName(e.target.value)}
                         className="w-full border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded p-2 text-xs focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden transition"
                       />
                    </div>
                    <button type="submit" disabled={editName.trim() === currentUser.name} className="bg-slate-900 dark:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-600 text-white dark:text-slate-100 text-[10px] font-bold uppercase px-4 py-2 rounded transition">
                      {isEn ? "Save Changes" : "Сохранить изменения"}
                    </button>
                  </form>
                </div>

                {/* Change Email */}
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 mb-3">{isEn ? "Primary Email" : "Электронная почта"}</h4>
                  <AnimatePresence mode="wait">
                    {editEmailStep === "idle" ? (
                      <motion.form key="idle" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} onSubmit={handleRequestEmailChange} className="space-y-3">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                           <input 
                             type="email" 
                             value={editEmail}
                             onChange={(e) => setEditEmail(e.target.value)}
                             className="w-full border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded p-2 text-xs focus:border-[#1a365d] dark:focus:border-[#80add0] focus:outline-hidden transition"
                           />
                        </div>
                        <button type="submit" disabled={editEmailLoading || editEmail.trim() === currentUser.email} className="bg-slate-900 dark:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-600 text-white dark:text-slate-100 text-[10px] font-bold uppercase px-4 py-2 rounded transition flex items-center gap-2">
                          {editEmailLoading && <Loader2 className="w-3 h-3 animate-spin"/>}
                          {isEn ? "Request Email Change" : "Запросить смену почты"}
                        </button>
                      </motion.form>
                    ) : (
                      <motion.form key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} onSubmit={handleVerifyEmailChange} className="space-y-3 bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{isEn ? "Enter Verification Code" : "Код подтверждения"}</label>
                           <input 
                             type="text" 
                             value={editEmailOTP}
                             onChange={(e) => setEditEmailOTP(e.target.value)}
                             placeholder="0000"
                             className="w-full border dark:border-slate-700 dark:bg-slate-900 dark:text-white shadow-inner rounded p-2 text-center text-sm font-mono tracking-widest focus:border-emerald-500 focus:outline-hidden transition"
                           />
                           <p className="text-[9px] text-slate-400 mt-1">{isEn ? "Sent to: " : "Отправлен на: "} {editEmailPending}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setEditEmailStep("idle")} className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase px-2 py-2 rounded transition">
                            {isEn ? "Cancel" : "Отмена"}
                          </button>
                          <button type="submit" disabled={!editEmailOTP} className="flex-1 bg-emerald-600 dark:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-900/50 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-2 rounded transition">
                            {isEn ? "Verify & Save" : "Подтвердить"}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2FA Settings */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t dark:border-slate-800">
                   <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-[#1a365d] dark:text-[#80add0] mb-2">
                      <ShieldCheck className="w-5 h-5" />
                      {isEn ? "Two-Factor Authentication (2FA)" : "Двухфакторная аутентификация (2FA)"}
                   </h4>
                   <p className="text-[11px] text-slate-600 dark:text-slate-400 font-serif mb-4">
                      {isEn ? "Add an extra layer of security to your account by turning on two-factor authentication." : "Добавьте дополнительный уровень безопасности к своему аккаунту, включив двухфакторную аутентификацию."}
                   </p>
                   
                   <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {currentUser.preferences?.twoFactorEnabled ? (isEn ? "2FA is Enabled" : "2FA Включена") : (isEn ? "2FA is Disabled" : "2FA Отключена")}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase mt-1">
                          {currentUser.preferences?.twoFactorEnabled ? (isEn ? "Your account is secure" : "Ваш аккаунт защищен") : (isEn ? "Enable 2FA to secure account" : "Включите 2FA для защиты аккаунта")}
                        </span>
                     </div>
                     <button 
                        onClick={() => {
                          const newPrefs = { ...currentUser.preferences, twoFactorEnabled: !currentUser.preferences?.twoFactorEnabled };
                          const updatedUser = { ...currentUser, preferences: newPrefs };
                          setCurrentUser(updatedUser);
                          localStorage.setItem("munakr_session_user", JSON.stringify(updatedUser));
                          
                          const saved = localStorage.getItem("munakr_registered_users");
                          if (saved) {
                            try { 
                               let usersList = JSON.parse(saved); 
                               const updatedUsers = usersList.map((u: any) => u.id === currentUser.id ? { ...u, preferences: newPrefs } : u);
                               localStorage.setItem('munakr_registered_users', JSON.stringify(updatedUsers));
                            } catch(e){}
                          }
                          const isEnabled = newPrefs.twoFactorEnabled;
                          showToast(
                            isEn 
                              ? (isEnabled ? "2FA successfully activated!" : "2FA has been deactivated.") 
                              : (isEnabled ? "2FA успешно активирована!" : "2FA деактивирована."),
                            isEnabled ? "success" : "info"
                          );
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none ${currentUser.preferences?.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <span className="sr-only">Toggle 2FA</span>
                        <span className={`pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${currentUser.preferences?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                   </div>
                </div>

              </div>
             </div>

              {/* Account Deletion Common or Profile */}
              <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xs text-left mt-6">
                <div className="border-b border-red-100 dark:border-red-900/50 pb-3 mb-5">
                  <h3 className="font-serif font-black text-red-600 dark:text-red-400 text-base uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    {isEn ? "Danger Zone: Account Deletion" : "Опасная зона: Удаление аккаунта"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-serif mt-1">
                    {isEn ? "Manage data removal and permanently delete your account." : "Управление удалением данных и перманентным удалением вашего аккаунта."}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 mb-2">{isEn ? "Account Deletion" : "Окончательное удаление"}</h4>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-lg">
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-serif">
                    {isEn ? "Permanently delete your account and all associated data. This action cannot be undone." : "Навсегда удалить аккаунт и связанные данные. Это действие является необратимым."}
                  </div>
                  <button onClick={handleDeleteSelfAccount} className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded transition flex items-center gap-1 shrink-0">
                    <Trash2 className="w-3 h-3" />
                    {isEn ? "Delete Account" : "Удалить Аккаунт"}
                  </button>
                </div>
               </div>
              </div>
             </div>
            )}

            {userTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-xs space-y-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#1a365d] dark:text-[#80add0]">
                    <BellRing className="w-5 h-5" />
                    {isEn ? "Notification & Mailing Settings" : "Система уведомлений и рассылок"}
                  </h4>
                  {(() => {
                    const allEnabled = currentUser?.preferences?.emailAlerts && currentUser?.preferences?.newConferences && currentUser?.preferences?.conferenceDateChanges && currentUser?.preferences?.earlyBirdAlerts;
                    const allMuted = !currentUser?.preferences?.emailAlerts && !currentUser?.preferences?.newConferences && !currentUser?.preferences?.conferenceDateChanges && !currentUser?.preferences?.earlyBirdAlerts;
                    
                    return (
                      <div className="flex gap-2 flex-wrap">
                         <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (currentUser) {
                                 let updatedUser = { ...currentUser, preferences: { ...currentUser.preferences, emailAlerts: true, pushNotifications: true, newConferences: true, conferenceDateChanges: true, earlyBirdAlerts: true } };
                                 setCurrentUser(updatedUser);
                                 localStorage.setItem("munakr_session_user", JSON.stringify(updatedUser));
                                 
                                 const saved = localStorage.getItem("munakr_registered_users");
                                 if (saved) {
                                    try { 
                                       let usersList: any[] = JSON.parse(saved); 
                                       const updatedUsers = usersList.map(u => u.id === currentUser.id ? { ...u, preferences: updatedUser.preferences } : u);
                                       localStorage.setItem('munakr_registered_users', JSON.stringify(updatedUsers));
                                    } catch(e){}
                                 }
                                 showToast(isEn ? "All notifications enabled" : "Все уведомления включены", "success");
                              }
                            }}
                            className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                              allEnabled 
                                ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-500/20' 
                                : 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 text-opacity-80'
                            }`}
                         >
                            <Bell className={`w-3.5 h-3.5 ${allEnabled ? 'animate-bounce' : ''}`} />
                            {isEn ? "Enable All" : "Включить все"}
                         </motion.button>
                         <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (currentUser) {
                                 let updatedUser = { ...currentUser, preferences: { ...currentUser.preferences, emailAlerts: false, pushNotifications: false, newConferences: false, conferenceDateChanges: false, earlyBirdAlerts: false } };
                                 setCurrentUser(updatedUser);
                                 localStorage.setItem("munakr_session_user", JSON.stringify(updatedUser));
                                 
                                 const saved = localStorage.getItem("munakr_registered_users");
                                 if (saved) {
                                    try { 
                                       let usersList: any[] = JSON.parse(saved); 
                                       const updatedUsers = usersList.map(u => u.id === currentUser.id ? { ...u, preferences: updatedUser.preferences } : u);
                                       localStorage.setItem('munakr_registered_users', JSON.stringify(updatedUsers));
                                    } catch(e){}
                                 }
                                 showToast(isEn ? "All notifications muted" : "Все уведомления отключены", "success");
                              }
                            }}
                            className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                              allMuted
                                ? 'bg-rose-600 dark:bg-rose-500 text-white border-rose-600 dark:border-rose-500 shadow-md shadow-rose-500/20 opacity-100'
                                : 'bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 opacity-70'
                            }`}
                         >
                            <BellOff className={`w-3.5 h-3.5 ${allMuted ? 'animate-pulse' : ''}`} />
                            {isEn ? "Mute All" : "Отключить все"}
                         </motion.button>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                  
                  {/* Receive Emails Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">{isEn ? "Email Notifications" : "Email рассылки"}</h5>
                      <p className="text-[10px] text-slate-500 font-serif mt-0.5">{isEn ? "Receive important updates directly to your inbox." : "Получать важные обновления на вашу электронную почту."}</p>
                    </div>
                    <button 
                      onClick={() => handleTogglePreference('emailAlerts')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none ${currentUser.preferences?.emailAlerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className="sr-only">Toggle Email</span>
                      <span className={`pointer-events-none absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${currentUser.preferences?.emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50"></div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={!!currentUser.preferences?.newConferences}
                          onChange={() => handleTogglePreference('newConferences')}
                        />
                        <div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition"></div>
                        <CheckCircle2 className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition pointer-events-none" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{isEn ? "New Conferences" : "Новые конференции"}</span>
                        <span className="block text-[10px] text-slate-500 font-serif">{isEn ? "Get notified about new available conferences to register." : "Пользователи получают уведомления о появлении новых конференций, доступных для регистрации."}</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={!!currentUser.preferences?.conferenceDateChanges}
                          onChange={() => handleTogglePreference('conferenceDateChanges')}
                        />
                        <div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition"></div>
                        <CheckCircle2 className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition pointer-events-none" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{isEn ? "Change of Conference Date" : "Изменение даты конференции"}</span>
                        <span className="block text-[10px] text-slate-500 font-serif">{isEn ? "Alerts when conference date is changed or ended early." : "Уведомления об изменении даты проведения или досрочном завершении."}</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only" 
                          checked={!!currentUser.preferences?.earlyBirdAlerts}
                          onChange={() => handleTogglePreference('earlyBirdAlerts')}
                        />
                        <div className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition"></div>
                        <CheckCircle2 className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition pointer-events-none" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{isEn ? "End of Early Registration" : "Окончание сроков ранней регистрации"}</span>
                        <span className="block text-[10px] text-slate-500 font-serif">{isEn ? "Reminders before early registration windows close." : "Напоминания о скором завершении сроков ранней регистрации."}</span>
                      </div>
                    </label>
                  </div>

                </div>
              </div>
            )}

          </motion.div>
        )}
      </div>

      <AnimatePresence>
      {securityInfoModal && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{scale: 0.95, opacity: 0, y: 10}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.95, opacity: 0, y: 10}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full shadow-2xl space-y-4 text-left">
             <div className="flex items-center justify-between border-b pb-2">
                 <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                   <ShieldAlert className="w-5 h-5 text-indigo-600" />
                   {isEn ? "Security Actions Explained" : "Описание действий безопасности"}
                 </h2>
                 <button onClick={() => setSecurityInfoModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                   <X className="w-5 h-5" />
                 </button>
             </div>
             
             <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-red-700 uppercase mb-1">1. {isEn ? "Temporary Ban" : "Временный Бан"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Temporarily blocks access to the account for a specified number of days." : "Временно блокирует доступ пользователя к аккаунту на указанное количество дней. После истечения срока бан снимается."}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">2. {isEn ? "Permanent Ban" : "Перманентный Бан"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Permanently blocks access to the account without automatic removal." : "Навсегда блокирует доступ к аккаунту без автоматического снятия. Пользователь не сможет войти в систему."}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-orange-700 uppercase mb-1">3. {isEn ? "Restrict Account" : "Ограничить Аккаунт"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Allows login, but revokes ability to apply for conferences or submit proposals." : "Пользователь может войти в систему, но теряет возможность подавать заявки на конференции или предлагать новые."}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-purple-700 uppercase mb-1">4. {isEn ? "Soft Delete" : "Мягкое Удаление"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Marks the account as deleted and hides it from public lists, but keeps data in the database." : "Помечает аккаунт как удаленный и скрывает его из списков, но сохраняет данные в базе для возможного восстановления."}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-red-900 uppercase mb-1">5. {isEn ? "Permanent Delete" : "Полное Удаление"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Irreversibly removes the user and all their data from the database entirely." : "Безвозвратно удаляет пользователя и все связанные с ним данные из базы данных. Восстановление невозможно."}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-blue-700 uppercase mb-1">6. {isEn ? "Change Role" : "Изменить Роль"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Changes the user's privilege level (User, Organizer, Admin)." : "Изменяет уровень привилегий пользователя, например, делает его Организатором или возвращает к статусу обычного участника."}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">7. {isEn ? "Edit User Profile" : "Редактировать Профиль"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Allows admins to modify the user's name or email address directly." : "Позволяет администратору изменить имя или Email пользователя напрямую. Старый Email отвязывается."}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-200 uppercase mb-1">8. {isEn ? "Force Password Reset" : "Сбросить Пароль"}</p>
                  <p className="text-slate-600 dark:text-slate-400">{isEn ? "Manually sets a new password for the user, invalidating the previous one." : "Принудительно устанавливает новый пароль для учетной записи, старый пароль сразу становится недействительным."}</p>
                </div>
             </div>
             <div className="pt-2 border-t text-right">
                <button onClick={() => setSecurityInfoModal(false)} className="px-4 py-2 border rounded font-bold text-xs uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEn ? "Close" : "Закрыть"}</button>
             </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {actionModal.isOpen && actionModal.targetUser && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{scale: 0.95, opacity: 0, y: 10}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.95, opacity: 0, y: 10}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
             <div className="flex items-center gap-2 border-b pb-2">
                 <ShieldAlert className="w-5 h-5 text-red-600" />
                 <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
                   {actionModal.type === 'ban_temporary' ? (isEn ? "Apply Temporary Ban" : "Применить Временный Бан") : 
                    actionModal.type === 'ban_permanent' ? (isEn ? "Apply Permanent Ban" : "Применить Перманентный Бан") : 
                    actionModal.type === 'soft_delete' ? (isEn ? "Apply Soft Delete" : "Применить Мягкое Удаление") : 
                    actionModal.type === 'delete' ? (isEn ? "Apply Permanent Delete" : "Применить Полное Удаление") : 
                    actionModal.type === 'change_role' ? (isEn ? "Change Role" : "Изменить Роль") : 
                    actionModal.type === 'edit_user' ? (isEn ? "Edit User Profile" : "Редактировать Профиль") : 
                    actionModal.type === 'force_reset_password' ? (isEn ? "Force Password Reset" : "Принудительный Сброс Пароля") : 
                    actionModal.type === 'restrict' ? (isEn ? "Restrict User" : "Ограничить Пользователя") : (isEn ? "Restore Account (Unban)" : "Восстановить Аккаунт (Разбан)")}
                 </h2>
             </div>

             <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{isEn ? "Target User" : "Целевой Пользователь"}</p>
                <p className="font-bold">{actionModal.targetUser.name} <span className="font-normal text-xs text-slate-500">[{actionModal.targetUser.email}]</span></p>
             </div>

             {actionModal.type === "ban_temporary" && (
                <div>
                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "Duration (Days)" : "Продолжительность (Дней)"}</label>
                   <input type="number" min="1" max="365" value={actionDays} onChange={e => setActionDays(Number(e.target.value))} className="w-full border rounded p-2 text-sm mt-1" />
                </div>
             )}

             {actionModal.type === "edit_user" && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                   <div>
                     <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "Name" : "ФИО"}</label>
                     <input type="text" value={actionEditUser.name} onChange={e => setActionEditUser(p => ({...p, name: e.target.value}))} className="w-full border rounded p-2 text-sm mt-1 focus:border-slate-500 py-1.5" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "New Email" : "Новая Эл. Почта"}</label>
                     <input type="email" value={actionEditUser.email} onChange={e => setActionEditUser(p => ({...p, email: e.target.value}))} className="w-full border rounded p-2 text-sm mt-1 focus:border-slate-500 py-1.5" />
                   </div>
                </div>
             )}

             {actionModal.type === "force_reset_password" && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                   <div>
                     <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "New Password" : "Новый пароль"}</label>
                     <input type="text" placeholder={isEn ? "Enter new password manually..." : "Введите новый пароль вручную..."} value={actionManualPassword} onChange={e => setActionManualPassword(e.target.value)} className="w-full border rounded p-2 text-sm mt-1 focus:border-slate-500 py-1.5" />
                     <p className="text-[10px] text-slate-500 mt-1">{isEn ? "Leave empty to generate randomly" : "Оставьте пустым для авто-генерации"}</p>
                   </div>
                </div>
             )}

             {actionModal.type === "change_role" && (
                <div>
                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "New Role" : "Новая Роль"}</label>
                   <select value={actionNewRole} onChange={e => setActionNewRole(e.target.value as any)} className="w-full border rounded p-2 text-sm mt-1">
                      <option value="user">User / Delegate</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                   </select>
                </div>
             )}

             <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "Mandatory Reason (Public to User)" : "Обязательная Причина (Видна пользователю)"}</label>
                <select value={actionReason} onChange={e => setActionReason(e.target.value)} className="w-full border rounded p-2 text-sm mt-1">
                   <option value="">{isEn ? "Select Reason..." : "Выберите Причину..."}</option>
                   <option value="Suspicious Activity">{isEn ? "Suspicious Activity" : "Подозрительная активность"}</option>
                   <option value="Violation of Policy">{isEn ? "Violation of Policy / Rules" : "Нарушение политики / правил"}</option>
                   <option value="Spam / Bot Behavior">{isEn ? "Spam / Bot Behavior" : "Спам / Поведение бота"}</option>
                   <option value="Fraudulent Applications">{isEn ? "Fraudulent Applications" : "Мошеннические заявки"}</option>
                   <option value="Account Restored">{isEn ? "Account Restored (Unban)" : "Аккаунт Восстановлен (Разбан)"}</option>
                   <option value="Role Update">{isEn ? "Role Modification" : "Изменение роли"}</option>
                   <option value="Other">{isEn ? "Other (See comment)" : "Другое (См. комментарий)"}</option>
                </select>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{isEn ? "Admin Comment (Internal Audit)" : "Комментарий Администратора (Внутренний аудит)"}</label>
                <textarea value={actionComment} onChange={e => setActionComment(e.target.value)} className="w-full border rounded p-2 text-sm mt-1" rows={3} placeholder={isEn ? "Provide detailed explanation for audit logs..." : "Предоставьте подробное объяснение для журналов аудита..."}></textarea>
             </div>

             <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setActionModal({ isOpen: false, type: "ban_temporary" })} className="px-4 py-2 border rounded font-bold text-xs uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">{isEn ? "Cancel" : "Отмена"}</button>
                <button 
                  onClick={() => {
                     let finalReason = actionReason;
                     if (actionModal.type === "edit_user") finalReason = "User profile edited by admin";
                     if (actionModal.type === "force_reset_password") finalReason = "Password force reset by admin";
                     if (actionModal.type === "unban") {
                         if (!finalReason) finalReason = "Account Restored";
                         if (!actionComment) setActionComment("System automatic ban removed by admin");
                     }

                     if (!finalReason || (!actionComment && actionModal.type !== "unban" && actionModal.type !== "edit_user" && actionModal.type !== "force_reset_password")) {
                        showToast(isEn ? "Reason and Comment are mandatory constraints." : "Причина и Комментарий являются обязательными ограничениями.", "error"); return; 
                     }

                     const execAction = () => {
                         const saved = localStorage.getItem("munakr_registered_users");
                         if (!saved) return;
                         let usersList: AppUser[] = JSON.parse(saved);
                         const tIdx = usersList.findIndex(u => u.id === actionModal.targetUser!.id);
                         if (tIdx === -1) return;

                         if (actionModal.type === "delete") {
                            // Permanent delete
                            usersList = usersList.filter(u => u.id !== actionModal.targetUser!.id);
                            localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
                            logAdminAction(actionModal.type, actionModal.targetUser!, finalReason, actionComment);
                            setActionModal({ isOpen: false, type: "ban_temporary" });
                            setSecSelectedUser(null);
                            return;
                         }

                         const oldEmail = actionModal.targetUser!.email;
                         let actualComment = actionComment;

                         if (actionModal.type === "change_role") {
                            usersList[tIdx].role = actionNewRole;
                         } else if (actionModal.type === "soft_delete") {
                            usersList[tIdx].isDeleted = true;
                         } else if (actionModal.type === "edit_user") {
                            usersList[tIdx].name = actionEditUser.name;
                            usersList[tIdx].email = actionEditUser.email;
                            actualComment = `[EMAIL CHANGED] Old: ${oldEmail} -> New: ${actionEditUser.email}. Comment: ${actionComment}`;
                            
                            // Propagate email change to join requests
                            const savedReqs = localStorage.getItem("munakr_join_requests");
                            if (savedReqs) {
                                let reqs = JSON.parse(savedReqs);
                                let reqsChanged = false;
                                reqs = reqs.map((r: any) => { if (r.userId === usersList[tIdx].id) { reqsChanged = true; return { ...r, userEmail: actionEditUser.email }; } return r; });
                                if (reqsChanged) {
                                    localStorage.setItem("munakr_join_requests", JSON.stringify(reqs));
                                    setJoinRequests(reqs);
                                }
                            }
                            
                            // Propagate email change to conference creation requests
                            const savedConfReqs = localStorage.getItem("munakr_create_requests");
                            if (savedConfReqs) {
                                let creqs = JSON.parse(savedConfReqs);
                                let creqsChanged = false;
                                creqs = creqs.map((cr: any) => { if (cr.userId === usersList[tIdx].id) { creqsChanged = true; return { ...cr, userEmail: actionEditUser.email }; } return cr; });
                                if (creqsChanged) {
                                    localStorage.setItem("munakr_create_requests", JSON.stringify(creqs));
                                    setCreationRequests(creqs);
                                }
                            }
                            
                            // Update active session if the admin edited themselves
                            if (currentUser && currentUser.id === usersList[tIdx].id) {
                                const newSession = { ...currentUser, name: actionEditUser.name, email: actionEditUser.email };
                                setCurrentUser(newSession);
                                localStorage.setItem("munakr_session_user", JSON.stringify(newSession));
                            }
                         } else if (actionModal.type === "force_reset_password") {
                            let newPass = actionManualPassword.trim();
                            if (!newPass) {
                               const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                               for(let i=0; i<12; i++) newPass += chars.charAt(Math.floor(Math.random() * chars.length));
                            }
                            usersList[tIdx].password = newPass;
                            actualComment = `[PASSWORD SECURELY CHANGED] Admin manually reset the user's password. Comment: ${actionComment}`;
                            const recoveryText = isEn 
                               ? `Password changed successfully without requiring further verification.`
                               : `Пароль успешно изменен и сразу готов к использованию.`;
                            showToast(recoveryText, "success");
                         } else {
                            let newStatus: UserStatus = usersList[tIdx].status || "active";
                            if (actionModal.type === "ban_permanent") newStatus = "banned_permanent";
                            else if (actionModal.type === "ban_temporary") newStatus = "banned_temporary";
                            else if (actionModal.type === "restrict") newStatus = "restricted";
                            else if (actionModal.type === "unban" || actionModal.type === "unrestrict") {
                              newStatus = "active";
                              usersList[tIdx].isDeleted = false; // also unset soft_delete on restore
                              usersList[tIdx].riskLevel = "Low"; // Reset risk level
                              localStorage.removeItem(`munakr_failed_login_${usersList[tIdx].id}`);
                            }
                            usersList[tIdx].status = newStatus;
                         }

                         if (actionModal.type !== "edit_user" && actionModal.type !== "force_reset_password") {
                            usersList[tIdx].adminReason = finalReason;
                         }
                         usersList[tIdx].adminComment = actionComment;
                         
                         if (actionModal.type === "ban_temporary") {
                            usersList[tIdx].banExpiryDate = Date.now() + (actionDays * 24 * 60 * 60 * 1000);
                         } else if (actionModal.type !== "change_role" && actionModal.type !== "soft_delete") {
                            delete usersList[tIdx].banExpiryDate;
                         }

                         localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));

                         if (currentUser && currentUser.id === usersList[tIdx].id && (usersList[tIdx].status === "banned_permanent" || usersList[tIdx].status === "banned_temporary" || usersList[tIdx].isDeleted)) {
                            localStorage.removeItem("munakr_session_user");
                            window.location.reload();
                         }

                         logAdminAction(actionModal.type, usersList[tIdx], finalReason, actualComment, actionModal.type === "ban_temporary" ? actionDays : undefined);
                         
                         setActionModal({ isOpen: false, type: "ban_temporary" });
                         setSecSelectedUser(usersList[tIdx]); // update selected user view
                         showToast(isEn ? "Action executed successfully" : "Действие выполнено успешно", "success");
                     };

                     if (actionModal.type === "edit_user" || actionModal.type === "force_reset_password") {
                         setConfirmDialog({
                            title: actionModal.type === "edit_user" 
                                ? (isEn ? "Confirm Email & Profile Change" : "Подтвердите изменение Email")
                                : (isEn ? "Confirm Password Reset" : "Подтвердите изменение пароля"),
                            message: actionModal.type === "edit_user"
                                ? (isEn ? `Are you sure you want to change this user's email to ${actionEditUser.email}? The old email will be permanently untied from this account, and they will immediately use the new email for all services.` : `Вы уверены, что хотите изменить Email пользователя на ${actionEditUser.email}? Старый Email будет полностью отвязан от аккаунта, новый Email станет основным для входа, восстановления и уведомлений без дополнительного подтверждения.`)
                                : (isEn ? "Are you sure you want to change this user's password? The old password will immediately become invalid." : "Вы уверены? Старый пароль будет сброшен, новый вступит в силу немедленно."),
                            onConfirm: () => {
                                execAction();
                            }
                         });
                     } else {
                         execAction();
                     }
                  }}
                  className={`px-4 py-2 rounded font-bold text-white text-xs uppercase transition ${
                     actionModal.type === 'unban' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                   {actionModal.type === 'unban' ? (isEn ? 'Confirm Restore' : 'Подтвердить Восстановление') : (isEn ? 'Enforce Action' : 'Применить Действие')}
                </button>
             </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Reusable premium design confirmation modal to bypass standard iframe window.confirm blocks */}
      <AnimatePresence>
      {ratingModal && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{scale: 0.95, opacity: 0, y: 10}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.95, opacity: 0, y: 10}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-serif font-black text-[#1a365d] dark:text-[#80add0] text-lg uppercase tracking-wider">
                {isEn ? "Rate Conference" : "Оценка Конференции"}
              </h3>
              <button onClick={() => setRatingModal(null)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 font-sans">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">{ratingModal.confName}</p>
                <p className="text-sm">
                  {isEn ? "Please rate your experience from 1 to 5 stars. This rating influences the global AMUNKG top conferences list." : "Оцените ваш опыт участия от 1 до 5. Эта оценка напрямую влияет на глобальный рейтинг конференций AMUNKG."}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{isEn ? "Rating (1-5)" : "Оценка (1-5)"}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setConfRating(star)}
                      className={`p-2 transition-all rounded-full ${confRating >= star ? "text-[#c0a080] scale-110" : "text-slate-300 hover:text-slate-400"}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={confRating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest px-2">
                  <span>{isEn ? "Poor" : "Плохо"}</span>
                  <span>{isEn ? "Excellent" : "Отлично"}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">{isEn ? "Feedback (Optional)" : "Отзыв (Необязательно)"}</label>
                <textarea
                  value={confRatingComment}
                  onChange={(e) => setConfRatingComment(e.target.value)}
                  placeholder={isEn ? "Share what you liked or how to improve..." : "Поделитесь впечатлениями, что понравилось..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-3 text-sm min-h-[100px] focus:ring-1 focus:ring-[#1a365d] outline-none transition"
                />
              </div>

            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
              <button onClick={() => setRatingModal(null)} className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded uppercase tracking-wider transition">
                {isEn ? "Cancel" : "Отмена"}
              </button>
              <button 
                onClick={submitRating}
                className="bg-[#1a365d] hover:bg-[#112543] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded transition"
              >
                {isEn ? "Submit Rating" : "Оценить"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {viewingTextModal && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{scale: 0.95, opacity: 0, y: 10}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.95, opacity: 0, y: 10}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-serif font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-base">
                  {viewingTextModal.title}
                </h3>
                <p className="text-xs text-slate-500 font-serif mt-1">
                  {isEn ? "Applicant: " : "Кандидат: "}
                  <strong className="text-violet-700 dark:text-violet-400">{viewingTextModal.applicantName}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewingTextModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
              {viewingTextModal.text}
            </div>
            
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingTextModal(null)}
                className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-lg transition"
              >
                {isEn ? "Close" : "Закрыть"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {confirmDialog && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{scale: 0.95, opacity: 0, y: 10}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.95, opacity: 0, y: 10}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-red-50 text-red-600 p-2 rounded-full border border-red-100 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-500 font-serif leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded border transition"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition"
              >
                Подтвердить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Dynamic confirm / prompt modal */}
      <AnimatePresence>
      {modalAction && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{scale: 0.95, opacity: 0, y: 10}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.95, opacity: 0, y: 10}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full shadow-2xl space-y-4 text-left">
            <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {modalAction.title}
            </h3>
            {modalAction.type === "prompt" && (
              <input
                type="text"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                autoFocus
                className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100  rounded p-2 focus:border-[#1a365d] focus:outline-hidden"
              />
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded border transition"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  modalAction.onConfirm(modalAction.type === "prompt" ? modalInput : undefined);
                  setModalAction(null);
                }}
                className="px-4 py-2 bg-[#1a365d] hover:bg-[#1a365d]/90 text-white text-[10px] font-bold uppercase tracking-wider rounded transition shadow-2xs"
              >
                Готово
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {pendingReceipt && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{scale: 0.95, opacity: 0, y: 10}} animate={{scale: 1, opacity: 1, y: 0}} exit={{scale: 0.95, opacity: 0, y: 10}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm w-full shadow-2xl overflow-hidden flex flex-col text-left">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-serif font-black text-sm text-[#1a365d] dark:text-[#80add0] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {isEn ? "Confirm Receipt" : "Подтверждение чека"}
                </h3>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh]">
               <p className="text-xs text-slate-500 font-serif mb-4">
                 {isEn ? "Please review the receipt before sending it." : "Пожалуйста, проверьте загруженный чек перед отправкой."}
               </p>
               <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center">
                 {pendingReceipt.url.startsWith('data:image') ? (
                    <img src={pendingReceipt.url} alt="Receipt preview" className="max-w-full max-h-64 object-contain rounded" />
                 ) : (
                    <div className="p-4 w-full text-center break-all line-clamp-3 text-xs text-slate-500 font-mono">
                      {pendingReceipt.name}
                    </div>
                 )}
               </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2 shrink-0">
               <button
                 type="button"
                 onClick={() => setPendingReceipt(null)}
                 className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-lg transition"
               >
                 {isEn ? "Cancel" : "Отмена"}
               </button>
               <button
                 type="button"
                 onClick={() => {
                   handleUpdateJoinRequest(pendingReceipt.reqId, { 
                     status: "payment_review", 
                     paymentReceiptUrl: pendingReceipt.url 
                   });
                   setPendingReceipt(null);
                 }}
                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
               >
                 {isEn ? "Send Receipt" : "Отправить"}
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
