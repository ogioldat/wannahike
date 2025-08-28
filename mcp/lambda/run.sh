#!/bin/sh

export AWS_LWA_READINESS_CHECK_PATH=${AWS_LWA_READINESS_CHECK_PATH:-/ready}
export PORT=${PORT:-8080}

node dist/server.js