type TargetContext = '_self' | '_parent' | '_blank' | '_top';

export const openWindow = (
  url: string,
  opts?: { target?: TargetContext; [key: string]: any }
) => {
  const { target = '_blank', ...others } = opts || {};
  window.open(
    url,
    target,
    Object.entries(others)
      .reduce((preValue: string[], curValue) => {
        const [key, value] = curValue;
        return [...preValue, `${key}=${value}`];
      }, [])
      .join(',')
  );
};

export const regexUrl = new RegExp(
  '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  'i'
);

// 将数据对像中的某个字段抽取成新的数组
export function objToArrForKey(arr: any, key: any) {
  const newArr: any = [];
  if (arr && arr.length > 0) {
    arr.forEach((item: any) => {
      newArr.push(item[key]);
    });
  }
  return newArr;
}

export function ObjectTrans(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function formatSeconds(seconds: number): string {
  // 确保输入为非负整数
  if (seconds < 0) {
    throw new Error('Seconds cannot be negative');
  }
  seconds /= 1000;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(secs).padStart(2, '0')}`;
}

/**
 * 将时间戳计算的会议时长转换为“00:00:00”格式
 * @param startTime 开始时间戳（毫秒）
 * @param endTime 结束时间戳（毫秒）
 * @returns 格式化后的时长字符串
 */
export function formatDuration(startTime: number, endTime: number): string {
  // 计算时间差（秒数）
  const durationSeconds = endTime - startTime;

  // 格式化为“00:00:00”形式
  return formatSeconds(durationSeconds);
}

export function formattedMeetingNo(data: any) {
  // 使用正则表达式将 meetingNo 格式化为每三位一个分隔符
  return data.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// 睡眠等
export function sleep(time: any) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function formatTimestamp(timestamp: number, type?: string) {
  const date = new Date(timestamp); // 将时间戳转换为日期对象

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，因此要+1，并确保两位数
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  let dataStr = '';
  // 根据type参数决定输出格式
  if (type === 'YYYY-MM-DD HH:mm') {
    dataStr = `${year}-${month}-${day} ${hours}:${minutes}`;
  } else if (type === 'YYYY/MM/DD HH:mm') {
    dataStr = `${year}/${month}/${day} ${hours}:${minutes}`;
  } else if (type === 'HH:mm:ss') {
    dataStr = `${hours}:${minutes}:${seconds}`;
  } else if (type === 'YYYY/MM/DD HH:mm:ss') {
    dataStr = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  } else if (type === 'today') {
    // 检查是否是今天的日期
    const now = new Date(); // 获取当前时间
    if (date.toDateString() === now.toDateString()) {
      dataStr = `${hours}:${minutes}`;
    } else {
      dataStr = `${year}-${month}-${day} ${hours}:${minutes}`;
    }
  } else {
    // 默认格式
    dataStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return dataStr;
}

// 下载文件流
export function downloadFile(file: any, name: any, type?: any) {
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(
    new Blob([file], {
      type,
    })
  );
  link.target = '_blank';
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 存储桶key模式
const BUCKET_KEYS = [
  'chat/company_',
  'sop/company_',
  'avatar/',
  'manage/company_',
  'meeting/company_',
  'operation/company_',
];

// 检查字符串是否为存储桶key
export function isBucketKey(str: string): boolean {
  if (typeof str !== 'string') return false;

  // 检查是否包含存储桶key模式
  const hasBucketKey = BUCKET_KEYS.some((bucketKey) => str.includes(bucketKey));
  if (hasBucketKey) {
    return true;
  }

  // 检查是否匹配存储桶URL模式 (sop/company_数字/...)
  const bucketPattern = /^sop\/company_\d+\//;
  if (bucketPattern.test(str)) {
    return true;
  }

  return false;
}

// 递归遍历数据结构，收集存储桶keys
export function collectBucketKeys(
  data: any,
  bucketKeys: Set<string> = new Set()
): Set<string> {
  if (typeof data === 'string' && isBucketKey(data)) {
    bucketKeys.add(data);
  } else if (Array.isArray(data)) {
    data.forEach((item) => collectBucketKeys(item, bucketKeys));
  } else if (data && typeof data === 'object') {
    Object.values(data).forEach((value) =>
      collectBucketKeys(value, bucketKeys)
    );
  }
  return bucketKeys;
}

// 递归替换数据结构中的存储桶keys
export function replaceBucketKeys(data: any, urlMap: Record<string, string>): any {
  if (typeof data === 'string') {
    if (isBucketKey(data)) {
      const previewUrl = urlMap[data];
      if (previewUrl) {
        return previewUrl;
      }
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => replaceBucketKeys(item, urlMap));
  }
  if (data && typeof data === 'object') {
    const result: any = {};
    Object.entries(data).forEach(([key, value]) => {
      result[key] = replaceBucketKeys(value, urlMap);
    });
    return result;
  }
  return data;
}
