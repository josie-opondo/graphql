//Get basic user information, including transactions for XP
export const USER_QUERY = `
{
  user {
    id
    login
    transactions(where: { type: { _eq: "xp" } }) {
      amount
      objectId
      createdAt
      object {
        name
      }
    }
  }
}
`;

//Get XP earned per project (transactions grouped by object)
export const XP_BY_PROJECT_QUERY = `
{
  transaction(where: { type: { _eq: "xp" } }) {
    amount
    objectId
    createdAt
    object {
      name
    }
  }
}
`;

//Get pass/fail ratios for projects
export const PASS_FAIL_RATIO_QUERY = `
{
  result {
    id
    grade
    objectId
    createdAt
  }
}
`;

//Query for getting an object name by its ID (used for dynamic labeling)
export const OBJECT_NAME_QUERY = `
query ($id: Int!) {
  object(where: { id: { _eq: $id } }) {
    name
  }
}
`;
