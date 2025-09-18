// 补零函数，确保两位数格式
const padZero = (num: number) => num.toString().padStart(2, '0');

export const calculateElapsedTime = (startTime: number) => {
  // 确保 startTime 是有效的时间戳
  if (typeof startTime !== 'number' || startTime <= 0) {
    return false;
  }

  const currentTimestamp = Date.now();
  const diff = currentTimestamp - startTime;
  // 确保时间差是正值
  if (diff < 0) {
    return false;
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  const elapsedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(
    seconds
  )}`;
  return elapsedTime;
};

export const toNumber = (value: any): number => {
  const num = Number(value);
  // eslint-disable-next-line no-restricted-globals
  return isNaN(num) ? 0 : num;
};

// 睡眠等
export function sleep(time: any) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

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

export function dataURItoBlob(base64Data: string): Blob {
  // Decode base64 string
  const byteString = window.atob(base64Data.split(',')[1]);

  // Get the MIME type from the data URI
  const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];

  // Create an ArrayBuffer and a Uint8Array to hold the binary data
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  // Convert each character of the byteString to a byte value
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  // Create and return a Blob object
  return new Blob([ia], { type: mimeString });
}

export function getMillisecond(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const millisecond = now.getMilliseconds();

  // Helper function to pad numbers with leading zeros
  const padNumber = (num: number, length: number): string => {
    return num.toString().padStart(length, '0');
  };

  const paddedMonth = padNumber(month, 2);
  const paddedDay = padNumber(day, 2);
  const paddedHour = padNumber(hour, 2);
  const paddedMinute = padNumber(minute, 2);
  const paddedSecond = padNumber(second, 2);

  // Handle milliseconds separately
  let paddedMillisecond = '';
  if (millisecond < 10) {
    paddedMillisecond = `00${millisecond}`;
  } else if (millisecond < 100) {
    paddedMillisecond = `0${millisecond}`;
  } else {
    paddedMillisecond = millisecond.toString();
  }

  return `${year}${paddedMonth}${paddedDay}${paddedHour}${paddedMinute}${paddedSecond}${paddedMillisecond}`;
}

// 下载文件流
export function downloadFile(file: any, name: any, type: any) {
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

export default null;

export function to16kHz(buffer: any) {
  const data = new Float32Array(buffer);
  const fitCount = Math.round(data.length * (16000 / 44100));
  const newData = new Float32Array(fitCount);
  const springFactor = (data.length - 1) / (fitCount - 1);
  [newData[0]] = data;
  let tmp: number;
  let before: number;
  let after: number;
  let atPoint: number;

  for (let i = 1; i < fitCount - 1; i += 1) {
    tmp = i * springFactor;
    before = Math.floor(tmp);
    after = Math.ceil(tmp);
    atPoint = tmp - before;
    newData[i] = data[before] + (data[after] - data[before]) * atPoint;
  }
  newData[fitCount - 1] = data[data.length - 1];
  return newData;
}
export function to16BitPCM(input: any) {
  const dataLength = input.length * (16 / 8);
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  let offset = 0;
  let s: number; // Declare 's' at the top of the function scope
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    s = Math.max(-1, Math.min(1, input[i])); // Use 'let' instead of 'var'
    dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Array.from(new Int8Array(dataView.buffer));
}

export function removeFirstSpecialChar(str: any) {
  // 检查第一个字符是否为特殊符号
  if (/[\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(str.charAt(0))) {
    // 如果是特殊符号，去除第一个字符
    return str.slice(1);
  }
  return str;
}
