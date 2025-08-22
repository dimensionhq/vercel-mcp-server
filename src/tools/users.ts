import { Vercel } from '@vercel/sdk';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { UserError } from 'fastmcp';
import { buildOutput } from '../utils/output';
import { VercelTool } from '../utils/types';

const getUserToolSchema = z.object({});
const getUserToolHandler = async (args: unknown, vercel: Vercel) => {
	try {
		const user = await vercel.user.getAuthUser();
		return buildOutput(user);
	} catch (error) {
		logger.error({
			message: 'Error while getting user from vercel',
			error,
		});
		throw new UserError('Error while getting user from vercel', {
			error,
		});
	}
};

const allTools: VercelTool[] = [
	{
		name: 'VERCEL_GET_USER',
		description:
			'Retrieves information related to the currently authenticated User',
		schema: getUserToolSchema,
		handler: getUserToolHandler,
	},
];

export default allTools;

