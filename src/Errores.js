export class ErrorHttp extends Error {
  constructor(status, message, options = {}) {
    super(message, options);
    this.name = 'ErrorHttp';
    this.status = status;
  }
}
