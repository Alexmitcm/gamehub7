import { HttpLink } from "@apollo/client";
import { HEY_API_URL } from "@hey/data/constants";

const httpLink = new HttpLink({
  fetch,
  uri: `${HEY_API_URL}/graphql`
});

export default httpLink;
