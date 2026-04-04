import crypto from "crypto";
import { db, usersTable, celebritiesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "./lib/logger.js";

async function syncCelebrityImages() {
  try {
    for (const celeb of CELEBRITIES) {
      const [existing] = await db.select().from(celebritiesTable).where(eq(celebritiesTable.name, celeb.name));
      if (existing && existing.imageUrl !== celeb.imageUrl) {
        await db.update(celebritiesTable).set({ imageUrl: celeb.imageUrl }).where(eq(celebritiesTable.name, celeb.name));
        logger.info(`Updated image URL for ${celeb.name}`);
      }
    }
  } catch (err) {
    logger.error({ err }, "Image sync error");
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "celebfancards_salt_2026").digest("hex");
}

const CELEBRITIES = [
  { name: "Johnny Depp", category: "Acting", bio: "Iconic American actor known for Pirates of the Caribbean, Edward Scissorhands, and his transformative character roles.", imageUrl: "/johnny-depp.jpeg", nationality: "American", popularFor: "Pirates of the Caribbean", fanCount: 89000 },
  { name: "Cristiano Ronaldo", category: "Sports", bio: "Portuguese football superstar, 5-time Ballon d'Or winner, and one of the greatest players in history.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Cristiano_Ronaldo_2275_%28cropped%29.jpg/330px-Cristiano_Ronaldo_2275_%28cropped%29.jpg", nationality: "Portuguese", popularFor: "Football/Soccer", fanCount: 620000 },
  { name: "Lionel Messi", category: "Sports", bio: "Argentine football legend, 8-time Ballon d'Or winner and 2022 FIFA World Cup champion.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-178.jpg/330px-Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-178.jpg", nationality: "Argentine", popularFor: "Football/Soccer", fanCount: 590000 },
  { name: "Taylor Swift", category: "Music", bio: "Grammy-winning American singer-songwriter known for her storytelling and genre-crossing albums.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/330px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png", nationality: "American", popularFor: "Pop & Country Music", fanCount: 480000 },
  { name: "Beyoncé", category: "Music", bio: "Global music icon, actress, and entrepreneur who has redefined pop culture and modern R&B.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Beyonc%C3%A9_-_Tottenham_Hotspur_Stadium_-_1st_June_2023_%2810_of_118%29_%2852946364598%29_%28best_crop%29.jpg/330px-Beyonc%C3%A9_-_Tottenham_Hotspur_Stadium_-_1st_June_2023_%2810_of_118%29_%2852946364598%29_%28best_crop%29.jpg", nationality: "American", popularFor: "R&B & Pop Music", fanCount: 430000 },
  { name: "Zendaya", category: "Acting", bio: "Emmy Award-winning actress and singer known for Euphoria, Dune, and her groundbreaking fashion sense.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg/330px-Zendaya_-_2019_by_Glenn_Francis.jpg", nationality: "American", popularFor: "Euphoria, Dune", fanCount: 320000 },
  { name: "Tom Holland", category: "Acting", bio: "British actor who brought Spider-Man to life in the Marvel Cinematic Universe with acrobatic skill and charm.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg/330px-Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg", nationality: "British", popularFor: "Spider-Man / MCU", fanCount: 290000 },
  { name: "Dwayne Johnson", category: "Acting", bio: "Former WWE Champion turned Hollywood superstar, known as 'The Rock' and one of the highest-paid actors.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Dwayne_Johnson-1764_%28cropped%29.jpg/330px-Dwayne_Johnson-1764_%28cropped%29.jpg", nationality: "American", popularFor: "Fast & Furious, Jumanji", fanCount: 380000 },
  { name: "Kylie Jenner", category: "Influencer", bio: "Beauty mogul, founder of Kylie Cosmetics, and one of the most followed people on Instagram.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kylie_Jenner1_%28cropped%29.png/330px-Kylie_Jenner1_%28cropped%29.png", nationality: "American", popularFor: "Beauty, Reality TV", fanCount: 270000 },
  { name: "Drake", category: "Music", bio: "Canadian rapper, singer, and songwriter who has dominated hip-hop and pop charts for over a decade.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Drake_at_The_Carter_Effect_2017_%2836818935200%29_%28cropped%29.jpg/330px-Drake_at_The_Carter_Effect_2017_%2836818935200%29_%28cropped%29.jpg", nationality: "Canadian", popularFor: "Hip-Hop & Rap", fanCount: 310000 },
  { name: "Ariana Grande", category: "Music", bio: "American pop superstar with a signature four-octave vocal range and numerous chart-topping hits.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Ariana_Grande_promoting_Wicked_%282024%29.jpg/330px-Ariana_Grande_promoting_Wicked_%282024%29.jpg", nationality: "American", popularFor: "Pop Music", fanCount: 360000 },
  { name: "Timothée Chalamet", category: "Acting", bio: "French-American actor acclaimed for his raw performances in Call Me by Your Name, Dune, and Wonka.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Timoth%C3%A9e_Chalamet-63482_%28cropped%29.jpg/330px-Timoth%C3%A9e_Chalamet-63482_%28cropped%29.jpg", nationality: "American/French", popularFor: "Dune, Call Me By Your Name", fanCount: 220000 },
  { name: "Margot Robbie", category: "Acting", bio: "Australian actress and producer known for Barbie, The Wolf of Wall Street, and I, Tonya.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/SYDNEY%2C_AUSTRALIA_-_JANUARY_23_Margot_Robbie_arrives_at_the_Australian_Premiere_of_%27I%2C_Tonya%27_on_January_23%2C_2018_in_Sydney%2C_Australia_%2828074883999%29_%28cropped_2%29.jpg/330px-thumbnail.jpg", nationality: "Australian", popularFor: "Barbie, Wolf of Wall Street", fanCount: 240000 },
  { name: "Chris Hemsworth", category: "Acting", bio: "Australian actor who brought Thor to life in the MCU and became one of Hollywood's biggest action stars.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chris_Hemsworth_-_Crime_101.jpg/330px-Chris_Hemsworth_-_Crime_101.jpg", nationality: "Australian", popularFor: "Thor / MCU", fanCount: 210000 },
  { name: "Selena Gomez", category: "Music", bio: "American singer, actress, and entrepreneur with the most-followed account on Instagram at her peak.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg/330px-Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg", nationality: "American", popularFor: "Pop Music, Acting", fanCount: 330000 },
  { name: "The Weeknd", category: "Music", bio: "Canadian R&B superstar known for Blinding Lights, Save Your Tears, and his cinematic music videos.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Weeknd_Portrait_by_Brian_Ziff.jpg/330px-The_Weeknd_Portrait_by_Brian_Ziff.jpg", nationality: "Canadian", popularFor: "R&B & Pop", fanCount: 280000 },
  { name: "Kim Kardashian", category: "Influencer", bio: "Media personality, businesswoman, and founder of SKIMS who shaped modern celebrity culture.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Kim_Kardashian_West_2014.jpg/330px-Kim_Kardashian_West_2014.jpg", nationality: "American", popularFor: "Reality TV, Business", fanCount: 260000 },
  { name: "LeBron James", category: "Sports", bio: "NBA legend, 4-time champion, and all-time NBA scoring leader who is widely considered the greatest basketball player ever.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/330px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg", nationality: "American", popularFor: "Basketball", fanCount: 410000 },
  { name: "Billie Eilish", category: "Music", bio: "Record-breaking young artist who won 5 Grammys at age 18 and redefined pop with her unique dark aesthetic.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg/330px-BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg", nationality: "American", popularFor: "Alternative Pop", fanCount: 250000 },
  { name: "Post Malone", category: "Music", bio: "Multi-genre artist blending hip-hop, rock, and pop who has topped charts across multiple genres.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Post_Malone_July_2021_%28cropped%29.jpg/330px-Post_Malone_July_2021_%28cropped%29.jpg", nationality: "American", popularFor: "Hip-Hop, Pop", fanCount: 190000 },
  { name: "Cardi B", category: "Music", bio: "Bronx-born rapper and first female solo rapper to win the Grammy for Best Rap Album.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Cardi_B_March_2024.png/330px-Cardi_B_March_2024.png", nationality: "American", popularFor: "Rap & Hip-Hop", fanCount: 200000 },
  { name: "Robert Downey Jr.", category: "Acting", bio: "Hollywood legend who defined a generation of superhero films as Iron Man in the MCU.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Robert_Downey_Jr._2014_Comic-Con.jpg/330px-Robert_Downey_Jr._2014_Comic-Con.jpg", nationality: "American", popularFor: "Iron Man / MCU", fanCount: 350000 },
  { name: "Scarlett Johansson", category: "Acting", bio: "One of Hollywood's highest-grossing actresses known for Black Widow, Marriage Story, and Her.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Scarlett_Johansson-8588.jpg/330px-Scarlett_Johansson-8588.jpg", nationality: "American", popularFor: "Black Widow / MCU", fanCount: 300000 },
  { name: "Will Smith", category: "Acting", bio: "Legendary actor and rapper who has delivered unforgettable performances across comedy, drama, and action.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/TechCrunch_Disrupt_San_Francisco_2019_-_Day_1_%2848834070763%29_%28cropped%29.jpg/330px-TechCrunch_Disrupt_San_Francisco_2019_-_Day_1_%2848834070763%29_%28cropped%29.jpg", nationality: "American", popularFor: "Fresh Prince, Ali, Bad Boys", fanCount: 320000 },
  { name: "Jennifer Lopez", category: "Music", bio: "Multi-hyphenate entertainer — actress, singer, dancer, and businesswoman — a true icon of Latin pop.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_%28cropped_3%29.jpg/330px-Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_%28cropped_3%29.jpg", nationality: "American", popularFor: "Latin Pop, Acting", fanCount: 270000 },
  { name: "Bad Bunny", category: "Music", bio: "Puerto Rican reggaeton superstar and the world's most-streamed artist on Spotify multiple years running.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bad_Bunny_2019_by_Glenn_Francis_%28cropped%29.jpg/330px-Bad_Bunny_2019_by_Glenn_Francis_%28cropped%29.jpg", nationality: "Puerto Rican", popularFor: "Reggaeton", fanCount: 380000 },
  { name: "Nicki Minaj", category: "Music", bio: "Trinidad-born rapper who broke barriers for women in hip-hop and holds numerous chart records.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Nicki_Minaj_2025_%283x4_cropped%29.jpg/330px-Nicki_Minaj_2025_%283x4_cropped%29.jpg", nationality: "Trinidadian-American", popularFor: "Rap & Hip-Hop", fanCount: 230000 },
  { name: "Justin Bieber", category: "Music", bio: "Canadian pop star who rose to fame as a teenager and became one of the best-selling artists of all time.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Justin_Bieber_in_2015.jpg/330px-Justin_Bieber_in_2015.jpg", nationality: "Canadian", popularFor: "Pop Music", fanCount: 340000 },
  { name: "Rihanna", category: "Music", bio: "Barbadian singer, actress, and founder of Fenty Beauty who has sold over 250 million records worldwide.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Rihanna_Fenty_2018.png/330px-Rihanna_Fenty_2018.png", nationality: "Barbadian", popularFor: "Pop & R&B, Fenty Beauty", fanCount: 390000 },
  { name: "Ed Sheeran", category: "Music", bio: "British singer-songwriter known for intimate storytelling and record-breaking albums like ÷ and x.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg/330px-Ed_Sheeran-6886_%28cropped%29.jpg", nationality: "British", popularFor: "Pop Music", fanCount: 280000 },
  { name: "Harry Styles", category: "Music", bio: "British singer and actor who found global fame with One Direction before launching a celebrated solo career.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/HarryStylesWembley170623_%2865_of_93%29_%2852982678051%29_%28cropped_2%29.jpg/330px-HarryStylesWembley170623_%2865_of_93%29_%2852982678051%29_%28cropped_2%29.jpg", nationality: "British", popularFor: "Pop Music, One Direction", fanCount: 310000 },
  { name: "Ryan Reynolds", category: "Acting", bio: "Canadian actor and entrepreneur known for Deadpool and his sharp wit both on screen and in business.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg/330px-Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg", nationality: "Canadian", popularFor: "Deadpool, Free Guy", fanCount: 200000 },
  { name: "Kevin Hart", category: "Acting", bio: "Stand-up comedian and actor who became one of Hollywood's biggest comedy stars and box office draws.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Kevin_Hart_2014_%28cropped_2%29.jpg/330px-Kevin_Hart_2014_%28cropped_2%29.jpg", nationality: "American", popularFor: "Comedy, Acting", fanCount: 180000 },
  { name: "Gal Gadot", category: "Acting", bio: "Israeli actress and former soldier who became Wonder Woman for a new generation of superhero fans.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Gal_Gadot_by_Gage_Skidmore_3.jpg/330px-Gal_Gadot_by_Gage_Skidmore_3.jpg", nationality: "Israeli", popularFor: "Wonder Woman, Fast & Furious", fanCount: 190000 },
  { name: "Chris Evans", category: "Acting", bio: "American actor best known as Captain America in the MCU and acclaimed for his dramatic roles.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Chris_Evans_2019_by_Gage_Skidmore.jpg/400px-Chris_Evans_2019_by_Gage_Skidmore.jpg", nationality: "American", popularFor: "Captain America / MCU", fanCount: 240000 },
  { name: "Emma Watson", category: "Acting", bio: "British actress and activist known worldwide for her role as Hermione Granger in the Harry Potter series.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Emma_Watson_2013.jpg/330px-Emma_Watson_2013.jpg", nationality: "British", popularFor: "Harry Potter", fanCount: 220000 },
  { name: "Adele", category: "Music", bio: "British soul singer whose albums 19, 21, 25, and 30 have broken sales records around the world.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Adele_2016.jpg/330px-Adele_2016.jpg", nationality: "British", popularFor: "Soul & Pop Music", fanCount: 260000 },
  { name: "Lady Gaga", category: "Music", bio: "American singer, songwriter, and actress known for her extraordinary vocal range and avant-garde style.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg/330px-Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg", nationality: "American", popularFor: "Pop Music, Acting", fanCount: 290000 },
  { name: "Michael B. Jordan", category: "Acting", bio: "American actor and director celebrated for Creed, Black Panther, and his powerful dramatic performances.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Michael_B_Jordan_-_Sinners_%28cropped%29.jpg/330px-Michael_B_Jordan_-_Sinners_%28cropped%29.jpg", nationality: "American", popularFor: "Creed, Black Panther", fanCount: 170000 },
  { name: "Brad Pitt", category: "Acting", bio: "Hollywood legend with an Oscar for Once Upon a Time in Hollywood, known for iconic roles spanning 3 decades.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Brad_Pitt-69858.jpg/330px-Brad_Pitt-69858.jpg", nationality: "American", popularFor: "Fight Club, Ocean's Eleven", fanCount: 280000 },
  { name: "Angelina Jolie", category: "Acting", bio: "Oscar-winning actress, filmmaker, and humanitarian known for Lara Croft, Maleficent, and her philanthropic work.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Angelina_Jolie_2_June_2014_%28cropped%29.jpg/400px-Angelina_Jolie_2_June_2014_%28cropped%29.jpg", nationality: "American", popularFor: "Lara Croft, Maleficent", fanCount: 310000 },
  { name: "Tom Cruise", category: "Acting", bio: "Hollywood's most committed action star known for the Mission: Impossible franchise and Top Gun.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Tom_Cruise_at_53rd_Saturn_Awards_2026-01.jpg/330px-Tom_Cruise_at_53rd_Saturn_Awards_2026-01.jpg", nationality: "American", popularFor: "Mission: Impossible, Top Gun", fanCount: 320000 },
  { name: "Katy Perry", category: "Music", bio: "American pop star known for anthems like Roar, Firework, and Teenage Dream with playful music videos.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/KatyPerryWestminst111224_%2881_of_95%29_%2854206733094%29_%28cropped_2%29.jpg/330px-KatyPerryWestminst111224_%2881_of_95%29_%2854206733094%29_%28cropped_2%29.jpg", nationality: "American", popularFor: "Pop Music", fanCount: 200000 },
  { name: "Neymar Jr.", category: "Sports", bio: "Brazilian football superstar known for his flair, skill, and record-breaking transfer to Paris Saint-Germain.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg/330px-Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg", nationality: "Brazilian", popularFor: "Football/Soccer", fanCount: 350000 },
  { name: "Kendall Jenner", category: "Influencer", bio: "American supermodel and one of the most successful runway models of her generation from the Jenner family.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/54/Kendall_Jenner_for_Adanola_2_%28cropped%29.jpg", nationality: "American", popularFor: "Modeling, Reality TV", fanCount: 180000 },
  { name: "Megan Thee Stallion", category: "Music", bio: "Grammy-winning rapper from Houston, Texas known for her confidence, flow, and chart-topping hits.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Megan_Thee_Stallion_Adweek_pose.jpg/330px-Megan_Thee_Stallion_Adweek_pose.jpg", nationality: "American", popularFor: "Rap & Hip-Hop", fanCount: 150000 },
  { name: "Shakira", category: "Music", bio: "Colombian singer and belly dancer who has sold over 80 million records and bridged Latin and pop music.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2902.jpg/330px-2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2902.jpg", nationality: "Colombian", popularFor: "Latin Pop, Dance", fanCount: 230000 },
  { name: "Dua Lipa", category: "Music", bio: "British-Albanian pop sensation who reinvented disco-pop for a new generation with Future Nostalgia.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Dua_Lipa-69798_%28cropped%29.jpg/330px-Dua_Lipa-69798_%28cropped%29.jpg", nationality: "British-Albanian", popularFor: "Pop Music", fanCount: 210000 },
  { name: "Viola Davis", category: "Acting", bio: "EGOT-winning actress, the first Black woman to win acting Emmys, Oscars, Tonys, and Grammys.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Viola_Davis_at_the_Air_Premiere_at_SXSW_%28cropped%29.jpg/330px-Viola_Davis_at_the_Air_Premiere_at_SXSW_%28cropped%29.jpg", nationality: "American", popularFor: "How to Get Away with Murder", fanCount: 140000 },
  { name: "Denzel Washington", category: "Acting", bio: "Two-time Oscar winner and one of the greatest actors of his generation known for Training Day, Malcolm X, and Fences.", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Denzel_Washington_at_the_2025_Cannes_Film_Festival.jpg/330px-Denzel_Washington_at_the_2025_Cannes_Film_Festival.jpg", nationality: "American", popularFor: "Training Day, Equalizer", fanCount: 260000 },
];

export async function seedDatabase() {
  try {
    const [{ value: celebCount }] = await db.select({ value: count() }).from(celebritiesTable);
    if (Number(celebCount) === 0) {
      logger.info("Seeding 50 celebrities...");
      await db.insert(celebritiesTable).values(CELEBRITIES);
      logger.info("Celebrity seed complete");
    } else {
      await syncCelebrityImages();
    }

    const [existingAdmin] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, "admin@fanCardHub.com"));

    if (!existingAdmin) {
      logger.info("Seeding admin user...");
      await db.insert(usersTable).values({
        fullName: "Aigbe Admin",
        email: "admin@fanCardHub.com",
        username: "admin_aigbe",
        passwordHash: hashPassword("CelebFan2026!"),
      });
      logger.info("Admin user seeded");
    }

    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║  ✅ ADMIN LOGIN DETAILS FOR YOU (Aigbe only)            ║");
    console.log("║                                                          ║");
    console.log("║  Email:    admin@fanCardHub.com                         ║");
    console.log("║  Password: CelebFan2026!                                ║");
    console.log("║  URL:      /admin                                        ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log("\n");
  } catch (err) {
    logger.error({ err }, "Seed error");
  }
}
