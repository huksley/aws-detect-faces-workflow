#!/bin/bash
set -e

command -v jq >/dev/null 2>&1 || { echo >&2 "jq not installed https://stedolan.github.io/jq/download/"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo >&2 "aws cli not installed https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html"; exit 1; }

# FIXME: Check credentials

WORKFLOW_NAME=new-profile-pic-express

ARN=`aws stepfunctions list-state-machines | jq -r ".stateMachines[] | select(.name == \"${WORKFLOW_NAME}\") | .stateMachineArn"`

if [ "$ARN" != "" ]; then
  echo Updating ${WORKFLOW_NAME}
  aws stepfunctions update-state-machine --state-machine-arn ${ARN} --definition file://./workflow.json
else
  echo Creating ${WORKFLOW_NAME}
fi

aws stepfunctions describe-state-machine --state-machine-arn ${ARN} | jq "del(.definition)"

ROLE_NAME=`aws stepfunctions describe-state-machine --state-machine-arn ${ARN} | \
  jq -r ".roleArn | match(\"(.*service-role)\/(.*)\$\").captures[1].string"` 

node generate-iam-policy.js > workflow-policy.json

if [ "${ROLE_NAME}" != "" ]; then
  aws iam put-role-policy --role-name new-profile-pic-workflow-role \
    --policy-name workflow0 --policy-document file://./workflow-policy.json
  echo Updating role ${ROLE_NAME}
else 
  echo Creating role  
fi

#create-state-machine
#          --name <value>
#          --definition <value>
#          --role-arn <value>
#check role exists

