import {AuthManager} from "./authManager.js";

export class GraphQLClient {
    static GRAPHQL_ENDPOINT = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';

    static async fetch(query, variables = {}) {
        const jwt = AuthManager.getToken();
        if (!jwt) throw new Error('No JWT token found.');

        const response = await fetch(this.GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) throw new Error('GraphQL query failed');
        const json = await response.json();
        return json.data;
    }
}