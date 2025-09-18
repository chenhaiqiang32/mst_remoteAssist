import AssistGSet from './AssistGSet';
import DrawingData from './DrawingData';

/**
 * 画板绘制CRDTs
 */
class AssistCanvasDrawingSet {
  private nowSet: AssistGSet<DrawingData>;

  private setMap: Map<number, AssistGSet<DrawingData>>;

  // eslint-disable-next-line no-use-before-define
  private observers: Array<(set: AssistCanvasDrawingSet) => void>;

  constructor() {
    this.nowSet = new AssistGSet<DrawingData>();
    this.setMap = new Map();
    this.observers = [];
  }

  /**
   * 清空数据
   */
  cleanup(): void {
    this.nowSet = new AssistGSet<DrawingData>();
    this.setMap = new Map();
    this.notifyObservers(this);
  }

  /**
   * 添加绘制数据
   * @param element
   */
  async add(element: DrawingData): Promise<any> {
    // 判断 element.anchor 是否存在于 setMap 中
    let setMapItem: AssistGSet<DrawingData> | undefined = this.setMap.get(
      element.anchor
    );
    if (!setMapItem) {
      // 如果不存在，则新建一个 set 并添加 element
      setMapItem = new AssistGSet<DrawingData>();
      setMapItem.add(element);
      this.setMap.set(element.anchor, setMapItem);
    } else {
      // 如果存在，查找是否已存在相同 uuid 的元素
      const data: DrawingData | undefined = Array.from(
        setMapItem.lookup()
      ).find((e) => e.uuid === element.uuid);
      if (data) {
        // 如果找到相同 uuid 的元素，更新其 points 和 finished 属性
        data.points.push(...element.points);
        data.finished = element.finished;
      } else {
        // 如果没有找到相同 uuid 的元素，直接添加 element
        setMapItem.add(element);
      }
    }
    // 更新 setMap 中的 anchor 对应的 set
    this.setMap.set(element.anchor, setMapItem);
    // 通知观察者，传递当前 nowSet
    this.notifyObservers(this);
  }

  async addOtherSet(element: DrawingData): Promise<any> {
    // 判断 element.anchor 是否存在于 setMap 中
    let setMapItem: AssistGSet<DrawingData> | undefined = this.setMap.get(
      element.anchor
    );
    if (!setMapItem) {
      // 如果不存在，则新建一个 set 并添加 element
      setMapItem = new AssistGSet<DrawingData>();
      setMapItem.add(element);
      this.setMap.set(element.anchor, setMapItem);
      this.addNowSet(element);
    } else {
      // 如果存在，查找是否已存在相同 uuid 的元素
      const data: DrawingData | undefined = Array.from(
        setMapItem.lookup()
      ).find((e) => e.uuid === element.uuid);
      if (data) {
        // 如果找到相同 uuid 的元素，更新其 points 和 finished 属性
        data.points.push(...element.points);
        data.finished = element.finished;
        const newElement: any = {
          ...element,
          points: data.points.slice(
            data.points.length - element.points.length - 2,
            data.points.length - 1
          ),
        };
        this.addNowSet(newElement);
      } else {
        // 如果没有找到相同 uuid 的元素，直接添加 element
        setMapItem.add(element);
        this.addNowSet(element);
      }
    }
    // 更新 setMap 中的 anchor 对应的 set
    this.setMap.set(element.anchor, setMapItem);
    // 通知观察者，传递当前 nowSet
    this.notifyObservers(this);
  }

  async addNowSet(element: DrawingData): Promise<any> {
    console.log('addNowSet-element', element);
    const existingElement: any = Array.from(this.nowSet.lookup()).find(
      (e) => e.anchor === element.anchor
    );
    console.log('addNowSet', existingElement);
    if (existingElement) {
      this.nowSet.remove(existingElement);
    }
    this.nowSet.add(element);
    console.log('addNowSet-this.nowSet', this.nowSet);
    // 通知观察者，传递当前 nowSet
    this.notifyObservers(this.nowSet);
  }

  // 实时线条
  lookupComplete(): Set<DrawingData> {
    const result = new Set<DrawingData>();
    this.nowSet.lookup().forEach((data) => {
      result.add(data);
    });
    return result;
  }

  /**
   * 移除绘制数据
   * @param element
   */
  remove(element: DrawingData): void {
    // 从 setMap 中找到对应 anchor 的集合
    const setMapItem = this.setMap.get(element.anchor);

    if (!setMapItem) {
      return; // 如果 setMap 中没有对应 anchor 的集合，直接返回
    }

    // 检查 nowSet 中是否有该元素
    const existingElement = Array.from(this.nowSet.lookup()).find(
      (e) => e.uuid === element.uuid
    );

    if (existingElement) {
      this.nowSet.remove(existingElement); // 从 nowSet 中移除元素
    }

    // 从 setMapItem 中移除该元素
    setMapItem.remove(element);

    // 如果 setMapItem 为空，从 setMap 中删除该 anchor
    if (setMapItem.lookup().size === 0) {
      this.setMap.delete(element.anchor);
    } else {
      // 更新 setMap 中的集合
      this.setMap.set(element.anchor, setMapItem);
    }

    // 通知观察者
    this.notifyObservers(this);
  }

