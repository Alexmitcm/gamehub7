import { createGuildClient, createSigner } from "@guildxyz/sdk";
import { Status } from "@hey/data/enums";
import logger from "@hey/helpers/logger";
import signer from "./signer";

const guildClient = createGuildClient("heyxyz");

// Check if signer is available before creating signer function
const signerFunction = signer ? createSigner.custom(
  (message) => signer.signMessage({ message }),
  signer.account.address
) : null;
const {
  guild: {
    role: { requirement: requirementClient }
  }
} = guildClient;

const syncAddressesToGuild = async ({
  addresses,
  requirementId,
  roleId
}: {
  addresses: string[];
  requirementId: number;
  roleId: number;
}) => {
  // Check if signer is available
  if (!signerFunction) {
    logger.warn("Guild sync skipped - PRIVATE_KEY not available");
    return {
      status: Status.Success,
      total: addresses.length,
      updatedAt: new Date().toISOString(),
      message: "Guild sync skipped - PRIVATE_KEY not available"
    };
  }

  // Run the sync operation in the background without awaiting
  requirementClient
    .update(
      7465,
      roleId,
      requirementId,
      { data: { addresses, hideAllowlist: true }, visibility: "PUBLIC" },
      signerFunction
    )
    .then(() => {
      logger.info("Guild sync completed");
    })
    .catch((error) => {
      logger.error("Guild sync failed:", error);
    });

  return {
    status: Status.Success,
    total: addresses.length,
    updatedAt: new Date().toISOString()
  };
};

export default syncAddressesToGuild;
