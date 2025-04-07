/**
 * Represents a job error.
 */
export class JobError extends Error {
  /**
   * Indicates that there was an unexpected error.
   */
  static CODE_UNEXPECTED = 'JOB_UNEXPECTED'

  /**
   * Indicates that the job was not found.
   */
  static CODE_NOT_FOUND = 'JOB_NOT_FOUND'

  /**
   * Indicates that the job has timed out.
   */
  static CODE_TIMEOUT = 'JOB_TIMEOUT'

  /**
   * @param {String} message An error message.
   * @param {String} code An error code.
   */
  constructor (message, errorCode) {
    super(message)
    this.code = errorCode
  }
}

/**
 * Represents a request error.
 */
export class ReqError extends Error {
  /**
   * Bad Request
   */
  static BAD_REQUEST = 400

  /**
   * Unauthorized
   */
  static UNAUTHORIZED = 401

  /**
   * Not Found
   */
  static NOT_FOUND = 404

  /**
   * Internal Server Error
   */
  static INTERNAL_SERVER_ERROR = 500

  /**
   * Not Implemented
   */
  static NOT_IMPLEMENTED = 501

  /**
   * @param {*} message An error message.
   * @param {*} statusCode An HTTP status code.
   */
  constructor (message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}
