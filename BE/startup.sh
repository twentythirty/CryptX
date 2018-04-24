#!/bin/sh

if [ $NODE_ENV = "production" ]; then
  node ./bin/www;
else
  NODE_ENV=dev nodemon --delay 2550ms ./bin/www;
fi