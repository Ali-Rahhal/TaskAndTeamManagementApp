export type SysRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface AuthUser {
  id: number;
  sysRole: SysRole;
}
