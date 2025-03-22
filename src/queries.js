export const USER_DATA_QUERY = `
    query {
        user {
            id
            login
            attrs
            auditRatio
            skills: transactions(where: { type: { _like: "skill_%" } }order_by: [{ amount: desc }]) {
                type
                amount
            }
            audits(order_by: {createdAt: desc},where: {closedAt: {_is_null: true} group: {captain: { canAccessPlatform: {_eq: true}}}}) {
                closedAt
                group {
                    captain{
                        canAccessPlatform
                    }
                    captainId
                    captainLogin
                    path
                    createdAt
                    updatedAt
                    members {
                        userId
                        userLogin
                    }
                }
                private {
                    code
                }
            }
            events(where: {eventId: {_eq: 75}}) {
                level
            }
        }
        transaction(where: {_and: [{eventId:{_eq: 75}}]},order_by: { createdAt: desc }) {
            amount
            createdAt
            eventId
            path
            type
            userId
        }
        progress(where: {_and: [{grade: {_is_null: false}},{eventId:{_eq: 75}}]},order_by: {createdAt: desc}){
            id
            createdAt
            eventId
            grade
            path
        }
    }
`