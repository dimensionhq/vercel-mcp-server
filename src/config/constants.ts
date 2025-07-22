import 'dotenv/config';

export const BASE_URL = process.env.BASE_URL;

if (!BASE_URL) {
	throw new Error('BASE_URL must be set');
}

