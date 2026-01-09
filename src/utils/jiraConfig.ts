export const jiraConfig = {
  baseUrl: process.env.JIRA_BASE_URL || '',
  email: process.env.JIRA_EMAIL || '',
  apiToken: process.env.JIRA_API_TOKEN || '',
  apiTokenOnly: process.env.JIRA_API_TOKEN_ONLY || '',
  acceptanceCriteriaField: process.env.JIRA_ACCEPTANCE_FIELD || '',
  timeout: parseInt(process.env.JIRA_TIMEOUT || '10000', 10),
};

export function getJiraAuthHeader(): string {
  if (jiraConfig.apiTokenOnly) {
    return `Bearer ${jiraConfig.apiTokenOnly}`;
  }
  if (jiraConfig.email && jiraConfig.apiToken) {
    const credentials = Buffer.from(`${jiraConfig.email}:${jiraConfig.apiToken}`).toString('base64');
    return `Basic ${credentials}`;
  }
  throw new Error('Jira authentication not configured. Set JIRA_EMAIL + JIRA_API_TOKEN or JIRA_API_TOKEN_ONLY');
}

export default jiraConfig;
