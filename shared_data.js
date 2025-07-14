// CORDR Shared Data Management System
// This file manages data synchronization between different calculator pages

class CordrDataManager {
    constructor() {
        this.storageKey = 'cordrSharedData';
        this.data = this.loadData();
        this.listeners = new Map();
        this.initializeDefaults();
    }

    // Initialize default values if not present
    initializeDefaults() {
        const defaults = {
            // Business Model Data
            businessModel: {
                numTrips: 10000,
                numCompanies: 10,
                subscriptionFee: 1000,
                riderFare: 100,
                driverPayoutValue: 60,
                cordrFeeValue: 40,
                currency: 'SAR',
                exchangeRate: 3.75,
                vatRate: 15,
                tripsGrowthRate: 5,
                newSubsPerQuarter: 2,
                externalFees: [],
                additionalServices: []
            },
            
            // Financial Projections Data
            financials: {
                revenue: [5.2, 42.8, 350.0],
                expenses: [4.1, 28.5, 210.0],
                currency: 'USD',
                revenueBreakdown: {
                    subscriptions: 25,
                    commissions: 60,
                    services: 15
                }
            },
            
            // Investment Data
            investment: {
                totalInvestment: 2500000,
                fundingStages: [
                    { name: 'Seed Round', amount: 500000, timeline: 'Q1 2024' },
                    { name: 'Series A', amount: 2000000, timeline: 'Q3 2024' }
                ],
                currency: 'USD'
            },
            
            // Team & Costs Data
            teamCosts: {
                developmentPhases: [
                    { name: 'MVP Development', duration: 6, cost: 300000 },
                    { name: 'Beta Testing', duration: 3, cost: 150000 },
                    { name: 'Market Launch', duration: 3, cost: 200000 }
                ],
                teamMembers: [
                    { role: 'CEO', description: 'Chief Executive Officer', salary: 15000 },
                    { role: 'CTO', description: 'Chief Technology Officer', salary: 14000 },
                    { role: 'Lead Developer', description: 'Senior Full-Stack Developer', salary: 12000 }
                ],
                additionalCosts: [
                    { name: 'Office Rent', amount: 8000 },
                    { name: 'Marketing', amount: 15000 },
                    { name: 'Legal & Compliance', amount: 5000 }
                ],
                currency: 'SAR'
            },
            
            // Operational Costs Data
            operationalCosts: {
                categories: [
                    {
                        name: 'Technology Infrastructure',
                        items: [
                            { name: 'Cloud Hosting', amount: 5000 },
                            { name: 'Software Licenses', amount: 3000 }
                        ]
                    },
                    {
                        name: 'Marketing & Sales',
                        items: [
                            { name: 'Digital Marketing', amount: 20000 },
                            { name: 'Sales Team', amount: 25000 }
                        ]
                    }
                ],
                currency: 'SAR'
            },
            
            // Global Settings
            global: {
                currency: 'SAR',
                language: 'en',
                exchangeRates: {
                    USD: 1.00,
                    SAR: 3.75
                }
            }
        };

        // Merge defaults with existing data
        this.data = { ...defaults, ...this.data };
        this.saveData();
    }

