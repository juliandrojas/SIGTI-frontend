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

// Los usuarios generales (rol 2) pueden crear solicitudes de préstamo.
export const canViewLoanForm = () => getUserRole() === 2;

// El historial y las devoluciones son gestionados solo por el área de Sistemas (rol 1).
export const canViewLoanHistory = () => isAdmin();

