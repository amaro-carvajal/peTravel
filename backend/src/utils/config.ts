import dotenv from "dotenv";
if (process.env.NODE_ENV !== "test") dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;
const JWT_SECRET = process.env.JWT_SECRET || "my_secret"; 
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

if (process.env.NODE_ENV === "test") {
  const baseDePruebas = MONGODB_URI?.match(
    /^mongodb:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}\/(petravel_e2e_[a-f0-9-]+)$/,
  )?.[1];
  if (!baseDePruebas || MONGODB_DBNAME !== baseDePruebas || !process.env.JWT_SECRET) {
    throw new Error("El backend de pruebas requiere MongoDB local, una base petravel_e2e_ y JWT_SECRET explícito.");
  }
}

export default { PORT, HOST, MONGODB_URI, MONGODB_DBNAME, JWT_SECRET, CLIENT_URL };