export type ErrorType = {
  error: string;
  message: string;
};

export class WrapperError extends Error {
  constructor(message: string) {
    super(
      `${message}. This shouldn't happen. Please open an issue at https://github.com/nktknshn/yargs-command-wrapper/issues`,
    );
    this.name = "WrapperError";
  }

  static create(message: string): WrapperError {
    return new WrapperError(message);
  }
}
