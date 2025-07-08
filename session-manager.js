// Session Management for CORDR Presentation
// This module handles saving, loading, and managing presentation sessions

import { database, ref, set, get, push, remove, child, onValue, off } from './firebase-config.js';

class SessionManager {
  constructor() {
    this.currentUser = null;
    this.currentSessionId = null;
    this.sessionData = {};
    this.sessionsRef = null; // Reference to user's sessions in Realtime DB
  }

  // Initialize session manager with user authentication
  async init(user) {
    this.currentUser = user;
    if (user) {
      this.sessionsRef = ref(database, `users/${user.uid}/sessions`);
      await this.loadUserSessions();
    }
  }

  // Save current session data to Firebase Realtime Database
  async saveSession(sessionName = null) {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }

    const sessionId = sessionName ? sessionName.replace(/[^a-zA-Z0-9]/g, "_") + `_${Date.now()}` : `session_${Date.now()}`;
    const sessionData = this.collectAllPageData();
    
    try {
      const sessionPath = `users/${this.currentUser.uid}/sessions/${sessionId}`;
      await set(ref(database, sessionPath), {
        userId: this.currentUser.uid,
        sessionName: sessionName || `Session ${new Date().toLocaleString()}`,
        data: sessionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      this.currentSessionId = sessionId;
      return sessionId;
    } catch (error) {
      console.error("Error saving session:", error);
      throw error;
    }
  }

  // Load a specific session from Firebase Realtime Database
  async loadSession(sessionId) {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      const snapshot = await get(child(this.sessionsRef, sessionId));
      if (snapshot.exists()) {
        const session = snapshot.val();
        this.currentSessionId = sessionId;
        this.sessionData = session.data;
        this.applySessionData();
        return session;
      } else {
        throw new Error("Session not found");
      }
    } catch (error) {
      console.error("Error loading session:", error);
      throw error;
    }
  }

  // Get all sessions for current user from Firebase Realtime Database
  async getUserSessions() {
    if (!this.currentUser) {
      return []; // No user, no sessions
    }

    try {
      const snapshot = await get(this.sessionsRef);
      if (snapshot.exists()) {
        const sessionsObject = snapshot.val();
        // Convert object of sessions to an array
        return Object.keys(sessionsObject).map(key => ({
          sessionId: key,
          ...sessionsObject[key]
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error getting user sessions:", error);
      throw error;
    }
  }

  // Delete a session from Firebase Realtime Database
  async deleteSession(sessionId) {
    if (!this.currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      await remove(child(this.sessionsRef, sessionId));
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
        this.sessionData = {};
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  // Collect data from all pages (still using localStorage for now)
  collectAllPageData() {
    const data = {};
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith("cordr_")) {
        data[key] = localStorage.getItem(key);
      }
    });
    return data;
  }

  // Apply session data to all pages (still using localStorage for now)
  applySessionData() {
    Object.keys(this.sessionData).forEach(key => {
      if (key.startsWith("cordr_")) {
        localStorage.setItem(key, this.sessionData[key]);
      }
    });
    // Trigger page refresh or data reload
    if (window.updatePageContent) {
      window.updatePageContent(); // Assuming updatePageContent handles current language
    }
  }

  // Load user sessions on init (now handled by getUserSessions)
  async loadUserSessions() {
    console.log("Loading user sessions...");
    // No explicit action needed here, getUserSessions will be called when needed
  }
}

// Export singleton instance
const sessionManager = new SessionManager();
export default sessionManager;


