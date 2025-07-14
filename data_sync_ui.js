// CORDR Data Synchronization UI Components
// This file provides UI components to show data linking and synchronization status

class DataSyncUI {
    constructor() {
        this.createSyncIndicator();
        this.createDataLinkBadges();
        this.setupSyncNotifications();
    }

    // Create a sync indicator in the top-right corner
    createSyncIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'sync-indicator';
        indicator.innerHTML = `
            <div class="sync-status">
                <i class="fas fa-sync-alt" id="sync-icon"></i>
                <span id="sync-text" data-lang-en="Synced" data-lang-ar="متزامن">Synced</span>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #sync-indicator {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 999;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(-10px);
            }
            
            body.ar #sync-indicator {
                right: auto;
                left: 20px;
            }
            
            #sync-indicator.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            #sync-indicator.syncing {
                background: linear-gradient(135deg, #f59e0b, #d97706);
            }
            
            #sync-indicator.error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
            }
            
            .sync-status {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            #sync-icon {
                font-size: 12px;
            }
            
            #sync-indicator.syncing #sync-icon {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .data-link-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: rgba(59, 130, 246, 0.1);
                color: #3b82f6;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
                margin-left: 8px;
                border: 1px solid rgba(59, 130, 246, 0.2);
            }
            
            body.ar .data-link-badge {
                margin-left: 0;
                margin-right: 8px;
            }
            
            .data-link-badge i {
                font-size: 8px;
            }
            
            .sync-notification {
                position: fixed;
                top: 120px;
                right: 20px;
                z-index: 998;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                max-width: 300px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
            
            body.ar .sync-notification {
                right: auto;
                left: 20px;
                transform: translateX(-100%);
            }
            
            .sync-notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .sync-notification-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                font-weight: 600;
                color: #374151;
            }
            
            .sync-notification-body {
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
            }
            
            .linked-input {
                position: relative;
            }
            
            .linked-input::after {
                content: '';
                position: absolute;
                top: -2px;
                right: -2px;
                bottom: -2px;
                left: -2px;
                border: 2px solid transparent;
                border-radius: 8px;
                background: linear-gradient(45deg, #3b82f6, #10b981) border-box;
                -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: destination-out;
                mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                mask-composite: exclude;
                pointer-events: none;
                opacity: 0.6;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(indicator);
        
        // Show indicator after a brief delay
        setTimeout(() => {
            indicator.classList.add('show');
        }, 500);
    }

    // Create badges for linked data fields
    createDataLinkBadges() {
        // This will be called by individual calculators to mark linked fields
        window.addDataLinkBadge = (element, sourceCalculator) => {
            if (!element || element.querySelector('.data-link-badge')) return;
            
            const badge = document.createElement('span');
            badge.className = 'data-link-badge';
            badge.innerHTML = `
                <i class="fas fa-link"></i>
                <span data-lang-en="Linked to ${sourceCalculator}" data-lang-ar="مرتبط بـ ${sourceCalculator}">Linked to ${sourceCalculator}</span>
            `;
            
            // Add badge after the element
            if (element.parentNode) {
                element.parentNode.insertBefore(badge, element.nextSibling);
            }
        };
        
        // Mark input as linked
        window.markAsLinkedInput = (inputElement) => {
            if (inputElement) {
                inputElement.classList.add('linked-input');
            }
        };
    }

    // Setup sync notifications
    setupSyncNotifications() {
        let notificationTimeout;
        
        window.showSyncNotification = (title, message, type = 'info') => {
            // Clear existing notification
            const existing = document.getElementById('sync-notification');
            if (existing) {
                existing.remove();
            }
            
            const notification = document.createElement('div');
            notification.id = 'sync-notification';
            notification.className = 'sync-notification';
            
            const iconMap = {
                info: 'fas fa-info-circle',
                success: 'fas fa-check-circle',
                warning: 'fas fa-exclamation-triangle',
                error: 'fas fa-times-circle'
            };
            
            notification.innerHTML = `
                <div class="sync-notification-header">
                    <i class="${iconMap[type] || iconMap.info}"></i>
                    <span>${title}</span>
                </div>
                <div class="sync-notification-body">${message}</div>
            `;
            
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            // Auto-hide after 3 seconds
            clearTimeout(notificationTimeout);
            notificationTimeout = setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        };
    }

    // Update sync status
    static updateSyncStatus(status = 'synced') {
        const indicator = document.getElementById('sync-indicator');
        const icon = document.getElementById('sync-icon');
        const text = document.getElementById('sync-text');
        
        if (!indicator || !icon || !text) return;
        
        // Remove all status classes
        indicator.classList.remove('syncing', 'error');
        
        switch (status) {
            case 'syncing':
                indicator.classList.add('syncing');
                icon.className = 'fas fa-sync-alt';
                text.textContent = window.currentLang === 'ar' ? 'جاري المزامنة...' : 'Syncing...';
                break;
            case 'error':
                indicator.classList.add('error');
                icon.className = 'fas fa-exclamation-triangle';
                text.textContent = window.currentLang === 'ar' ? 'خطأ في المزامنة' : 'Sync Error';
                break;
            case 'synced':
            default:
                icon.className = 'fas fa-check';
                text.textContent = window.currentLang === 'ar' ? 'متزامن' : 'Synced';
                break;
        }
    }

    // Show data flow visualization
    static showDataFlow(fromCalculator, toCalculator, dataType) {
        const message = window.currentLang === 'ar' ? 
            `تم تحديث ${dataType} من ${fromCalculator} إلى ${toCalculator}` :
            `${dataType} updated from ${fromCalculator} to ${toCalculator}`;
            
        window.showSyncNotification(
            window.currentLang === 'ar' ? 'تزامن البيانات' : 'Data Sync',
            message,
            'success'
        );
    }
}

// Enhanced data synchronization with UI feedback
class EnhancedDataSync {
    constructor() {
        this.setupDataListeners();
        this.setupCurrencySync();
    }

    setupDataListeners() {
        if (window.CordrData) {
            // Listen for business model changes that affect financial projections
            window.CordrData.subscribe((data) => {
                DataSyncUI.updateSyncStatus('syncing');
                
                setTimeout(() => {
                    DataSyncUI.updateSyncStatus('synced');
                    DataSyncUI.showDataFlow('Business Model', 'Financial Projections', 'Revenue Data');
                }, 500);
            }, ['businessModel.numTrips', 'businessModel.riderFare', 'businessModel.cordrFeeValue']);
            
            // Listen for team costs changes that affect investment requirements
            window.CordrData.subscribe((data) => {
                DataSyncUI.updateSyncStatus('syncing');
                
                setTimeout(() => {
                    DataSyncUI.updateSyncStatus('synced');
                    DataSyncUI.showDataFlow('Team Costs', 'Investment Calculator', 'Cost Data');
                }, 500);
            }, ['teamCosts.developmentPhases', 'teamCosts.teamMembers', 'teamCosts.additionalCosts']);
            
            // Listen for operational costs changes
            window.CordrData.subscribe((data) => {
                DataSyncUI.updateSyncStatus('syncing');
                
                setTimeout(() => {
                    DataSyncUI.updateSyncStatus('synced');
                    DataSyncUI.showDataFlow('Operational Costs', 'Financial Projections', 'Operating Expenses');
                }, 500);
            }, ['operationalCosts.categories']);
        }
    }

    setupCurrencySync() {
        // Global currency synchronization
        window.syncCurrencyAcrossCalculators = (newCurrency) => {
            DataSyncUI.updateSyncStatus('syncing');
            
            if (window.CordrData) {
                window.CordrData.syncCurrency(newCurrency);
            }
            
            setTimeout(() => {
                DataSyncUI.updateSyncStatus('synced');
                window.showSyncNotification(
                    window.currentLang === 'ar' ? 'تزامن العملة' : 'Currency Sync',
                    window.currentLang === 'ar' ? 
                        `تم تحديث جميع الحاسبات إلى ${newCurrency}` :
                        `All calculators updated to ${newCurrency}`,
                    'success'
                );
            }, 800);
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DataSyncUI();
    new EnhancedDataSync();
});

console.log('Data Sync UI components loaded');

