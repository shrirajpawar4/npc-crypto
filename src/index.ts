import { getAccountInfo, getTransactionHistory, subscribeToAddress } from './services/helius.service';
import { Logger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const logger = new Logger('Application');
const address = process.env.WALLET_ADDRESS;

async function start() {
    if (!address) {
        throw new Error('WALLET_ADDRESS is required in environment variables');
    }

    try {
        // Get account information
        const accountInfo = await getAccountInfo(address);
        logger.info('Account info retrieved successfully');

        // Get and process transactions
        const transactions = await getTransactionHistory(address);
        logger.info(`Processed ${transactions.length} transactions`);

        const websocket = await subscribeToAddress(address);
        logger.info('Address subscribed successfully');


        return {
            accountInfo,
            transactions,
            websocket
        };
    } catch (error) {
        logger.error('Error in application:', error);
        throw error;
    }

}

// Start the application
start().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
});