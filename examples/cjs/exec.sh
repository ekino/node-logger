#!/bin/bash

for file in examples/cjs/*.cjs; do
    node "$file"
done