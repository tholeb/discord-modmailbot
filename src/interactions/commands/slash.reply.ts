import { ApplicationCommandOptionType } from 'discord.js';
import { ChatInputCommand } from '@/common/Client';
import Ticket, { MessageAttributes } from '@/database/models/Tickets';

export default {
	enabled: true,
	data: {
		name: 'reply',
		dmPermission: false,
		description: 'Envoie un message dans le ticket',
		options: [
			{
				name: 'message',
				description: 'Le message à envoyer',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'fichier',
				description: 'Une image/fichier à envoyer',
				type: ApplicationCommandOptionType.Attachment,
				required: false,
			},
		],
	},
	async execute(client, interaction) {
		if (!interaction.inGuild()) return;
		await interaction.deferReply({ ephemeral: true });

		const content = interaction.options.getString('message', true);
		const file = interaction.options.getAttachment('fichier', false);

		const channelId = interaction.channel?.id;

		const ticket = await Ticket.findOne({ where: { channelId: channelId } });

		if (!ticket) {
			interaction.editReply({ content: 'Ce salon n\'est pas un ticket' });
			return;
		}

		ticket.sendResponseToDM(content, message.author, file);
		await interaction.editReply({ content: 'Message envoyé' });

	},
} satisfies ChatInputCommand;