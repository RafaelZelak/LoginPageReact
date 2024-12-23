import {jwtDecode} from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  return token ? jwtDecode(token)?.user : null;
};
