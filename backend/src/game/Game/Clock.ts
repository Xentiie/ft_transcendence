export class Clock {
  private startTime: number;
  private isRunning: boolean;
  private timeScale: number;
  private totalTime: number

  private lastTime: number

  constructor(autoStart: boolean = true) {
    this.isRunning = false;
    this.timeScale = 1;

    this.startTime = 0;
    this.totalTime = 0;

    if (autoStart) {
      this.start();
    }
  }

  start() {
    if (!this.isRunning) {
      this.startTime = Date.now()
      this.lastTime = Date.now()
      this.isRunning = true
    }
  }

  stop() {
    if (this.isRunning) {
      this.totalTime = (Date.now() - this.startTime) * this.timeScale;
      this.isRunning = false;
    }
  }

  setScale(scale: number) {
    this.timeScale = scale;
  }

  getScale() {
    return this.timeScale;
  }

  getElapsedTime() {
    if (this.isRunning) {
      return (Date.now() - this.startTime) * this.timeScale;
    }
    return this.totalTime;
  }

  getDelta() {
    const delta_time = Date.now() - this.lastTime
    this.lastTime = Date.now()
    return delta_time / this.timeScale / 100;
  }
}
