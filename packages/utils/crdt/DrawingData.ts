import PointData from './PointData';
import * as PB from '../../proto/protocol';
/**
 * 绘制数据类
 */
class DrawingData {
  meetingNo: string;

  anchor: number;

  type: any;

  uuid: string;

  color: string;

  width: string;

  screenWidth: string;

  screenHeight: string;

  timestamp: number;

  points: PointData[];

  finished: boolean;

  constructor(
    meetingNo: string,
    anchor: number,
    type: any,
    uuid: string,
    color: string,
    width: string,
    screenWidth: string,
    screenHeight: string,
    timestamp: number,
    points: PointData[],
    finished: boolean
  ) {
    this.meetingNo = meetingNo;
    this.anchor = anchor;
    this.type = type;
    this.uuid = uuid;
    this.color = color;
    this.width = width;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.timestamp = timestamp;
    this.points = points;
    this.finished = finished;
  }

  /**
   * 从pb类转换成CRDTs的数据类型
   *
   * @param pb
   * @return
   */
  static transfer(pb: any): DrawingData {
    const points: PointData[] = pb.dataList.map(
      (data: any) => new PointData(data.x, data.y)
    );
    return new DrawingData(
      pb.meetingNo,
      pb.anchor,
      pb.type,
      pb.uuid,
      pb.color,
      pb.width,
      pb.screenWidth,
      pb.screenHeight,
      pb.timestamp,
      points,
      pb.finished
    );
  }

  /**
   * 唯一性判断重写
   *
   * @param other
   * @return
   */
  equals(other: DrawingData): boolean {
    return (
      this.meetingNo === other.meetingNo &&
      this.anchor === other.anchor &&
      this.type === other.type &&
      this.uuid === other.uuid &&
      this.color === other.color &&
      this.width === other.width &&
      this.screenWidth === other.screenWidth &&
      this.screenHeight === other.screenHeight
    );
  }

  /**
   * 重写hashCode
   *
   * @return
   */
  hashCode(): number {
    let result = this.timestamp;
    if (this.type === PB.DrawingType.LINE) {
      result += this.points.reduce(
        (acc, point) => acc + (parseInt(point.x, 10) + parseInt(point.y, 10)),
        0
      );
    }
    return result;
  }

  /**
   * 重写compareTo
   *
   * @param other
   * @return
   */
  compareTo(other: DrawingData): number {
    return this.timestamp - other.timestamp;
  }
}

export default DrawingData;
