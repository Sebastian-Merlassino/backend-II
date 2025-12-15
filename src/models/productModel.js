import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: String,
    owner: { type: String, default: "admin" }
});

export default mongoose.model("products", productSchema);
