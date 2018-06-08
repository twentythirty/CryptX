#!/bin/sh

cd front-end;
pwd;
if [ $NODE_ENV = "production" ]; then
  webpack;
else
  NODE_ENV=dev webpack-dev-server --port=4200 --open;
fi