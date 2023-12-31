import * as cdk from 'aws-cdk-lib';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as dotenv from 'dotenv';

const nestEnvironment: dotenv.DotenvPopulateInput = {};

dotenv.config({ processEnv: nestEnvironment });

const app = new cdk.App();
const stack = new cdk.Stack(app, 'CartServiceStack', {
  env: {
    region: nestEnvironment.PRODUCT_AWS_REGION || 'eu-west-1',
  },
});
const cartService = new NodejsFunction(stack, 'cartServiceLambda', {
  runtime: Runtime.NODEJS_18_X,
  functionName: 'cartService',
  entry: 'dist/main.js',
  environment: nestEnvironment,
  bundling: {
    externalModules: [
      '@grpc/grpc-js',
      '@grpc/proto-loader',
      'amqp-connection-manager',
      'amqplib',
      'mqtt',
      'nats',
      'mysql',
      'mysql2',
      'pg-query-stream',
      'better-sqlite3',
      'sqlite3',
      'tedious',
      'better-sqlite3',
      'oracledb',
      '@nestjs/websockets', 
      '@nestjs/microservices/microservices-module', 
      '@nestjs/microservices'
    ],
  },
});
const api = new apiGateway.HttpApi(stack, 'CartApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  path: '/{api+}',
  methods: [apiGateway.HttpMethod.ANY],
  integration: new HttpLambdaIntegration('CartServiceProxyIntegration', cartService),
});

new cdk.CfnOutput(stack, 'ApiUrl', {
  value: `${api.url}` ?? 'Something went wrong with the deployment.',
});