#!/bin/bash

for file in examples/*.ts; do
	tsx "$file"
done
