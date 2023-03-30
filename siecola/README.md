# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk bootstrap`   Integrate your project with your AWS account, create bucket, role, policy and host a docker enviroment
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk list`        display all stack registered from App
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk destroy`     remove all stacks from CloudFormation template

### if docker showing problem 
```
rm  ~/.docker/config.json
``` 

# What is AWS CDK?

The AWS CDK, a framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation and lets you build applications in the cloud with many benefits, including:

- Build with high-level constructs that automatically provide sensible, secure defaults for your AWS resources, defining more infrastructure with less code.

- Use programming idioms like parameters, conditionals, loops, composition, and inheritance to model your system design from building blocks provided by AWS and others.

- Put your infrastructure, application code, and configuration all in one place, ensuring that at every milestone you have a complete, cloud-deployable system.

- Employ software engineering practices such as code reviews, unit tests, and source control to make your infrastructure more robust.

- Connect your AWS resources together (even across stacks) and grant permissions using simple, intent-oriented APIs.

- Import existing AWS CloudFormation templates to give your resources a CDK API.

- Use the power of AWS CloudFormation to perform infrastructure deployments predictably and repeatedly, with rollback on error.

- Easily share infrastructure design patterns among teams within your organization or even with the public.

![aws cdk](./AppStacks.png)