export const deterministicConfig = {
  defaultLimit: parseInt(process.env.DETERMINISTIC_DEFAULT_LIMIT || '10', 10),
  caseSensitive: process.env.DETERMINISTIC_CASE_SENSITIVE === 'true',
  matchMode: process.env.DETERMINISTIC_MATCH_MODE || 'contains', // 'exact', 'contains', 'startsWith'
};

export default deterministicConfig;
