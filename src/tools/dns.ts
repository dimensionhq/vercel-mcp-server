import { Vercel } from '@vercel/sdk';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { UserError } from 'fastmcp';
import { buildOutput } from '../utils/output';
import { VercelTool } from '../utils/types';

const createDnsRecordToolSchema = z.object({
	domain: z.string().describe('The domain used to create the DNS record'),
	type: z
		.enum(['A', 'AAAA', 'ALIAS', 'CAA', 'CNAME'])
		.describe('The type of record'),
	name: z.string().describe('The name of the DNS record'),
	value: z.string().describe('The value of the DNS record'),
	ttl: z
		.number()
		.min(60)
		.max(2147483647)
		.optional()
		.describe('The Time to live (TTL) value'),
	comment: z.string().max(500).optional().describe('A comment to add context'),
	teamId: z
		.string()
		.optional()
		.describe('The Team identifier to perform the request on behalf of'),
	slug: z
		.string()
		.optional()
		.describe('The Team slug to perform the request on behalf of'),
});
const createDnsRecordToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = createDnsRecordToolSchema.parse(args);
		const dnsRecord = await vercel.dns.createRecord({
			domain: parsed.domain,
			teamId: parsed.teamId,
			slug: parsed.slug,
			requestBody: {
				name: parsed.name,
				comment: parsed.comment,
				ttl: parsed.ttl,
				type: parsed.type,
				value: parsed.value,
			},
		});
		return buildOutput(dnsRecord);
	} catch (error) {
		logger.error({
			message: 'Error while creating DNS record in vercel',
			error,
		});
		throw new UserError('Error while creating DNS record in vercel', {
			error,
		});
	}
};

const listDnsRecordsToolSchema = z.object({
	domain: z.string().describe('The domain name'),
	limit: z.string().optional().describe('Maximum number of records to list'),
	since: z
		.string()
		.optional()
		.describe(
			'Get records created after this date (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
		),
	until: z
		.string()
		.optional()
		.describe(
			'Get records created before this date (ISO 8601 format, e.g., "2025-01-01T00:00:00Z" or "2025-01-01")',
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
const listDnsRecordsToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const parsed = listDnsRecordsToolSchema.parse(args);
		const dnsRecords = await vercel.dns.getRecords({
			...parsed,
			since: parsed.since
				? new Date(parsed.since).getTime().toString()
				: undefined,
			until: parsed.until
				? new Date(parsed.until).getTime().toString()
				: undefined,
		});
		return buildOutput(dnsRecords);
	} catch (error) {
		logger.error({
			message: 'Error while listing DNS records from vercel',
			error,
		});
		throw new UserError('Error while listing DNS records from vercel', {
			error,
		});
	}
};

const allTools: VercelTool[] = [
	{
		name: 'VERCEL_CREATE_DNS_RECORD',
		description: 'Creates a DNS record for a domain',
		schema: createDnsRecordToolSchema,
		handler: createDnsRecordToolHandler,
	},
	{
		name: 'VERCEL_LIST_DNS_RECORDS',
		description: 'Retrieves a list of DNS records created for a domain name',
		schema: listDnsRecordsToolSchema,
		handler: listDnsRecordsToolHandler,
	},
];

export default allTools;

