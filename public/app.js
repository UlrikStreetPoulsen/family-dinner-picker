// Family Dinner Picker - Frontend JavaScript

// Authentication state
let isAuthenticated = false;
let authPassword = '';

// Static Data
const FAMILY_MEMBERS = [
    'Simon', 'Alison', 'Tom', 'Jane', 'Riona', 'Matthew', 'Ali', 
    'Karin', 'Klara', 'Oliver', 'Erica', 'Ulrik', 'Finley', 'Aria'
];

const STARTERS = [
    'Gazpacho with seasonal vegetables and feta brunoise (VE)',
    'Thai prawn and haddock tartare with exotic flavor',
    'Carpaccio of pineapple tomatoes and beetroot, spicy burrata (VE)',
    'Fish ceviche marinated with lime',
    'Melon fan, Savoy ham chiffonade',
    'Tex-Mex salad, hot spicy goat cheese'
];

const MAINS = [
    'Poke Bowl (VE/VG)',
    'Shrimp Poke Bowl',
    'Caramelized pork tenderloin medallion with soy and sesame seeds, lime powder',
    'Crispy chicken supreme with smoked paprika, mashed sweet potato, young shoots',
    'Caramelized pork ribs with spices',
    'Low-temperature braised veal shoulder with wild mushrooms',
    'Ardoisières Trout Fillet and its Virgin',
    'Sea bass fillet with tapenade and sundried tomatoes, basil',
    'Linguine with saffron and crab coulis (VE)',
    'Malfalde with Bolognese and Pecorino',
    'Vegetable tian with tomato lentils, old-fashioned flavors (vegan/veggie)',
    'Homemade nuggets and homemade fries',
    'Linguine carbonara'
];

// Global state
let currentSelections = {};
let pollingInterval;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const personSelect = document.getElementById('person-select');
const menuSelection = document.getElementById('menu-selection');
const selectionContext = document.getElementById('selection-context');
const starterSelect = document.getElementById('starter-select');
const mainSelect = document.getElementById('main-select');
const saveButton = document.getElementById('save-selection');
const currentDate = document.getElementById('current-date');
const clearAllBtn = document.getElementById('clear-all-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupAuthEventListeners();
    checkAuthStatus();
});

function initializeApp() {
    // Set current date
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    currentDate.textContent = today;
    
    // Populate family members dropdown
    populateSelect(personSelect, FAMILY_MEMBERS);
    
    // Populate menu dropdowns
    populateSelect(starterSelect, STARTERS);
    populateSelect(mainSelect, MAINS);
}

function populateSelect(selectElement, options) {
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

function setupAuthEventListeners() {
    // Login form
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
}

function checkAuthStatus() {
    // Check if user is already authenticated (stored in sessionStorage)
    const storedPassword = sessionStorage.getItem('dinnerPickerAuth');
    if (storedPassword) {
        authPassword = storedPassword;
        isAuthenticated = true;
        showMainApp();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    mainApp.style.display = 'none';
    passwordInput.focus();
}

function showMainApp() {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    initializeApp();
    setupEventListeners();
    startPolling();
}

async function handleLogin() {
    const password = passwordInput.value.trim();
    
    if (!password) {
        showLoginError('Please enter a password');
        return;
    }
    
    try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authPassword = password;
            isAuthenticated = true;
            sessionStorage.setItem('dinnerPickerAuth', password);
            showMainApp();
        } else {
            showLoginError('Invalid password');
        }
    } catch (error) {
        showLoginError('Login failed. Please try again.');
        console.error('Login error:', error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    setTimeout(() => {
        loginError.style.display = 'none';
    }, 3000);
}

function handleLogout() {
    isAuthenticated = false;
    authPassword = '';
    sessionStorage.removeItem('dinnerPickerAuth');
    showLoginScreen();
    passwordInput.value = '';
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Person selection
    personSelect.addEventListener('change', onPersonSelected);
    
    // Save selection
    saveButton.addEventListener('click', saveSelection);
    
    // Clear all selections
    clearAllBtn.addEventListener('click', clearAllSelections);
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Refresh content based on active tab
    if (tabName === 'summary') {
        refreshSummary();
    }
}

function onPersonSelected() {
    const selectedPerson = personSelect.value;
    
    if (selectedPerson) {
        // Show menu selection
        menuSelection.style.display = 'block';
        selectionContext.textContent = `Selecting for ${selectedPerson} - ${new Date().toLocaleDateString()}`;
        
        // Pre-populate if person has existing selections
        const existingSelection = currentSelections[selectedPerson];
        if (existingSelection) {
            starterSelect.value = existingSelection.starter || '';
            mainSelect.value = existingSelection.main || '';
        } else {
            starterSelect.value = '';
            mainSelect.value = '';
        }
    } else {
        menuSelection.style.display = 'none';
    }
}

async function saveSelection() {
    const person = personSelect.value;
    const starter = starterSelect.value;
    const main = mainSelect.value;
    
    if (!person) {
        alert('Please select a family member');
        return;
    }
    
    // Handle empty strings as no selection
    const hasStarter = starter && starter.trim() !== '';
    const hasMain = main && main.trim() !== '';
    
    if (!hasStarter && !hasMain) {
        alert('Please select at least a starter OR a main course');
        return;
    }
    
    try {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        
        const response = await fetch('/api/select', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'password': authPassword
            },
            body: JSON.stringify({ person, starter, main })
        });
        
        if (response.ok) {
            // Show success  
            const parts = [];
            if (hasStarter) parts.push('starter');
            if (hasMain) parts.push('main');
            showSuccessMessage(`Saved ${parts.join(' and ')} for ${person}!`);
            
            // Reset form
            personSelect.value = '';
            menuSelection.style.display = 'none';
            
            // Refresh data
            await fetchCurrentSelections();
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || 'Failed to save selection');
        }
    } catch (error) {
        alert(`Error saving selection: ${error.message}`);
        console.error('Save error:', error);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Selection';
    }
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) existingMessage.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.querySelector('.selection-form');
    form.insertBefore(successDiv, form.firstChild);
    
    setTimeout(() => successDiv.remove(), 3000);
}

