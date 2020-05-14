nxpm
====

Nx PM CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nxpm.svg)](https://npmjs.org/package/nxpm)
[![CircleCI](https://circleci.com/gh/nxpm/nxpm/tree/master.svg?style=shield)](https://circleci.com/gh/nxpm/nxpm/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/nxpm.svg)](https://npmjs.org/package/nxpm)
[![License](https://img.shields.io/npm/l/nxpm.svg)](https://github.com/nxpm/nxpm/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nxpm
$ nxpm COMMAND
running command...
$ nxpm (-v|--version|version)
nxpm/0.0.0 darwin-x64 node-v12.16.2
$ nxpm --help [COMMAND]
USAGE
  $ nxpm COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nxpm hello [FILE]`](#nxpm-hello-file)
* [`nxpm help [COMMAND]`](#nxpm-help-command)

## `nxpm hello [FILE]`

describe the command here

```
USAGE
  $ nxpm hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ nxpm hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/nxpm/nxpm/blob/v0.0.0/src/commands/hello.ts)_

## `nxpm help [COMMAND]`

display help for nxpm

```
USAGE
  $ nxpm help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
