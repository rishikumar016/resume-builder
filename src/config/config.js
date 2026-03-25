import dotenv from "dotenv";

dotenv.config();

if (!process.env.PORT) {
  console.error("Error: PORT environment variable is not set.");
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

const config = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
};

export default config;
