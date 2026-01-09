import axios from 'axios';
import { jiraConfig, getJiraAuthHeader } from '../utils/jiraConfig';

export type JiraIssue = {
  summary: string;
  description: string;
  issueType: string;
  priority: string;
  acceptanceCriteria: string;
};

function extractTextFromDescription(descriptionObj: any): string {
  if (!descriptionObj || typeof descriptionObj !== 'object') {
    return typeof descriptionObj === 'string' ? descriptionObj : '';
  }

  const content = descriptionObj.content || [];
  const texts: string[] = [];

  const extractText = (node: any): void => {
    if (node.type === 'text') {
      texts.push(node.text || '');
    } else if (node.type === 'hardBreak') {
      texts.push('\n');
    } else if (node.content && Array.isArray(node.content)) {
      node.content.forEach(extractText);
    }
  };

  content.forEach((paragraph: any) => {
    if (paragraph.content) {
      paragraph.content.forEach(extractText);
      texts.push('\n');
    }
  });

  return texts.join('');
}

function extractAcceptanceCriteria(descriptionObj: any): string {
  const fullText = extractTextFromDescription(descriptionObj);
  
  // Find "Acceptance Criteria:" and extract everything after it
  const acIndex = fullText.toLowerCase().indexOf('acceptance criteria');
  if (acIndex === -1) {
    return '';
  }

  // Get text after "Acceptance Criteria:"
  let criteriaText = fullText.substring(acIndex);
  
  // Remove the "Acceptance Criteria:" header itself
  criteriaText = criteriaText.replace(/acceptance criteria:?\s*/i, '').trim();
  
  return criteriaText;
}

export async function fetchJiraIssue(issueKey: string): Promise<JiraIssue> {
  if (!jiraConfig.baseUrl) {
    throw new Error('JIRA_BASE_URL is not configured');
  }

  const url = `${jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}`;
  const authHeader = getJiraAuthHeader();

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      timeout: jiraConfig.timeout,
    });

    const issue = response.data;
    const fields = issue.fields || {};
    const descriptionObj = fields.description;

    // Extract full description text
    const fullDescription = extractTextFromDescription(descriptionObj);
    
    // Extract acceptance criteria
    const acceptanceCriteria = extractAcceptanceCriteria(descriptionObj);

    // Remove acceptance criteria section from description
    let cleanDescription = fullDescription;
    if (acceptanceCriteria) {
      const acIndex = fullDescription.toLowerCase().indexOf('acceptance criteria');
      if (acIndex !== -1) {
        cleanDescription = fullDescription.substring(0, acIndex).trim();
      }
    }

    return {
      summary: fields.summary || '',
      description: cleanDescription,
      issueType: fields.issuetype?.name || '',
      priority: fields.priority?.name || '',
      acceptanceCriteria: acceptanceCriteria,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Jira issue ${issueKey} not found`);
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Jira authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN');
    }
    throw new Error(`Failed to fetch Jira issue: ${error.message}`);
  }
}

export default { fetchJiraIssue };
