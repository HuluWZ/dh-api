export default () => ({
  minio: {
    ENDPOINT: process.env.MINIO_ENDPOINT,
    PORT: parseInt(process.env.MINIO_PORT, 10),
    USE_SSL: process.env.MINIO_USE_SSL === 'true',
    ACCESS_KEY: process.env.MINIO_ROOT_USER,
    SECRET_KEY: process.env.MINIO_ROOT_PASSWORD,
    PUBLIC_BUCKET: process.env.MINIO_PUBLIC_BUCKET,
    PRIVATE_BUCKET: process.env.MINIO_PRIVATE_BUCKET,
  },
});

export type minioConfigType = {
  ENDPOINT: string;
  PORT: number;
  USE_SSL: boolean;
  ACCESS_KEY: string;
  SECRET_KEY: string;
  PUBLIC_BUCKET: string;
  PRIVATE_BUCKET: string;
};
