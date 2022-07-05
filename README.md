# deno-dash-compiler

## Installation

Make sure that you have Deno installed. Then run `deno install -A -n dash_compiler https://deno.land/x/dash_compiler/mod.ts` within your terminal.

## Usage

### Building a project

`dash_compiler build`: Loads all plugins and builds the project inside of your current working directory in production mode.
- `--mode development`: Tell bridge. that you want to compile a development build

### Watching for changes
`dash_compiler watch`: Recompile files whenever you make changes to your project
