const tools = require('@accility/protoc-tools')
const gRPCWeb = require('..')

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
