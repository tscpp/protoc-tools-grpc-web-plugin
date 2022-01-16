const got = require('got').default
const path = require('path')
const fs = require('fs')

const version = process.argv[process.argv.length - 1]

function getPlatform() {
	switch (process.platform) {
		case 'linux': return 'linux-x86_64'
		case 'darwin': return 'darwin-x86_64'
		case 'win32': return 'windows-x86_64'
		default: throw new Error(`Unsupported platform '${process.platform}'.`)
	}
}

async function main() {
	const platform = getPlatform()
	const extension = process.platform === 'win32' ? '.exe' : ''

	const directory = path.join(__dirname, 'bin')
	const destPath = path.join(directory, `protoc-gen-grpc-web${extension}`)

	if (fs.existsSync(destPath))
		return

	const data = await got.get(`https://github.com/grpc/grpc-web/releases/download/${version}/protoc-gen-grpc-web-${version}-${platform}${extension}`).buffer()

	fs.mkdirSync(directory, { recursive: true })
	fs.writeFileSync(destPath, data)
	fs.chmodSync(destPath, '0775')
}

main()
