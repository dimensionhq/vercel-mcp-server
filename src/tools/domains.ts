import { Vercel } from '@vercel/sdk';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { UserError } from 'fastmcp';
import { buildOutput } from '../utils/output';
import { VercelTool } from '../utils/types';

const checkDomainAvailabilityToolSchema = z.object({
	name: z.string().describe('The name of the domain to check'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const checkDomainAvailabilityToolHandler = async (
	args: unknown,
	vercel: Vercel,
) => {
	try {
		const parsed = checkDomainAvailabilityToolSchema.parse(args);
		const domainStatus = await vercel.domains.checkDomainStatus({
			...parsed,
		});
		return buildOutput(domainStatus);
	} catch (error) {
		logger.error({
			message: 'Error while checking domain availability from vercel',
			error,
		});
		throw new UserError(
			'Error while checking domain availability from vercel',
			{
				error,
			},
		);
	}
};

const getDomainPriceToolSchema = z.object({
	name: z.string().describe('The name of the domain to check price for'),
	type: z
		.enum(['new', 'renewal', 'transfer', 'redemption'])
		.optional()
		.describe('Domain status type to check price for'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const getDomainPriceToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = getDomainPriceToolSchema.parse(args);
		const domainPrice = await vercel.domains.checkDomainPrice({
			...parsed,
		});
		return buildOutput(domainPrice);
	} catch (error) {
		logger.error({
			message: 'Error while getting domain price from vercel',
			error,
		});
		throw new UserError('Error while getting domain price from vercel', {
			error,
		});
	}
};

const listDomainsToolSchema = z.object({
	limit: z.number().optional().describe('Maximum number of domains to list'),
	since: z
		.string()
		.optional()
		.describe(
			'Get domains created after this date (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	until: z
		.string()
		.optional()
		.describe(
			'Get domains created before this date (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const listDomainsToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = listDomainsToolSchema.parse(args);
		const domains = await vercel.domains.getDomains({
			...parsed,
			since: parsed.since ? new Date(parsed.since).getTime() : undefined,
			until: parsed.until ? new Date(parsed.until).getTime() : undefined,
		});
		return buildOutput(domains);
	} catch (error) {
		logger.error({
			message: 'Error while listing domains from vercel',
			error,
		});
		throw new UserError('Error while listing domains from vercel', {
			error,
		});
	}
};

const allTools: VercelTool[] = [
	{
		name: 'VERCEL_CHECK_DOMAIN_AVAILABILITY',
		description: 'Check if a domain name is available for purchase',
		schema: checkDomainAvailabilityToolSchema,
		handler: checkDomainAvailabilityToolHandler,
	},
	{
		name: 'VERCEL_GET_DOMAIN_PRICE',
		description: 'Check the price to purchase a domain',
		schema: getDomainPriceToolSchema,
		handler: getDomainPriceToolHandler,
	},
	{
		name: 'VERCEL_LIST_DOMAINS',
		description: 'List all domains',
		schema: listDomainsToolSchema,
		handler: listDomainsToolHandler,
	},
];

export default allTools;

