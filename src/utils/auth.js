const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role_id ? Number(user.role_id) : null;
};

export const getUserRoleName = () => {
  const user = getStoredUser();
  return (user?.role_name || "").toLowerCase().trim();
};

export const isAdmin = () => {
  const roleId = getUserRole();
  const roleName = getUserRoleName();
  return roleId === 1 || roleName.includes("admin");
};

export const isSystemsUser = () => {
  const roleId = getUserRole();
  const roleName = getUserRoleName();
  return roleId === 2 || roleName.includes("sistema");
};

export const isExternalUser = () => {
  const roleId = getUserRole();
  const roleName = getUserRoleName();
  return roleId === 3 || roleName.includes("externo");
};

// El formulario de préstamos lo ve solamente el usuario externo (Rol 3)
export const canViewLoanForm = () => isExternalUser();

// El historial de los préstamos lo ve el administrador (Rol 1) y el usuario del área de sistemas (Rol 2)
export const canViewLoanHistory = () => isAdmin() || isSystemsUser();

