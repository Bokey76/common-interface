import OSS from "ali-oss";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import dayjs from "dayjs";
import crypto from "crypto";
import path from "path";
import { error } from "@/utils";

const OSS_CONFIG = {
  region: process.env.OSS_REGION!,
  endpoint: process.env.OSS_ENDPOINT!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET!,
  host: `https://${process.env.OSS_BUCKET!}.${process.env
    .OSS_REGION!}.aliyuncs.com`,
};
const client = new OSS(OSS_CONFIG);

/**
 * 普通文件上传，采用原文件后缀，可选oss路径和文件名，默认文件名uuid
 * @param paramObj 参数：{file - Multer解析过后的文件数据,filename - 文件名，不含后缀,path - oss路径}
 * @returns 文件的url
 */
export async function putUploadFiles({
  file,
  fileName = "",
  path = `temp`,
  originalNameOrNot = false,
}: {
  file: Express.Multer.File;
  fileName?: string;
  path?: string;
  originalNameOrNot?: boolean;
}): Promise<string> {
  try {
    const ext = mime.extension(file.mimetype) || "bin";
    const fullFilename = originalNameOrNot
      ? `${file.originalname}`
      : fileName
      ? `${fileName}.${ext}`
      : `${uuidv4()}.${ext}`;
    const objectKey = `${path.replace(/\/$/, "")}/${fullFilename}`;
    const result = await client.put(objectKey, file.buffer);
    return result.url;
  } catch (err) {
    error.throwError(`上传失败❗${err}`);
  }
}

/**
 * 生成oss文件直传签名，文件后缀使用源文件后缀；附：conditions已限定上传路径为objectKey的路径，上传成功返回200
 * @param param 参数：{objectKey - 上传文件的key（oss路径+文件名+后缀）,originalNameOrNot - 是否使用原文件名,expireTime - 签名过期时间，单位(s),conditions - 直传限制，数组类型，自行查阅}
 * @returns 签名对象
 */
export const generateUploadPolicy = ({
  objectKey = "temp/unknown.bin",
  originalNameOrNot = false,
  expireTime = 300,
  conditions = [
    ["content-length-range", 0, 10 * 1024 * 1024], // 最大支持10Mb文件
  ],
}: {
  objectKey?: string;
  originalNameOrNot?: boolean;
  expireTime?: number;
  conditions?: Array<Array<string | number>>;
}) => {
  const now = dayjs();
  const expiration = now.add(expireTime, "second").toISOString();
  const dir = path.dirname(objectKey);
  conditions.push(["starts-with", "$key", dir]); // 限制上传路径
  conditions.push(["eq", "$success_action_status", "200"]); // 指定oss上传成功返回200
  const policyText = {
    expiration,
    conditions,
  };
  const policyBase64 = Buffer.from(JSON.stringify(policyText)).toString(
    "base64"
  );
  const signature = crypto
    .createHmac("sha1", OSS_CONFIG.accessKeySecret)
    .update(policyBase64)
    .digest("base64");
  return {
    accessKeyId: OSS_CONFIG.accessKeyId,
    policy: policyBase64,
    signature,
    dir,
    host: OSS_CONFIG.host,
    expire: now.unix() + expireTime,
    key: originalNameOrNot
      ? objectKey
      : `${dir}/${uuidv4()}${path.extname(objectKey)}`,
  };
};

/**
 * 流式上传文件，采用原文件后缀，可选oss路径和文件名，默认文件名uuid
 * @param param 参数：{file - Multer解析过后的文件数据,filename - 文件名，不含后缀,path - oss路径}
 * @returns 返回{url - 上传文件url,name - 文件objectKey}
 */
export const streamUploadFile = async ({
  file,
  fileName = "",
  path = `temp`,
  originalNameOrNot = false,
}: {
  file: Express.Multer.File;
  fileName?: string;
  path?: string;
  originalNameOrNot?: boolean;
}) => {
  const ext = mime.extension(file.mimetype) || "bin";
  const fullFilename = originalNameOrNot
    ? `${file.originalname}`
    : fileName
    ? `${fileName}.${ext}`
    : `${uuidv4()}.${ext}`;
  const objectKey = `${path.replace(/\/$/, "")}/${fullFilename}`;
  const result = await client.putStream(objectKey, file.stream);
  return {
    url: result.url,
    name: result.name,
  };
};

