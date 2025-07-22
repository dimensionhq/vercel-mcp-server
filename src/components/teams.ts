import { z } from 'zod';
import { handleResponse } from '../utils/response.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BASE_URL } from '../config/constants.js';

export function registerTeamTools(server: McpServer, accessToken: string) {
	// Get Team Information
	server.tool(
		'get_team',
		'Get information for a specific team',
		{
			teamId: z.string().describe('The Team identifier'),
		},
		async ({ teamId }) => {
			const response = await fetch(`${BASE_URL}/v2/teams/${teamId}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = await handleResponse(response);
			return {
				content: [
					{
						type: 'text',
						text: `Team information:\n${JSON.stringify(data, null, 2)}`,
					},
				],
			};
		},
	);

	// List Teams
	server.tool(
		'list_teams',
		'Get a list of all teams the authenticated user is a member of',
		{
			limit: z
				.number()
				.optional()
				.describe('Maximum number of teams to return'),
			since: z
				.number()
				.optional()
				.describe('Include teams created since timestamp'),
			until: z
				.number()
				.optional()
				.describe('Include teams created until timestamp'),
		},
		async ({ limit, since, until }) => {
			const url = new URL(`${BASE_URL}/v2/teams`);
			if (limit) url.searchParams.append('limit', limit.toString());
			if (since) url.searchParams.append('since', since.toString());
			if (until) url.searchParams.append('until', until.toString());

			const response = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = await handleResponse(response);
			return {
				content: [
					{ type: 'text', text: `Teams:\n${JSON.stringify(data, null, 2)}` },
				],
			};
		},
	);

	// List Team Members
	server.tool(
		'list_team_members',
		'Get a list of team members',
		{
			teamId: z.string().describe('The Team identifier'),
			limit: z
				.number()
				.min(1)
				.optional()
				.describe('Maximum number of members to return'),
			since: z
				.number()
				.optional()
				.describe('Include members added since timestamp'),
			until: z
				.number()
				.optional()
				.describe('Include members added until timestamp'),
			search: z
				.string()
				.optional()
				.describe('Search by name, username, or email'),
			role: z
				.enum([
					'OWNER',
					'MEMBER',
					'DEVELOPER',
					'VIEWER',
					'BILLING',
					'CONTRIBUTOR',
				])
				.optional()
				.describe('Filter by role'),
			excludeProject: z
				.string()
				.optional()
				.describe('Exclude members from specific project'),
			eligibleMembersForProjectId: z
				.string()
				.optional()
				.describe('Include members eligible for project'),
		},
		async ({
			teamId,
			limit,
			since,
			until,
			search,
			role,
			excludeProject,
			eligibleMembersForProjectId,
		}) => {
			const url = new URL(`${BASE_URL}/v2/teams/${teamId}/members`);
			if (limit) url.searchParams.append('limit', limit.toString());
			if (since) url.searchParams.append('since', since.toString());
			if (until) url.searchParams.append('until', until.toString());
			if (search) url.searchParams.append('search', search);
			if (role) url.searchParams.append('role', role);
			if (excludeProject)
				url.searchParams.append('excludeProject', excludeProject);
			if (eligibleMembersForProjectId)
				url.searchParams.append(
					'eligibleMembersForProjectId',
					eligibleMembersForProjectId,
				);

			const response = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = await handleResponse(response);
			return {
				content: [
					{
						type: 'text',
						text: `Team members:\n${JSON.stringify(data, null, 2)}`,
					},
				],
			};
		},
	);

	// Invite Team Member
	server.tool(
		'invite_team_member',
		'Invite a user to join a team',
		{
			teamId: z.string().describe('The Team identifier'),
			role: z
				.enum([
					'OWNER',
					'MEMBER',
					'DEVELOPER',
					'SECURITY',
					'BILLING',
					'VIEWER',
					'CONTRIBUTOR',
				])
				.describe('The role to assign'),
			email: z
				.string()
				.email()
				.optional()
				.describe('The email address to invite'),
			uid: z.string().optional().describe('The user ID to invite'),
			projects: z
				.array(
					z.object({
						projectId: z.string(),
						role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
					}),
				)
				.optional()
				.describe('Project-specific roles'),
		},
		async ({ teamId, role, email, uid, projects }) => {
			const response = await fetch(`${BASE_URL}/v1/teams/${teamId}/members`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ role, email, uid, projects }),
			});

			const data = await handleResponse(response);
			return {
				content: [
					{
						type: 'text',
						text: `Team member invited:\n${JSON.stringify(data, null, 2)}`,
					},
				],
			};
		},
	);

	// Remove Team Member
	server.tool(
		'remove_team_member',
		'Remove a member from a team',
		{
			teamId: z.string().describe('The Team identifier'),
			uid: z.string().describe('The user ID to remove'),
			newDefaultTeamId: z
				.string()
				.optional()
				.describe('New default team ID for Northstar user'),
		},
		async ({ teamId, uid, newDefaultTeamId }) => {
			const url = new URL(`${BASE_URL}/v1/teams/${teamId}/members/${uid}`);
			if (newDefaultTeamId)
				url.searchParams.append('newDefaultTeamId', newDefaultTeamId);

			const response = await fetch(url.toString(), {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = await handleResponse(response);
			return {
				content: [
					{
						type: 'text',
						text: `Team member removed:\n${JSON.stringify(data, null, 2)}`,
					},
				],
			};
		},
	);
}

