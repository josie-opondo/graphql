import { getToken } from './auth.js';
import { USER_QUERY, XP_BY_PROJECT_QUERY } from './queries.js';

const GRAPHQL_ENDPOINT = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';

export async function executeQuery(query, variables = {}) {
    const token = getToken();
    if (!token) throw new Error('No JWT token found.');

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        throw new Error('GraphQL query failed');
    }

    const json = await response.json();
    return json.data;
}

// Helper wrappers for specific queries:

export function getUserData() {
    return executeQuery(USER_QUERY);
}

export function getXpByProject() {
    return executeQuery(XP_BY_PROJECT_QUERY);
}
