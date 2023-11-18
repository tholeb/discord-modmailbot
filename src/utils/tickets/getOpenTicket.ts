import Ticket from '@/database/models/Tickets';

export default async function getOpenTicket(userId: string) {
	const ticket = await Ticket.findOne({ where: { userId, closedAt: null } });

	return ticket;
}