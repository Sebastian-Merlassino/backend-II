import { TicketsDAO } from "../dao/ticketsDao.js";

export class TicketsRepository {
    constructor() { this.dao = new TicketsDAO(); }
    create(ticket) { return this.dao.create(ticket); }
    findById(id) { return this.dao.findById(id); }
}
export default TicketsRepository;
