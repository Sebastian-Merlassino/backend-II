import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import dotenv from 'dotenv';
import sessionRouter from './routes/sessionRouter.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import handlebars from 'express-handlebars';
import path from 'path';

// dotenv.config();

const app = express();

// const PORT = process.env.PORT || 8080;

// // Middleware
// app.use(express.json());

// // Ruta simple para probar
// app.get("/", (req, res) => {
//   res.send("Servidor funcionando correctamente 🚀");
// });

// // Conexión a Mongo
// mongoose.connect(process.env.MONGO_URI, {
//   dbName: process.env.MONGO_DB
// })
// .then(() => {
//   console.log("✅ Conectado a MongoDB");
//   app.listen(PORT, () => {
//     console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
//   });
// })
// .catch((err) => {
//   console.error("❌ Error al conectar con MongoDB:", err);
// });


// Iniciamos la conexión con MongoDB
const uri = 'mongodb+srv://sebastianmerlassino_db_user:RLBqUDZqq4vqShU6@clusterbackendii.nhf1ecl.mongodb.net/?appName=ClusterBackendII';
mongoose.connect(uri)
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar con MongoDB:', err));

// Middlewares incorporados de Express
app.use(express.json()); // Formatea los cuerpos json de peticiones entrantes.
app.use(express.urlencoded({extended: true})); // Formatea query params de URLs para peticiones entrantes.

app.use(cookieParser());

// // Configuración de la sesión
// app.use(session({
//     store: MongoStore.create({
//         mongoUrl: uri,
//         ttl: 14 * 24 * 60 * 60 // 14 días
//     }),
//     secret: 'secretoDeSesion',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 14 * 24 * 60 * 60 * 1000 // 14 días
//     }
// }));

// app.get('/setCookie', (req, res) => {
//     res.cookie('miCookie', 'valorDeMiCookie', {maxAge: 900000, httpOnly: true});
//     res.send('Cookie seteada');
// });


app.use('/api/users', userRouter);
app.use('/api/sessions', sessionRouter);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Start Server in Port ${PORT}`);
});
