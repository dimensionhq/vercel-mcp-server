import { Vercel } from '@vercel/sdk';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { UserError } from 'fastmcp';
import { buildOutput } from '../utils/output';
import { VercelTool } from '../utils/types';

const getDeploymentToolSchema = z.object({
	idOrUrl: z
		.string()
		.describe('The unique identifier or hostname of the deployment'),
	withGitRepoInfo: z
		.string()
		.optional()
		.describe('Whether to add gitRepo information'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const getDeploymentToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = getDeploymentToolSchema.parse(args);
		const deployment = await vercel.deployments.getDeployment({
			...parsed,
		});
		return buildOutput(deployment);
	} catch (error) {
		logger.error({
			message: 'Error while getting deployment from vercel',
			error,
		});
		throw new UserError('Error while getting deployment from vercel', {
			error,
		});
	}
};

const getDeploymentEventsToolSchema = z.object({
	idOrUrl: z
		.string()
		.describe('The unique identifier or hostname of the deployment'),
	direction: z
		.enum(['forward', 'backward'])
		.optional()
		.describe('Order of the returned events based on timestamp'),
	follow: z
		.number()
		.optional()
		.describe('Return live events as they happen (1 to enable)'),
	limit: z
		.number()
		.optional()
		.describe('Maximum number of events to return (-1 for all)'),
	name: z.string().optional().describe('Deployment build ID'),
	since: z
		.string()
		.optional()
		.describe(
			'Timestamp to start pulling logs from (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	until: z
		.string()
		.optional()
		.describe(
			'Timestamp to pull logs until (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	statusCode: z
		.string()
		.optional()
		.describe("HTTP status code range to filter events by (e.g. '5xx')"),
	delimiter: z.number().optional().describe('Delimiter option'),
	builds: z.number().optional().describe('Builds option'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const getDeploymentEventsToolHandler = async (
	args: unknown,
	vercel: Vercel,
) => {
	try {
		const parsed = getDeploymentEventsToolSchema.parse(args);
		const events = await vercel.deployments.getDeploymentEvents({
			...parsed,
			since: parsed.since ? new Date(parsed.since).getTime() : undefined,
			until: parsed.until ? new Date(parsed.until).getTime() : undefined,
		});
		return buildOutput(events);
	} catch (error) {
		logger.error({
			message: 'Error while getting deployment events from vercel',
			error,
		});
		throw new UserError('Error while getting deployment events from vercel', {
			error,
		});
	}
};

const listDeploymentFilesToolSchema = z.object({
	id: z.string().describe('The unique deployment identifier'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const listDeploymentFilesToolHandler = async (
	args: unknown,
	vercel: Vercel,
) => {
	try {
		const parsed = listDeploymentFilesToolSchema.parse(args);
		const files = await vercel.deployments.listDeploymentFiles({
			...parsed,
		});
		return buildOutput(files);
	} catch (error) {
		logger.error({
			message: 'Error while listing deployment files from vercel',
			error,
		});
		throw new UserError('Error while listing deployment files from vercel', {
			error,
		});
	}
};

const getDeploymentFileContentsToolSchema = z.object({
	id: z.string().describe('The unique deployment identifier'),
	fileId: z.string().describe('The unique file identifier'),
	path: z
		.string()
		.optional()
		.describe('Path to the file (only for Git deployments)'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const getDeploymentFileContentsToolHandler = async (
	args: unknown,
	vercel: Vercel,
) => {
	try {
		const parsed = getDeploymentFileContentsToolSchema.parse(args);
		const fileContents = await vercel.deployments.getDeploymentFileContents({
			...parsed,
		});
		return buildOutput(fileContents);
	} catch (error) {
		logger.error({
			message: 'Error while getting deployment file contents from vercel',
			error,
		});
		throw new UserError(
			'Error while getting deployment file contents from vercel',
			{
				error,
			},
		);
	}
};

const listDeploymentsToolSchema = z.object({
	app: z.string().optional().describe('Name of the deployment'),
	from: z
		.string()
		.optional()
		.describe(
			'Get deployments created after this timestamp (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	limit: z
		.number()
		.optional()
		.describe('Maximum number of deployments to list'),
	projectId: z
		.string()
		.optional()
		.describe('Filter deployments from the given ID or name'),
	target: z
		.string()
		.optional()
		.describe('Filter deployments based on the environment'),
	to: z
		.string()
		.optional()
		.describe(
			'Get deployments created before this timestamp (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	users: z
		.string()
		.optional()
		.describe('Filter deployments based on users who created them'),
	since: z
		.string()
		.optional()
		.describe(
			'Get deployments created after this timestamp (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	until: z
		.string()
		.optional()
		.describe(
			'Get deployments created before this timestamp (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	state: z
		.string()
		.optional()
		.describe(
			'Filter by state (BUILDING, ERROR, INITIALIZING, QUEUED, READY, CANCELED)',
		),
	rollbackCandidate: z
		.boolean()
		.optional()
		.describe('Filter deployments based on rollback candidacy'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const listDeploymentsToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = listDeploymentsToolSchema.parse(args);
		const deployments = await vercel.deployments.getDeployments({
			...parsed,
			from: parsed.from ? new Date(parsed.from).getTime() : undefined,
			to: parsed.to ? new Date(parsed.to).getTime() : undefined,
			since: parsed.since ? new Date(parsed.since).getTime() : undefined,
			until: parsed.until ? new Date(parsed.until).getTime() : undefined,
		});
		return buildOutput(deployments);
	} catch (error) {
		logger.error({
			message: 'Error while listing deployments from vercel',
			error,
		});
		throw new UserError('Error while listing deployments from vercel', {
			error,
		});
	}
};

const allTools: VercelTool[] = [
	{
		name: 'VERCEL_GET_DEPLOYMENT',
		description:
			'Retrieve detailed information for a specific deployment including build status, regions, and metadata',
		schema: getDeploymentToolSchema,
		handler: getDeploymentToolHandler,
	},
	{
		name: 'VERCEL_GET_DEPLOYMENT_EVENTS',
		description:
			'Retrieve build logs and events for a specific deployment to debug issues',
		schema: getDeploymentEventsToolSchema,
		handler: getDeploymentEventsToolHandler,
	},
	{
		name: 'VERCEL_LIST_DEPLOYMENT_FILES',
		description: 'List all files in a specific deployment to debug issues',
		schema: listDeploymentFilesToolSchema,
		handler: listDeploymentFilesToolHandler,
	},
	{
		name: 'VERCEL_GET_DEPLOYMENT_FILE_CONTENTS',
		description: 'Retrieve the contents of a specific file in a deployment',
		schema: getDeploymentFileContentsToolSchema,
		handler: getDeploymentFileContentsToolHandler,
	},
	{
		name: 'VERCEL_LIST_DEPLOYMENTS',
		description: 'List all deployments for a specific project',
		schema: listDeploymentsToolSchema,
		handler: listDeploymentsToolHandler,
	},
];

export default allTools;

