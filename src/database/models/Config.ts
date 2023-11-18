import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '@/common/database';

class Config extends Model<InferAttributes<Config>, InferCreationAttributes<Config>> {
	declare guildId: string;
	declare key: string;
	declare value: string;
	declare modifierId: string;
}

Config.init({
	guildId: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
	},
	key: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
	},
	value: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
	modifierId: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
	},
}, {
	sequelize,
	tableName: 'config',
});

export default Config;