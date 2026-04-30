// All landing page photo assets from Supabase Storage
const BASE = "https://ljivgwkczgqvcqkdzsxr.supabase.co/storage/v1/object/public/landing-assets";

function url(filename: string) {
  return `${BASE}/${encodeURIComponent(filename)}.jpg`;
}

export const PHOTOS = {
  // Stadiums
  stadiumAbove:      url("stadium from above"),
  stadiumNightAbove: url("night lights stadium"),
  stadiumCeremony:   url("stadium ceremony"),
  stadiumGrass:      url("stadium grass closeup"),
  stadiumWatering:   url("stadium watering before match"),
  realMadridStadium: url("real madrid stadium"),
  communitySoccer:   url("community soccer field from above"),

  // Fans
  fanStadium:        url("fan looking at stadium"),
  fanNightStadium:   url("fan looking at stadium at night"),
  fansStreet:        url("fans at the street"),
  argentinaFans:     url("argentina fans living room"),
  portugalFans:      url("portugal fans street"),
  brazilFan:         url("brazil fan neimar shirt"),
  shoutingFan:       url("shouting fan street"),
  happyFans:         url("happy fans"),
  funnyFans:         url("funny fans"),
  kidFanStadium:     url("kid fan stadium"),
  fansInStadium:     url("fans in stadium"),
  fansCheering:      url("fans in stadium cheering"),

  // Players / Action
  goalkeeper:        url("goalkeeper kicking"),
  playerJumping:     url("player jumping after goal"),
  footBall:          url("foot on a soccer ball"),
  messiShirt:        url("messi argentina shirt"),
  ronaldoShirt:      url("boy with ronaldo shirt"),
  dressRoomShirts:   url("man utd dressing room shirts hanging"),

  // Trophy / Ball
  trophyGrass:       url("world cup trophy on grass"),
  trophyPost:        url("world cup trophy on grass near post"),
  soccerBallGrass:   url("soccer ball on grass"),
};
