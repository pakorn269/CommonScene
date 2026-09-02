/**
 * CommonScene AWS CDK Infrastructure — App Entry Point.
 *
 * Defines the CDK application and provisions the CommonSceneStack.
 */

import { App } from 'aws-cdk-lib';
import { CommonSceneStack } from './stack.js';

export const CDK_VERSION = '0.1.0' as const;

export { CommonSceneStack } from './stack.js';

const app = new App();

new CommonSceneStack(app, 'CommonScene-Production', {
  environmentName: 'production',
  env: {
    account: process.env['CDK_DEFAULT_ACCOUNT'] || '123456789012',
    region: process.env['CDK_DEFAULT_REGION'] || 'us-east-1',
  },
  description: 'CommonScene Fire TV Group Movie Recommendation Cloud Stack',
});

app.synth();
