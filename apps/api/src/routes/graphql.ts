import { LENS_API_URL } from "@hey/data/constants";
import logger from "@hey/helpers/logger";
import { Hono } from "hono";

const graphqlRouter = new Hono();

// GraphQL proxy endpoint
graphqlRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    logger.info(
      `GraphQL proxy request: method: ${body.operationName || "unnamed"}`
    );

    // Get auth headers once to avoid multiple calls and non-null assertions
    const accessToken = c.req.header("X-Access-Token");
    const authorization = c.req.header("Authorization");

    const response = await fetch(LENS_API_URL, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        // Forward any auth headers from the client
        ...(accessToken && {
          "X-Access-Token": accessToken
        }),
        ...(authorization && {
          Authorization: authorization
        })
      },
      method: "POST"
    });

    if (response.ok) {
      const data = await response.json();
      logger.info("GraphQL request successful");
      return c.json(data);
    }

    // If the response is not ok, return the error
    const errorData = await response.text();
    logger.warn(`GraphQL request failed: ${response.status} - ${errorData}`);

    return c.json(
      {
        error: {
          code: response.status,
          message: `GraphQL request failed: ${response.statusText}`
        }
      },
      response.status as any
    );
  } catch (error) {
    logger.error(`GraphQL proxy error: ${error}`);
    return c.json(
      {
        error: {
          code: -32700,
          message: "Invalid request body"
        }
      },
      400
    );
  }
});

// Health check endpoint for GraphQL
graphqlRouter.get("/", (c) => {
  return c.json({
    message: "GraphQL proxy is running",
    status: "ok",
    target: LENS_API_URL
  });
});

export default graphqlRouter;
