import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerResources } from './resources.js';
import express, { Request, Response } from 'express';
import 'dotenv/config';

// Import all tool registration functions directly
import { register as registerAccessTools } from './tool-groups/access/index.js';
import { register as registerDomainsTools } from './tool-groups/domains/index.js';
import { register as registerInfrastructureTools } from './tool-groups/infrastructure/index.js';
import { register as registerIntegrationsTools } from './tool-groups/integrations/index.js';
import { register as registerProjectsTools } from './tool-groups/projects/index.js';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/mcp', async (req: Request, res: Response) => {
	// In stateless mode, create a new instance of transport and server for each request
	// to ensure complete isolation. A single instance would cause request ID collisions
	// when multiple clients connect concurrently.

	try {
		// Extract access token from headers
		const accessToken =
			req.headers.authorization?.replace('Bearer ', '') ||
			(req.headers['x-vercel-token'] as string) ||
			(req.headers['vercel-token'] as string);
		if (!accessToken) {
			return res.status(401).json({
				jsonrpc: '2.0',
				error: {
					code: -32001,
					message:
						'Access token required. Provide via Authorization header, x-vercel-token header, or DEFAULT_ACCESS_TOKEN env var.',
				},
				id: null,
			});
		}

		const server = new McpServer({
			name: 'vercel-tools',
			version: '1.0.0',
		});

		// Register resources (these are always available)
		registerResources(server, accessToken);

		// Register all tool groups upfront so they appear in MCP inspector
		await registerAccessTools(server, accessToken);
		await registerDomainsTools(server, accessToken);
		await registerInfrastructureTools(server, accessToken);
		await registerIntegrationsTools(server, accessToken);
		await registerProjectsTools(server, accessToken);

		const transport: StreamableHTTPServerTransport =
			new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined,
			});
		res.on('close', () => {
			console.log('Request closed');
			transport.close();
			server.close();
		});
		await server.connect(transport);
		await transport.handleRequest(req, res, req.body);
	} catch (error) {
		console.error('Error handling MCP request:', error);
		if (!res.headersSent) {
			res.status(500).json({
				jsonrpc: '2.0',
				error: {
					code: -32603,
					message: 'Internal server error',
				},
				id: null,
			});
		}
	}
});

// SSE notifications not supported in stateless mode
app.get('/mcp', async (req: Request, res: Response) => {
	console.log('Received GET MCP request');
	res.writeHead(405).end(
		JSON.stringify({
			jsonrpc: '2.0',
			error: {
				code: -32000,
				message: 'Method not allowed.',
			},
			id: null,
		}),
	);
});

// Session termination not needed in stateless mode
app.delete('/mcp', async (req: Request, res: Response) => {
	console.log('Received DELETE MCP request');
	res.writeHead(405).end(
		JSON.stringify({
			jsonrpc: '2.0',
			error: {
				code: -32000,
				message: 'Method not allowed.',
			},
			id: null,
		}),
	);
});

// Start the server
const PORT = 8081;

app.listen(PORT, (error) => {
	if (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
	console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});

