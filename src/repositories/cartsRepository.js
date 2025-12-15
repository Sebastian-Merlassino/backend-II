import { CartsDAO } from "../dao/cartsDao.js";

export class CartsRepository {
    constructor() { this.dao = new CartsDAO(); }
    create(cart) { return this.dao.create(cart); }
    findById(id) { return this.dao.findById(id); }
    updateById(id, data) { return this.dao.updateById(id, data); }
}
export default CartsRepository;
