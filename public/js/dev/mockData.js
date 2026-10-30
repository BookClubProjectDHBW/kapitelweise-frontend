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

export const searchResults = [
  {
    title: "Harry Potter und der Stein der Weisen",
    author: "J. K. Rowling",
    firstPublishYear: 1997,
    coverId: 10521270,
    isbn: "9783551551672",
  },
  {
    title: "Der Hobbit",
    author: "J. R. R. Tolkien",
    firstPublishYear: 1937,
    isbn: "9780261103344",
  },
];

function mockMeetingDate(daysFromNow, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const mockMeetings = [
  {
    id: 1,
    title: "Gemeinsamer Leseabend",
    description: "Wir besprechen die ersten Kapitel unseres Buches.",
    starts_at: mockMeetingDate(3, 19),
    ends_at: mockMeetingDate(3, 21),
    location: "Stadtbibliothek",
    my_attendance_status: "OPEN",
  },
  {
    id: 2,
    title: "Buchclub-Treffen",
    description: "Austausch über die Handlung und unsere Theorien.",
    starts_at: mockMeetingDate(7, 18),
    ends_at: mockMeetingDate(7, 20),
    location: "Café am Markt",
    my_attendance_status: "ACCEPTED",
  },
  {
    id: 3,
    title: "Abschlussbesprechung",
    description: "Wir besprechen das Ende des Buches.",
    starts_at: mockMeetingDate(14, 19),
    ends_at: mockMeetingDate(14, 21),
    location: "Online",
    my_attendance_status: "DECLINED",
  },
];

export const mockMeetingAttendance = {
  1: [
    { username: "anna.liest", status: "OPEN" },
    { username: "lea.schmidt", status: "ACCEPTED" },
    { username: "jonas.klein", status: "DECLINED" },
    { username: "lena.buecher", status: "ACCEPTED" },
    { username: "tim.liest", status: "OPEN" },
    { username: "mia.schreibt", status: "OPEN" },
  ],
  2: [
    { username: "anna.liest", status: "ACCEPTED" },
    { username: "lea.schmidt", status: "ACCEPTED" },
    { username: "jonas.klein", status: "OPEN" },
    { username: "lena.buecher", status: "DECLINED" },
    { username: "tim.liest", status: "OPEN" },
    { username: "mia.schreibt", status: "ACCEPTED" },
  ],
  3: [
    { username: "anna.liest", status: "DECLINED" },
    { username: "lea.schmidt", status: "OPEN" },
    { username: "jonas.klein", status: "ACCEPTED" },
    { username: "lena.buecher", status: "OPEN" },
    { username: "tim.liest", status: "DECLINED" },
    { username: "mia.schreibt", status: "OPEN" },
  ],
};
