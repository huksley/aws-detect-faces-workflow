/**
 * Generates IAM policy JSON from workflow definition
 * FIXME: Handles only Lambdas for now.
 */
const path = require("path")

generateWorkflowPolicy = w => {
  let lambaInvoke = [];
  let dynamoDbTableUpdateItem = [];
  Object.keys(w.States).forEach(s => {
    const step = w.States[s];
    // FIXME: add more types of tasks
    if (step.Type === "Task" && step.Resource.startsWith("arn:aws:states:::dynamodb:updateItem")) {
      const resource = "arn:aws:dynamodb:*:*:table/" + step.Parameters.TableName
      if (!dynamoDbTableUpdateItem.includes(resource)) {
        dynamoDbTableUpdateItem.push(resource)
      }
    } else
    if (step.Type === "Task" && step.Resource.startsWith("arn:aws:lambda:")) {
      if (!lambaInvoke.includes(step.Resource)) {
        lambaInvoke.push(step.Resource)
      }
    } else {
      throw new Error("Unknown step: " + step.Type + ", " + step.Resource)
    }
  });

  let policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "workflowPolicyGenerated0",
        Effect: "Allow",
        Action: "lambda:InvokeFunction",
        Resource: lambaInvoke
      },
      dynamoDbTableUpdateItem.length && {
        Sid: "workflowPolicyGenerated1",
        Effect: "Allow",
        Action: "dynamodb:UpdateItem",
        Resource: dynamoDbTableUpdateItem
      }
    ]
  };
  return policy;
};

workflow = require(process.env.WORKFLOW_FILE ? path.resolve('./', process.env.WORKFLOW_FILE) : "./workflow.json");

console.log(JSON.stringify(generateWorkflowPolicy(workflow), null, 2))
