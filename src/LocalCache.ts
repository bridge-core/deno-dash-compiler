import { fs, path } from "./deps.ts";

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
