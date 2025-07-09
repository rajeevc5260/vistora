import { Trelae } from 'trelae-files'
import { env } from "$env/dynamic/public";

const trelaeAPIKey = env.PUBLIC_TRELAE_API_KEY;

if (!trelaeAPIKey) {
    throw new Error('TRELAE_API_KEY is not set');
}

export const trelae = new Trelae({
    apiKey: trelaeAPIKey,
    devMode: false
});

console.log('Initialized Trelae instance:', trelae);
