import ticketModel from "../models/ticketModel.js";

export class TicketsDAO {
    create(ticket) { return ticketModel.create(ticket); }
    findById(id) { return ticketModel.findById(id); }
}
export default TicketsDAO;
