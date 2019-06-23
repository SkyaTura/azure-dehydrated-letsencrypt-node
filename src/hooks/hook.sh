#!/usr/bin/env bash

echo $CA > /dev/tty
node ./src/hooks/hook.js ${1} ${2} ${3} ${4} > /dev/tty
exit 0
