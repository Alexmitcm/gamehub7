import { LENS_MAINNET_RPCS } from "@hey/data/rpcs";
import { chains } from "@lens-chain/sdk/viem";
import { createWalletClient, type Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const createSigner = () => {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.warn("PRIVATE_KEY not found in environment variables");
    return null;
  }

  try {
    const account = privateKeyToAccount(privateKey as Hex);

    return createWalletClient({
      account,
      chain: chains.mainnet,
      transport: http(LENS_MAINNET_RPCS[0])
    });
  } catch (error) {
    console.error("Failed to create signer:", error);
    return null;
  }
};

const signer = createSigner();

export default signer;
