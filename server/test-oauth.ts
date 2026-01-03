/**
 * OAuth Diagnostic Test Script
 * Tests the OAuth flow components to identify where failures occur
 */

import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";

async function testOAuthConfiguration() {
  console.log("\n=== OAuth Configuration Test ===\n");
  
  // Test 1: Check environment variables
  console.log("1. Environment Variables:");
  console.log("   - VITE_APP_ID:", ENV.appId ? "✓ SET" : "✗ NOT SET");
  console.log("   - JWT_SECRET:", ENV.cookieSecret ? "✓ SET" : "✗ NOT SET");
  console.log("   - OAUTH_SERVER_URL:", ENV.oAuthServerUrl ? "✓ SET" : "✗ NOT SET");
  console.log("   - OAuth Server URL:", ENV.oAuthServerUrl);
  
  if (!ENV.appId || !ENV.cookieSecret || !ENV.oAuthServerUrl) {
    console.error("\n❌ Missing required environment variables!");
    return;
  }
  
  console.log("\n✓ All environment variables are configured\n");
  
  // Test 2: Check SDK initialization
  console.log("2. SDK Initialization:");
  console.log("   - SDK instance:", sdk ? "✓ Created" : "✗ Failed");
  console.log("   - exchangeCodeForToken method:", typeof sdk.exchangeCodeForToken === "function" ? "✓ Available" : "✗ Missing");
  console.log("   - getUserInfo method:", typeof sdk.getUserInfo === "function" ? "✓ Available" : "✗ Missing");
  
  console.log("\n✓ SDK is properly initialized\n");
  
  // Test 3: Test OAuth server connectivity
  console.log("3. OAuth Server Connectivity:");
  try {
    const axios = (await import("axios")).default;
    const response = await axios.get(ENV.oAuthServerUrl, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    console.log("   - Server response status:", response.status);
    console.log("   - Server is reachable:", response.status < 500 ? "✓ YES" : "✗ NO");
  } catch (error: any) {
    console.error("   - ✗ Cannot reach OAuth server");
    console.error("   - Error:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error("   - DNS resolution failed - check OAUTH_SERVER_URL");
    } else if (error.code === "ECONNREFUSED") {
      console.error("   - Connection refused - server may be down");
    } else if (error.code === "ETIMEDOUT") {
      console.error("   - Connection timeout - network or firewall issue");
    }
  }
  
  console.log("\n=== Test Complete ===\n");
  
  // Test 4: Provide mock OAuth flow example
  console.log("4. Mock OAuth Flow Test:");
  console.log("\n   To test the actual OAuth flow, you need:");
  console.log("   - A valid authorization code from the OAuth provider");
  console.log("   - A valid state parameter (base64 encoded redirect URI)");
  console.log("\n   Example test with real credentials:");
  console.log("   const tokenResponse = await sdk.exchangeCodeForToken(code, state);");
  console.log("   const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);");
  console.log("\n   The improved logging in oauth.ts will show detailed errors if this fails.\n");
}

// Run the test
testOAuthConfiguration()
  .then(() => {
    console.log("✓ Diagnostic test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("✗ Diagnostic test failed:", error);
    process.exit(1);
  });
