import getConfig from "next/config";

// Allows us to get the publicRuntimeConfig and export
const { publicRuntimeConfig } = getConfig();

export const API = publicRuntimeConfig.API;
export const APP_NAME = publicRuntimeConfig.APP_NAME;
export const DOMAIN = publicRuntimeConfig.DOMAIN;
export const PRODUCTION = publicRuntimeConfig.PRODUCTION;
export const FB_APP_ID = publicRuntimeConfig.FB_APP_ID;
