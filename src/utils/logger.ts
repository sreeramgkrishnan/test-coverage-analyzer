export const logger = {
  info: (...args: any[]) => console.log('[info]', ...args),
  warn: (...args: any[]) => console.warn('[warn]', ...args),
  error: (...args: any[]) => console.error('[error]', ...args),
  debug: (...args: any[]) => console.debug('[debug]', ...args)
}

export const logInfo = (message: string) => logger.info(message);
export const logError = (message: string) => logger.error(message);
export const logDebug = (message: string) => logger.debug(message);