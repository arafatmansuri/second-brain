export function countMinutesSeconds(seconds: number) {
  const min = Math.floor(seconds / 60); // 60 seconds = 1 minute
  const sec = seconds % 60; // 100 seconds = 1 minute 40 seconds
  return `${min}:${sec < 10 ? `0${sec}` : sec}`;
}