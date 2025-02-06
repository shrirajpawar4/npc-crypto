import { Logger } from '../utils/logger';
import { NormalizedTransaction, TransactionType } from '../models/transaction.model';

const logger = new Logger('TransactionProcessor');

export async function processTransaction(rawTransaction: any): Promise<NormalizedTransaction | null> {
  try {
    const normalizedTx = normalizeTransaction(rawTransaction);
    if (normalizedTx) {
      logger.info(`Processed transaction: ${normalizedTx.signature}`);
      return normalizedTx;
    }
    return null;
  } catch (error) {
    logger.warn('Error processing transaction:', error);
    return null;
  }
}

function normalizeTransaction(raw: any): NormalizedTransaction | null {
  try {
    // Extract and validate signature
    const signature = raw.signature || raw.transaction?.signatures?.[0];
    if (!signature) {

      throw new Error('Missing transaction signature');
    }

    // Base58 check - Solana signatures are 88 characters in base58
    if (typeof signature !== 'string' || signature.length !== 88) {
      throw new Error(`Invalid signature format: ${signature}`);
    }

    // Rest of the normalization logic
    const slot = raw.slot || 0;
    const blockTime = raw.blockTime || Math.floor(Date.now() / 1000);
    const status = raw.meta?.err ? 'failed' : 'success';
    const fee = raw.meta?.fee || 0;

    // Extract accounts safely
    const accounts = raw.transaction?.message?.accountKeys || [];
    const sender = accounts[0]?.toBase58?.() || accounts[0] || '';
    const receiver = accounts[1]?.toBase58?.() || accounts[1] || '';

    // Extract transaction details with defaults
    const { type = 'UNKNOWN', amount = 0, mint = '', programId = '' } = extractTransactionDetails(raw);

    return {
      signature,
      blockTime,
      slot,
      type,
      status,
      sender,
      receiver,
      amount,
      mint,
      programId,
      fee,
      raw
    };
  } catch (error) {
    logger.warn(`Skipping invalid transaction: ${error}`);
    // Return null instead of throwing to allow processing to continue
    return null;
  }
}

function extractTransactionDetails(raw: any): {
  type: TransactionType;
  amount?: number;
  mint?: string;
  programId: string;
} {
  try {
    const programId = raw.transaction?.message?.accountKeys?.[0]?.toBase58?.() || '';

    // Default values
    let type: TransactionType = 'UNKNOWN';
    let amount: number | undefined;
    let mint: string | undefined;

    // Check program ID to determine transaction type
    switch (programId) {
      case '11111111111111111111111111111111': // System Program
        type = 'TRANSFER';
        amount = extractSOLAmount(raw);
        break;

      case 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': // Token Program
        type = 'TOKEN_TRANSFER';
        ({ amount, mint } = extractTokenDetails(raw));
        break;

      case 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': // Metaplex Token Metadata
        if (raw.meta?.innerInstructions?.some((ix: any) => ix.instructions.some((i: any) => i.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'))) {
          type = 'NFT_MINT';
        }
        break;

      case 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K': // Magic Eden v2
      case '3o9d13qUvEuuauhFrVom1vuCzgNsJifeaBYDPquaT73Y': // OpenSea
        type = 'NFT_SALE';
        break;

      case 'A7p8451ktDCHq5yYaHczeLMYsjRsAkzc3hCXcSrwYHU7': // Coral Cube
        type = raw.meta?.innerInstructions ? 'NFT_SALE' : 'NFT_TRANSFER';
        break;

      default:
        type = 'UNKNOWN';
    }

    return { type, amount, mint, programId };
  } catch (error) {
    logger.error('Error extracting transaction details:', error);
    throw error;
  }
}

function extractSOLAmount(raw: any): number {
  try {
      const preBalances = raw.meta?.preBalances || [];
      const postBalances = raw.meta?.postBalances || [];

      // Calculate the difference in balances
      if (preBalances.length >= 2 && postBalances.length >= 2) {
          const senderPreBalance = preBalances[0];
          const senderPostBalance = postBalances[0];
          const difference = (senderPreBalance - senderPostBalance) / 1e9; // Convert lamports to SOL
          return difference > 0 ? difference - (raw.meta?.fee || 0) / 1e9 : 0;
      }
      return 0;
  } catch (error) {
      logger.error('Error extracting SOL amount:', error);
      return 0;
  }
}

function extractTokenDetails(raw: any): { amount?: number; mint?: string } {
  try {
      const tokenBalances = raw.meta?.postTokenBalances || [];
      const preTokenBalances = raw.meta?.preTokenBalances || [];

      if (tokenBalances.length > 0) {
          const tokenBalance = tokenBalances[0];
          return {
              amount: Number(tokenBalance.uiAmount),
              mint: tokenBalance.mint
          };
      }
      return {};
  } catch (error) {
      logger.error('Error extracting token details:', error);
      return {};
  }
}