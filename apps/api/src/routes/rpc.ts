import { IS_MAINNET } from "@hey/data/constants";
import { LENS_MAINNET_RPCS, LENS_TESTNET_RPCS } from "@hey/data/rpcs";
import logger from "@hey/helpers/logger";
import { Hono } from "hono";

const rpcRouter = new Hono();

// Health check endpoint
rpcRouter.get("/", (c) => {
  return c.json({
    message: "RPC proxy is running",
    network: IS_MAINNET ? "mainnet" : "testnet",
    status: "ok"
  });
});

// RPC proxy endpoint
rpcRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const rpcs = IS_MAINNET ? LENS_MAINNET_RPCS : LENS_TESTNET_RPCS;

    logger.info(
      `RPC proxy request: ${IS_MAINNET ? "mainnet" : "testnet"}, method: ${body.method}`
    );

    // Try each RPC endpoint until one succeeds
    for (const rpcUrl of rpcs) {
      try {
        logger.info(`Trying RPC endpoint: ${rpcUrl}`);
        const response = await fetch(rpcUrl, {
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST"
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            logger.info(`RPC request successful via: ${rpcUrl}`);
            return c.json(data);
          }
          // If response is not JSON, log and continue to next RPC
          logger.warn(
            `RPC endpoint returned non-JSON response: ${rpcUrl}, content-type: ${contentType}`
          );
          continue;
        }
        logger.warn(
          `RPC endpoint returned error status: ${rpcUrl}, status: ${response.status}`
        );
      } catch (error) {
        // Continue to next RPC if this one fails
        logger.warn(`RPC endpoint failed: ${rpcUrl}, error: ${error}`);
      }
    }

    // If all RPCs fail, return error
    return c.json(
      {
        error: {
          code: -32603,
          message: "All RPC endpoints failed"
        },
        id: body.id || null,
        jsonrpc: "2.0"
      },
      500
    );
  } catch (error) {
    logger.error(`RPC proxy error: ${error}`);
    return c.json(
      {
        error: {
          code: -32700,
          message: "Invalid request body"
        },
        id: null,
        jsonrpc: "2.0"
      },
      400
    );
  }
});

export default rpcRouter;
