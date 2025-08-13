import { Localstorage } from "@hey/data/storage";

const clearLocalStorage = () => {
  // Clear all Hey-specific storage
  Object.values(Localstorage).forEach((key) => {
    localStorage.removeItem(key);
  });

  // Also clear any Lens-related tokens that might be stored
  localStorage.removeItem("lens.accessToken");
  localStorage.removeItem("lens.refreshToken");
  localStorage.removeItem("lens.tokens");
  localStorage.removeItem("wagmi.connected");
  localStorage.removeItem("wagmi.account");
  localStorage.removeItem("wagmi.chainId");
  localStorage.removeItem("wagmi.wallet");
  localStorage.removeItem("wagmi.recentConnectorId");
  localStorage.removeItem("wagmi.lastConnectedTimestamp");
  localStorage.removeItem("wagmi.disconnected");
  localStorage.removeItem("wagmi.walletConnectURI");
  localStorage.removeItem("wagmi.walletConnectV2URI");
  localStorage.removeItem("wagmi.walletConnectV2Topic");
  localStorage.removeItem("wagmi.walletConnectV2PairingTopic");
  localStorage.removeItem("wagmi.walletConnectV2Session");
  localStorage.removeItem("wagmi.walletConnectV2SessionTopic");
  localStorage.removeItem("wagmi.walletConnectV2SessionRequest");
  localStorage.removeItem("wagmi.walletConnectV2SessionEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionRequestEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionDeleteEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionExpireEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionPingEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionUpdateEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionUpgradeEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionExtendEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionRequestEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionDeleteEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionExpireEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionPingEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionUpdateEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionUpgradeEvent");
  localStorage.removeItem("wagmi.walletConnectV2SessionExtendEvent");

  // Clear any family-related storage
  localStorage.removeItem("family.accounts");
  localStorage.removeItem("family.connected");
  localStorage.removeItem("family.wallet");

  console.log(
    "🧹 Cleared all authentication and wallet data from localStorage"
  );
};

export default clearLocalStorage;
