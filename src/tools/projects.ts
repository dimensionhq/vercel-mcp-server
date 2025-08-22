import { Vercel } from '@vercel/sdk';
import { UserError } from 'fastmcp';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { buildOutput } from '../utils/output';
import { VercelTool } from '../utils/types';

const listProjectsToolSchema = z.object({
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const listProjectsToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = listProjectsToolSchema.parse(args);
		const projects = await vercel.projects.getProjects({
			...parsed,
		});
		return buildOutput(projects);
	} catch (error) {
		logger.error({
			message: 'Error while listing projects from vercel',
			error,
		});
		throw new UserError('Error while listing projects from vercel', {
			error,
		});
	}
};
const BASE_URL = 'https://api.vercel.com';
const getProjectToolSchema = z.object({
	idOrName: z
		.string()
		.describe('The unique project identifier or project name'),
});
const getProjectToolHandler = async (
	args: unknown,
	_vercel: Vercel,
	accessToken?: string | null,
) => {
	try {
		if (!accessToken) {
			throw new UserError('No access token provided');
		}
		const parsed = getProjectToolSchema.parse(args);
		const url = new URL(`${BASE_URL}/v9/projects/${parsed.idOrName}`);
		const options = {
			method: 'GET',
			headers: { Authorization: `Bearer ${accessToken}` },
			body: undefined,
		};

		const response = await fetch(url, options);

		if (response.ok) {
			const data = await response.json();
			return buildOutput(data);
		} else {
			const error = await response.text();
			throw new UserError('Error while getting project from vercel', {
				error,
			});
		}
	} catch (error) {
		logger.error({
			message: 'Error while getting project from vercel',
			error,
		});
		if (error instanceof UserError) {
			throw error;
		}
		throw new UserError('Error while getting project from vercel', {
			error,
		});
	}
};

const allTools: VercelTool[] = [
	{
		name: 'VERCEL_LIST_PROJECTS',
		description:
			"List all projects from Vercel. Commands: 'list projects', 'show projects', 'get projects', 'list all projects', 'show all projects', 'get all projects', 'list vercel projects', 'show my projects', 'list my projects', 'get my projects', 'retrieve projects', 'fetch projects', 'display projects', 'view projects'",
		schema: listProjectsToolSchema,
		handler: listProjectsToolHandler,
	},
	{
		name: 'VERCEL_GET_PROJECT',
		description: 'Get a project from Vercel. using either id or name',
		schema: getProjectToolSchema,
		handler: getProjectToolHandler,
	},
];

export default allTools;

