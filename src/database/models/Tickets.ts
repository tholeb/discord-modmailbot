import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '@/common/database';
import Messages from './Messages';
import { Attachment, Message, TextChannel, User, userMention } from 'discord.js';
import Client from '@/common/Client';
import bot from '@/main';

type MessageAttributes = {
	idInDM: string;
	idInTicket: string;
	content: string;
	author: User;
}

class Ticket extends Model<InferAttributes<Ticket>, InferCreationAttributes<Ticket>> {
	declare id: CreationOptional<string>;
	declare userId: string;
	declare channelId: CreationOptional<string>;

	async sendMessageFromDM(message: Message, attachement?: Attachment | null) {
		const channel = await this.getChannel(bot);

		if (!channel) {
			bot.logger.error('Channel not found');
			message.author.send('Une erreur est survenue lors de l\'envoi de votre message, veuillez réessayer plus tard (channel not found)');
			return;
		}

		const count = (await this.getMessages()).length + 1;

		const response = await channel?.send({ content: `**\`${count}\`** - ${userMention(message.author.id)}\n${message.content}`, files: attachement ? [attachement] : [] });

		await this.registerMessage({ idInDM: message.id, idInTicket: response!.id, content: message.content, author: message.author });
	}

	async sendResponseToDM(content: string, author: User, attachement?: Attachment | null) {
		const user = await bot.users.fetch(this.userId);
		const count = (await this.getMessages()).length + 1;

		const dm = await user.send(content);

		const channel = await this.getChannel(bot);

		const response = await channel?.send({ content: `**\`${count}\`** - ${userMention(author.id)}\n${content}`, files: attachement ? [attachement] : [] });

		await this.registerMessage({ idInDM: dm.id, idInTicket: response!.id, content: content, author });
	}

	private async registerMessage(message: MessageAttributes) {
		return await Messages.create({
			idInDM: message.idInDM,
			idInTicket: message.idInTicket,
			authorId: message.author.id,
			ticket: this.id,
			content: message.content,
		});
	}

	public getMessages() {
		return Messages.findAll({ where: { ticket: this.id } });
	}

	public async getChannel(client: Client) {
		const guild = await client.guilds.fetch(process.env.DISCORD_INBOX_SERVER);
		const channel = await guild.channels.fetch(this.channelId) as TextChannel | undefined;

		return channel;
	}

	declare closedAt: CreationOptional<Date | null>;
}

Ticket.init({
	id: {
		type: DataTypes.UUIDV4,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
		primaryKey: true,
	},
	userId: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	channelId: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	closedAt: {
		type: DataTypes.DATE,
		allowNull: true,
	},
}, {
	sequelize,
	hooks: {
		async beforeCreate(attributes) {
			const guild = await bot.guilds.fetch(process.env.DISCORD_INBOX_SERVER);

			const user = await bot.users.fetch(attributes.userId);

			const channel = await guild.channels.create({
				name: user.username,
				parent: '1159041421014204478',
			});

			attributes.setDataValue('channelId', channel.id);
			attributes.reload();
		},
		async afterCreate(attributes) {
			const user = await bot.users.fetch(attributes.userId);

			let str = `Nouveau ticket par ${userMention(attributes.userId)}(${user.username})\n- **ACCOUNT AGE :** ${user.createdAt}\n- **ACCOUNT ID :** ${attributes.userId}`;

			const guild = await bot.guilds.fetch(process.env.DISCORD_INBOX_SERVER);

			const guildUser = await guild?.members.fetch(attributes.userId);

			if (guildUser) {
				str += '\n---';
				str += `\n- **NICKNAME :** ${guildUser.nickname}`;
				str += `\n- **JOINED AT :** ${guildUser.joinedAt}`;

				const roles = guildUser.roles.cache.map(role => role.name).filter(predicate => predicate !== '@everyone').join(', ');
				str += `\n- **ROLES :** ${roles}`;
			}

			const channel = await attributes.getChannel(bot);

			(await channel!.send(str)).pin('Premier message du ticket');
		},
	},
	deletedAt: 'closedAt',
	paranoid: true,
	tableName: 'tickets',
});

export default Ticket;
export { MessageAttributes };