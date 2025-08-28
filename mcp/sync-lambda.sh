#!/bin/sh

pnpm install --shamefully-hoist --node-linker hoisted
pnpm run build
pnpm run zip

API_KEY=$(grep '^API_KEY=' .env | sed 's/API_KEY=//')
WEATHER_API_KEY=$(grep '^WEATHER_API_KEY=' .env | sed 's/WEATHER_API_KEY=//')

echo "🚀 Updating Lambda function configuration..."

aws lambda update-function-configuration \
    --no-cli-pager \
    --function-name hello \
    --environment "{\"Variables\":{\"API_KEY\":\"$API_KEY\", \"AWS_LAMBDA_EXEC_WRAPPER\":\"/opt/bootstrap\", \"WEATHER_API_KEY\":\"$WEATHER_API_KEY\"}}" \
    --layers "arn:aws:lambda:eu-central-1:753240598075:layer:LambdaAdapterLayerX86:25" \
    --handler "run.sh"


echo "📦 Updating Lambda function code..."

aws lambda update-function-code \
  --no-cli-pager \
  --function-name hello \
  --zip-file fileb://lambda.zip

echo "✅ Synced Lambda function code!"