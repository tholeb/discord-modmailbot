import logger from '@/utils/logger';

import { Sequelize, DataTypes } from 'sequelize';

import fs from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const models: Record<string, any> = {};

const modelsDir = path.join(__dirname, '../', 'database', 'models');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './db.sqlite3',
	logging: msg => logger.database(msg),
});

fs.readdirSync(modelsDir)
	.filter(file => file.endsWith('.ts'))
	.forEach(async file => {
		const modelPath = path.join(modelsDir, file);
		const { default: model } = await import(modelPath);
		models[model.name] = new model(sequelize, DataTypes);
	});

Object.keys(models).forEach(modelName => {
	if (models[modelName].associate) {
		models[modelName].associate(models);
	}
});

export { sequelize, models };
