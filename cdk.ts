import * as cdk from 'aws-cdk-lib';



const app = new cdk.App();
const stack = new cdk.Stack(app, 'ProductServiceStack', {
  env: {
    region: process.env.PRODUCT_AWS_REGION || 'eu-west-1',
  },
});
