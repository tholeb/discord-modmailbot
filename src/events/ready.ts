import { type BaseApplicationCommandData, Events, REST, Routes } from 'discord.js';

import { type Event } from '@/common/Client';

const event: Event<null> = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		client.logger.info(`${client.user.tag}, ready to serve ${client.guilds.cache.size} servers.`);
		client.logger.info(`Invite link : https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
		// client.user.setActivity('faire du café ☕', { type: ActivityType.Competing });

		const rest = new REST().setToken(process.env.DISCORD_CLIENT_SECRET);

		const cmds: BaseApplicationCommandData[] = [];

		client.commands.map((item) => {
			cmds.push(item.data);
		});

		client.contextMenus.map((item) => {
			cmds.push(item.data);
		});

		client.guilds.cache.forEach(async (guild) => {
			try {
				client.logger.info(`Started refreshing ${cmds.length} application commands for ${guild.name}`);

				// The put method is used to fully refresh all commands in the guild with the current set
				const cmdData = await rest.put(
					Routes.applicationGuildCommands(client.user.id, guild.id),
					{ body: cmds },
				) as unknown[];

				client.logger.info(`Successfully reloaded ${cmdData.length} application commands`);
			}
			catch (error) {
				client.logger.error(error);
			}
		});

		client.inbox = await client.guilds.fetch(process.env.DISCORD_INBOX_SERVER);
	},
};

export default event;
