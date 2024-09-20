export default () => ({
  auth: {
    ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET,
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
    AUTH_JWT_EXPIRATION: process.env.AUTH_JWT_EXPIRATION,
    REFRESH_JWT_EXPIRATION: process.env.REFRESH_JWT_EXPIRATION,
  },
});

export type authConfigType = {
  ACCESS_JWT_SECRET: string;
  AUTH_JWT_SECRET: string;
  REFRESH_JWT_SECRET: string;
  AUTH_JWT_EXPIRATION: string;
  REFRESH_JWT_EXPIRATION: string;
};
