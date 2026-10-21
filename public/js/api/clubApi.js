
import { graphqlRequest } from "./graphqlRequest.js";

const HOMEPAGE_QUERY = `
  query {
    member {
      id
      name
      membership {
        id
        name
        description
      }
      invitationPending {
        id
        createdAt
        bookclub {
          id
          name
          description
        }
        invitedBy {
          id
          name
        }
      }
    }
  }
`;

const CREATE_CLUB_MUTATION = `
  mutation CreateClub($input: BookClubInput!) {
    createNewBookClub(bookClubInput: $input) {
      id
      name
      description
    }
  }
`;

const RESPOND_INVITATION_MUTATION = `
  mutation Respond($input: InvitationInput!) {
    responseInvitation(invitationInput: $input) {
      id
      name
      description
    }
  }
`;

export async function getHomepageData() {
  return await graphqlRequest(HOMEPAGE_QUERY);
}

export async function createClub(clubData) {
  return await graphqlRequest(CREATE_CLUB_MUTATION, {
    input: clubData,
  });
}

export async function answerInvitation(invitationId, status) {
  return await graphqlRequest(RESPOND_INVITATION_MUTATION, {
    input: {
      invitationId: String(invitationId),
      status: status,
    },
  });
}
