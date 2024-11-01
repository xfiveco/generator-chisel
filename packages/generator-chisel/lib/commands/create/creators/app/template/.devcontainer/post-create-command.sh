#!/bin/bash

set -eux

pushd ../../..
sudo chown "$USER:$USER" . index.php wp-config.php
if [ -d .git ] ; then sudo chown "$USER:$USER" .git ; fi

popd

sudo chown "$USER:$USER" node_modules vendor
npm install
npm run wp-config -- --devcontainer
npm run composer install
npm run build

