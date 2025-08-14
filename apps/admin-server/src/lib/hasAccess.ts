import { useContext } from "react";
import { SessionContext } from "@/auth";
import hasRole from "./hasRole";
import { Role } from "@/lib/roles";

const validRoles: Role[] = [
  "superuser", "admin", "editor", "moderator", "member", "anonymous", "all"
];

function isRole(role: any): role is Role {
  return validRoles.includes(role);
}

export function hasAccess(userParr?: { role: string }) {
  let user = userParr || useContext(SessionContext);

  if (user?.role && isRole(user.role)) {
    return hasRole({ ...user, role: user.role }, "admin");
  }
  return false;
}