    // Load data from localStorage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading shared data:', error);
            return {};
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            this.notifyListeners();
        } catch (error) {
            console.error('Error saving shared data:', error);
        }
    }

    // Get data by path (e.g., 'businessModel.numTrips')
    get(path) {
        const keys = path.split('.');
        let current = this.data;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    // Set data by path
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.data;
        
        // Navigate to the parent object
        for (const key of keys) {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[lastKey] = value;
        this.saveData();
    }

    // Update multiple values at once
    update(updates) {
        for (const [path, value] of Object.entries(updates)) {
            this.set(path, value);
        }
    }

    // Subscribe to data changes
    subscribe(callback, paths = []) {
        const id = Math.random().toString(36).substr(2, 9);
        this.listeners.set(id, { callback, paths });
        return id;
    }

    // Unsubscribe from data changes
    unsubscribe(id) {
        this.listeners.delete(id);
    }

    // Notify listeners of data changes
    notifyListeners() {
        this.listeners.forEach(({ callback, paths }) => {
            if (paths.length === 0) {
                // No specific paths, notify of all changes
                callback(this.data);
            } else {
                // Check if any of the specified paths changed
                const changedData = {};
                let hasChanges = false;
                
                paths.forEach(path => {
                    const value = this.get(path);
                    if (value !== undefined) {
                        changedData[path] = value;
                        hasChanges = true;
                    }
                });
                
                if (hasChanges) {
                    callback(changedData);
                }
            }
        });
    }

    // Calculate derived values based on business model data
    calculateDerivedValues() {
        const businessModel = this.data.businessModel;
        const numTrips = businessModel.numTrips || 0;
        const riderFare = businessModel.riderFare || 0;
        const cordrFeeValue = businessModel.cordrFeeValue || 0;
        const numCompanies = businessModel.numCompanies || 0;
        const subscriptionFee = businessModel.subscriptionFee || 0;

        // Calculate CORDR revenue from trips (assuming percentage-based fee)
        const cordrTripRevenue = numTrips * riderFare * (cordrFeeValue / 100);
        
        // Calculate subscription revenue
        const subscriptionRevenue = numCompanies * subscriptionFee * 12; // Annual

        // Calculate total CORDR revenue
        const totalCordrRevenue = cordrTripRevenue + subscriptionRevenue;

        // Update financial projections based on business model
        const currentFinancials = this.data.financials;
        const scalingFactor = totalCordrRevenue / 1000000; // Convert to millions

        // Auto-update Year 1 revenue based on business model calculations
        if (scalingFactor > 0) {
            currentFinancials.revenue[0] = Math.max(scalingFactor * 0.1, 1); // Conservative Year 1
            currentFinancials.revenue[1] = scalingFactor * 0.5; // Growth in Year 2
            currentFinancials.revenue[2] = scalingFactor; // Full potential in Year 3
        }

        this.set('financials.revenue', currentFinancials.revenue);

        return {
            cordrTripRevenue,
            subscriptionRevenue,
            totalCordrRevenue,
            scalingFactor
        };
    }

    // Convert currency values
    convertCurrency(amount, fromCurrency, toCurrency) {
        const rates = this.data.global.exchangeRates;
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            return amount;
        }
        
        // Convert to USD first, then to target currency
        const usdAmount = amount / rates[fromCurrency];
        return usdAmount * rates[toCurrency];
    }

    // Sync currency across all calculators
    syncCurrency(newCurrency) {
        const oldCurrency = this.data.global.currency;
        if (oldCurrency === newCurrency) return;

        // Update global currency
        this.set('global.currency', newCurrency);

        // Convert all monetary values
        const sections = ['businessModel', 'financials', 'investment', 'teamCosts', 'operationalCosts'];
        
        sections.forEach(section => {
            const sectionData = this.data[section];
            if (sectionData && sectionData.currency) {
                // Update section currency
                this.set(`${section}.currency`, newCurrency);
                
                // Convert monetary values in this section
                this.convertSectionCurrency(section, sectionData.currency, newCurrency);
            }
        });
    }

    // Convert monetary values in a specific section
    convertSectionCurrency(section, fromCurrency, toCurrency) {
        // This would contain specific conversion logic for each section
        // Implementation depends on the structure of each calculator
        console.log(`Converting ${section} from ${fromCurrency} to ${toCurrency}`);
    }

    // Export all data
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import data
    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.data = { ...this.data, ...imported };
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Reset all data to defaults
    reset() {
        localStorage.removeItem(this.storageKey);
        this.data = {};
        this.initializeDefaults();
    }
}

if (typeof window !== 'undefined') {
    // Create global instance when running in the browser
    window.CordrData = new CordrDataManager();

    // Helper functions for easy access
    window.getCordrData = (path) => window.CordrData.get(path);
    window.setCordrData = (path, value) => window.CordrData.set(path, value);
    window.updateCordrData = (updates) => window.CordrData.update(updates);
    window.subscribeCordrData = (callback, paths) => window.CordrData.subscribe(callback, paths);

    // Auto-sync derived values when business model changes
    window.CordrData.subscribe(() => {
        window.CordrData.calculateDerivedValues();
    }, ['businessModel.numTrips', 'businessModel.riderFare', 'businessModel.cordrFeeValue', 'businessModel.numCompanies', 'businessModel.subscriptionFee']);

    console.log('CORDR Data Management System initialized');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CordrDataManager;
}

