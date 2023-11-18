import { Collection, Client as DiscordClient, GatewayIntentBits, type ChatInputApplicationCommandData, type ChatInputCommandInteraction, type AutocompleteInteraction, type UserApplicationCommandData, type ModalSubmitInteraction, type ClientEvents, type UserContextMenuCommandInteraction, type MessageContextMenuCommandInteraction, type MessageApplicationCommandData, Partials, Guild } from 'discord.js';

import logger from '@/utils/logger';

export default class Client<Ready extends boolean = boolean> extends DiscordClient<Ready> {
	public readonly commands: Collection<string, ChatInputCommand>;
	public readonly events: Collection<string, Event<unknown>>;
	public readonly modals: Collection<string, Modal>;
	public readonly contextMenus: Collection<string, ContextMenuUserCommand | ContextMenuMessageCommand>;
	public readonly logger;
	public readonly config;
	public inbox: Guild | null;

	constructor() {
		super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages], partials: [Partials.Channel] });

		this.commands = new Collection();
		this.events = new Collection();
		this.modals = new Collection();
		this.contextMenus = new Collection();

		this.logger = logger;

		this.config = {
			embedcolor: '#FFFF00',
			errorembedcolor: '#FF0000',
			newticketcategory: '#FF0000',
		};

		this.inbox = null;
	}
}

export interface ChatInputCommand {
	enabled: boolean
	data: ChatInputApplicationCommandData
	execute: (client: Client<true>, interaction: ChatInputCommandInteraction) => unknown
	autocomplete?: (client: Client<true>, interaction: AutocompleteInteraction) => Promise<void>
}

export interface ContextMenuUserCommand {
	enabled: boolean
	data: UserApplicationCommandData
	execute: (client: Client<true>, interaction: UserContextMenuCommandInteraction) => Promise<void>
}

export interface ContextMenuMessageCommand {
	enabled: boolean
	data: MessageApplicationCommandData
	execute: (client: Client<true>, interaction: MessageContextMenuCommandInteraction) => Promise<void>
}

export interface Event<T> {
	name: keyof ClientEvents
	once: boolean
	execute: (client: Client<true>, interaction: T) => Promise<void>
}

export interface Modal {
	name: string
	execute: (client: Client<true>, interaction: ModalSubmitInteraction) => Promise<void>
}
