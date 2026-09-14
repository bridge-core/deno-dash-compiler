import { fs, path } from "./deps.ts";

export async function tryInvalidateLocalData(forceInvalid: boolean) {
	const localDataPath = await getLocalDataPath();

	if (!localDataPath) return;

	try {
		if (forceInvalid) {
			console.log("Invalidating local cache!");

			await fs.emptyDir(localDataPath);

			return;
		}

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

// Caching this lookup save about 20ms
let localDataPathCache: string | null = null;

export async function getLocalDataPath(): Promise<string | undefined> {
	if (localDataPathCache) return localDataPathCache;

	const userDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");

	if (!userDir) return undefined;

	const appDataPath = path.join(userDir, ".dash");

	await fs.ensureDir(appDataPath);

	localDataPathCache = appDataPath;

	return appDataPath;
}

export async function saveLocalData(filePath: string, content: string | ArrayBuffer) {
	const localDataPath = await getLocalDataPath();

	if (!localDataPath) return;

	const fullPath = path.join(localDataPath, filePath);

	await fs.ensureDir(path.dirname(fullPath));

	if (typeof content === "string") {
		await Deno.writeTextFile(fullPath, content);
	} else {
		await Deno.writeFile(fullPath, new Uint8Array(content));
	}

	const timestampFilePath = path.join(localDataPath, ".timestamp");

	if (!(await fs.exists(timestampFilePath))) await Deno.writeTextFile(timestampFilePath, Date.now().toString());
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
