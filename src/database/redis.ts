// src/database/redis.ts
import Redis from 'ioredis';

/**
 * 创建 Redis 实例并导出，用于全局复用。
 * 环境变量可控制连接参数。
 */
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => {
  console.log('🔌 Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redisClient;
