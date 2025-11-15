import passport from "passport";
import userModel from "../models/userModel.js";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const SECRET = process.env.JWT_SECRET || "secretJWT";

// Extractor de token desde cookies
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.token || null;
    }
    return token;
};

export default function configurePassport() {
    const opts = {
        jwtFromRequest: ExtractJwt.fromExtractors([
            cookieExtractor,
            ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: SECRET,
    };

    passport.use(
        "jwt",
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await userModel.findById(jwt_payload.id);
                if (user) return done(null, user);
                return done(null, false);
            } catch (error) {
                return done(error, false);
            }
        })
    );
}
