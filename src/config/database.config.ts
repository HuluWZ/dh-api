export default () => ({
  database: {
    HOST: process.env.POSTGRES_HOST,
    PORT: parseInt(process.env.POSTGRES_PORT, 10),
    USERNAME: process.env.POSTGRES_USER,
    PASSWORD: process.env.POSTGRES_PASSWORD,
    DATABASE: process.env.POSTGRES_DB,
    URL: process.env.DATABASE_URL,
  },
});
export type databaseConfigType = {
  HOST: string;
  PORT: number;
  USERNAME: string;
  PASSWORD: string;
  DATABASE: string;
  URL: string;
};
