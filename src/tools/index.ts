import deploymentTools from './deployments';
import dnsTools from './dns';
import domainTools from './domains';
import projectTools from './projects';
import teamTools from './teams';
import userTools from './users';

export const allTools = [
	...deploymentTools,
	...dnsTools,
	...domainTools,
	...projectTools,
	...teamTools,
	...userTools,
];

