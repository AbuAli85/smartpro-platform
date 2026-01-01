/**
 * Check if a deadline is expiring soon (within 3 days)
 */
export function isExpiringSoon(deadline: Date | string | null | undefined): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return d > now && d <= threeDaysFromNow;
}

/**
 * Check if a deadline has expired
 */
export function isExpired(deadline: Date | string | null | undefined): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  return d < new Date();
}

/**
 * Get days remaining until deadline
 */
export function getDaysRemaining(deadline: Date | string | null | undefined): number | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
