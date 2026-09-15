export function configuredAdminEmails() {
  return String(process.env.REGGAEAI_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminSession(session) {
  const email = session?.user?.email?.toLowerCase();
  return Boolean(email && configuredAdminEmails().includes(email));
}

export function adminCapability() {
  const emails = configuredAdminEmails();
  return {
    state: emails.length ? 'READY' : 'TO_CREATE',
    configuredAccounts: emails.length
  };
}