/**
 * 初始化分片上传，获得oss分片的uploadId
 * @param objectKey 上传的文件路径（objectKey）
 * @returns 本次分片上传的uploadId
 */
export const initMultipartUpload = async (objectKey: string) => {
  const result = await client.initMultipartUpload(objectKey);
  return result.uploadId;
};

/**
 * 上传分片文件
 * @param objectKey 上传的文件路径（objectKey）
 * @param uploadId 分片的uploadId
 * @param partNumber 当前是第几片
 * @param buffer 当前分片的文件内容
 * @returns 返回对象：{ partNumber - 第几片 , ETag - 分片标记 }
 */
export const uploadMultipartPart = async (
  objectKey: string,
  uploadId: string,
  partNumber: number,
  buffer: Buffer
) => {
  const result = await client.uploadPart(
    objectKey,
    uploadId,
    partNumber,
    buffer
  );
  return result;
};

/**
 * 完成分片上传，通知oss合并分片文件
 * @param objectKey 上传的文件路径（objectKey）
 * @param uploadId 分片的uploadId
 * @param parts 分片数组（之前upload的所有返回值数组），通知oss合并哪些分片
 * @returns 返回对象：{ossStatus - 合并状态码,name - 文件oss路径,url - 文件的url}
 */
export const completeMultipartUpload = async (
  objectKey: string,
  uploadId: string,
  parts: Array<{ number: number; etag: string }>
) => {
  const result = await client.completeMultipartUpload(
    objectKey,
    uploadId,
    parts
  );
  return {
    ossStatus: result.res.status,
    name: result.name,
    url: `https://${OSS_CONFIG.bucket}.${OSS_CONFIG.region}.aliyuncs.com/${objectKey}`,
  };
};

/**
 * 获取未完成的 multipart 上传任务
 * @param prefix 可选，只列出指定前缀的对象上传任务
 * @returns 未完成上传列表
 */
export const listUnfinishedUploads = async (
  prefix?: string
): Promise<{ objectKey: string; uploadId: string; initiated: string }[]> => {
  let isTruncated = true;
  let keyMarker: string | undefined = undefined;
  let uploadIdMarker: string | undefined = undefined;
  const uploads: { objectKey: string; uploadId: string; initiated: string }[] =
    [];
  while (isTruncated) {
    const result: any = await client.listUploads({
      prefix,
      keyMarker,
      uploadIdMarker,
      "max-uploads": 1000,
    });
    for (const upload of result.uploads) {
      uploads.push({
        objectKey: upload.name,
        uploadId: upload.uploadId,
        initiated: upload.initiated,
      });
    }
    isTruncated = result.isTruncated;
    keyMarker = result.nextKeyMarker;
    uploadIdMarker = result.nextUploadIdMarker;
  }
  return uploads;
};

/**
 * 取消未合并的分片
 * @param objectKey 上传的文件路径（objectKey）
 * @param uploadId 分片的uploadId
 * @returns client.abortMultipartUpload的返回对象
 */
export const abortMultipartUpload = async (
  objectKey: string,
  uploadId: string
) => {
  return await client.abortMultipartUpload(objectKey, uploadId);
};

/**
 * 取消所有objectKey的未合并分片
 * @param objectKey 上传的文件路径（objectKey）
 * @returns [client.abortMultipartUpload的返回对象,...]
 */
export const abortAllMultipartUploads = async (objectKey: string) => {
  // 获取所有活跃上传任务
  const uploadsResult = await client.listUploads({ prefix: objectKey });
  // 筛选出匹配的 objectKey 的上传任务
  const uploadsToAbort = uploadsResult.uploads.filter(
    (upload: { name: string }) => upload.name === objectKey
  );
  // 并行取消所有找到的上传任务
  const abortPromises = uploadsToAbort.map((upload: { uploadId: any }) => {
    return client.abortMultipartUpload(objectKey, upload.uploadId);
  });
  return await Promise.all(abortPromises);
};

