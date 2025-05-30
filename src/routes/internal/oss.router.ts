import { Router } from "express";
import { network } from "@/middlewares";
import { file } from "@/utils";
import * as oss from "@/controllers/oss.controller";

const router = Router();

// --普通oss操作--
router.get("/getFilesByDir", oss.getFilesByDir, network.response);
router.get("/getFileContent", oss.getFileContent, network.response);
router.get("/getOssSignature", oss.getOssSignature, network.response);
router.post(
  "/uploadFiles",
  file.multerUploadFiles,
  oss.putUploadFiles,
  network.response
);
router.post(
  "/streamUploadFiles",
  file.multerSingleUpload,
  oss.streamUploadFile,
  network.response
);
router.put("/updateFileContent", oss.updateFileContent, network.response);
router.delete("/deleteOssFiles", oss.deleteOssFiles, network.response);

// --分片oss操作--
router.get(
  "/get-pending-multipart",
  oss.getUnfinishedUploads,
  network.response
);
router.post("/multipart-init", oss.initMultipartUpload, network.response);
router.post(
  "/multipart-upload-part",
  file.multerSingleUpload,
  oss.uploadMultipartPart,
  network.response
);
router.post(
  "/multipart-complete",
  oss.completeMultipartUpload,
  network.response
);
router.post("/multipart-abort", oss.abortMultipartUpload, network.response);

export default router;
