import { path } from './deps.ts'

const appDataFolder = Deno.env.get('LOCALAPPDATA')
export const comMojangFolder = appDataFolder
	? path.join(
			appDataFolder,
			'Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang'
	  )
	: null
export const previewComMojangFolder = appDataFolder
	? path.join(
			appDataFolder,
			'Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang'
	  )
	: null
