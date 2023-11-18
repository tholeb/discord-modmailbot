declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_CLIENT_SECRET: string;
			DISCORD_MAIN_SERVER: string;
			DISCORD_INBOX_SERVER: string;
		}
	}
}


export { };