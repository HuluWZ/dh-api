export default () => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
});
export type redisConfigType = {
  host: string;
  port: number;
};
