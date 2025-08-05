const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const ENVIRONMENT = process.env.NODE_ENV || 'development';

class SelectionsManager {
  constructor() {
    this.initialized = false;
    this.initDatabase();
  }

  async initDatabase() {
    try {
      // Test connection by doing a simple query
      const { error } = await supabase
        .from('dinner_selections')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error connecting to Supabase:', error);
        console.log('Please ensure the dinner_selections table exists in your Supabase project');
      } else {
        console.log('✅ Connected to Supabase successfully');
        console.log(`📊 Using environment: ${ENVIRONMENT}`);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async saveSelection(date, person, starter, main) {
    // Wait for initialization if needed
    if (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const { data, error } = await supabase
        .from('dinner_selections')
        .upsert({
          environment: ENVIRONMENT,
          date,
          person,
          starter,
          main,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'environment,date,person'
        });

      if (error) {
        console.error('Supabase error saving selection:', error);
        throw error;
      }

      console.log(`✅ Saved selection for ${person} on ${date} in ${ENVIRONMENT} environment`);
      return data;
    } catch (error) {
      console.error('Error saving selection:', error);
      throw error;
    }
  }

  async getSelectionsForDate(date) {
    // Wait for initialization if needed
    if (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const { data, error } = await supabase
        .from('dinner_selections')
        .select('*')
        .eq('environment', ENVIRONMENT)
        .eq('date', date);

      if (error) {
        console.error('Supabase error getting selections:', error);
        return {};
      }
      
      // Convert to the format expected by the frontend
      const selections = {};
      data.forEach(row => {
        selections[row.person] = {
          starter: row.starter,
          main: row.main
        };
      });
      
      console.log(`📊 Retrieved ${Object.keys(selections).length} selections for ${date} in ${ENVIRONMENT} environment`);
      return selections;
    } catch (error) {
      console.error('Error getting selections:', error);
      return {};
    }
  }

  async clearSelectionsForDate(date) {
    // Wait for initialization if needed
    if (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const { error } = await supabase
        .from('dinner_selections')
        .delete()
        .eq('environment', ENVIRONMENT)
        .eq('date', date);

      if (error) {
        console.error('Supabase error clearing selections:', error);
        throw error;
      }

      console.log(`🗑️ Cleared all selections for ${date} in ${ENVIRONMENT} environment`);
      return true;
    } catch (error) {
      console.error('Error clearing selections:', error);
      throw error;
    }
  }

  async getSelectionSummary(date) {
    const selections = await this.getSelectionsForDate(date);
    
    // Count totals
    const starters = {};
    const mains = {};
    
    Object.values(selections).forEach(selection => {
      if (selection.starter) {
        starters[selection.starter] = (starters[selection.starter] || 0) + 1;
      }
      if (selection.main) {
        mains[selection.main] = (mains[selection.main] || 0) + 1;
      }
    });

    return {
      individual: selections,
      starters,
      mains
    };
  }
}

module.exports = new SelectionsManager(); 