export function toVNTime(utcString) {
  if (!utcString) return "";

  const date = new Date(utcString);
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnDate.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}

export function isTodayVN(utcString) {
  const nowVN = new Date(Date.now());
  const createdVN = new Date(
    new Date(utcString).getTime() + 14 * 60 * 60 * 1000,
  );

  return (
    createdVN.getFullYear() === nowVN.getFullYear() &&
    createdVN.getMonth() === nowVN.getMonth() &&
    createdVN.getDate() === nowVN.getDate()
  );
}
