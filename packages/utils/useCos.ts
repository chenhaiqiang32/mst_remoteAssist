import axios from 'axios';
import COS from 'cos-js-sdk-v5';

interface UseCosOptions {
  basicPath: string;
  bucket: string;
  bucketUrl: string;
  startTime: number;
  expiredTime: number;
  region: string;
  sessionToken: string;
  tmpSecretId: string;
  tmpSecretKey: string;
}

export function useCos({
  basicPath,
  bucket,
  bucketUrl,
  expiredTime,
  startTime,
  region,
  sessionToken,
  tmpSecretId,
  tmpSecretKey,
}: UseCosOptions) {
  const cos = new COS({
    getAuthorization(options, callback) {
      callback({
        TmpSecretId: tmpSecretId,
        TmpSecretKey: tmpSecretKey,
        SecurityToken: sessionToken,
        StartTime: startTime,
        ExpiredTime: expiredTime,
        ScopeLimit: true,
      });
    },
  });

  // 上传函数封装，带超时处理
  const uploadFile = async (
    file: File | Blob,
    key: string,
    onProgress?: (progress: number) => void,
    timeout: number = 1000 * 30 // 超时时间，默认10秒
  ): Promise<COS.PutObjectResult> => {
    if (!region) {
      console.log(file);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', `${basicPath}${key}`);
      const res: any = await axios.post<any>(
        '/api/document/minio/file/upload',
        formData,
        {
          headers: {
            Token: `${sessionToken}`,
          },
        }
      );

      if (res.code === 200) {
        return {
          ...res.data,
          statusCode: res.code,
          Location: res.data.url,
        };
      }
    }
    return new Promise((resolve, reject) => {
      // 记录超时的 ID
      let taskId: any;
      const timeoutId = setTimeout(() => {
        if (taskId) {
          cos.cancelTask(taskId); // 超时取消上传任务
        }
        reject(new Error('upload-timeout'));
      }, timeout);

      taskId = cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: `${basicPath}${key}`,
          Body: file,
          onProgress(progressData) {
            const progress = (progressData.loaded / progressData.total) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
        },
        (err, data) => {
          clearTimeout(timeoutId); // 清除超时计时器
          if (err) {
            reject(err);
          } else {
            resolve({
              ...data,
              Location: `${bucketUrl}${basicPath}${key}`,
            });
          }
        }
      );
    });
  };

  return {
    uploadFile,
  };
}

export default null;
