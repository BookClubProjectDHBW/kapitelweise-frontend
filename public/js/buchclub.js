const bookClub = {
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
};

function renderBookClub(bookClub) {
  const book = bookClub.currentBook;

  document.getElementById("name").textContent = bookClub.name;
  document.getElementById("memberCount").textContent = bookClub.members.length;

  document.getElementById("title").textContent = book.title;
  document.getElementById("edition").textContent = book.edition;
  document.getElementById("isbn").textContent = book.isbn;
  document.getElementById("targetDate").textContent = book.targetDate;
}

renderBookClub(bookClub);
