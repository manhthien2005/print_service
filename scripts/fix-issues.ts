#!/usr/bin/env node

/**
 * Script to automatically fix SonarCloud issues
 * Usage: npm run sonar:fix-issues [-- --group=HIGH]
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { SonarCloudClient } from './sonar-client';

// Load .env file explicitly and override existing env vars
dotenv.config({ path: resolve(process.cwd(), '.env'), override: true });
import type { SonarIssue, RiskLevel } from './types/sonar';
import * as fs from 'fs';

const RISK_MAPPING: Record<string, RiskLevel> = {
  BLOCKER: 'HIGH',
  CRITICAL: 'HIGH',
  MAJOR: 'MEDIUM',
  MINOR: 'LOW',
  INFO: 'LOW',
};

/**
 * Fix common issues automatically
 */
async function fixIssue(issue: SonarIssue): Promise<boolean> {
  const filePath = issue.component.split(':').pop();
  if (!filePath || !fs.existsSync(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Skip if line number is not available
  if (!issue.line || issue.line < 1 || issue.line > lines.length) {
    return false;
  }

  const lineIndex = issue.line - 1;
  const originalLine = lines[lineIndex];

  // Common fixes based on rule patterns
  let fixed = false;

  // Fix: Remove unused imports
  if (
    issue.rule.includes('unused') &&
    originalLine.trim().startsWith('import')
  ) {
    lines[lineIndex] = ''; // Remove the line
    fixed = true;
  }

  // Fix: Add missing semicolons
  if (
    issue.rule.includes('semicolon') &&
    !originalLine.trim().endsWith(';') &&
    !originalLine.trim().endsWith('{') &&
    !originalLine.trim().endsWith('}') &&
    originalLine.trim().length > 0
  ) {
    lines[lineIndex] = originalLine.trimEnd() + ';';
    fixed = true;
  }

  // Fix: Remove console.log
  if (issue.rule.includes('console') && originalLine.includes('console.log')) {
    lines[lineIndex] = ''; // Remove the line
    fixed = true;
  }

  // Fix: Remove commented code
  if (
    issue.rule.includes('comment') &&
    (originalLine.trim().startsWith('//') ||
      originalLine.trim().startsWith('/*'))
  ) {
    lines[lineIndex] = ''; // Remove the line
    fixed = true;
  }

  if (fixed) {
    // Write back to file
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    return true;
  }

  return false;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const groupFilter = args
    .find(arg => arg.startsWith('--group='))
    ?.split('=')[1] as RiskLevel | undefined;

  const token = process.env.SONAR_TOKEN;
  const organization = process.env.SONAR_ORGANIZATION || 'manhthien2005';
  const projectKey =
    process.env.SONAR_PROJECT_KEY || 'manhthien2005_print_service';
  const branch = process.env.SONAR_BRANCH || 'develop';

  if (!token) {
    console.error('❌ SONAR_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log('🔧 Starting automatic issue fixing...\n');

  try {
    const client = new SonarCloudClient(token, organization, projectKey);

    // Fetch issues
    console.log('📥 Fetching issues...');
    let issues = await client.fetchIssues(branch);

    // Filter by risk level if specified
    if (groupFilter) {
      issues = issues.filter(
        issue => RISK_MAPPING[issue.severity] === groupFilter
      );
      console.log(
        `   Filtering to ${groupFilter} risk level: ${issues.length} issues\n`
      );
    }

    if (issues.length === 0) {
      console.log('✅ No issues to fix!');
      return;
    }

    console.log(`📦 Found ${issues.length} issues to process\n`);

    // Group by file for efficient processing
    const issuesByFile = new Map<string, SonarIssue[]>();
    for (const issue of issues) {
      const filePath = issue.component.split(':').pop() || 'unknown';
      if (!issuesByFile.has(filePath)) {
        issuesByFile.set(filePath, []);
      }
      issuesByFile.get(filePath)!.push(issue);
    }

    let fixedCount = 0;
    let skippedCount = 0;

    console.log('🔧 Fixing issues...\n');

    // Process each file
    for (const [filePath, fileIssues] of Array.from(issuesByFile.entries())) {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${filePath} (file not found)`);
        skippedCount += fileIssues.length;
        continue;
      }

      console.log(`📝 Processing ${filePath} (${fileIssues.length} issues)`);

      for (const issue of fileIssues) {
        try {
          const fixed = await fixIssue(issue);
          if (fixed) {
            fixedCount++;
            console.log(`   ✅ Fixed: ${issue.message.substring(0, 60)}...`);
          } else {
            skippedCount++;
            console.log(
              `   ⏭️  Skipped: ${issue.message.substring(0, 60)}... (manual fix required)`
            );
          }
        } catch (error) {
          skippedCount++;
          console.log(
            `   ❌ Error fixing issue: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    }

    console.log('\n📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total issues processed: ${issues.length}`);
    console.log(`✅ Fixed automatically: ${fixedCount}`);
    console.log(`⏭️  Skipped (manual fix needed): ${skippedCount}`);

    if (fixedCount > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Review the changes: git diff');
      console.log('   2. Run format: npm run format');
      console.log('   3. Run lint: npm run lint');
      console.log('   4. Commit the fixes');
      console.log('   5. Re-run SonarCloud analysis');
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
main().catch(console.error);
