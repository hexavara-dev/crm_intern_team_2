import { User } from "@/types/user";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export const setToken = (token: string) => {
  cookies.set("accessToken", token, { path: "/", maxAge: 86400 }); // 1 day
};

export const getToken = (): string | undefined => {
  return cookies.get("accessToken");
};

export const removeToken = () => {
  cookies.remove("accessToken", { path: "/" });
};

export const setUser = (user: any) => {
  cookies.set("user", JSON.stringify(user), { path: "/", maxAge: 86400 });
};

export const getUser = (): User | undefined => {
  const user = cookies.get("user");
  if (!user) return undefined;
  try {
    return typeof user === "string" ? JSON.parse(user) : user;
  } catch {
    return undefined;
  }
};

export const removeUser = () => {
  cookies.remove("user", { path: "/" });
};

export const logout = () => {
  removeToken();
  removeUser();
};
