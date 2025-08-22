import { Vercel } from '@vercel/sdk';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { UserError } from 'fastmcp';
import { buildOutput } from '../utils/output';
import { VercelTool } from '../utils/types';

const getTeamToolSchema = z.object({
	teamId: z.string().describe('The Team identifier'),
});
const getTeamToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = getTeamToolSchema.parse(args);
		const team = await vercel.teams.getTeam({
			...parsed,
		});
		return buildOutput(team);
	} catch (error) {
		logger.error({
			message: 'Error while getting team from vercel',
			error,
		});
		throw new UserError('Error while getting team from vercel', {
			error,
		});
	}
};

const listTeamsToolSchema = z.object({
	limit: z.number().optional().describe('Maximum number of teams to return'),
	since: z
		.string()
		.optional()
		.describe(
			'Include teams created after this date (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	until: z
		.string()
		.optional()
		.describe(
			'Include teams created before this date (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
});
const listTeamsToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = listTeamsToolSchema.parse(args);
		const teams = await vercel.teams.getTeams({
			...parsed,
			since: parsed.since ? new Date(parsed.since).getTime() : undefined,
			until: parsed.until ? new Date(parsed.until).getTime() : undefined,
		});
		return buildOutput(teams);
	} catch (error) {
		logger.error({
			message: 'Error while listing teams from vercel',
			error,
		});
		throw new UserError('Error while listing teams from vercel', {
			error,
		});
	}
};

const allTools: VercelTool[] = [
	{
		name: 'VERCEL_GET_TEAM',
		description: 'Get information for a specific team',
		schema: getTeamToolSchema,
		handler: getTeamToolHandler,
	},
	{
		name: 'VERCEL_LIST_TEAMS',
		description:
			'Get a list of all teams the authenticated user is a member of',
		schema: listTeamsToolSchema,
		handler: listTeamsToolHandler,
	},
];

export default allTools;