  /**
   * 合并两个绘制数据集合
   * @param other
   * @return AssistCanvasDrawingSet
   */
  merge(other: AssistCanvasDrawingSet): AssistCanvasDrawingSet {
    const merged = new AssistCanvasDrawingSet();
    // 合并 setMap
    other.setMap.forEach((value, key) => {
      const currentSet = this.setMap.get(key);
      if (currentSet) {
        merged.setMap.set(key, currentSet.merge(value));
      } else {
        merged.setMap.set(key, value);
      }
    });

    return merged;
  }

  /**
   * 计算两个绘制数据集合的差集
   * @param other
   * @return AssistCanvasDrawingSet
   */
  diff(other: AssistCanvasDrawingSet): AssistCanvasDrawingSet {
    const diffed = new AssistCanvasDrawingSet();
    // 计算 setMap 的差集
    this.setMap.forEach((value, key) => {
      const otherSet = other.setMap.get(key);
      if (otherSet) {
        diffed.setMap.set(key, value.diff(otherSet));
      } else {
        diffed.setMap.set(key, value);
      }
    });

    return diffed;
  }

  /**
   * 查找所有绘制数据
   * @return Set<DrawingData>
   */
  lookup(): Set<DrawingData> {
    const allData: DrawingData[] = [];

    // 遍历 setMap，收集所有数据
    this.setMap.forEach((set) => {
      set.lookup().forEach((data) => {
        allData.push(data);
      });
    });

    // 根据 timestamp 进行排序
    allData.sort((a, b) => a.timestamp - b.timestamp);

    return new Set(allData);
  }

  /**
   * 根据 anchor 查找最后一个绘制数据
   * @param anchor
   * @return DrawingData | null
   */
  peek(anchor: number): DrawingData | null {
    const setMapItem = this.setMap.get(anchor);
    if (!setMapItem) {
      return null;
    }

    const allData: DrawingData[] = Array.from(setMapItem.lookup());

    if (allData.length === 0) {
      return null;
    }

    return allData.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
  }

  /**
   * 根据 anchor 删除最后一条线条
   * @param anchor
   * @return {DrawingData | null} 返回删除的线条信息，如果没有删除则返回 null
   */
  removeLastLineByAnchor(anchor: number): DrawingData | null {
    const setMapItem = this.setMap.get(anchor);
    if (!setMapItem) {
      return null; // 如果没有找到对应的 anchor，返回 null
    }

    // 筛选出未被删除的线条数据
    const allData: DrawingData[] = Array.from(setMapItem.lookup());

    if (allData.length === 0) {
      return null; // 如果没有未被删除的数据，返回 null
    }

    // 找到 timestamp 最大的线条（即最后一条线条）
    const lastLine = allData.reduce((a, b) =>
      a.timestamp > b.timestamp ? a : b
    );

    // 从 setMapItem 中删除找到的线条
    setMapItem.remove(lastLine);

    // 如果 setMapItem 为空，从 setMap 中移除
    if (setMapItem.lookup().size === 0) {
      this.setMap.delete(anchor);
    }

    // 通知观察者
    this.notifyObservers(this);

    // 返回删除的线条数据
    return lastLine;
  }

  /**
   * 根据 anchor 清空数据
   * @param anchor
   */
  removeSetByAnchor(anchor: number): AssistGSet<DrawingData> | null {
    const setMapItem = this.setMap.get(anchor);
    if (!setMapItem) {
      return null; // 如果没有找到对应的 anchor，返回 null
    }
    this.setMap.delete(anchor);
    return setMapItem;
  }

  /**
   * 通知观察者
   */
  private notifyObservers(set: any): void {
    this.observers.forEach((observer) => observer(set));
  }

  /**
   * 注册观察者
   * @param observer
   */
  observe(observer: (set: AssistCanvasDrawingSet) => void): void {
    this.observers.push(observer);
  }

  /**
   * 注销观察者
   * @param observer
   */
  unobserve(observer: (set: AssistCanvasDrawingSet) => void): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  /**
   * 重写equals
   * @param other
   * @return boolean
   */
  equals(other: AssistCanvasDrawingSet): boolean {
    return this.nowSet === other.nowSet;
  }

  /**
   * 重写hashCode
   * @return number
   */
  hashCode(): number {
    return this.nowSet.lookup().size;
  }
}

export default AssistCanvasDrawingSet;
