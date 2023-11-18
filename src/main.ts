import fs from 'node:fs';
import path from 'node:path';
import { Events } from 'discord.js';
import Client, { Modal, ChatInputCommand, ContextMenuMessageCommand, ContextMenuUserCommand } from '@/common/Client';

const client = new Client();


import { sequelize } from '@/common/database';

// Commands
async function main() {
	try {
		client.logger.database('Initializing database');
		await sequelize.authenticate();
		await sequelize.sync();

		client.logger.database('Database connection has been established successfully.');
	}
	catch (err) {
		return client.logger.error('Unable to connect to the database:', err);
	}

	// Slash Commands
	const commandsPath = path.join(__dirname, 'interactions', 'commands');
	const chatInputFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts') && file.startsWith('slash.')).map(file => path.join(commandsPath, file));
	const contextCommandsFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts') && file.startsWith('context.')).map(file => path.join(commandsPath, file));

	client.logger.info('Initializing slash and context commands');
	for (const file of [...chatInputFiles, ...contextCommandsFiles]) {
		const isContextCommand = file.toLowerCase().includes('context');

		const command: ChatInputCommand | ContextMenuUserCommand | ContextMenuMessageCommand = (await import(file)).default;

		if (!command.enabled) {
			client.logger.trace(`Skipping disabled command ${command.data.name}`);
			continue;
		}

		if ('data' in command && 'execute' in command) {
			client.logger.trace(`Loading command ${command.data.name}`);
			if (!isContextCommand) {
				client.commands.set(command.data.name, command as ChatInputCommand);
			}
			else {
				client.contextMenus.set(command.data.name, command as ContextMenuUserCommand | ContextMenuMessageCommand);
			}
		}
		else {
			client.logger.info(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
		}
	}

	// Events
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

	client.logger.info('Initializing events');
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = (await import(filePath)).default;

		if (event.once) {
			client.once(event.name, (...args) => event.execute(client, ...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(client, ...args));
		}
		client.logger.trace(`Loading event ${event.name}`);
	}

	// Modals
	const modalsPath = path.join(__dirname, 'interactions', 'modals');
	const modalsFiles = fs.readdirSync(modalsPath).filter((file: string) => file.endsWith('.ts'));

	client.logger.info('Initializing modals');
	for (const file of modalsFiles) {
		const filePath = path.join(modalsPath, file);
		const modal: Modal = (await import(filePath)).default;

		if ('name' in modal && 'execute' in modal) {
			client.logger.trace(`Loading modal ${modal.name}`);
			client.modals.set(modal.name, modal);
		}
		else {
			client.logger.info(`[WARNING] The modal at ${filePath} is missing a required "name" or "execute" property.`);
		}
	}
}

main();

client.on(Events.ShardError, error => {
	client.logger.error('A websocket connection encountered an error:', error);
});

// client.on(Events.Debug, m => { client.logger.debug(m); });
client.on(Events.Warn, m => { client.logger.warn(m); });
client.on(Events.Error, m => { client.logger.error(m); });

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_CLIENT_SECRET);

export default client;