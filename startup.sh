#!/bin/sh

if [ $NODE_ENV = "production" ]; then
  node ./bin/www;
else
  nodemon --delay 2550ms ./bin/www;
fi