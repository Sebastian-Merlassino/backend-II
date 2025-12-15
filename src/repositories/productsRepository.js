import { ProductsDAO } from "../dao/productsDao.js";

export class ProductsRepository {
    constructor() { this.dao = new ProductsDAO(); }
    create(product) { return this.dao.create(product); }
    findById(id) { return this.dao.findById(id); }
    findAll() { return this.dao.findAll(); }
    updateById(id, data) { return this.dao.updateById(id, data); }
    deleteById(id) { return this.dao.deleteById(id); }
}
export default ProductsRepository;
