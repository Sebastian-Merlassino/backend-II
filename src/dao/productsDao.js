import productModel from "../models/productModel.js";

export class ProductsDAO {
    create(product) { return productModel.create(product); }
    findById(id) { return productModel.findById(id); }
    findAll() { return productModel.find(); }
    updateById(id, data) { return productModel.findByIdAndUpdate(id, data, { new: true }); }
    deleteById(id) { return productModel.findByIdAndDelete(id); }
}
export default ProductsDAO;
