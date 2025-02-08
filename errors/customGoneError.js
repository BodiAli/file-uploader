class GoneError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 410;
    this.name = "GoneError";
  }
}

module.exports = GoneError;
