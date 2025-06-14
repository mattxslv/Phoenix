export function getGravatarUrl(email) {
  if (!email) return null;
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

// Simple MD5 implementation or use an npm package if you have one
function md5(string) {
  // This is a placeholder. For production, use a real MD5 implementation.
  return string;
}