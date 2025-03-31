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
   *
   * @param {String} message An error message.
   * @param {String} code An error code.
   */
  constructor (message, code) {
    super(message)
    this.code = code
  }
}
