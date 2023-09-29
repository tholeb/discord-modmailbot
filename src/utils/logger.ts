import pino from 'pino';


const transports = pino.transport({
	targets: [
		{
			level: 'info',
			target: 'pino/file',
			options: {
				destination: './logs/combined.log',
			},
		},
		{
			level: 'trace',
			target: 'pino-pretty',
			options: {},
		},
	],
});

const logger = pino({
	customLevels: {
		database: 35,
	},
	useLevelLabels: true,
	level: 'trace',
}, transports);

export default logger;