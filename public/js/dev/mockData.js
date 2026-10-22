
export const bookClubs = [
  {
    bookClubId: "bookclub-1",
    name: "Krimirunde",
    members: [
      {
        userId: "user-1",
        username: "anna.liest",
        role: "admin",
      },
      {
        userId: "user-2",
        username: "lea.schmidt",
        role: "member",
      },
      {
        userId: "user-3",
        username: "jonas.klein",
        role: "member",
      },
      {
        userId: "user-4",
        username: "lena.buecher",
        role: "member",
      },
      {
        userId: "user-5",
        username: "tim.liest",
        role: "member",
      },
      {
        userId: "user-6",
        username: "mia.schreibt",
        role: "member",
      },
    ],
    currentBook: {
      title: "Der Name der Rose",
      edition: "Ausgabe dtv 2012",
      isbn: "978-3-423-02661-9",
      targetDate: "30. Nov.",
    },
  },
];

export const currentUserId = "user-1";

export const bookClub = bookClubs[0];

export const users = [
  {
    userId: "user-1",
    username: "anna.liest",
  },
  {
    userId: "user-2",
    username: "lea.schmidt",
  },
  {
    userId: "user-3",
    username: "jonas.klein",
  },
  {
    userId: "user-4",
    username: "lena.buecher",
  },
  {
    userId: "user-5",
    username: "tim.liest",
  },
  {
    userId: "user-6",
    username: "mia.schreibt",
  },
  {
    userId: "user-7",
    username: "sophie.romane",
  },
  {
    userId: "user-8",
    username: "max.seitenweise",
  },
  {
    userId: "user-9",
    username: "noah.buchwurm",
  },
];

export const homepageClubs = [
  {
    id: 1,
    bookClubName: "Fantasyfreunde",
    description: "Gemeinsam Fantasybücher entdecken.",
  },
  {
    id: 2,
    bookClubName: "Krimirunde",
    description: "Jeden Monat ein spannender Krimi.",
  },
];

export const homepageInvitations = [
  {
    invitationId: 1,
    clubId: 3,
    clubName: "Die Leseratten",
    description: "Unser gemütlicher Leseclub.",
  },
];

export function sendInvitationMock(club, username) {
  const normalizedUsername = username.trim().toLowerCase();

  const invitedUser = users.find(
    (user) => user.username.toLowerCase() === normalizedUsername,
  );

  if (!invitedUser) {
    return {
      success: false,
      message: "Der Benutzername existiert nicht.",
    };
  }

  const isAlreadyMember = club.members.some(
    (member) => member.userId === invitedUser.userId,
  );

  if (isAlreadyMember) {
    return {
      success: false,
      message: "Diese Person ist bereits Mitglied des Buchclubs.",
    };
  }

  return {
    success: true,
    message: "Die Einladung wurde erfolgreich verschickt.",
  };
}
