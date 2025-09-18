/**
 * Grow-Only 集合类
 */
class AssistGSet<T> {
  private set: Set<T>;

  constructor() {
    this.set = new Set<T>();
  }

  /**
   * 添加元素到集合中
   * @param element
   */
  add(element: T): void {
    this.set.add(element);
  }

  /**
   * 从集合中移除元素
   * @param element
   */
  remove(element: T): void {
    this.set.delete(element);
  }

  /**
   * 查找集合中的所有元素
   * @return Set<T>
   */
  lookup(): Set<T> {
    return this.set;
  }

  /**
   * 合并两个集合
   * @param other
   * @return AssistGSet<T>
   */
  merge(other: AssistGSet<T>): AssistGSet<T> {
    const result = new AssistGSet<T>();
    this.set.forEach((element) => result.add(element));
    other.lookup().forEach((element) => result.add(element));
    return result;
  }

  /**
   * 计算两个集合的差集
   * @param other
   * @return AssistGSet<T>
   */
  diff(other: AssistGSet<T>): AssistGSet<T> {
    const result = new AssistGSet<T>();
    this.set.forEach((element) => {
      if (!other.lookup().has(element)) {
        result.add(element);
      }
    });
    return result;
  }
}

export default AssistGSet;
