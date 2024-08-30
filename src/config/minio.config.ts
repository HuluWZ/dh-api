export default () => ({
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minio',
    secretKey: process.env.MINIO_SECRET_KEY || 'minio123',
    publicBucket: process.env.MINIO_PUBLIC_BUCKET || 'public',
    privateBucket: process.env.MINIO_PRIVATE_BUCKET || 'private',
  },
});
