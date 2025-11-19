import { path } from "./deps.ts";

const appDataFolder = Deno.env.get("APPDATA");
export const comMojangFolder = appDataFolder
  ? path.join(appDataFolder, "Minecraft Bedrock/Users/Shared/games/com.mojang")
  : null;
export const previewComMojangFolder = appDataFolder
  ? path.join(
      appDataFolder,
      "Minecraft Bedrock Preview/Users/Shared/games/com.mojang"
    )
  : null;
