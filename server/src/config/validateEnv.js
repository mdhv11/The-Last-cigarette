/**
 * Environment configuration validation
 */

const validateEnv = () => {
  const requiredEnvVars = ["JWT_SECRET"];
  const optionalEnvVars = ["MONGODB_URI", "PORT", "NODE_ENV", "FRONTEND_URL"];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.join(", ")
    );
    console.error("Please check your .env file");
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn(
      "Warning: JWT_SECRET should be at least 32 characters long for security"
    );
  }

  // Set defaults for optional variables
  process.env.PORT = process.env.PORT || "3000";
  process.env.NODE_ENV = process.env.NODE_ENV || "development";

  console.log("Environment configuration validated successfully");
};

module.exports = validateEnv;
