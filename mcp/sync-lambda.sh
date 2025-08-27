#!/bin/sh

pnpm install --prod
pnpm run build
pnpm run zip

API_KEY=$(cat ../.secret/apikey.txt)

aws lambda update-function-configuration \
    --function-name hello \
    --environment "{\"Variables\":{\"API_KEY\":\"$API_KEY\", \"AWS_LAMBDA_EXEC_WRAPPER\":\"/opt/bootstrap\"}}" \
    --layers "arn:aws:lambda:eu-central-1:753240598075:layer:LambdaAdapterLayerX86:25" \
    --handler "run.sh"


aws lambda update-function-code \
  --function-name hello \
  --zip-file fileb://lambda.zip

