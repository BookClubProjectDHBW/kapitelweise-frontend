import { graphqlRequest } from "./graphqlRequest.js";

const HOMEPAGE_QUERY = `
  query {
    member {
      id
      name
      membership { id name description }
      invitationPending {
        id
        createdAt
        bookclub { id name description }
        invitedBy { id name }
      }
    }
  }
`;

const CREATE_CLUB_MUTATION = `
  mutation CreateClub($input: BookClubInput!) {
    createNewBookClub(bookClubInput: $input) { id name description }
  }
`;

const RESPOND_INVITATION_MUTATION = `
  mutation Respond($input: InvitationInput!) {
    responseInvitation(invitationInput: $input) { id name description }
  }
`;

const CLUB_QUERY = `
  query Club($id: ID!) {
    bookclub(id: $id) { id bookClubName description role }
  }
`;

const INVITE_MUTATION = `
  mutation Invite($input: InviteUserInput!) {
    inviteUser(inviteUserInput: $input) {
      id
      invitationStatus
      invitedUser
      createdAt
    }
  }
`;

const LEAVE_CLUB_MUTATION = `
  mutation LeaveClub($clubId: ID!) {
    leaveBookClub(clubId: $clubId)
  }
`;

export function getHomepageData() {
  return graphqlRequest(HOMEPAGE_QUERY);
}

export function createClub(clubData) {
  return graphqlRequest(CREATE_CLUB_MUTATION, { input: clubData });
}

export function answerInvitation(invitationId, status) {
  return graphqlRequest(RESPOND_INVITATION_MUTATION, {
    input: { invitationId: String(invitationId), status },
  });
}

export async function getBookClub(clubId) {
  const data = await graphqlRequest(CLUB_QUERY, { id: String(clubId) });
  return data.bookclub;
}

export async function inviteUserToClub(clubId, username) {
  const data = await graphqlRequest(INVITE_MUTATION, {
    input: { bookclubId: String(clubId), username },
  });
  return data.inviteUser;
}

export async function leaveBookClub(clubId) {
  const data = await graphqlRequest(LEAVE_CLUB_MUTATION, {
    clubId: String(clubId),
  });

  return data.leaveBookClub;
}