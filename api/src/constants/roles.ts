export const ROLES = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
} as const;

export type OrgRole = keyof typeof ROLES;
