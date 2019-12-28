import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import { fetch } from "apollo-server-env";

import { BaseContext } from "../context";

import {
  AuthorizationResponse,
  GetUploadUrlResponse,
  GetDownloadAuthorizationResponse,
  GetFileInfoResponse
} from "./b2-api";

import { B2_ACCOUNT_ID, B2_APPLICATION_KEY } from "~/server/env";

// import { URLSearchParamsInit, RequestInit } from "apollo-server-env";
// import { DataSourceConfig } from "apollo-datasource";

export default class B2Api extends RESTDataSource<BaseContext> {
  authToken?: string;
  downloadUrl!: string;
  bucketId!: string;
  bucketName!: string;

  /**
   * If we receive certain kinds of 401 error, we can reauth and retry the call,
   * but only once. This flag tracks whether an error was hit (set to true) or
   * the last auth call was successful (reset to false).
   */
  reauthAttempted = false;

  constructor() {
    super();
  }

  async willSendRequest(request: RequestOptions) {
    if (!this.authToken) {
      throw new Error("Expected auth token to be available!");
    }
    request.headers.set("Authorization", this.authToken);
  }

  /**
   * We need to wrap requests with a closure (rather than, say, overriding the
   * `get` method inherited from RESTDataSource) since some properties we pass
   * for some calls may not be known until we authorize at least once.
   *
   * Even nicer would be async initialization, tracked in
   * https://github.com/apollographql/apollo-server/pull/3639
   */
  protected async wrapReq<T>(req: () => Promise<T>): Promise<T> {
    if (!this.authToken) {
      console.log("Authorizing B2...");
      await this.authorize();
    }
    try {
      return await req();
    } catch (e) {
      const status = e.extensions?.response?.body?.status;
      const code = e.extensions?.response?.body?.code;
      if (
        !this.reauthAttempted &&
        status === 401 &&
        (code === "bad_auth_token" || code === "expired_auth_token")
      ) {
        this.reauthAttempted = true;
        console.log(
          `Re-authorizing B2 (last req: ${JSON.stringify(
            e.extensions.response.body
          )})`
        );
        await this.authorize();
        return await req();
      }
      console.error(
        "Request error exts:",
        JSON.stringify(e.extensions, null, 2)
      );
      throw e;
    }
  }

  protected async authorize() {
    // this uses a different kind of auth, so we use the base fetch instead of
    // the helpers inherited from RESTDataSource.
    const res = await fetch(
      "https://api.backblaze.com/b2api/v2/b2_authorize_account",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`
          ).toString("base64")}`
        }
      }
    );

    if (!res.ok) {
      throw new Error(
        `Error authorizing B2! [${res.status}: ${res.statusText}]`
      );
    }

    const data: AuthorizationResponse = await res.json();

    if (
      !data.authorizationToken ||
      !data.apiUrl ||
      !data.downloadUrl ||
      !data.allowed.bucketId ||
      !data.allowed.bucketName
    ) {
      throw new Error(
        `Auth token or other properties missing in authorize response!`
      );
    }

    // set the superclass property baseURL for all other requests!
    this.baseURL = `${data.apiUrl}/b2api/v2`;

    this.authToken = data.authorizationToken;
    this.downloadUrl = data.downloadUrl;
    this.bucketId = data.allowed.bucketId;
    this.bucketName = data.allowed.bucketName;

    // if auth was ok, reset the reauth flag
    this.reauthAttempted = false;
  }

  getUploadUrl() {
    return this.wrapReq(() =>
      this.get<GetUploadUrlResponse>("/b2_get_upload_url", {
        bucketId: this.bucketId
      })
    );
  }

  listFileNames(data?: {
    startFileName?: string;
    maxFileCount?: number;
    prefix?: string;
    delimiter?: string;
  }) {
    return this.get("/b2_list_file_names", {
      ...data,
      bucketId: this.bucketId
    });
  }

  listFileVersions(data?: {
    startFileName?: string;
    startFileId?: string;
    maxFileCount?: number;
    prefix?: string;
    delimiter?: string;
  }) {
    return this.get("/b2_list_file_versions", {
      ...data,
      bucketId: this.bucketId
    });
  }

  hideFile(data: { bucketId: string; fileName: string }) {
    return this.get<GetFileInfoResponse>("/b2_hide_file", data);
  }

  getFileInfo(data: { fileId: string }) {
    return this.get<GetFileInfoResponse>("/b2_get_file_info", data);
  }

  deleteFileVersion(data: { fileId: string; fileName: string }) {
    return this.get("/b2_delete_file_version", data);
  }

  /**
   * Used to generate an authorization token that can be used to download
   * files with the specified prefix (and other optional headers) from a
   * private B2 bucket. Returns an authorization token that can be passed to
   * `b2_download_file_by_name` in the Authorization header or as an
   * Authorization parameter.
   */
  getDownloadAuthorization(data: {
    bucketId: string;

    /**
     * The file name prefix of files the download authorization token will
     * allow `downloadFileByName` to access. For example, if you have a
     * private bucket named "photos" and generate a download authorization
     * token for the fileNamePrefix "pets/" you will be able to use the
     * download authorization token to access:
     * https://f345.backblazeb2.com/file/photos/pets/kitten.jpg but not:
     * https://f345.backblazeb2.com/file/photos/vacation.jpg.
     */
    fileNamePrefix: string;

    /**
     * The number of seconds before the authorization token will expire. The
     * minimum value is 1 second. The maximum value is 604800 which is one
     * week in seconds.
     */
    validDurationInSeconds: number;

    /**
     *  If this is present, download requests using the returned authorization
     *  must include the same value for b2ContentDisposition. The value must
     *  match the grammar specified in RFC 6266 (except that parameter names
     *  that contain an '*' are not allowed).
     */
    b2ContentDisposition?: string;
  }) {
    return this.get<GetDownloadAuthorizationResponse>(
      "/b2_get_download_authorization",
      data
    );
  }

  startLargeFile({
    bucketId,
    fileName,
    contentType = "b2/x-auto"
  }: {
    bucketId: string;
    fileName: string;
    contentType?: string;
  }) {
    return this.get<GetFileInfoResponse>("/b2_start_large_file", {
      bucketId,
      fileName,
      contentType
    });
  }

  getUploadPartUrl(data: { fileId: string }) {
    return this.get("/b2_get_upload_part_url", data);
  }

  finishLargeFile(data: { fileId: string; partSha1Array: string[] }) {
    return this.get<GetFileInfoResponse>("/b2_finish_large_file", data);
  }

  cancelLargeFile(data: { fileId: string }) {
    return this.get("/b2_cancel_large_file", data);
  }
}
