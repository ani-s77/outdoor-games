const assetUrl = (fileName) => import.meta.env.BASE_URL + "assets/" + fileName;

export const CHARACTERS = [
  {
    id: "muzamer",
    name: "Mustafa",
    note: "Best character",
    avatar: "MS",
    avatarImage: assetUrl("muzamil-avatar.png"),
    reactionTime: 2.5,
    minReactionTime: 1,
    npcFailChance: 0.012,
    trapPenalty: 0.035,
    winnerLine: "Mustafa winner!"
  },
  {
    id: "mr-griddy",
    name: "Mr. Griddy",
    note: "Cheater character",
    avatar: "G",
    avatarImage: assetUrl("mr-greedy-avatar.png"),
    reactionTime: 2.5,
    minReactionTime: 1.2,
    npcFailChance: 0.008,
    trapPenalty: 0.025,
    special: "cheating-risk",
    winnerLine: "Mr Griddy winner!"
  },
  {
    id: "little-griddy",
    name: "Little Griddy",
    note: "Worst and smallest character",
    avatar: "LG",
    avatarImage: assetUrl("little-greedy-avatar.png"),
    reactionTime: 1,
    minReactionTime: 1,
    npcFailChance: 0.08,
    trapPenalty: 0.16,
    winnerLine: "Oh my god! Little Griddy winner!"
  },
  {
    id: "hassan",
    name: "Hamza",
    note: "OG champion but now mid",
    avatar: "H",
    avatarImage: assetUrl("hasnan-avatar.png"),
    reactionTime: [1.7, 2.1],
    minReactionTime: 1,
    npcFailChance: 0.04,
    trapPenalty: 0.085,
    winnerLine: "After very long, Hamza winner!"
  },
  {
    id: "good-boy",
    name: "Chill Guy",
    note: "Top 2 level on his day",
    avatar: "CG",
    avatarImage: assetUrl("cool-boy-avatar.png"),
    reactionTime: [1.9, 2.2],
    minReactionTime: 1,
    npcFailChance: 0.022,
    trapPenalty: 0.055,
    winnerLine: "Chill Guy the new champion!"
  },
  {
    id: "omaid",
    name: "Owais",
    note: "Chill Guy\u0027s brother",
    avatar: "OW",
    avatarImage: assetUrl("omar-avatar.png"),
    reactionTime: [1.8, 2],
    minReactionTime: 1,
    npcFailChance: 0.05,
    trapPenalty: 0.1,
    winnerLine: "Owais the new champion!"
  },
  {
    id: "big-e",
    name: "Ricky",
    note: "Strong contender",
    avatar: "R",
    avatarImage: assetUrl("biggie-avatar.png"),
    reactionTime: 1.8,
    minReactionTime: 1,
    npcFailChance: 0.03,
    trapPenalty: 0.07,
    winnerLine: "Ricky winner!"
  },
  {
    id: "little-big-e",
    name: "Little Ricky",
    note: "Huge kid but terrible at throwing challenges",
    avatar: "LR",
    avatarImage: assetUrl("little-biggie-avatar.png"),
    reactionTime: 1.3,
    minReactionTime: 1,
    npcFailChance: 0.06,
    trapPenalty: 0.13,
    winnerLine: "Little Ricky the new champion!"
  }
];

export const getCharacterById = (id) => CHARACTERS.find((character) => character.id === id);
