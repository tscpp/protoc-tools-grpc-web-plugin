import * as request from 'request'
import * as path from 'path'
import * as fs from 'fs'

function version() {
	return '1.2.1'
}

function platform() {
	switch (process.platform) {
		case 'linux': return 'linux-x86_64'
		case 'darwin': return 'darwin-x86_64'
		case 'win32': return 'windows-x86_64'
		default: throw new Error(`Unsupported platform '${process.platform}'.`)
	}
}

function extension() {
	switch (process.platform) {
		case 'win32': return '.exe'
		default: return ''
	}
}

const filename = `protoc-gen-grpc-web-${version()}-${platform()}${extension()}`
const destDir = path.join(__dirname, '../bin')
const dest = path.join(destDir, `protoc-gen-grpc-web${extension()}`)

const headers = { 'User-Agent': 'request module' }

console.log(`Finding grpc/grpc-web release ${version()}...`)

request({
	url: `https://api.github.com/repos/grpc/grpc-web/releases`,
	headers,
	encoding: null
}, (err, _req, body) => {
	if (err) throw new Error(`Failed to download (${err})!`)

	const url = JSON.parse(body.toString()).find((release: any) => release.tag_name === version()).assets.find((asset: any) => asset.name === filename).browser_download_url

	console.log(`Downloading '${url}'...`)

	request({
		url,
		headers,
		encoding: null
	}, (err, _req, body) => {
		if (err) throw new Error(`Failed to download (${err})!`)

		fs.mkdirSync(destDir, { recursive: true })

		fs.writeFileSync(dest, body)
	})
})