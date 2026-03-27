// eslint-disable-next-line import/prefer-default-export
export function isBase64Encoded(str) {
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}
