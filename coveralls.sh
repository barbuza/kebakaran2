#!/bin/bash

if node --version | grep v6.; then
    npm run coveralls
fi
