
export class CustomError extends Error {
  status: number;
  constructor(message: string = '出现未知错误❌', status: number = 500) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

/**
 * 抛出自定义错误
 * @param message 错误消息
 * @param status 错误状态
 */
export function throwError(message: string = '出现未知错误❌', status: number = 500): never {
  throw new CustomError(message, status);
}
