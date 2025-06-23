import { NextFunction, Request, Response } from "express";
import * as ossService from "@/services/oss.service";
import { error, format, file } from "@/utils";

// 普通多文件上传，读取req.files中的文件
export const putUploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    error.throwError(`没有上传文件❗`, 400);
  }
  const uploadPromises = files.map((file) => {
    return ossService.putUploadFiles({
      file: file,
      path: req.body.path,
      originalNameOrNot: req.body.originalNameOrNot,
      fileName: req.body.fileName,
    });
  });
  const results = await Promise.all(uploadPromises); // 并发执行
  res.data = {
    files: results.length === 1 ? results[0] : results,
  };
  next();
};

// oss流式上传
export const streamUploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file || !req.file.buffer) {
    error.throwError(`没有上传文件❗`, 400);
  }
  req.file.stream = file.bufferToStream(req.file.buffer);
  const result = await ossService.streamUploadFile({
    file: req.file,
    path: req.body.path,
    originalNameOrNot: req.body.originalNameOrNot,
    fileName: req.body.fileName,
  });
  res.data = result;
  next();
};

// 获取oss直传签名
export const getOssSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = await ossService.generateUploadPolicy(format.getJSONQuery(req));
  res.data = data;
  next();
};

// 初始化分片
export const initMultipartUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploadId = await ossService.initMultipartUpload(req.body.objectKey);
  res.data = {
    uploadId,
  };
  next();
};

// 上传分片数据
export const uploadMultipartPart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { objectKey, uploadId, partNumber } = req.body;
  const buffer = req.file?.buffer;
  if (!buffer) error.throwError(`上传文件内容丢失❗`, 400);
  const result = await ossService.uploadMultipartPart(
    objectKey,
    uploadId,
    partNumber,
    buffer
  );
  res.data = {
    etag: result.etag,
    partNumber,
  };
  next();
};

// 完成oss分片，合并分片成文件
export const completeMultipartUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { objectKey, uploadId, parts } = req.body;
  const result = await ossService.completeMultipartUpload(
    objectKey,
    uploadId,
    parts
  );
  res.data = result;
  next();
};

// 获取未合并分片
export const getUnfinishedUploads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prefix } = format.getJSONQuery(req);
    const uploads = await ossService.listUnfinishedUploads(
      prefix as string | undefined
    );
    res.data = {
      count: uploads.length,
      uploads,
    };
    next();
  } catch (error) {
    next(error);
  }
};

// 取消未合并的分片
export const abortMultipartUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { objectKey, uploadId } = req.body;
  if (uploadId) {
    // 取消指定 uploadId
    await ossService.abortMultipartUpload(objectKey, uploadId);
  } else if (objectKey) {
    // 取消该 objectKey 的所有上传任务
    await ossService.abortAllMultipartUploads(objectKey);
  } else {
    error.throwError(`请提供 uploadId 或 objectKey❌`);
  }
  res.data = {
    message: "上传已终止✅",
  };
  next();
};

// 复制文件
export const copyFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sourceObjKey, targetObjKey } = req.body;
  res.data = await ossService.copyFile(sourceObjKey, targetObjKey);
  next()
};

// 获取路径下所有的文件
export const getFilesByDir = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { dir } = format.getJSONQuery(req);
  if (!dir || typeof dir !== "string") {
    error.throwError(`请指定读取目录❌`, 400);
  }
  const files = await ossService.listFilesInDir(dir);
  res.data = files;
  next();
};

// 获取文件内容
export const getFileContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { objectKey } = format.getJSONQuery(req);
  if (!objectKey) {
    error.throwError(`请提供文件信息❌`, 400);
  }
  const content = await ossService.getFileContent(objectKey);
  res.data = {
    objectKey,
    content,
  };
  next();
};

// 修改文件内容
export const updateFileContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const objectKey = req.body.objectKey;
  const content: string = req.body.content;
  if (!content) {
    error.throwError(`文件内容缺失❌`, 400);
  }
  const result = await ossService.updateFileContent(objectKey, content);
  res.data = {
    url: result.url,
    name: result.name,
  };
  next();
};

// 批量删除路径或文件
export const deleteOssFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { files } = format.getJSONQuery(req);
  if (!Array.isArray(files) || files.some((f) => typeof f !== "string")) {
    error.throwError(`files字段格式无效，必须为字符串数组❌`, 400);
  }
  const result = await ossService.deleteFiles(files);
  res.data = result;
  next();
};
