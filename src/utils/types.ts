import z from 'zod';
import { Vercel } from '@vercel/sdk';

export interface VercelTool {
	name: string;
	description: string;
	schema: z.ZodObject;
	handler: (
		args: unknown,
		vercel: Vercel,
		accToken?: string | null,
	) => Promise<string>;
}

