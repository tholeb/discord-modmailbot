import { ChannelType, Events, Message } from 'discord.js';
import { Event } from '@/common/Client';
import { getOpenTicket } from '@/utils/tickets';
import Ticket from '@/database/models/Tickets';

export default {
	name: Events.MessageCreate,
	once: false,
	async execute(client, message) {
		if (message.author.bot) return;

		if (message.channel.type !== ChannelType.DM) return;

		const childLogger = client.logger.child({ name: `DM received from ${message.author.username}`, author: { id: message.author.id, username: message.author.username } });
		childLogger.info({ content: message.content });

		let ticket = await getOpenTicket(message.author.id);

		if (!ticket) {
			try {
				childLogger.info('No open ticket found, creating new ticket');
				ticket = await Ticket.create({
					userId: message.author.id,
				});
				ticket.sendMessageFromDM(message);
			}
			catch (error) {
				message.author.send('An error occured while creating your ticket, please try again later');
				client.logger.error(error);
				return;
			}

			return;
		}

		ticket.sendMessageFromDM(message);

	},
} satisfies Event<Message<false>>;