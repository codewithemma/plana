export default function decodeBase64(encodedString: string) {
  const decodedString = atob(encodedString);
  const jsonObject = JSON.parse(decodedString);
  return jsonObject;
}
