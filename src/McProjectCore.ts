import { FileType, IFileType, PackType } from "./deps.ts";
import { getLocalData, saveLocalData } from "./LocalCache.ts";

export class PackTypeImpl extends PackType<void> {
	async setup() {
		const cached = await getLocalData("packDefinitions.json");

		if (cached) {
			try {
				this.packTypes = JSON.parse(cached);

				return;
			} catch {
				// empty
			}
		}

		this.packTypes = await fetch(
			"https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/packDefinitions.json",
		).then((resp) => resp.json());

		saveLocalData("packDefinitions.json", JSON.stringify(this.packTypes));
	}
}
export class FileTypeImpl extends FileType<void> {
	protected _cache = new Map<string, IFileType | null>();

	async setup() {
		this._cache.clear();

		const cached = await getLocalData("fileDefinitions.json");

		if (cached) {
			try {
				this.fileTypes = JSON.parse(cached);

				return;
			} catch {
				// empty
			}
		}

		this.fileTypes = await fetch(
			"https://raw.githubusercontent.com/bridge-core/editor-packages/main/dist/minecraftBedrock/fileDefinitions.json",
		).then((resp) => resp.json());

		saveLocalData("fileDefinitions.json", JSON.stringify(this.fileTypes));
	}

	override addPluginFileType(fileDef: IFileType) {
		this._cache.clear();

		return super.addPluginFileType(fileDef);
	}

	override get(filePath?: string, searchFileType?: string, checkFileExtension = true) {
		if (!filePath || !checkFileExtension || searchFileType !== undefined) {
			return super.get(filePath, searchFileType, checkFileExtension);
		}

		const cached = this._cache.get(filePath);
		if (cached !== undefined) return cached ?? undefined;

		const result = super.get(filePath, searchFileType, checkFileExtension);
		this._cache.set(filePath, result ?? null);
		return result;
	}
}
