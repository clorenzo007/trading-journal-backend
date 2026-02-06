import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://127.0.0.1:4000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

const runIntegrationTest = async () => {
  console.log('🚀 Starting Import Integration Test...');

  try {
    // 1. Login
    const login = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    const token = login.data.token;
    console.log('✅ Login successful.');

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Get Account
    const accountsRes = await axios.get(`${API_URL}/accounts`, { headers: authHeaders });
    if (accountsRes.data.length === 0) {
      throw new Error('No test account found. Please run test_backend.js first.');
    }
    const accountId = accountsRes.data[0]._id;
    console.log('✅ Found Account:', accountId);

    // 3. Prepare Dummy MT5 CSV
    const csvPath = './test_import.csv';
    const csvContent = `Ticket,Open Time,Type,Size,Symbol,Open Price,S / L,T / P,Close Time,Close Price,Commission,Swap,Profit,Comment
${Date.now()},2024.01.01 10:00:00,buy,0.10,EURUSD,1.10000,1.09500,1.11000,2024.01.01 12:00:00,1.10500,0.00,0.00,50.00,Integration Test`;
    fs.writeFileSync(csvPath, csvContent);

    // 4. Upload
    const form = new FormData();
    form.append('file', fs.createReadStream(csvPath));

    const importRes = await axios.post(`${API_URL}/import/mt5`, form, {
      headers: {
        ...authHeaders,
        ...form.getHeaders(),
        'x-account-id': accountId
      }
    });

    console.log('✅ Import Response:', importRes.data);

    if (importRes.data.imported === 1) {
      console.log('🎉 INTEGRATION TEST PASSED!');
    } else {
      console.error('❌ INTEGRATION TEST FAILED: "imported" count is not 1');
      console.error(importRes.data);
    }

    // Cleanup
    fs.unlinkSync(csvPath);

  } catch (err) {
    console.error('❌ INTEGRATION TEST FAILED:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else if (err.request) {
      console.error('No response received:', err.message);
    } else {
      console.error('Error:', err.stack || err.message);
    }
    process.exit(1);
  }
};

runIntegrationTest();
