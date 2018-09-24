#!/usr/bin/env node

const commandDir = '../commands';

require('yargs')
  .usage('Usage: $0 <command> [options]')
  .demandCommand(1)
  .commandDir(commandDir)
  .help()
  .argv;
