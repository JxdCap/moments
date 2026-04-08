import PocketBase from 'pocketbase';

export const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL as string | undefined;

export const pb = pocketBaseUrl ? new PocketBase(pocketBaseUrl) : null;

export const isPocketBaseEnabled = Boolean(pb);
