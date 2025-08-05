// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const selectionsManager = require('./data/selections');
const menuLoader = require('./data/menu-loader');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple password from environment variable
const APP_PASSWORD = process.env.DINNER_PASSWORD || 'family2024';

// Family members from environment variable (comma-separated)
const FAMILY_MEMBERS_STRING = process.env.FAMILY_MEMBERS || 'Simon,Alison,Tom,Jane,Riona,Matthew,Ali,Karin,Klara,Oliver,Erica,Ulrik,Finley,Aria';
const FAMILY_MEMBERS = FAMILY_MEMBERS_STRING.split(',').map(name => name.trim()).sort();

// Middleware
app.use(express.json());

app.use(express.static('public'));

// Authentication endpoints
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === APP_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Authentication middleware for protected routes
function requireAuth(req, res, next) {
  const { password } = req.headers;
  
  if (password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
}

// Protected API Routes
app.get('/api/family-members', requireAuth, (req, res) => {
  // Get family members list (sorted alphabetically)
  res.json(FAMILY_MEMBERS);
});

app.get('/api/selections', requireAuth, (req, res) => {
  // Get current selections for today
  res.json(selectionsManager.getTodaysSelections());
});

app.post('/api/select', requireAuth, (req, res) => {
  // Submit family member's choices
  const { person, starter, main } = req.body;
  
  console.log('Received selection:', { person, starter, main });
  
  if (!person) {
    return res.status(400).json({ error: 'Missing required field: person' });
  }
  
  // Handle empty strings as no selection
  const hasStarter = starter && starter.trim() !== '';
  const hasMain = main && main.trim() !== '';
  
  if (!hasStarter && !hasMain) {
    return res.status(400).json({ error: 'Must select at least a starter or main course' });
  }
  
  // Pass cleaned values (empty string becomes null)
  selectionsManager.saveSelection(
    person, 
    hasStarter ? starter : null, 
    hasMain ? main : null
  );
  res.json({ success: true });
});

app.get('/api/summary', requireAuth, (req, res) => {
  // Get order quantities summary
  res.json(selectionsManager.getSelectionSummary());
});

app.post('/api/reset', requireAuth, (req, res) => {
  // Reset today's selections
  selectionsManager.resetTodaysSelections();
  res.json({ success: true });
});

// Menu API endpoints
app.get('/api/menu/:language', requireAuth, (req, res) => {
  const language = req.params.language || 'en';
  res.json(menuLoader.getAllMenus(language));
});

app.get('/api/menu/:category/:language', requireAuth, (req, res) => {
  const { category, language } = req.params;
  res.json(menuLoader.getMenuList(category, language));
});

// Serve main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dinner Picker app running on port ${PORT}`);
}); 