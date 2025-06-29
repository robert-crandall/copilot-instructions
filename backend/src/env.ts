export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  ALLOW_REGISTRATION: process.env.ALLOW_REGISTRATION === "true",
  PORT: process.env.PORT || "3000",
};
