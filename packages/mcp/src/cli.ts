#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createNemokitMcpServer } from './server.js';

async function main(): Promise<void> {
  const server = createNemokitMcpServer();
  const transport = new StdioServerTransport();

  process.on('SIGINT', async () => {
    try {
      await server.close();
    } finally {
      process.exit(0);
    }
  });

  process.on('SIGTERM', async () => {
    try {
      await server.close();
    } finally {
      process.exit(0);
    }
  });

  await server.connect(transport);
}

main().catch(error => {
  console.error('Fatal error starting Nemokit MCP server:', error);
  process.exit(1);
});
