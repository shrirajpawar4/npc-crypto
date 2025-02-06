enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length ? JSON.stringify(args) : '';
    return `[${timestamp}] ${level} [${this.context}] ${message} ${formattedArgs}`;
  }

  private formatJSON(obj: any): string {
    return JSON.stringify(obj, (key, value) => {
      // Handle special cases
      if (value === null) return 'null';
      if (value === '') return '""';
      return value;
    }, 4)  // Use 4 spaces for more readable indentation
  }

  debug(message: string, data?: any) {
    if (data) {
      console.debug(this.formatJSON(data));
    } else {
      console.debug(this.formatMessage(LogLevel.DEBUG, message));
    }
  }


  info(message: string, ...args: any[]): void {
    console.info(this.formatMessage(LogLevel.INFO, message, ...args));
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, ...args));
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, ...args));
  }
}

// Usage example:
// const logger = new Logger('MyService');
// logger.info('Starting service');
// logger.error('Failed to connect', { error: 'Connection refused' });