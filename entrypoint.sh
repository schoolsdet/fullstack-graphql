#!/bin/bash

set -e

echo "Seeding JWT_SECRET"
export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));")

echo "Starting server..."
npm start --workspace=frontend --workspace=backend #todo: this basically doesn't work atm