# Protoc Tools gRPC Web Plugin
**This [accility/protoc-tools](https://github.com/accility/protoc-tools) plugin uses [protoc-gen-grpc-web](https://github.com/grpc/grpc-web/releases) to generate the gRPC Web files.** The protoc-gen-grpc-web binary can be downloaded and used as-is, however this have some implications, that mainly being: adding the binary to path and installation. This plugin solves both of theese issues.

For a more in-depth documentation, visit https://github.com/grpc/grpc-web.

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
