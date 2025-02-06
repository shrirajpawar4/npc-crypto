"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor(context) {
        this.context = context;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length ? JSON.stringify(args) : '';
        return `[${timestamp}] ${level} [${this.context}] ${message} ${formattedArgs}`;
    }
    formatJSON(obj) {
        return JSON.stringify(obj, (key, value) => {
            // Handle special cases
            if (value === null)
                return 'null';
            if (value === '')
                return '""';
            return value;
        }, 4); // Use 4 spaces for more readable indentation
    }
    debug(message, data) {
        if (data) {
            console.debug(this.formatJSON(data));
        }
        else {
            console.debug(this.formatMessage(LogLevel.DEBUG, message));
        }
    }
    info(message, ...args) {
        console.info(this.formatMessage(LogLevel.INFO, message, ...args));
    }
    warn(message, ...args) {
        console.warn(this.formatMessage(LogLevel.WARN, message, ...args));
    }
    error(message, ...args) {
        console.error(this.formatMessage(LogLevel.ERROR, message, ...args));
    }
}
exports.Logger = Logger;
// Usage example:
// const logger = new Logger('MyService');
// logger.info('Starting service');
// logger.error('Failed to connect', { error: 'Connection refused' });
//# sourceMappingURL=logger.js.map