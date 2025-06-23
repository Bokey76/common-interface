import { Router } from "express";
import { network } from "@/middlewares";
import { file } from "@/utils";
import * as ossController from "@/controllers/oss.controller";

const router = Router();

// --普通oss操作--
router.get("/getFilesByDir", ossController.getFilesByDir, network.response);
router.get("/getFileContent", ossController.getFileContent, network.response);
router.get("/getOssSignature", ossController.getOssSignature, network.response);
router.post(
  "/uploadFiles",
  file.multerUploadFiles,
  ossController.putUploadFiles,
  network.response
);
router.post(
  "/streamUploadFiles",
  file.multerSingleUpload,
  ossController.streamUploadFile,
  network.response
);
router.post(
  "/copyFile",
  ossController.copyFile,
  network.response
)
router.put("/updateFileContent", ossController.updateFileContent, network.response);
router.delete("/deleteOssFiles", ossController.deleteOssFiles, network.response);

// --分片oss操作--
router.get(
  "/get-pending-multipart",
  ossController.getUnfinishedUploads,
  network.response
);
router.post("/multipart-init", ossController.initMultipartUpload, network.response);
router.post(
  "/multipart-upload-part",
  file.multerSingleUpload,
  ossController.uploadMultipartPart,
  network.response
);
router.post(
  "/multipart-complete",
  ossController.completeMultipartUpload,
  network.response
);
router.post("/multipart-abort", ossController.abortMultipartUpload, network.response);

export default router;
