/**
 * Represents an app error.
 */
export default class AppError extends Error {
  /**
   * HTTP status codes.
   */

  /**
   * Bad Request
   */
  static HTTP_BAD_REQUEST = 400

  /**
   * Unauthorized
   */
  static HTTP_UNAUTHORIZED = 401

  /**
   * Forbidden
   */
  static HTTP_FORBIDDEN = 403

  /**
   * Not Found
   */
  static HTTP_NOT_FOUND = 404

  /**
   * Conflict
   */
  static HTTP_CONFLICT = 409

  /**
   * Internal Server Error
   */
  static HTTP_INTERNAL_SERVER_ERROR = 500

  /**
   * Not Implemented
   */
  static HTTP_NOT_IMPLEMENTED = 501

  /**
   * Job error codes.
   */

  /**
   * Indicates that the job has invalid definition.
   */
  static JOB_INVALID = 'JOB_INVALID'

  /**
   * Indicates that there was an unexpected error.
   */
  static JOB_UNEXPECTED = 'JOB_UNEXPECTED'

  /**
   * Indicates that the job was not found.
   */
  static JOB_NOT_FOUND = 'JOB_NOT_FOUND'

  /**
   * Indicates that the job has timed out.
   */
  static JOB_TIMEOUT = 'JOB_TIMEOUT'

  /**
   * Email error codes.
   */
  static EMAIL_RENDER_ERROR = 'EMAIL_RENDER_ERROR'

  /**
   * API error codes.
   */
  static API_INVALID_PARAMS = 'API_INVALID_PARAMS'

  /**
   * @param {*} message An error message.
   * @param {*} code An error code.
   */
  constructor (message, code) {
    super(message)
    this.code = code
    this.category = (code > 99 && code <= 600) ? 'http' : 'other'
  }
}
