declare module 'kanjivganimate' {
  interface KanjivgAnimateOptions {
    duration?: number;
  }

  class KanjivgAnimate {
    constructor(selector: string, duration?: number);
    constructor(selector: string, options?: KanjivgAnimateOptions);
  }

  export = KanjivgAnimate;
}