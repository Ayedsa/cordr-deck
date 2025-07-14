const CordrDataManager = require('../shared_data');

describe('calculateDerivedValues', () => {
    beforeEach(() => {
        global.localStorage = {
            store: {},
            getItem(key) { return this.store[key] || null; },
            setItem(key, value) { this.store[key] = value; },
            removeItem(key) { delete this.store[key]; },
            clear() { this.store = {}; }
        };
    });

    test('computes revenues and scaling factor correctly', () => {
        const manager = new CordrDataManager();
        manager.update({
            'businessModel.numTrips': 1000,
            'businessModel.riderFare': 50,
            'businessModel.cordrFeeValue': 10,
            'businessModel.numCompanies': 10,
            'businessModel.subscriptionFee': 100
        });

        const result = manager.calculateDerivedValues();

        expect(result.cordrTripRevenue).toBeCloseTo(5000);
        expect(result.subscriptionRevenue).toBeCloseTo(12000);
        expect(result.totalCordrRevenue).toBeCloseTo(17000);
        expect(result.scalingFactor).toBeCloseTo(0.017);

        const revenues = manager.get('financials.revenue');
        expect(revenues[0]).toBeCloseTo(1); // max(scaling*0.1,1)
        expect(revenues[1]).toBeCloseTo(0.0085);
        expect(revenues[2]).toBeCloseTo(0.017);
    });
});
