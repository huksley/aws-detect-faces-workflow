generateWorkflowPolicy = w => {
  let lambaInvoke = [];
  Object.keys(w.States).forEach(s => {
    const step = w.States[s];
    // FIXME: add more types of tasks
    if (step.Type === "Task" && step.Resource.startsWith("arn:aws:lambda:")) {
      lambaInvoke.push(step.Resource)
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
      }
    ]
  };
  return policy;
};

workflow = require("./workflow.json");

console.log(JSON.stringify(generateWorkflowPolicy(workflow), null, 2))
