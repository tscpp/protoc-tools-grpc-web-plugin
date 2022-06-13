# Protoc Tools gRPC Web Plugin

This [protoc-tools](https://github.com/accility/protoc-tools) plugin uses the [protoc-gen-grpc-web](https://github.com/grpc/grpc-web/releases) binary to generate the gRPC Web files.

**NOTE!** The installer will by default download the latest version. Ensure that you specify the version to use. See [binary version](#binary-version).

The plugin aims to solve theese problems:
- Installing the binary with specified version.
- Temporarly adding the binary to path.
- Convenient configuration with protoc-tools.

See https://github.com/grpc/grpc-web.

## Usage

```
npm install --save-dev @accility/protoc-tools protoc-tools-grpc-web-plugin
```

```javascript
import * as tools from '@accility/protoc-tools'
import * as grpcweb from 'protoc-tools-grpc-web-plugin'

tools.protoc({
	...
	outOptions: [
		tools.generators.js({
			outOptions: 'import_style=commonjs'
		}),
		grpcweb({
			// required: 'closure' | 'commonjs' | 'commonjs+dts' | 'typescript'
			module: 'commonjs',

			// optional: 'grpcwebtext' | 'grpcweb'
			mode: 'grpcwebtext'
		})
	]
})
```

## Binary version

The binary is downloaded when the package is installed. By default, the latest stable version (latest) is downloaded. It is recommended to specify the version of the binary in package.json under "config.protoc-gen-grpc-web-version". You can also specify the version in the "PROTOC_GEN_GRPC_WEB_VERSION" enviroment variable, which will be chosen over the version specified in package.json.

**NOTE!** Remember to execute "npm ci" to install the new binary.

Versions which can be used are:

- "latest" - latest stable version.
- "next" - latest prerelease version.
- [All syntaxes allowed in npm dependencies](https://docs.npmjs.com/about-semantic-versioning#using-semantic-versioning-to-specify-update-types-your-package-can-accept).
- Other syntaxes will be treated as the exact version to use.

```
{
	"devDependencies": {
		// The version of the plugin (not the binary):
		"protoc-tools-grpc-web-plugin": "^3.2.1"
	},
    "config": {
		// The version of the binary to be installed:
        "protoc-gen-grpc-web-version": "^1.2.3"
    }
}
```

## Enviroment variable flags

The installation script will notify when a enviroment varaiable flag is toggled.

- PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_INSTALL - installation will always exit.

- PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_CACHE - installation will always run.

- PROTOC_GEN_GRPC_WEB_VERSION - override binary version to install.
