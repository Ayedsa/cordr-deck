// Firebase Data Management for CORDR Calculators
import { auth, database, ref, set, get, child, onAuthStateChanged } from './firebase-config.js';

class FirebaseDataManager {
    constructor() {
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        this.pendingWrites = [];
        
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (user) {
                this.loadUserData();
                this.processPendingWrites();
            }
        });

        // Listen for online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingWrites();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Get user-specific data path
    getUserDataPath(dataType = '') {
        if (!this.currentUser) return null;
        return `users/${this.currentUser.uid}/calculatorData${dataType ? '/' + dataType : ''}`;
    }

    // Save data to Firebase
    async saveData(dataType, data) {
        if (!this.currentUser) {
            console.warn('No user logged in, cannot save to Firebase');
            return false;
        }

        const dataPath = this.getUserDataPath(dataType);
        
        try {
            if (this.isOnline) {
                await set(ref(database, dataPath), {
                    ...data,
                    lastUpdated: Date.now(),
                    version: '1.0'
                });
                
                // Also save to localStorage as backup
                localStorage.setItem(`cordr_${dataType}`, JSON.stringify(data));
                
                console.log(`Data saved to Firebase: ${dataType}`);
                this.showSyncStatus('synced');
                return true;
            } else {
                // Queue for later when online
                this.pendingWrites.push({ dataType, data });
                localStorage.setItem(`cordr_${dataType}`, JSON.stringify(data));
                this.showSyncStatus('pending');
                return false;
            }
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            // Fallback to localStorage
            localStorage.setItem(`cordr_${dataType}`, JSON.stringify(data));
            this.showSyncStatus('error');
            return false;
        }
    }

    // Load data from Firebase
    async loadData(dataType) {
        if (!this.currentUser) {
            // Try to load from localStorage if no user
            const localData = localStorage.getItem(`cordr_${dataType}`);
            return localData ? JSON.parse(localData) : null;
        }

        const dataPath = this.getUserDataPath(dataType);
        
        try {
            const snapshot = await get(child(ref(database), dataPath));
            if (snapshot.exists()) {
                const firebaseData = snapshot.val();
                // Also update localStorage
                localStorage.setItem(`cordr_${dataType}`, JSON.stringify(firebaseData));
                console.log(`Data loaded from Firebase: ${dataType}`);
                return firebaseData;
            } else {
                // Try localStorage as fallback
                const localData = localStorage.getItem(`cordr_${dataType}`);
                return localData ? JSON.parse(localData) : null;
            }
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            // Fallback to localStorage
            const localData = localStorage.getItem(`cordr_${dataType}`);
            return localData ? JSON.parse(localData) : null;
        }
    }

    // Load all user data
    async loadUserData() {
        if (!this.currentUser) return;

        const dataTypes = [
            'businessModel',
            'financials', 
            'investment',
            'teamCosts',
            'operationalCosts',
            'settings'
        ];

        for (const dataType of dataTypes) {
            try {
                const data = await this.loadData(dataType);
                if (data) {
                    // Trigger data loaded event
                    window.dispatchEvent(new CustomEvent('firebaseDataLoaded', {
                        detail: { dataType, data }
                    }));
                }
            } catch (error) {
                console.error(`Error loading ${dataType}:`, error);
            }
        }
    }

    // Process pending writes when coming back online
    async processPendingWrites() {
        if (!this.isOnline || !this.currentUser || this.pendingWrites.length === 0) {
            return;
        }

        console.log(`Processing ${this.pendingWrites.length} pending writes...`);
        
        const writes = [...this.pendingWrites];
        this.pendingWrites = [];

        for (const { dataType, data } of writes) {
            try {
                await this.saveData(dataType, data);
            } catch (error) {
                console.error(`Failed to process pending write for ${dataType}:`, error);
                // Re-queue if failed
                this.pendingWrites.push({ dataType, data });
            }
        }
    }

    // Show sync status indicator
    showSyncStatus(status) {
        // Remove existing status indicators
        document.querySelectorAll('.firebase-sync-status').forEach(el => el.remove());

        const statusElement = document.createElement('div');
        statusElement.className = 'firebase-sync-status';
        statusElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10000;
            transition: all 0.3s ease;
        `;

        switch (status) {
            case 'synced':
                statusElement.textContent = '✓ Synced';
                statusElement.style.background = '#10b981';
                statusElement.style.color = 'white';
                break;
            case 'pending':
                statusElement.textContent = '⏳ Pending';
                statusElement.style.background = '#f59e0b';
                statusElement.style.color = 'white';
                break;
            case 'error':
                statusElement.textContent = '⚠ Offline';
                statusElement.style.background = '#ef4444';
                statusElement.style.color = 'white';
                break;
        }

        document.body.appendChild(statusElement);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.remove();
            }
        }, 3000);
    }

    // Export all user data
    async exportUserData() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        const userData = {};
        const dataTypes = ['businessModel', 'financials', 'investment', 'teamCosts', 'operationalCosts', 'settings'];

        for (const dataType of dataTypes) {
            userData[dataType] = await this.loadData(dataType);
        }

        return {
            userId: this.currentUser.uid,
            email: this.currentUser.email,
            exportDate: new Date().toISOString(),
            data: userData
        };
    }

    // Import user data
    async importUserData(importData) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        if (!importData.data) {
            throw new Error('Invalid import data format');
        }

        for (const [dataType, data] of Object.entries(importData.data)) {
            if (data) {
                await this.saveData(dataType, data);
            }
        }

        // Reload the page to reflect imported data
        window.location.reload();
    }

    // Clear all user data
    async clearUserData() {
        if (!this.currentUser) return;

        const dataTypes = ['businessModel', 'financials', 'investment', 'teamCosts', 'operationalCosts', 'settings'];
        
        for (const dataType of dataTypes) {
            try {
                const dataPath = this.getUserDataPath(dataType);
                await set(ref(database, dataPath), null);
                localStorage.removeItem(`cordr_${dataType}`);
            } catch (error) {
                console.error(`Error clearing ${dataType}:`, error);
            }
        }
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Create global instance
window.firebaseDataManager = new FirebaseDataManager();

// Enhanced shared data system with Firebase integration
class EnhancedSharedData {
    constructor() {
        this.data = {
            businessModel: {},
            financials: {},
            investment: {},
            teamCosts: {},
            operationalCosts: {},
            settings: { currency: 'USD', language: 'en' }
        };

        // Load data on initialization
        this.loadAllData();

        // Listen for Firebase data loaded events
        window.addEventListener('firebaseDataLoaded', (event) => {
            const { dataType, data } = event.detail;
            this.data[dataType] = { ...this.data[dataType], ...data };
            this.notifyDataChange(dataType);
        });
    }

    async loadAllData() {
        for (const dataType of Object.keys(this.data)) {
            const savedData = await window.firebaseDataManager.loadData(dataType);
            if (savedData) {
                this.data[dataType] = { ...this.data[dataType], ...savedData };
            }
        }
        this.notifyDataChange('all');
    }

    set(section, key, value) {
        if (!this.data[section]) {
            this.data[section] = {};
        }
        this.data[section][key] = value;
        
        // Save to Firebase
        window.firebaseDataManager.saveData(section, this.data[section]);
        
        this.notifyDataChange(section);
    }

    get(section, key) {
        return this.data[section] ? this.data[section][key] : undefined;
    }

    getSection(section) {
        return this.data[section] || {};
    }

    setSection(section, data) {
        this.data[section] = { ...this.data[section], ...data };
        
        // Save to Firebase
        window.firebaseDataManager.saveData(section, this.data[section]);
        
        this.notifyDataChange(section);
    }

    notifyDataChange(section) {
        window.dispatchEvent(new CustomEvent('sharedDataChanged', {
            detail: { section, data: this.data[section] }
        }));
    }

    // Export data for download
    exportData() {
        return window.firebaseDataManager.exportUserData();
    }

    // Import data from file
    importData(data) {
        return window.firebaseDataManager.importUserData(data);
    }
}

// Replace the existing shared data system
window.sharedData = new EnhancedSharedData();

export { FirebaseDataManager };

