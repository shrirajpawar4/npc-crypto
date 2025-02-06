export interface NormalizedTransaction {
  signature: string;
  blockTime: number;
  slot: number;
  type: TransactionType;
  status: 'success' | 'failed';
  sender: string;
  receiver?: string;
  amount?: number;
  mint?: string;  // For token transfers
  programId: string;
  fee: number;
  raw: any;  // Original transaction data
}

export type TransactionType =
  | 'TRANSFER'
  | 'TOKEN_TRANSFER'
  | 'NFT_TRANSFER'
  | 'NFT_SALE'
  | 'NFT_MINT'
  | 'UNKNOWN';