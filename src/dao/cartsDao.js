import cartModel from "../models/cartModel.js";

export class CartsDAO {
    create(cart) { return cartModel.create(cart); }
    findById(id) { return cartModel.findById(id).populate("products.product"); }
    updateById(id, data) { return cartModel.findByIdAndUpdate(id, data, { new: true }); }
}
export default CartsDAO;
