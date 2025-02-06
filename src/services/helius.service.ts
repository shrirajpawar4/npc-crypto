import { Logger } from '../utils/logger';
import { config } from '../config/config';
import { processTransaction } from './transaction-processor.service';
import { NormalizedTransaction } from '../models/transaction.model';
import WebSocket from 'ws';

interface HeliusResponse {
    result?: any[];
    error?: any;
}

const logger = new Logger('HeliusService');
const HELIUS_RPC_URL = process.env.SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=0b30a84b-11c7-4385-b486-0725b5180b93';


export async function getAccountInfo(address: string) {
    try {
        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getAccountInfo',
                params: [
                    address,
                    {
                        encoding: 'base58',
                    },
                ],
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        logger.error('Error fetching account info:', error);
        throw error;
    }
}

export async function getTransactionHistory(address: string, beforeSignature?: string) {
    try {
        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'get-transactions',
                method: 'getSignaturesForAddress',
                params: [
                    address,
                    {
                        before: beforeSignature,
                        limit: 100,
                    },
                ],
            }),
        });

        const data = await response.json() as HeliusResponse;
        logger.debug('raw data', JSON.stringify(data));

        if (data.result && Array.isArray(data.result)) {
            const processed = await Promise.all(data.result.map(tx => processTransaction(tx)));
            logger.debug('processed txns', JSON.stringify(processed, null, 2)
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
            )


            // Filter out null results
            return processed.filter((tx): tx is NormalizedTransaction => tx !== null);
        }

        return [];
    } catch (error) {
        logger.error('Error fetching transaction history:', error);
        throw error;
    }
}
export const subscribeToAddress = async (address: string) => {
    const ws = new WebSocket(`${process.env.SOLANA_WEBSOCKET_URL}`);


    const sendRequest = () => {
        const request = {
            jsonrpc: "2.0",
            id: 1,
            method: "accountSubscribe",
            params: [
                address,
                {
                    encoding: "jsonParsed",
                    commitment: "finalized"
                }
            ]

        };

        ws.send(JSON.stringify(request));
    };

    const startPing = () => {
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
                logger.debug('Ping sent');
            }
        }, 30000);
    };

    ws.on('open', () => {
        logger.info('WebSocket connection established');
        sendRequest();
        startPing();
    });

    ws.on('message', (data) => {
        try {
            const messageObj = JSON.parse(data.toString('utf8'));

            if (messageObj.result && typeof messageObj.result === 'number') {
                logger.info(`Successfully subscribed with ID: ${messageObj.result}`);
                return;
            }

            logger.debug('Received account message:', messageObj);

            return messageObj;

        } catch (e) {
            logger.error('Failed to parse WebSocket message:', e);
        }
    });

    ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        logger.info('WebSocket connection closed');
    });

    return ws;
};
