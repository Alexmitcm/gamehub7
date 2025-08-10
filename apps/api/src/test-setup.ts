import { resolve } from "node:path";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: resolve(__dirname, "../.env") });
