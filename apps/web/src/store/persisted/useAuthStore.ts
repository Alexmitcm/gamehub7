import { Localstorage } from "@hey/data/storage";
import clearLocalStorage from "@/helpers/clearLocalStorage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface Tokens {
  accessToken: null | string;
  refreshToken: null | string;
}

interface BackendTokens {
  backendToken: null | string;
  user: null | {
    walletAddress: string;
    status: "Standard" | "Premium";
    linkedProfileId?: string;
    email?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    registrationDate: string;
    lastActiveAt: string;
    totalLogins: number;
  };
}

interface State extends Tokens, BackendTokens {
  hydrateAuthTokens: () => Tokens;
  hydrateBackendTokens: () => BackendTokens;
  refreshToken: Tokens["refreshToken"];
  signIn: (tokens: { accessToken: string; refreshToken: string }) => void;
  signInWithBackend: (data: { token: string; user: any }) => void;
  signOut: () => void;
}

const { store } = createPersistedTrackedStore<State>(
  (set, get) => ({
    accessToken: null,
    backendToken: null,
    hydrateAuthTokens: () => {
      const { accessToken, refreshToken } = get();
      return { accessToken, refreshToken };
    },
    hydrateBackendTokens: () => {
      const { backendToken, user } = get();
      return { backendToken, user };
    },
    refreshToken: null,
    signIn: ({ accessToken, refreshToken }) =>
      set({ accessToken, refreshToken }),
    signInWithBackend: ({ token, user }) => set({ backendToken: token, user }),
    signOut: async () => {
      clearLocalStorage();
      set({
        accessToken: null,
        backendToken: null,
        refreshToken: null,
        user: null
      });
    },
    user: null
  }),
  { name: Localstorage.AuthStore }
);

export const signIn = (tokens: { accessToken: string; refreshToken: string }) =>
  store.getState().signIn(tokens);

export const signInWithBackend = (data: { token: string; user: any }) =>
  store.getState().signInWithBackend(data);

export const signOut = () => store.getState().signOut();

export const hydrateAuthTokens = () => store.getState().hydrateAuthTokens();

export const hydrateBackendTokens = () =>
  store.getState().hydrateBackendTokens();

export default store;
