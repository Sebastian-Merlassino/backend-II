import mongoose from "mongoose";

const userCollection = "users";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const UserModel = mongoose.model(userCollection, userSchema);

export default UserModel;
