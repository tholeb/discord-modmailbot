import { Message, userMention } from 'discord.js';

export default async function(message: Message<false>) {
	let str = `${userMention(message.author.id)}
	- **ACCOUNT AGE :** ${message.author.createdAt} - **ACCOUNT ID :** ${message.author.id}`;

	const guild = await message.client.guilds.fetch(process.env.DISCORD_INBOX_SERVER);

	const userInGuild = await guild?.members.fetch(message.author.id);

	if (userInGuild) {
		str += `\n- **NICKNAME :** ${userInGuild.nickname}`;
		str += `\n- **JOINED AT :** ${userInGuild.joinedAt}`;

		const roles = userInGuild.roles.cache.map(role => role.name).filter(predicate => predicate !== '@everyone').join(', ');
		str += `\n- **ROLES :** ${roles}`;
	}

	return str;
}