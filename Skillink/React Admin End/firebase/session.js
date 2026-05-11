import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";

const ADMIN_SESSION_KEY = "authUserData";
const ADMIN_AUTH_FLAG_KEY = "authUser";

export const normalizeEmail = (email) => email.trim().toLowerCase();

const bytesToHex = (bytes) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const hashPassword = async (password) => {
  const subtleCrypto = globalThis.crypto?.subtle;

  if (!subtleCrypto) {
    throw new Error("Password verification is not available in this browser.");
  }

  const encodedPassword = new TextEncoder().encode(password);
  const hashBuffer = await subtleCrypto.digest("SHA-256", encodedPassword);

  return bytesToHex(new Uint8Array(hashBuffer));
};

export const verifyPassword = async (password, storedHash) => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === storedHash;
};

export const persistAdminSession = (user) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ADMIN_AUTH_FLAG_KEY, "true");
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
};

export const clearAdminSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ADMIN_AUTH_FLAG_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const getStoredAdminSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const isAuthenticated = localStorage.getItem(ADMIN_AUTH_FLAG_KEY) === "true";

  if (!isAuthenticated) {
    return null;
  }

  try {
    const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);

    if (!storedSession) {
      return null;
    }

    const parsedSession = JSON.parse(storedSession);

    if (parsedSession?.role === "admin") {
      return parsedSession;
    }
  } catch (error) {
    console.error("Error reading stored admin session:", error);
  }

  clearAdminSession();
  return null;
};

export const findAdminUserByEmailAndPassword = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const usersSnap = await getDocs(collection(db, "users"));

  let matchedUser = null;

  usersSnap.forEach((docSnapshot) => {
    const userData = docSnapshot.data();
    const userEmail = String(userData.email || "").trim().toLowerCase();

    if (!matchedUser && userEmail === normalizedEmail) {
      matchedUser = {
        id: docSnapshot.id,
        ...userData,
      };
    }
  });

  if (!matchedUser || matchedUser.role !== "admin" || !matchedUser.password) {
    return null;
  }

  const passwordMatches = await verifyPassword(password, matchedUser.password);

  if (!passwordMatches) {
    return null;
  }

  return {
    uid: matchedUser.uid || matchedUser.id,
    id: matchedUser.id,
    email: matchedUser.email,
    name: matchedUser.name || "",
    role: matchedUser.role,
    status: matchedUser.status,
  };
};
