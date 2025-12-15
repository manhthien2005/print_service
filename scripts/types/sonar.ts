/**
 * SonarCloud API Types
 */

export type SonarSeverity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

export type SonarType =
  | 'BUG'
  | 'VULNERABILITY'
  | 'CODE_SMELL'
  | 'SECURITY_HOTSPOT';

export type SonarStatus =
  | 'OPEN'
  | 'CONFIRMED'
  | 'RESOLVED'
  | 'REOPENED'
  | 'CLOSED';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SonarIssue {
  key: string;
  rule: string;
  severity: SonarSeverity;
  component: string;
  project: string;
  line?: number;
  message: string;
  type: SonarType;
  status: SonarStatus;
  effort?: string;
  debt?: string;
  author?: string;
  creationDate?: string;
  updateDate?: string;
  textRange?: {
    startLine: number;
    endLine: number;
    startOffset?: number;
    endOffset?: number;
  };
  flows?: Array<{
    locations: Array<{
      component: string;
      textRange: {
        startLine: number;
        endLine: number;
        startOffset?: number;
        endOffset?: number;
      };
      msg?: string;
    }>;
  }>;
}

export interface SonarIssuesResponse {
  total: number;
  p: number;
  ps: number;
  paging: {
    pageIndex: number;
    pageSize: number;
    total: number;
  };
  issues: SonarIssue[];
  components?: Array<{
    key: string;
    enabled: boolean;
    qualifier: string;
    name: string;
    longName: string;
    path?: string;
  }>;
  rules?: Array<{
    key: string;
    name: string;
    lang: string;
    status: string;
  }>;
}

export interface IssueGroup {
  riskLevel: RiskLevel;
  severity: SonarSeverity;
  issues: SonarIssue[];
  count: number;
  totalEffort?: string;
}

export interface IssueSummary {
  total: number;
  bySeverity: Record<SonarSeverity, number>;
  byType: Record<SonarType, number>;
  byRiskLevel: Record<RiskLevel, number>;
  groups: IssueGroup[];
}



