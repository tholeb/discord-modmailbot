import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '@/common/database';
import Ticket from './Tickets';
import { gunzipSync, gzipSync } from 'node:zlib';

class Messages extends Model<InferAttributes<Messages>, InferCreationAttributes<Messages>> {
	declare idInDM: string;
	declare idInTicket: string;
	declare authorId: string;
	declare authorType: CreationOptional<string>;
	declare ticket: ForeignKey<string>;
	declare content: string;

	getTicket() {
		return Ticket.findOne({ where: { id: this.ticket } });
	}
}


Messages.init({
	idInTicket: {
		type: DataTypes.INTEGER,
		primaryKey: true,
	},
	idInDM: {
		type: DataTypes.INTEGER,
		primaryKey: true,
	},
	authorId: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	authorType: {
		type: DataTypes.ENUM('user', 'staff'),
		defaultValue: 'user',
		allowNull: false,
	},
	content: {
		allowNull: false,
		type: DataTypes.TEXT,
		get() {
			const storedValue = this.getDataValue('content');
			const gzippedBuffer = Buffer.from(storedValue, 'base64');
			const unzippedBuffer = gunzipSync(gzippedBuffer);
			return unzippedBuffer.toString();
		},
		set(value: string) {
			const gzippedBuffer = gzipSync(value);
			this.setDataValue('content', gzippedBuffer.toString('base64'));
		},
	},
}, {
	sequelize,
	tableName: 'messages',
});

Messages.belongsTo(Ticket, { foreignKey: 'ticket' });
export default Messages;