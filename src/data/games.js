export const GAMES = [
  {
    id: "backyard-jumping",
    title: "Backyard Jumping Challenge",
    eyebrow: "Backyard games",
    summary: "Reaction lanes, host calls, and one backyard champion.",
    playerCount: "1 player",
    rosterSize: "8 challengers",
    status: "Ready",
    accentClass: "is-jumping"
  }
];

export const getGameById = (id) => GAMES.find((game) => game.id === id);
