import { access, mkdir, writeFile, readFile, chmod } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import follow_redirects from "follow-redirects";
import { resolve } from "node:path";
const { https } = follow_redirects;

const PREFIX = "[protoc-tools-grpc-web-plugin]";
const DEFAULT_VERSION = "latest";

function unreachable() {
    console.error(`${PREFIX} ERROR: Reached an unreachable state!\n`)
    process.exit(1);
}

async function exists(filename) {
    try {
        await access(filename);
        return true;
    } catch (err) {
        if (err.code === "ENOENT")
            return false;
        throw err;
    }
}

function get_binary_filename() {
    if (process.platform === "win32")
        return "bin/protoc-gen-grpc-web.exe";
    return "bin/protoc-gen-grpc-web";
}

function get_binary_download(version) {
    const asset = (() => {
        switch (process.platform) {
            case "linux": return "linux-x86_64"
            case "darwin": return "darwin-x86_64"
            case "win32": return "windows-x86_64.exe"
            default: unreachable();
        }
    })();

    return `https://github.com/grpc/grpc-web/releases/download/${version}/protoc-gen-grpc-web-${version}-${asset}`;
}

function get_releases() {
    return new Promise((resolve, reject) => {
        https.request("https://api.github.com/repos/grpc/grpc-web/releases", {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "protoc_tools_grpc_web_plugin"
            }
        }, (response) => {
            response.on("error", reject);

            if (!(response.statusCode >= 200 && response.statusCode < 300)) {
                console.error(`\n${PREFIX} ERROR: Unable to fetch releases (${response.statusCode}). Please submit an issue at https://github.com/tscpp/protoc-tools-grpc-web-plugin/issues/new.`);
                return;
            }

            let data = "";
            response.on("data", chunk => data += chunk.toString());
            response.on("close", () =>
                resolve(
                    JSON.parse(data)
                        .filter(release => release.assets.length > 0)
                )
            );
        })
            .on("error", reject)
            .end();
    });
}

async function get_version(input) {
    let match;
    if (/^([0-9]+)\.([0-9]+)\.([0-9]+)$/.test(input)) /* exact */ {
        return input;
    } else {
        if (input === "latest" || input === "*" || input === "x") /* next stable version*/ {
            const releases = await get_releases();
            return releases.find(release => !release.prerelease)?.tag_name;
        } else if (input === "next") /* next version */ {
            const releases = await get_releases();
            return releases[0].tag_name;
        } else if (
            (match = /^~([0-9]+)\.([0-9]+)\.[0-9]+$/.exec(input))
            || (match = /^([0-9]+)\.([0-9]+)(?:\.x)?$/.exec(input))
        ) /* patch */ {
            const [major, minor] = match.slice(1);
            const releases = await get_releases();
            return releases.find(release =>
                release.tag_name.startsWith(`${major}.${minor}`)
                && !release.prerelease
            )?.tag_name;
        } else if (
            (match = /^\^([0-9]+)\.([0-9]+)\.[0-9]+$/.exec(input))
            || (match = /([0-9]+)(?:\.x)?/.exec(input))
        ) /* minor */ {
            const [major] = match.slice(1);
            const releases = await get_releases();
            return releases.find(release =>
                release.tag_name.startsWith(major)
                && !release.prerelease
            )?.tag_name;
        } else {
            // console.error(`${PREFIX} ERROR: Invalid version syntax ("${input}").\n`);
            // process.exit(1);
            return input;
        }
    }
}

function format_version(version) {
    return /^[0-9]/.test(version) ? `v${version}` : version;
}

async function get_input_version() {
    if (process.env.PROTOC_GEN_GRPC_WEB_VERSION)
        return process.env.PROTOC_GEN_GRPC_WEB_VERSION;

    const pkg = await find_package(process.env.INIT_CWD ?? process.cwd());
    if (pkg?.config?.["protoc-gen-grpc-web-version"])
        return pkg.config["protoc-gen-grpc-web-version"];

    return DEFAULT_VERSION;
}

async function find_package(dir) {
    const path = resolve(dir, "package.json");

    if (await exists(path))
        return JSON.parse(await readFile(path, "utf-8"));

    let next;
    if ((next = resolve(dir, "..")) !== dir) {
        return await find_package(next);
    }
}

if (process.env.PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_INSTALL) {
    console.log(`${PREFIX} NOTE: Enviroment variable PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_INSTALL was set. This will cause the installer to always exit.`);
}

if (process.env.PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_CACHE) {
    console.log(`${PREFIX} NOTE: Enviroment variable PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_CACHE was set. This will cause the installer to always install the binary, whether or not the binary is already installed.`);
}

if (process.env.PROTOC_GEN_GRPC_WEB_VERSION) {
    console.log(`${PREFIX} NOTE: Enviroment variable PROTOC_GEN_GRPC_WEB_VERSION was set. This will cause the installer to try install the version specified in the variable.`);
}

if (
    process.env.PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_INSTALL
    || process.env.PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_CACHE
    || process.env.PROTOC_GEN_GRPC_WEB_VERSION
) {
    console.log("");
}

if (process.env.PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_INSTALL) {
    console.log(`${PREFIX} Skipping installation...`);
    process.exit(0);
}

const SUPPORTED_PLATFORMS = new Set(["darwin", "linux", "win32"]);
if (!SUPPORTED_PLATFORMS.has(process.platform)) {
    console.error(`${PREFIX} ERROR: Build for current platform (${process.platform}) is unavailable.\n`)
    process.exit(1);
}

const input_version = await get_input_version();
const version = await get_version(input_version);
const formatted_version = format_version(version);
const binary_filename = get_binary_filename();

if (await exists("bin")) {
    if (
        !process.env.PROTOC_TOOLS_GRPC_WEB_PLUGIN_NO_CACHE
        && await exists("bin/version.txt")
        && await exists(binary_filename)
        && await readFile("bin/version.txt", "utf-8") === version
    ) {
        // console.log(`${PREFIX} Binary is already installed. Skipping installation... `);
        process.exit(0);
    }
} else {
    await mkdir("bin");
}

const binary_dest = createWriteStream(binary_filename);
const binary_download = get_binary_download(version);

process.stdout.write(`${PREFIX} Downloading binary ${formatted_version}...`);

await new Promise((resolve, reject) => {
    const request = https.request(binary_download, (response) => {
        if (!(response.statusCode >= 200 && response.statusCode < 300)) {
            console.error(`\n${PREFIX} ERROR: Unable to download binary from "${binary_download}" (${response.statusCode}).\n`);
            process.exit(1);
        }

        response.on("error", (err) => {
            console.log("");
            reject(err);
        });

        response.on("close", () => {
            console.log("");
            resolve()
        });

        if (response.headers["content-length"]) {
            const length = parseInt(response.headers["content-length"]);
            let prevProgress = "0";
            let currentLength = 0;

            process.stdout.write("\x1b[3D (0%)...");

            response.on("data", chunk => {
                currentLength += chunk.length;
                const progress = (currentLength / length * 100).toFixed(0);
                process.stdout.write(`\x1b[${prevProgress.length + 5}D${progress}${prevProgress.length === progress.length ? "\x1b[5C" : "%)..."}`)
                prevProgress = progress;
                binary_dest.write(chunk);
            });
        } else {
            response.pipe(binary_dest);
        }
    });
    request.on("error", err => { throw err });
    request.end();
});

await new Promise((resolve) => binary_dest.close(resolve));
await chmod(binary_filename, "0775");
await writeFile("bin/version.txt", version);
