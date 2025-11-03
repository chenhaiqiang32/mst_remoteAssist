import axios from 'axios';

// 新的上传接口返回数据类型
interface UploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  previewUrl: string;
}

// 新的上传结果类型
interface UploadResult {
  objectKey: string;
  previewUrl: string;
  statusCode: number;
  Location?: string; // 保持兼容性
}

export function useCos() {
  // 处理存储地址：本地环境需要走代理，线上环境直接使用原地址
  const processStorageUrl = (url: string): string => {
    const storageIndex = url.indexOf('/api/storage/');

    if (storageIndex !== -1) {
      // 判断是否为本地环境
      const isLocal =
        process.env.NODE_ENV === 'development' ||
        window.location.hostname === 'localhost';

      if (isLocal) {
        // 本地环境：提取 /api/storage/ 之后的路径，拼接 /api 前缀走代理
        const processedUrl = `${url.substring(storageIndex)}`;
        return processedUrl;
      }
      // 线上环境：直接使用原地址，不需要代理
      console.log('线上环境 - 使用原始地址:', url);
      return url;
    }

    return url;
  };

  // 获取上传URL
  const getUploadUrl = async (fileName: string): Promise<UploadUrlResponse> => {
    try {
      const response = await axios.get('/api/meeting/file/upload-url', {
        params: {
          fileName,
        },
      });

      console.log('获取上传URL响应:', response);

      // 兼容不同的响应格式
      if (response.data) {
        // 格式1: { code: 200, data: { objectKey, uploadUrl, previewUrl } }
        if (response.data.code === 200 && response.data.data) {
          return response.data.data;
        }
        // 格式2: 直接返回 { objectKey, uploadUrl, previewUrl }
        if (
          response.data.objectKey &&
          response.data.uploadUrl &&
          response.data.previewUrl
        ) {
          return response.data;
        }
      }

      // 如果都不匹配，记录响应并抛出错误
      console.error('获取上传URL失败，响应格式不正确:', response.data);
      throw new Error(`获取上传URL失败: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error('获取上传URL请求失败:', error);
      throw new Error(`获取上传URL失败: ${error.message}`);
    }
  };

  // 上传文件到存储桶
  const uploadFile = async (
    file: File | Blob,
    fileName: string,
    onProgress?: (progress: number) => void,
    timeout: number = 1000 * 30 // 超时时间，默认30秒
  ): Promise<UploadResult> => {
    try {
      // 1. 获取上传URL
      const uploadInfo = await getUploadUrl(fileName);

      // 2. 使用XMLHttpRequest上传文件到存储桶（兼容进度监听）
      const uploadPromise = new Promise<number>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // 设置超时
        xhr.timeout = timeout;

        // 监听上传进度
        if (onProgress && xhr.upload) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              onProgress(progress);
            }
          });
        }

        // 监听完成
        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 204) {
            resolve(xhr.status);
          } else {
            reject(new Error(`上传失败，状态码: ${xhr.status}`));
          }
        });

        // 监听错误
        xhr.addEventListener('error', () => {
          reject(new Error('上传过程中发生错误'));
        });

        // 监听超时
        xhr.addEventListener('timeout', () => {
          reject(new Error('上传超时'));
        });

        // 处理 uploadUrl：本地环境需要走代理，线上环境直接使用原地址
        const processedUrl = processStorageUrl(uploadInfo.uploadUrl);

        // 发起PUT请求
        xhr.open('PUT', processedUrl, true);
        xhr.setRequestHeader(
          'Content-Type',
          file.type || 'application/octet-stream'
        );
        xhr.send(file);
      });

      const status = await uploadPromise;

      if (status === 200 || status === 204) {
        // 处理 previewUrl：本地环境需要走代理，线上环境直接使用原地址
        const processedPreviewUrl = processStorageUrl(uploadInfo.previewUrl);

        return {
          objectKey: uploadInfo.objectKey,
          previewUrl: processedPreviewUrl,
          statusCode: 200,
          Location: processedPreviewUrl, // 保持兼容性
        };
      }
      throw new Error('文件上传失败');
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  };

  return {
    uploadFile,
    getUploadUrl,
  };
}

export default null;
