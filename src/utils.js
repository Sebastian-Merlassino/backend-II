import bcrypt from "bcrypt";

// Función para crear un hash de la contraseña
export const createHash = (password) => 
    bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Función para validar la contraseña
export const isValidPassword = (password, hash) => 
    bcrypt.compareSync(password, hash);