"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    rpcEndpoint: process.env.SOLANA_RPC_URL,
    websocketEndpoint: process.env.SOLANA_WEBSOCKET_URL,
    commitment: 'confirmed',
    maxRetries: 5,
    retryDelay: 2000,
    retryBackoff: true,
};
//# sourceMappingURL=config.js.map