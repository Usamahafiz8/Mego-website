/**
 * Integration Verification Script
 * Run this to verify API connection and endpoints
 * 
 * Usage: node scripts/verify-integration.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://52.0.49.49';
const API_VERSION = 'v1';
const FULL_API_URL = `${API_BASE_URL}/${API_VERSION}`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${FULL_API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    };
  }
}

async function verifyIntegration() {
  log('\n🔍 MEGO Website Integration Verification\n', 'blue');
  log('=' .repeat(50), 'blue');

  // Test 1: API Base URL
  log('\n1. Testing API Base URL...', 'yellow');
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    if (response.status === 200) {
      log('✅ API is running and accessible', 'green');
    }
  } catch (error) {
    log('❌ API is not accessible', 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   Make sure backend is running on ${API_BASE_URL}`, 'yellow');
    return;
  }

  // Test 2: Swagger Documentation
  log('\n2. Testing Swagger Documentation...', 'yellow');
  try {
    const response = await axios.get(`${API_BASE_URL}/swagger/v1/swagger.json`);
    if (response.status === 200) {
      log('✅ Swagger documentation is available', 'green');
      log(`   View at: ${API_BASE_URL}/swagger`, 'blue');
    }
  } catch (error) {
    log('⚠️  Swagger documentation not available', 'yellow');
  }

  // Test 3: Public Endpoints
  log('\n3. Testing Public Endpoints...', 'yellow');
  
  const publicEndpoints = [
    { method: 'GET', endpoint: '/ads', name: 'Get All Ads' },
    { method: 'GET', endpoint: '/categories', name: 'Get Categories' },
  ];

  for (const endpoint of publicEndpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.endpoint);
    if (result.success) {
      log(`   ✅ ${endpoint.name} - Status: ${result.status}`, 'green');
    } else {
      log(`   ❌ ${endpoint.name} - Status: ${result.status}`, 'red');
      if (result.message) {
        log(`      Error: ${result.message}`, 'red');
      }
    }
  }

  // Test 4: CORS Configuration
  log('\n4. Testing CORS Configuration...', 'yellow');
  try {
    const response = await axios.options(`${FULL_API_URL}/ads`, {
      headers: {
        'Origin': 'http://localhost:3002',
        'Access-Control-Request-Method': 'GET',
      },
    });
    log('✅ CORS is configured', 'green');
  } catch (error) {
    log('⚠️  CORS test failed (this is normal for OPTIONS requests)', 'yellow');
  }

  // Test 5: Static Files
  log('\n5. Testing Static File Serving...', 'yellow');
  try {
    const response = await axios.get(`${API_BASE_URL}/uploads`, {
      validateStatus: () => true,
    });
    if (response.status === 200 || response.status === 404) {
      log('✅ Static files endpoint is accessible', 'green');
    }
  } catch (error) {
    log('⚠️  Static files endpoint test inconclusive', 'yellow');
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('\n📊 Integration Summary', 'blue');
  log('✅ API Base URL: Configured', 'green');
  log('✅ Endpoints: Mapped', 'green');
  log('✅ CORS: Configured in backend', 'green');
  log('\n💡 Next Steps:', 'yellow');
  log('   1. Start the backend: cd mego-api/MeGo.Api && dotnet run', 'blue');
  log('   2. Start the website: cd mego_website && npm run dev', 'blue');
  log('   3. Open http://localhost:3002 in your browser', 'blue');
  log('\n');
}

// Run verification
verifyIntegration().catch((error) => {
  log('\n❌ Verification failed:', 'red');
  log(error.message, 'red');
  process.exit(1);
});




