import redisClient from "@/database/redis";

/**
 * 设置一个键值对，支持设置过期时间
 * @param key 键名
 * @param value 值（会被序列化为 JSON）
 * @param ttl 可选的过期时间（单位：秒）
 */
export const set = async <T>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> => {
  const data = JSON.stringify(value);
  if (ttl) {
    await redisClient.set(key, data, "EX", ttl);
  } else {
    await redisClient.set(key, data);
  }
};

/**
 * 获取一个键的值，返回泛型对象
 * @param key 键名
 */
export const get = async <T>(key: string): Promise<T | null> => {
  const data = await redisClient.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`❗ Redis parse error for key "${key}":`, err);
    return null;
  }
};

/**
 * 删除一个键
 * @param key 键名
 */
export const del = async (key: string): Promise<number> => {
  return redisClient.del(key);
};

/**
 * 检查一个 key 是否存在
 * @param key 键名
 */
export const exists = async (key: string): Promise<boolean> => {
  const result = await redisClient.exists(key);
  return result === 1;
};

/**
 * 批量设置哈希字段并可选设置整个 key 的过期时间
 * @param key 哈希键名
 * @param data 哈希字段的键值对对象（值会自动 JSON 序列化）
 * @param ttlSeconds 可选：过期时间（秒），为整个 key 设置 TTL
 */
export const hset = async <T extends Record<string, any>>(
  key: string,
  data: T,
  ttlSeconds?: number
): Promise<void> => {
  const pipeline = redisClient.multi();
  for (const [field, value] of Object.entries(data)) {
    const jsonValue = JSON.stringify(value);
    pipeline.hset(key, field, jsonValue);
  }
  if (ttlSeconds !== undefined) {
    pipeline.expire(key, ttlSeconds);
  }
  await pipeline.exec();
};


/**
 * 获取哈希字段的值
 * @param key 哈希键名
 * @param field 字段名
 */
export const hget = async <T>(key: string, field: string): Promise<T | null> => {
  const data = await redisClient.hget(key, field);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`❗ Redis HGET parse error for key "${key}" field "${field}":`, err);
    return null;
  }
};

/**
 * 删除哈希字段
 * @param key 哈希键名
 * @param field 字段名
 */
export const hdel = async (key: string, field: string): Promise<number> => {
  return redisClient.hdel(key, field);
};

/**
 * 获取哈希所有字段和值
 * @param key 哈希键名
 */
export const hgetall = async <T = any>(key: string): Promise<Record<string, T> | null> => {
  const result = await redisClient.hgetall(key);
  if (!result || Object.keys(result).length === 0) return null;
  const parsed: Record<string, T> = {};
  for (const [field, value] of Object.entries(result)) {
    try {
      parsed[field] = JSON.parse(value);
    } catch (err) {
      console.error(`❗ Redis HGETALL parse error for field "${field}":`, err);
    }
  }
  return parsed;
};
