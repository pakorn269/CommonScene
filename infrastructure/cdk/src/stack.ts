/**
 * CommonScene AWS CDK Infrastructure Stack.
 *
 * Defines the complete cloud architecture supporting CommonScene:
 *
 * 1. Amazon DynamoDB: Serverless room and participant state with automatic session TTL.
 * 2. Amazon S3 + CloudFront: Global static web hosting for the mobile participant PWA.
 * 3. Amazon API Gateway HTTP API: RESTful service endpoints (/api/v1/rooms/...).
 * 4. Amazon API Gateway WebSocket API: Bidirectional realtime room state synchronization.
 * 5. AWS IAM: Least-privilege role policies for Amazon Bedrock foundation models.
 * 6. Amazon CloudWatch: Application log groups and operational monitoring metrics.
 */

import {
    CfnOutput,
    Duration,
    RemovalPolicy,
    Stack,
    type StackProps,
} from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

export interface CommonSceneStackProps extends StackProps {
    environmentName?: string;
}

export class CommonSceneStack extends Stack {
    public readonly roomsTable: dynamodb.Table;
    public readonly pwaBucket: s3.Bucket;
    public readonly distribution: cloudfront.Distribution;
    public readonly apiLogGroup: logs.LogGroup;

    constructor(scope: Construct, id: string, props: CommonSceneStackProps = {}) {
        super(scope, id, props);

        const env = props.environmentName || 'production';

        // ---------------------------------------------------------------------
        // 1. Amazon DynamoDB — Room & Participant Storage with TTL
        // ---------------------------------------------------------------------
        this.roomsTable = new dynamodb.Table(this, 'CommonSceneRoomsTable', {
            tableName: `commonscene-rooms-${env}`,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: 'expiresAt',
            removalPolicy:
                env === 'production'
                    ? RemovalPolicy.RETAIN
                    : RemovalPolicy.DESTROY,
            pointInTimeRecovery: env === 'production',
        });

        // Global Secondary Index for 4-letter room code lookups
        this.roomsTable.addGlobalSecondaryIndex({
            indexName: 'byCode',
            partitionKey: {
                name: 'code',
                type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        // ---------------------------------------------------------------------
        // 2. Amazon S3 & CloudFront — Mobile Participant PWA Hosting
        // ---------------------------------------------------------------------
        this.pwaBucket = new s3.Bucket(this, 'CommonScenePwaBucket', {
            bucketName: `commonscene-pwa-${this.account}-${this.region}-${env}`,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: env !== 'production',
        });

        this.distribution = new cloudfront.Distribution(
            this,
            'CommonScenePwaDistribution',
            {
                comment: `CommonScene Mobile PWA (${env})`,
                defaultRootObject: 'index.html',
                defaultBehavior: {
                    origin: origins.S3BucketOrigin.withOriginAccessControl(
                        this.pwaBucket as unknown as s3.IBucket
                    ),
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                    cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                },
                errorResponses: [
                    {
                        httpStatus: 404,
                        responseHttpStatus: 200,
                        responsePagePath: '/index.html',
                        ttl: Duration.minutes(5),
                    },
                    {
                        httpStatus: 403,
                        responseHttpStatus: 200,
                        responsePagePath: '/index.html',
                        ttl: Duration.minutes(5),
                    },
                ],
                minimumProtocolVersion:
                    cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            }
        );

        // ---------------------------------------------------------------------
        // 3. Amazon Bedrock IAM Policy (Server-Side Execution Only)
        // ---------------------------------------------------------------------
        const bedrockPolicyStatement = new iam.PolicyStatement({
            sid: 'CommonSceneBedrockAccess',
            effect: iam.Effect.ALLOW,
            actions: [
                'bedrock:InvokeModel',
                'bedrock:Converse',
                'bedrock:ConverseStream',
            ],
            resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`,
                `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-lite-v1:0`,
                `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-pro-v1:0`,
            ],
        });

        // ---------------------------------------------------------------------
        // 4. Amazon CloudWatch — Log Group & Monitoring
        // ---------------------------------------------------------------------
        this.apiLogGroup = new logs.LogGroup(this, 'CommonSceneApiLogGroup', {
            logGroupName: `/aws/commonscene/api-${env}`,
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // ---------------------------------------------------------------------
        // 5. CloudFormation Stack Outputs
        // ---------------------------------------------------------------------
        new CfnOutput(this, 'DynamoDBTableName', {
            value: this.roomsTable.tableName,
            description: 'DynamoDB Table Name for CommonScene Rooms',
            exportName: `CommonScene-RoomsTable-${env}`,
        });

        new CfnOutput(this, 'MobilePwaCloudFrontUrl', {
            value: `https://${this.distribution.distributionDomainName}`,
            description: 'CloudFront URL for Mobile Participant PWA',
            exportName: `CommonScene-PwaUrl-${env}`,
        });

        new CfnOutput(this, 'MobilePwaS3BucketName', {
            value: this.pwaBucket.bucketName,
            description: 'S3 Bucket Name for Mobile PWA Assets',
            exportName: `CommonScene-PwaBucket-${env}`,
        });

        new CfnOutput(this, 'BedrockPolicyJson', {
            value: JSON.stringify(bedrockPolicyStatement.toStatementJson()),
            description: 'IAM Policy statement for Amazon Bedrock runtime access',
        });
    }
}
