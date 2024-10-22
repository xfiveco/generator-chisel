#!/bin/bash

set -eux

pushd ../../..
sudo chown "$USER:$USER" . index.php wp-config.php
if [ -d .git ] ; then sudo chown "$USER:$USER" .git ; fi
cp .devcontainer/wp-config-local.php .

popd

sudo chown "$USER:$USER" node_modules vendor
npm install
npm run composer install
npm run build

