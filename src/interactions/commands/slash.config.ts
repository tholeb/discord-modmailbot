import { ApplicationCommandOptionType, userMention } from 'discord.js';
import { ChatInputCommand } from '@/common/Client';
import { sequelize } from '@/common/database';
import Config from '@/database/models/Config';

export default {
	enabled: true,
	data: {
		name: 'config',
		dmPermission: false,
		description: 'Changer la configuration du bot',
		options: [
			{
				name: 'set',
				description: 'Changer la feuille de calcul',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'cle',
						description: 'Le nom de la clé dans le fichier de configuration (/config list)',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: 'valeur',
						description: 'La valeur de la clé',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
			{
				name: 'list',
				description: 'Lister les clés de la configuration du serveur',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'cle',
						description: 'Le nom de la clé dans le fichier de configuration (/config list)',
						type: ApplicationCommandOptionType.String,
					},
				],
			},
		],
	},
	async execute(client, interaction) {
		if (!interaction.inGuild()) {
			await interaction.reply('Cette commande ne peut être utilisée que sur un serveur.');
			return;
		}

		if (interaction.options.getSubcommand() === 'set') {
			const key = interaction.options.getString('cle', true);
			const value = interaction.options.getString('valeur', true);


			if (!(key.toLocaleLowerCase() in client.config)) {
				await interaction.reply(`Cette clé n'existe pas. Doit être être \`${Object.keys(client.config).join(', ')}\``);
				return;
			}

			try {
				await sequelize.models.Config.upsert({
					guildId: interaction.guildId,
					key: key,
					value: value,
					modifierId: interaction.user.id,
				});

				await interaction.reply(`La clé \`${key}\` a été changée en \`${value}\`.`);
			}
			catch (error) {
				await interaction.reply('Une erreur est survenue. ' + JSON.stringify(error));
				client.logger.error(error);
			}
		}

		if (interaction.options.getSubcommand() === 'list') {
			const key = interaction.options.getString('cle');

			if (key) {
				if (!(key.toLocaleLowerCase() in client.config)) {
					await interaction.reply('Cette clé n\'existe pas.');
					return;
				}

				const value = await sequelize.models.Config.findOne({
					where: {
						guildId: interaction.guildId,
						key,
					},
				});

				client.logger.trace({ value });

				await interaction.reply(`La clé \`${key}\` a pour valeur \`${value}\`.`);
			}
			else {
				const guildconfig = await sequelize.models.Config.findAll({
					where: {
						guildId: interaction.guildId,
					},
				});

				const str = guildconfig.map((value) => {
					const config: Config & { updatedAt: string, createdAt: string } = value.get();

					return `- \`${config.key} : ${config.value}\` - MàJ : <t:${(new Date(config.updatedAt).valueOf() / 1000).toFixed(0)}:f> par ${userMention(config.modifierId)}`;

				}).join('\n');

				const defaultConfig = Object.entries(client.config).map(([k, value]) => {
					return `- \`${k} : ${value}\` (défaut)`;
				}).join('\n');

				await interaction.reply({ content: `# Configuration du serveur \n${str} \n\n# Configuration par défaut \n${defaultConfig}`, ephemeral: true });
			}


		}


	},
} satisfies ChatInputCommand;