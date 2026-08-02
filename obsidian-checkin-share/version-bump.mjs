import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { execSync } = await import("child_process");
const activeVersion = process.env.npm_package_version;

if (targetVersion !== manifest.version) {
  manifest.version = targetVersion;
  writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t") + "\n");
}

// 更新 versions.json（与 manifest 的 minAppVersion 对应）
const minAppVersion = manifest.minAppVersion;
const versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t") + "\n");
