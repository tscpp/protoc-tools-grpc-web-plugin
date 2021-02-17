import * as tools from '@accility/protoc-tools'
import * as gRPCWeb from '../dist/plugin'

tools.protoc({
	files: [__dirname + '/main.proto'],
	includeDirs: [__dirname],
	outDir: __dirname + '/generated',
	outOptions: [
		tools.generators.js({
			outOptions: 'import_style=commonjs'
		}),
		gRPCWeb({
			module: 'commonjs'
		})
	]
})
