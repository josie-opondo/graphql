export async function fetchGraphQL(query, jwt) {
    const response = await fetch('https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        throw new Error(`GraphQL error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data)
    return data.data;
}

export function getTopUniqueSkills(skills, limit = 8) {
    const skillMap = new Map();
  
    skills.forEach((skill) => {
      const existingAmount = skillMap.get(skill.type) || 0;
      if (skill.amount > existingAmount) {
        skillMap.set(skill.type, skill.amount);
      }
    });
  
    return [...skillMap.entries()]
      .map(([type, amount]) => ({
        name: type.replace("skill_", ""),
        level: amount / 100, // convert to decimal if amounts are out of 100
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, limit);
  }
  