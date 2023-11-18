import { APIEmbed, APIEmbedAuthor, APIEmbedImage, APIEmbedThumbnail, ApplicationCommandOptionType, Attachment, Channel } from 'discord.js';
import { ChatInputCommand } from '@/common/Client';
import { COLORS, createEmbed } from '@/common/EmbedCreator';

export default {
	enabled: true,
	data: {
		name: 'send',
		dmPermission: false,
		description: 'Envoi un message avec une réaction',
		options: [
			{
				name: 'message',
				description: 'Envoie un message simple',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'message',
						description: 'Le message à envoyer',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: 'image',
						description: 'Image à envoyer',
						type: ApplicationCommandOptionType.Attachment,
						required: false,
					},
					{
						name: 'channel',
						description: 'Channel où envoyer le message',
						type: ApplicationCommandOptionType.Channel,
						required: false,
					},
				],
			},
			{
				name: 'embed',
				description: 'Envoie un embed',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'titre',
						description: 'Titre de l\'embed',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: 'description',
						description: 'Description de l\'embed',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: 'couleur',
						description: 'Couleur de l\'embed (hex)',
						type: ApplicationCommandOptionType.String,
						required: false,
						max_length: 7,
					},
					{
						name: 'thumbnail',
						description: 'Miniature de l\'embed',
						type: ApplicationCommandOptionType.Attachment,
						required: false,
					},
					{
						name: 'image',
						description: 'Image de l\'embed',
						type: ApplicationCommandOptionType.Attachment,
						required: false,
					},
					{
						name: 'attachement',
						description: 'Image à envoyer en plus de l\'embed',
						type: ApplicationCommandOptionType.Attachment,
						required: false,
					},
					{
						name: 'channel',
						description: 'Channel où envoyer le message',
						type: ApplicationCommandOptionType.Channel,
						required: false,
					},
					{
						name: 'autheur',
						description: 'Affiche ou pas l\'auteur de la commande sur l\'embed',
						type: ApplicationCommandOptionType.Boolean,
						required: false,
					},
					{
						name: 'url',
						description: 'Url de l\'embed',
						type: ApplicationCommandOptionType.String,
						required: false,
					},
				],
			},
		],
	},
	async execute(client, interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'message') {
			const message = interaction.options.getString('message', true);
			const image = interaction.options.getAttachment('image');
			const channel = interaction.options.getChannel('channel') as Channel;

			if (channel) {
				if (!channel.isTextBased()) return interaction.reply({ content: 'Vous ne pouvez pas envoyer de message dans ce channel', ephemeral: true });

				await channel.send({
					content: message,
					files: image ? [image] : [],
				});

				await interaction.reply({ content: `Message \`${message}\` envoyé dans ${channel}`, ephemeral: true });
			}
			else {
				if (!interaction.channel?.isTextBased()) return interaction.reply({ content: 'Vous ne pouvez pas envoyer de message dans ce channel', ephemeral: true });

				await interaction.channel.send({
					content: message,
					files: image ? [image] : [],
				});

				await interaction.reply({ content: `Message \`${message}\` envoyé`, ephemeral: true });
			}
		}
		else if (subcommand === 'embed') {
			const titre = interaction.options.getString('titre', true);
			const description = interaction.options.getString('description', true);
			const couleur = interaction.options.getString('couleur') as string;
			const thumbnail = interaction.options.getAttachment('thumbnail') as APIEmbedThumbnail;
			const image = interaction.options.getAttachment('image') as APIEmbedImage;
			const attachement = interaction.options.getAttachment('attachement') as Attachment;
			const channel = interaction.options.getChannel('channel') as Channel;
			const autheur = interaction.options.getBoolean('autheur') as boolean;
			const url = interaction.options.getString('url') as string;

			const hexToInt = (hex: string) => parseInt(hex.replace(/^#/, '0x'), 16);
			console.log(hexToInt(couleur));

			const embed = createEmbed(
				titre,
				description,
				{
					thumbnail: thumbnail ? { url: thumbnail.url } : undefined,
					image: image ? { url: image.url } : undefined,
					attachements: attachement ? [attachement] : undefined,
					color: hexToInt(couleur) || COLORS.DEFAULT,
					url: url,
					author: autheur ? {
						name: interaction.user.username,
						iconURL: interaction.user.avatarURL(),
					} as APIEmbedAuthor : undefined,
				} as APIEmbed,
			);

			if (channel) {
				if (!channel.isTextBased()) return interaction.reply({ content: 'Vous ne pouvez pas envoyer de message dans ce channel', ephemeral: true });

				await channel.send({ embeds: [embed], files: attachement ? [attachement] : [] });

				await interaction.reply({ content: `Embed \`${titre}\` envoyé dans ${channel}.`, ephemeral: true });
			}
			else {
				if (!interaction.channel?.isTextBased()) return interaction.reply({ content: 'Vous ne pouvez pas envoyer d\'embed dans ce channel', ephemeral: true });

				await interaction.channel.send({ embeds: [embed], files: attachement ? [attachement] : [] });

				await interaction.reply({ content: `Embed \`${titre}\` envoyé.`, ephemeral: true });
			}
		}
	},
} satisfies ChatInputCommand;