import { cookies } from "next/headers";

export const parseCookies = (req: any, param: string) => {
  const cookie = req.headers.get("cookie");

  const cookies: { [key: string]: string } = {};
  if (!cookie) {
    return cookies; // Return an empty object if no cookies are present
  }

  cookie.split(";").forEach((c) => {
    const [key, ...val] = c.split("=");
    cookies[key.trim()] = decodeURIComponent(val.join("="));
  });
  return cookies[`${param}`] ? JSON.parse(cookies[`${param}`]) : null;
};

export const parsePageCookies = (params: string) => {
  // Fetch the cookies server-side using the `next/headers` API
  const cookieStore = cookies();
  const cookie = cookieStore.get(params)?.value;

  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie));
  } catch {
    try {
      return JSON.parse(cookie);
    } catch {
      return cookie;
    }
  }
};
