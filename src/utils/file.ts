import multer from "multer";
import path from "path";
import { Readable } from 'stream';
import { error } from "@/utils";

export const multerUploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10, // 文件大小限制为 10MB
    files: 5, // 最多上传 5 个文件
  },
}).array("files");

export const multerImagesUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      // 只允许上传图片类型文件
      cb(null, true);
    } else {
      cb(error.throwError("请确认文件格式为图片格式❌"), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 文件大小限制为 10MB
    files: 5, // 最多上传 5 个文件
  },
}).array("files");

export const multerSingleUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10, // 文件大小限制为 10MB
  },
}).single("file");

/**
 * 判断文件名称（文件名+后缀）合法性
 * @param param 参数：{filename - 文件名称（名称+后缀）,extensions - 可用后缀名数组eg：['.jpg',...]}
 * @returns 是否合法
 */
export const determineFileName = ({
  filename,
  extensions = [".jpg", ".jpeg", ".png", ".md", ".pdf", ".txt"],
}: {
  filename: string;
  extensions?: Array<string>;
}): boolean => {
  if (!filename || typeof filename !== "string") {
    error.throwError("缺少有效的文件名 ❌");
  }
  // 使用 path 解析文件名和扩展名
  const baseName = path.basename(filename); // 只保留文件名（不含路径）
  const extName = path.extname(baseName).toLowerCase(); // 获取扩展名
  if (!extensions.includes(extName)) {
    error.throwError(`不支持的文件类型：${extName} ❌`);
  }
  // 限制 baseName 中不能出现非法字符（防止注入）
  if (
    baseName.includes("..") ||
    baseName.includes("/") ||
    baseName.includes("\\")
  ) {
    error.throwError("文件名包含非法字符 ❌");
  }
  return true;
};

/**
 * 将buffer数据转化成Readable Stream
 * @param buffer buffer数据
 * @returns Readable Stream数据
 */
export const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // 标记流结束
  return stream;
}