// FIXME: replace with something that works on the client
import { createHash } from "crypto";

// we use axios for uploads and downloads since fetch has no way to get upload
// progress events (and download progress events are complicated!)
import axios from "axios";

import { GetFileInfoResponse } from "~/gql/datasources/b2-api";

type ResponseType =
  | "arraybuffer"
  | "blob"
  | "document"
  | "json"
  | "text"
  | "stream";

interface UploadFileProps {
  uploadUrl: string;
  uploadAuthToken: string;
  filename: string;
  data: Buffer;
  /** optional mime type, will default to 'b2/x-auto' if not provided */
  mime?: string;
  /** optional data hash, will use sha1(data) if not provided */
  hash?: string;
  onUploadProgress?: (progressEvent: unknown) => void;
}

export function uploadFile({
  uploadUrl,
  uploadAuthToken,
  filename,
  data,
  mime,
  hash,
  onUploadProgress
}: UploadFileProps) {
  const encodedFilename = getUrlEncodedFilename(filename);

  return axios
    .post<GetFileInfoResponse>(uploadUrl, data, {
      headers: {
        Authorization: uploadAuthToken,
        "Content-Type": mime || "b2/x-auto",
        "Content-Length": data.byteLength || data.length,
        "X-Bz-File-Name": encodedFilename,
        "X-Bz-Content-Sha1": hash || sha1(data)
      },
      maxRedirects: 0,
      onUploadProgress
    })
    .then(res => res.data);
}

interface DownloadFileProps {
  downloadUrl: string;
  responseType?: ResponseType;
  onDownloadProgress?: (progressEvent: any) => void;
}

export function downloadFileByName({
  downloadUrl,
  bucketName,
  fileName,
  responseType,
  onDownloadProgress
}: { bucketName: string; fileName: string } & DownloadFileProps) {
  const encodedFileName = getUrlEncodedFilename(fileName);

  return axios
    .get(`${downloadUrl}/file/${bucketName}/${encodedFileName}`, {
      responseType,
      onDownloadProgress
    })
    .then(res => res.data);
}

export function downloadFileById({
  downloadUrl,
  fileId,
  responseType,
  onDownloadProgress
}: {
  fileId: string;
} & DownloadFileProps) {
  return axios
    .get(`${downloadUrl}/b2api/v2/b2_download_file_by_id?fileId=${fileId}`, {
      responseType,
      onDownloadProgress
    })
    .then(res => res.data);
}

interface UploadPartProps {
  uploadUrl: string;
  uploadAuthToken: string;
  /** A number from 1 to 10000 */
  partNumber: number;
  data: Buffer;
  onUploadProgress?: (progressEvent: any) => void;
}

export function uploadPart({
  uploadUrl,
  uploadAuthToken,
  partNumber,
  data,
  onUploadProgress
}: UploadPartProps) {
  return axios
    .post(uploadUrl, data, {
      headers: {
        Authorization: uploadAuthToken,
        "Content-Length": data.byteLength || data.length,
        "X-Bz-Part-Number": partNumber,
        "X-Bz-Content-Sha1": sha1(data)
      },
      onUploadProgress,
      maxRedirects: 0
    })
    .then(res => res.data);
}

export function getUrlEncodedFilename(filename: string) {
  return filename
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

export function sha1(data: string | Buffer) {
  const hash = createHash("sha1");
  hash.update(data);
  return hash.digest("hex");
}
