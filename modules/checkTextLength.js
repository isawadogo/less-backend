// middleware/checkTextLength.js

function checkTextLength(body, keys) {
  let isNotLong = true;

  if (body[keys].length > 280) {
    isNotLong = false;
  }
  return isNotLong;
}

module.exports = { checkTextLength };
