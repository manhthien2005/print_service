#!/usr/bin/env node

/**
 * Script to fetch and categorize SonarCloud issues
 * Usage: npm run sonar:fetch-issues
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { SonarCloudClient } from './sonar-client';

// Load .env file explicitly and override existing env vars
dotenv.config({ path: resolve(process.cwd(), '.env'), override: true });
import type {
  SonarIssue,
  SonarSeverity,
  RiskLevel,
  IssueGroup,
  IssueSummary,
} from './types/sonar';
import * as fs from 'fs';
import * as path from 'path';

// Risk level mapping
const RISK_MAPPING: Record<SonarSeverity, RiskLevel> = {
  BLOCKER: 'HIGH',
  CRITICAL: 'HIGH',
  MAJOR: 'MEDIUM',
  MINOR: 'LOW',
  INFO: 'LOW',
};

// Severity priority (higher = more important)
const SEVERITY_PRIORITY: Record<SonarSeverity, number> = {
  BLOCKER: 5,
  CRITICAL: 4,
  MAJOR: 3,
  MINOR: 2,
  INFO: 1,
};

/**
 * Categorize issues by risk level
 */
function categorizeIssues(issues: SonarIssue[]): IssueGroup[] {
  const groups: Map<string, IssueGroup> = new Map();

  for (const issue of issues) {
    const riskLevel = RISK_MAPPING[issue.severity];
    const key = `${riskLevel}_${issue.severity}`;

    if (!groups.has(key)) {
      groups.set(key, {
        riskLevel,
        severity: issue.severity,
        issues: [],
        count: 0,
      });
    }

    const group = groups.get(key)!;
    group.issues.push(issue);
    group.count++;
  }

  // Sort groups by priority (HIGH -> MEDIUM -> LOW)
  const sortedGroups = Array.from(groups.values()).sort((a, b) => {
    const priorityDiff =
      SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity];
    if (priorityDiff !== 0) return priorityDiff;

    // If same severity, sort by risk level
    const riskOrder: Record<RiskLevel, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  });

  // Sort issues within each group by line number
  for (const group of sortedGroups) {
    group.issues.sort((a, b) => (a.line || 0) - (b.line || 0));
  }

  return sortedGroups;
}

/**
 * Generate summary statistics
 */
function generateSummary(
  issues: SonarIssue[],
  groups: IssueGroup[]
): IssueSummary {
  const bySeverity: Record<SonarSeverity, number> = {
    BLOCKER: 0,
    CRITICAL: 0,
    MAJOR: 0,
    MINOR: 0,
    INFO: 0,
  };

  const byType: Record<string, number> = {};
  const byRiskLevel: Record<RiskLevel, number> = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const issue of issues) {
    bySeverity[issue.severity]++;
    byType[issue.type] = (byType[issue.type] || 0) + 1;
    byRiskLevel[RISK_MAPPING[issue.severity]]++;
  }

  return {
    total: issues.length,
    bySeverity,
    byType: byType as Record<string, number>,
    byRiskLevel,
    groups,
  };
}

/**
 * Format issues for display
 */
function formatIssuesForDisplay(groups: IssueGroup[]): string {
  let output = '\n📊 SONARCLOUD ISSUES REPORT\n';
  output += '='.repeat(60) + '\n\n';

  for (const group of groups) {
    const emoji =
      group.riskLevel === 'HIGH'
        ? '🔴'
        : group.riskLevel === 'MEDIUM'
          ? '🟡'
          : '🟢';

    output += `${emoji} ${group.riskLevel} RISK - ${group.severity} (${group.count} issues)\n`;
    output += '-'.repeat(60) + '\n';

    for (const issue of group.issues.slice(0, 10)) {
      // Show first 10 issues per group
      const file = issue.component.split(':').pop() || issue.component;
      const location = issue.line ? `${file}:${issue.line}` : file;
      output += `  • ${location}\n`;
      output += `    ${issue.message}\n`;
      output += `    Type: ${issue.type} | Rule: ${issue.rule}\n`;
      if (issue.effort) {
        output += `    Effort: ${issue.effort}\n`;
      }
      output += '\n';
    }

    if (group.issues.length > 10) {
      output += `  ... and ${group.issues.length - 10} more issues\n\n`;
    }
  }

  return output;
}

/**
 * Main function
 */
