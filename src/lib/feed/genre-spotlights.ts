export type Spotlight = {
  name: string;
  sub: string;
  query?: string;
  dept?: "Directing" | "Acting" | "Writing";
  presenter?: boolean;
  relatedGenreIds?: number[];
};

export const GENRE_SPOTLIGHTS: Record<string, Spotlight[]> = {
  Western: [
    { name: "John Wayne", sub: "His Best", dept: "Acting" },
    { name: "Clint Eastwood", sub: "Westerns", dept: "Acting" },
    { name: "Sergio Leone", sub: "Spaghetti Westerns", dept: "Directing" },
  ],
  Action: [
    { name: "Arnold Schwarzenegger", sub: "Pure Action", dept: "Acting" },
    { name: "Sylvester Stallone", sub: "Old-school Heat", dept: "Acting" },
    { name: "Keanu Reeves", sub: "Modern Classics", dept: "Acting" },
    { name: "Tom Cruise", sub: "Stunts & Spies", dept: "Acting" },
  ],
  Drama: [
    { name: "Martin Scorsese", sub: "Director's Cut", dept: "Directing" },
    { name: "Robert De Niro", sub: "Heavy Hitters", dept: "Acting" },
    { name: "Daniel Day-Lewis", sub: "Three-Time Oscar", dept: "Acting" },
    { name: "Meryl Streep", sub: "Career Drama", dept: "Acting" },
  ],
  Crime: [
    { name: "Martin Scorsese", sub: "Crime Films", dept: "Directing" },
    { name: "Quentin Tarantino", sub: "Tarantino Picks", dept: "Directing" },
    { name: "Al Pacino", sub: "Mob & Cops", dept: "Acting" },
    { name: "Joe Pesci", sub: "Mob Cinema", dept: "Acting" },
  ],
  "Sci-Fi": [
    { name: "Christopher Nolan", sub: "Mind-benders", dept: "Directing" },
    { name: "Ridley Scott", sub: "Worlds Apart", dept: "Directing" },
    { name: "Denis Villeneuve", sub: "Modern Sci-Fi", dept: "Directing" },
  ],
  Horror: [
    { name: "John Carpenter", sub: "Genre Master", dept: "Directing" },
    { name: "Stephen King", sub: "King Adaptations", dept: "Writing" },
    { name: "Jordan Peele", sub: "Modern Horror", dept: "Directing" },
    { name: "Mike Flanagan", sub: "Slow Burns", dept: "Directing" },
  ],
  Comedy: [
    { name: "Adam Sandler", sub: "Sandman Picks", dept: "Acting" },
    { name: "Will Ferrell", sub: "Lead Roles", dept: "Acting" },
    { name: "Steve Carell", sub: "His Comedy", dept: "Acting" },
    { name: "Edgar Wright", sub: "Brit Comedy", dept: "Directing" },
  ],
  Thriller: [
    { name: "Alfred Hitchcock", sub: "The Master", dept: "Directing" },
    { name: "Denzel Washington", sub: "Tense Performances", dept: "Acting" },
    { name: "David Fincher", sub: "Dark Thrillers", dept: "Directing" },
  ],
  Animation: [
    { name: "Hayao Miyazaki", sub: "Ghibli Magic", dept: "Directing" },
    { name: "Brad Bird", sub: "Pixar Greats", dept: "Directing" },
    { name: "Henry Selick", sub: "Stop-Motion", dept: "Directing" },
  ],
  Mystery: [
    { name: "David Fincher", sub: "Whodunits", dept: "Directing" },
    { name: "Alfred Hitchcock", sub: "Classic Mystery", dept: "Directing" },
    { name: "Rian Johnson", sub: "Modern Mysteries", dept: "Directing" },
  ],
  Romance: [
    { name: "Ryan Gosling", sub: "Heartbreak Chronicles", dept: "Acting" },
    { name: "Hugh Grant", sub: "Romcom Royalty", dept: "Acting" },
    { name: "Julia Roberts", sub: "Leading Lady", dept: "Acting" },
    { name: "Nora Ephron", sub: "Ephron Romcoms", dept: "Directing" },
  ],
  Adventure: [
    { name: "Steven Spielberg", sub: "Adventure Master", dept: "Directing" },
    { name: "Harrison Ford", sub: "Indy & Beyond", dept: "Acting" },
    { name: "Peter Jackson", sub: "Epic Quests", dept: "Directing" },
  ],
  Documentary: [
    { name: "Werner Herzog", sub: "Werner's World", dept: "Directing" },
    { name: "Errol Morris", sub: "Investigative Docs", dept: "Directing" },
    { name: "David Attenborough", sub: "Nature Films", dept: "Acting" },
    { name: "Louis Theroux", sub: "Field Reports", dept: "Acting", presenter: true },
  ],
  Fantasy: [
    { name: "Peter Jackson", sub: "Middle-earth Maker", dept: "Directing" },
    { name: "Guillermo del Toro", sub: "Dark Fantasy", dept: "Directing" },
    { name: "Hayao Miyazaki", sub: "Animated Worlds", dept: "Directing" },
  ],
  War: [
    { name: "Steven Spielberg", sub: "War Films", dept: "Directing", relatedGenreIds: [18, 36] },
    { name: "Stanley Kubrick", sub: "Anti-War", dept: "Directing", relatedGenreIds: [18, 35] },
    {
      name: "Kathryn Bigelow",
      sub: "Modern Warfare",
      dept: "Directing",
      relatedGenreIds: [18, 53, 36],
    },
    { name: "Oliver Stone", sub: "Vietnam & After", dept: "Directing", relatedGenreIds: [18, 36] },
  ],
  Family: [
    { name: "Steven Spielberg", sub: "For Everyone", dept: "Directing" },
    { name: "Robin Williams", sub: "Family Heart", dept: "Acting" },
    { name: "Tom Hanks", sub: "Family Favorites", dept: "Acting" },
  ],
  History: [
    { name: "Steven Spielberg", sub: "True Stories", dept: "Directing" },
    { name: "Ridley Scott", sub: "Epics & Empires", dept: "Directing" },
    { name: "Daniel Day-Lewis", sub: "Period Greats", dept: "Acting" },
    { name: "Sam Mendes", sub: "Historical Drama", dept: "Directing" },
  ],
  Music: [
    { name: "Damien Chazelle", sub: "Jazz & Showbiz", dept: "Directing" },
    { name: "Cameron Crowe", sub: "Music Films", dept: "Directing" },
    { name: "Bradley Cooper", sub: "Music Roles", dept: "Acting" },
  ],
};
