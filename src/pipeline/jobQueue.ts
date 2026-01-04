type JobStatus = 'pending'|'running'|'completed'|'failed';

type Job<T=any> = {
  id: string;
  status: JobStatus;
  result?: T;
  error?: string;
}

const jobs = new Map<string, Job>();

export const jobQueue = {
  create: (id: string) => {
    const job: Job = { id, status: 'pending' };
    jobs.set(id, job);
    return job;
  },
  get: (id: string) => jobs.get(id),
  setRunning: (id: string) => jobs.set(id, { ...(jobs.get(id)!), status: 'running' }),
  complete: (id: string, result: any) => jobs.set(id, { ...(jobs.get(id)!), status: 'completed', result }),
  fail: (id: string, error: string) => jobs.set(id, { ...(jobs.get(id)!), status: 'failed', error })
}
// This file is intentionally left blank.