async function main() {
  const token = process.env.SONAR_TOKEN;
  const organization = process.env.SONAR_ORGANIZATION || 'manhthien2005';
  const projectKey =
    process.env.SONAR_PROJECT_KEY || 'manhthien2005_print_service';
  const branch = process.env.SONAR_BRANCH || 'develop';
  const outputDir = process.env.OUTPUT_DIR || './scripts/output';

  if (!token) {
    console.error('❌ SONAR_TOKEN environment variable is required');
    console.error(
      'Please set it in your .env file or export it: export SONAR_TOKEN=your_token'
    );
    process.exit(1);
  }

  console.log('🔍 Fetching issues from SonarCloud...');
  console.log(`   Project: ${projectKey}`);
  console.log(`   Organization: ${organization}`);
  console.log(`   Branch: ${branch}\n`);

  try {
    const client = new SonarCloudClient(token, organization, projectKey);

    // Fetch all open issues
    const issues = await client.fetchIssues(branch);

    if (issues.length === 0) {
      console.log('✅ No issues found! Quality gate should pass.');
      return;
    }

    console.log(`📦 Found ${issues.length} issues\n`);

    // Categorize issues
    const groups = categorizeIssues(issues);
    const summary = generateSummary(issues, groups);

    // Display summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Issues: ${summary.total}`);
    console.log('\nBy Severity:');
    for (const [severity, count] of Object.entries(summary.bySeverity)) {
      if (count > 0) {
        console.log(`  ${severity}: ${count}`);
      }
    }
    console.log('\nBy Risk Level:');
    for (const [risk, count] of Object.entries(summary.byRiskLevel)) {
      console.log(`  ${risk}: ${count}`);
    }
    console.log('\nBy Type:');
    for (const [type, count] of Object.entries(summary.byType)) {
      console.log(`  ${type}: ${count}`);
    }

    // Display formatted issues
    console.log(formatIssuesForDisplay(groups));

    // Save to files
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Clean up old output files (keep only last 5 runs)
    const maxFilesToKeep = 5;
    try {
      const files = fs.readdirSync(outputDir);
      const outputFiles = files
        .filter(
          file =>
            file.startsWith('issues-') ||
            file.startsWith('summary-') ||
            file.startsWith('groups-')
        )
        .map(file => ({
          name: file,
          path: path.join(outputDir, file),
          time: fs.statSync(path.join(outputDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // Sort by modification time, newest first

      // Group files by timestamp (each run creates 3 files: issues, summary, groups)
      const fileGroups = new Map<string, string[]>();
      for (const file of outputFiles) {
        // Extract timestamp from filename (e.g., "issues-2025-12-06T18-29-30-802Z.json")
        const match = file.name.match(/^(\w+)-(.+?)\.json$/);
        if (match) {
          const timestamp = match[2];
          if (!fileGroups.has(timestamp)) {
            fileGroups.set(timestamp, []);
          }
          fileGroups.get(timestamp)!.push(file.path);
        }
      }

      // Keep only the last N groups, delete the rest
      const sortedGroups = Array.from(fileGroups.entries()).sort((a, b) =>
        b[0].localeCompare(a[0])
      ); // Sort by timestamp, newest first

      // Keep first N groups, delete the rest
      const groupsToDelete = sortedGroups.slice(maxFilesToKeep);

      let deletedCount = 0;
      for (const [, filePaths] of groupsToDelete) {
        for (const filePath of filePaths) {
          try {
            fs.unlinkSync(filePath);
            deletedCount++;
          } catch (error) {
            // Ignore errors when deleting
          }
        }
      }

      if (deletedCount > 0) {
        console.log(
          `🧹 Cleaned up ${deletedCount} old output files (kept last ${maxFilesToKeep} runs)\n`
        );
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const issuesFile = path.join(outputDir, `issues-${timestamp}.json`);
    const summaryFile = path.join(outputDir, `summary-${timestamp}.json`);
    const groupsFile = path.join(outputDir, `groups-${timestamp}.json`);

    fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2));
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));

    console.log('💾 Saved to:');
    console.log(`   Issues: ${issuesFile}`);
    console.log(`   Summary: ${summaryFile}`);
    console.log(`   Groups: ${groupsFile}\n`);

    // Check quality gate
    console.log('🔍 Checking quality gate status...');
    const qualityGate = await client.getQualityGateStatus(branch);
    console.log(`Quality Gate Status: ${qualityGate.status}`);

    if (qualityGate.status !== 'OK') {
      console.log('\n⚠️  Quality Gate Conditions:');
      if (qualityGate.conditions) {
        for (const condition of qualityGate.conditions) {
          if (condition.status !== 'OK') {
            console.log(
              `  ${condition.status}: ${condition.metricKey} (${condition.actualValue || 'N/A'})`
            );
          }
        }
      }
    } else {
      console.log('✅ Quality gate is passing!');
    }

    // Priority recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('='.repeat(60));
    const highRiskCount = summary.byRiskLevel.HIGH;
    const mediumRiskCount = summary.byRiskLevel.MEDIUM;
    const lowRiskCount = summary.byRiskLevel.LOW;

    if (highRiskCount > 0) {
      console.log(
        `🔴 Start with ${highRiskCount} HIGH risk issues (BLOCKER/CRITICAL)`
      );
    }
    if (mediumRiskCount > 0) {
      console.log(
        `🟡 Then address ${mediumRiskCount} MEDIUM risk issues (MAJOR)`
      );
    }
    if (lowRiskCount > 0) {
      console.log(
        `🟢 Finally, clean up ${lowRiskCount} LOW risk issues (MINOR/INFO)`
      );
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
main().catch(console.error);
