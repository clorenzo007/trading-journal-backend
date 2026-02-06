import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://127.0.0.1:4000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

const runTests = async () => {
  console.log('🚀 Starting Backend Tests...');
  console.log(`📍 Targeting: ${API_URL}`);

  let token = '';
  let accountId = '';

  try {
    // 1. Health Check
    console.log('\n--- 1. Health Check ---');
    const health = await axios.get(`${API_URL}/`);
    console.log('✅ Health Check:', health.data);

    // 2. Auth - Register (might fail if already exists)
    console.log('\n--- 2. Auth - Register ---');
    try {
      const reg = await axios.post(`${API_URL}/auth/register`, TEST_USER);
      console.log('✅ Register:', reg.data.message || 'Success');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('ℹ️ User already exists, skipping registration.');
      } else {
        throw err;
      }
    }

    // 3. Auth - Login
    console.log('\n--- 3. Auth - Login ---');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    token = login.data.token;
    console.log('✅ Login successful, token received.');

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 4. Accounts - Get or Create Account
    console.log('\n--- 4. Accounts - Setup ---');
    const accountsRes = await axios.get(`${API_URL}/accounts`, { headers: authHeaders });
    let accounts = accountsRes.data;
    
    if (accounts.length === 0) {
      console.log('Creating a new test account...');
      const newAcc = await axios.post(`${API_URL}/accounts`, {
        name: 'Test Trading Account',
        balance: 10000,
        currency: 'USD'
      }, { headers: authHeaders });
      accountId = newAcc.data._id;
      console.log('✅ Created Account:', accountId);
    } else {
      accountId = accounts[0]._id;
      console.log('✅ Found Existing Account:', accountId);
      
      // Ensure it's active
      if (accounts[0].status !== 'active') {
        await axios.put(`${API_URL}/accounts/${accountId}/activate`, {}, { headers: authHeaders });
        console.log('✅ Activated Account:', accountId);
      }
    }

    // 5. Trades - Create Trade
    console.log('\n--- 5. Trades - Create Trade ---');
    const tradeData = {
      symbol: 'AAPL',
      entry_date: new Date().toISOString(),
      entry_price: 150,
      position_size: 10,
      stop_loss: 140,
      risk_percent: 1,
      strategy_type: 'Test Strategy'
    };
    
    const tradeRes = await axios.post(`${API_URL}/trades`, tradeData, {
      headers: { ...authHeaders, 'x-account-id': accountId }
    });
    console.log('✅ Trade Created:', tradeRes.data);

    // 6. Trades - Get Trades
    console.log('\n--- 6. Trades - Verify List ---');
    const tradesList = await axios.get(`${API_URL}/trades`, {
      headers: { ...authHeaders, 'x-account-id': accountId }
    });
    console.log(`✅ Fetched ${tradesList.data.length} trades.`);

    console.log('\n🎉 ALL TESTS PASSED!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
};

runTests();
