// Simple password hashing utility
export const hashPassword = (password) => {
  // Simple hash function using btoa and string manipulation
  const salt = "mantri_construction_2025";
  const combined = password + salt;
  return btoa(combined).split('').reverse().join('');
};

export const verifyPassword = (password, hashedPassword) => {
  const hashedInput = hashPassword(password);
  return hashedInput === hashedPassword;
};