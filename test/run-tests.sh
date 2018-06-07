#!/bin/bash

set -e

if [ "$TEST_VERSIONS" == "" ]; then
  eslint .
  mocha test/{generators,project}/**/*.test.js -b --reporter spec
elif [ "$TEST_VERSIONS" == "generator" ]; then
  rm -rf node_modules
  npm install --quiet > /dev/null
  npm install --quiet -g nsp npm-check > /dev/null
  npm shrinkwrap --dev
  nsp check
  npm-check -s
elif [ "$TEST_VERSIONS" == "generated_project" ]; then
  npm install --quiet -g nsp npm-check ejs > /dev/null
  cd "$(dirname "$0")"
  mkdir generated_project
  node generate_package.js
  cd generated_project
  npm install --quiet > /dev/null
  npm shrinkwrap --dev
  nsp check
  npm-check -s
else
  echo 'Bad value of $TEST_VERSIONS'
  exit 1
fi
