import { OutputOptions } from '@accility/protoc-tools'

export interface Options {
	/**
	 * Import style (https://github.com/grpc/grpc-web#import-style)
	 * 
	 * - `closure` - the default generated code has Closure `goog.require()` import style.
	 * - `commonjs` - the CommonJS style `require()` is also supported.
	 * - `commonjs+dts` - (experimental) in addition to above, a .d.ts typings file will also be generated for the protobuf messages and service stub.
	 * - `typescript` - (experimental) the service stub will be generated in TypeScript. See TypeScript Support below for information on how to generate TypeScript files.
	 */
	module: 'closure' | 'commonjs' | 'commonjs+dts' | 'typescript'

	/**
	 * Wire format mode (https://github.com/grpc/grpc-web#wire-format-mode)
	 * 
	 * `mode=grpcwebtext`: The default generated code sends the payload in the grpc-web-text format.
	 * - `Content-type: application/grpc-web-text`
	 * - Payload are base64-encoded.
	 * - Both unary and server streaming calls are supported.
	 * 
	 * `mode=grpcweb`: A binary protobuf format is also supported.
	 * - `Content-type: application/grpc-web+proto`
	 * - Payload are in the binary protobuf format.
	 * - Only unary calls are supported for now.
	 * 
	 * @default 'grpcwebtext'
	 */
	mode?: 'grpcwebtext' | 'grpcweb'
}

export default function plugin(options: Options): OutputOptions
