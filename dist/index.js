"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helius_service_1 = require("./services/helius.service");
const logger_1 = require("./utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger = new logger_1.Logger('Application');
const address = process.env.WALLET_ADDRESS;
async function start() {
    if (!address) {
        throw new Error('WALLET_ADDRESS is required in environment variables');
    }
    try {
        // Get account information
        const accountInfo = await (0, helius_service_1.getAccountInfo)(address);
        logger.info('Account info retrieved successfully');
        // Get and process transactions
        const transactions = await (0, helius_service_1.getTransactionHistory)(address);
        logger.info(`Processed ${transactions.length} transactions`);
        const websocket = await (0, helius_service_1.subscribeToAddress)(address);
        logger.info('Address subscribed successfully');
        return {
            accountInfo,
            transactions,
            websocket
        };
    }
    catch (error) {
        logger.error('Error in application:', error);
        throw error;
    }
}
// Start the application
start().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map