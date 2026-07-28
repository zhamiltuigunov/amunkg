import { AppUser, RiskLevel, SecurityEvent, AdminActionLog } from "./types";

const MAX_ACTIONS_PER_MINUTE = 15;
const ACTION_LOG_KEY = "munakr_action_log";

export function logSecurityEvent(userId: string, email: string, type: string, description: string, riskLevel: RiskLevel) {
   let events: SecurityEvent[] = [];
   const saved = localStorage.getItem("munakr_security_events");
   if (saved) {
      try { events = JSON.parse(saved); } catch(e) {}
   }
   
   events.unshift({
      id: "sec_" + Date.now() + "_" + Math.floor(Math.random()*1000),
      userId,
      userEmail: email,
      type,
      riskLevel,
      deviceInfo: navigator.userAgent,
      timestamp: Date.now(),
      description
   });
   
   localStorage.setItem("munakr_security_events", JSON.stringify(events));
   
   if (riskLevel === "Critical" || riskLevel === "High") {
       // Also elevate the user's risk profile
       let usersList: AppUser[] = [];
       const savedUsers = localStorage.getItem("munakr_registered_users");
       if (savedUsers) {
           try { usersList = JSON.parse(savedUsers); } catch(e) {}
           const idx = usersList.findIndex((u) => u.id === userId || u.email === email);
           if (idx !== -1) {
               const u = usersList[idx];
               const currentRiskMap = { "Low": 1, "Medium": 2, "High": 3, "Critical": 4 };
               const newRiskMap = { "Low": 1, "Medium": 2, "High": 3, "Critical": 4 };
               if ((newRiskMap[riskLevel as keyof typeof newRiskMap] || 1) > (currentRiskMap[u.riskLevel as keyof typeof currentRiskMap || "Low"])) {
                   usersList[idx].riskLevel = riskLevel;
               }
               
               // Auto-ban if Critical Threat
               if (riskLevel === "Critical" && usersList[idx].status === "active") {
                   usersList[idx].status = "banned_temporary";
                   usersList[idx].banExpiryDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days ban
                   usersList[idx].adminReason = "System Auto-Ban: " + type;
                   usersList[idx].adminComment = "Автоматическая блокировка системой безопасности из-за критической угрозы.";
                   
                   // Add Admin Action Log for the AI Agent
                   let logs: AdminActionLog[] = [];
                   const savedLogs = localStorage.getItem("munakr_admin_logs");
                   if (savedLogs) {
                       try { logs = JSON.parse(savedLogs); } catch(e) {}
                   }
                   logs.unshift({
                      id: "sec_act_" + Date.now(),
                      adminId: "system",
                      adminName: "AI Security System",
                      targetUserId: userId,
                      targetUserEmail: email,
                      actionType: "ban_temporary",
                      reason: "Suspicious Activity",
                      comment: "Auto-banned by system due to critical threat: " + description,
                      timestamp: Date.now(),
                      expiryDate: usersList[idx].banExpiryDate
                   });
                   localStorage.setItem("munakr_admin_logs", JSON.stringify(logs));
                   
                   // Mock sending email notification to Chief Administrator
                   console.log(`[EMAIL DISPATCHED] To: Chief Administrator. Subject: CRITICAL SECURITY ALERT - User Auto-Banned. Body: User ${email} has been automatically banned due to a critical threat: ${type}`);
                   
                   // Log a toast / notification logic here... (we do this by dispatching an event maybe, but for now it's in DB).
               }
               
               localStorage.setItem("munakr_registered_users", JSON.stringify(usersList));
               
               // If the user being auto-banned is currently logged in, force session invalidate
               const currentUser = localStorage.getItem("munakr_session_user");
               if (currentUser) {
                  try {
                      const cUser = JSON.parse(currentUser);
                      if (cUser.id === userId && riskLevel === "Critical") {
                          localStorage.removeItem("munakr_session_user");
                          window.dispatchEvent(new Event("local-storage"));
                          // Window will reload on its own or handled by components
                      }
                  } catch(e) {}
               }
           }
       }
   }
}

export function trackUserAction(userId: string, email: string, actionName: string) {
    if (!userId) return; // Only track signed-in actions for this logic
    
    interface ActionLog {
        ts: number;
        userId: string;
        action: string;
    }
    
    let logs: ActionLog[] = [];
    const saved = localStorage.getItem(ACTION_LOG_KEY);
    if (saved) {
        try { logs = JSON.parse(saved); } catch(e) {}
    }
    
    const now = Date.now();
    // Clean up older than 1 minute
    logs = logs.filter(l => now - l.ts < 60000);
    logs.push({ ts: now, userId, action: actionName });
    localStorage.setItem(ACTION_LOG_KEY, JSON.stringify(logs));
    
    const userActionsInLastMinute = logs.filter(l => l.userId === userId).length;
    
    if (userActionsInLastMinute > MAX_ACTIONS_PER_MINUTE) {
        logSecurityEvent(userId, email, "rate_limit_exceeded", "Massive requests/DDoS-like behavior detected. Actions in last minute: " + userActionsInLastMinute, "Critical");
        return false; // Action rejected
    }
    return true; // Action allowed
}
