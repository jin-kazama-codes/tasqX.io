"use client";

export const useCookie = (cookieParam: string) => {
  // Check if running on the client
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  const cookieObj = cookies.find((cookie) =>
    cookie.trim().startsWith(`${cookieParam}=`)
  );

  if (cookieObj) {
    const rawVal = cookieObj.trim().substring(cookieParam.length + 1);
    if (!rawVal) return null;

    try {
      return JSON.parse(decodeURIComponent(rawVal));
    } catch {
      try {
        return JSON.parse(rawVal);
      } catch {
        return rawVal;
      }
    }
  }

  return null;
};