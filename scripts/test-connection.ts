#!/usr/bin/env node

/**
 * Test script to verify SonarCloud connection
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { SonarCloudClient } from './sonar-client';

// Load .env file explicitly and override existing env vars
const envResult = dotenv.config({
  path: resolve(process.cwd(), '.env'),
  override: true,
});

async function testConnection() {
  // Read from .env file directly first, then fallback to process.env
  const envFile = envResult.parsed || {};
  const token = envFile.SONAR_TOKEN || process.env.SONAR_TOKEN;
  const organization =
    envFile.SONAR_ORGANIZATION ||
    process.env.SONAR_ORGANIZATION ||
    'manhthien2005';
  const projectKey =
    envFile.SONAR_PROJECT_KEY ||
    process.env.SONAR_PROJECT_KEY ||
    'manhthien2005_print_service';
  const branch = envFile.SONAR_BRANCH || process.env.SONAR_BRANCH || 'develop';

  // Debug: Show what was loaded
  console.log('📋 Environment variables loaded:');
  console.log(`   SONAR_TOKEN: ${token ? 'SET' : 'NOT SET'}`);
  console.log(`   SONAR_ORGANIZATION: ${organization}`);
  console.log(`   SONAR_PROJECT_KEY: ${projectKey}`);
  console.log(`   SONAR_BRANCH: ${branch}`);
  console.log(
    `   From .env file: ${envFile.SONAR_PROJECT_KEY || 'NOT FOUND'}\n`
  );

  if (!token) {
    console.error('❌ SONAR_TOKEN environment variable is required');
    console.error('\n💡 To set it:');
    console.error('   Windows: set SONAR_TOKEN=your_token');
    console.error('   Linux/Mac: export SONAR_TOKEN=your_token');
    console.error('\n   Or create a .env file with:');
    console.error('   SONAR_TOKEN=your_token');
    console.error('   SONAR_ORGANIZATION=manhthien2005');
    console.error('   SONAR_PROJECT_KEY=manhthien2005_print_service');
    console.error('   SONAR_BRANCH=develop');
    process.exit(1);
  }

  console.log('🔍 Testing SonarCloud connection...\n');
  console.log(`   Organization: ${organization}`);
  console.log(`   Project Key: ${projectKey}`);
  console.log(`   Branch: ${branch}`);
  console.log(
    `   Token: ${token ? `${token.substring(0, 10)}...` : 'NOT SET'}\n`
  );

  try {
    const client = new SonarCloudClient(token, organization, projectKey);

    // Test 1: Fetch a small number of issues
    console.log('📥 Test 1: Fetching issues (limit 5)...');
    const issues = await client.fetchIssues(branch, undefined, undefined, [
      'OPEN',
    ]);
    console.log(`   ✅ Successfully fetched ${issues.length} open issues\n`);

    if (issues.length > 0) {
      console.log('   Sample issue:');
      const sample = issues[0];
      console.log(`   - Key: ${sample.key}`);
      console.log(`   - Severity: ${sample.severity}`);
      console.log(`   - Type: ${sample.type}`);
      console.log(`   - Message: ${sample.message.substring(0, 60)}...`);
      console.log(`   - Component: ${sample.component}`);
      if (sample.line) {
        console.log(`   - Line: ${sample.line}`);
      }
      console.log('');
    }

    // Test 2: Check quality gate
    console.log('🔍 Test 2: Checking quality gate status...');
    try {
      const qualityGate = await client.getQualityGateStatus(branch);
      if (qualityGate && qualityGate.status) {
        console.log(`   ✅ Quality Gate Status: ${qualityGate.status}\n`);

        if (qualityGate.conditions && qualityGate.conditions.length > 0) {
          console.log('   Conditions:');
          for (const condition of qualityGate.conditions.slice(0, 5)) {
            console.log(
              `   - ${condition.metricKey}: ${condition.status} (${condition.actualValue || 'N/A'})`
            );
          }
          console.log('');
        } else {
          console.log('   ℹ️  No conditions found\n');
        }
      } else {
        console.log('   ⚠️  Quality gate status unavailable\n');
      }
    } catch (error) {
      console.log(
        `   ⚠️  Could not fetch quality gate: ${error instanceof Error ? error.message : 'Unknown error'}\n`
      );
    }

    console.log('✅ All tests passed! Connection is working.\n');
    console.log('💡 You can now run:');
    console.log('   npm run sonar:fetch    - Fetch all issues');
    console.log('   npm run sonar:fix       - Auto-fix issues');
  } catch (error) {
    console.error('❌ Connection test failed!\n');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);
      if (
        error.message.includes('401') ||
        error.message.includes('Unauthorized')
      ) {
        console.error('💡 This usually means:');
        console.error('   - SONAR_TOKEN is invalid or expired');
        console.error('   - Token does not have access to this project');
        console.error(
          '   - Check your token at https://sonarcloud.io/account/security'
        );
      } else if (
        error.message.includes('404') ||
        error.message.includes('not found')
      ) {
        console.error('💡 This usually means:');
        console.error('   - Project key or organization is incorrect');
        console.error('   - Project does not exist on SonarCloud');
        console.error('   - Check project key in sonar-project.properties');
      }
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

testConnection().catch(console.error);