async function clearAllSelections() {
    // Confirmation dialog
    const confirmed = confirm(
        `Are you sure you want to clear all dinner selections for ${new Date().toLocaleDateString()}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        clearAllBtn.disabled = true;
        clearAllBtn.textContent = '🗑️ Clearing...';
        
        const response = await fetch('/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'password': authPassword
            }
        });
        
        if (response.ok) {
            // Clear local data
            currentSelections = {};
            
            // Refresh summary view
            refreshSummary();
            
            // Show success message in summary tab
            showSummarySuccessMessage('All selections cleared successfully!');
        } else {
            throw new Error('Failed to clear selections');
        }
    } catch (error) {
        alert('Error clearing selections. Please try again.');
        console.error('Clear error:', error);
    } finally {
        clearAllBtn.disabled = false;
        clearAllBtn.textContent = '🗑️ Clear All Selections';
    }
}

function showSummarySuccessMessage(message) {
    const existingMessage = document.querySelector('.summary-success-message');
    if (existingMessage) existingMessage.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message summary-success-message';
    successDiv.textContent = message;
    
    const summaryContent = document.querySelector('.summary-content');
    summaryContent.insertBefore(successDiv, summaryContent.firstChild);
    
    setTimeout(() => successDiv.remove(), 3000);
}

async function fetchCurrentSelections() {
    try {
        const response = await fetch('/api/selections', {
            headers: {
                'password': authPassword
            }
        });
        if (response.ok) {
            currentSelections = await response.json();
        }
    } catch (error) {
        console.error('Error fetching selections:', error);
    }
}

function refreshSummary() {
    refreshIndividualTable();
    refreshTotalsSummary();
}

function refreshIndividualTable() {
    const tableContainer = document.getElementById('individual-table');
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background: #f8f9fa;"><th style="padding: 0.5rem; border: 1px solid #ddd;">Person</th><th style="padding: 0.5rem; border: 1px solid #ddd;">Starter</th><th style="padding: 0.5rem; border: 1px solid #ddd;">Main</th></tr></thead>';
    html += '<tbody>';
    
    FAMILY_MEMBERS.forEach(person => {
        const selection = currentSelections[person];
        html += '<tr>';
        html += `<td style="padding: 0.5rem; border: 1px solid #ddd; font-weight: 600;">${person}</td>`;
        html += `<td style="padding: 0.5rem; border: 1px solid #ddd; font-size: 0.9rem;">${selection?.starter || '- Not Selected -'}</td>`;
        html += `<td style="padding: 0.5rem; border: 1px solid #ddd; font-size: 0.9rem;">${selection?.main || '- Not Selected -'}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function refreshTotalsSummary() {
    const summaryContainer = document.getElementById('totals-summary');
    
    // Count quantities
    const starterCounts = {};
    const mainCounts = {};
    
    Object.values(currentSelections).forEach(selection => {
        if (selection.starter) {
            starterCounts[selection.starter] = (starterCounts[selection.starter] || 0) + 1;
        }
        if (selection.main) {
            mainCounts[selection.main] = (mainCounts[selection.main] || 0) + 1;
        }
    });
    
    let html = '<h4>STARTERS:</h4><ul>';
    Object.entries(starterCounts).forEach(([item, count]) => {
        html += `<li>${count}x ${item}</li>`;
    });
    html += '</ul>';
    
    html += '<h4 style="margin-top: 1rem;">MAINS:</h4><ul>';
    Object.entries(mainCounts).forEach(([item, count]) => {
        html += `<li>${count}x ${item}</li>`;
    });
    html += '</ul>';
    
    if (Object.keys(starterCounts).length === 0 && Object.keys(mainCounts).length === 0) {
        html = '<p style="text-align: center; color: #666;">No selections made yet</p>';
    }
    
    summaryContainer.innerHTML = html;
}

function startPolling() {
    // Fetch immediately
    fetchCurrentSelections();
    
    // Then poll every 3 seconds
    pollingInterval = setInterval(fetchCurrentSelections, 3000);
}



// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
}); 