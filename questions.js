// Trivia bank: one entry per category. Each question shows an IMAGE as the clue
// (no text question, no multiple choice) — contestants call out their guess and
// the Game Master judges it correct or not.
//
// `image` is a path with NO extension, e.g. "images/animals/1-octopus".
// The app tries common extensions (.jpg, .jpeg, .png, .webp, .gif) in order and
// falls back to a "still needed" placeholder if none exist yet.
// See IMAGES_NEEDED.md for the full shot list.
const CATEGORIES = [
  {
    name: "Movies",
    slug: "movies",
    questions: [
      { image: "images/movies/1-star-wars", answer: "Star Wars" },
      { image: "images/movies/2-titanic", answer: "Titanic" },
      { image: "images/movies/3-wizard-of-oz", answer: "The Wizard of Oz" },
      { image: "images/movies/4-jurassic-park", answer: "Jurassic Park" },
      { image: "images/movies/5-lion-king", answer: "The Lion King" },
      { image: "images/movies/6-home-alone", answer: "Home Alone" },
    ],
  },
  {
    name: "Music",
    slug: "music",
    questions: [
      { image: "images/music/1-electric-guitar", answer: "Electric guitar" },
      { image: "images/music/2-grand-piano", answer: "Grand piano" },
      { image: "images/music/3-drum-kit", answer: "Drum kit" },
      { image: "images/music/4-saxophone", answer: "Saxophone" },
      { image: "images/music/5-vinyl-record", answer: "Vinyl record" },
      { image: "images/music/6-violin", answer: "Violin" },
    ],
  },
  {
    name: "Sports",
    slug: "sports",
    questions: [
      { image: "images/sports/1-basketball", answer: "Basketball" },
      { image: "images/sports/2-tennis", answer: "Tennis" },
      { image: "images/sports/3-soccer", answer: "Soccer / Football" },
      { image: "images/sports/4-golf", answer: "Golf" },
      { image: "images/sports/5-swimming", answer: "Swimming" },
      { image: "images/sports/6-boxing", answer: "Boxing" },
    ],
  },
  {
    name: "Geography",
    slug: "geography",
    questions: [
      { image: "images/geography/1-eiffel-tower", answer: "Paris" },
      { image: "images/geography/2-pyramids-giza", answer: "Egypt" },
      { image: "images/geography/3-mount-everest", answer: "Nepal" },
      { image: "images/geography/4-sahara-desert", answer: "Sahara Desert" },
      { image: "images/geography/5-great-barrier-reef", answer: "Australia" },
      { image: "images/geography/6-amazon-rainforest", answer: "Amazon Rainforest" },
    ],
  },
  {
    name: "History",
    slug: "history",
    questions: [
      { image: "images/history/1-great-wall-china", answer: "China" },
      { image: "images/history/2-colosseum", answer: "Rome" },
      { image: "images/history/3-statue-of-liberty", answer: "Statue of Liberty" },
      { image: "images/history/4-stonehenge", answer: "Stonehenge" },
      { image: "images/history/5-terracotta-army", answer: "Terracotta Army" },
      { image: "images/history/6-viking-longship", answer: "Viking longship" },
    ],
  },
  {
    name: "Science",
    slug: "science",
    questions: [
      { image: "images/science/1-dna-helix", answer: "DNA" },
      { image: "images/science/2-periodic-table", answer: "Periodic table" },
      { image: "images/science/3-microscope", answer: "Microscope" },
      { image: "images/science/4-solar-system", answer: "Solar system" },
      { image: "images/science/5-chemistry-lab", answer: "Chemistry lab" },
      { image: "images/science/6-human-skeleton", answer: "Skeleton" },
    ],
  },
  {
    name: "Food & Drink",
    slug: "food-drink",
    questions: [
      { image: "images/food-drink/1-pizza", answer: "Pizza" },
      { image: "images/food-drink/2-sushi", answer: "Sushi" },
      { image: "images/food-drink/3-croissant", answer: "Croissant" },
      { image: "images/food-drink/4-taco", answer: "Taco" },
      { image: "images/food-drink/5-coffee", answer: "Coffee" },
      { image: "images/food-drink/6-cupcake", answer: "Cupcake" },
    ],
  },
  {
    name: "Animals",
    slug: "animals",
    questions: [
      { image: "images/animals/1-octopus", answer: "Octopus" },
      { image: "images/animals/2-platypus", answer: "Platypus" },
      { image: "images/animals/3-cheetah", answer: "Cheetah" },
      { image: "images/animals/4-parrot", answer: "Parrot" },
      { image: "images/animals/5-whale-shark", answer: "Whale shark" },
      { image: "images/animals/6-kangaroo", answer: "Kangaroo" },
    ],
  },
  {
    name: "TV Shows",
    slug: "tv-shows",
    questions: [
      { image: "images/tv-shows/1-game-of-thrones", answer: "Game of Thrones" },
      { image: "images/tv-shows/2-the-simpsons", answer: "The Simpsons" },
      { image: "images/tv-shows/3-stranger-things", answer: "Stranger Things" },
      { image: "images/tv-shows/4-breaking-bad", answer: "Breaking Bad" },
      { image: "images/tv-shows/5-friends", answer: "Friends" },
      { image: "images/tv-shows/6-doctor-who", answer: "Doctor Who" },
    ],
  },
  {
    name: "Video Games",
    slug: "video-games",
    questions: [
      { image: "images/video-games/1-super-mario", answer: "Super Mario" },
      { image: "images/video-games/2-minecraft", answer: "Minecraft" },
      { image: "images/video-games/3-game-controller", answer: "Video game controller" },
      { image: "images/video-games/4-legend-of-zelda", answer: "The Legend of Zelda" },
      { image: "images/video-games/5-fortnite", answer: "Fortnite" },
      { image: "images/video-games/6-pac-man", answer: "Pac-Man" },
    ],
  },
  {
    name: "Art",
    slug: "art",
    questions: [
      { image: "images/art/1-mona-lisa", answer: "Mona Lisa" },
      { image: "images/art/2-starry-night", answer: "Starry Night" },
      { image: "images/art/3-the-scream", answer: "The Scream" },
      { image: "images/art/4-statue-of-david", answer: "David" },
      { image: "images/art/5-paint-palette", answer: "Painting" },
      { image: "images/art/6-pop-art-soup-can", answer: "Pop Art" },
    ],
  },
  {
    name: "Literature",
    slug: "literature",
    questions: [
      { image: "images/literature/1-open-book", answer: "Classic literature" },
      { image: "images/literature/2-harry-potter", answer: "Harry Potter" },
      { image: "images/literature/3-moby-dick-whale", answer: "Moby-Dick" },
      { image: "images/literature/4-dystopian-eye", answer: "1984" },
      { image: "images/literature/5-regency-house", answer: "Pride and Prejudice" },
      { image: "images/literature/6-greek-scroll", answer: "The Odyssey" },
    ],
  },
  {
    name: "Space",
    slug: "space",
    questions: [
      { image: "images/space/1-the-sun", answer: "The Sun" },
      { image: "images/space/2-saturn-rings", answer: "Saturn" },
      { image: "images/space/3-moon-landing", answer: "Moon landing" },
      { image: "images/space/4-milky-way", answer: "Milky Way" },
      { image: "images/space/5-hubble-telescope", answer: "Hubble Space Telescope" },
      { image: "images/space/6-rocket-launch", answer: "Rocket launch" },
    ],
  },
  {
    name: "Technology",
    slug: "technology",
    questions: [
      { image: "images/technology/1-circuit-board", answer: "CPU" },
      { image: "images/technology/2-apple-logo", answer: "Apple" },
      { image: "images/technology/3-android-robot", answer: "Android" },
      { image: "images/technology/4-wifi-router", answer: "Wifi router" },
      { image: "images/technology/5-robot-ai", answer: "Artificial intelligence" },
      { image: "images/technology/6-first-iphone", answer: "First iPhone (2007)" },
    ],
  },
  {
    name: "Mythology",
    slug: "mythology",
    questions: [
      { image: "images/mythology/1-zeus-lightning", answer: "Zeus" },
      { image: "images/mythology/2-thor-hammer", answer: "Thor" },
      { image: "images/mythology/3-medusa", answer: "Medusa" },
      { image: "images/mythology/4-ra-sun-god", answer: "Ra" },
      { image: "images/mythology/5-icarus-wings", answer: "Icarus" },
      { image: "images/mythology/6-trojan-horse", answer: "Trojan Horse" },
    ],
  },
  {
    name: "Cars",
    slug: "cars",
    questions: [
      { image: "images/cars/1-jaguar-logo", answer: "Jaguar" },
      { image: "images/cars/2-ford-mustang", answer: "Ford Mustang" },
      { image: "images/cars/3-bmw-logo", answer: "BMW" },
      { image: "images/cars/4-tesla", answer: "Tesla" },
      { image: "images/cars/5-ferrari-logo", answer: "Ferrari" },
      { image: "images/cars/6-vw-logo", answer: "Volkswagen" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    questions: [
      { image: "images/fashion/1-chanel-logo", answer: "Chanel" },
      { image: "images/fashion/2-little-black-dress", answer: "Little black dress" },
      { image: "images/fashion/3-runway-show", answer: "Fashion week" },
      { image: "images/fashion/4-denim", answer: "Denim" },
      { image: "images/fashion/5-red-sole-heel", answer: "Christian Louboutin" },
      { image: "images/fashion/6-fedora", answer: "Fedora" },
    ],
  },
  {
    name: "World Capitals",
    slug: "world-capitals",
    questions: [
      { image: "images/world-capitals/1-tokyo", answer: "Tokyo" },
      { image: "images/world-capitals/2-ottawa", answer: "Ottawa" },
      { image: "images/world-capitals/3-cairo", answer: "Cairo" },
      { image: "images/world-capitals/4-brasilia", answer: "Brasília" },
      { image: "images/world-capitals/5-seoul", answer: "Seoul" },
      { image: "images/world-capitals/6-moscow", answer: "Moscow" },
    ],
  },
  {
    name: "Superheroes",
    slug: "superheroes",
    questions: [
      { image: "images/superheroes/1-batman-symbol", answer: "Batman" },
      { image: "images/superheroes/2-superman-shield", answer: "Superman" },
      { image: "images/superheroes/3-spider-man", answer: "Spider-Man" },
      { image: "images/superheroes/4-wonder-woman", answer: "Wonder Woman" },
      { image: "images/superheroes/5-wolverine-claws", answer: "Wolverine" },
      { image: "images/superheroes/6-mjolnir", answer: "Thor's hammer (Mjolnir)" },
    ],
  },
  {
    name: "Board Games",
    slug: "board-games",
    questions: [
      { image: "images/board-games/1-monopoly", answer: "Monopoly" },
      { image: "images/board-games/2-clue", answer: "Clue / Cluedo" },
      { image: "images/board-games/3-chess", answer: "Chess" },
      { image: "images/board-games/4-scrabble", answer: "Scrabble" },
      { image: "images/board-games/5-risk", answer: "Risk" },
      { image: "images/board-games/6-chess-bishop", answer: "Bishop" },
    ],
  },
];

if (typeof module !== "undefined") module.exports = { CATEGORIES };
