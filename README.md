# deno-dash-compiler
Dash is an efficient compiler for Minecraft Add-Ons.
This project uses the [Dash compiler library](https://github.com/bridge-core/dash-compiler) to provide bridge.'s built-in compiler as a standalone CLI program.

## Installation

There are multiple options to install Dash:
- Make sure that you have Deno installed. Then run `deno install -A -n dash_compiler https://raw.githubusercontent.com/bridge-core/deno-dash-compiler/main/mod.ts` within your terminal
- Make sure that you have Deno installed and that you've create your project with bridge. v2.3 or higher. Within your terminal, navigate to the project root and run `deno task setup` to install Dash.
- Download a standalone executable from the [`/executables` folder](https://github.com/bridge-core/deno-dash-compiler/tree/main/executables)

## Usage

### Building a project

`dash_compiler build`: Loads all plugins and builds the project inside of your current working directory in production mode.
- `--mode development`: Tell bridge. that you want to compile a development build
- `--compilerConfig [path]`: Compile the project with a different set of plugins

### Watching for changes
`dash_compiler watch`: Recompile files whenever you make changes to your project
- `--out [path]` Set a directory to output to. Default: com.mojang folder; use `--out preview` to instead output to Minecraft Preview
- `--reload [port]` Open a WebSocket which, once connected, runs the `/reload` command in Minecraft when a script or function is updated. Default port: `8080`. This option requires the Minecraft client to be exempt from network loopback restrictions; this exemption is set automatically.
