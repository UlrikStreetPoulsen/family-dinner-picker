// Data management for family dinner selections
// In-memory storage (data resets when server restarts - perfect for vacation app)

class SelectionsManager {
    constructor() {
        // Format: { "YYYY-MM-DD": { "PersonName": { starter, main, timestamp } } }
        this.selections = {};
    }

    getTodaysDate() {
        return new Date().toISOString().split('T')[0];
    }

    getTodaysSelections() {
        const today = this.getTodaysDate();
        return this.selections[today] || {};
    }

    saveSelection(person, starter, main) {
        const today = this.getTodaysDate();
        
        if (!this.selections[today]) {
            this.selections[today] = {};
        }
        
        this.selections[today][person] = {
            starter,
            main,
            timestamp: new Date().toISOString()
        };
        
        return true;
    }

    getSelectionSummary() {
        const todaysSelections = this.getTodaysSelections();
        
        // Count quantities for each dish
        const starterCounts = {};
        const mainCounts = {};
        
        Object.values(todaysSelections).forEach(selection => {
            if (selection.starter) {
                starterCounts[selection.starter] = (starterCounts[selection.starter] || 0) + 1;
            }
            if (selection.main) {
                mainCounts[selection.main] = (mainCounts[selection.main] || 0) + 1;
            }
        });
        
        return {
            individual: todaysSelections,
            starters: starterCounts,
            mains: mainCounts,
            date: this.getTodaysDate()
        };
    }

    resetTodaysSelections() {
        const today = this.getTodaysDate();
        delete this.selections[today];
        return true;
    }

    // For debugging - see all stored data
    getAllData() {
        return this.selections;
    }
}

// Export singleton instance
module.exports = new SelectionsManager(); 