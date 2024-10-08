export interface FileType {
  fileName: string;
  filePath: string;
  md5_hash: string;
  fileBuffer: Buffer;
  mimeType?: string;
}
