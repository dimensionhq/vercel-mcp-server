import { Vercel } from '@vercel/sdk';
import { FastMCP, UserError } from 'fastmcp';
import { env } from './env';
import { logger } from './utils/logger';
import { allTools } from './tools';

interface VercelSession extends Record<string, unknown> {
	vercel: Vercel | null;
	accToken: string | null;
}

const server = new FastMCP<VercelSession>({
	name: 'Vercel MCP server',
	version: '1.0.0',
	authenticate: async (req) => {
		let vercel: Vercel | null = null;
		let accToken: string | null = null;
		try {
			const raw = req.headers['authorization'];
			accToken = raw?.startsWith('Bearer ') ? raw.slice(7) : null;

			if (!accToken) {
				throw new UserError(
					'Provide a valid vercel access token to use this resource',
					{ accTokenSent: accToken },
				);
			}

			vercel = new Vercel({
				bearerToken: accToken,
			});
		} catch (error) {
			logger.error({
				message: 'Error while authenticating inside vercel mcp server',
				error,
			});
		} finally {
			return {
				vercel,
				accToken,
			};
		}
	},
	health: {
		enabled: true,
		message: 'ok',
		path: '/health',
		status: 200,
	},
});

// Register all tools
for (const tool of allTools) {
	server.addTool({
		name: tool.name,
		description: tool.description,
		parameters: tool.schema,
		execute: async (args, context) => {
			if (!context.session?.vercel) {
				throw new Error('Vercel session not available');
			}
			return tool.handler(
				args,
				context.session.vercel,
				context.session.accToken,
			);
		},
	});
}

server.start({
	transportType: 'httpStream',
	httpStream: {
		port: env.PORT,
		stateless: true,
	},
});

