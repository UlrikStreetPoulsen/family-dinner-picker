// Menu loader for bilingual support
const fs = require('fs');
const path = require('path');

class MenuLoader {
    constructor() {
        this.menus = {};
        this.loadMenus();
    }

    loadMenus() {
        try {
            // Load starters
            const startersPath = path.join(__dirname, 'menus', 'starters.json');
            this.menus.starters = JSON.parse(fs.readFileSync(startersPath, 'utf8'));
            
            // Load mains
            const mainsPath = path.join(__dirname, 'menus', 'mains.json');
            this.menus.mains = JSON.parse(fs.readFileSync(mainsPath, 'utf8'));
        } catch (error) {
            console.error('Error loading menus:', error);
            // Fallback to empty menus
            this.menus = { starters: {}, mains: {} };
        }
    }

    getMenu(category, language = 'en') {
        if (!this.menus[category]) {
            return {};
        }

        const menu = {};
        Object.keys(this.menus[category]).forEach(id => {
            const item = this.menus[category][id];
            menu[id] = item[language] || item['en']; // Fallback to English
        });
        return menu;
    }

    getMenuList(category, language = 'en') {
        const menu = this.getMenu(category, language);
        return Object.keys(menu).map(id => ({
            id: parseInt(id),
            name: menu[id]
        })).sort((a, b) => a.id - b.id);
    }

    getItemName(category, id, language = 'en') {
        if (this.menus[category] && this.menus[category][id]) {
            return this.menus[category][id][language] || this.menus[category][id]['en'];
        }
        return `Unknown ${category} ${id}`;
    }

    getAllMenus(language = 'en') {
        return {
            starters: this.getMenu('starters', language),
            mains: this.getMenu('mains', language)
        };
    }
}

module.exports = new MenuLoader(); 