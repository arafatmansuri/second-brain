export function generateHash(len: number): string {
  const options =
    "bb5f5d8ff4aa83bbfcc5bb01914c8c91812663c2ffb65e0146a3cda3010692c7";
  let hash = "";
  for (let i = 0; i < len; i++) {
    hash += options[Math.floor(Math.random() * options.length)];
  }
  return hash;
}
