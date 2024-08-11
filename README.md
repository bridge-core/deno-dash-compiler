# deno-dash-compiler

_Dash_ is an efficient compiler for Minecraft add-ons. This project uses the
[Dash compiler library](https://github.com/bridge-core/dash-compiler) to provide
[bridge.](https://github.com/bridge-core/editor/)'s built-in compiler as a standalone CLI program.

## Installation Options

There are multiple methods to install Dash:

### Executables

**(For Windows or macOS)**

A standalone Dash executable can be [downloaded from this repository's
Releases page](https://github.com/bridge-core/deno-dash-compiler/releases).

---

### Deno

[Deno must be installed on your system](https://deno.land/#installation) to use the following methods:

#### Via Deno's Script Installer

Open your terminal and run:

```shell
deno install -A -f --reload -n dash_compiler https://raw.githubusercontent.com/bridge-core/deno-dash-compiler/main/mod.ts
```

#### Via Deno's Task Runner

(Requires [bridge. v2.3](https://github.com/bridge-core/editor/releases) or higher)

Run from within your project's root directory:

```shell
deno task setup
```

---

## Usage

### Building a project

`dash_compiler build`: Loads all plugins and builds the project inside of your
current working directory in production mode.

- `--mode development`: Tell bridge. that you want to compile a development
  build
- `--out preview`: Tell bridge. that you want to compile the project to Minecraft Preview instead of Stable
- `--compilerConfig [path]`: Compile the project with a different set of plugins

### Watching for changes

`dash_compiler watch`: Recompile files whenever you make changes to your project

- `--out [path]` Set a directory to output to. Default: com.mojang folder; use
  `--out preview` to instead output to Minecraft Preview
- `--reload [port]` Open a WebSocket which, once connected, runs the `/reload`
  command in Minecraft when a script or function is updated. Default port:
  `8080`. This option requires the Minecraft client to be exempt from network
  loopback restrictions. This exemption is set automatically as long as Dash is
  running with admin privileges.
