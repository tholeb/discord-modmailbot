import getGitCommit from '@/utils/GitCommit';
import { APIEmbed } from 'discord.js';

export enum COLORS {
	DEFAULT = 0xD2B48C,
	ERROR = 0xff0000,
}

const basicEmbed = {
	author: {
		name: 'Los Santos Sheriff Department',
		icon_url: 'https://static.wikia.nocookie.net/gtawiki/images/3/32/LSSD.png',
	},
	timestamp: new Date().toISOString(),
	footer: {
		text: getGitCommit(),
	},
	thumbnail: {
		url: 'https://cdn-icons-png.flaticon.com/512/3003/3003126.png',
	},
};

export function createEmbed(title: string, description: string, options?: APIEmbed): APIEmbed {
	return {
		color: COLORS.DEFAULT,
		...basicEmbed,
		title,
		description,
		...options,
	};
}

export function createErrorEmbed(title: string, description: string, options?: APIEmbed): APIEmbed {
	return {
		color: COLORS.ERROR,
		...basicEmbed,
		title,
		description,
		...options,
	};
}