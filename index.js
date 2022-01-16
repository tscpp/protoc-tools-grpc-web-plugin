const path = require('path')

function appendPathEnv(path) {
	const name = process.platform === 'win32' ? 'Path' : 'PATH'
	const sep = process.platform === 'win32' ? ';' : ':'
	const paths = process.env[name].split(sep).filter(v => !!v)

	if (!paths.includes(path))
		process.env[name] = paths.concat(path).join(sep)
}

function plugin(options) {
	appendPathEnv(path.join(__dirname, 'bin'))

	return {
		name: 'grpc-web',
		outOptions: `import_style=${options.module},mode=${options.mode || 'grpcwebtext'}`,
	}
}

module.exports = plugin
module.exports.default = plugin
