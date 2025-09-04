import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  socketPort: process.env.PORT2 || 5000,
  environment: process.env.ENVIRONMENT || "dev",

  database: {
    uri: process.env.MONGODB_URI,
    name: "deMeet",
  },

  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "15d",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  session: {
    secret: process.env.SESSION_SECRET || "your-session-secret",
  },

  client: {
    url: process.env.CLIENT_URL || "http://localhost:5173",
  },

  cors: {
    origin:
      process.env.ENVIRONMENT === "dev"
        ? "http://localhost:5173"
        : "https://de-meet.vercel.app",
    credentials: true,
  },

  cookie: {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "dev" ? false : true,
    sameSite: process.env.ENVIRONMENT === "dev" ? "lax" : "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  },
};
