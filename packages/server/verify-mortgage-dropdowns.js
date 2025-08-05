const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bankim_db'
});

async function verifyMortgageDropdowns() {
  console.log('🔍 Verifying Mortgage Dropdown Component Types...\n');

  try {
    // 1. Check main dropdown fields that should be "dropdown"
    console.log('📋 Checking main dropdown fields:');
    const mainDropdowns = await pool.query(`
      SELECT content_key, component_type 
      FROM content_items 
      WHERE content_key IN (
        'calculate_mortgage_debt_types',
        'calculate_mortgage_family_status', 
        'calculate_mortgage_main_source',
        'calculate_mortgage_when',
        'calculate_mortgage_first'
      )
      ORDER BY content_key
    `);

    mainDropdowns.rows.forEach(row => {
      const status = row.component_type === 'dropdown' ? '✅' : '❌';
      console.log(`${status} ${row.content_key}: ${row.component_type}`);
    });

    // 2. Check dropdown options that should be "option"
    console.log('\n📋 Checking dropdown options:');
    const dropdownOptions = await pool.query(`
      SELECT content_key, component_type 
      FROM content_items 
      WHERE content_key IN (
        'calculate_mortgage_when_options_1',
        'calculate_mortgage_when_options_2', 
        'calculate_mortgage_when_options_3',
        'calculate_mortgage_when_options_4',
        'calculate_mortgage_when_options_Time',
        'calculate_mortgage_first_options_1',
        'calculate_mortgage_first_options_2',
        'calculate_mortgage_first_options_3'
      )
      ORDER BY content_key
    `);

    dropdownOptions.rows.forEach(row => {
      const status = row.component_type === 'option' ? '✅' : '❌';
      console.log(`${status} ${row.content_key}: ${row.component_type}`);
    });

    // 3. Test API endpoints
    console.log('\n🔗 Testing API endpoints:');
    
    const testEndpoints = [
      'calculate_mortgage_debt_types',
      'calculate_mortgage_family_status',
      'calculate_mortgage_main_source',
      'calculate_mortgage_when',
      'calculate_mortgage_first'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`http://localhost:3001/api/content/mortgage/${endpoint}/options`);
        const data = await response.json();
        const optionCount = data.data ? data.data.length : 0;
        console.log(`📊 ${endpoint}/options: ${optionCount} options`);
      } catch (error) {
        console.log(`❌ ${endpoint}/options: Error - ${error.message}`);
      }
    }

    // 4. Check drill page data
    console.log('\n📋 Checking drill page data:');
    try {
      const response = await fetch('http://localhost:3001/api/content/mortgage/drill/mortgage_step1');
      const data = await response.json();
      
      if (data.success && data.data) {
        const dropdownActions = data.data.actions.filter(action => 
          action.component_type === 'dropdown'
        );
        console.log(`✅ Drill page shows ${dropdownActions.length} dropdown actions`);
        
        dropdownActions.forEach(action => {
          console.log(`   - ${action.content_key}: ${action.translations?.he || action.translations?.ru || action.content_key}`);
        });
      }
    } catch (error) {
      console.log(`❌ Drill page check failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await pool.end();
  }
}

verifyMortgageDropdowns(); 