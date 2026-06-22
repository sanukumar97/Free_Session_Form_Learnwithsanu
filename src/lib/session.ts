const SESSION_KEY = "free_enroll_session";
const ENROLLMENT_ID_KEY = "free_enroll_id";

export function getSessionToken(): string {
  let token = sessionStorage.getItem(SESSION_KEY);
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

export function getStoredEnrollmentId(): string | null {
  return sessionStorage.getItem(ENROLLMENT_ID_KEY);
}

export function setStoredEnrollmentId(id: string) {
  sessionStorage.setItem(ENROLLMENT_ID_KEY, id);
}

export function clearEnrollmentSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ENROLLMENT_ID_KEY);
  sessionStorage.removeItem("free_enroll_v1");
}
