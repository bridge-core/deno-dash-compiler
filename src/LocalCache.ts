import { fs, path } from "./deps.ts";

export async function tryInvalidateLocalData() {
	const localDataPath = await getLocalDataPath();

	if (!localDataPath) return;

	try {
		let time = 0;

		const timestampFilePath = path.join(localDataPath, ".timestamp");

		if (await fs.exists(timestampFilePath)) {
			const lastUpdatedTimestamp = await Deno.readTextFile(timestampFilePath);

			time = parseInt(lastUpdatedTimestamp);
		}

		const now = Date.now();

		if (now - time > 1000 * 60 * 60 * 24) {
			console.log("Invalidating local cache of remote data!");

			await fs.emptyDir(localDataPath);
		}
	} catch {
		// empty
	}
}

export async function getLocalDataPath(): Promise<string | undefined> {
	const userDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");

	if (!userDir) return undefined;

	const appDataPath = path.join(userDir, ".dash");

	await fs.ensureDir(appDataPath);

	return appDataPath;
}

export async function saveLocalData(filePath: string, content: string) {
	const localDataPath = await getLocalDataPath();

	if (!localDataPath) return;

	const fullPath = path.join(localDataPath, filePath);

	await fs.ensureDir(path.dirname(fullPath));

	await Deno.writeTextFile(fullPath, content);

	const timestampFilePath = path.join(localDataPath, ".timestamp");

	if (!await fs.exists(timestampFilePath)) await Deno.writeTextFile(timestampFilePath, Date.now().toString());
}

export async function getLocalData(filePath: string): Promise<string | undefined> {
	const localDataPath = await getLocalDataPath();

	if (!localDataPath) return;

	const fullPath = path.join(localDataPath, filePath);

	try {
		return await Deno.readTextFile(fullPath);
	} catch {
		return;
	}
}
