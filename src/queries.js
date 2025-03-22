//Get basic user information, including transactions for XP
export const USER_QUERY = `
{
  user {
    id
    login
    auditRatio
    transactions(where: { type: { _eq: "xp" }, eventId: { _eq: 75 } }) {
      amount
      createdAt
    }
  }
}
`;

//Get XP earned per project (transactions grouped by object)
export const XP_BY_PROJECT_QUERY = `
{
  transaction(where: { type: { _eq: "xp" }, eventId: { _eq: 75 } }) {
    amount
    objectId
    createdAt
    object {
      name
    }
  }
}
`;

//Query for getting user skills
export const USER_SKILLS_QUERY = `
{
  user {
    skills: transactions(
      where: { type: { _like: "skill_%" }, eventId: { _eq: 75 } }
      order_by: [{ amount: desc }]
    ) {
      type
      amount
    }
  }
}
`;
