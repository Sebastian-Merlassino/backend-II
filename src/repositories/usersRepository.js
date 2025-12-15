import { UsersDAO } from "../dao/usersDao.js";

export class UsersRepository {
    constructor() { this.dao = new UsersDAO(); }
    create(user) { return this.dao.create(user); }
    findById(id) { return this.dao.findById(id); }
    findByEmail(email) { return this.dao.findByEmail(email); }
    updateById(id, data) { return this.dao.updateById(id, data); }
    deleteById(id) { return this.dao.deleteById(id); }
    findAll() { return this.dao.findAll(); }
}
export default UsersRepository;
