export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timer: number;
    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timer);
      timer = window.setTimeout(() => func.apply(this, args), delay);
    } as T;
  }
  