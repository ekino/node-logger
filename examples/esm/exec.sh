#!/bin/bash

for file in examples/esm/*.js; do
    node "$file"
done