// Shared access gate for token-linked proposals (both the Proposal and
// ProposalDoc flows). A share token alone never grants access: the requester
// must be an admin (preview / management) or a signed-in app user whose
// verified email is on the client record or the proposal's notice email.
export async function proposalGate(base44, allowedEmails) {
  const user = await base44.auth.me().catch(() => null);
  if (!user || !user.email) {
    return { error: "unauthorized", status: 401 };
  }
  if (user.role === "admin") {
    return { user };
  }
  const email = (user.email || "").toLowerCase();
  const allowed = (allowedEmails || []).some((e) => (e || "").toLowerCase() === email);
  if (allowed) {
    return { user };
  }
  return { error: "forbidden", status: 403 };
}