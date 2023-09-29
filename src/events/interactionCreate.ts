import { Events, InteractionType } from 'discord.js';
import { Event } from '@/common/Client';
import path from 'node:path';
import fs from 'node:fs';

const foldersPath = path.join(__dirname, '..', 'modals');

export default {
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction) {
		const childLogger = client.logger.child({ type: InteractionType[interaction.type], user: interaction.user });

		if (interaction.isChatInputCommand()) {
			childLogger.info({ name: interaction.commandName, options: interaction.options }, 'Command executed');

			const command = client.commands.get(interaction.commandName);

			if (!command) {
				client.logger.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(client, interaction);
			}
			catch (error) {
				client.logger.error(`Error executing ${interaction.commandName}`);
				client.logger.error(error);

				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				}
				else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
		else if (interaction.isModalSubmit()) {
			childLogger.info({ name: interaction.customId }, 'context menu executed');
			const modal = client.contextMenus.get(interaction.customId);

			if (!modal) {
				client.logger.error(`No context command matching ${interaction.customId} was found.`);
				return;
			}

			try {
				await modal.execute(client, interaction as never);
			}
			catch (error) {
				client.logger.error(error);
			}
		}
		else if (interaction.isAutocomplete()) {
			childLogger.info({ name: interaction.commandName }, 'Autocomplete executed');
			const command = client.commands.get(interaction.commandName);

			if (!command || !command.autocomplete) {
				client.logger.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(client, interaction);
			}
			catch (error) {
				client.logger.error(error);
			}
		}
		else if (interaction.isContextMenuCommand()) {
			childLogger.info({ name: interaction.commandName }, 'context menu executed');
			const contextCommand = client.contextMenus.get(interaction.commandName);

			if (!contextCommand) {
				client.logger.error(`No context command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await contextCommand.execute(client, interaction as never);
			}
			catch (error) {
				client.logger.error(error);
			}
		}

		return;
	},
} satisfies Event;