/**
 * 复制 OSS 文件
 * @param sourceObjKey 源文件路径，例如：'folder/source.jpg'
 * @param targetObjKey 目标文件路径，例如：'folder/target.jpg'
 */
export const copyFile = async (
  sourceObjKey: string,
  targetObjKey: string
): Promise<Record<string,any>> => {
  if (!sourceObjKey || !targetObjKey) {
    error.throwError(`参数不完整❌`, 400);
  }
  try {
    const result = await client.copy(targetObjKey, sourceObjKey);
    return {
      ossStatus: result.res.status,
      url: `https://${OSS_CONFIG.bucket}.${OSS_CONFIG.region}.aliyuncs.com/${targetObjKey}`,
    }
  } catch (err) {
    error.throwError(`OSS 文件复制失败❌ ${err}`);
  }
};

/**
 * 获取指定目录下的所有文件
 * @param dir 目录路径
 * @returns 目录下所有文件的基本信息
 */
export const listFilesInDir = async (dir: string): Promise<string[]> => {
  try {
    const result = await client.list({
      prefix: dir.endsWith("/") ? dir : dir + "/",
      delimiter: "/",
    });
    return (
      result.objects?.map(
        (item: {
          name: string;
          size: number;
          lastModified: string;
          url: string;
        }) => ({
          name: item.name,
          size: item.size,
          lastModified: item.lastModified,
          url: client.signatureUrl(item.name),
        })
      ) || []
    );
  } catch (err) {
    error.throwError(`获取目录文件失败❌ ${err}`);
  }
};

/**
 * 获取文件内容
 * @param objectKey oss的objectKey（文件路径，包含文件名和后缀）
 * @returns 文件内容的utf-8解析字符串
 */
export const getFileContent = async (objectKey: string): Promise<string> => {
  try {
    const result = await client.get(objectKey);
    const contentBuffer = result.content;
    if (!contentBuffer) {
      error.throwError(`没有找到该文件的内容❌`);
    }
    return contentBuffer.toString("utf-8");
  } catch (err) {
    throw new error.CustomError(`获取文件内容失败❌ ${err}`);
  }
};

/**
 * 修改文件内容
 * @param objectKey oss的objectKey（文件路径，包含文件名和后缀）
 * @param content 更新的内容
 * @returns oss修改返回
 */
export const updateFileContent = async (
  objectKey: string,
  content: string
): Promise<{ url: string; name: string }> => {
  try {
    const result = await client.put(objectKey, Buffer.from(content, "utf-8"));
    return result;
  } catch (err) {
    error.throwError(`更新文件失败❌ ${err}`);
  }
};

/**
 * 批量删除路径或文件
 * @param paths 路径或文件的array，以/结尾是路径，会删除路径下所有的文件和路径
 * @returns 返回{ deleted - 删除的数据,deletedCount - 删除的数量 }
 */
export const deleteFiles = async (paths: string[]) => {
  try {
    const allFileKeys: string[] = [];
    for (const path of paths) {
      if (path.endsWith("/")) {
        // 是目录，列出所有文件
        let continuationToken: string | undefined = undefined;
        do {
          const result: Awaited<ReturnType<typeof client.list>> =
            await client.list({
              prefix: path,
              continuationToken,
              "max-keys": 1000,
            });
          const keys =
            result.objects?.map((obj: { name: string }) => obj.name) || [];
          allFileKeys.push(...keys);
          continuationToken = result.nextContinuationToken;
        } while (continuationToken);
      } else {
        allFileKeys.push(path); // 是单个文件
      }
    }
    const uniqueKeys = Array.from(new Set(allFileKeys)); // 去重防止重复删除
    if (uniqueKeys.length === 0) {
      error.throwError("没有要删除的文件❌");
    }
    const result = await client.deleteMulti(uniqueKeys, {
      quiet: false,
    });
    return {
      deleted: result.deleted.map((item: Record<string, string>) => item?.Key),
      deletedCount: result.deleted.length,
    };
  } catch (err) {
    error.throwError(`删除目录或文件失败❌ ${err}`);
  }
};
