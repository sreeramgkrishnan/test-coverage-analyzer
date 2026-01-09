import { Router, Request, Response } from 'express';
import { fetchJiraIssue } from '../../../services/jiraService';

const router = Router();

/**
 * GET /v1/jira/fetch/:issueKey
 * Fetch Jira user story details by issue key (e.g., PROJ-123)
 */
router.get('/v1/jira/fetch/:issueKey', async (req: Request, res: Response) => {
  try {
    const { issueKey } = req.params;
    if (!issueKey || typeof issueKey !== 'string') {
      return res.status(400).json({ success: false, error: 'issueKey parameter is required' });
    }

    const issue = await fetchJiraIssue(issueKey);
    res.json({
      success: true,
      issue,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || 'Failed to fetch Jira issue' });
  }
});

/**
 * POST /v1/jira/fetch
 * Fetch Jira user story details by issue key in request body
 * Body: { issueKey: string }
 */
router.post('/v1/jira/fetch', async (req: Request, res: Response) => {
  try {
    const { issueKey } = req.body;
    if (!issueKey || typeof issueKey !== 'string') {
      return res.status(400).json({ success: false, error: '"issueKey" is required in request body' });
    }

    const issue = await fetchJiraIssue(issueKey);
    res.json({
      success: true,
      issue,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || 'Failed to fetch Jira issue' });
  }
});

export default router;
