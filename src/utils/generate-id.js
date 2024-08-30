/**
 *
 * @param {string} prefix
 * @param {number} pad
 * @param {number} num
 * @returns {string}
 */
const generateId = (prefix, pad, num) => {
  const numberString = String(num).padStart(pad, '0')
  return `${prefix}${numberString}`
}

module.exports = {
  generateId,
}
