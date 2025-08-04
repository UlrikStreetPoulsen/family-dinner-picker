const express = require('express');
const path = require('path');
const selectionsManager = require('./data/selections');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/selections', (req, res) => {
  // Get current selections for today
  res.json(selectionsManager.getTodaysSelections());
});

app.post('/api/select', (req, res) => {
  // Submit family member's choices
  const { person, starter, main } = req.body;
  
  if (!person || !starter || !main) {
    return res.status(400).json({ error: 'Missing required fields: person, starter, main' });
  }
  
  selectionsManager.saveSelection(person, starter, main);
  res.json({ success: true });
});

app.get('/api/summary', (req, res) => {
  // Get order quantities summary
  res.json(selectionsManager.getSelectionSummary());
});

app.post('/api/reset', (req, res) => {
  // Reset today's selections
  selectionsManager.resetTodaysSelections();
  res.json({ success: true });
});

app.get('/api/history', (req, res) => {
  // Get all historical selections (all dates)
  res.json(selectionsManager.getAllData());
});

// Serve main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dinner Picker app running on port ${PORT}`);
}); 