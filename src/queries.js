//Get basic user information, including transactions for XP
export const USER_QUERY = `
{
  user {
    id
    login
    transactions(where: { type: { _in: ["xp", "up", "down"] } }) {
      amount
      type
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

//Query for getting an object name by its ID (used for dynamic labeling)
export const OBJECT_NAME_QUERY = `
query ($id: Int!) {
  object(where: { id: { _eq: $id } }) {
    name
  }
}
`;

//Query for getting user skills
export const USER_SKILLS_QUERY = `
{
  user {
    skills: transactions(
      where: { type: { _like: "skill_%" } }
      order_by: [{ amount: desc }]
    ) {
      type
      amount
    }
  }
}
`;
