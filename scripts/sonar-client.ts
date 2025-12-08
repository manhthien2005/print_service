/**
 * SonarCloud API Client
 */

import axios, { AxiosInstance } from 'axios';
import type {
  SonarIssuesResponse,
  SonarIssue,
  SonarSeverity,
  SonarType,
} from './types/sonar';

export class SonarCloudClient {
  private client: AxiosInstance;
  private baseUrl = 'https://sonarcloud.io/api';
  private projectKey: string;

  constructor(token: string, _organization: string, projectKey: string) {
    this.projectKey = projectKey;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      auth: {
        username: token,
        password: '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch all issues from SonarCloud
   */
  async fetchIssues(
    branch?: string,
    severities?: SonarSeverity[],
    types?: SonarType[],
    statuses: string[] = ['OPEN', 'CONFIRMED', 'REOPENED']
  ): Promise<SonarIssue[]> {
    const allIssues: SonarIssue[] = [];
    let page = 1;
    const pageSize = 500;
    let hasMore = true;

    while (hasMore) {
      const params: Record<string, string> = {
        componentKeys: this.projectKey,
        p: page.toString(),
        ps: pageSize.toString(),
        statuses: statuses.join(','),
      };

      if (branch) {
        params.branch = branch;
      }

      if (severities && severities.length > 0) {
        params.severities = severities.join(',');
      }

      if (types && types.length > 0) {
        params.types = types.join(',');
      }

      try {
        const response = await this.client.get<SonarIssuesResponse>(
          '/issues/search',
          { params }
        );

        const { issues, paging } = response.data;
        allIssues.push(...issues);

        hasMore = paging.pageIndex * paging.pageSize < paging.total;
        page++;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Failed to fetch SonarCloud issues: ${error.message}`
          );
        }
        throw error;
      }
    }

    return allIssues;
  }

  /**
   * Get project quality gate status
   */
  async getQualityGateStatus(branch?: string): Promise<{
    status?: 'OK' | 'WARN' | 'ERROR';
    conditions?: Array<{
      status: 'OK' | 'WARN' | 'ERROR';
      metricKey: string;
      comparator: string;
      errorThreshold?: string;
      actualValue?: string;
    }>;
  }> {
    const params: Record<string, string> = {
      projectKey: this.projectKey,
    };

    if (branch) {
      params.branch = branch;
    }

    try {
      const response = await this.client.get('/qualitygates/project_status', {
        params,
      });

      // Handle different response structures
      const data = response.data;
      if (data.projectStatus) {
        return {
          status: data.projectStatus.status,
          conditions: data.projectStatus.conditions || [],
        };
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If 404, project might not have quality gate configured
        if (error.response?.status === 404) {
          return {
            status: undefined,
            conditions: [],
          };
        }
        throw new Error(
          `Failed to fetch quality gate status: ${error.message}`
        );
      }
      throw error;
    }
  }
}
