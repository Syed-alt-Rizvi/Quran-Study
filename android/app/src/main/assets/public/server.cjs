var J=Object.create;var H=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var L=Object.getPrototypeOf,U=Object.prototype.hasOwnProperty;var z=(a,i)=>{for(var t in i)H(a,t,{get:i[t],enumerable:!0})},_=(a,i,t,n)=>{if(i&&typeof i=="object"||typeof i=="function")for(let o of D(i))!U.call(a,o)&&o!==t&&H(a,o,{get:()=>i[o],enumerable:!(n=F(i,o))||n.enumerable});return a};var v=(a,i,t)=>(t=a!=null?J(L(a)):{},_(i||!a||!a.__esModule?H(t,"default",{value:a,enumerable:!0}):t,a));var M=v(require("express"),1),G=v(require("cors"),1),B=v(require("path"),1),O=require("vite");var Q=require("drizzle-orm/better-sqlite3"),C=v(require("better-sqlite3"),1);var E={};z(E,{articleTopics:()=>x,ayahReferences:()=>w,ayahScienceRelationships:()=>f,discussions:()=>m,scienceArticles:()=>d,scienceTopics:()=>I,tafseerReferences:()=>P});var e=require("drizzle-orm/sqlite-core"),T=require("drizzle-orm"),m=(0,e.sqliteTable)("discussions",{id:(0,e.text)("id").primaryKey(),content:(0,e.text)("content").notNull(),author:(0,e.text)("author").notNull().default("Anonymous"),email:(0,e.text)("email"),createdAt:(0,e.text)("created_at").notNull().default(T.sql`CURRENT_TIMESTAMP`),replyToId:(0,e.text)("reply_to_id"),isModerated:(0,e.integer)("is_moderated",{mode:"boolean"}).notNull().default(!1)}),w=(0,e.sqliteTable)("ayah_references",{id:(0,e.text)("id").primaryKey(),discussionId:(0,e.text)("discussion_id").notNull().references(()=>m.id),surahNumber:(0,e.integer)("surah_number").notNull(),ayahNumber:(0,e.integer)("ayah_number").notNull(),surahName:(0,e.text)("surah_name")}),P=(0,e.sqliteTable)("tafseer_references",{id:(0,e.text)("id").primaryKey(),discussionId:(0,e.text)("discussion_id").notNull().references(()=>m.id),surahNumber:(0,e.integer)("surah_number").notNull(),ayahNumber:(0,e.integer)("ayah_number").notNull(),language:(0,e.text)("language").notNull(),source:(0,e.text)("source").notNull()}),d=(0,e.sqliteTable)("science_articles",{id:(0,e.text)("id").primaryKey(),title:(0,e.text)("title").notNull(),author:(0,e.text)("author"),content:(0,e.text)("content").notNull(),source:(0,e.text)("source").notNull(),originalUrl:(0,e.text)("original_url"),license:(0,e.text)("license"),publicationDate:(0,e.text)("publication_date"),createdAt:(0,e.text)("created_at").notNull().default(T.sql`CURRENT_TIMESTAMP`)}),I=(0,e.sqliteTable)("science_topics",{id:(0,e.text)("id").primaryKey(),name:(0,e.text)("name").notNull().unique()}),x=(0,e.sqliteTable)("article_topics",{id:(0,e.text)("id").primaryKey(),articleId:(0,e.text)("article_id").notNull().references(()=>d.id),topicId:(0,e.text)("topic_id").notNull().references(()=>I.id)}),f=(0,e.sqliteTable)("ayah_science_relationships",{id:(0,e.text)("id").primaryKey(),surahNumber:(0,e.integer)("surah_number").notNull(),ayahNumber:(0,e.integer)("ayah_number").notNull(),articleId:(0,e.text)("article_id").notNull().references(()=>d.id),explanation:(0,e.text)("explanation"),createdAt:(0,e.text)("created_at").notNull().default(T.sql`CURRENT_TIMESTAMP`)});var q=v(require("path"),1),R=v(require("os"),1),Y=process.env.K_SERVICE!==void 0||process.env.NODE_ENV==="production",K=Y?R.default.tmpdir():process.cwd(),V=q.default.join(K,"quran.db"),W=new C.default(V);W.exec(`
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reply_to_id TEXT,
  is_moderated INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS ayah_references (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  surah_name TEXT,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id)
);
CREATE TABLE IF NOT EXISTS tafseer_references (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  language TEXT NOT NULL,
  source TEXT NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id)
);
CREATE TABLE IF NOT EXISTS science_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  original_url TEXT,
  license TEXT,
  publication_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS science_topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS article_topics (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  FOREIGN KEY (article_id) REFERENCES science_articles(id),
  FOREIGN KEY (topic_id) REFERENCES science_topics(id)
);
CREATE TABLE IF NOT EXISTS ayah_science_relationships (
  id TEXT PRIMARY KEY,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  article_id TEXT NOT NULL,
  explanation TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES science_articles(id)
);
`);var h=(0,Q.drizzle)(W,{schema:E});var r=require("drizzle-orm"),S=require("uuid");var j={articles:[{id:"21a6264f-39cb-4ce2-9983-aeea1989426d",title:"Human",author:"Quran & Science",content:`Has anyone ever thought, before the Quran was revealed, that man\u2019s nutfa, when ejected, is responsible for determining if the embryo will be male or female? Has this ever occurred to one\u2019s mind? The Quran says;

\u201CThat He created the pairs, male and female, from a fluid-drop sperm as it is emitted.\u201D (Quran 53: 45-46), confirming that man\u2019s gender as male or female is determined when the sperm drop is emitted. Who told the Prophet Mohammed that the sperm (nutfa) with one of its types (Y) or (X) is responsible for determining the sex of the embryo?

History of embryology

The theory of the full dwarf embryo existing in man\u2019s sperm or full dwarf embryo created out of the woman\u2019s menstrual blood coagulation remained the dominant theory of embryo creation till 18th century.

On the other hand the holy Quran since the 6th century has described in full and accurate details the stages of embryo development which have been confirmed scientifically throughout the last century.

\u201CThen We placed him as a sperm-drop in a firm lodging.* Then We made the sperm-drop into a clinging clot, and We made the clot into a lump [of flesh], and We made [from] the lump, bones, and We covered the bones with flesh; then We developed him into another creation. So blessed is Allah , the best of creators..\u201D (Quran 23:13-14)

Sperm fertilizing egg

While hundred millions of these sperms (500 m.- 600 m.) enter through the vagina to the uterine cervix, only one sperm is able to fertilize the ovum.

\u201CHe It is Who created all things in the best way and began the creation of man from clay, and made his progeny from an extract of despised fluid (Sulalah)\u201D (Quran 32: 7-8)

The meaning of Sulalah is \u201Cextract\u201D, means the essential or best part of something. By either implication, it means \u201Cpart of a whole\u201D indicating that the origin of creation is from only part of man\u2019s fluid and not all of it.

Allah says:

\u201CVerily We created man of a fluid-drop (nutfa), mingling (amshaj), in order to try him: so We gave him (the gifts of) hearing and sight.\u201D (Quran 76:2).

The mingled nutfa in this verse reveals the Quran miraculous nature. Nutfa, in Arabic, is a single small drop of water, but it was described here as (amshaj) , which means its structure consists of combined mixtures . This fits with the scientific finding, as the zygote is shaped as a drop, and is simultaneously a mixture of male fluid chromosomes and female ovum

Alaqah (Leech)

\u201CThen We made the drop into \u201Calaqah\u201D a leech-like structure.\u201D (Quran 23:14)

The word \u201Calaqah\u201D refers to a leech or bloodsucker. This is an appropriate description of the human embryo from days 7-24 when it clings to the endometrium of the uterus, in the same way that a leech clings to the skin. Just as the leech derives blood from the host, the human embryo derives blood from the decidua or pregnant endometrium. It is remarkable how much the embryo of 23-24 days resembles a leech.

\u201CThen of that leech-like structure, We made \u201Cmudghah\u201D a chewed lump.\u201D (Quran 23:14)

This statement is also from Sura 23:14. The Arabic word \u201Cmudghah\u201D means \u201Cchewed substance or chewed lump.\u201D Toward the end of the fourth week, the human embryo looks somewhat like a chewed lump of flesh. The chewed appearance results from the somites which resemble teeth marks. The somites represent the beginnings or primordia of the vertebrae.`,source:"Quran and Science",original_url:"https://quranandscience.com/photo-comment/366-human/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-27T12:28:13",created_at:"2026-08-23 09:55:28"},{id:"fe17f229-5cad-43d4-b167-c437af510ca7",title:"Universe",author:"Quran & Science",content:`Universe beginning

Astrophysics: Before the Big Bang, there was no such thing. There was a condition of non-existence in which neither matter, nor energy, nor even time existed, so it can only be described metaphysically, matter, energy, and time were all created.

In Quran: There was nonexistence until God (Allah) has created heavens and earth.

(All the praises and thanks are to All\xE2h, the (only) Originator (or the (only) Creator) of the heavens and the earth). (Quran 35:1)

Fatq Al-ratq

Astrophysics: the term Big Bang generally refers to the idea that the universe has expanded from a primordial hot and dense initial condition at some finite time in the past, and continues to expand to this day.

The heavens and the earth \u201Cwhole Universes\u201D were created from one thing where all matter and energy squeezed into a tiny volume called by The Glorious Qur\u2019an Ratq.

These original contents was joined together (Ratq) and the trigger of the creation start with Instantaneous cleft called by The Glorious Qur\u2019an Fatq

(Have those who disbelieved not considered that the heavens and the earth were a joined entity, and We separated them and made from water every living thing? Then will they not believe?). (Quran 21:30)

Universal smoke

Astrophysics: At one point in time, the whole universe was nothing but a cloud of \u2018smoke\u2019 (i.e. an opaque highly dense and hot gaseous composition). Dr. Loretta Dunne from Cardiff University, who led A team of UK astronomers says: \u201CCosmic dust consists of tiny particles of solid material floating around in the space between the stars. It is not the same as house dust but more akin to cigarette smoke.\u201D

What is the state of matter in the early universe? The answer from The Glorious Quran is Dokhan (smoke). The Glorious Qur\u2019an precedes recent Astronomers since more than 1400 years ago when mentioned that the Dokhan (smoke) was dominating the early sky.

(Moreover He comprehended in His design the sky, and it had been (as) smoke: He said to it and to earth: \u201CCome ye together, willingly or unwillingly\u201D They said: \u201Cwe do come (together) in willing obedience). (Quran 41: 11-12)

Expanding Universe

Astrophysics: Observations of distant galaxies and quasars show that these objects are redshifted which means that the universe is uniformly expanding everywhere.

An expanding Universe does not mean that everything in the Universe is growing in size. The galaxies are only moving away from each other! (Michael S. Turner & Craig Wiegert). The best words to explain this are mentioned in Quran (Enna lamosoon (create the vastness of the sky)).

(And the heaven We constructed with strength, and indeed, We are [its] expander.). (Quran 51:47)

Astrophysics: After the Big Bang there were density fluctuations (Dr. Smoot [Noble Prize 2006] Called it Ripples) which seeded the development of large structure as The galaxies of our universe are arranged into filaments of clusters and super clusters woven into the cosmic web.

(By the sky with (its) HOBOK numerous paths). (Quran 51:6)

Quran mentions that sky has what is called in Arabic \u201CHOBOK\u201D which has several meanings all of them describe the facts mentioned above.

a- Hobok are the filaments when they are woven firmly in a fabric (web).

b- Hobok are what you see in surface of the sand by the effect of light wind, which we now define as ripple marks.

c- Hobok are the surface features in stagnant water resulted from the passing of quite air through water.

d- Hobok are the breaking (rippling) every thing even the uneven hair.

e- Architecture with stars, the galaxy and paths of stars.`,source:"Quran and Science",original_url:"https://quranandscience.com/photo-comment/365-universe/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-27T11:47:48",created_at:"2026-08-23 09:55:28"},{id:"745558ce-269b-4c5c-931f-7a3276364f29",title:"Sh. Yusuf Estes on Quran and Science",author:"Quran & Science",content:"Sh. Yusuf Estes supports Quran and Science website. where religion meets science.",source:"Quran and Science",original_url:"https://quranandscience.com/videos/359-sh-yusuf-estes-on-quran-and-science/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-26T19:59:43",created_at:"2026-08-23 09:55:28"},{id:"34126f1d-d153-4aac-99ea-299912b72579",title:"When her majesty speaks! \u201Cthe miracle of ants\u201D",author:"Quran & Science",content:`In a very distinctive story told by the holy Quran about the prophet Solomon and a group of ants, Quran stated that ants can speak to each others.
\u201CTill, when they came to the valley of the ants, one of the ants said: \u2018O ants! enter Your dwellings, lest Sulaim\xE2n (Solomon) and his hosts crush you, while they perceive not.\u2019 So He [Sulaim\xE2n (Solomon)] smiled, amused at her speech.\u201D (Quran 27:18-19)
This fact stated in Quran 1400 years ago. And for along time it was said that it is a big error in Quran how could ants speak?
However, the scientific world was astonished just in 2009 to discover and listen to ants talking to each others.
Watch this report from ABC news
Can this discovery prevent using insecticide in the future? Can we imitate the queen sound ordering the ants to leave this place?
This is crucial evidence that the knowledge conveyed by the Quranic verse has been revealed by Allah, Who knows the secrets of heaven and earth.`,source:"Quran and Science",original_url:"https://quranandscience.com/videos/358-when-her-majesty-speaks-the-miracle-of-ants/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-26T19:57:48",created_at:"2026-08-23 09:55:28"},{id:"5d095d34-2845-4209-8506-29bd0524650f",title:"Created by chance?",author:"Quran & Science",content:`Created by chance?

Or were they created by nothing, or were they the creators [of themselves]?
Or did they create the heavens and the earth (Cosmos)? Nay, but they have no firm Belief. (Quran 52:35-36)`,source:"Quran and Science",original_url:"https://quranandscience.com/videos/357-created-by-chance/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-26T19:48:18",created_at:"2026-08-23 09:55:28"},{id:"d9a4fa8e-fc5d-4a37-9202-12135037550b",title:"Is there a God Or only chance",author:"Quran & Science",content:`Is there a God Or only chance

According to physical information scientists are wondering how could this universe come to existence with this unimaginable fine tuning? Could this be by chance? or there is a God`,source:"Quran and Science",original_url:"https://quranandscience.com/videos/356-is-there-a-god-or-only-chance/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-26T19:46:27",created_at:"2026-08-23 09:55:28"},{id:"c1c1c086-5d29-496c-b92b-4c8158291528",title:"The origin of the universe, Stephen Hawking, Quran",author:"Quran & Science",content:`The origin of the universe, Stephen Hawking, Quran.
Stephen Hawking, speaks about the origin of the universe, he emphasis on the fact of expansion of the universe after the big bang. These facts were mentioned clearly in the holy Quran 1400 years ago proving its divine origin.`,source:"Quran and Science",original_url:"https://quranandscience.com/videos/360-the-origin-of-the-universe-stephen-hawking-quran/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-25T22:18:44",created_at:"2026-08-23 09:55:28"},{id:"31eb9c41-73b9-46bc-b28c-2bc4548c381a",title:"The Sea set on Fire",author:"Quran & Science",content:`(And by the sea kept filled or it will be fire kindled on the Day of Resurrection).

(Surat At-Tur (the Mount):6)

This Qur\u2019anic verse also comes in the context of an oath to emphasize the special significance of the subject matter by which the oath is given, as Allah (all glory be to Him) is definitely above the need to give such an oath. Now, what is the special significance of the ocean that is set on fire? Both water and fire were never thought to co-exist, as water quiches fire, and fire sets water to boiling and evaporation. How then can an ocean full of water be set on fire 7 Such contradiction has driven early commentators on the Glorious Qur\u2019an to suggest that this could only happen on the Last Day, depending on another Qur\u2019anic verse where such event is explicitly described

\u201CAnd when the seas become as blazing Fire or overflow.\u201D

(Surat At-Takwir (Wound Round and Lost its Light):6).

Nevertheless, the context in which the oath (And by the sea kept filled or it will be fire kindled on the Day of Resurrection).

\u201CAnd 5 preceding realities are all in our present-day world, and hence another linguistic meaning for the adjective \u201Cal-masjour\u201D other than ~~ set on fire\u201D was earnestly searched for. Of the linguistic meanings derived from such an adjective is \u201Cfull of water to a limit that does not allow any further transgression on the nearby continental masses\u201D which is correct, because the largest quantity of fresh water today (77% of all water on land) is entrapped in the form of ice on the two polar regions as well as in the form of ice-caps to highly elevated mountains. Such a great mass of ice only needs an increase of 4O~5O C above the average summer temperatures to melt, and in such case, this melt can raise the water level in present-day seas and oceans by more than 100 m, which is enough to drown most of the present-day plains where the current civilizations mostly flourish, Nevertheless, Earth Scientists have recently discovered that some of the present-day seas and oceans (such as both the Red Sea and the Arabian Sea, the Atlantic, Pacific and Indian Oceans) are actually set on fire, while others (such as the Mediterranean, the Black and the Caspian Seas) are not. As mentioned above, more than 64,000 km of mid-ocean ridges have \u2013 so far- been mapped around mid-ocean rift valleys.

These are basically composed of volcanic basaltic rocks that have been pouring out from the oceanic rift zones (at temperatures of about 1000 0C or even more, to build up the mid-oceanic ridges and spread laterally, constructing new slabs of the oceanic crust on both sides of the rift zones. Mid-oceanic volcanism evolves from fissure volcanism that emanates from the mid-oceanic rift systems where the oceanic crust is rifted and the opposite sides of the rift zone are pushed aside by the emanating magma.

Basaltic flows and eruptions, fed from elongated secondary magma chambers below the center of the mid-oceanic ridge, pour out along the ridge axis.

Sea-floor basalts from the surface of the oceanic crust, which is about 7 km thick (on the average) normally consist of: 0-1km of sediments (top) 1km of pillow lava basalts 5km of gabbro sills fed by dikes (bottom) Post-eruptive phenomena that can result from interaction of phereatic waters with buried hot rocks include the following:

1- Hot springs, which are formed when phreatic water is heated and mineralized in contact with hot rocks.

2- Geysers, which are periodic eruptions of boiling hot water (2000 C or even more) due to circulation with superheated waters at depth which are in direct or indirect contact with hot rocks (1000 0C or even more).

3- Fumaroles, which are gaseous exhalations of water vapour, C02, CO, SO2, H25, HCI, and HF (in order of abundance).

4- Solfataras, which are fumaroles rich in sulfur compounds. Most of the present-day oceanic volcanic activity has been going on for the past 20-30 million years, although some have persisted in their activity for 100 million years or even more (e.g. the Canary Islands). During such long periods of activity, some volcanoes have been carried away for several hundred kilometers from the constantly renewed plate edge. Completing such drifting activity, volcanic cones become out of reach of the magma body that used to feed them, and hence fade out and die. The current floor of the Pacific Ocean contains a great number of submerged, subdued volcanic craters (guyots), besides a large number of violently active volcanoes (e.g. the Ring of Fire). From the above-mentioned discussion it is obvious that all seas and oceans that experience sea-floor spreading are actually set on fire, while closing seas and oceans are not. Such fire is emanating from very hot basaltic flows and other magmatic activities pouring out from the rift valley systems that rupture the Earth\u2019s lithosphere.

Such ruptures run for tens of thousands of kilometers across the globe and in all directions to a depth of 65-150 km where it connects the extremely hot, plastic, semi-molten outermost mantle layer (Asthenosphere) with certain ocean bottoms that became actually set on fire.

This most striking fact of our planet was not known until the very late sixties and early seventies of this century.

The explicit Qur\u2019anic notion to such a very striking, but deeply hidden fact of our seas and oceans is a clear testimony that this Glorious Book cannot be but the word of The Creator, in its Divine purity.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/earth/355-the-sea-set-on-fire/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-25T17:20:20",created_at:"2026-08-23 09:55:28"},{id:"c46d182f-0e9b-444c-946f-34018e531da0",title:"Film Education prayer and ablution Part 2",author:"Quran & Science",content:"Film Education prayer and ablution Part 2",source:"Quran and Science",original_url:"https://quranandscience.com/videos/363-film-education-prayer-and-ablution-part-2/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-24T22:30:17",created_at:"2026-08-23 09:55:28"},{id:"4213b62f-7efd-49ae-aea1-c2e357471e9d",title:"Film Education prayer and ablution Part 1",author:"Quran & Science",content:"Film Education prayer and ablution Part 1",source:"Quran and Science",original_url:"https://quranandscience.com/videos/362-film-education-prayer-and-ablution-part-1/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-24T22:27:56",created_at:"2026-08-23 09:55:28"},{id:"8d91ec13-366c-404b-a2c0-5b6abe52206e",title:"Quran and Science",author:"Quran & Science",content:`Quran and Science
These are some scientists who have undergone a detailed study about quran in terms of science, as a result of their studies they found that there are so many scientific facts described in the quran which are discovered in late nineteenth century, so they confirm that these book is a revelation from the one true God.`,source:"Quran and Science",original_url:"https://quranandscience.com/videos/361-quran-and-science/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-24T22:22:18",created_at:"2026-08-23 09:55:28"},{id:"f719ada9-57c3-415c-9a3c-4fa00de359ec",title:"Tawaf \u201CCircumambulation\u201D is a cosmic law",author:"Quran & Science",content:`A pilgrim circumambulates the Ka\`bah as if he or she is a celestial body orbiting another greater body. Circumambulation of the Ka\`bah is to be performed counterclockwise.
Scientific discoveries have proved that we live in a huge universe that depends on revolution.
Earth rotates around itself counterclockwise.
Moon rotates around itself counterclockwise.
Moon is orbiting Earth counterclockwise.
Earth is orbiting Sun counterclockwise.
Sun rotates around itself counterclockwise.
Even sun orbits around the center of our galaxy \u201Cthe Milky way\u201D.
Here the cytoplasm of the living cell rotates counterclockwise.
And in the atoms electrons are orbiting the nucleus
This proves the truthfulness of the call of Islam that there is no god but Almighty Allah. Thus, Islam is the true religion that provides humankind with a comprehensive view in conformity with the divine truth that is apparent in the natural laws of the universe.`,source:"Quran and Science",original_url:"https://quranandscience.com/videos/364-tawaf-circumambulation-is-a-cosmic-law/",license:"Fair Use / Permitted Metadata",publication_date:"2017-02-23T22:34:23",created_at:"2026-08-23 09:55:28"},{id:"c7b3c376-b981-4890-8200-6acb5e5c1466",title:"Star Trek-like invisible shield found thousands of miles above Earth",author:"Quran & Science",content:`Quranic verse

\u201CAnd We made the sky a protected ceiling, but they, from its signs, are turning away.\u201D (Quran 21:32)

Scientific news

University of Colorado Boulder (November 26, 2014): Star Trek-like invisible shield found thousands of miles above Earth

A team led by the University of Colorado Boulder has discovered an invisible shield some 7,200 miles above Earth that blocks so-called \u201Ckiller electrons,\u201D which whip around the planet at near-light speed and have been known to threaten astronauts, fry satellites and degrade space systems during intense solar storms.

The barrier to the particle motion was discovered in the Van Allen radiation belts, two doughnut-shaped rings above Earth that are filled with high-energy electrons and protons, said Distinguished Professor Daniel Baker, director of CU-Boulder\u2019s Laboratory for Atmospheric and Space Physics (LASP). Held in place by Earth\u2019s magnetic field, the Van Allen radiation belts periodically swell and shrink in response to incoming energy disturbances from the sun.

As the first significant discovery of the space age, the Van Allen radiation belts were detected in 1958 by Professor James Van Allen and his team at the University of Iowa and were found to be comprised of an inner and outer belt extending up to 25,000 miles above Earth\u2019s surface. In 2013, Baker \u2014 who received his doctorate under Van Allen \u2014 led a team that used the twin Van Allen Probes launched by NASA in 2012 to discover a third, transient \u201Cstorage ring\u201D between the inner and outer Van Allen radiation belts that seems to come and go with the intensity of space weather.

The latest mystery revolves around an \u201Cextremely sharp\u201D boundary at the inner edge of the outer belt at roughly 7,200 miles in altitude that appears to block the ultrafast electrons from breeching the shield and moving deeper towards Earth\u2019s atmosphere.

\u201CIt\u2019s almost like theses electrons are running into a glass wall in space,\u201D said Baker, the study\u2019s lead author. \u201CSomewhat like the shields created by force fields on Star Trek that were used to repel alien weapons, we are seeing an invisible shield blocking these electrons. It\u2019s an extremely puzzling phenomenon.\u201D

A paper on the subject was published in the Nov. 27 issue of Nature.

The team originally thought the highly charged electrons, which are looping around Earth at more than 100,000 miles per second, would slowly drift downward into the upper atmosphere and gradually be wiped out by interactions with air molecules. But the impenetrable barrier seen by the twin Van Allen belt spacecraft stops the electrons before they get that far, said Baker.

The group looked at a number of scenarios that could create and maintain such a barrier. The team wondered if it might have to do with Earth\u2019s magnetic field lines, which trap and control protons and electrons, bouncing them between Earth\u2019s poles like beads on a string. The also looked at whether radio signals from human transmitters on Earth could be scattering the charged electrons at the barrier, preventing their downward motion. Neither explanation held scientific water, Baker said.

\u201CNature abhors strong gradients and generally finds ways to smooth them out, so we would expect some of the relativistic electrons to move inward and some outward,\u201D said Baker. \u201CIt\u2019s not obvious how the slow, gradual processes that should be involved in motion of these particles can conspire to create such a sharp, persistent boundary at this location in space.\u201D

Another scenario is that the giant cloud of cold, electrically charged gas called the plasmasphere, which begins about 600 miles above Earth and stretches thousands of miles into the outer Van Allen belt, is scattering the electrons at the boundary with low frequency, electromagnetic waves that create a plasmapheric \u201Chiss,\u201D said Baker. The hiss sounds like white noise when played over a speaker, he said.

While Baker said plasmaspheric hiss may play a role in the puzzling space barrier, he believes there is more to the story. \u201CI think the key here is to keep observing the region in exquisite detail, which we can do because of the powerful instruments on the Van Allen probes. If the sun really blasts the Earth\u2019s magnetosphere with a coronal mass ejection (CME), I suspect it will breach the shield for a period of time,\u201D said Baker, also a faculty member in the astrophysical and planetary sciences department.

\u201CIt\u2019s like looking at the phenomenon with new eyes, with a new set of instrumentation, which give us the detail to say, \u2018Yes, there is this hard, fast boundary,\u2019\u201D said John Foster, associate director of MIT\u2019s Haystack Observatory and a study co-author.

Other CU-Boulder study co-authors included Allison Jaynes, Vaughn Hoxie, Xinlin Li, Quintin Schiller, Lauren Blum and David Malaspina. Other co-authors were from UCLA, Aerospace Corp. Space Sciences Lab in Los Angeles, the University of Minnesota, NASA\u2019s Goddard Space Flight Center in Greenbelt, Maryland, the University of Iowa and the New Jersey Institute of Technology.

CU-Boulder is playing a prominent role in NASA\u2019s Van Allen Probes mission, which consists of two spinning, octagonal spacecraft weighing 1,500 pounds each. LASP developed the Relativistic Electron Proton Telescope, (REPT) to measure high-energy electrons. LASP also developed the \u201Cbrains\u201D of the Electronic Field and Waves package to compress huge amounts of mission data to send back to Earth. CU-Boulder will receive roughly $18 million from NASA over the lifetime of the mission.

About a dozen graduate students are participating in the mission, as well as more than a dozen other LASP personnel.

The Van Allen probes mission is part of NASA\u2019s Living with a Star Program managed by the Goddard Space Flight Center. The Johns Hopkins University Applied Physics Laboratory built the twin satellites and is managing the mission for NASA.`,source:"Quran and Science",original_url:"https://quranandscience.com/news-verses/353-star-trek-like-invisible-shield-found-thousands-of-miles-above-earth/",license:"Fair Use / Permitted Metadata",publication_date:"2014-11-26T11:54:00",created_at:"2026-08-23 09:55:28"},{id:"d0faf25a-6fb4-47cf-99ff-0ab18722a6b5",title:"QURANIC AND BIBLICAL VERSIONS",author:"Quran & Science",content:`MEETING THE REVEREND

One day, I was visiting the \u201CBible House\u201D in Johannesburg, South Africa. Whilst browsing through the stacks of Bibles and religious books, I picked up an Indonesian Bible and had just taken in hand a Greek/English New Testament \u2013 a large, expensive volume.

I had not realised that I was being observed by the supervisor of the Bible House. Casually, he walked up to me. Perhaps my bread and my Muslim headgear were an attraction and a challenge? He enquired about my interest in that costly volume. I explained that as a student of comparative religion, I had need for such a book. He invited me to have tea with him in his office. It was very kind of him and I accepted.

Over the cup of tea, I explained to him the Muslim belief in Jesus. I explained to him the very high position that Jesus (pbuh) occupied in the House of Islam. He seemed sceptical about what I said. I was amazed at his seeming ignorance, because only retired Reverend gentlemen can become Supervisors of BIBLE HOUSES in South Africa. I began reciting from verse 42 of Sura 3 -first in Arabic then in English.

BEHOLD! THE ANGELS SAID: \u201CO MARY! ALLAH HATH CHOSEN THEE\u2026

I wanted the Reverend to listen, not only to the meaning of the Quran, but also to the music of its cadences when the original Arabic was recited. Rev.Dunkers (for that was his name) sat back and listened with rapt attention to Allah\u2019s Kalaam (God\u2019s Word). When I reached the end of verse 49, the Reverend commented that the Quranic message was like that of his own Bible. He said, he saw no difference between what he believed as a Christian, and what I had read to him. I said: \u201Cthat was true\u201D. If he had come across these verses in the English language alone without their Arabic equivalent, side by side, he would not have been able to guess in a hundred years that he was reading the Holy Quran. If he were a Protestant he would have thought that he was reading the Roman Catholic Version, if he had not seen one, or the Jehovah\u2019s Witness Version or the Greek Orthodox Version, or the hundred and one other versions that he might not have seen; but he would never have quessed that he was reading the Holy Quran The Christian would be reading here, in the Quran, everything he wanted to hear about Jesus, but in a most noble, elevated and sublime language. He could not help being moved by it. In these eight terse verses from 42 to 49 we are told:

CHALK AND CHEESE

The most fervent Christian cannot take exception to a single statement or word here. But the difference between the Biblical and the Quranic narratives is that between \u201Cchalk and cheese\u201D!

\u201CTo me they are identical, what is the difference?\u201D the Reverend asked. I know that in their essentials both the stories agree in their details, but when we scrutinise them closely we will discover that the difference between them is staggering.

Now compare the miraculous conception as announced in verse 47 of the Holy Quran with what the Holy Bible says:

\u201CNow the birth of Jesus Christ was in this wise: When as his mother Mary was espoused to Joseph, BEFORE THEY CAME TOGETHER, (as husband and wife) she was found with child OF THE HOLY GHOST.\u201D

Mathew 1:18

MASTER DRAMATISER

The eminent Billy Graham from the United States of America dramatised this verse in front of 40,000 people in King Park, Durban \u2013 with his index finger sticking out and swinging his outstretched arm from right to left, he said, \u201CAnd the Holy Ghost came and impregnated Mary!\u201D On the other hand St.Luke tells us the very same thing but less crudely.He says that when the annunciation was made, Mary was perturbed. Her natural reaction was \u2013

\u201C\u2026How shall this be, seeing I know not a man?\u201D -meaning sexually.

The Quranic narrative is:

SHE SAID: \u201CO MY LORD! HOW SHALL I HAVE A SON WHEN NO MAN HATH TOUCHED ME?\u201D -meaning sexually.

Holy Quran 3:47

In essence there is no difference between these two statements \u201Cseeing I know not a man\u201D and \u201Cwhen no man hath touched me\u201D. Both the quotations have an identical meaning. It is simply a choice of different words meaning the same thing. But the respective replies to Mary\u2019s plea in the two Books (the Quran and the Bible) are revealing.

THE BIBLICAL VERSION

Says the Bible:

And the angel answered and said unto her, \u201CThe Holy Ghost shall COME UPON THEE, and the power of the Highest shall OVERSHADOW THEE\u201D

Can\u2019t you see that you are giving the atheist, the sceptic, the agnostic a stick to beat you with? They may well ask- \u201CHow did the Holy Ghost come upon Mary?\u201D \u201CHow did the Highest over shadow her? We know that literally it does not mean that: that it was an immaculate conception, but the language used here, is distasteful-gutter language-you agree!? Now contrast this with the language of the Quran.

THE QURANIC VERSION

HE SAID:(the angel says in reply) \u201CEVEN SO: ALLAH CREATETH WHAT HE WILLETH: WHEN HE HATH DECREED A PLAN, HE BUT SAITH TO IT, \u2018BE\u2019, AND IT IS!\u201D

Holy Quran 3:47

This is the Muslim concept of the birth of Jesus. For God to create a Jesus, without a human father, He merely has to will it. If He wants to create a million Jesus\u2019 without fathers or mothers, He merely has to will them into existence. He does not have to take seeds and transfer them, like men or animals \u2013 by contact or artificial insemination. He wills everything into being by His word of command \u201CBE\u201D and \u201CIT IS\u201D.

There is nothing new in what I am telling you, I reminded the Reverend. It is in the very first Book of your Holy Bible \u2013 Genesis 1:3 \u201CAnd God said \u2026\u201D What did He SAY? He SAID \u2013 \u201CBE\u201D and \u201CIT WAS!\u201D He did not have to articulate the words. This is our way of understanding the word \u2018BE\u2019-that He willed everything into being.

CHOICE FOR HIS DAUGHTER

\u201CBetween these two versions of the birth of Jesus (pbuh) \u2013 the Quranic version and the Biblical version \u2013 which would you prefer to give your daughter?\u201D I asked the supervisor of the Bible House. He bowed his head down in humility and admitted \u2013 \u201CTHE QURANIC VERSION.\u201D How can \u201Ca forgery\u201D or \u201Can imitation\u201D (as it is alleged of the Quran) be better than the genuine, the original (as it is claimed for the Bible)? It can never be, unless this Revelation to Muhummed (pbuh) is what it, itself, claims to be viz. the pure and holy Word of God! There are a hundred different tests that the unprejudiced seeker after truth can apply to the Holy Quran and it will qualify with flying colours to being a Message from on High.

Does the miraculous birth of Jesus make him a God or a \u201Cbegotten\u201D son of God? No! Says the Holy Quran:

THE SIMILITUDE OF JESUS BEFORE GOD IS THAT OF ADAM; HE CREATED HIM FROM DUST, THEN SAID TO HIM: \u2018BE\u2019:AND HE WAS.

HOLY QURAN 3:59

\u201CAfter a description of the high position which Jesus occupies as a Prophet, (In the preceding verses) we have a repudiation of the dogma that he was God, or the son of God, or anything more than man. If it is said that he was born without a human father, Adam was also so born. Indeed Adam was born without either a human father or mother. As far as our physical bodies are concerned they are mere dust.

In God\u2019s sight Jesus was as dust just as Adam was or humanity is. The greatness of Jesus arose from the divine command \u201CBe\u201D. for after that he was \u2013 more than dust \u2013 a great spititual leader and teacher.\u201D

A.Yusuf Ali\u2019s note 398 to verse 59 above.

The logic of it is that, if being born without a male parent entitles Jesus to being equated with God, then, Adam would have a greater right to such honour, and this no Christian would readily concede. Thus, the Muslim is made to repudiate the Christian blasphemy.

Further, if the Christian splits hairs by arguing that Adam was \u201Ccreated from the dust of the ground, whereas Jesus was immaculately \u201Cbegotten\u201Din the womb of Mary, then let us remind him that, even according to his own false standards. there is yet another person greater than Jesus, in his own Bible. Who is this superman?

PAUL\u2019S INNOVATION

\u201CFOR THIS MELCHISEDEC, KING OF SALEM, PRIEST OF THE MOST HIGH GOD\u2026.\u201D \u201CWithout father, without mother, without descent, having NEITHER BEGINNING of days, NOR END of life\u2026\u201D

HEBREWS 7:1&3

Here is a candidate for Divinity itself, for only God Almighty could possess these qualities. Adam had a beginning (in the garden), Jesus had a beginning (in the stable); Adam had an end and, claim the Christians, so had Jesus \u201Cand he gave up the ghost\u201D. But where is Melchisedec? Perhaps he is hibernating somewhere like Rip Van Winkel.

And what is this \u201CHebrews\u201D? It is the name of one of the Books of the Holy Bible, authored by the gallent St.Paul,the self appointed thirteenth apostle of Christ. Jesus had twelve apostles, but one of them (Judas) had the Devil in him. So the vacancy had to be filled, because of the \u201Ctwelve thrones in heaven which had to be occupied by his disciples to judge the children of Israel (Luke 22:30).

Saul was a renegade Jew, and the Christians changed his name to \u201CPaul\u201D, probably because \u201CSaul\u201D sounds Jewish. This Paul made such a fine mess of the teachings of Jesus (pbuh) that he earned for himself the second- most -coveted position of \u201CThe Most Influential Men of History\u201D in the monumental work of Michael H.Hart. \u201CThe 100\u201D or \u201CThe Top Hundred\u201D or the \u201CGreatest Hundred in History\u201D. Paul outclasses even Jesus because, according to Michael Hart, Paul was the real founder of present-day Christianity. The honour of creating Christianity had to be shared between Paul and Jesus, and Paul won because he wrote more Books of the Bible than any other single author, whereas Jesus did not wirte a single word.

Paul needed no inspiration to write his hyperboles here and in the rest of his Epistles. Did not Hitler\u2019s Minister of Propaganda \u2013 Goebbels \u2013 say \u201CThe bigger the lie the more likely it is to be believed\u201D? But the amazing thing about this exaggeration is that no Christian seems to have read it. Every learned man to whom I have shown this verse to, seemed to be seeing it for the first time. They appear dumbfounded, as described by the fitting words of Jesus:

\u201C\u2026seeing they see not, and hearing they hear not, neither do they understand.\u201D

Mathew 13:13

The Holy Quran also contains a verse which fittingly describes this well cultivated sickness \u2013

DEAF, DUMB AND BLIND, THEY WILL NOT RETURN (TO THE PATH).

Holy Quran 2:18

THE SONS OF GOD

The Muslim takes strong exception to the Christian dogma that \u201CJesus is the only begotten son, begotten not made\u201D. This is what the Christian is made to repeat from childhood in his catechism. I have asked learned \u2013 Christians, again and again as to what they are really trying to emphasise, when they say \u201CBEGOTTEN NOT MADE\u201D.

They know that according to their own God-given (?!) records, God has sons by the tons:

\u201C\u2026.Adam, which was the SON OF GOD.\u201D

\u201CThat the SONS OF GOD saw the daughters of men that they were fair\u2026\u201D \u201CAnd when the SONS OF GOD came in unto the daughters of men, and they bare children to them\u2026.\u201D

Genesis 6:2&4

\u201C\u2026Israel is MY SON, even my firstborn:\u201D

Exodus 4:22

\u201C\u2026for I (God) and a FATHER to Israel, and Ephraim is my firstborn.\u201D

Jeremiah 31:9

\u201C\u2026the Lord hath said unto me, (David) Thou art MY SON: this day have I BEGOTTEN thee.\u201D

\u201CFor as many as are led by the Spirit of God, they are the SONS OF GOD.\u201D

Romans 8:14

Can\u2019t you see that in the language of the Jew, every righteous person, every Tom, Dick and Harry who followed the Will and Plan of God, was a SON OF GOD. It was a metaphorical descriptive term, commonly used among the Jews. The Christian agrees with this reasoning, but goes on to say \u2013 \u201Cbut Jesus was not like that\u201D. Adam was made by God. Every living thing was made by God; He is the Lord, Cherisher and Sustainer of all. Metaphorically speaking therefore God is the Father of all. But Jesus was the \u201CBEGOTTEN\u201D son of God, not a CREATED son of God?

BEGOTTEN MEANS \u201CSIRED\u201D

In my forty years of practical experience in talking to learned Christians, not a single one has opened his mouth to hazard an explanation of the phrase \u2013 \u201Cbegotten not made\u201D. It had to be an American who dared to explain. He said, \u201CIt means, sired by God.\u201D \u201CWhat?\u201D I exploded. \u201CSIRED- by God?\u201D \u2013 \u201CNO, no,\u201D he said, \u201CI am only trying to explain the meaning, I do not believe that God really sired a son.\u201D

The sensible Christian says that the words do not literally mean what they say. Then why do you say it? Why are you creating unnecessary conflict between the 1,200,000,000 Christians and a thousand million Muslim of the world in making senseless statements?

REASON FOR OBJECTION

The Muslim takes exception to the word \u201Cbegotten\u201D, because begetting is an animal act, belonging to the lower animal functions of sex. How can we attribute such a lowly capacity to God? Metaphorically we are all the children of God \u2013 the good and the bad \u2013 and Jesus (pbuh) would be closer to being the son of God than any one of us, because he would be more faithful to God than any one of us, because he would be more faithful to God than any one of us can ever be. From that point of view he is preeminently the son of God.

Although this pernicious word \u201Cbegotten\u201D has now unceremoniously been thrown out of the \u201CMOST ACCURATE\u201D version of the Bible \u2013 the R.S.V. its ghost still lingers on in the Christian mind, both black and white. Through its insidious brainwashing the white man is made to feel superior to his black Christian brother of the same Church and Denomination. And in turn, the Black man is given a permanent inferiority complex through this dogma.

BRAIN-WASHED INFERIORITY

The human mind can\u2019t help reasoning that since the \u201Cbegotten son\u201D of an African will look like an African, and that of a Chinaman as a Chinese, and that of an Indian like an Indian: so the begotten son of God aught naturally to look like God. Billions of beautiful pictures and replicas of this \u201CONLY BEGOTTEN SON\u201D(?) of God are put in peoples hands. He looks like a European with blonde hair, blue eyes and handsome features \u2013 like the one I saw in the \u201CKing of Kings\u201D or \u201CThe Day of Triumph\u201D or \u201CJesus of Nazareth\u201D Remember jeffrey Hunter? The \u201CSAVIOUR\u201D of the Christian is more like a German than a jew with his polly nose. So naturally, if the son is a White man, the father would also be a White man (God?). Hence the darker skinned races of the earth subconsciously have the feeling of inferiority ingrained in their souls as God\u2019s STEP-CHILDREN. No amount to face-creams, skin-lighteners and hair-straighteners will erase the inferiority.`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/quran-on-jesus/348-quranic-and-biblical-versions/",license:"Fair Use / Permitted Metadata",publication_date:"2014-08-26T13:10:30",created_at:"2026-08-23 09:55:28"},{id:"01304462-b240-4d91-ab59-02670b2ca70a",title:"The Marriages of Prophet Muhammad",author:"Quran & Science",content:`The prophet Muhammad was a religious and political figure whose mission was to unite the various tribes of the Arabian peninsula specifically, and the whole world generally, under one religion.\xA0 As an example for the world to follow, the life and decisions of the Prophet Muhammad are those from which much benefit and wisdom may be drawn.

From the time of revelation, the Prophet lived a life under the direct supervision of the Creator.\xA0 Thus he was under protection of God from committing any error in portraying the religion and correct way of life.\xA0 His each and every action is one which ought to be emulated, as God himself said about him:

\u201CIndeed you are upon a high moral standard of character.\u201D

The Prophet was a man bent upon a mission, and his concerns were not those of other ordinary humans.\xA0 For these reasons, one must look into the reasoning why the Prophet took certain decisions during the course of his life.\xA0 Though some of them may seem easily applicable, others may be unfamiliar to this day and age.\xA0 Consequently, taking things from his life at face value may lead one to draw false conclusions without any basis or evidence.

One of those facets of the life of the Prophet which is often misunderstood, or quite frankly misconstrued, is the fact that he had contracted a number of marriages in the course of his lifetime.\xA0 In order to understand the wisdom in this, one must do a case study of the various factors which surrounded this decision.\xA0 Only then can a proper conclusion be made based upon them.

The domestic life of the Prophet can be divided into four stages.

The First Stage

The first twenty five years of his life were a period of celibacy. \xA0Youth is normally the stage of life when people get reckless, when the passions stirred in adolescence run wild because self-control is not yet learnt. \xA0Moreover, at the period of time he lived in, Arab society did not restrict sexual relations. \xA0Yet, he led a chaste, pure life earning him the title of \u2018Ameen,\u2019 \u2018the trustworthy.\u2019 \xA0A man who can control himself as a young adult is much more likely to keep self control in old age.

The Second Stage

When he eventually married, it was not to a young virgin, junior to him.\xA0 Instead, after spending 25 celibate years, his first wife, Khadeejah, was 40 years of age and married twice before. \xA0They stayed happily married for twenty five years until she died, and he did not marry anyone else during that period. \xA0After he received the first revelation, she was the first person to believe in him as a Prophet of God. \xA0Can there be a greater testimony than a wife fifteen years older than her husband being the first one to believe in his calling?

He also had every reason to marry another wife while he was married to her:

First, although she gave him three daughters, Khadeejah did not bear him any male children who survived infancy.\xA0 In a society that practiced female infanticide due to their preference for male infants, this was indeed a hard trial.\xA0 His adversaries even jeered at him after the death of his second son.\xA0 God, however, repudiated them,

\u201CSurely he that insults you will himself remain childless.\u201D (Quran 108:3)

Second, he was an extraordinarily handsome man. \xA0One of his companions described him,

\u2018I began to look at him and at the moon, he was wearing a red mantle, and he appeared to be more beautiful than the moon to me.\u2019 Al-Tirmidhi

Third, polygamy was widespread and socially acceptable to women at the time. \xA0There were no social barriers preventing him from taking another wife. \xA0He could have easily married a younger, more beautiful, woman had he so chosen, but he did not. \xA0Furthermore, when pressured to remarry after Khadeejah\u2019s death, he chose another widow.

Fourth, the pagans of Mecca offered him wealth, trappings of gold and silver, leadership, and even marriage to their most beautiful women only if he would stop preaching; but he refused.\xA0 He said,

\u201CEven if they set against me the sun on my right and the moon on my left, I will not abandon my purpose until God grants me success or until I die.\u201D Al-Serah Al-Nabaweyyah, Ibn Hesham, vol. 1, pp. 265-266

Could this be the reply of a man given to the call of his flesh, or one given to the call of God?

The Third Stage

After passing the prime of his life (physically), he contracted marriages to more than one wife from the period 2 A.H. \u2013 7 A.H. (623-628 CE). \xA0This happened between the ages of 55 and 60, and all of the marriages were contracted for unselfish reasons. \xA0These were years of wars for the nascent Muslim nation, when Muslims had to fight in self-defense to protect their lives and the religion. \xA0Consequently, hundreds of his companions were killed, leaving behind widows and orphans without anyone left to care for them. \xA0Prophet Muhammad set an example for the surviving companions to remarry the widows in order to support them, so most of his wives were widows. \xA0If sheer lust was the motive, the choice would not have been widows or divorcees.

The Prophet Muhammad did marry one virgin, Aisha, who was very young.\xA0 This marriage is the one that causes the most controversy among critics who impute immorality in the character of the Prophet due to this. He married her on the request of her father, Abu Bakr, who was his closest and earliest follower outside the family.\xA0 Abu Bakr was the first among the companions in the Prophet\u2019s esteem, and his most trusted ally.\xA0 With him he shared the dangerous flight to Medina.\xA0 Why would he gratuitously offend such an ally by refusing his request? \xA0Aisha is also the source of much of what we know of the Prophet\u2019s Sunnah, without which the legacy left by him would be so much poorer. \xA0Also, the Prophet was fulfilling a commandment of God, which is to marry those who are ready to marry as soon as they are ready. \xA0The consummation, or full wedding (nikah), was three years after the contractual arrangement (engagement), when she was fully mature.\xA0 As a child, she lived in her father\u2019s house, where Muhammad would visit, often joining in with her play with dolls.

Another reason behind his marriages was to cement alliances.\xA0 By marrying into the families of key allies and vanquished enemies, he laid the ground work for cooperation between Muslims of different tribes.\xA0 None of the wives the Prophet married after Aisha compared with her in youth, intelligence or desire to learn, but all of them contributed in other ways to the stability of the Muslim nation. \xA0Such a man was a master, not slave, of his passions. \xA0His marriages point to farsighted planning and compassionate interest. \xA0If it was not for this compassion, he would have definitely have chosen, besides Aisha, others similar to her rather than widows or divorcees to be his wives!`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/fakes-about-islam/347-the-marriages-of-prophet-muhammad/",license:"Fair Use / Permitted Metadata",publication_date:"2014-08-25T16:30:52",created_at:"2026-08-23 09:55:28"},{id:"73eea865-9af9-4992-809d-8aae8f7c1dbc",title:"The Bravery and Strength of the Prophet",author:"Quran & Science",content:`The prophet, sallallaahu \u2018alayhi wa sallam, was the bravest of people and had the most firm heart, and no other creature could matche him in his self-control and strength of heart and body.

he was uniquely brave and the traits of bravery and courage reached perfection in him.

he was not only the bravest on the battlefields and in fighting, but he possessed moral bravery as well which clearly appeared when he conversed with and addressed the prominent figures of his society at a very tender age before allaah the almighty honored him with receiving revelation.

His bravery was also practically manifested when he openly declared the truth and never feared the rebuke of anyone for the sake of allaah the almighty.

Additionally, he would publicly declare his hatred of the false idols of his people, and belittle them without paying attention to their anger or denunciation. [abu nu\u2018aym in dalaa\u2019il an- nubuwwah, ibn sa\u2018d in at-tabaqaat, ibn katheer in as-seerah an-nabawiyyah and al-albaani in saheeh sunan at-tirmithi]

When allaah the almighty honored him by receiving revelation, he declared the call of islam publicly with unique bravery despite people\u2019s severe assaults, harm and threats.

Just like his moral bravery, his bravery in fighting also appeared plainly at a tender age. he participated with his tribe in the war of al-fijaar, protecting them from the arrows of their enemies whenever they shot them.

After he received the revelation and allaah the almighty permitted him to fight in his cause, jihaad was ordained and he gave the best example in bravery on the battlefield. brave heroes would flee when they faced him in battle while he was as firm as the mountains, always advancing, never retreating or yeilding. he was the only brave man about whom no single incident of fleeing the battlefield or losing a duel was recorded. it was narrated that the prophet, sallallaahu \u2018alayhi wa sallam, said: \u201Cby him in whose hands my life is, were it not for some men among the believers who dislike to be left behind me and for whom i cannot provide with means of conveyance, i would certainly never remain behind any sariyyah (army-unit) setting out in the cause of allaah. by him in whose hands my life is, i would love to be killed in the cause of allaah and then live and then be killed, and then live and then be killed and then live and then be killed.\u201D [al-bukhaari and muslim]

In the battle of badr, he, sallallaahu \u2018alayhi wa sallam, led the battle himself and experienced death with his honorable soul. His face was wounded, his lower right incisor was broken, [al-bukhaari and muslim] and seventy of his companions were killed, yet he never weakened or faltered.

He never feared threats, tough situations, or crises. he put his full trust in his lord and depended on him. he accepted the decrees of his lord, was satisfied with his cupport and trusted in his promise. it was narrated that anas, may allaah be pleased with him, said, \u201Cthe prophet, sallallaahu \u2018alayhi wa sallam, was the best, the most generous and the bravest of people.\u201D [al- bukhaari and muslim]

It was also narrated that \u2018abdullaah ibn \u2018umar, may allaah be pleased with him and his father, said, \u201CI have never seen someone who is braver, more generous, more courageous, more radiant or more handsome than the messenger of allaah, sallallaahu \u2018alayhi wa sallam.\u201D [ad-daarimi]

The prophet, sallallaahu \u2018alayhi wa sallam, fearlessly engaged in fighting, exposing himself to great danger and offering himself to death. he never ran away from the battlefield and never took a single step backwards. when the fighting became heated, swords were brandished, spears were poised, heads were falling and the cup of death was going round, he, at these moments, would be the nearest to danger and his companions would shield themselves behind him.

He never paid heed to the number of his enemies no matter how numerous or powerful they were. rather, he would straighten the rows of the soldiers, encourage them, and be at the front of the battalions.

It was narrated that al-baraa\u2019, may allaah be pleased with him, said describing the bravery of the prophet, sallallaahu \u2018alayhi wa sallam, \u201Cwhen the battle grew fierce, we, by allaah, would seek protection behind him, and the bravest among us was the one who would be next to him in battle.\u201D [Muslim]

Moreover, the brave warrior and renowned hero, \u2018Ali ibn Abi Taalib, may allaah be pleased with him, said describing the prophet, sallallaahu \u2018alayhi wa sallam, \u201Cwhen the battle grew fierce between the two sides, we used to resort to the prophet, sallallaahu \u2018alayhi wa sallam, for succor. he was always the closest to the enemy.\u201D [Ahmad]

On the day of hunayn, the muslims retreated towards the prophet, sallallaahu \u2018alayhi wa sallam, while he was riding his white mule and his uncle al-\u2018abbaas was holding its reins, endeavoring to make it slow down. the enemy gathered around him, but he did not flee. rather,

He dismounted while saying loudly: \u201CI am the prophet, and this is no lie; i am the son of \u2018Abdul Muttalib.\u201D [Al-bukhaari and Muslim] it is as if he was challenging them and telling them where he was.

His chest was exposed to swords and spears. Heroes were falling and fighters were slain before his eyes, yet he remained steadfast and firm. such was the unparalleled and matchless bravery of the prophet, sallallaahu \u2018alayhi wa sallam. in fact, it was an ideal example of bravery for all people to learn.

The prophet, sallallaahu \u2018alayhi wa sallam, was quick at facing danger. one night, the people of Madeenah heard a strange noise which frightened them. some people set forth in the direction of the sound when they saw the messenger of allaah, sallallaahu \u2018alayhi wa sallam, already on his way back after having investigated the source of the noise. he was riding an unsaddled horse belonging to Abu talhah, may Allaah be pleased with him, and a sword was hanging around his neck, and he was saying: \u201Cdo not be afraid! do not be afraid!\u201D [Al-bukhaari and Muslim]

What courage! the prophet, sallallaahu alayhi wa sallam, went out alone to face potential danger before any one else moved, which is a difficult thing to do, even for the brave.

In the battle of al-khandaq (trench), the confederates gathered together from everywhere against the prophet, sallallaahu \u2018alayhi wa sallam.

Muslims were besieged and found themselves in a stressful predicament. the hearts reached the throats from intense fear and terror. the believers were shaken mightily.

The prophet, sallallaahu \u2018alayhi wa sallam, kept on praying and invoking his lord, seeking his help until allaah the almighty gave him victory by sending angels and an intensely cold wind against the confederates, and so they departed, humiliated and defeated.

As a matter of fact, all of the battles of the prophet, sallallaahu \u2018alayhi wa sallam, that were recorded in history and authentic narrations described his bravery and chivalry in fighting the disbelievers, polytheists and jews \u2013 of which we have only mentioned a few \u2013 and they act as clear-cut evidence of the courage and the bravery of the prophet, sallallaahu \u2018alayhi wa sallam.

He, sallallaahu \u2018alayhi wa sallam, never feared the rebuke of anyone for the sake of allaah the almighty. he, sallallaahu \u2018alayhi wa sallam, never feared anyone other than allaah the almighty. he sacrificed his soul and spent his wealth for the sake of raising high the word of allaah the almighty (to make people worship allaah the almighty alone) and to establish the truth and abolish falsehood.

Thus, allaah the almighty made him realize what he aimed and strived for. he made him victorious, honored him and made his religion dominant over all other religions.

In fact, if bravery is ever mentioned, then mentioning the example of the prophet, sallallaahu \u2018alayhi wa sallam, is a must. if courage and heroism are mentioned, then mentioning the example of the prophet, sallallaahu \u2018alayhi wa sallam, is an obligation.

The prophet, sallallaahu \u2018alayhi wa sallam, was also given great physical strength: his strength equaled that of thirty men.

It was narrated that the prophet, sallallaahu \u2018alayhi wa sallam, would visit all his wives in a round during the day and night and they were eleven in number. anas, may allaah be pleased with him, was asked, \u201Chad the prophet, sallallaahu \u2018alayhi wa sallam, the strength for it?\u201D he replied, \u201Cwe would say that the prophet, sallallaahu \u2018alayhi wa sallam, was given the strength of thirty (men).\u201D [al-bukhaari and muslim]

Rukaanah, may allaah be pleased with him, who was a skillful wrestler and was never defeated before he met the prophet, sallallaahu \u2018alayhi wa sallam, said that once the prophet, sallallaahu \u2018alayhi wa sallam, met him in one of the mountain paths of makkah, whereupon he said to him:

\u201CoRukaanah, will you not fear allaah and accept what i am calling you to?\u201D rukaanah replied, \u201Cif you can prove that you are a true messenger, i will follow you.\u201D so the prophet, sallallaahu \u2018alayhi wa sallam, said: \u201Cwhat would you say if i wrestle you down? will that make you believe that i am a true prophet?\u201D the man replied, \u201Cyes.\u201D then the prophet, sallallaahu \u2018alayhi wa sallam, said: \u201Ccome on, i will wrestle you.\u201D the prophet, sallallaahu \u2018alayhi wa sallam, wrestled him and defeated him.

rukaanah, may allaah be pleased with him, was astonished, and so he asked the prophet, sallallaahu \u2018alayhi wa sallam, for a rematch. so they had a rematch where the prophet, sallallaahu \u2018alayhi wa sallam, defeated him again. rukaanah was astonished and said, \u201Co muhammad, by allaah, this is really amazing! did you really wrestle me to the ground?\u201D4 the prophet, sallallaahu \u2018alayhi wa sallam, defeated him thrice and every time for a hundred sheep.

At the third time, rukaanah said, \u201Cno one has been able to wrestle me to the ground except you and you were the most hateful person to me. i bear witness that there is nothing worthy of worship except allaah and that you are his messenger. the messenger of allaah let go of him and gave him back his sheep.\u201D [ibn katheer in as-seerah an-nabawiyyah]

The bravery and great power of the prophet, sallallaahu \u2018alayhi wa sallam, was never the bravery of rashness nor the power of violence. rather, it was bravery controlled by reason and power combined with mercy. he never used them except in fighting in the cause of allaah the almighty.

The messenger of allaah, sallallaahu \u2018alayhi wa sallam, never beat anyone with his hand, neither a woman nor a servant, unless in the case when he would be fighting in the cause of allaah the almighty.

It was narrated that \u2018aa\u2019ishah, may allaah be pleased with her, said, \u201Che, sallallaahu \u2018alayhi wa sallam, never took revenge for his own sake but (he did) only when the sanctities of allaah the almighty were violated in which case he would take revenge for the sake of allaah the almighty.\u201D [al-bukhaari and muslim]

She, may allaah be pleased with her, also said, \u201Cthe messenger of allaah, sallallaahu \u2018alayhi wa sallam, never beat a servant or a woman, and he never beat anyone with his hand, except when he was fighting in the cause of allaah the almighty.\u201D [al-bukhaari and muslim]

Allaah the almighty, the most truthful says (what means) describing him: {and indeed, you are of a great moral character.} [quran 68:4]`,source:"Quran and Science",original_url:"https://quranandscience.com/prophet-muhammad/his-characteristics/346-the-bravery-and-strength-of-the-prophet/",license:"Fair Use / Permitted Metadata",publication_date:"2014-06-09T15:50:19",created_at:"2026-08-23 09:55:28"},{id:"c9b788d5-3591-4025-9442-032926827427",title:"Allah Has Power Over Everything",author:"Quran & Science",content:`Allah, the Creator of everything, is the sole possessor of all beings.

It is Allah Who heaps up the heavy clouds, heats and brightens the Earth, varies the direction of the winds, holds birds suspended up in the sky, splits the seed, makes a man\u2019s heart beat, ordains photosynthesis in plants, and keeps planets in their separate orbits.

People generally surmise that such phenomena occur according to \u201Cthe laws of physics,\u201D \u201Cgravity,\u201D \u201Caerodynamics,\u201D or other physical factors; however, there is one significant truth these people ignore: all such physical laws were created by Allah, the only possessor of power in the universe.

Allah rules all the systems at any moment in the universe, regardless of whether we are aware of them, or if we are asleep, sitting, walking. Each of the myriad of processes in the universe, all essential to our existence, is under Allah\u2019s control. Even our ability to just take a small step forward depends on Allah\u2019s creation in countless minute details, including Earth\u2019s force of gravity, the structure of the human skeleton, the nervous system and muscular system, the brain, the heart, and even the rotation speed of the Earth.

Planed and Decreed

Attributing the existence of the world and of the entire universe to sheer coincidence is complete delusion. The exquisite order of the Earth and the universe completely contradicts the possibility of formation through coincidence, and is, rather, a clear sign of Allah\u2019s infinite might.

For instance, the Earth\u2019s orbit around the Sun deviates only 2.8 mm in every 29 km from the right path. If this deviation were 0.3 mm longer or shorter, then living beings all over the Earth would either freeze or be scorched. While it is virtually impossible for even a marble to revolve in the same orbit without any deviation, the Earth accomplishes such a course despite its gigantic mass:

\u201C\u2026Allah has appointed a measure for all things\u2026\u201D (At-Talaq, 65: 3).

In effect, the splendid order in the universe is maintained as a result of fantastic systems that depend on highly delicate equilibriums.

Some people hold the perverted belief that Allah \u201Ccreated everything and then left them on their own.\u201D However, any event, taking place in any area of the universe, occurs solely by Allah\u2019s Will, and under His control:

\u201CDo you not know that Allah knows everything in heaven and Earth? That is in a Book. That is easy for Allah.\u201D (Al-Hajj, 22: 70)

It is very important to grasp this fact for someone who strives to come near to Allah. The prayer of Prophet Muhammad, peace be upon him, quoted below is a very good example of this:

\u201CO Allah: All the Praises are for You: You are the Lord of the Heavens and the Earth. All the Praises are for You;

You are the Maintainer of the Heaven and the Earth and whatever is in them. All the Praises are for You;

You are the Light of the Heavens and the Earth. Your Word is the Truth, and Your Promise is the Truth, and the Meeting with You is the Truth, and Paradise is the Truth, and the (Hell) Fire is the Truth, and the Hour is the Truth.

O Allah! I surrender myself to You, and I believe in You and I depend upon You, and I repent to You and with You (Your evidences) I stand against my opponents, and to you I leave the judgment (for those who refuse my message).

O Allah! Forgive me my sins that I did in the past or will do in the future, and also the sins I did in secret or in public. You are my only God (Whom I worship) and there is no other God for me (i.e. I worship none but You).\u201D (Al-Bukhari)

Yourself an Example

Elaborate processes taking place in the bodies of living things are impressive examples that help us to grasp Allah\u2019s might. For instance, at every moment, your kidneys filter your blood and extricate those harmful molecules to be excreted from the body.

This screening and elimination process, which can be carried out by a single kidney cell, can only be accomplished by a giant haemodialyser (artificial kidney). A haemodialyser was consciously designed by scientists. A kidney, however, does not sense, or have a decision-making centre, nor the faculty of thought. In other words, an unconscious kidney cell can accomplish tasks that otherwise demand an elaborate thinking process.

It is possible to encounter millions of such examples in living beings. Molecules, composed of unconscious matter, perform tasks so remarkable they would otherwise suggest consciousness. The consciousness apparent in these cases though is, of course, of Allah\u2019s infinite wisdom and knowledge. It is Allah Who created the kidney cells, as well as the molecules discussed, and Who orders them to accomplish their respective tasks. In the Qur\u2019an, Allah informs us that He constantly sends down \u201Ccommands\u201D to the beings He created:

\u201CIt is Allah Who created the seven heavens and of the Earth the same number, the Command descending down through all of them, so that you might know that Allah has power over all things and that Allah encompasses all things in His knowledge.\u201D (At-Talaq, 65: 12)

Clearly, Allah, Who created everything in the universe, is surely able to bring the dead to life:

\u201CDo they not see that Allah-He Who created the heavens and the Earth and was not wearied by creating them-has the power to bring the dead to life? Yes indeed! He has power over all things.\u201D (Al-Ahqaf, 46: 33)`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/know-your-god/345-allah-has-power-over-everything/",license:"Fair Use / Permitted Metadata",publication_date:"2014-05-25T08:48:12",created_at:"2026-08-23 09:55:28"},{id:"3403547c-499f-40f9-8a39-adae78b0924e",title:"Black hole powers \u201Ccosmic flashlight\u201D illuminating the cosmic web",author:"Quran & Science",content:`Quranic verse

\u201CAnd verily We have beautified the world\u2019s heaven with lamps, and We have made them missiles for the devils, and for them We have prepared the doom of flame\u201D (Quran 67:5)

Scientific News

Astronomy magazine (January 20, 2014): Black hole powers \u201Ccosmic flashlight\u201D illuminating the cosmic web

\u201CThe light from the quasar is like a flashlight beam, and in this case, we were lucky that the flashlight is pointing right at the cosmic web, making some of its gas glow,\u201D said Sebastiano Cantalupo from the University of California, Santa Cruz. Using the 10-meter Keck I Telescope at the W. M. Keck Observatory in Hawaii, the researchers were able to capture an image of the fluorescently glowing cosmic web with the help of a custom-made filter. Fluorescent light reaching us from the targeted portion of the cosmic web has a specific characteristic color \u2014 and only this color is transmitted by the filter.

The hydrogen gas in intergalactic space has been indirectly studied for decades using a different and much more restricted technique that probes the cosmic web along a single line only \u2014 the line joining a distant background quasar with an observer here on Earth. But this method could never reveal the spatial structure of the cosmic web.

\u201CThis is the first time anyone has been able to capture an image of the cosmic web, demonstrating its filamentary structure,\u201D said Fabrizio Arrigoni Battaia from the Max Planck Institute for Astronomy in Heidelberg, Germany. The region of the cosmic web visible on the image measures roughly 2 million light-years across.

Such observations can be used to test supercomputer models that simulate the formation of cosmic structures from the Big Bang to the present. Indeed, the new discovery provides evidence that key elements might be missing from current simulations: The amount of cool gas inferred from the image of the cosmic web appears to be substantially larger than predicted.

\u201CIf you want to know how galaxies form, you first need to understand their fuel supply, which comes from the cosmic web,\u201D said Joseph Hennawi from the Max Planck Institute for Astronomy. \u201CThese new observations are challenging our understanding, as they suggest a large amount of gas is contained in small dense clumps, which is not currently present in our models. Resolving this tension will clearly teach us something very important.\u201D`,source:"Quran and Science",original_url:"https://quranandscience.com/news-verses/351-black-hole-powers-cosmic-flashlight-illuminating-the-cosmic-web/",license:"Fair Use / Permitted Metadata",publication_date:"2014-01-20T12:53:00",created_at:"2026-08-23 09:55:28"},{id:"f2df7c51-7573-48fc-8450-b5868c08a398",title:"The Preservation of Pharaoh\u2019s body",author:"Quran & Science",content:`The Description Contained in the Holy Scriptures of the Pharaoh\u2019s Death During the Exodus.

This event marks a very important point in the narrations contained in the Bible and the Qur\u2019an. It stands forth very clearly in the texts. It is referred to in the Bible, not only in the Pentateuch or Torah, but also in the Psalms: the references have already been given.

It is very strange to find that Christian commentators have completely ignored it. Thus, Father de Vaux maintains the theory that the Exodus from Egypt took place in the first half or the middle of Ramesses II\u2019s reign. His theory takes no account of the fact that the Pharaoh perished during the Exodus, a fact which should make all hypotheses place the event at the end of a reign. In his Ancient History of Israel (Histoire ancienne d\u2019Israel), the Head of the Biblical School of Jerusalem does not seem to be at all troubled by the contradiction between the theory he maintains and the data contained in the two Books of the Bible: the Torah and Psalms.

In his book, Egypt and the Bible (L\u2019Egypte et la Bible), P. Montet places the Exodus during Merneptah\u2019s reign, but says nothing about the death of the Pharaoh who was at the head of the army following the fleeing Hebrews.

This highly surprising attitude contrasts with the Jews\u2019 outlook: Psalm 136, verse 15 gives thanks to God who \u201Coverthrew Pharaoh and his host in the Sea of Rushes\u201D and is often recited in their liturgy. They know of the agreement between this verse and the passage in Exodus (14,28-29): \u201CThe waters returned and covered the chariots and the horsemen and all the host of Pharaoh that had followed them into the sea; not so much as one of them remained.\u201D There is no shadow of a doubt for them that the Pharaoh and his troops were wiped out. These same texts are present in Christian Bibles.

Christian commentators quite deliberately, and in contradiction to all the evidence, brush aside the Pharaoh\u2019s death. What is more however, some of them mention the reference made to it in the Qur\u2019an and encourage their readers to make very strange comparisons. In the translation of the Bible directed by the Biblical School of Jerusalem we find the following commentary on the Pharaoh\u2019s death by Father Couroyer.

\u201CThe Quran refers to this (Pharaoh\u2019s death) (sura 10, verses 90-92), and popular tradition has it that the Pharaoh who was drowned with his army (an event which is not mentioned in the Holy Text) lives beneath the ocean where he rules over the men of the sea, i.e. the seals\u201D.

It is obvious that the uninformed reader of the Qur\u2019an is bound to establish a connection between a statement in it which-for the commentator-contradicts the Biblical text and this absurd legend which comes from a so-called popular tradition mentioned in the commentary after the reference to the Qur\u2019an.

The real meaning of the statement in the Qur\u2019an on this has nothing to do with what this commentator suggests: verses 90 to 92, sura 10 inform us that

\u201CAnd We took the Children of Israel across the sea, and Pharaoh and his soldiers pursued them in tyranny and enmity until, when drowning overtook him, he said, \u201CI believe that there is no deity except that in whom the Children of Israel believe, and I am of the Muslims \u2013 Now? And you had disobeyed [Him] before and were of the corrupters? \u2013 So today We will save you in body that you may be to those who succeed you a sign. And indeed, many among the people, of Our signs, are heedless\u201D (Quran 10:90-92)

This is all that the sura contains on the Pharaoh\u2019s death. There is no question of the phantasms recorded by the Biblical commentator either here or anywhere else in the Qur\u2019an. The text of the Qur\u2019an merely states very clearly that the Pharaoh\u2019s body will be saved: that is the important piece of information.

When the Qur\u2019an was transmitted to man by the Prophet, the bodies of all the Pharaohs who are today considered (rightly or wrongly) to have something to do with the Exodus were in their tombs of the Necropolis of Thebes, on the opposite side of the Nile from Luxor. At the time however, absolutely nothing was known of this fact, and it was not until the end of the Nineteenth century that they were discovered there.

As the Qur\u2019an states, the body of the Pharaoh of the Exodus was in fact rescued: whichever of the Pharaohs it was, visitors may see him in the Royal Mummies Room-of the Egyptian Museum, Cairo. The truth is therefore very different from the ludicrous legend that Father Couroyer has attached to the Qur\u2019an.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/historical/333-the-preservation-of-pharaoh-s-body/",license:"Fair Use / Permitted Metadata",publication_date:"2013-12-21T19:49:06",created_at:"2026-08-23 09:55:28"},{id:"f7bc42ec-7af8-4b35-94cb-e36a2a6436d7",title:"Constriction of Breasts in the Sky",author:"Quran & Science",content:`[And whomsoever Allah wills to guide, He opens his breast to Islam; and whomsoever He wills to send astray, He makes his breast closed and constricted, as if he is climbing up to the sky. \xA0\xA0 Allah, the Almighty, says:\xA0\xA0\xA0\xA0 [And whomsoever Allah wills to guide, He opens his breast to Islam; and whomsoever He wills to send astray, He makes his breast closed and constricted, as if he is climbing up to the sky.]\xA0 (Al-An\`am: 125)

The Scientific Fact:

The formation of the atmosphere was unknown until Pascal proved its existence in 1648. He proved that air pressure decreases as we go higher above sea level.

Later on it was discovered that air in the lower layers of the atmosphere is denser. About 50 % of the air mass is located between the surface of the earth and 20,000 feet above sea level, and 90% is located between the surface of the earth and 50,000 feet above sea level.

Therefore, density decreases vertically until air reaches its utmost rarefaction (minimum pressure) in the higher layers of the atmosphere before it completely vanishes in outer space.

When a human being goes higher than ten thousand (10,000) feet above sea level, it does not cause him any serious problem, as the respiratory system can handle the height of 10,000 to 25,000 feet above sea level; however, if a person goes into outer space, the amount of pressure and oxygen decrease causing the closing of the chest and dyspnea (shortness of breath). Then, the breathing process becomes difficult because of the lack of oxygen (oxygen starvation) and the respiratory system completely fails, causing death.

Facets of Scientific Inimitability:

It is well-known that the different layers of the atmosphere were unknown at the time the Ever-Glorious Qur\u2019an was revealed. Consequently, the low pressure and the decrease of oxygen, which is necessary for man\u2019s life, in the higher layers, were also unknown. People at that time did not know these facts; on the contrary they believed that whenever man goes higher, he will feel more serenity and happiness and enjoy the breeze.

This honorable verse clearly indicates two facts that have been only discovered lately by modern science: the first one is that dyspnea occurs when a person goes higher in the layers of the atmosphere because of the lack of oxygen and the decrease in air pressure. The second is the state that precedes choking leading to death that occurs when a person goes more than 30,000 feet above sea level. This is caused by the drastic decrease in air pressure and an extreme lack of oxygen.

It is important to note the miraculous nature of the word (climb) that indicates the difficulty of this state and describes the pain and suffering attached to it.

This is a sure indication that these words are truly from the All-Knowing and the All-Aware.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/islam-and-science-universe/322-constriction-of-breasts-in-the-sky/",license:"Fair Use / Permitted Metadata",publication_date:"2013-12-07T16:23:58",created_at:"2026-08-23 09:55:28"},{id:"9de009a6-03e3-4a54-bd74-dbfd0a644aca",title:"The Sun is a Great Lamp, and the Moon Gives Light",author:"Quran & Science",content:`Blessed be He Who has placed in the heaven big stars, and has placed therein a great lamp (sun), and a moon giving light.\xA0\xA0 Allah, the Almighty, says:\xA0\xA0\xA0 [Blessed be He Who has placed in the heaven big stars, and has placed therein a great lamp (sun), and a moon giving light.]\xA0\xA0 (Al-Furqan: 61)
And, [And We have made (therein) a shining lamp (sun).]\xA0 (An-Naba\u2019: 13)

The Scientific Facts:

The energy of the sun (universal atomic pile): The energy of the sun is generated by the burning of hydrogen, which is the main constituent of the sun that transforms it into helium deep within, where there is very high density, pressure, and temperatures reaching 15,000,000\xB0. This leads to a nuclear reaction and fusion of four hydrogen atoms to make one helium atom. The leftover energy from this reaction is released in the form of electromagnetic energy divided into short wave rays, infrared rays, and ultraviolet rays.
This means that the sun obtains its energy from within through natural nuclear reaction under very high pressure, heat, and density as if it is a mega atomic pile made to provide earth with light, warmth, and energy.

The sun is considered a star and is a luminous celestial body, whereas the moon is a planet; a dark celestial body that reflects the light it receives from stars and the sun as do all the other natural satellites of the planets (the moons).

Facts of Scientific Inimitability:

More than fourteen centuries ago, the Ever-Glorious Qur\u2019an indicated the difference between stars and planets exemplified in the difference between the sun and the moon.
Modern astronomers only discovered this fact recently after the telescope was invented and after applying photometric and spectrogram researches on stars and planets.
Stars are luminous celestial bodies whereas planets are dark celestial bodies that reflect the light received from stars and the sun as do all other natural satellites of the planets and (moons).

The sun is a mega atomic pile swimming very fast in space and has many various forms of light, heat, and energy. It is not just a bright disk; rather it is like a shining lamp, whereas the moon is a planet that reflects the light of the sun to lighten the night on earth.

This fact was described in these two honorable verses fourteen centuries ago, then we must ask ourselves, who told Prophet Muhammad r about it but Allah, the Most High!`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/islam-and-science-universe/293-the-sun-is-a-great-lamp-and-the-moon-gives-light/",license:"Fair Use / Permitted Metadata",publication_date:"2013-08-12T09:50:56",created_at:"2026-08-23 09:55:28"},{id:"c689fa48-5dbf-44c1-abb5-e313d4fb8ddd",title:"Ramadan health FAQs",author:"Quran & Science",content:`Here are some frequently asked health questions about fasting during the holy month of Ramadan.These answers have been put together by medical experts and Islamic scholars and researchers.

Should a person with diabetes fast?People who have their diabetes under control, either by their diet or using tablets, may fast. However, their GP may require them to change their medication to help them take tablets outside fasting times. Those who need insulin to control their diabetes should not fast.I get severe migraines when I don\u2019t eat and they get worse when I fast. Should I fast?People with uncontrolled migraines should not fast. However, managing your migraines is possible with the right medicine and certain lifestyle changes. Ask your GP for further advice on controlling your migraines.Should a person with high or low blood pressure fast?People with well-controlled high blood pressure may fast. Their GP may require a change to their medicine to help them take tablets outside fasting times. Someone with low blood pressure who is otherwise healthy may fast. They must ensure they drink enough fluid and have enough salt. Is fasting harmful when a woman is expecting a baby? Must pregnant women fast?There\u2019s medical evidence to show that fasting in pregnancy is not a good idea. If a pregnant woman feels strong and healthy enough to fast, especially during the early part of the pregnancy, she may do so. If she doesn\u2019t feel well enough to fast, Islamic law gives her clear permission not to fast, and to make up the missed fasts later. If she is unable to do this, she must perform fidyah (a method of compensation for a missed act of worship).

Is Ramadan a good time to quit smoking?Yes. Smoking is bad for your health and Ramadan is a great opportunity to change unhealthy habits, including smoking. Find out more about stopping smoking.From what age can children fast safely?Children are required to fast upon reaching puberty. It isn\u2019t harmful. Fasting before this age is tolerated differently depending on the attitude of the parents and the child\u2019s general health and nutrition.Fasting for children under the age of seven or eight isn\u2019t advisable. It\u2019s a good idea to make children aware of what fasting involves and to practise fasting for a few hours at a time.Can I use an asthma inhaler during Ramadan?Muslim experts have differing opinions on this issue. Some say that using an asthma inhaler isn\u2019t the same as eating or drinking, and is therefore permitted during fasting. In their view, people with asthma can fast and use their inhalers whenever they need to.However, other scholars say that the inhaler provides small amounts of liquid medicine to the lungs, so it breaks the fast. They say that people with poor control of their asthma must not fast until good control is achieved. Some people with asthma may opt for longer-acting inhalers so that they can fast. See your GP for further advice.Can I swim during fasting?Yes, but do not drink the water. A bath or shower, or swimming, has no effect on the fast. However, no water should be swallowed during any of these activities as that would break the fast.Can a person fast if they are getting a blood transfusion in hospital?No. A person receiving a blood transfusion is advised not to fast on medical grounds. They may fast on the days when no transfusions are required.I am on regular medication. Can I still fast?If the medicine needs to be taken during fasting, do not fast. If this medication is required as treatment for a short illness, you can compensate for missed fasts by fasting on other days when you are well.If you are on long-term medication then you could talk to your GP about whether you could change your medication, so that you can take it outside the time of the fast.If your disease is unstable, or poorly controlled, do not fast. Those who are unable to carry out the missed fasts later, due to the long-term use of medication, should do fidyah.Does a breastfeeding woman have to fast?No. Islamic law says a breastfeeding mother does not have to fast. Missed fasts must be compensated for by fasting at a later date, or fidyah, once breastfeeding has stopped.Can a Muslim patient take tablets, have injections or use patches while fasting?Taking tablets breaks the fast. However, injections, patches, eardrops and eyedrops do not break the fast as they are not considered to be food and drink (though there are differences of opinion among Muslim scholars on these issues). Islamic law says sick people should not fast.Could dehydration become so bad that you have to break the fast?Yes. You could become very dehydrated if you do not drink enough water before the fast. Poor hydration can be made worse by weather conditions, and even everyday activities such as walking to work or housework.If you produce very little or no urine, feel disoriented and confused, or faint due to dehydration, you must stop fasting and have a drink of water or other fluid. Islam doesn\u2019t require you to harm yourself in fulfilling the fast. If a fast is broken, it will need to be compensated for by fasting at a later date.Can I fast while I have dialysis?People on peritoneal dialysis must not fast and should perform fidyah. Haemodialysis is performed about three times a week and causes significant shifts of fluids and salts within the body. Such patients must not fast and should perform fidyah.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/health-in-quran-a-sunnah/308-ramadan-health-faqs/",license:"Fair Use / Permitted Metadata",publication_date:"2013-07-10T16:07:14",created_at:"2026-08-23 09:55:28"},{id:"642af0c0-d7e3-4108-b050-c3a56ea08c45",title:"The Distress Call Within the Body",author:"Quran & Science",content:`You see the believers as regards their being merciful among themselves and showing love among themselves and being kind to each other, resembling one body, so that, if any part of the body complains, the whole body shares (Tada\`a) the sleeplessness (insomnia) and fever along\xA0 with it. \xA0The Distress Call Within the Body

Allah\u2019s Prophet (peace be upon him) said: \u201CYou see the believers as regards their being merciful among themselves and showing love among themselves and being kind to each other, resembling one body, so that, if any part of the body complains, the whole body shares (Tada\`a[1]) the sleeplessness (insomnia) and fever along\xA0 with it.\u201D[2]

The Scientific Fact:

Intensive and successive modern researches revealed marvelous facts about the interaction between the organs of the human body when threatened with danger such as injury or illness. The researches also discovered strategies and functional responses taken by the organs of the entire body whenever one organ suffers from an injury or an illness, and these responses differ according to the nature of the injury.

Soon after the infection or injury takes place, sensory centers start calling the control and alert centers in the hypothalamus. This in turn calls upon the pituitary gland to secrete hormones that call on the rest of the endocrine glands to secrete their hormones, which urge all the body organs to save the endangered (complaining) organ. Therefore, it is a real complaint, and a true call rather than a metaphorical one. The call, in this case, means that every part of the body utilizes its utmost energy to save that endangered part. The heart, for example, starts beating faster to help the blood circulate and reach the injured organ. At the same time, the blood vessels in that injured organ contract, while other vessels in the rest of the body expand in order to send the required amounts of energy, oxygen, antibodies, hormones, and amino acids to the injured part to help it resist the infection or injury and to heal quickly.

The body starts to collapse, i.e. by breaking up part of the stored fats and proteins, in order to provide aid for the injured organ. This constant flow of sacrifice continues until the rescue process subsides, when the injury or disease is under control, and the infected tissues and cells are cured.

The call from the injured or infected part resembles a real call for help; the infected place releases neuro pulses to the sensory and alert centers of the brain; moreover, some chemical substances are released with the first drop of blood that is shed or when a tissue is torn. Then, all body organs respond in order to provide help for the infected organ according to the nature of its injury or disease.

Facets of Scientific Inimitability:

What is mentioned in the honorable hadith actually happens, as all organs of the body call each other to save the infected organ and the Muslim Ummah should be like that: When an area suffers any aggression, the whole Ummah should call each other to come to its aid.

You do not find a more accurate word than the word (Tada\`a) to describe the aching of one organ, so there is linguistic, rhetorical, and scientific inimitability present at the same time. The Prophet (peace be upon him) told us what really happens inside the human body without equipment or tools and using eloquent words and rhetorical sentences.

What is even more amazing is the fact that the name that physicians call on the nervous system that interacts when the body is infected or injured is: the lover, kind, and merciful, which is the same wording of the Prophet (peace be upon him) in the hadith.

Glory be to Allah Who sent His Messenger with guidance and the religion of truth to make it superior, and Who supported him with miracles and eloquence.

[1] It is an eloquent Arabic word that also means a mutual call or summoning (between the organs) and the collapse of something.

[2] Reported by Imam al-Bukhari, \u201CBook of al-Adab (good manners).`,source:"Quran and Science",original_url:"https://quranandscience.com/sunnah-a-science/200-the-distress-call-within-the-body/",license:"Fair Use / Permitted Metadata",publication_date:"2013-05-27T09:54:24",created_at:"2026-08-23 09:55:28"},{id:"c59eea8c-c090-46c1-ad8e-d3d3b3f9c03a",title:"A Short Biography of Prophet Muhammad",author:"Quran & Science",content:`This article is from the second edition of Jihad in the Qur\u2019an: The Truth from the Source.

Prophet Muhammad was born in 570 CE (Common Era) in the city of Mecca in the Arabian Peninsula, part of modern day Saudi Arabia. As his father had died shortly after marriage, his grandfather \u2018Abd al-Muttalib became his guardian. \u2018Abd al-Muttalib was the respected head of the clan of Hashim and the tribe of Quraysh, to which his clan belonged.

With the Quraysh being the biggest and most influential tribe in Mecca, \u2018Abd al-Muttalib was seen as the master of all of Mecca. The Quraysh had a special status in Mecca because they used to be in charge of the sacred Ka\u2019ba. The Qur\u2019an tells us that this holy edifice was built by Prophets Abraham and his son Ishmael:

And when Abraham and Ishmael were raising the foundations of the House [Abraham prayed]: \u201COur Lord! Accept from us; surely You are the Hearing, the Knowing (2.127). Our Lord! Make us Muslims and raise from our offspring a nation of Muslims. Show us our ways of worship, and relent toward us. Surely, Your are the Relenting, the Merciful\u201D (2.128).This means that the Ka\u2019ba was built around 1900 BCE, which is when Abraham is thought to have lived. The Ka\u2019ba maintained its venerable status as the destination of pilgrimage in the eyes of the pilgrims and the Arab population of the Arabian Peninsula down the centuries. \u2018Abd al-Muttalib was personally in charge of the Ka\u2019ba.The Prophet was only about five to six years old when he lost his mother. Orphan Muhammad then lost his grandfather and custodian \u2018Abd al-Muttalib at the age of eight. Now one of \u2018Abd al-Muttalib\u2019s sons, Abu Talib, became the guardian of his orphan nephew. Though respected by the clan of Hashim and the people of Mecca in general, Abu Talib did not possess the high status and influence of his father. Had he been more fortunate financially, he might have aspired to acquire that special leadership status.When Muhammad was twenty five years old, he was hired by a woman called Khadija to take her merchandize to Syria. Khadija, a widow fifteen years Muhammad\u2019s senior, later proposed marriage to him, which he agreed to. They lived together for almost a quarter of a century, until the death of Khadija about 8-9 years after the revelation of the Qur\u2019an.It is interesting to note that Muhammad did not get married to any other woman during Khadija\u2019s life, despite the fact that polygamy was common practice in that society. Living out his youth with only one woman in that highly polygamous environment contradicts Muhammad\u2019s lecherous image in the Western mind.Muhammad was deeply interested in matters beyond this mundane life. He used to frequent a cave that became known as \u201CHira\u2018\u201D on the Mountain of \u201CNur\u201D (light) for contemplation. The cave itself, which survived the times, gives a very vivid image of Muhammad\u2019s spiritual inclinations. Resting on the top of one of the mountains north of Mecca, the cave is completely isolated from the rest of the world. In fact, it is not easy to find at all even if one knew it existed. After visiting the cave, I found myself concluding that Muhammad must have been divinely guided to that hideaway, even if he had chosen it consciously. Once inside the cave, it is a total isolation. Nothing can be seen other than the clear, beautiful sky above and the many surrounding mountains. Very little of this world can be seen or heard from inside the cave. The inhabitant of that cave was obviously interested in things beyond this world and its material riches.It was in that cave in 610 CE, i.e. at the age of forty, that Prophet Muhammad received from Allah the first verses of the Qur\u2019an. Then and there, history changed.The Qur\u2019an continued to be revealed in fragments to Prophet Muhammad over the following twenty two years. The last words of the Book were revealed to the Prophet shortly before his death in 632 CE. We will read more about the Qur\u2019an in section 2.2.In the first two to three years after the revelation, the Prophet preached Islam secretly to individuals whom he trusted. When he started calling people to Islam publicly, the new religion gradually attracted more people but, not surprisingly, also increasing hostility from the idol worshipping population of Mecca. The Prophet was subjected to harassment and abuse. However, armed with patience, resilience, and determination, and protected by his uncle Abu Talib and the clan of Hashim, the Prophet was able to carry on preaching the new faith to people.Converts to Islam, some of whom were slaves, had to suffer all kinds of persecution, including brutal torture and murder, at the hands of the enemies of the new religion in Mecca. In 614 CE, the Prophet had to instruct a group of Muslims to escape the persecution to Abyssinia and seek the protection of its just Christian king. The Quraysh then sent a delegation to the king, carrying precious gifts, to secure the extradition of the Muslim refugees. The king, however, rejected the bribe and let the Muslims stay in Abyssinia.One year later, the Quraysh imposed economic and social sanctions on the Prophet, his followers, and his clan. As a result, the Muslims withdrew to a mountain in Mecca. The sanctions lasted about three years before collapsing in 618/619 CE without achieving their goals.Soon afterward, the Prophet lost his wife Khadija. Matters got worse quickly with the death of his uncle and protector. Prophet Muhammad started to suffer more from the disbelievers\u2019 relentless attempts to uproot Islam and destroy its followers. During the pilgrimage season in 622 CE, Muhammad met in Mecca with a number of chiefs from the city of Yathrib, where he had previously sent some Muslims to settle in. Having converted to Islam, the chiefs made a secret pledge to protect the Prophet should the Quraysh try to kill him.However, the Quraysh learned about the agreement, so the people from Yathrib had to return quickly to their city. Sensing that the danger to Muslims has increased, Muhammad instructed them to immigrate individually or in small groups to Yathrib. The Qurayshites tried to prevent Muslims from fleeing Mecca to Yathrib, but the converts continued to sneak out gradually.The continuing immigration of Muslims to Yathrib where they had allies was already very bad news for the Qurayshites. This could yet get much worse if Muhammad also would move to that city. They decided that they had no other option but to kill him.The various clans of the tribe of Quraysh agreed to act as one and assassinate the Prophet while asleep. The idea behind acting collectively was that no one party could be blamed for the killing and become embroiled in a war of vengeance with the clan of Hashim.The assassination plan, however, was sabotaged by divine intervention. The night the murder was planned to take place, Allah informed His Prophet of the danger and ordered him to secretly leave Mecca and head to the city of Yathrib. The latter became known as \u201Cal-Madina al-Munawwara\u201D (the illuminated city), or \u201Cal-Madina\u201D for brief, after the arrival of the Prophet.This famous event, known as the \u201CHijra \u201D (immigration), occurred in 622 CE, about twelve years after the revelation of the first verses of the Qur\u2019an. This flight was destined to have far-reaching consequences in establishing the Islamic community, strengthening the position of Islam, and spreading its message.The Prophet lived in al-Madina for about ten years. By the time of his departure from this world in 632 CE, Islam had become well established as the religion of the Arabian Peninsula and had made inroads in neighboring regions; Muslims had become a major force to be reckoned with in the area.

Date (CE)570Birth of the Prophet in Mecca. His father was already dead when he was born.575-576The death of the Prophet\u2019s mother.578The death of the Prophet\u2019s grandfather and custodian \u2018Abd al-Muttalib. The Prophet\u2019s uncle Abu Talib became his guardian.610The first revelation of the Qur\u2019an.612-613The Prophet started calling people to Islam publicly.614The first immigration of Muslims to Abyssinia escaping the persecution of the idol-worshipping Meccans. They stayed there for three months. A second immigration to Abyssinia, involving more Muslims, took place later on. This time, the immigrants stayed in Abyssinia until 628 CE when they rejoined the Prophet in al-Madina.615The tribe of Quraysh imposed economic and social sanctions on Muslims and the clan of Prophet Muhammad, Hashim.618-619The collapse of the sanctions.618-619The death of Abu Talib, the Prophet\u2019s uncle, triggering increased hostility from the Meccans toward the Prophet.622The emigration of the Prophet from Mecca to al-Madina.624The first major battle of the Muslims against the disbelievers, known as the battle of Badr.630The Muslims conquered Mecca without fighting.632The last revelation of the Qur\u2019an.632The departure of the Prophet from this world in al-Madina.`,source:"Quran and Science",original_url:"https://quranandscience.com/prophet-muhammad/his-biography/213-a-short-biography-of-prophet-muhammad/",license:"Fair Use / Permitted Metadata",publication_date:"2013-05-21T10:35:06",created_at:"2026-08-23 09:55:28"},{id:"664b2a97-eeff-46b0-8ed7-0ebe7c2252a9",title:"The Prophet\u2019s Marriages and Wives",author:"Quran & Science",content:`One line of hostile argument against Islam and the Prophet begins in the following manner: he married multiple times, which proves he was a voluptuary! The argument then goes on to conclude that any serious study of the religion of which this licentious person was the primary spokesperson would be worthless. Even a cursory examination of Muhammad\u2019s (S) marriages however destroys these widely held myths. I will list Muhammad\u2019s (S) marriages in chronological order and describe the rationale and circumstances surrounding them.

1. Khadijah bint Khuwaylid

Khadijah , his first wife, was a widow who was much older than Muhammad (S) when she proposed to him. Because of her success in business and lineage, many of the wealthy among the Quraysh desired to marry her. She, however, was impressed by Muhammad\u2019s (S) character and so she initiated the marriage proposal. She was his steadfast supporter in extremely trying times and always provided wise counsel and solace. She was the first person to accept Islam. Khadijah died approximately twenty-five years after they married, and Prophet Muhammad (S) continued to revere her memory for the rest of his life.

2. Sawdah bint Zam\u2019ah

After Khadijah\u2019s death, the Prophet married Sawdah. She was also a widow. She and her husband had accepted Islam very early in the mission and had been among the migrants to Ethiopia. She was a tall and rather heavyset individual. She was also very well known for her charity. The marriage of Muhammad (S) to Sawdah set the trend of the Prophet marrying widows of Muslims who had died of natural causes or during one of the many battles. The social structure of the time was not conducive for widows or women living singly. One could argue that today, in societies like Bosnia and Chechnya, where large members of men have become the victims of genocide, multiple marriages to widows would be a reasonable remedy for these women living in dire poverty and destitution, or turning to prostitution to survive.

3. \u2018A\u2019ishah bint Abu Bakr

It was customary in the Arab society for close friendships and bonds to be strengthened by marriage into the family. Muhammad (S) married the daughters of his two closest associates, Abu Bakr as-Siddiq and \u2018Umar ibn al-Khattab, the first two Khalifahs (successors of the Prophet) of Islam. In turn, three of the daughters of the Prophet were married to the other two companions who became the third and fourth Khalifahs, Uthman ibn \u2018Affan and \u2018Ali ibn Abu Talib. The youngest of his wives, \u2018A\u2019ishah , Abu Bakr\u2019s daughter, was a remarkable woman. Her lively personality comes through in the quotes attributed to her in the Sirah and Hadith literature. Muhammad (S) took permission from his other wives and spent the last days of his life with her and he died in her arms. She was extremely intelligent and erudite. Much of the stronger Hadith literature is attributed to her. Many of the companions would seek her help in resolving difficult legal problems.

4. Hafsah bint \u2018Umar

When Hafsah became a widow, her father \u2018Umar, one of the great Khalifahs of Islam, started looking for a husband for her. He initially asked Uthman. Uthman\u2019s wife, Ruqayyah, one of the Prophet\u2019s daughters, had just died. However Uthman demurred. \u2018Umar then asked Abu Bakr to marry her, but Abu Bakr also declined. He then finally asked Muhammad (S). Sensing what was going on, the Prophet readily agreed. Later when during Uthman\u2019s caliphate the authoritative version of the Qur\u2019an was redacted Hafsah would be the custodian of the manuscript.

5. Zaynab bint Khuzaymah (The mother of the indigent)

Zaynab\u2019s husband \u2018Ubaydah was killed in the battle of Badr. Muhammad (S) immediately offered to marry her. She had the reputation of being extremely caring toward the needy and the indigent. She was known as Umm al-Masakin (The mother of the poor). She died within two or three months of her marriage to the Prophet.

6. Umm Salamah bint Abu Umayyah

Her real name was Hind, but she was known as Umm Salamah. Her husband, Abdullah bin Abdul Asad was known as Abu Salamah. They had migrated to Ethiopia, and Abu Salamah was well known for his courage and prowess as an equestrian. He died from injuries sustained during the battle of Uhud. Umm Salamah was pregnant at that time. After waiting the period, Muhammad (S) proposed marriage to her. She initially refused, citing reasons of being old and having children from the previous marriage, but Muhammad (S) insisted. She was with Muhammad (S) during the trip to Makkah from the pilgrimage, which resulted in the Hudaybiyah treaty. Her advice and counsel proved crucial during those very critical days.   7. Zaynab bint Jahsh

Zaynab (ra) had been married to Zayd bin Thabit. Zayd was Muhammad\u2019s (S) slave before the advent of Islam. Muhammad (S) appeared to set a precedent that slaves should be freed and should carry no stigma from their past. Zaynab, who was Muhammad\u2019s (S) cousin, may have married Zayd under moral duress. The exact rationale behind the marriage is unclear. The marriage did not last long. It is possible that the Prophet felt some responsibility about the failed marriage and therefore the necessity to marry her. The Qur\u2019an offers an additional explanation for the marriage. Two of the prevalent customs in the society were to banish \u201Cwives\u201D into limbo by declaring them to be their husband\u2019s \u201Cmothers,\u201D (as discussed earlier, the practice was called Zihar), and to declare foster children as one\u2019s natural children. The Prophet\u2019s marriage to Zaynab (ra), who was divorced from Zayd, abolished the latter practice. Zaynab was known for her extraordinary piety and righteousness. She was in her late middle age when she married the Prophet.

8. Juwariyah bint al-Harith

The prisoners of war captured after the defeat of Banu Musta\u2019liq (sub-tribe of Khuza \u2018ah) included Juwayriyah .She was the daughter of the defeated tribal chief. Her husband had been killed in the skirmish. She would have become a companion\u2019s, Thabit bin Qays\u2019, slave. She found that unacceptable and petitioned the Prophet. He freed her by paying Thabit her ransom and offered to restore her prestige by marrying her. She accepted, and an important byproduct of the marriage was that the entire over seven hundred prisoners of war of the tribe of Banu Musta\u2019liq were freed.

9. Umm Habibah bint Abu Sufyan

Ramla (mother of Habibah) was initially married to \u2018Ubaydullah bin Jahsh The two migrated to Ethiopia, and after the migration \u2018Ubaydullah converted to Christianity. Ramla remained a Muslim, resulting in a separation and divorce. Muhammad (S) sent an envoy to Negus with a proposal that he should conduct his marriage to Umm Habibah \u201Cin absentia.\u201D

10. Safiyyah bint Huyay

Her real name was Zaynab, but she was known by the nickname of Safiyyah. She was a prisoner of war following an assault on Khaybar. Both her father and brother had died during the war. She was initially assigned to a companion, Wahyi Kalby, but when it was realized that she was the daughter of a tribal chief, other companions objected.

11. Maymunah bint al-Harith

Maymunah\u2019s first marriage resulted in a divorce, and her second husband died, making her both a widow and a divorcee. One of the Prophet\u2019s close companions, Abbas proposed that Muhammad (S) should marry her. He agreed, demonstrating that it was no longer a stigma for a woman to be both divorced and widowed. They felt it would be inappropriate for her to be assigned to anyone other than the Prophet. She was occasionally the subject of sarcasm because of her Jewish parentage. Whenever the Prophet became aware of this, he showed his annoyance.

12. Mariyah

Muhammad\u2019s (S) last son was born to Mariyah, the Coptic. She was one of the two slave girls presented to the Prophet by the Archbishop of Alexandria. She gave birth to a son, Ibrahim, who, like the other two sons born to Khadijah died in infancy.

The Rationale Behind Prophet\u2019s Marriages

The rationale behind these marriages is clear. Many were performed to rehabilitate divorced and widowed women, especially widows of companions who had been killed in the early battles. Sometimes, Muhammad (S) had to go to great lengths to persuade the women to marry him. Other marriages were done to strengthen bonds between friends and tribes. Some were done as an act of compassion toward a conquered foe. In the society of those times, they were regarded as acts of nobility and kindness. With the exception of the marriage to Zaynab bint Jahsh, none appeared to create any controversy. The controversy surrounding Zaynab\u2019s marriage soon dissipated as the motive behind it became clear. All of his wives distinguished themselves in some area of charity, kindness, or, as in the case of \u2018A\u2019ishah , erudition and knowledge. They were held to a higher standard and were informed that both their rewards and punishments were greater than of other women in the society.

The Qur\u2019an honors them as the \u201CMothers of the believers\u201D. Their marriages to the Prophet were voluntary and they could initiate and ask for divorce if they so desired. The Qur\u2019an and Muhammad (S) made revolutionary changes in the status of women and his wives were in many ways exemplars of these changes. As the Prophet\u2019s dealings with his wives were based on love, affection, respect and dignity, others in the society were expected to follow his exemplary behavior. Men and women were declared equal in the eyes of Allah. Compassion, equity, and justice were mandated. Rules were laid down for marriage and divorce. Laws regarding ownership of property were promulgated. The notion of the moral superiority of men over women was shot down. Men were told they had the duty to protect women and children. As mentioned earlier the Qur\u2019an stresses the moral and spiritual equality of men and women in emphatic and unambiguous language.`,source:"Quran and Science",original_url:"https://quranandscience.com/prophet-muhammad/his-biography/214-the-prophets-marriages-and-wives/",license:"Fair Use / Permitted Metadata",publication_date:"2013-04-17T15:08:28",created_at:"2026-08-23 09:55:28"},{id:"1fcc7da6-c945-4456-8b36-e7fb5b967e13",title:"Salman the Persian \u2013 The seeker of Truth",author:"Quran & Science",content:`This is a story of a seeker of Truth, the story of Salman the Persian, gleaned, to begin with, from his own words:

I grew up in the town of Isfahan in Persia in the village of Jayyan. My father was the Dihqan or chief of the village. He was the richest person there and had the biggest house.

Since I was a child my father loved me, more than he loved any other. As time went by his love for me became so strong and overpowering that he feared to lose me or have anything happen to me. So he kept me at home, a veritable prisoner, in the same way that young girls were kept.

I became devoted to the Magian religion so much so that I attained the position of custodian of the fire which we worshipped. My duty was to see that the flames of the fire remained burning and that it did not go out for a single hour, day or night.

My father had a vast estate which yielded an abundant supply of crops. He himself looked after the estate and the harvest. One day he was very busy with his duties as dihqan in the village and he said to me:

\u201CMy son, as you see, I am too busy to go out to the estate now. Go and look after matters there for me today.\u201D

On my way to the estate, I passed a Christian church and the voices at prayer attracted my attention. I did not know anything about Christianity or about the followers of any other religion throughout the time my father kept me in the house away from people. When I heard the voices of the Christians I entered the church to see what they were doing.

I was impressed by their manner of praying and felt drawn to their religion. \u201CBy God,\u201D I said, \u201Cthis is better than ours. I shall not leave them until the sun sets.\u201D

I asked and was told that the Christian religion originated in AshSham (Greater Syria). I did not go to my father\u2019s estate that day and at night, I returned home. My father met me and asked what I had done. I told him about my meeting with the Christians and how I was impressed by their religion. He was dismayed and said:

\u201CMy son, there is nothing good in that religion. Your religion and the religion of your forefathers is better.\u201D

\u201CNo, their religion is better than ours,\u201D I insisted.

My father became upset and afraid that I would leave our religion. So he kept me locked up in the house and put a chain on my feet. I managed however to send a message to the Christians asking them to inform me of any caravan going to Syria. Before long they got in touch with me and told me that a caravan was headed for Syria. I managed to unfetter myself and in disguise accompanied the caravan to Syria. There, I asked who was the leading person in the Christian religion and was directed to the bishop of the church. I went up to him and said:

\u201CI want to become a Christian and would like to attach myself to your service, learn from you and pray with you.\u201D

The bishop agreed and I entered the church in his service. I soon found out, however, that the man was corrupt. He would order his followers to give money in chanty while holding out the promise of blessings to them. When they gave anything to spend in the way oRGod however, he would hoard it for himself and not give anything to the poor or needy. In this way he amassed a vast quantity of gold. When the bishop died and the Christians gathered to bury him, I told them of his corrupt practices and, at their request, showed them where he kept their donations. When they saw the large jars filled with gold and silver they said.

\u201CBy God, we shall not bury him.\u201D They nailed him on a cross and threw stones at him.

I continued in the service of the person who replaced him. The new bishop was an ascetic who longed for the Hereafter and engaged in worship day and night. I was greatly devoted to him and spent a long time in his company.

(After his death, Salman attached himself to various Christian religious figures, in Mosul, Nisibis and elsewhere. The last one had told him about the appearance of a Prophet in the land of the Arabs who would have a reputation for strict honesty, one who would accept a gift but would never consume charity (sadaqah) for himself. Salman continues his story.)

A group of Arab leaders from the Kalb tribe passed through Ammuriyah and I asked them to take me with them to the land of the Arabs in return for whatever money I had. They agreed and I paid them. When we reached Wadi al-Qura (a place between Madinah and Syria), they broke their agreement and sold me to a Jew. I worked as a servant for him but eventually he sold me to a nephew of his belonging to the tribe of Banu Qurayzah. This nephew took me with him to Yathrib, the city of palm groves, which is how th e Christian at Ammuriyah had described it.

At that time the Prophet was inviting his people in Makkah to Islam but I did not hear anything about him then because of the harsh duties which slavery imposed upon me.

When the Prophet reached Yathrib after his hijrah from Makkah, I was in fact at the top of a palm tree belonging to my master doing some work. My master was sitting under the tree. A nephew of his came up and said:

\u201CMay God declare war on the Aws and the Khazraj (the two main Arab tribes of Yathrib). By God, they are now gathering at Quba to meet a man who has today come from Makkah and who claims he is a Prophet.\u201D I felt hot flushes as soon as I heard these words and I began to shiver so violently that I was afraid that I might fall on my master. I quickly got down from the tree and spoke to my master\u2019s nephew. \u201CWhat did you say? Repeat the news for me.\u201D

My mastcr was very angry and gave me a terrible blow. \u201CWhat does this matter to you? Go back to what you were doing,\u201D he shouted.

That evening, I took some dates that I had gathered and went to the place where the Prophet had alighted. I went up to him and said:

\u201CI have heard that you are a righteous man and that you have companions with you who are strangers and are in need. Here is something from me as sadaqah. I see that you are more deserving of it than others.\u201D

The Prophet ordered his companions to eat but he himself did not eat of it.

I gathered some more dates and when the Prophet left Quba for Madinah I went to him and said: \u201CI noticed that you did not eat of the sadaqah I gave. This however is a gift for you.\u201D Of this gift of dates, both he and his companions ate.

The strict honesty of the Prophet was one of the characteristics that led Salman to believe in him and accept Islam.

Salman was released from slavery by the Prophet who paid his Jewish slave-owner a stipulated price and who himself planted an agreed number of date palms to secure his manumission. After accepting Islam, Salman would say when asked whose son he was:

\u201CI am Salman, the son of Islam from the children of Adam.\u201D

Salman was to play an important role in the struggles of the growing Muslim state. At the battle of Khandaq, he proved to be an innovator in military strategy. He suggested digging a ditch or khandaq around Madinah to keep the Quraysh army at bay. When Abu Sufyan, the leader of the Makkans, saw the ditch, he said, \u201CThis strategem has not been employed by the Arabs before.\u201D

Salman became known as \u201CSalman the Good\u201D. He was a scholar who lived a rough and ascetic life. He had one cloak which he wore and on which he slept. He would not seek the shelter of a roof but stayed under a tree or against a wall. A man once said to him: \u201CShall I not build you a house in which to live?\u201D \u201CI have no need of a house,\u201D he replied.

The man persisted and said, \u201CI know the type of house that would suit you.\u201D \u201CDescribe it to me,\u201D said Salman.

\u201CI shall build you a house which if you stand up in it, its roof will hurt your head and if you stretch your legs the wall will hurt them.\u201D

Later, as a govenor of al-Mada\u2019in (Ctesiphon) near Baghdad, Salman received a stipend of five thousand dirhams. This he would distribute as sadaqah. He lived from the work of his own hands. When some people came to Mada\u2019in and saw him working in the palm groves, they said, \u201CYou are the amir here and your sustenance is guaranteed and you do this work!\u201D

\u201CI like to eat from the work of my own hands,\u201D he replied. Salman however was not extreme in his asceticism. It is related that he once visited Abu ad-Dardaa with whom the Prophet had joined him in brotherhood. He found Abu adDardaa\u2019s wife in a miserable state and he asked, \u201CWhat is the matter with you.\u201D

\u201CYour brother has no need of anything in this world*\u201D she replied.

When Abu ad-Dardaa came, he welcomed Salman and gave him food. Salman told him to eat but Abu adDardaa said, \u201CI am fasting.\u201D

\u201CI swear to you that I shall not eat until you eat also.\u201D

Salman spent the night there as well. During the night, Abu ad-Dardaa got up but Salman got hold of him and said:

\u201CO Abu ad-Dardaa, your Lord has a right over you. Your family have a right over you and your body has a right over you. Give to each its due.\u201D

In the morning, they prayed together and then went out to meet the Prophet, peace be upon him. The Prophet supported Salman in what he had said.

As a scholar, Salman was noted for his vast knowledge and wisdom. Ali said of him that he was like Luqman the Wise. And Ka\u2019b al-Ahbar said: \u201CSalman is stuffed with knowledge and wisdom\xD1an ocean that does not dry up.\u201D Salman had a knowledge of both the Christian scriptures and the Qur\u2019an in addition to his earlier knowledge of the Zoroastrian religion. Salman in fact translated parts of the Qur\u2019an into Persian during the life-time of the Prophet. He was thus the first person to translate the Qur\u2019an into a foreign language.

Salman, because of the influential household in which he grew up, might easily have been a major figure in the sprawling Persian Empire of his time. His search for truth however led him, even before the Prophet had appeared, to renounce a comfortable and affluent life and even to suffer the indignities of slavery. According to the most reliable account, he died in the year thirty five after the hijrah, during the caliphate of Uthman, at Ctesiphon.`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/new-muslim-stories/270-salman-the-persian-the-seeker-of-truth/",license:"Fair Use / Permitted Metadata",publication_date:"2013-03-23T11:28:23",created_at:"2026-08-23 09:55:28"},{id:"9300a1b7-581a-4a8a-ae01-c28b1353a4d6",title:"Sexually Transmitted Diseases Are a Byproduct of Lewdness",author:"Quran & Science",content:`Never does sexual perversion become widespread and publicly known in certain people without them being overtaken by plague and disease that never happened to their ancestors who came before them.

The Prophet (peace be upon him) said:\xA0 \u201CNever does sexual perversion become widespread and publicly known in certain people without them being overtaken by plague and disease that never happened to their ancestors who came before them.\u201D(Reported by Ibn Majah.)

He (peace be upon him) also said:\xA0 \u201CWhenever adultery becomes a widespread phenomena among certain people, death will spread among them.\u201D(Reported by Malik.)

The Scientific Fact:

Modern science has shown us through the works of microbiologists during the last two centuries that there are certain bacteria, microbes, and viruses that are only transmitted through having sex in a perverted way like multiple relationships between men and women, sex between men and men (sodomy), and between women and women (lesbianism). The more such forms of perversion become rampant, the more plagues and diseases hit the society since these microbes become resistant to treatment. Moreover, the human body will fail to combat them due to its weak immunity and the change of the properties of such organisms.

Facets of Scientific Inimitability:

The hadith of the Prophet (peace) tells us about a social law that will inevitably happen when certain things occur. The beginning is the spread of prohibited sexual relations including adultery and homosexuality in the society. When such relations become normal and accepted, this will lead to a state of almost common consent concerning them. This is what is referred to in the words: Never does sexual perversion become widespread and publicly known in certain people\u2026 This law has taken effect in many Western societies where people have accepted adultery and homosexuality and even propagated them. In his book Sexually Transmitted Diseases, Dr. Schofield wrote that permissiveness has become the reaction of society in the face of all sexual practices. People are no longer ashamed of adultery, homosexuality, or any other sexual perversion. What adds insult to injury is that the mass media has inculcated in the minds of people that young men and women should not remain chaste. Chastity has become a shame in Western societies. Sexual permissiveness is propagated and supported everywhere in the media.

According to the Encyclopedia Britannica, gays are now acting publicly and have their own clubs, bars, parks, beaches, swimming pools, and even restrooms. Hundreds of articles, books, plays, novels, and movies praising prostitution and homosexuality can be found everywhere. Some Western churches have even accepted homosexuality and adultery and priests are now conducting gay marriages in some churches. Many societies have been established to cherish and defend gay rights. This is the beginning, what about the outcome?

Many sexual plagues have appeared and many diseases have overwhelmed societies around the world. Since its appearance in 1494, the plague of syphilis has taken the lives of millions of people and destroyed the future of many others. The virus causing this disease is still changing itself and attacking people from time to time. Gonorrhea is on top of the list of infectious sexual diseases. Being the most widespread sexual disease, it terrifies millions of people and leaves them infertile. These diseases strike those who divert from the teachings of Allah and go their own perverted way. Recently, people started to hear about AIDS which destroys the immunity system and thus bodily organs fall, one after another, after causing horrible pain to the person. This is exactly what the Prophet (peace be upon him) told us a long time ago. Is this not additional evidence that Muhammad (peace be upon him) is the true Messenger of Allah?`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/legislative/179-sexually-transmitted-diseases-are-a-byproduct-of-lewdness/",license:"Fair Use / Permitted Metadata",publication_date:"2013-02-28T09:58:21",created_at:"2026-08-23 09:55:28"},{id:"986d9d2e-7be6-4ca7-b1db-507da41b9cdf",title:"Quarantine: A Prophetic Discover",author:"Quran & Science",content:`\u201CIf you hear of an outbreak of plague in a land, do not enter it; but if the plague breaks out in a place while you are in it, do not leave that place.\u201D \xA0\xA0 The Prophet (peace be upon him) said:\xA0\xA0\xA0\xA0 \u201CIf you hear of an outbreak of plague in a land, do not enter it; but if the plague breaks out in a place while you are in it, do not leave that place.\u201D (Reported by al-Bukhari and Muslim.)

Also, he (peace be upon him) said: \u201CHe who runs away from the place of plague is like the one running away from fighting in the cause of Allah; and he who is patient and stays where he is, he will be rewarded with the reward of a martyr.\u201D (Reported by Ahmad.)

The Scientific Fact:

Modern science now understands the ways in which microorganisms multiply and the diseases they cause. Scientists affirm that healthy people who have no symptoms in the place of plague are already carrying the microbe and so they represent a real threat because they may transfer the plague to another place if they move to it.

Thus, this system of quarantine, in which all the people of the city that suffers from plague are prevented from leaving, and visitors are also prevented from entering, has now been established worldwide. In the 15th century, plague hit Europe causing the death of a quarter of its citizens. At that time, plagues and contagious diseases were much less in the Muslim world.

Facets of Scientific Inimitability:

At the time of the Prophet (peace be upon him) as well as before and after his time until Pasteur managed to discover the existence of microbes, people used to think that diseases were caused by devils, demons, and stars. That is they were not related to cleanliness or certain behaviors; thus, they resorted to sorcery and magic as a remedy.

In such an environment, the Prophet (peace be upon him) established the system of quarantine which is considered the basis of modern preventative medicine after the discovery of the microbes that cause diseases and plagues. The Prophet (peace be upon him) ordered his Companions: \u201CIf you hear of an outbreak of plague in a land, do not enter it; but if the plague breaks out in a place while you are in it, do not leave that place.\u201D In order to make sure that his order would be carried out properly, he (peace be upon him) established a wall around the area of the plague and promised those who are patient and stay in the area of the plague with the reward of the martyrs, and those who run away from it were promised doom and perdition. Thus, he (peace be upon him) said: \u201CHe who runs away from the place of the plague is like the one running away from fighting in the cause of Allah and he who forbears it and stays where he is, he will be rewarded with the reward of a martyr.\u201D

If a healthy person was asked two hundred years ago to stay with the sick people in a plague area, he would have considered this some kind of nonsense and in response to his desire to live he would have run away to another place. Only Muslims did not run away and leave at the time of plague in compliance with the order of the Prophet (peace be upon him). Non-Muslims mocked them for this act until it was later discovered that those who appear to be healthy with no symptoms, are the germ carriers who might transfer the plague to another place if they moved to it. They would move freely and mingle with healthy people, so they might cause them to catch the disease.

Who told the Prophet (peace be upon him) this fact? Could a human being know something like this fourteen centuries ago, or is it revelation from the All-Knowing, the Almighty Allah. Allah, the Almighty, says:

[And say, O Muhammad, to these polytheists and pagans, \u2018All the praises and thanks be to Allah. He will show you His signs and you shall recognize them. And your Lord is not unaware of what you do.\u2019] (An-Naml: 93)`,source:"Quran and Science",original_url:"https://quranandscience.com/sunnah-a-science/201-quarantine-a-prophetic-discover/",license:"Fair Use / Permitted Metadata",publication_date:"2012-12-20T18:47:57",created_at:"2026-08-23 09:55:28"},{id:"c4bb3a96-db3c-47dc-be00-707c095fa5dd",title:"The Rites of Hajj, Umrah & Visiting The Prophet\u2019s Mosque (In brief)",author:"Quran & Science",content:`Some Virtues of Hajj and Umrah

The Prophet (pbuh) said: \u201CUmrah is an expiation for the time between it and the previous \u2018Umrah\u2019 and an accepted Hajj has no less a reward than Paradise\u201D. (Narrated by al-Bukhari 1683, Muslim 1349).

The Prophet (pbuh) said: \u201CHe who performs Hajj and does not speak obscenely or commit evil then he returns just as the day his mother gave birth to him\u201D (Narrated by Bukhaari, Ahmed, Nasai and Ibn Majah from Abu Hurairah).

The Prophet (pbuh) said: \u201CThere is no day on which Allah frees more of His slaves from Fire than the Day of Arafah.\u201D (Narrated Aisha, Ummul Mu\u2019minin).

The Messenger of Allah (pbuh) was asked which deed is the best? He said, \u201CBelief in Allah and His messengers. He was asked, then what? He said, Jihad for the sake of Allah. He was asked, then what? He said, Hajj Mabrour (an accepted Hajj).\u201D (Narrated by al-Bukhaari 26).

Method of Hajj  1-Start it From Al Meeqat:

(For a man): Take off all the stitched garments to have a bath as you would do after sexual intercourse and perfume your head and beard with the best oil you can find \u2013there is no harm in what remains of it after Ihram. Don\u2019t perfume the Ihram garments.

Wear yourself from below the chest with white fabric (izar) and drape another piece over your two shoulders (ridaa) except in every Tawaaf, the right shoulder should be exposed.

(For a woman): Ihram is her customary stitched garments. She avoids wearing perfume or the type of dress which attracts attention. She isn\u2019t abiden by a certain color.  Pray the prescribed prayer if its stated time is on. And then offer two Rakats (Units) of prayer as a Sunnah act of Ihram. (There is no harm if you don\u2019t pray it).

Then if you ride the car, intend the Nusuk and then say according to your Nusuk: 1- If you want to perform Umrah only, you say: \u201CLabbaika Umrah\u201D which means: I intend to perform Umrah\u201D. 2- If you want to perform Hajj only (Ifrad) you say: \u201CLabbaika Hajjan\u201D. Which means: \u201CI intend to perform Hajj\u201D. 3- If you want to perform Hajj and Umrah together in their actions, you say: \u201CLabbaika Omratan Mutamattean biha ilal-Hajj\u201D which means: \u201CI intend to perform Hajj and Umrah\u201D. 4- If you want to perform Hajj and Umrah in the actions of Hajj (Qiran), you say: \u201CLabbaika Omratan wa Hajjan\u201D. There is no need to repeat these utterences three times but only one time is enough.

Notes:  1. Each Nusuk (type) has its own benefit. 2. There are variances between them in intention, utterances and actions. 3. The best: Tamattu, then Ifrad, then Qiran. 4. For (Qiran): A female pilgrim needs it if she wants her Ihram as Mutamatt\u2019eh and she couldn\u2019t accomplish her Umrah incase her menses comes as well as for the one who comes late and fears missing standing in Arafat;also, who is detained to enter the Holy House for any reason. If you fear that anything may detain you from completing your rites due to sickness or regulation procedures, you can make your intention conditioned in state of Ihram by saying:  \u201CAllaahumma Mahallee Haithu Habastanee\u201D which means: \u201CO Allah my place is wherever you prevent me\u201D. But if you don\u2019t fear any thing, it is not permitted to make your intention conditioned. Its benefit is: If you are prevented by any obstacle, you are excused legally to terminate your Ihram and return and you are not charged with an expiation.

Then you start Talbiyah:  \u201CLabbaika Allahumma, Labbaik, Labbaika laa shareeka laka labbaik. Innal-Hamda wanni\u2019mata laka wal mulk La shareeka lak\u201D.

Which means: Here I am, O Allah, here I am, there is no partner for you, Here I am! Surely, all praise and blessings are for you and dominion is Yours. There is no partner for you.

A man raises his voice when saying it and a woman says it so that only one beside her may hear her).

Saying Talbiyah in groups are not permitted and each Muhrim makes Talbiyah alone and continues saying it till he/she reaches the Holy House.

The supplication: \u201CAllahumma inni Urid-ul-Umrata fa yassirha li wataqabbalaha mini. Labbaika Allahuma labbaik, Labbaika la shareeka laka labbaik, Innal-Hamda wanni\u2019mata laka wal mulk, La shareeka lak\u201D.

Which means: \u201CO Allah, I intend to perform Umrah, so make it easy for me\u201D Here I am for Umrah-here I am, oh Allah, here I am, there is no partner for you, there I am! Surely, all praise and blessings are for you, and dominion is yours. There is no partner for You. And

\u201CAllahumma inni as\u2019aluka ridhaka wal-Jannata waa\u2019udhu bika min sakhatika wan nar\u201D. Which means: \u201CO Allah! I beseech You grant me Your pleasure and Paradise, and I seek your protection from Your Wrath and Hell-Fire\u201D. Saying such specific supplications is not necessary but you can say what you like. Also, praying on the prophet (pbuh) is not mentioned in this place.

It is permissible on the way to glorify Allah \u201CAllahu Akbar\u201D whenever you mount a hill and praise Allah whenever you descend in a valley. Then you return to the General Talbiyah \u201CLabbaika Allahumma labbaik\u201D\u2026etc. until you reach the Sacred House.

Each time you pass the Black Stone say: \u201CBismillah wallahu Akbar\u201D. Which means: \u201CIn the name of Allah, Allah is the Greatest\u201D.

You can supplicate what you like during the rest of Tawaaf. Invoke to Allah or recite some verses of the Holy Quran\u2026etc. There is no specific supplication for each round.

Which means: \u201CAnd take the station of Ibrahim as a place of worship\u201D and perform two Rakats (units) behind the Maqam (close to it if possible or at any place in the mosque). Recite after \u201CSura al-Fatihah\u201D \u201CSura al-Kafirun\u201D. (say, \u201CO disbelievers\u201D, in the first Rakat (unit) and Surah \u201CAl-Fatiha and \u201CSura al-Ikhlas\u201D: \u201CHe is Allah (who is) One\u201D in the second Rakat (unit). (There is no harm if you recite other Surahs).

Ascend to As Safa hill until you face the Ka\u2019bah and raise your hands and glorify Allah (three times) and say: \u201CLaa ilaaha illaallahu wahdahu laa shareekalahu-lahul mulku wa lahul hamdu \u2013 wa huwa \u2018alaa kulli shai\u2019in qadeer. Laa ilaaha illallahu wahdahu-anjaza wa\u2019dahu wa nasara abdahu wa hazamal ahzaaba wahdahu\u201D. (three times). Which means: \u201Cthere is no God but Allah, He has no partner, Sovereignty belongs to Him and praise too, He Fulfilled His promise, Helped His servant and routed the hosts, all Alone\u201D.

Then recite: \u201CInna as-safa wal-Marwata min sha\u2019airillah faman Hajj-al-baita awi\u2019tamara falajunahha \u2018alaihi an-yatawafa bihima, waman tatawwa\u2019a khairan fainnallaha Shaakeran \u2018Alim.\u201D

Which means: \u201CBehold! Safa and Mahwah are among the symbols of Allah. Whoever visits the Sacred House for pilgrimage or Umrah should walk to or fro between them. And if anyone obeys his own impulse to good, be sure that Allah is He who recognizes and knows\u201D 2: 159. This verse is to be read at the first round only. It is preferable to start with before any Dhikr, and you may supplicate to Allah the way you like in this place and raise your hands.

Then descend towards Marwah till you reach the green signpost. Then walk fast till you reach the next green signpost. Then walk fast till you reach the next green signpost saying: \u201CRabbighfir warham watajawaz ama ta\u2019alam innaka antal a\u2019azzul akram\u201D

Which means:  \u201CO Lord forgive and have mercy, verily you are the Most Mighty and Most Noble\u201D. Walk at a normal pace before and after them. (Walking fast is only for men) (women are not permitted to run).  You may supplicate during Sa\u2019yi what you please and there is no specific supplication for each round. When you reach Marwah, do the same as you did in Safa except for reciting the above mentioned Sura. It is to be read at the first round only. Repeat the lap seven times. (Going from As-Safa to Marwah is a lap and returning is another lap).

Remove your Ihram and resume your normal life.

In this way, you have performed full Umrah; if you want it separate or you want it for Hajj, in case you are Mutamatte But If you are Mufrid for Hajj or Qarin, you intend Tawaf- ul-qudum- it is Sunna- and Sa\u2019yi for Hajj \u2013 is a fundamental rite-; keep in state of Ihram and don\u2019t remove it. Don\u2019t shave or trim till the 8th of Dhul Hijjah to complete the rest of Hajj actions.

The standing (wuqoof) in Arafat The standing (wuqoof) in Arafat is one of the most fundamental rites of Hajj and the prophet PBUH said:  \u201Cal Hajj Arafah\u201D. Which means: \u201CHajj is Arafah\u201D. Its time:  a) The best: from the afternoon till after the sunset. b) The permissible: from the dawn of the 9th day till the down of the 10th day. If you have spent even a few minutes in Arafat, your Hajj is correct. But if your attendance occurs before the sunset only, you are charged for a compensatory animal. Even these minutes take place after sunset, you are not charged with an expiation, but you have missed sleeping in Muzdalefah. In this case, you are charged for an animal for Muzdalefah and not for Arafat.

Soon after the sunrise, leave for Arafat and perform Dhuhr and Asr prayers (combined and shortened during the time of Dhuhr with one Athan/Adhan and two Iqaamahs \u2013 and stay there until the sunset. Invoke Allah as much as you can and it is from Sunnah to face Al-Qibla during supplication and not facing the Mountain of Arafat. It is preferred to say this supplication: \u201CLaa ilaaha illaallahu Wahdahu laa Shareeka lahu- lahul mulku wa lahul hamd- Wa huwa \u2018alaa kulli shai\u2019en qadeer\u201D. Which means: \u201CThere is no deity worthy of worship except Allah, the One without a partner. The domain and the praise are His, and He is powerful over everything\u201D.

All of Arafat is a place for standing. Ascending the mountain of Arafat in not permitted. It is preferable to invoke much supplication. It is not necessary to keep standing or say under the sun, you are free to sit and to be sheltered.

Leaving Arafat for Muzdalefah: a) When the sun has set, go to Muzdalefah. When reaching it, pray Maghrib and Isha (combined and shortening the Isha prayer to two Rak\u2019ah with one Adhan and two Iqamahs) before reclining and collecting pebbles.

b) Stay overnight in Muzdalefah to perform the prayer of Fajr (down prayer) and keep busy supplicating waiting for the brightness of the morning is widespread. (Sleeping in Muzdalefah is compulsory) but weak individuals and women are allowed to proceed to Mena at any time after midnight, after the moon has completely disappeared to avoid the crowd.

c) Collect seven pebbles for stoning the Jamarat \u2013 ul Aqaba (a stone pillar in Mena). Any place you collect pebbles from is permissible.

d) Leave for Mena before the sun rises.

Stoning of Jamrat \u2013ul \u2013 Aqabah: Stone the Jamrat \u2013ul-Aqaba (it is the nearest one to Makkah) with seven consecutive pebbles glorifying Allah \u201D Allahu Akbar\u201D which means: \u201CAllah is the Greatest\u201D as you throw each pebble.

Slaughtering of Sacrifice: Slaughter the sacrificial animal (hady); eat some of it and distribute it among the needy. Slaughtering an animal is compulsory on Mutamatte and Qarin while for Mufrid it is preferred.

Shaving the head or Trimming: Have your head shaved or trimmed but shaving is better. (a woman can cut a finger tip length of her hair).

\u2022 If you have done stoning and shaving, you end the first phase of the state of Ihram (this is called the first Tahallul). It is also ok if you do two out of four e.g. stoning or shaving or Tawaaf and Sa\u2019yi.  (Slaughtering is not included because it is not compulsory for all pilgrims). If you do these four things completely with slaughtering (if it were compulsory), you end the second phase of the state of Ihram (this is called the second Tahallul). First Tahallul means: You can wear other clothing and do everything that was lawful before Ihram except physical contact with the spouse (with or without intercourse or kissing and so on). Second Tahallul means: Everything that you were prohibited from (by Ihram) has been allowed for you even women (sexual intercourse).

Sleeping the days of Tashreeq in Mena: (it is meant by sleeping here to spend the night \u2013 even a part f its time \u2013 in Mena whether awake or walking and it is not necessary to sleep).

Actions to be Done on the 11th, 12th and 13th Days of Tashreeq:

Stoning Jamarat during the days of Tashreeq: (The way of stoning): After the decline of the sun, throw pebbles at the three Jamrats, starting from the smaller one (the furthest one from Makkah), the medium one and the biggest alternatively. Throw seven pebbles at each Jamrat, glorifying Allah \u201CAllahu Akbar\u201D with each throw and perform much du\u2019a (supplicate) with raised hands after the smallest and medium Jamrat and don\u2019t stop after Jamrat\u2013ul-Aqabah.

Sleeping in Mena these days, as it is mentioned on the 10th day.

If you complete stoning on the 12th, and you want to leave earlier, leave Mena before the sun sets. If the sun sets before you are able to depart, remain in Mena on the 13th day and stone the three Jamrats early afternoon of that day.

Farewell Tawaaf: It is the final rite of Hajj. If you want to go to your country, circle the Kaaba seven times (Tawaaf al Wadaa) (farewell Tawaaf) in your clothes. And you have to leave Makkah. Otherwise if you stay, you have to repeat Tawaaf. (A menstruating woman or a woman having postnatal discharge would be exempted from Tawaaf al Wadaa).

The Fundamental Rites of Umrah:

The Compulsory Acts of Umrah:

The Fundamental Rites of Hajj:

* Missing any of these pillars, his/her Hajj will not be completed until he/her performs it.

The Compulsory Acts of Hajj:

Wearing Ihram from the Miqat.

Spending a day at Arafat.

Spending the night in Muzdalefah.

Staying in Mena (the days of Tashreeq).

Casting at the Jamarat.

Shaving off head or shortening the hair.

The Farewell Tawaaf.

For missing one of these compulsory acts, one must offer a sacrifice of an animal, slaughtered in Haram area and distributed among the poor and the needy of the Haram. He/She mustn\u2019t eat from it and his/her Hajj is correct. It is not permissible to leave any act on purpose.

Things Forbidden on a Person While in the State of Ihram:

Things forbidden on both men and women:

Removing hair from any parts of one\u2019s body.

Trimming of nails.

Using perfumes (avoid scented soap).

Physical sexual contact with the spouse with or without intercourse.

Wearing gloves.

Hunting (land) animals.

Contracting marriage or proposing for potential spouse, neither for you not for others.

Things forbidden on men; not women:

Wearing of sewed clothes.

Covering the man\u2019s head with anything that touches the head (umbrellas are ok.)

Things forbidden on women only: Wearing veils with holes for the eyes (Niqab) or Burqa. The Sunnah is for her to uncover her face except if men not related to her might see her. In such case, it is obligatory for her to cover her face during Ihram and otherwise.

Whoever performs any of these violations of Ihram due to forgetters, ignorance or by compulsion, he or she is not charged with expiation except hunting, here Fidyah (Kaffarah) is compulsory.

Note:  There are no other mosques or places in Madinah, which are to be visited. Therefore, do not burden yourself by visiting places for which there is no reward or for which, in fact, there might be some blame for doing so. By this, the hand book has been concluded. At the end, I ask Allah that this hand book to be of great benefit and make it with sincerity.`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/pillars-of-islam/280-the-rites-of-hajj-umrah-a-visiting-the-prophets-mosque-in-brief/",license:"Fair Use / Permitted Metadata",publication_date:"2012-10-12T15:04:26",created_at:"2026-08-23 09:55:28"},{id:"13845f65-8b0f-48ab-857a-e5881a19a57b",title:"Easy Guide For New Muslims",author:"Quran & Science",content:`1.1) Shahada

1.2) Pray five times a day (salat)

1.3) Fasting during Ramadan (sawm)

Introduction

Assalamu alaykum (peace be upon you)!

We would like to congratulate you upon taking the most important and meaningful decision of your life by submitting\xA0 to the will of our Creator and Sustainer, Allah.\xA0 On behalf of the almost two billion Muslims (and growing) from around the world we would like to welcome you with open arms.

Al-Hamdulillah, All Praise be to Allah, for turning our hearts to the true religion of Islam.

Islam is a religion of deep spiritual awareness, it is a way of life in which we strive to become closer to God with every action we take. The process of submitting to Allah is a life long dynamic experience in which the mind, heart and body come together in a complete, beautiful and balanced system of worship.

The material presented herein will be practical in nature. It will insha\u2019Allah provide you with guidelines to start building your relationship with Allah and will focus on the remaining four pillars of Islam as well as on basic information you may find valuable during your first months as a Muslim.\xA0 We sincerely hope and pray that you find this material useful and that you may benefit from it.

Return to the Menu

1) THE FIVE PILLARS OF ISLAM.

1.1) SHAHADA.

The testimony of faith will soon become the source of your guidance, and it will be the cement that will unite your entire life with Allah and His Messenger. There is no God but Allah, nothing worthy of worship except Him, nothing nor nobody can give or take away except what He has already prescribed for you. Converting to Islam is usually followed by great trials, and tremendous stress and anxiety. It may affect your work and your studies, and it may distance you from life-long friends and family members. These trial are meant to bring you closer to Allah and to develop a love towards His Messenger (peace be upon him) as you strive to learn more and understand better the new and bright life you have chosen for yourself. Rely upon Allah to help you work through your trials and hardships as you put your best effort forward. Remember that the Prophet, Allah\u2019s peace and blessing be upon him, went through even harder trials than you will ever go through, and so studying his life should be second only in importance to learning and understanding the Quran. His life will balance yours, the beauty of his character will beautify yours, and insha\u2019Allah every aspect of his life will inspire you to become a better human being.

Return to the Menu

1.2) PRAYER

Praying five times a day, an obligation on all Muslims, becomes our personal communion with God and is the foundation of our daily life. Prayer becomes the medium through which we search for peace, for inspiration, for protection against sinning, repentance, among many other things. It is therefore of paramount importance that you learn how to pray properly.

The best way to learn how to pray is through the help of another Muslim.\xA0 Befriend a good practicing Muslim and ask him/her for help, but to get you started the following explanation should prove to be useful.\xA0 As we mentioned above it is our duty to Allah to pray five times a day.\xA0 Each prayer should be performed within the timeframes as described below, with the starting and ending times for each one being available at most mosques or better yet, on-line.

Return to the Menu

Return to the Menu

PREPARING FOR YOUR PRAYER (Wudu)

Before you approach prayer you should purify yourself by performing ablution (Wudu). The first step in performing wudu is to intend it in your heart and by uttering, or saying in your mind, the words \u201Cbismillah\u201D (in the name of Allah).\xA0\xA0\xA0 Then rinse your palms up to the wrist three times, rinse your mouth thrice, wash your nose by sniffing water in it thrice, wash your\xA0 face three times, then wash your hands up to the elbow, the right hand first\xA0 then the left hand.\xA0 Then wipe your head with wet hands, rub your ears\xA0 with wet hands and finally wash your right feet up to the ankle thrice\xA0 and repeat it with your left foot.\xA0 When washing your hands, arms and feet you should always start with your right one and repeat it three times, as the Prophet taught us to do.\xA0 After you are finished you should say ashadu an-la ilaha illallahu, washadu anna Muhammadan abduhu wa rasuluh.

If you go to the bathroom for any of your necesities, pass wind, sleep or become unconscious, you should purify yourself again by following the same procedure as described above before the next prayer.\xA0 If you are in a state of major impurity (discharge of semen in erotic dreams or sexual intercourse) purify your body by taking a complete bath (Ghusl). Women should also take a bath after menstruation or child-birth.\xA0 The procedure is as follows (1)\xA0 have the intention of ghusl, (2) wash the private\xA0 parts, (3) perform ablution (wudu) as you do before prayer (4) put water\xA0 over the head (5) wash the whole body, head and hair thoroughly so as\xA0 not to leave a dry spot (6) say ashadu an-la ilaha illallahu, washadu anna Muhammadan abduhu wa rasuluh.\xA0 A Muslim is expected to do ghusl at least once a week is on Friday\xA0 before the congregational prayers, though nowadays it is hardly applicable as we take showers everyday.

Women are exempt from performing prayer during the days of menstruation and child-birth time.\xA0 As for other times, they are required to perform prayer\xA0 promptly.

Return to the Menu

HOW TO PERFORM PRAYER ((A Tutorial on Prayers \u2013 Press here))

Stand on a clean place, facing the Kaba in Mecca (northeast from US and Canada) and intend to perform the prayer.\xA0\xA0 An example of how to make intention for the morning prayer is \u201CI now intend to pray the\xA0 morning obligatory prayer, facing the Kaba, praying to Allah\u201D. The intention for prayer could be in any language, but the actual prayer\xA0 should be performed in Arabic which appears difficult at first, but\xA0 insha\u2019Allah you will gradually you\u2019ll learn it through practice, insha Allah.\xA0 Practice reciting with another Muslim for proper pronounciation, or using any of the interactive tools available from any islamic bookstore. Youcan also perform a search on the internet for sounds and other manuals on how to perform your prayers.

Following is a description on how to perform the morning prayer. It consists of two units and each unit is called a Rakah:

Then recite:

Then recite the Opening Chapter of the Quran (Sura Fatiha) .

yawmid-diin. Iyyaaka n\xE0budu wa iyyaaka nasta in. Ihdinas Siraatal Mustaqiim \u2013 siraatal-laziina an

amtaalayhim-gayril-magzuubi-alayhim-walazzaaalliin\u201D

Then read any portion of the Quran.\xA0 Example, recite Chapter 112 (Sura Ikhlas)

walam yakulla huu kufuwan ahad.\u201D

Then bow down, bending your head and back straight at a right angle, while putting both hands on the knees. This position is called Ruku, and in this position recite three times:

Then return to the standing position while saying

Then say \u201CAllahu Akbar\u201D and prostrate yourself with toes of both feet,\xA0 both knees, both hands and the forehead and nose touching the ground.\xA0 This position is called Sujud.\xA0 Recite three times:

Return to the sitting position while saying \u201CAllahu Akbar\u201D and after a brief pause prostrate once more saying:

Then stand upright again saying \u201CAllahu Akbar\u201D. This completes one unit or one Rakah.

While standing in the second unit (Rakah) again recite Sura Fatiha and\xA0 some other verses from the Quran, bowing, prostrating and repeating what\xA0 you did and said during the first Rakah.\xA0 However, after the second\xA0 prostration, instead of standing up, you should sit upright and recite the following:

Then recite:

And lastly say a short supplication such as the following:

punishment of the hellfire\u2019.

You finish your prayer by saying \u201Cas-salamu alaikum wa rahmatullah\u201D

while turning your face to the right and again saying \u201Cas-salamu alaikum wa rahmatullah\u201D while turning your face towards the left.\xA0 Meaning,\xA0 \u2018peace and mercy of Allah be upon you\u2019.

This completes the morning prayer of two Rakah (units)

The early afternoon, late afternoon and night (dhuhur, asr and isha) prayers consists of four rakah\xA0 each.\xA0 The\xA0 first two rakah of these prayers are performed in the same manner as the\xA0 morning prayer.\xA0 But after reciting the Tashahhud\xA0\xA0 you should stand and\xA0 continue to pray the third rakah(unit) reciting only sura Fatiha\xA0 and not joining it with other passages of the Quran.\xA0 Then in the fourth\xA0 rakah, sit down as you did in your second rakah and recite the Tashahhud,\xA0 Durud,\xA0 supplication and ending\xA0 the prayer as above.

Sunset prayer (Maghrib) prayer consists of three rakah.\xA0 First two rakah\xA0 are the same as above.\xA0 Stand up for the third rakah reciting surah Al Fatiha, then complete this rakah as you did the fourth rakah above.

Return to the Menu

FRIDAY PRAYER (JUMMA)

Muslims gather once a week for a congregational prayer called Jumma consisting of a short speach followed by two rakahs. It is obligatory for all Muslims males to\xA0 perform the Friday prayer in congregation, so if you work locate the mosque closest to your office and talk to your supervisor to let him/her know that you will be absent during that time. If you are a student, contact your local MSA to find out where Jumma is offered.\xA0 It is highly recommended to take a complete bath (ghusl) on Friday mornings before the Jumma prayer.

Return to the Menu

1.3) FASTING: THE MONTH OF RAMADAN

Ramadan, the month of fasting, is the ninth month of the Islamic calendar and will fall in different times of the year as the Islamic months follow the lunar calendar.\xA0Fasting is obligatory on all Muslims during this month with the following exceptions:\xA0 young, sick, travelers on a journey and menstruating women.\xA0 Foster mothers and\xA0 pregnant women are also exempt from fasting if it will harm them or\xA0 their babies.\xA0\xA0 However all missed fasts should be made up.

Through fasting you will gain enormous spiritual benefits.\xA0 The worship of Allah that consisted only of prayer and meditation now expands into the physical realm.\xA0 Your whole body is now united with your soul in the worshipping of our Creator and Sustainer, Allah.\xA0 But fasting also confers many physical benefits.\xA0 It cleanses our body of toxic compounds, rejuvenates our system, eradicates bad habits (like smoking), teaches self discipline. Fasting for thirty days may seem difficult, but gradually, insha Allah, you\u2019ll endure it with ease and patience with the help and company of your Muslim brothers and sisters and with the enormous rewards promised by Allah.

Fasting begins at dawn and ends at sunset.\xA0 During this period, intake of liquid or solid food, smoking, and sex \xA0is prohibited. A predawn meal (suhur) is usually taken before the fast begins and is highly recommended. The fast is broken as soon as the sunset prayer time comes in (maughrib) with healthy food and liquid (traditionally it is broken with dates, as the Prophet did) and should be done without any delay whatsoever. Precise timing for the start and finish of each fasting day can be obtained from the prayer timetables from the Mosques in your area.

Return to the Menu

1.4) ZAKAT (OBLIGATORY CHARITY)

Allah ordained every Muslim who possesses a certain amount of property\xA0 to pay the \u2018Zakat\u2019 (obligatory charity) annually out of their possessions. It is a purification of our wealth, immensely rewarded by Allah and brings economic balance in the society. It is usually 2.5 % of\xA0 our stored wealth.\xA0 Zakat is given usually during the month of Ramadan and is collected by many Mosques which then distribute it to the needy.\xA0 For precise calculation of\xA0 Zakat, contact\xA0 the Mosque nearest you to obtain a Zakat calculation Sheets.

Return to the Menu

1.5) PILGRIMAGE (HAJJ)

The pilgrimage to Mecca (in Saudi Arabia) is an obligation upon every Muslim and must be performed at least once in a life-time if physically and financially able.\xA0 This event takes place during the eleventh month of the Islamic Calendar and Muslims of all racial, socio-economic and ethnic backgrounds congregate in one place,\xA0 as one big family, worshiping One Lord, praying one way, wearing One kind of garments.\xA0\xA0 Hajj is symbolic of the oneness of mankind in the eyes of our Creator,\xA0 Allah.

If you are planning to go for Hajj, check the dates from the Islamic calendar.\xA0 Muslims in many Mosques undertake Hajj in groups.\xA0 Each group\xA0 is lead by an experienced Muslim who knows the various requirements and\xA0 procedures during Hajj.\xA0 It is advisable for a first timer or a new Muslim\xA0\xA0 to join one of these groups for guidance and support.\xA0 Advantage could\xA0 also be taken from various airlines and Mosques which provide complete\xA0 hajj packages which usually includes transportation, hotel accommodation\xA0 and guide.\xA0 Plan 4-6 months in advance before your Hajj trip.

Umrah, referred to as the minor pilgrimage, can be performed during any of other months of the year and is not obligatory

If you are interested, read the letter that brother Malcolm X wrote to his wife while performing Hajj, or check out this hajj guide for a good introduction to the largest pilgrimage that humans do every year.

Return to the Menu

2) GENDER RELATIONSHIP

If you are not married yet, Islam encourages marriage to avoid the risk of falling into temptations and indulging in bigger sins such as fornication\xA0 and adultery.\xA0 Allah, by His Divine Wisdom has forbidden all\xA0 pre-marital or extra-marital relationships.\xA0 Thus dating, hugging,\xA0 touching, lustful glances and thoughts of anyone besides your spouse is\xA0 forbidden.\xA0 The most recommended place to look for a spouse is to ask your Muslim brothers and sisters closest to you if they know anybody who is compatible with you.\xA0 Also, try getting yourself involved in islamic activities such as study groups or classes where you will have a chance to get to know more people and thus increase your exposure. Many Mosques and Islamic Magazines will have a Matrimonial Sections, or also on the internet there are many matrimonial sites that you could use in you search for your companion.

Marriage is considered half of your religion, therefore you are encourage to consider marriage as soon as you believe you are ready and able to fulfill your responsibilities as a husband or wife. Learn more about equity and women in Islam by reading some selected articles available on-line.

Return to the Menu

To maintain a pure heart and a sound mind, Islam provides the necessary dietary guidelines to nourish your soul\xA0 and maintain a clean and healthy body. Islam specifies what is halal (allowed) and haram (forbidden).\xA0 Forbidden for you to consume is pork and any of its by-products, animals which were slaughtered in the name of a deity other than Allah, alcohol of any type or any food prepared with alcohol, blood, animals found dead. It is only permisible for you to eat any of these foods if you are faced with a life or death situation and you need to eat them in order to survive, but even then you should only consume enough to keep you nourished. Along with alcohol, any sort of intoxicants such as drugs are also prohibitted.

A recommended and cautious way to shop around for grocery is to read\xA0 the labels on the food package or cans, or when eating at a restaurant ask your waiter if any of the ingredients include pork or alcohol (for instance, many dishes are made with mustard, and if dijon mustard is used then you can not eat it because white wine is an ingredient of all dijon mustards).\xA0 Some food packages have toll free 1-800 numbers,\xA0 call them if you are suspicious of any ingredient.

Return to the Menu

4) EARNING & SPENDING YOUR WEALTH/INCOME

The money we possess is viewed in Islam as a trust from Allah and as a test (either in excess or not) and therefore we should spend it paying close attention to the guidelines that He has given us through the Qur\u2019an and the example of the Prophet, peace and blessings of Allah be on him,.\xA0 The best sources to spend our wealth is on our own family, then on needy relatives, needy Muslims and in the general well-being and propagation of\xA0 Islam.

It is not allowed to spend money on gambling, prostitution, paying of interest or usury or buying of any unlawful goods even if you are purchasing it for someone else.\xA0 It is also unlawful to earn an income through illegitimate or forbidden means.\xA0 Therefore a Muslim can\u2019t earn his income through alcoholic beverages, pornographic magazines, interest based loans, unlawful food products, gambling tickets, and other similar activities. There are many articles available on-line that deal with the Islamic view of money and how to spend it, the more you read the better prepared you will be.

Return to the Menu

5) CLEANLINESS

Islam, as a complete way of life, gives guidance for matters of the heart and also matters of the body.\xA0 Physical purity means cleanliness of the body, the clothing and the environment.\xA0 Muslims should keep their body and clothing clean according to the prescribed rules of Islam.\xA0 A source of filthiness is without doubt the acts of relieving yourself when you go to the bathroom as it is necessary for you to wipe off the last drops of urine and feces with tissue paper and water to avoid them getting on your body or clothing.\xA0 When you go to the bathroom it is advisable to do so sitting down on the toilet, and keeping a bottle full of water to clean the remaining urine or feces off of your body.\xA0 You should hold the bottle with your right hand and clean your body with your left hand (this is one of the reason why you should eat your food with your right hand, and not with your left).

Return to the Menu

6) CONVEYING THE MESSAGE OF ISLAM

Conveying the message of Islam is of paramount importance for every Muslim.\xA0 Remember that Heaven and Hell are real and that the benefits of submitting to Allah are tremendous.\xA0 However, you should keep in mind that delivering the message is a life long process.\xA0 Your family and friends may not understand why you decided to change your religion from the one they taught you, so be patient and keep good relations with them as Allah has commanded you to do in the Qur\u2019an.\xA0 Strive to be the best human you can be, and Islam has provided you with the tools you will need to be the very best creature in creation. Avoid trying to present Islam all at once, but strive to convey the beauty of our religion, the beauty of the truth, over your entire life, and be neither condescending nor appologetic, but be sincere and kind. Strive to be like the Prophet Muhammad, Allah\u2019s peace and blessing be upon him, by studying his life and teachings (his sunna).

Return to the Menu

7) DEALING WITH YOUR FAMILY AND FRIENDS

Upon becoming a Muslim you will certainly find opposition and distress from your family members and friends.\xA0 It will probably be the greatest test you will go through in your starting life as a Muslim and can be a great source of grief and anxiety.\xA0 However, you should know that for the most part they are only concerned about you and want the best for you, therefore be patient, love them more than you have before, and let the beauty of Islam shine through you.\xA0 It may be a lifelong process, but be patient, because as Allah says in the Qur\u2019an \u201Cand verily with every hardship comes relief, verily with every hardship comes relief.\u201D (94:5-6)

Return to the Menu

8) INCREASING YOU KNOWLEDGE AND STRENGHTENING YOUR FAITH

The Prophet , peace and blessings of Allah be on him, said: \u201CHe who seeks a path to gain knowledge therein, Allah will make easy for him a path to Paradise.\u201D So strive to learn as much as you can, prepare a personal development plan, read a wide variety of books and apply that knowledge to your personal life. Surround yourself with good practicing Muslims, attend halaqas (study groups) and most importantly read the Quran as often as you can. Check out this list of suggested books prepared by the Islamic Foundation of North America, which contains a short criticism on each book.

Return to the Menu

Many people who come to Islam choose to change their name to an arabic name, or adopt an arabic nickname. This is not obligatory in Islam and in many cases is not recommended. The only time a name should be changed is when it carries a negative or insulting meaning, otherwise the universality of Islam is such that there are Muslims with names from Spanish, Italian, Chinese, Russian and many other origins.

Return to the Menu

10) COMMONLY USED ISLAMIC\xA0 TERMS

AL-HAMDU LILLAH: Praise be to Allah.\xA0 Should be said on all occasions and especially after sneezing.

ALLAH: The Name of the Creator of the universe.

SHAHADA: The creed of Islam: \u2018I bear witness that there is no deity worthy of worship except Allah, and

I bear witness that Muhammad is the Messenger of Allah.

SALAAT: Prayer

FAJR: Early morning prayer

ZUHR: Noon Prayer (early afternoon prayer)

ASR: Late afternoon prayer

MAGHRIB: Sunset Prayer

ISHA: Night Prayer

SAUM: Fasting

ZAKAT: Obligatory Charity

HAJJ: Pilgrimage to the Holy city of Makkah.

SURA: Chapter of the Quran. Quran has 114 Suras or chapters.

AYAH: Verse of the Holy Quran (also means a \u2018sign\u2019 of Allah)

BIDAH: Any innovated practices introduced in the religion of Islam.

BISMILLAH: \u2018In the Name of Allah\u201D, this statement is usually made by Muslims who are about to indulge in a lawful task.

DAWAH: Propagation of Islam through word and action, calling the people to follow the commandments of Allah.

DAJJAL: Anti-Christ.

DEEN: Usually translated as \u2018religion\u2019. Deen is a comprehensive word which means a total way of life, following the commandments of Allah.

DUA: Supplication: invoking Allah for whatever one desires.

EID-AL-ADHA: The feast of Sacrifice.\xA0 This feast commemorates the Prophet Abraham\u2019s obedience to Allah by being prepared to sacrifice his only son Ishmael. A four-day festival that completes the rites of pilgrimage and takes place on the 10th-13th of Dhul Hijjah (the last Islamic month)

EID AL-FITR: three day festival marking the end of Ramadan \u2013 the 9th month (the month of fasting).

FATIHA: The opening Chapter of the Quran.\xA0 Fatiha should be read in every prayer.

GHUSL: Full ritual washing of the body with water.\xA0 Ghusl should be done after sexual intercourse, wet dreams, emission, menses, childbirth.

HADEETH:\xA0 Sayings and traditions of the Holy Prophet Muhammad (peace be upon him)

HIJAB: Veil worn by Muslim women for reasons of modesty and protection.

IMAM: A person who leads the prayer and also for a famous Muslim Scholar.

IMAN: Truth, faith and acceptance.

ISA: Arabic word for Jesus Christ.

ISLAM: literally means \u2018submission to the will of Allah\u2019.

JAHANAM: Hell

JANNAH: Paradise.

JIBREEL: Angel Gabriel.

JIHAD: means struggling one\u2019s utmost to be a better person in the sight of Allah, and to establish Islamic way of life.

JINN: a race of created beings that are made out of smokeless fire.

JUMMA: \u2018Friday\u2019, the Muslim\u2019s day of gathering on Friday noon prayers.

KAABA: Holiest, and first shrine constructed for the worship of One God, Allah.\xA0 Muslims face towards the direction of the Kaaba, Makkah.

KAFIR: Unbeliever, who have rejected the truth of Islam.

KHALIFA: A Muslim ruler of an Islamic State.

KHUTBA: Sermon.

MALAIKAH: Angels.

MOSQUE: Mosque, places of worship for the Muslims.\xA0 In one sense the whole earth is a Mosque for the Muslims, The dome of the heavens its roof.

MASEEH: A title which means \u201CAnointed\u201D or \u2018Christ\u2019\xA0 Title given to Prophet Jesus.

MIRAJ: The night journey of the Holy Prophet Muhammad (peace be upon him) from Makkah to Jerusalem and then through the realms of the seven heavens.

MUHAMMAD: The name of the final Messenger and Prophet of God to Humanity.

MUHARRAM: The first month of the Islamic Calendar.

MUSLIM: Literally means \u2018submitting to the will\u2019, i.e. to the will of Allah, the Almighty.

QIBLA: Direction in which all Muslims face when praying, which is the Kaaba, in Makkah, Saudi Arabia.\xA0 The direction is north-east in the united states.

QURAN: The last revelation of Allah given to Humanity, through his last Prophet and Messenger, Muhammad \u2013 peace be upon him.

RAMADAN: The month of Fasting, the 9th month of the Islamic Calendar.

SAHABI: Companion of Prophet Muhammad \u2013 peace be upon him.

SAJDA: Prostration, as in prayer.

SALAAM: peace

SALLALLAHU ALAIHE WA SALLAM: means \u2018may the peace and blessings of Allah be upon him.\xA0 This phrase is recited whenever the name of the Prophet Muhammad (peace and blessing of Allah be upon him) is mentioned.

SHAITAN: Satan.

SHARIA: Islamic Law . It encompasses both the Quran and Hadith, the sayings of Prophet Muhammad (peace be upon him)

SHIRK: Associating partners with Allah.\xA0 The grave sin of Shirk is not forgiven if a person dies in that state.

SUBHAN ALLAH: means \u2018Glory be to Allah\u2019.

TAHARA: purification of body, clothing and souls.

TAWHEED: The Divine Unity, in its most profound sense.\xA0 Allah is One in His Essence and His Attributes and His Acts.

TAYAMMUM: Dry purification when water is not available or is detrimental to health.

UMRA:\xA0 A pilgrimage to Makkah, but not during the Hajj period.

WITR: A prayer which has an odd number of Rakat (units).\xA0 Usually referred to the last prayer of the night after the Isha prayer.

WUDU: Purifying with water before performing prayers.

Return to the Menu

11) CONCLUSION

Alhamdulillah herein we have presented you with a basic guideline that will insha\u2019Allah help you get started in this new stage of your life as a Muslim. Practice it, live it, and grow upon it, and Allah Almighty will bless your life with sweetness both in this world and in the hereafter. We sincerely pray that insha\u2019Allah Islam will bring fulfillment and peace to your life, tranquility to your heart and that this guide will be the starting point of building your relationship with your Creator, Sustainer and Caretaker which is Allah Almighty.

Congratulations again.\xA0 May Allah keep us on the straight path, strengthen us to live Islam to the fullest and make you and all\xA0 Muslims role models for the rest of humanity; may He grant us paradise and forgive our sins and shortcomings.\xA0 Ameen.`,source:"Quran and Science",original_url:"https://quranandscience.com/convert-to-islam/317-easy-guide-for-new-muslims/",license:"Fair Use / Permitted Metadata",publication_date:"2012-09-28T09:30:22",created_at:"2026-08-23 09:55:28"},{id:"ed100a1e-1964-413b-a552-1c250901b985",title:"The Banu Qurayza",author:"Quran & Science",content:`One of the main arguments that Christians often throw against the prophet Muhammad is his treatment of the Banu Qurayza tribe, they allege that what happened to the Jewish tribe was a crime, and something abhorrent, which proves that Muhammad (AS) couldn\u2019t be a true prophet.

In this article I shall discuss the incident in its full and proper context, by doing this we shall all see that the prophet Muhammad did not commit any crime, and that the Christians as usual have twisted the story, and not only have the Christians twisted the story, they have also shown their double standards.

So with that said let us proceed to the evidences, we go right to the start, when the prophet Muhammad entered the city of Medina. Now the city of Medina had a large Jewish population, so it was necessary for the Muslims to form some sort of agreement with the Jewish tribes, this would keep the law and order between the two groups, so the prophet Muhammad made a covenant with the Jewish tribes, a sort of constitution you could say. The covenant stated the following as we see from Ibn Ishaque\u2019s Sirat Rasul Allah:

This is a document from Muhammad the prophet between the believers and Muslims of Quraysh and Yahtrib, and those who followed them and joined and laboured with them. They are one community to the exclusion of all men. The Quraysh emigrants according to their present custom shall pay the bloodwit within their number and shall redeem their prisoners with the kindness and justice common among believers. The B. Auf according to their present custom shall pay the bloodwit they paid in heathenism; every section shall redeem its prisoners with the kindness and justice common among believers. The B. Saida the B. ?l-Harith, and the B. Jusham, and the B. al-Najjar likewise. The B. ?Amr b. Auf, the B. al-Nabit and the B. al-Aus likewise. Believers shall not leave anyone destitute among them by not paying his redemption money or bloodwit in kindness.

A believer shall not take as an ally the freedman of another Muslim against him. The God-fearing believers shall be against the rebellious or him who seeks to spread injustice, or sin or enmity, or corruption between believers; the hand of every man shall be against him even if he be a son of one of them. A believer shall not slay a believer for the sake of an unbeliever, nor shall he ain an unbeliever against a believer. God\u2019s protection is one, the least of them may give protection to a stranger on their behalf. Believers are friends one to the other to exclusion of outsiders. To the Jew who follows us belong help and equality. He shall not be wronged nor shall his enemies be aided. The peace of the believers is indivisible.

No Separate peace shall be made when believers are fighting in the way of God. Conditions must be fair and equitable to all. In every foray a rider must take another behind him. The believers must avenge the blood of one another shed in the way of God. The God-fearing believers enjoy the best and most upright guidance. No polytheist shall take the property or person of Quraysh under his protection unless the next of kin is satisfied (with blood money), and the believers shall be against him as one man, and they are bound to take actions against him. It is not lawful to a believer who holds by what is in this document and believes in God and the last day to help an evil-doer or to shelter him. The curse of God and his anger on the day of resurrection will be upon him if he does, and neither repentance nor ransom will be received from him. Whenever you differ about a matter it must be referred to God and to Muhammad.

The Jews shall contribute to the cost of war so long as they are fighting alongside the believers. The Jews of the B. Auf are one community with the believers (The Jews have their religion and the Muslims have theirs), their freedmen and their persons except those who behave unjustly and sinfully, for they hurt but themselves and their families. The same applies to the Jews of the B. al-Najjar, B. al-Harith, B. Saida, B. Jisham, B. al-Aus, B. Tha\u2019laba, and the Jafnam a clan of Tha\u2019laba and the B. al-Shutayba. Loyalty is protection against treachery. The freedman of Tha\u2019laba are as themselves. The close friends of the Jews are as themselves. None of them shall go out to war save the permission of Muhammad, but he shall not be prevented from taking revenge for a wound. He who slays a man without a warning slays himself and his household, unless it be one who has wrong him, for God will accept that. The Jews must bear their expenses and the Muslims their expenses. Each must help the other against anyone who attacks the people of this document. They must seek mutual advice and consultation, and loyalty is a protection against treachery.

A man is not liable for his ally\u2019s misdeeds. The wronged must be helped. The Jews must pay with the believers so long as war lasts. Yathrib shall be a sanctuary for the people of this document. A stranger under protection shall be as his host doing no harm and committing no crime. A woman shall only be given protection with the consent of her family. If any dispute or controversy likely to cause trouble should arise it must be referred to God and to Muhammad the apostle of God. God accepts what is nearest to piety and goodness in this document. Quraysh and their helpers shall not be given protection. The contracting parties are bound to help one another against any attack on Yathrib. If they are called to make peace and maintain it they must do so; and if they make a similar demand on the Muslims it must be carried out except in the case of a holy way. Every one shall have his portion from the side to which he belongs, the Jews of al-Aus, their freedmen and themselves have the same standing with the people of this document in pure loyalty from the people of this document.

Loyalty is a protection against treachery: He who acquires aught acquires it for himself. God approves of this document. This deed will not protect the unjust and the sinner. The man who goes forth to fight and the man who stays at home in the city is safe unless he has been unjust and sinned. God is the protector of the good and the God-fearing man and Muhammad is the apostle of God. (Alfred, Guillaume. The Life of Muhammad, A Translation of Ibn Ishaq\u2019s Sirat Rasu Allah. Oxford University press, 2002. PP. 231-232)

So as you can see this treaty laid out specific rulings, that the Muslims and the Jews would be allies to one another, and wouldn\u2019t aid an enemy against the other, and it even went further to specifically state that anyone who took the Qurayshi pagans as allies would suffer the consequences. With these clear rulings in place, let us now go the battle of the trench, the battle of the trench was basically a Qurayshi pagan offensive against the city Medina, the pagans were seeking to destroy the Muslim community once and for all, the events that took place during this incident are recorded by Ibn Ishaque, we read the following:

A number of Jews who had formed a party against the apostle\u2026went to Quraysh at Mecca and invited them to join them in an attack on the apostle so that they might get rid of them altogether. Quraysh said, ?You, O Jews, are the first scripture people and know the nature of our dispute with Muhammad. Is our religion the best or his? They replied that certainly their religion was better than his and they had a better claim to be in the right\u2026These words rejoiced the Quraysh and they responded gladly to their invitation to fight the aposle, and they assembled and made their preparations. Then the company of Jews went off to Ghatafan of Qays Aylan and invited them to fight the apostle and told them that they would act with them and that Quraysh had followed their lead in the matter; so they too joined in them. Quraysh marched under the leadership of Abu Sufyan\u2026When the apostle heard of their intention he drew a trench about Medina and worked at it himself encouraging the Muslims with hope of reward in heaven. The Muslims worked very hard with him\u2026When the apostle had finished the trench, Quraysh came and encamped where the torrent-beds of Ruma meet between al-Juruf and Zughaba with ten thousand of their black mercenaries and their followers from Najd and halted at Dhanab Naqma towards the direction of Uhud. The apostle and the Muslims came out with three thousand men having Sal\u2019 at their backs. He pitched his camp there with the trench between him and his foes, and have orders that the women and children were to be taken up into the forts. ( Ibid., pp. 450, 452-453)

Some points must be made, as you can see the Quraysh marched against Medina on the instigation of some Jewish leaders, the prophet eventually found out and dug a trench. Now the prophet Muhammad and the Muslims dug the trench at the north of Medina, the other parts of Medina were covered by tree fields and rocky hills, hence the prophet and the Muslims didn\u2019t need to dig trenches around Medina as a whole, but only from the North which was the main opening. Now at the south of Medina were the tribe of Banu Qurayza, who had made an agreement with the prophet Muhammad and the Muslims, these factors should all be kept in mind. Let us continue with the incident:

The enemy of God Huyayy b. Akhtab al-Nadri went out to Ka\u2019b b. Asad al-Qurazi who had made a treaty with the apostle. When Ka\u2019b heard of Huyayy\u2019s coming he shut the door of his fort in his face, and when he asked permission to enter he refused to see him, saying that he was a man of ill omen and that he himself was in a treaty with Muhammad and did not intend to go back on his word because he had always found him loyal and faithful. Then Huyayy accused him of shutting him out because he was unwilling to let him eat his corn. This so enraged him that he opened his door. He said, Good heavens, Ka\u2019b, I have brought you immortal fame and a great army. I have come with Quraysh with their leaders and chiefs which I have halted where the torrent-beds of Ruma meet; and Ghatafan with their leaders and chiefs which I have halted in Dhanab Naqma towards Uhud. They have made a firm agreement and promised me that they will not depart until we have made an end of Muhammad and his men. Ka\u2019b said: By God, you have brought me immortal shame and an empty cloud which had shed its water while it thunders and lightens with nothing in it. Woe to you Huyayy leave me as I am, for I have always found him loyal and faithful. Huyayy kept on wheedling Ka\u2019b until at last he gave way in giving him a solemn promise that if Quraysh and Ghatafan returned without having killed Muhammad he would enter his fort with him and await his fate. Thus Ka\u2019b broke his promise and cut loose from the bond that was between\xA0 him and the apostle.

When the apostle and the Muslims heard of this he apostle sent Sa\u2019d b. Mu\u2019adh b. al-Nu\u2019man who was chief of Aus at the time, and Sa\u2019d b. Ubada b. Dulaym\u2026They went forth and found the situation even more deplorable than they had heard; they spoke disparagingly of the apostle, saying, who is the apostle of God? We have no agreement or undertaking with Muhammad. (Ibid,. pp. 453)

So as you can see, the Banu Qurayza tribe broke the treaty between themselves and the Muslims, they decided to join the Qurayshi pagan onslaught, so the Muslims were now effectively surrounded from the north by the pagans, and the south by the Jewish tribe of Qurayza. So now the battle was all about wait and see, it was like a game of chess, the pagans were finding it very hard to launch a full offensive because of the trench, and the Jewish tribe would not attack on their own, they were waiting for the Qurayshi pagans to go full in, once the Qurayshi pagans went with their full force, the Jewish tribe of Qurayza would attack the Muslims from the south, this tactic would be an attempt to over-whelm the Muslims.

The prophet Muhammad knew the situation was very bad, so he had to act quick, and he came up with a plan to send a Muslim to infiltrate within the ranks of the Qurayza and the pagan army to cause distrust between the two:

Then Nu\u2019aym b. Mas\u2019ud b. Amir b. Unayf b. Tha\u2019alaba b. Qunfud b. Hilal b. Kalawa b. Ashja b. Rayth b. Ghatafan came to the apostle saying that he had become a Muslim though his own people did not know of it, and let him give what orders he would. The apostle said: you are only one man among us, so go and awake distrust among the enemy to draw them off us if you can, for war is deceit. Thereupon Nu\u2019aym went off to B. Quryaza with whom he had been a boon companion in heathen days, and reminded them of his affection for them and of the special tie between them. When they admitted that they did not suspect him he said: Quraysh and Ghatafan are not like you; the land is your land, your property, your wives, and your children are in it; you cannot leave it and go somewhere else. Now Quraysh and Ghatafan have come to fight Muhammad and his companions and you have aided against him, but their land, their property, and their wives are not here, so they are not like you. If they see an opportunity they will make the most of it; but if things go badly they will go back to their own land and leave you to face the man in your country and you will not be able to do so if you are left alone. So do not fight along with these people until you take hostages from their chiefs who will remain in your hands as security that they will fight Muhmmad with you until you make an end of him. The Jews said that this was excellent advice.

Then he went to Quraysh and said to Abu Sufyan b. Harb and his company: You know my affection for you and that I have left Muhammad. Now I have heard something which I think it my duty to tell you of by way of warning, but regard it as confidential. When they said that they would, he continued: Mark my words, the Jews have regretted their action in opposing Muhammad and have sent to tell him so, saying: Would you like us to get hold of some chiefs of the two tribes of Quraysh and Ghatafan and hand them over to you so that you can cut their heads off? Then we can join you in exterminating the rest of them. He has sent word back to accept their offer; so if the Jews send to you to demand hostages, don\u2019t send them a single man.

Then he went to Ghatafan and said: You are my stock and my family, the dearest of men to me, and I do not think that you can suspect me. They agreed that he was above suspicion and so he told the same story as he had told Quraysh. On the night of the Sabbath of Shawwal A.H. 5 it came about by God\u2019s action on behalf of his apostle that Abu Sufyan and the chiefs of Ghatafan sent Ikrima b. Abu Jahl to B. Qurayza with some of their number saying that they had no permanent camp, that the horses and camels were dying; therefore they must make ready for battle and make an end of Muhammad once and for all. They replied that it was the Sabbath, a day on which did nothing, and it was well known what had happened to those of their people who had violated the Sabbath. Moreover we will not fight Muhammad along with you until you give us hostages whom we can hold as security until we make an end of Muhammad; for we fear that if the battle goes against you and you suffer heavily you will withdraw at once to you country and leave us whole the man is in our country, and we cannot face him alone. When the messengers returned with their reply Quraysh and Ghatafan said that what Nu\u2019aym told you is the truth; so send to B. Qurayza that we will not give them a single man, and if they want to fight let them come out and fight. Having received this message B. Quryaza said: What Nu\u2019aym told you is the truth. The people are bent on fighting and if they get an opportunity they will take advantage of it; but if they do not they will withdraw to their own country and leave us to face this man here. So send word to them that we will not fight Muhammad with them until they give us hostages. Quraysh and Ghatafan refused to do so, and God sowed distrust between them, and sent a bitter cold wind against them in the winter nights which upset their cooking-pots and overthrew their tents.

Then Abu Sufyan said: O Quraysh, we are not in a permanent camp; the horses and camels are dying; the B. Qurayza have broken their word to us and we have heard disquieting reports of them. You can see the violence of the wind which leaves us neither cooking-pots, nor fire, nor tents to count on. Be off, for I am going! Then he went to his camel which was hobbled, mounted it, and beat it so that it got up on its three legs\u2026When Ghatafan heard of what Quraysh had done they broke up and returned to their own country. In the morning the apostle and the Muslims left the trench and returned to Medina, laying their arms aside. (Ibid,. pp 458-460)

So one Muslim managed to sow distrust between the Pagan Quraysh and the Jewish Quryaza, compounded with the bad weather conditions, the Pagans decided to retreat, and hence the Muslims came out victorious. So let us summarize what we have so far:

-The Muslims were in a treaty with the Banu Qurayza

-The Pagans launched an offensive against the Muslims

-The Banu Qurayza broke the treaty and joined the pagan offensive

-The Banu Qurayza were simply waiting for the pagans to launch their complete offensive against the Muslims so they too could launch their offensive against the Muslims from\xA0 the south

-The Banu Qurayza had every intention of killing the prophet Muhammad and the entire Muslim community

So with all of that said, the Banu Quryaza are far from innocent, off course the Christians don\u2019t bother to mention any of this, in fact the Christians probably support the pagan offensive as well as the Jewish betrayal! Perhaps the reasons Christians use this argument is because they are so angry that the enemies of God failed in their assault, and the Muslims survived, and this is why the Christians are so angry about this case.

Let us now continue with the incident, the battle has now ended, but Banu Qurayza\u2019s punishment is yet to come, we continue to read:

The prophet ordered it to be announced that none should perform the afternoon prayer until after he reached B. Qurayza. The apostle sent Ali forward with his banner and the men hastened to it. Ali advanced until he came near the forts he heard insulting language used of the apostle. (Ibid., pp.461)

So notice even after their treacherous act, the Jewish tribe are still asking for a fight, Ali went to their fort and they started insulting the prophet Muhammad, they do this instead of asking for forgiveness and apologising for their crime.

Now so far we have seen that the Quryaza tribe broke the treaty, and on top of that they aren\u2019t repentant and persist in their crimes, so therefore it is without a doubt that they do deserve a punishment, now this is one of the main arguments that is thrown on this case, which is that the Qurazya tribe were killed in a brutal fashion, well let us read about how this punishment came about:

In the Morning they submitted to the apostles judgement and al-Aus leapt up and said, O apostle, they are our allies, not allies of Khazraj, and you know how you recently treated the allies of our brethren. Now the apostle had besieged B. Qaynuqa who were allies of al-Khazraj and when they submitted to his judgement Abdullah B. Ubayy b. Salul had asked him for them and he gave them to him; so when al-Aus spoke thus the apostle said: Will you be satisfied, o Aus, if one of your own number pronounces judgement on them? When they agreed he said that Sa\u2019d b. Mu\u2019adh was the man\u2026Sa\u2019d said, Then I give judgement that the men should be killed, the property divide, and the women and children taken as captives. (Ibid,. pp. 464)

So the prophet allowed Sa\u2019d to judge over the Banu Qurayza tribe, and the prophet did this at a request of the Aus tribe who were allies with the Qurayza tribe, furthermore Sa\u2019d himself was a former Jew. Now Christians claim that this ruling is so wrong and barbaric, but here is the icing on the cake, Sa\u2019d a former Jew judged these Jews by THEIR OWN LAW! Here is the law from the Jewish Bible:

When thou comest nigh unto a city to fight against it, then proclaim peace unto it. And it shall be, if it make thee answer of peace, and open unto thee, then it shall be, that all the people that is found therein shall be tributaries unto thee, and they shall serve thee. And if it will make no peace with thee, but will make war against thee, then thou shalt besiege it: And when the LORD thy God hath delivered it into thine hands, thou shalt smite every male thereof with the edge of the sword: But the women, and the little ones, and the cattle, and all that is in the city, even all the spoil thereof, shalt thou take unto thyself; and thou shalt eat the spoil of thine enemies, which the LORD thy God hath given thee. (Deuteronomy 20:10-14)

So notice the double standards and hypocrisy of these Christians, they are attacking the prophet Muhammad for what happened to the Jews of Banu Qurayza, yet when this is in their own Bible they have no problem with it! The Jewish tribe of Qurayza were judged by their own book, their own law, and if Christians feel this is something detestable then they should go burn their Bible and rip this ruling out of their book.

So let us summarize everything we have:

-The prophet Muhammad was in a treaty with the Qurayza tribe

-The Qurayza tribe broke the treaty

-Once they broke the treaty they were liable for a punishment

-The Qurayza are not innocent

-The prophet Muhammad made Sa\u2019d the leader who would pronounce judgement over the Quryaza tribe

-The prophet did this at the request of the Al-Aus tribe, an ally of Qurayza

-Sa\u2019d a former Jew judged the Banu Qurayza by their own Torah, from Deuteronomy 20

So when you put all of this together, we see that no crime was committed, and that the Qurayza tribe are far from innocent, and that the prophet Muhammad didn\u2019t kill them just for the sake of being Jewish, or because he was supposedly evil.

So in conclusion I would advise the critics of Islam to be more sincere and honest in their arguments.

And Allah Knows Best!`,source:"Quran and Science",original_url:"https://quranandscience.com/prophet-muhammad/his-biography/215-the-banu-qurayza/",license:"Fair Use / Permitted Metadata",publication_date:"2012-09-14T13:01:31",created_at:"2026-08-23 09:55:28"},{id:"5ea64250-e33c-43eb-aadd-b1f2b428618f",title:"Where is the \u201CChrist\u201D in \u201CChristianity?\u201D",author:"Quran & Science",content:`Religious scholars have long attributed the tenets of Christian faith more to Paul\u2019s teachings than to those of Jesus.\xA0 But as much as I would like to jump into that subject, I think it best to back up and take a quick, speculative look at the Old Testament.

The Old Testament teaches that Jacob wrestled with God.\xA0 In fact, the Old Testament records that Jacob not only wrestled with God, but that Jacob prevailed (Genesis 32:24-30).\xA0 Now, bear in mind, we\u2019re talking about a tiny blob of protoplasm wrestling the Creator of a universe 240,000,000,000,000,000,000,000 miles in diameter, containing over a billion galaxies of which ours\u2014the Milky Way Galaxy\u2014is just one (and a small one, at that), and prevailing? \xA0I\u2019m sorry, but someone was a couple pages short of a codex when they scribed that passage.\xA0 The point is, however, that this passage leaves us in a quandary.\xA0 We either have to question the Jewish concept of God or accept their explanation that \u201CGod\u201D does not mean \u201CGod\u201D in the above verses, but rather it means either an angel or a man (which, in essence, means the Old Testament is not to be trusted).\xA0 In fact, this textual difficulty has become so problematic that more recent Bibles have tried to cover it up by changing the translation from \u201CGod\u201D to \u201Cman.\u201D \xA0What they cannot change, however, is the foundational scripture from which the Jewish Bible is translated, and this continues to read \u201CGod.\u201D

Unreliability is a recurring problem in the Old Testament, the most prominent example being the confusion between God and Satan! \xA0II Samuel 24:1 reads:

\u201CAgain the anger of the LORD was aroused against Israel, and He moved David against them to say, \u2018Go, number Israel and Judah.\u2019\u201D

However, I Chronicles 21:1 states: \u201CNow Satan stood up against Israel, and moved David to number Israel.\u201D

Uhhh, which was it? \xA0The Lord, or Satan? \xA0Both verses describe the same event in history, but one speaks of God and the other of Satan.\xA0 There is a slight (like, total) difference.

Christians would like to believe that the New Testament is free of such difficulties, but they are sadly deceived.\xA0 In fact, there are so many contradictions that authors have devoted books to this subject.\xA0 For example, Matthew 2:14 and Luke 2:39 differ over whether Jesus\u2019 family fled to Egypt or Nazareth.\xA0 Matthew 6:9-13 and Luke 11:2-4 differ over the wording of the \u201CLord\u2019s Prayer.\u201D \xA0Matthew 11:13-14, 17:11-13 and John 1:21 disagree over whether or not John the Baptist was Elijah.

Things get worse when we enter the arena of the alleged crucifixion: Who carried the cross\u2014Simon (Luke 23:26, Matthew 27:32, Mark 15:21) or Jesus (John 19:17)? \xA0Was Jesus dressed in a scarlet robe (Matthew 27:28) or a purple robe (John 19:2)? \xA0Did the Roman soldiers put gall (Matthew 27:34) or myrrh (Mark 15:23) in his wine? \xA0Was Jesus crucified before the third hour (Mark 15:25) or after the sixth hour (John 19:14-15)? \xA0Did Jesus ascend the first day (Luke 23:43) or not (John 20:17)? \xA0Were Jesus\u2019 last words, \u201CFather, \u2018into Your hands I commit my spirit\u2019\u201D (Luke 23:46), or were they \u201CIt is finished\u201D (John 19:30)?

These are only a few of a long list of scriptural inconsistencies, and they underscore the difficulty in trusting the New Testament as scripture.\xA0 Nonetheless, there are those who do trust their salvation to the New Testament, and it is these Christians who need to answer the question, \u201CWhere is the \u2018Christ\u2019 in \u2018Christianity?\u2019\xA0 \u201CThis, in fact, is a supremely fair question.\xA0 On one hand we have a religion named after Jesus Christ, but on the other hand the tenets of orthodox Christianity, which is to say Trinitarian Christianity, contradict virtually everything he taught.

I know, I know\u2014those of you who aren\u2019t screaming \u201CHeretic!\u201D \xA0are gathering firewood and planting a stake.\xA0 But wait.\xA0 Put down the high-powered rifle and listen.\xA0 Trinitarian Christianity claims to base its doctrines on a combination of Jesus\u2019 and Paul\u2019s teachings.\xA0 The problem is, these teachings are anything but complementary.\xA0 In fact, they contradict one another.

Take some examples: Jesus taught Old Testament Law; Paul negated it.\xA0 Jesus preached orthodox Jewish creed; Paul preached mysteries of faith.\xA0 Jesus spoke of accountability; Paul proposed justification by faith.\xA0 Jesus described himself as an ethnic prophet; Paul defined him as a universal prophet.[1] Jesus taught prayer to God, Paul set Jesus up as intercessor.\xA0 Jesus taught divine unity, Pauline theologians constructed the Trinity.

For these reasons, many scholars consider Paul the main corrupter of Apostolic Christianity and Jesus\u2019 teachings.\xA0 Many early Christian sects held this view as well, including the second-century Christian sects known as \u201Cadoptionists\u201D\u2013 \u201CIn particular, they considered Paul, one of the most prominent authors of our New Testament, to be an arch-heretic rather than an apostle.\u201D[2]

Lehmann contributes:

\u201CWhat Paul proclaimed as \u2018Christianity\u2019 was sheer heresy which could not be based on the Jewish or Essene faith, or on the teaching of Rabbi Jesus.\xA0 But, as Schonfield says, \u2018The Pauline heresy became the foundation of Christian orthodoxy and the legitimate church was disowned as heretical.\u2019 \u2026 Paul did something that Rabbi Jesus never did and refused to do.\xA0 He extended God\u2019s promise of salvation to the Gentiles; he abolished the law of Moses, and he prevented direct access to God by introducing an intermediary.\u201D[3]

Bart D. Ehrman, perhaps the most authoritative living scholar of textual criticism, comments:

\u201CPaul\u2019s view was not universally accepted or, one might argue, even widely accepted \u2026. Even more striking, Paul\u2019s own letters indicate that there were outspoken, sincere, and active Christian leaders who vehemently disagreed with him on this score and considered Paul\u2019s views to be a corruption of the true message of Christ \u2026.\xA0 One should always bear in mind that in this very letter of Galatians Paul indicates that he confronted Peter over just such issues (Gal. 2:11-14).\xA0 He disagreed, that is, even with Jesus\u2019 closest disciple on the matter.\u201D[4]

Commenting on the views of some early Christians in the Pseudo-Clementine literature, Ehrman wrote:

\u201CPaul has corrupted the true faith based on a brief vision, which he has doubtless misconstrued.\xA0 Paul is thus the enemy of the apostles, not the chief of them.\xA0 He is outside the true faith, a heretic to be banned, not an apostle to be followed.\u201D[5]

Others elevate Paul to sainthood.\xA0 Joel Carmichael very clearly is not one of them:

\u201CWe are a universe away from Jesus.\xA0 If Jesus came \u201Conly to fulfill\u201D the Law and the Prophets; If he thought that \u201Cnot an iota, not a dot\u201D would \u201Cpass from the Law,\u201D that the cardinal commandment was \u201CHear, O Israel, the Lord Our God, the Lord is one,\u201D and that \u201Cno one was good but God\u201D\u2026.What would he have thought of Paul\u2019s handiwork! Paul\u2019s triumph meant the final obliteration of the historic Jesus; he comes to us embalmed in Christianity like a fly in amber.\u201D[6]

Dr. Johannes Weiss contributes:

\u201CHence the faith in Christ as held by the primitive churches and by Paul was something new in comparison with the preaching of Jesus; it was a new type of religion.\u201D[7]

A new type of religion, indeed. \xA0And hence the question, \u201CWhere is the \u2018Christ\u2019 in \u2018Christianity?\u2019\xA0 \u201CIf Christianity is the religion of Jesus Christ, where are the Old Testament laws and strict monotheism of the Rabbi Jesus\u2019 Orthodox Judaism? \xA0Why does Christianity teach that Jesus is the son of God when Jesus called himself the \u201Cson of Man\u201D eighty-eight times, and not once the \u201Cson of God?\u201D \xA0Why does Christianity endorse confession to priests and prayers to saints, Mary and Jesus when Jesus taught his followers:

\u201CIn this manner, therefore, pray: \u2018Our Father \u2026\u2019\u201D (Matthew 6:9)?

And who appointed a pope? \xA0Certainly not Jesus. \xA0True, he may have called Peter the rock upon which he would build his church (Matthew 16:18-19).\xA0 However, a scant five verses later, he called Peter \u201CSatan\u201D and \u201Can offense.\u201D \xA0And let us not forget that this \u201Crock\u201D thrice denied Jesus after Jesus\u2019 arrest\u2014poor testimony of Peter\u2019s commitment to the new church.

Is it possible that Christians have been denying Jesus ever since? \xA0Transforming Jesus\u2019 strict monotheism to the Pauline theologians\u2019 Trinity, replacing Rabbi Jesus\u2019 Old Testament law with Paul\u2019s \u201Cjustification by faith,\u201D substituting the concept of Jesus having atoned for the sins of mankind for the direct accountability Jesus taught, discarding Jesus\u2019 claim to humanity for Paul\u2019s concept of Jesus having been divine, we have to question in exactly what manner Christianity respects the teachings of its prophet.

A parallel issue is to define which religion does respect Jesus\u2019 teachings.\xA0 So let\u2019s see: Which religion honors Jesus Christ as a prophet but a man? \xA0Which religion adheres to strict monotheism, God\u2019s laws, and the concept of direct accountability to God? \xA0Which religion denies intermediaries between man and God?

If you answered, \u201CIslam,\u201D you would be right.\xA0 And in this manner, we find the teachings of Jesus Christ better exemplified in the religion of Islam than in Christianity.\xA0 This suggestion, however, is not meant to be a conclusion, but rather an introduction.\xA0 Those who find their interest peaked by the above discussion need to take the issue seriously, open their minds and then \u2026 read on!

Copyright \xA9 2007 Laurence B. Brown.

About the author: Laurence B. Brown, MD, can be contacted at BrownL38@yahoo.com. \xA0He is the author of The First and Final Commandment (Amana Publications) and Bearing True Witness (Dar-us-Salam). \xA0Forthcoming books are a historical thriller, The Eighth Scroll, and a second edition of The First and Final Commandment, rewritten and divided into MisGod\u2019ed and its sequel, God\u2019ed

[1] Jesus Christ was one more prophet in the long line of prophets sent to the astray Israelites. As he so clearly affirmed, \u201CI was not sent except to the lost sheep of the house of Israel.\u201D (Matthew 15:24) When Jesus sent the disciples out in the path of God, he instructed them, \u201CDo not go into the way of the Gentiles, and do not enter a city of the Samaritans. But go rather to the lost sheep of the house of Israel.\u201D (Matthew 10:5-6) Throughout his ministry, Jesus was never recorded as having converted a Gentile, and in fact is recorded as having initially rebuked a Gentile for seeking his favors, likening her to a dog (Matthew 15:22-28 and Mark 7:25-30). Jesus was himself a Jew, his disciples were Jews, and both he and they directed their ministries to the Jews. One wonders what this means to us now, for most of those who have taken Jesus as their \u2018personal savior\u2019 are Gentiles, and not of the \u201Clost sheep of the house of Israel\u201D to whom he was sent.

[2] Ehrman, Bart D. The New Testament: A Historical Introduction to the Early Christian Writings. 2004. Oxford University Press. P. 3.

[3] Lehmann, Johannes. 1972. The Jesus Report. Translated by Michael Heron. London: Souvenir Press. pp. 128, 134.

[4] Ehrman, Bart D. 2003. Lost Christianities. Oxford University Press. Pp. 97-98.

[5] Ehrman, Bart D. 2003. Lost Christianities. Oxford University Press. P. 184.

[6] Carmichael, Joel, M.A. 1962. The Death of Jesus. New York: The Macmillan Company. p. 270.

[7] Weiss, Johannes. 1909. Paul and Jesus. (Translated by Rev. H. J. Chaytor). London and New York: Harper and Brothers. p. 130.`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/quran-on-jesus/251-where-is-the-christ-in-christianity/",license:"Fair Use / Permitted Metadata",publication_date:"2012-05-01T11:00:03",created_at:"2026-08-23 09:55:28"},{id:"e0565795-0355-4477-84f2-912795046673",title:"The Seven Earths",author:"Quran & Science",content:`The Sunnah of Prophet Muhammad is the second revealed source of Islam.\xA0 Like the Quran, it contains scientific information unavailable 1400 years ago.\xA0 From these miracles is the \u201Cseven\u201D earths, mentioned by the Prophet in several of his sayings.

From them are the following two:

It was narrated on the authority of Abu Salamah that a dispute arose between him and some other people (about a piece of land).\xA0 When he told Aisha (the Prophet\u2019s wife) about it, she said, \u2018O Abu Salamah! \xA0Avoid taking the land unjustly, for the Prophet said:

\u201CWhoever usurps even one span of land of somebody, its depth through the seven earths will be collared to his neck.\u201D (Saheeh Al-Bukhari, \u2018Book of Oppression.\u2019)

Salim narrated on the authority of his father that the Prophet said:

\u201CWhoever takes a piece of land of others unjustly, he will sink down the seven earths on the Day of Resurrection.\u201D (Saheeh Al-Bukhari, \u2018Book of Oppression.\u2019)

The aforementioned hadith prohibits oppression in general, especially the taking of a piece of land belonging to others unjustly.\xA0 What might the seven earths refer to?

Studies in geology have proven that the earth is composed of seven zones, identified from the inner to the outer layers as follows:

(1)\xA0 The Solid Inner Core of Earth: 1.7% of the Earth\u2019s mass; depth of 5,150 \u2013 6,370 kilometers (3,219 \u2013 3,981 miles)

The inner core is solid and unattached to the mantle, suspended in the molten outer core.\xA0 It is believed to have solidified as a result of pressure-freezing which occurs to most liquids when temperature decreases or pressure increases.

(2)\xA0 The Liquid Outer core: 30.8% of Earth\u2019s mass; depth of 2,890 \u2013 5,150 kilometers (1,806 \u2013 3,219 miles)

The outer core is a hot, electrically conducting liquid within which convective motion occurs.\xA0 This conductive layer combines with Earth\u2019s rotation to create a dynamo effect that maintains a system of electrical currents known as the Earth\u2019s magnetic field.\xA0 It is also responsible for the subtle jerking of Earth\u2019s rotation.\xA0 This layer is not as dense as pure molten iron, which indicates the presence of lighter elements.\xA0 Scientists suspect that about 10% of the layer is composed of sulfur and/or oxygen because these elements are abundant in the cosmos and dissolve readily in molten iron.

(3)\xA0 The \u201CD\u201D Layer: 3% of Earth\u2019s mass; depth of 2,700 \u2013 2,890 kilometers (1,688 \u2013 1,806 miles)

This layer is 200 to 300 kilometers (125 to 188 miles) thick and represents about 4% of the mantle-crust mass.\xA0 Although it is often identified as part of the lower mantle, seismic discontinuities suggest the \u201CD\u201D layer might differ chemically from the lower mantle lying above it.\xA0 Scientists theorize that the material either dissolved in the core, or was able to sink through the mantle but not into the core because of its density.

(4)\xA0 Lower Mantle: 49.2% of Earth\u2019s mass; depth of 650 \u2013 2,890 kilometers (406 -1,806 miles)

The lower mantle contains 72.9% of the mantle-crust mass and is probably composed mainly of silicon, magnesium, and oxygen.\xA0 It probably also contains some iron, calcium, and aluminum.\xA0 Scientists make these deductions by assuming the Earth has a similar abundance and proportion of cosmic elements as found in the Sun and primitive meteorites.

(5)\xA0 Middle Mantle (Transition region): 7.5% of Earth\u2019s mass; depth of 400 \u2013 650 kilometers (250-406 miles)

The transition region or mesosphere (for middle mantle), sometimes called the fertile layer, contains 11.1% of the mantle-crust mass and is the source of basaltic magmas.\xA0 It also contains calcium, aluminum, and garnet, which is a complex aluminum-bearing silicate mineral.\xA0 This layer is dense when cold because of the garnet.\xA0 It is buoyant when hot because these minerals melt easily to form basalt which can then rise through the upper layers as magma.

(6)\xA0 Upper Mantle: 10.3% of Earth\u2019s mass; depth of 10 \u2013 400 kilometers (6 \u2013 250 miles)

The upper mantle contains 15.3% of the mantle-crust mass.\xA0 Fragments have been excavated for our observation by eroded mountain belts and volcanic eruptions.\xA0 Olivine (Mg,Fe)2SiO4 and pyroxene (Mg,Fe)SiO3 have been the primary minerals found in this way.\xA0 These and other minerals are refractory and crystalline at high temperatures; therefore, most settle out of rising magma, either forming new material or never leaving the mantle.\xA0 Part of the upper mantle called the asthenosphere might be partially molten.

(7)\xA0 Lithosphere

Oceanic crust: 0.099% of Earth\u2019s mass; depth of 0-10 kilometers (0 \u2013 6 miles)

The rigid, outermost layer of the Earth comprising the crust and upper mantle is called the lithosphere.\xA0 The oceanic crust contains 0.147% of the mantle-crust mass.\xA0 The majority of the Earth\u2019s crust was made through volcanic activity.\xA0 The oceanic ridge system, a 40,000-kilometer (25,000 mile) network of volcanoes, generates new oceanic crust at the rate of 17 km3 per year, covering the ocean floor with basalt.\xA0 Hawaii and Iceland are two examples of the accumulation of basalt piles.

The continental crust contains 0.554% of the mantle-crust mass.\xA0 This is the outer part of the Earth composed essentially of crystalline rocks.\xA0 These are low-density buoyant minerals dominated mostly by quartz (SiO2) and feldspars (metal-poor silicates).\xA0 The crust (both oceanic and continental) is the surface of the Earth; as such, it is the coldest part of our planet.\xA0 Because cold rocks deform slowly, we refer to this rigid outer shell as the lithosphere (the rocky or strong layer).

The layers of the earth coincide with the above mentioned hadith of the Prophet.\xA0 The miracle is in two matters:

(1)\xA0 The expression of the hadith, \u2018He will sink down the seven earths on the Day of Resurrection,\u2019 indicates the stratification of these \u201Cearths\u201D around one center.

(2)\xA0 The accuracy with which the Prophet of Islam referred to the seven inner layers of earth.

The only way for a desert dweller to have known these facts 1400 years ago is through revelation from God.

Beatty, J. K. and A. Chaikin, eds.\xA0 The New Solar System.\xA0 Massachusetts: Sky Publishing, 3rd Edition, 1990.

Press, Frank and Raymond Siever.\xA0 Earth.\xA0 New York: W. H. Freeman and Company, 1986.

Seeds, Michael A. Horizons. Belmont, California: Wadsworth, 1995.

El-Najjar, Zaghloul. \xA0Treasures In The Sunnah: A Scientific Approach: Cairo, Al-Falah Foundation, 2004.`,source:"Quran and Science",original_url:"https://quranandscience.com/featured-articles/344-the-seven-earths-2/",license:"Fair Use / Permitted Metadata",publication_date:"2012-03-16T09:24:47",created_at:"2026-08-23 09:55:28"},{id:"ed5b9360-72d5-4dfb-a3a9-1c7634a5d532",title:"The Seven Earths",author:"Quran & Science",content:`The Sunnah of Prophet Muhammad is the second revealed source of Islam.\xA0 Like the Quran, it contains scientific information unavailable 1400 years ago.\xA0 From these miracles is the \u201Cseven\u201D earths, mentioned by the Prophet in several of his sayings.\xA0 From them are the following two:

It was narrated on the authority of Abu Salamah that a dispute arose between him and some other people (about a piece of land).\xA0 When he told Aisha (the Prophet\u2019s wife) about it, she said, \u2018O Abu Salamah! \xA0Avoid taking the land unjustly, for the Prophet said:

\u201CWhoever usurps even one span of land of somebody, its depth through the seven earths will be collared to his neck.\u201D (Saheeh Al-Bukhari, \u2018Book of Oppression.\u2019)

Salim narrated on the authority of his father that the Prophet said:

\u201CWhoever takes a piece of land of others unjustly, he will sink down the seven earths on the Day of Resurrection.\u201D (Saheeh Al-Bukhari, \u2018Book of Oppression.\u2019)

The aforementioned hadith prohibits oppression in general, especially the taking of a piece of land belonging to others unjustly.\xA0 What might the seven earths refer to?

Studies in geology have proven that the earth is composed of seven zones, identified from the inner to the outer layers as follows:

(1)\xA0 The Solid Inner Core of Earth: 1.7% of the Earth\u2019s mass; depth of 5,150 \u2013 6,370 kilometers (3,219 \u2013 3,981 miles)

The inner core is solid and unattached to the mantle, suspended in the molten outer core.\xA0 It is believed to have solidified as a result of pressure-freezing which occurs to most liquids when temperature decreases or pressure increases.

(2)\xA0 The Liquid Outer core: 30.8% of Earth\u2019s mass; depth of 2,890 \u2013 5,150 kilometers (1,806 \u2013 3,219 miles)

The outer core is a hot, electrically conducting liquid within which convective motion occurs.\xA0 This conductive layer combines with Earth\u2019s rotation to create a dynamo effect that maintains a system of electrical currents known as the Earth\u2019s magnetic field.\xA0 It is also responsible for the subtle jerking of Earth\u2019s rotation.\xA0 This layer is not as dense as pure molten iron, which indicates the presence of lighter elements.\xA0 Scientists suspect that about 10% of the layer is composed of sulfur and/or oxygen because these elements are abundant in the cosmos and dissolve readily in molten iron.

(3)\xA0 The \u201CD\u201D Layer: 3% of Earth\u2019s mass; depth of 2,700 \u2013 2,890 kilometers (1,688 \u2013 1,806 miles)

This layer is 200 to 300 kilometers (125 to 188 miles) thick and represents about 4% of the mantle-crust mass.\xA0 Although it is often identified as part of the lower mantle, seismic discontinuities suggest the \u201CD\u201D layer might differ chemically from the lower mantle lying above it.\xA0 Scientists theorize that the material either dissolved in the core, or was able to sink through the mantle but not into the core because of its density.

(4)\xA0 Lower Mantle: 49.2% of Earth\u2019s mass; depth of 650 \u2013 2,890 kilometers (406 -1,806 miles)

The lower mantle contains 72.9% of the mantle-crust mass and is probably composed mainly of silicon, magnesium, and oxygen.\xA0 It probably also contains some iron, calcium, and aluminum.\xA0 Scientists make these deductions by assuming the Earth has a similar abundance and proportion of cosmic elements as found in the Sun and primitive meteorites.

(5)\xA0 Middle Mantle (Transition region): 7.5% of Earth\u2019s mass; depth of 400 \u2013 650 kilometers (250-406 miles)

The transition region or mesosphere (for middle mantle), sometimes called the fertile layer, contains 11.1% of the mantle-crust mass and is the source of basaltic magmas.\xA0 It also contains calcium, aluminum, and garnet, which is a complex aluminum-bearing silicate mineral.\xA0 This layer is dense when cold because of the garnet.\xA0 It is buoyant when hot because these minerals melt easily to form basalt which can then rise through the upper layers as magma.

(6)\xA0 Upper Mantle: 10.3% of Earth\u2019s mass; depth of 10 \u2013 400 kilometers (6 \u2013 250 miles)

The upper mantle contains 15.3% of the mantle-crust mass.\xA0 Fragments have been excavated for our observation by eroded mountain belts and volcanic eruptions.\xA0 Olivine (Mg,Fe)2SiO4 and pyroxene (Mg,Fe)SiO3 have been the primary minerals found in this way.\xA0 These and other minerals are refractory and crystalline at high temperatures; therefore, most settle out of rising magma, either forming new material or never leaving the mantle.\xA0 Part of the upper mantle called the asthenosphere might be partially molten.

(7)\xA0 Lithosphere

Oceanic crust: 0.099% of Earth\u2019s mass; depth of 0-10 kilometers (0 \u2013 6 miles)

The rigid, outermost layer of the Earth comprising the crust and upper mantle is called the lithosphere.\xA0 The oceanic crust contains 0.147% of the mantle-crust mass.\xA0 The majority of the Earth\u2019s crust was made through volcanic activity.\xA0 The oceanic ridge system, a 40,000-kilometer (25,000 mile) network of volcanoes, generates new oceanic crust at the rate of 17 km3 per year, covering the ocean floor with basalt.\xA0 Hawaii and Iceland are two examples of the accumulation of basalt piles.

The continental crust contains 0.554% of the mantle-crust mass.\xA0 This is the outer part of the Earth composed essentially of crystalline rocks.\xA0 These are low-density buoyant minerals dominated mostly by quartz (SiO2) and feldspars (metal-poor silicates).\xA0 The crust (both oceanic and continental) is the surface of the Earth; as such, it is the coldest part of our planet.\xA0 Because cold rocks deform slowly, we refer to this rigid outer shell as the lithosphere (the rocky or strong layer).

The layers of the earth coincide with the above mentioned hadith of the Prophet.\xA0 The miracle is in two matters:

(1)\xA0 The expression of the hadith, \u2018He will sink down the seven earths on the Day of Resurrection,\u2019 indicates the stratification of these \u201Cearths\u201D around one center.

(2)\xA0 The accuracy with which the Prophet of Islam referred to the seven inner layers of earth.

The only way for a desert dweller to have known these facts 1400 years ago is through revelation from God.

Beatty, J. K. and A. Chaikin, eds.\xA0 The New Solar System.\xA0 Massachusetts: Sky Publishing, 3rd Edition, 1990.

Press, Frank and Raymond Siever.\xA0 Earth.\xA0 New York: W. H. Freeman and Company, 1986.

Seeds, Michael A. Horizons. Belmont, California: Wadsworth, 1995.

El-Najjar, Zaghloul. \xA0Treasures In The Sunnah: A Scientific Approach: Cairo, Al-Falah Foundation, 2004.`,source:"Quran and Science",original_url:"https://quranandscience.com/sunnah-a-science/203-the-seven-earths/",license:"Fair Use / Permitted Metadata",publication_date:"2012-03-16T09:24:47",created_at:"2026-08-23 09:55:28"},{id:"fb879f4a-e7d2-4238-8805-987b3fa8664b",title:"The people of Saba and the Arim flood",author:"Quran & Science",content:`Many centuries ago, the community of Saba was one of the four biggest civilisations which lived in South Arabia.

Historical sources relating to Saba usually say that this was a culture akin to that of the Phoenicians. It was particularly involved in commercial activities. The Sabaeans are recognised by historians as a civilised and cultured people. In the inscriptions of the rulers of Saba, words such as \u201Crestore,\u201D \u201Cdedicate\u201D and \u201Cconstruct\u201D are frequently used. The Ma\u2019rib Dam, which is one of the most important monuments of this people, is an important indication of the technological level this people had reached.

The Sabaean state had one of the strongest armies in the region and was able to adopt an expansionist policy thanks to its potent army. With its advanced culture and army, the Sabaean state was without question one of the \u201Csuper powers\u201D of the region at the time. This extraordinarily strong army of the Sabaean state is also described in the Qur\u2019an. An expression of the commanders of the Saba army related in the Qur\u2019an, shows the extent of the confidence this army had in itself. The commanders call out to the female ruler (Queen) of the state:

\u2026 \u201CWe possess strength and we possess great force. But the matter is in your hands so consider what you command.\u201D (Qur\u2019an, 27:33)

Because of the Ma\u2019rib Dam which had been constructed, with the help of quite advanced technology for that particular era, the people of Saba possessed an enormous irrigation capacity. The fertile soil they acquired by virtue of this technique and their control over the trade route permitted them a splendid lifestyle, full of well-being. However, instead of giving thanks to Allah for all this, the Qur\u2019an informs us that they actually \u201Cturned away from Him.\u201D Furthermore, they refused to heed the warnings and reminders issued to them. Because of these poor moral values, they merited punishment in the sight of Allah and their dams collapsed and the flood of Arim ruined all their lands.

The capital city of the Sabaean state was Ma\u2019rib, which was extremely wealthy thanks to its advantageous geographical position. The capital city was very close to the River Adhanah. The point where the river reached Jabal Balaq was very suitable for the construction of a dam. Making use of this condition, the Sabaean people constructed a dam at this location at the time when their civilisation was first established, and they began irrigation. As a result, they reached a very high level of economic prosperity. The capital city, Ma\u2019rib, was one of the most developed cities of the time. The Greek writer Pliny, who had visited the region and greatly praised it, also mentioned how green this region was.

The height of the dam in Ma\u2019rib was 16 metres, its width was 60 metres and its length was 620 metres. According to the calculations, the total area that could be irrigated by the dam was 9,600 hectares, of which 5,300 hectares belonged to the southern plain. The remaining part belonged to the northern plain. These two plains were referred to as \u201CMa\u2019rib and two plains\u201D in the Sabaean inscriptions. The expression in the Qur\u2019an, \u201Ctwo gardens to the right and to the left,\u201D points to the imposing gardens and vineyards in these two valleys. Thanks to this dam and its irrigation systems, the region became famous as the best irrigated and most fruitful area of Yemen. The Frenchman J. Holevy and the Austrian Glaser proved from written documents that the Ma\u2019rib dam existed since ancient times. In documents written in the Himer dialect, it is related that this dam rendered the territory very productive and was the heartbeat of the economy.

The dam that collapsed in 542 led to the flood of Arim and caused enormous damage. The vineyards, orchards and fields cultivated for hundreds of years by the people of Saba were completely destroyed. Following the collapse of the dam, the people of Saba appear to have entered a period of rapid contraction, at the end of which the Sabaean state came to an end.

When we examine the Qur\u2019an in the light of the historical data above, we observe that there is very substantial agreement here. Archaeological findings and the historical data both verify what is recorded in the Qur\u2019an. As mentioned in the verse, these people, who did not listen to the exhortations of their Prophet and who rejected faith, were in the end punished with a dreadful flood. This flood is described in the Qur\u2019an in the following verses:

There was, for Saba, aforetime, a Sign in their home-land-two Gardens to the right and to the left. \u201CEat of the Sustenance [provided] by your Lord, and be grateful to Him: a territory fair and happy, and a Lord Oft-Forgiving!\u201D But they turned away [from Allah], and We sent against them the Flood [released] from the dams, and We converted their two garden [rows] into \u201Cgardens\u201D producing bitter fruit, and tamarisks, and some few [stunted] Lote-trees. That was the Requital We gave them because they ungratefully rejected Faith: And never do We give [such] requital except to such as are ungrateful rejecters. (Qur\u2019an, 34:15-17)

In the Qur\u2019an, the punishment sent to the Sabaean people is named as \u201CSayl al-Arim\u201D which means the \u201Cflood of Arim.\u201D This expression used in the Qur\u2019an also tells us the manner in which this disaster occurred. The word \u201CArim\u201D means dam or barrier. The expression \u201CSayl al-Arim\u201D describes a flood that came about with the collapse of this barrier. Islamic commentators have resolved the issue of time and place being guided by the terms used in the Qur\u2019an about the flood of Arim. For example, Mawdudi writes in his commentary:

As also used in the expression, Sayl al-Arim, the word \u201Carim\u201D is derived from the word \u201Carimen\u201D used in the Southern Arabic dialect, which means \u201Cdam, barrier.\u201D In the ruins unearthed in the excavations made in Yemen, this word was seen to be frequently used in this meaning. For example, in the inscriptions which was ordered by Yemen\u2019s Habesh monarch, Ebrehe (Abraha), after the restoration of the big Ma\u2019rib wall in 542 and 543 AD, this word was used to mean dam (barrier) time and again. So, the expression of Sayl al- Arim means \u201Ca flood disaster which occurs after the destruction of a dam.\u201D \u201C\u2026 We converted their two garden [rows] into gardens producing bitter fruit, and tamarisks, and some few [stunted] Lote-trees\u201D (Qur\u2019an, 34:16). That is, after the collapse of the dam-wall, all the country was inundated by the flood. The canals that had been dug by the Sabaean people, and the wall that had been constructed by building barriers between the mountains, were destroyed and the irrigation system fell apart. As a result, the territory, which was like a garden before, turned into a jungle. There was no fruit left but the cherry-like fruit of little stumpy trees.

The Christian archaeologist Werner Keller, writer of \u201CUnd Die Bible Hat Doch Recht\u201D (The Holy Book Was Right), accepted that the flood of Arim occurred according to the description of the Qur\u2019an and wrote that the existence of such a dam and the destruction of the whole country by its collapse proves that the example given in the Qur\u2019an about the people of the garden was indeed realised.

After the disaster of the Arim flood, the region started to turn into a desert and the Sabaean people lost their most important source of income. Their lands, which had been agricultural havens of prosperity and financial strength, disappeared. The people, who had not heeded the call of Allah to believe in Him and to be grateful to Him, were in the end punished with this disaster.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/historical/332-the-people-of-saba-and-the-arim-flood/",license:"Fair Use / Permitted Metadata",publication_date:"2012-01-13T14:06:55",created_at:"2026-08-23 09:55:28"},{id:"f1581745-3145-4fbb-bfca-586ed0009559",title:"Jesus\u2026 a Follower of Muhammad?",author:"Quran & Science",content:`The Second Coming of Jesus

There are a large number of authentic sayings of Prophet Muhammad (peace and blessings of Allah be upon him) that clearly indicate the second coming of Jesus.

Abu Hurairah reported the Prophet as saying:

By the One in Whose hand is my self, definitely the son of Mariam will soon descend among you as a just judge, and he will break the cross, kill the pig and abolish the jizyah, and wealth will be so abundant that no one will accept it, until a single prostration will be better than the world and everything in it. (Al-Bukhari)

Jabir ibn \`Abdullah said, \u201CI heard the Prophet saying, \u2018A party of my nation will never stop fighting for the truth victoriously until the Day of Rising.\u2019 He said, \u2018Then Jesus son Mary (peace be upon him) will descend and their amir will say, \u201CCome and lead us in prayer,\u201D but he will say, \u201CNo. Some of you are amirs over others,\u201D as Allah\u2019s showing honor to this nation.'\u201D (Muslim)

A Follower of Muhammad

The above two hadiths show that according to Islam, Jesus will return to the earth as a follower of the final Prophet Muhammad. And at the second coming, it is inconceivable that Jesus will bring a new Law.

Even at the first coming, he was working within the framework of the earlier Law of Moses. So, if Jesus does not follow the Law of Muhammad, he should follow the Law of Moses, which is most unlikely.

We should remember that the religion of Allah has been completed through the final Prophet, and so there is no question of another Law at all; so Jesus has got to follow the Law of Muhammad.

We know that some \u201CChristians\u201D do not follow Jesus. They follow St Paul and his version of the religion of Jesus. So one of the first duties of Jesus will be to bring the Christians back to the true religion he preached and practiced, namely submission to the One God.

Also, the Jews who are still waiting for the Messiah will be made to realize that the real Messiah was indeed Jesus and they need to recognize that fact, and follow the Messiah (Christ) Jesus.

When the Christians and the Jews follow Jesus, they will be Muslims. By the second coming of Jesus, the confusions regarding Jesus will disappear and we can imagine a situation where Jews, Christians and Muslims join together to pray behind Islam\u2019s prophet Jesus, or behind a Muslim Imam.

Three Expectations

One important point to note in this connection is the correlation between the expectations about the coming of a prophet or messiah in all the three Abrahamic religions.

Jews expect the Mashiach (Messiah; literally \u201Cthe Anointed One\u201D ) as a political and military deliverer and king. The Christians believe the Messiah to be a divine incarnation and \u201Csavior\u201D,\xA0 who came to liberate the people from sin. And the Muslims believe the Messiah to be a sign to the world sent by God with a significant prophetic mission to the Children of Israel.

In all the three cases the word, Messiah (Arabic: Masih) is used for the expected prophet. Both Christians and Muslims believe Jesus to be the Messiah, while the Jews reject him and continue to expect the Messiah even now.

No one can deny the continuity of the same religious tradition through the three religions, though sectarianism has clouded the whole issue of common religious heritage.

One of the important links among the three religions ought to be the Messiah; especially as he serves as a link between Judaism and Islam. Because, he is the expected Messiah of the Jews, who clearly foretells to his followers of the coming of the Paracletos \u2013 the final Prophet.

Besides, he is properly described by Allah Almighty in the Qur\u2019an as a \u201Csign\u201D to the world. But most people did not properly understand the sign and consequently misconstrued his mission.

Jews Believing in Jesus?

As Jesus was a sign from Allah, there was an aura of wonder and mystery around him, which caused a lot of speculation among his followers after his time.

And there ought to be a way of clearing the cloud of mystery around Jesus before the end of the world. So Allah Almighty says in the Qur\u2019an what means:

*{That they said in boast, \u201CWe killed Christ Jesus the son of Mary, the Apostle of Allah\u201D;- but they killed him not, nor crucified him, but so it was made to appear to them, and those who differ therein are full of doubts, with no certain knowledge, but only conjecture to follow, for of a surety they killed him not. Nay, Allah raised him up unto Himself; and Allah is Exalted in Power, Wise. And there is none of the People of the Book but must believe in him before his death; and on the Day of Judgment he will be a witness against them\u2026}* (An-Nisaa\u2019 4:157-159)

Indeed these verses have generated a lot of controversy about the implication of certain words. A few points are worthy of note here:

The reference is clearly to the future; and the verse tells us of something that will happen in the future which will make the People of the Book to believe in Jesus. And we should note that by \u201Cthe People of the Book\u201D not merely the Christians but also the Jews are meant.

Referring to the doubts and confusion in the minds of the people (i.e. People of the Book) regarding \u201Cthe death\u201D and the \u201Craising\u201D of Jesus, Allah emphatically tells us that they did neither kill him nor crucify him;\xA0 but raised him up to Himself.

Believing in Jesus

The verses quoted above clearly say that all the People of the Book will believe in Jesus before he dies. Obviously, \u201Cbelieve in him\u201D indicates the right belief about Jesus, that is, that Jesus was a prophet of God preaching His Oneness.

We know that neither the present day Jews nor the present day Christians have this belief about Jesus. So the reference in the verse is obviously about future Jews and Christians who will be made to realize the truth about the Messiah and will have to accept that truth.

The occasion for this is when Jesus himself appears again and clears all misunderstandings about him. And then the Jews will realize that he was the Messiah they were expecting; and the Christians will realize that he was not the Son of God who died on the cross. And if there are any Muslims who reject the return of Jesus, they too will realize the truth about him.

And in the above verse, we may note the expression \u201Cbefore he dies\u201D. This expression is attributed to People of the Book sometimes; i.e. in the sense of \u201Cbefore their death\u201D.

But this cannot be; if so it would mean that all the Jews and Christians who lived after Jesus\u2019 time would realize the truth of Jesus before their death till Judgment Day.This is most unlikely. Rather the correct meaning of the verse must be that Jesus, on his second coming will bring the Jews and the Christians of that future time, not only to the truth of himself, but also to the true religion.

A careful evaluation of all the points related to the matter would lead us to the conclusion that Islam teaches that Jesus will come again and he will not bring a new Law then; so he would follow the Law of Muhammad.`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/quran-on-jesus/252-jesus-a-follower-of-muhammad/",license:"Fair Use / Permitted Metadata",publication_date:"2011-12-28T18:21:16",created_at:"2026-08-23 09:55:28"},{id:"51268a13-1600-4494-98dc-e8d4aed4781a",title:"Muslims worship a different God",author:"Quran & Science",content:`First of all, there is only One God who created the Universe and all of mankind.

Throughout history, people have created false gods in their minds and come up with false ideas about Almighty God, but regardless of this there is still only One True God \u2013 and He alone is worthy of worship. Unfortunately, some non-Muslims have come to incorrectly believe that Muslims worship a different God than Jews and Christians. This might be due to the fact that Muslims sometimes refer to God as \u201CAllah\u201D, but also because over the centuries there have been many lies and distortions spread by the enemies of Islam. In actuality, Muslims worship the God of Noah, Abraham, Moses and Jesus \u2014 the same God as Christians and Jews.

The word \u201CAllah\u201D is simply the Arabic word for Almighty God and it is the same word that Arabic speaking Christians and Jews use to refer to God. If you pick up an Arabic translation of the Christian Bible, you will see the word \u201CAllah\u201D where \u201CGod\u201D is used in English. But even though Muslims, Jews and Christians believe in the same God, their concepts about Him differ quite a bit. For example, Muslims reject the idea of the Trinity or that God has become \u201Cincarnate\u201D in the world. Also, the teachings of Islam do not rely on or appeal to \u201Cmystery\u201D or \u201Cparadox\u201D, they are straightforward and clear.

Islam teaches that God is Merciful, Loving and Compassionate and that He has no need to become man (nor do humans need for Him to). One of the unique aspects of Islam is that it teaches that man can have a personal and fulfilling relationship with Almighty God without compromising the transcendence of God. In Islam there is no ambiguity in Divinity, God is God and man is man. Muslims believe that God is the \u201CMost Merciful\u201D, and that he deals directly with human-beings without the need of any intermediary. Actually, the phrase \u201CIn the Name of God, the Compassionate, the Merciful\u201D is one of the most repeated verses in the Holy Quran. Additionally, the pure and straightforward teachings of Islam demand that Almighty God be approached directly and without intermediaries. This is because Muslims believe that God is completely in control of everything and that He can bestow His Grace and Mercy on His creatures as He pleases \u2013 no Atonement, Incarnation or blood sacrifice is necessary. In summary, Islam calls people to submit to the One True God and to worship Him alone without any partners.`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/fakes-about-islam/262-muslims-worship-a-different-god/",license:"Fair Use / Permitted Metadata",publication_date:"2011-12-13T13:44:49",created_at:"2026-08-23 09:55:28"},{id:"12baaae9-fe9d-43e7-9ae4-f699810fb179",title:"Scientific verses and translation of the Quran",author:"Quran & Science",content:`There are over seven hundred Ayat in the Quran that deal with scientific facts. In the present time, we understand many of those Ayat. Other Ayat imply different meanings, and we do not have enough information to interpret their meaning correctly.

This subject of the scientific miracle of the Quran is becoming increasingly fascinating. The available amount of work is so voluminous, and some of the studies are so scientifically detailed. It is very difficult to cover this huge subject in one book, let alone a chapter in a book. However, an attempt will be presented to introduce some of the recent advances in this subject.

The scientific verses in the Quran represent serious challenge to the atheists as well as the Christians. This challenge in no way represents a negative process, but a positive one that keeps humanity reflecting on the many miraculous signs of God as stated in the Quran. How else can anyone explain that an unlettered Arab in the seventh century stated scientific facts that became known after fourteen centuries? Can there be any reasonable explanation except that the Creator of all realities revealed these facts to him? These verses also serve the purpose of providing Muslims with yet another proof of the Divinity of the Quran.

The history of the scientific miracles of the Quran goes back to the time of the revelation to Muhammad (Pbuh). The Prophet and his companions had interpreted some verses according to human perception at that time. Also, the Hadith of the Prophet include many statements that deal with life sciences. The accuracy of those scientific statements is quite astounding considering the fact that he was unlettered. Dr. Abdel Razik Nofal wrote one on the pioneering books on this subject in Arabic with the title \u201CAllah and Modern Science.\u201D The book was an original attempt to explain the following Ayah:

Surah 54, Ayah 49 \u201CVerily, all things have we created in proportion and measure (perfection).\u201D

The author concentrated on the proportions that relate to life on earth and how they represent a perfect balance provided by Allah. For example, the amount of oxygen in the air is perfect; if it is less, humans will not be able to breathe; if it is more, fires could start everywhere. Also the distance of the earth from the sun is perfect; if it is less, we will burn from the heat of the sun; if it is more, we will freeze. Potentially deadly radiation is kept at bay by the terrestrial atmosphere. Carbon dioxide and water vapor help warm the surface, but there is no runaway effect because both are perfectly recycled in various ways. On earth, complex life forms exist consisting of human, vegetable and animal life, from microscopic bacteria to huge elephants, and from minute viruses to giant trees. Although the earth possesses a dense core surrounded by an outer crust and an atmosphere, it has this unique difference \u2013 life. During the twentieth century, it has become clear that life exists on earth only because conditions are perfect. Moreover, the chemical and biochemical environments are in perfect balance, to ensure not only the existence of living things but also their continuity.

During the last decades, the number of books and papers that deal with this subject, from Muslims and non-Muslims alike, increased tremendously. Many Muslims understood the orders from Allah to \u201Cread\u201D, \u201Clook\u201D, and \u201Cthink\u201D as a call for a better appreciation of the Power of God. Also, Islamic institutions exist in countries such as Saudi Arabia, Pakistan, and Egypt that focus on the scientific miracle in the Quran.

Translation of the Quran

Translating the whole Quran is a tremendous task. It requires scholars who are fluent in the Arabic language and the language to which the Quran is being translated. It also requires knowledge of the grammar of the two languages. If the translation is intended for those who are blessed with faith or for those who seek the basics of Islam, then the existing translations are a great dose of faith and spiritual guidance. May Allah rewards the translators of the Quran for their efforts in spreading the Words of God. If, on the other hand, the translation is intended to address the scientific miracles, the knowledge and mastering of the Arabic language is crucial as indicated in the case of the French surgeon Maurice Bucaille. He studied the Quran with an open mind for ten years. The purpose of his study was to form an opinion about contradictions in the Quran. He studied the Arabic language. Then after ten years of research, he declared in his books that he did not find one single scientific contradiction in the Quran. Another approach for the scientific translation of the Quran is to have an organization consisting of specialists of all branches of science such as cosmology, medicine, geology, anatomy, and engineering, as well as Islamic studies

Some non-Muslims scholars claim that the \u201Ctranslated\u201D Quran contradicts scientific known facts. There are many reasons for that. First, there may exist a conflict of theological interest. Second, the lack of knowledge of the Arabic language and its grammar can mislead the meaning of some verses. Also, the translation of the Quran to other languages may be, in some verses, difficult, thus not conveying the Arabic meaning of short sentences. Allah is the only Author of the Quran, and there are no contradictions in the Quran. Translations of the Quran are nevertheless the work of highly eminent Arabists. It is well known fact, that a translator, however an expert, is liable to make human mistakes in the translation of a highly specialized scientific Ayah, unless he happens to be a specialist in the discipline in question.

An example of translating scientific verses in the Quran deals with the definition of the building block of all matters. Atoms were assumed to be the smallest unseen part of matter. Neither the atom nor its components can be seen. However, each atom has a weight, and scientists discovered the constituents of the atom. In one such Ayah, Allah addresses the unbelievers with a challenge about the weight and components of atoms:

Surah 34, Ayah 3 \u201CThe unbelievers say\u2019 \u201Cnever for us will come the Hour (Day of Judgment): say, Nay. But most surely, by my Lord, it will come upon you by Him who knows the unseen. From Whom is not hidden the weight of an atom in the heavens or on earth: nor is there anything less than that or greater, but is in the Record Perspicuous.\u201D

The available translation refers to the above Arabic words \u201Cthe weight of an atom\u201D as \u201Cthe least little atom,\u201D and the word \u201Cweight\u201D is taken out. This demonstrates the difficulty in translating the Quran. Thank God, anyone can refer to the original Arabic text and get better translation. From the above Ayah, one can state the following:

\xB7 The atom is unseen.

\xB7 The atom is not the smallest thing in the universe.

\xB7 The atom has a weight.

Ancient commentators considered the weight of the atom to be equal to the weight of an ant! They believed this because the ant is the smallest thing that can be seen with the human eye. But this is not correct because the Ayah clearly refers to the unseen not the seen ant. When the fourth Caliph, Ali, the cousin of the Prophet, was asked about the meaning of the atom, he said:

\u201CIf we look inside the atom, any atom, we will see a sun in its core.\u201D This statement, showing the spiritual vision of Ali, was never understood until the twentieth century. But it clearly simulates the atomic structure with that of the solar system.

In my attempt to address the subject of the scientific miracles of the Quran, I tried to use the existing English translations. In many places, I found difficulty in using these translations. The following are some examples:

Stars are translated as planets, and planets are translated as stars.

The basic rules of the conjunctions in the Arabic language are not translated correctly. For example, existing translations do not address the difference between Arabic conjunctions \u201Cfa\u201D and \u201Cthumma\u201D. The first implies immediate succession, while the second implies succession after a delay in time, and this can make a big difference in some branches of science such as cosmology and embryology.

Some translators do not reflect the actual Arabic meaning or are unable to grasp the scientific meaning. For example, God states that He is expanding the universe; this is translated as the universe is \u201Cso expanse, to make wider, more spacious, to extend, to expand, we give generously.\u201D

Finally, there are rules for interpreting the Quran. The basic rule is that the Quran interprets itself. This implies that the words are divinely inspired; so any text can be interpreted in the light of other texts where the same word exists. Moreover, the statements of Muhammad interpreted many verses of the Quran. He was the living example of the teaching of the Quran.`,source:"Quran and Science",original_url:"https://quranandscience.com/the-holy-quran/quran-is-the-word-of-god/244-scientific-verses-and-translation-of-the-quran/",license:"Fair Use / Permitted Metadata",publication_date:"2011-10-10T09:05:40",created_at:"2026-08-23 09:55:28"},{id:"52b96bda-a5aa-4da1-9587-f47b6856374e",title:"Islam in words",author:"Quran & Science",content:`DOES GOD EXIST ?

{source}<script async src=\u201D//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js\u201D></script><!\u2013 Side_Banner \u2013><ins class=\u201Dadsbygoogle\u201D style=\u201Ddisplay:inline-block;width:336px;height:280px\u201D data-ad-client=\u201Dca-pub-6614722437984406\u2033 data-ad-slot=\u201D7906612176\u2033></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>{/source}

WHY IS RELIGION A COMMON FACT IN HUMAN NATURE ?

DO WE NEED GOD?

WHO IS GOD?

LOVING, MERCIFUL \xA0AND FORGIVING

BE GRATEFUL

PURPOSE OF OUR CREATION !

GET YOUR FREEDOM

ENJOY CLOSENESS TO GOD

TEST FOR LOVE

PEACE AND HAPPINESS

SELFISH DESIRES

WHAT IS YOUR DESTINATION ?

ONE GOD, ONE MESSAGE

INCARNATION

THE GLORIOUS QUR\u2019AN

WOMAN\u2019S DIGNITY & PURITY

A STOLEN RELIGION`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/what-is-islam/288-islam-in-words/",license:"Fair Use / Permitted Metadata",publication_date:"2011-09-28T18:41:03",created_at:"2026-08-23 09:55:28"},{id:"2c299da5-6326-40cc-b551-c88afbf72b1c",title:"The actual age of the universe",author:"Quran & Science",content:`The discovery of the expansion of the universe achieved by the astronomer Edwin Hubble at 1929, was based on the red shift of the faraway galaxies, red shift occurs when an object is receding far away from an observer, and so the object\xB4s light wave left behind it get elongated, light waves when elongated are shifted to red Fig.1.

When Hubble discovered that the light received from the galaxies located farther away from the Earth, is more red shifted, that means the farther galaxies receding speeds from the Earth are higher than the nearby ones, which means that as the farthest galaxies are speeding up\u207D\xB9\u207E, the whole universe containing them is receding from us, or by another way, it is expanding, but what is the relation between this and the age of the universe?

As we know that the light speed is constant, and the light speed is equal to the distance divided by time, this means estimating the distance of certain stars (Cephids variable stars) with knowing the speed of light, will estimate for us the time these stars took to recede from the Earth. When applying this idea on the whole universe that is also considered to be receding from a singularity point, with using extra equations, and the farthest seen galaxies, the age of the universe was calculated.

In addition, the farther these galaxies seemed to be, the greater the red shift, and thus the faster they seemed to be speeding away. This was the first direct evidence that the universe is not static but expanding. By calculating when all of the objects must have started speeding out from the same point yielded the first estimate of the age of the Universe.

According to science, the\xA0age of the universe\xA0is 13.75\xA0\xB1\xA00.11\xA0billion.\xA0This is however only the estimated time since the\xA0Big Bang. It is not known if something existed before the\xA0singularity that we call Big Bang, nor if time is linear, since the expansion estimated by\xA0Hubble\u2019s law assumed a linear expansion. Furthermore, as per scientists, calculating the age of the universe is only accurate if the assumptions built into the models being used to estimate it are also accurate, considering that:

\u201CBased on the fact they have assumed the underlying model they used is correct\u201D

However, the Big Bang model according to which these calculations were done is banged hardly nowadays by many scientists; Briane Greene is one of them. From my point of view as a mechanical engineer, the Big Bang cannot create a universe, neither any body can imagine that, the Big Bang should be considered as a moment that either set the universe to expand by itself, or pushed its constituents to expand, no more than that, this means their should be some other shape of the universe at the Bang time, am I right or am I wrong to consider it has a shape, can be further supported by the following discussion.

For a mechanical engineer, not like a physicist, the look to the universe is different, what we see in the universe are products, a product to be produced need a tool to make it, the tool model should have two basic requirements: a- Geometrical shape. B- Type of energetic movement. These are required to imprint its geometry on the product and to give it part of its motive energy to move it in a systematic meaningful guided way. The Big Bang only cause expansion and temperature decrease, but it destroys instead of creating a meaningful products shapes, the term gravity is inserted in-between the universe constituents as an additive that prevents the side effects of the Big Bang, but if we know that since the most amazing discovery \u207D\xB3\u207E at 1998 that the universe is accelerating in its expansion, nobody can persuade a scientist or a child that the gravity has held the universe constituents since a long time when the effect of the Big Bang expansion was great, while the gravity now became weak when the effect of the Big Bang decayed, neither can anybody explain how after the Big Bang by billions of years the universe started to accelerate its expansion, because any natural or manmade explosion in the nature after an accelerating expansion by a short period, and slowing down, can start again to accelerate it after a long period.

Also, the Big Bang constituents (celestial bodies, dark matter) after the Bang\u2019s power expanding effect decays should leave these in a natural fall, which we can not see today. So every point of thinking supports that a geometrical model should be standing behind the natural phenomena that we are discovering and seeing, that geometrical model should not only explain what we have discovered or seen, it should reveal what we do not know.

As the expansion of the universe is supporting the idea if we go by time backwards the universe should be smaller, and as the expansion of the universe supports the thermodynamic principle of temperature decrease (as size increase, temperature increase), which also is discovered to be applicable in the universe case, that means our assumed model should be naturally expanding, but as the 1998 discovery demands an acceleration in the expansion, our model should be also naturally accelerating in its expansion.

But what about the universe constituents? How can it be distributed normally all around inside the universe without falling down naturally?

If we search around us for a type of movement that can distribute a system constituents inside a 3D model naturally without falling down, we will find that it is by rotating the constituents, as in the hurricane, or sugar rotated inside a glass.

Now we added another requirement to our model, in addition to expansion, it iss rotating, if we try to draw a sketch for a 2D model, rotating and expanding, the shape will be a spiral, if we try to draw a 3D shape for it, it will be much like a scroll (nearly folded paper).

So, the assumed geometrical shape of the universe should be a spiral scroll, an expanding scroll. A quick direct fingerprint of a universe having this shape are the spiral galaxies, a quick look at an expanding scroll can show clearly it is accelerating in its expansion when set to move freely from a folded state, while it is distributing any constituents inside it upside down without falling, and with keeping it moving as every celestial object is moving in the universe.

Before calculating such universe actual age, we need to remember that light is the main tool to carry out that, but we need to remember also that the movement of this universe is not straight linear as that resulting from the Big Bang, it is Spiral Logarithmic.

But light in a non straight space (space-time) does not move straight, according to the results of Sir Arthur Eddington expedition, which carried out\xA0interpretations of the general relativity, light which is normally expected to be a beam following a straight line, is found to follow a curved path while passing a high gravity curved field (Fig. 2). While it is well-known that light passes in-between two different density mediums e.g.: from air to water, it suffers from deviation, while if we let it to pass through multi different increasing density mediums, it will suffer from a great deviation that will appear from far away to be curved. Also it is proved that the light passing from behind the galaxies towards us will be divided all around the galaxy\u2019s curved space, where it finally appears in our telescopes as a lens of light (Fig. 3).

Further phenomenon of light track suffering from bending, can be seen by the deflection of light (sent out from the location shown in blue (Fig. 4) near a compact body (shown in gray) Closely related to light deflection is the gravitational time delay (or Shapiro effect), the phenomenon that light signals take longer to move through a gravitational field than they would in the absence of that field. There have been numerous successful tests of this prediction.In the parameterized post-Newtonian formalism (PPN), measurements of both the deflection of light and the gravitational time delay determine a parameter called \u03B3, which encodes the influence of gravity on the geometry of space.^ Will 1993, sec. 7.1 and 7.2

So the light can bend, curve, delay while moving through the universe depending on the shape and strength of what is called gravitational field while passing through or nearby it were a high curvature of space-time is caused by huge masses concentration.

This means that the path of light is curving in space, when the density of the fabric of the cosmos (space-time) is changing, so we can further suppose if we twist the fabric of the cosmos in the space in away, that the density of this fabric is increasing gradually, from point to point, along the twisted space, the path of light will be twisted.

Now, what about the effect of a whole curved spiral universe on a beam of light moving from the borders of the universe towards our Earth?

If the heavens are rolled like a scroll, and expanding in a spiral track, this will lead us to assume that the light track will be twisted in the shape of a spiral through great astronomical distances, this means that the age of universe that we are measuring, may be different from the actual age, how?

As the light will move in a spiral way not straight linear track, from the point it appeared after the Big Bang happened, or the first stars light appearing until it reached us, this means that the light will follow a longer path from the point it left, to the point it reached. But how can we know how much is the pitch of the spiral way that light will follow, so that we can measure its distance length?

If we take a paper, and check which type of spiral shape it follows when it expands, we will find that any point on the paper scroll path, will increase its distance, and speed logarithmically, while moving away from the centre, this type of spiral path, is called a logarithmic spiral.\xA0For example, in Fig. 5, if we move from the centre (A) to point (C) in a straight line, we will pass 9 units of distance, while if we take the spiral way, we will pass around 27 units of distance, also we can see for each cycle of the spiral track, we moved away from the centre, we move 3 times the straight distance that we moved in the cycle prior to it, meaning for each cycle, we get logarithmically farther a way from the centre, the steps will not be equal, but will be increasing, because the acceleration of the expansion of the logarithmic spiral is increasing.

All the nature creatures, which follow a spiral track, are following a logarithmic spiral track, but in the universe case we do not know the pitch of the heavens scroll logarithmic spiral path, but if we consider that this spiral path has an effect and leaving a finger print on the spiral galaxies, we can take our galaxy first as an example. As we know our galaxy is assumed to have a spiral pitch nearly equal 12.

In Fig. 4, the pitch of the logarithmic spiral is 10, which is near the value of our galaxy pitch, if we supposed their is a light source at point (A) and we were observing it from point (C) we will see it crossing nine units of distance, if it follows a straight line, but if this light followed a curved path through the fabric of the cosmos in the whole universe in a spiral track as it should do, like the one shown in the Fig. 5, this light will cross 27 units of distance until reaching the Earth, so it will take 3 times the time that it will take, if it comes to us through the straight track, in another way, the time the light need to reach point C is delayed, and so it will measure a higher age.

This means for the same spiral shape in Fig. 5, if the straight distance between points (A) and (C) equals (4.567) units (where each unit equals 1 billion years), the length of the spiral track between points (A) and (C) will be 3 times of the (4.567) distance, which will equal (13.701) units, or 13.701 billion years which is \xA0the age of our universe, while the first number is the age of\xA0the oldest known solid constituents within\xA0meteorites that are formed within the solar system\xA0with an age nearly equal that of the Earth, the 13.701 billion years measured if divided by the scientific measured age of the universe, the result = 99.64 %.

Did our light follow such a spiral path, that it reached us delayed 3 times the actual time that it would take to reach us, if it went in a straight line between us and the universe first radiated light and hence it is measuring three times the actual age of the universe? With the assumed conclusion like that, is the age of the universe really equals that of the Earth?

But if the age of the Earth is equal to the age of the universe, from were did the Earth come, as it is assumed to be created from the Sun that is assumed to be created after the universe creation by nine billion years?

At this point it need to be noted that the Earth creation from the Sun is a scientific assumption, which can be falsified by knowing that the vast number of the Earth\u2019s elements are not available in the sun, furthermore the Sun is not rocky, not cold, no water, no life. Do not this means that the Earth has a special way of creation that can support life through infinite number of physical, biological, chemical\u2026 systems supported by life which still can not be created by all the humanity even in one cell.

But how can I support these results with other proofs?

The only one who know if the universe that is enveloped by the heavens has a shape of a scroll is only the one who created it, the only one who claimed that he created it is God (Allah) who claimed that through the books he sent down to his profits (Moses: Torah (Old Testament), Jesus: Bible, Mohammed: The Quran), so what did God mention about the heavens in his books?

In the Old Testament, we read the following:

Isaiah 34:4All the stars of the heavens will be dissolved and the sky rolled up like a scroll;

New American Standard Bible(\xA91995):And the sky will be rolled up like a scroll;

The phrases here indicates clearly that the end shape of the heavens or sky is like a scroll, but what is its shape of it at the beginning, if it is like a scroll, this means in-between the start and the ends its shape is a spiral logarithmic folded paper, but where can we get the answer and the proof?

Before more than 1400 years God also sent down the Quran to Mohammed who was not reading or writing, in the Quran we find the following:

(The Day when We will fold the heaven like the folding of a [written] sheet for the records. As We began the first creation, We will repeat it. [That is] a promise binding upon Us. Indeed, We will do it) (Surat Al-\u2018Anby\u0101\u2019: 104)

It is clear here that the Quran is adding that at the beginning of creation of the heaven its shape was like a folded sheet (a scroll), the verse further shows that the heaven will be folded back, which means the heaven will finish its expansion like an expanded scroll, which agree with what was mentioned in the Old Testament.

These proofs further agree with the greatest unexplained amazing scientific discovery, which is the accelerating expansion of the universe, which turned over most of our prior theories and models of the universe, were a scroll when released to expand, it will accelerate in its expansion.

But, to say the universe shape is like a scroll, implements that the actual age of the universe is shorter than the calculated cosmological one (13.72 billion years), it may be short until its equal the age of the Earth, but is the heavenly holy books are supporting that, that is to say the age of the heaven and the Earth are nearly equal\xA0\xA0 \xA04.5 \u2013 4.7 billion years?

Actually the Bible and Quran both agreed about the creation sequence, where the Bible mentioned the following:

\xABThe sun, moon, and stars were created only after\u201D the earth \u201Cbelow was created. \xBB (Gen. 1:9-18).

While in the Quran:

(It is He who created for you all of that which is in the earth. Then He directed Himself to the heaven, [His being above all creation], and made them seven heavens, and He is knowing of all things) (Surat Al Baqarah: 29)

So, the model proposed here for the shape of the universe, supports the discoveries related to the universe\u2019s a- accelerated expansion b- temperature decrease c- the symmetry of celestial bodies distribution d- their movements through the universe e- reshaping of the celestial bodies f- the driving power (dark energy) of the universe expansion which is the stored energy in the originally folded scroll.

It further supports what is mentioned in the holy books about the age of the heavens which is nearly equal to that of the Earth, it also supports the verse mentioned in the Quran about the heavens expansion which is the greatest scientific discovery in the history, but simply which is mentioned before that discovery by 13 centuries in the Holy Quran where the Quran mentioned:

(And the heaven We constructed with strength, and indeed, We are its expander) (Adh-Dh\u0101riy\u0101t: 47)

But for those who did not believe in God, I remind them by a further Quranic verse that is drawing a figure of the heavens end shape:

(They have not appraised Allah (God) with true appraisal, while the earth entirely will be [within] His grip on the Day of Resurrection, and the heavens will be folded in His right hand. Exalted is He and high above what they associate with Him) (Surat Az-Zumar: 67)

The reader can evaluate the article using the indicator at the top of the article.

Written by: Eng. Wasfi Amin Alshdaifat (Author, Inventor).

Email: wasfi974@gmail.com

1- A relation between distance and radial velocity among extra-galactic nebulae, Edwin Hubble, Proc Natl Acad Sci U S A.\xA01929 March 15;\xA015(3): 168\u2013173.

2- http://www.cyberphysics.co.uk/topics/space/redshift.htm

3- Observational evidence from supernovae for an accelerating universe and a cosmological constant, Adam G. Riess\xA0et al. 1998\xA0The Astronomical Journal 116\xA01009 doi:\xA010.1086/300499.

4- http://www.physicsoftheuniverse.com.

5- http://www.icarusinterstellar.org.

6- http://en.wikipedia.org/wiki/File:Light_deflection.png.

7- http://www.en.wikipedia.org/wiki/image:logarithmic_spiral.svg

8- Unified Spiral Nature of the Quantum & Relativistic Universe, Vladimir B. Ginzburg, 2002.

9- Unified Spiral Field and Matter \u2013 A Story of a Great Discovery, Vladimir B. Ginzburg, 1999.

10-Spiral Grain of the Universe: In Search of the Archimedes File, Vladimir B. Ginzburg, 1996.

11-Universe Revealed More- Continuing Einstein\u05F3s Revolution. Eng. Wasfi Amin Alshdaifat, 2008.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/islam-and-science-universe/295-the-actual-age-of-the-universe/",license:"Fair Use / Permitted Metadata",publication_date:"2011-08-27T12:21:04",created_at:"2026-08-23 09:55:28"},{id:"8da99bce-085d-4735-8752-f0c6b6be7624",title:"The Contraction motion that facilitates birth",author:"Quran & Science",content:`\u201CThe pains of labor drove her to the trunk of a date-palm. She said, \u2018Oh if only I had died before this time and was something discarded and forgotten!\u2019 A voice called out to her from under her, \u2018Do not grieve! Your Lord has placed a small stream at your feet. Shake the trunk of the palm towards you and fresh, ripe dates will drop down onto you.\u2019 (Surah Maryam, 23-25)

Modern medicine shows that squeezing an object during labor facilitates the baby\u2019s downward passage through the birth canal. The muscles used during contraction are the same as those that propel the baby outside the womb. Various methods are employed to achieve this, such as pulling on a cord suspended from the ceiling or on arms attached to the two sides of the bed or else holding onto and squeezing someone\u2019s hand.

A U-shaped bar, known as a \u201Csquat bar,\u201D mounted onto the bed during labor is used for that end. Pulling on this bar facilitates the baby\u2019s leaving the womb, shortens the length of the birth canal, widens the mouth of the womb and reduces the need for many other devices and techniques during labor.(1)

This bar helps the mother\u2019s squatting motions as she pulls herself up and down on it. It also means the mother remains immobile as the baby emerges.(2) In this position, the muscles needed to move the baby down the birth canal expend the minimum amount of energy. In addition, with the expansion of the pelvic bone, 30% more room is made available for the baby to pass through. With the expansion and contraction movement, the body\u2019s propulsive force is raised to the highest level and the baby is able to move smoothly during the birth process.

There is great wisdom in the way that, by means of Allah\u2019s angels, Maryam shook the branches of the palm tree toward her. The Arabic word \u201Chuzzee\u201D means \u201Cto shake fast, to move or to rock.\u201D\xA0 In addition to dates facilitating birth and having nutritious properties, pulling the branches toward one to shake them and then letting them pull back in another movement also facilitates birth. This technique applied in our own day, is one of the proofs that Allah supported Maryam (pbuh) with His compassion and that the Qur\u2019an is the word of our Lord, the Omniscient.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/human/145-the-contraction-motion-that-facilitates-birth/",license:"Fair Use / Permitted Metadata",publication_date:"2011-07-18T07:08:01",created_at:"2026-08-23 09:55:28"},{id:"1faaf63a-530c-4f61-8040-781984e1a8dc",title:"Al-Isra\u2019 and Al-Mi\u2018raj",author:"Quran & Science",content:`(The Miraculous Night Journey from Makkah to the Farthest Mosque in Jerusalem, and the Ascent through the Spheres of Heavens)

The last days of the Makkan phase of the Prophet\u2019s life are noted for alternate fortunes ranging between two extremes: gradual success and continual persecution. However, glimpses of propitious lights were looming on the distant horizon, to ultimately materialize in the event of the Prophet\u2019s Night Journey to Jerusalem and then Ascension through the spheres of the heavens.

As for its exact date, it is still controversial and no common consent has been reached. However, the majority of jurists is in favour of a date between 16-12 months prior to migration to Madinah. The following is a epitome of the details of that miraculous event narrated on the authority of Ibn Al-Qayyim.[Za\u2019d Al-Ma\u2019ad 2/49; Tareekh-e-Islam 1/124; Rahmat-al-lil\u2019alameen 1/76]

The Messenger of All\xE2h [pbuh] was carried in body from the Sacred Mosque in Makkah to the Distant Mosque in Jerusalem on a horse called Al-Buraq in the company of Gabriel, the archangel. There he alighted, tethered the horse to a ring in the gate of the Mosque and led the Prophets in prayer. After that Gabriel took him to the heavens on the same horse. When they reached the first heaven Gabriel asked the guardian angel to open the door of heaven. It was opened and he saw Adam, the progenitor of mankind. The Prophet [pbuh] saluted him and the other welcomed him and expressed his faith in Muhammad\u2019s Prophethood. He saw the souls of martyrs on his right and those of the wretched on his left.

Gabriel then ascended with the Prophet to the second heaven, asked for opening the gate and there he saw and saluted John, son of Zachariya (Yahya bin Zakariya) and Jesus, son of Mary. They returned the salutation, welcomed him and expressed their faith in his Prophethood. Then they reached the third heaven where they saw Joseph (Yusuf) and saluted him. The latter welcomed the Prophet and expressed faith in his Prophethood. The Prophet, in the company of Gabriel, then reached the fourth heaven where he met the Prophet Enoch (Idris) and saluted him. Prophet Enoch returned the salutation and expressed faith in his Prophethood. Then he was carried to the fifth heaven where he met the Prophet Aaron (Harun) and saluted him. The latter returned the salutation and expressed faith in his Prophethood. In the sixth heaven he met Moses (Musa) and saluted him. The latter returned the salutation and expressed faith in his Prophethood. Muhammad [pbuh] on leaving, saw that Moses began to weep. He asked about the reason. Moses answered that he was weeping because he witnessed a man sent after him as a Messenger (Muhammad) who was able to lead more of his people to the Paradise than he himself did. Then Prophet Muhammad [pbuh] reached the seventh heaven and met Abraham (Ibrahim)[AWS] and saluted him. The latter returned the salutation and expressed faith in his Prophethood. Then he was carried to Sidrat-al-Muntaha (the remotest lote tree) and was shown Al-Bait-al-Ma\u2018m\xFBr [(the much frequented house) which is like the Ka\u2018bah (Sacred House) encompassed daily by seventy thousand angels, so that the angels who once encompassed it would not have their turn again till the Resurrection]. He was then presented to the Divine Presence and experienced the thrill of witnessing the Divine Glory and Manifestation at the closest possible propinquity. There the Lord revealed unto His servant that which He revealed, and ordained fifty daily prayers for him. On his return, he spoke to Moses that his followers had been enjoined to pray fifty times a day. Moses addressing the Prophet [pbuh] said: \u201CYour followers cannot perform so many prayers. Go back to your Lord and ask for a remission in number.\u201D The Prophet [pbuh] turned to Gabriel as if holding counsel with him. Gabriel nodded, \u201CYes, if you desire,\u201D and ascended with him to the Presence of All\xE2h. The All-Mighty All\xE2h, Glory is to Him, made a reduction of ten prayers. He then descended and reported that to Moses, who again urged him to request for a further reduction. Muhammad [pbuh] once more begged his Lord to reduce the number still further. He went again and again in the Presence of All\xE2h at the suggestion of Moses for reduction in the number of prayers till these were reduced to five only. Moses again asked him to implore for more reduction, but he said: \u201CI feel ashamed now of repeatedly asking my Lord for reduction. I accept and resign to His Will.\u201D When Muhammad [pbuh] went farther, a Caller was heard saying: \u201CI have imposed My Ordinance and alleviated the burden of My servants.\u201D

There is however some difference as regards the issue whether the Prophet saw All\xE2h with his physical eye or not. Some interpreters say that seeing All\xE2h with his naked eyes was not confirmed. Ibn \u2018Abbas, on the other hand, says that the word Ru\u2019ya as used in the Noble Qur\u2019\xE2n signifies the observation with the help of the eye.

In S\xFBrah An\u2013Najm (Chapter \u2014The Star) we read:

\u201CThen he approached and came closer.\u201D [Al-Qur\u2019an 53:8]

Here (he) refers to archangel Gabriel, and this context is completely different from that in the Prophetic tradition of Isra\u2019 and Mi\u2018raj, where \u2018the approach\u2019 relates to that of the Lord, Glory is to Him.

Some significant suggestive incidents featured the \u2018Night Journey\u2019 of the Prophet, of which we could mention:

The disbelievers, however, found it a suitable opportunity to jeer at the Muslims and their creed. They pestered the Prophet [pbuh] with questions as to the description of the Mosque at Jerusalem, where he had never gone before and, to the astonishment of many, the Prophet\u2019s replies furnished the most accurate information about that city. He supplied them with all the news about their caravans and the routes of their camels. However, all this increased in them nothing but flight from the Truth, and they accepted nothing but disbelief.

For the true Muslims, however there was nothing unusual about the Night Journey. The All-Mighty All\xE2h, Who is Powerful enough to have created the heavens and the earth by an act of His Will, is surely Powerful enough to take His Messenger beyond the heavens and show him those signs of His at firsthand which are inaccessible to man otherwise. The disbelievers on their part went to see Abu Bakr on account of this event, and he readily said: \u201CYes, I do verify it.\u201D It was on this occasion that he earned the title of As-Siddiq (the verifier of the truth). [Ibn Hisham 1/399]

The most eloquent and most concise justification of this \u2018Journey\u2019 is expressed in All\xE2h\u2019s Words:

\u201C\u2026 in order that We might show him (Muhammad) of Our Ay\xE2t (proofs, evidences, signs, etc.)\u201D [Al-Qur\u2019an 17:1].

The Divine rules as regards the Prophets goes as follows:

\u201CThus did We show Abraham the kingdom of the heavens and the earth that he be one of those who have Faith with certainty.\u201D [Al-Qur\u2019an 6:75]

To Moses, his Lord said:

\u201CThat We may show you (some) of Our Greater Signs.\u201D [Al-Qur\u2019an 20:23]

In order that:

\u201CHe be of those who have Faith with certainty.\u201D

The Prophets, after seeing All\xE2h\u2019s Signs, will establish their Faith on solid certainty too immune to be parted with. They are in fact eligible for this Divine privilege because they are the ones who will bear burdens too heavy for other ordinary people to carry, and in the process of their mission, they will regard all worldly ordeals and agonies too small to care about.

There are simple facts that emanate from this blessed Journey, and flow along into the flowery garden of the Prophetic biography; peace and blessings of All\xE2h be upon its author, Muhammad. The story of \u2018the Night Journey\u2019 as we see in the Noble Qur\u2019\xE2n is epitomised in the first verse of the S\xFBrah Isra\u2019(Chapter 17 \u2014 The Journey by Night) then there is a quick shift to uncover the shameful deeds and crimes of the Jews, followed by an admonition saying that the Qur\u2019\xE2n guides to that which is most just and right. This arrangement is not in fact a mere coincidence. Jerusalem was the first scene of the Night Journey, and here lies the message directed to the Jews and which explicitly suggested that they would be discharged of the office of leadership of mankind due to the crimes they had perpetrated and which no longer justified their occupation of that office. The message suggested explicitly that the office of leadership would be reinstituted by the Messenger of All\xE2h [pbuh] to hold in his hand both headquarters of the Abrahamic Faith, the Holy Sanctuary in Makkah and the Farthest Mosque in Jerusalem. It was high time for the spiritual authority to be transferred from a nation whose history got pregnant with treachery, covenant-breaching and aggression to another nation blessed with piety, and dutifulness to All\xE2h, with a Messenger who enjoys the privilege of the Qur\u2019\xE2nic Revelation, which leads to that which is best and right.

There, however, remains a crucial question waiting to be answered: How could this foreseen transition of authority be effected while the champion himself (Muhammad) was left deserted and forsaken stumbling in the hillocks of Makkah? This question per se uncovered the secrets of another issue which referred to a phase of the Islamic Call and the appearance of another role it was about to take up, different in its course and noble in its approaches. The forerunners of that new task took the shape of Qur\u2019\xE2nic verses smacking of direct and unequivocal warning accompanied by a severe ultimatum directed to the polytheists and their agents:

\u201CAnd when We decide to destroy a town (population), We (first) send a definite order (to obey All\xE2h and be righteous) to those among them [ or We (first) increase in number those of its population] who are given the good things of this life. Then, they transgress therein, and thus the word (of torment) is justified against it (them). Then We destroy it with complete destruction. And how many generations (past nations) have We destroyed after Noah! And Sufficient is your Lord as an All-Knower and All-Beholder of the sins of His slaves.\u201D [Al-Qur\u2019an 17:16, 17]

Together with these verses, there were others revealed to show the Muslims the rules and items of the civilization upon which they could erect their Muslim community, and foreshadowing their ownership of a piece of land, exercising full freedom over it and establishing a coherent society around whose axis the whole humanity would rotate. Those verses in reality implied better prospects for the Prophet [pbuh] comprising a secure shelter to settle in, and headquarters safe enough to empower and embolden him to communicate his Message to all the world at large; that was in fact the inner secret of that blessed journey. For this very wisdom and the like we deem it appropriate to suggest that \u2018the Night Journey\u2019 took place either before the First Pledge of \u2018Aqabah or between the two; after all, All\xE2h knows best.`,source:"Quran and Science",original_url:"https://quranandscience.com/prophet-muhammad/his-biography/216-al-isra-and-al-miraj/",license:"Fair Use / Permitted Metadata",publication_date:"2011-06-17T09:16:40",created_at:"2026-08-23 09:55:28"},{id:"5aa10831-2926-420e-a576-52b0f7a26843",title:"The fall of atheism",author:"Quran & Science",content:`There are significant turning points in the history of mankind. We are now living in one of them. Some call it globalization and some say that this is the genesis of the \u201Cinformation age.\u201D

These are true, but there is yet a more important concept than these. Although some are unaware of it, great advances have been made in science and philosophy in the last 20-25 years. Atheism, which has held sway over the world of science and philosophy since the 19th century is now collapsing in an inevitable way.

Of course, atheism, the idea of rejecting God\u2019s existence, has always existed from ancient times. But the rise of this idea actually began in the 18th century in Europe with the spread and political effect of the philosophy of some anti-religious thinkers. Materialists such as Diderot and Baron d\u2019Holbach proposed that the universe was a conglomeration of matter that had existed forever and that nothing else existed besides matter. In the 19th century, atheism spread even farther. Thinkers such as Marx, Engels, Nietsche, Durkheim or Freud applied atheist thinking to different fields of science and philosophy.

The greatest support for atheism came from Charles Darwin who rejected the idea of creation and proposed the theory of evolution to counter it. Darwinism gave a supposedly scientific answer to the question that had baffled atheists for centuries: \u201CHow did human beings and living things come to be?\u201D This theory convinced a great many people of its claim that there was a mechanism in nature that animated lifeless matter and produced millions of different living species from it.

Towards the end of the 19th century, atheists formulated a world view that they thought explained everything; they denied that the universe was created saying that it had no beginning but had existed forever. They claimed that the universe had no purpose but that its order and balance were the result of chance; they believed that the question of how human beings and other living things came into being was answered by Darwinism. They believed that Marx or Durkheim had explained history and sociology, and that Freud had explained psychology on the basis of atheist assumptions.

However, these views were later invalidated in the 20th century by scientific, political and social developments. Many and various discoveries in the fields of astronomy, biology, psychology and social sciences have nullified the bases of all atheist suppositions.

In his book, God: The Evidence, The Reconciliation of Faith and Reason in a Postsecular World, the American scholar Patrick Glynn from the George Washington University writes:

The past two decades of research have overturned nearly all the important assumptions and predictions of an earlier generation of modern secular and atheist thinkers relating to the issue of God. Modern thinkers assumed that science would reveal the universe to be ever more random and mechanical; instead it has discovered unexpected new layers of intricate order that bespeak an almost unimaginably vast master design. Modern psychologists predicted that religion would be exposed as a neurosis and outgrown; instead, religious commitment has been shown empirically to be a vital component of basic mental health\u2026

Few people seem to realize this, but by now it should be clear: Over the course of a century in the great debate between science and faith, the tables have completely turned. In the wake of Darwin, atheists and agnostics like Huxley and Russell could point to what appeared to be a solid body of testable theory purportedly showing life to be accidental and the universe radically contingent. Many scientists and intellectuals continue to cleave to this worldview. But they are increasingly pressed to almost absurd lengths to defend it. Today the concrete data point strongly in the direction of the God hypothesis.

Science, which has been presented as the pillar of atheist/materialist philosophy, turns out to be the opposite. As another writer puts it, \u201CThe strict materialism that excludes all purpose, choice and spirituality from the world simply cannot account for the data pour in from labs and observatories.\u201D

In this article, we will briefly analyze the conclusions arrived at by different branches of science on this issue and examine what the forthcoming \u201Cpost-atheist\u201D period will bring to humanity.

Cosmology: The Collapse of the Concept of An Eternal Universe And the Discovery of Creation

The first blow to atheism from science in the 20th century was in the field of cosmology. The idea that the universe had existed forever was discounted and it was discovered that it had a beginning; in other words, it was scientifically proved that it was created from nothing.

This idea of an eternal universe came to the Western world along with materialist philosophy. This philosophy, developed in ancient Greece, stated that nothing else exists besides matter and that the universe comes from eternity and goes to eternity. In the Middle Ages when the Church dominated Western thought, materialism was forgotten. However in the modern period, Western scientists and philosophers became consumed by a curiosity about these ancient Greek origins and revived an interest in materialism.

The first person in the modern age to propose a materialist understanding of the universe was the renowned German philosopher Immanuel Kant\u2014even though he has not a materialist in the philosophical sense of the word. Kant proposed that the universe was eternal and that every possibility could be realized only within this eternity. With the coming of the 19th century, it became widely accepted that the universe had no beginning, and that there was no moment of creation. Then, this idea, adopted passionately by dialectical materialists such as Karl Marx, Friedrich Engels, came into the 20th century.

This idea has always been compatible with atheism. This is because to accept that the universe had a beginning would mean that God created it and the only way to counter this idea was to claim that the universe was eternal, even though this claim had no basis on science. A dogged proponent of this claim was Georges Politzer who became widely known as a supporter of materialism and Marxism in the first half of the 20th century through his book Principes Fondamentaux de Philosophie (The Fundamental Principles of Philosophy). Assuming the validity of the model of an eternal universe, Politzer opposed the idea of a creation:

The universe was not a created object, if it were, then it would have to be created instantaneously by God and brought into existence from nothing. To admit creation, one has to admit, in the first place, the existence of a moment when the universe did not exist, and that something came out of nothingness. This is something to which science can not accede.

By supporting the idea of an eternal universe against that of creation, Politzer thought that science was on his side. However, very soon, the fact that Politzer alluded to by his words, \u201Cif it is so, we must accept the existence of a creator\u201D, that is, that the universe had a beginning, was proven.

This proof came as a result of the \u201CBig Bang\u201D theory, perhaps the most important concept of 20th century astronomy.

The Big Bang theory was formulated after a series of discoveries. In 1929, the American astronomer, Edwin Hubble, noticed that the galaxies of the universe were continually moving away from one another and that the universe was expanding. If the flow of time in an expanding universe were reversed, then it emerged that the whole universe must have come from a single point. Astronomers assessing the validity of Hubble\u2019s discovery were faced with the fact that this single point was a \u201Cmetaphysical\u201D state of reality in which there was an infinite gravitational attraction with no mass. Matter and time came into being by the explosion of this mass-less point. In other words, the universe was created from nothing.

On the one hand, those astronomers who are determined to cling to materialist philosophy with its basic idea of an eternal universe, have attempted to hold out against the Big Bang theory and maintain the idea of an eternal universe. The reason for this effort can be seen in the words of Arthur Eddington, a renowned materialist physicist, who said, \u201CPhilosophically, the notion of an abrupt beginning to the present order of Nature is repugnant to me\u201D. But despite the fact that the Big Bang theory is repugnant to materialists, this theory has continued to be corroborated by concrete scientific discoveries. In their observations made in the 1960\u2019s, two scientists, Arno Penzias and Robert Wilson, detected the radioactive remains of the explosion (cosmic background radiation). These observations were verified in the 1990\u2019s by the COBE (Cosmic Background Explorer) satellite.

In the face of all these facts, atheists have been squeezed into a corner. Anthony Flew, an atheist professor of

philosophy at the University of Reading and the author of Atheistic Humanism, makes this interesting confession:

Notoriously, confession is good for the soul. I will therefore begin by confessing that the Stratonician atheist has to be embarrassed by the contemporary cosmological consensus. For it seems that the cosmologists are providing a scientific proof of what St. Thomas contended could not be proved philosophically; namely, that the universe had a beginning. So long as the universe can be comfortably thought of as being not only without end but also without beginning, it remains easy to urge that its brute existence, and whatever are found to be its most fundamental features, should be accepted as the explanatory ultimates. Although I believe that it remains still correct, it certainly is neither easy nor comfortable to maintain this position in the face of the Big Bang story

An example of the atheist reaction to the Big Bang theory can be seen in an article written in 1989 by John Maddox, editor of Nature, one of the best-known materialist-scientific journals.

In that article, called \u201CDown With the Big Bang,\u201D Maddox wrote that the Big Bang is \u201Cphilosophically unacceptable,\u201D because \u201Ccreationists and those of similar persuasions\u2026 have ample justification in the doctrine of the Big Bang.\u201D He also predicted that the Big Bang \u201Cis unlikely to survive the decade ahead.\u201D However, despite Maddox\u2019 hopes, Big Bang has gained credence and many discoveries have been made that prove the creation of the universe.

Some materialists have a relatively logical view of this matter. For example, the English materialist physicist, H.P. Lipson, unwillingly accepts the scientific fact of creation. He writes:

I think \u2026that we must\u2026admit that the only acceptable explanation is creation. I know that this is anathema to physicists, as indeed it is to me, but we must not reject that we do not like if the experimental evidence supports it.

Thus, the fact arrived at finally by modern astronomy is this: time and matter were brought into being by an eternally powerful Creator independent of both of them. The eternal power that created the universe in which we live is God who is the possessor of infinite might, knowledge and wisdom.

Physics and Astronomy: The Collapse of the Idea of a Random Universe and The Discovery of the Anthropic Principle

A second atheist dogma rendered invalid in the 20th century by discoveries in astronomy is the idea of a random universe. The view that the matter in the universe, the heavenly bodies and the laws that determine the relationships among them has no purpose but is the result of chance, has been dramatically discounted.

For the first time since the 1970\u2019s, scientists have begun to recognize the fact that the whole physical balance of the universe is adjusted delicately in favor of human life. With the advance of research, it has been discovered that the physical, chemical and biological laws of the universe, basic forces such as gravity and electro-magnetism, the structure of atoms and elements are all ordered exactly as they have to be for human life. Western scientists have called this extraordinary design the \u201Canthropic principle\u201D. That is, every aspect of the universe is designed with a view to human life.

We may summarize the basics of the anthropic principle as follows:

This delicate balance is one of the most striking discoveries of modern astrophysics. The wellknown astronomer, Paul Davies, writes in the last paragraph of his book The Cosmic Blueprint, \u201CThe impression of Design is overwhelming.\u201D

In an article in the journal Nature, the astrophysicist W. Press writes, \u201Cthere is a grand design in the Universe that favors the development of intelligent life.\u201D

The interesting thing about this is that the majority of the scientists that have made these discoveries were of the materialist point of view and came to this conclusion unwillingly. They did not undertake their scientific investigations hoping to find a proof for God\u2019s existence. But most of them, if not all of them, despite their unwillingness, arrived at this conclusion as the only explanation for the extraordinary design of the universe.

In his book, The Symbiotic Universe the American astronomer, George Greenstein, acknowledges this fact:

How could this possibly have come to pass [that the laws of physics conform themselves to life]? \u2026As we survey all the evidence, the thought insistently arises that some supernatural agency\u2014or, rather Agency\u2014must be involved. Is it possible that suddenly, without intending to, we have stumbled upon scientific proof of the existence of a Supreme Being? Was it God who stepped in and so providentially crafted the cosmos for our benefit?

By beginning his question with \u201CIs it possible\u201D, Greenstein, an atheist, tries to ignore that plain fact that has confronted him. But many scientists who have approached the question without prejudice acknowledge that the universe has been created especially for human life. Materialism is now being viewed as an erroneous belief outside the realm of science. The American geneticist, Robert Griffiths, acknowledges this fact when he says, \u201CIf we need an atheist for a debate, I go to the philosophy department. The physics department isn\u2019t much use.\u201D

In his book Nature\u2019s Destiny: How the Laws of Biology Reveal Purpose in the Universe, which examines how physical, chemical and biological laws are amazingly calculated in an \u201Cideal\u201D way with a view to the requirements of human life, the well-known molecular biologist, Michael Denton writes:

The new picture that has emerged in twentieth-century astronomy presents a dramatic challenge to the presumption which has been prevalent within scientific circles during most of the past four centuries: that life is a peripheral and purely contingent phenomenon in the cosmic scheme.

In short, the idea of a random universe, perhaps atheism\u2019s most basic pillar, has been proved invalid. Scientists now openly speak of the collapse of materialism. The supposition whose falsity God reveals in the Qur\u2019an, \u201CWe did not create heaven and earth and everything between them to no purpose. That is the opinion of those who disbelieve\u2026\u201D (Qur\u2019an, 38: 27) was shown to be invalid by science in the 1970\u2019s.

References:

(1) Patrick Glynn, God: The Evidence, The Reconciliation of Faith and Reason in a Postsecular World , Prima Publishing, California, 1997, pp.19-20, 53 (2)Bryce Christensen, in a review of Gerald Shroeder\u2019s book The Hidden Face of God, Booklist March 15, 2001 (3) George Politzer, Principes Fondamentaux de Philosophie, Editions Sociales, Paris, 1954, p. 84 (4) S. Jaki, Cosmos and Creator, Regnery Gateway, Chicago, 1980, p.54 (5) Henry Margenau, Roy Abraham Vargesse, Cosmos, Bios, Theos, La Salle IL: Open Court Publishing, 1992, p.241 (6) John Maddox, \u201CDown with the Big Bang\u201D, Nature, vol. 340, 1989, p. 378 (7) H. P. Lipson, \u201CA Physicist Looks at Evolution\u201D, Physics Bulletin, vol. 138, 1980, p. 138 (8) Paul Davies, The Cosmic Blueprint, London: Penguin Books, 1987, p. 203 (9) W. Press, \u201CA Place for Teleology?\u201D, Nature, vol. 320, 1986, s. 315 (10) George Greenstein, The Symbiotic Universe, p. 27 (11) Hugh Ross, The Creator and the Cosmos, p. 123 (12) Denton, Michael Denton, Nature\u2019s Destiny: How the Laws of Biology Reveal Purpose in the Universe, The New York: The Free Press,1998, p. 14 (13) Paul Davies and John Gribbin, The Matter Myth, Simon & Schuster, New York, 1992, p. 10`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/know-your-god/191-the-fall-of-atheism/",license:"Fair Use / Permitted Metadata",publication_date:"2011-05-21T09:37:28",created_at:"2026-08-23 09:55:28"},{id:"1a70a6e8-24db-4206-9215-c56262142b21",title:"All are swimming in an orbit (2): Wavy Daylight and Night",author:"Quran & Science",content:`Modern science informed us that the moon is moving around the Earth in an oval, or elliptical orbit. Also the Earth and the rest of the planets, revolve in oval, or elliptical orbit around the sun.

In the holy Quran this movement is described as follows: (And he is the one who created the night, daylight, sun and the moon, all are swimming in an orbit). (The Profits: 33).

From my point of view, I think God used the names of the sun, moon, night, and daylight as symbols of the four heavenly cosmic creatures:  Night (darkness): nowdays symbolizes dark matter, or what is sometimes called the cosmic fluid, or fabric of ths cosmos. Dark matter did not glow by the passage of light. Daylight: symbolizes the gases of the earth atmosphere, or other gases in the universe that glow by the passage of light, Sun: symbolizes the stars and the sources of energy and cosmic tremendous heat & electromagnetic radiation. Moon: a symbol of the cold rocky objects in the universe.

So night, daylight, sun, and moon are only a set of nearby symbols, that are close to us in the universe, and are having masses, energy, radiation\u2026etc.

The idea behind all of this, is that if God is telling us: (All are swimming in an orbit). This means that the natural mechanical movement of every thing in the universe, either it is radiation, dark matter, energy or solid masses, it is swimming, or what we call in physics wavy motion, this agrees with the assumption of the Austrian physicist Erwin Rudolf Schr\xF6dinger which suggests that (Every point in the universe has a wave function).

In the first article that I have written on this website, it is found that the wavy orbits of the small celestial objects are accumulating around the wavy orbits of the leader\xA0 bigger celestial objects, Fig. 1 is showing clearly that result.

But, as Fig. 1 is based on the principle all are swimming in an orbit, and as the swimming meaning is based on the movement of the sea water waves, are the sea water waves accumulating in such a way, that the smaller ones are moving and accumulating around the bigger ones as we colcluded from Fig. 1?

When I reached these results, and that question, and gathered it with the \xA0the description of the heavens, that it has a property of knots (And the heaveness that have the knots) (Adh-Dhariyat: 7), while knots means in our language (Arabic) the wavy ways on tissue, water or sand, I expected to find the combinations of waves from the small over the bigger over the bigger, on the sea water, fig. 2, sand fig. 3., and fig. 4. Actually what I found was the same that I drew for the accumulated wavy orbits of swimming cosmic celestial objects. If I want to draw the maps of tracks of air on tissues, or water,\xA0 or sand accumulated waves, it will be the same of that drawn on fig.1.

When I went to the sea, the picture was more clear, the smaller waves are built over the bigger ones, in the same way it moves with it and swim over it, the pictures that I took myself will be more clear than the description. Note in the figures that the small waves have its own small speed, at the same time, it is moving and carried with the bigger ones, at its higher speeds.

When I visit the desert in UAE; I got the following beautiful photos, which shows also the wavy mountains of sand carrying wavy hills of sand\u2026 or vice versa, sand waves built over each other from the smallest to the biggest, same as the celestial bodies and sea orbits or waves.

The children maintain genetic characteristics of their ancestors, in the figure, small waves carried in the hands of parents, the smallest waves insist on maintaining the same elegant family shape.

Now we need to remember that the verse further told us: (the night, daylight, sun and the moon, all swimming in an orbit). \xA0That means daylight and night are swimming in an orbit, this can be proven in fig. 5.

Daylight and night are symbols of time, here in the photo as the Quran mentioned, they are moving in a wavy motion over the spherical earth, indicating that time is a wave; in my book (New Principles of Space- Time travel) I managed depending on this conclusions, to reach many great results about space-time travel.

Fig. 5 \u207D\xB9\u207E.

Based on this verse which was said before more than 1,400 years, understanding that daylight and night are wavy over the earth, and as these are symbols of time, as an inventor; I tried to invent a clock that show the earth on the screen, while the wavy daylight and night film is passing over it with time, in another way, showing relative to time, which places on the earth have daylight, and which have daynight, but with more researches, I found that the American mechanical Engineer Jim Kilburg invented it and called it Geochron (Fig. 6).

Ronald Reagan gave one clock of it to Mikail Gorbachev. Former U.N. Secretary General Boutros Boutros-Ghali was given one from the indigenous people of the world. The Geochron has even appeared in popular movies such as Hunt for Red OctoberandClear and Present Danger. NASA still uses several to track night and day during orbital space flights.

When the President Ronald Reagan gave Mikail Gorbachev a Geochron he said to him: that this is \u201Can example of American ingenuity.\u201D

But the president does not know that this clock which gives an example of American ingenuity, is working depending on a scientific principle that was mentioned as part of a verse in the Holy Quran before more than 1400 years.

Furthernore, if the verse indicated that everything is swimming in an orbit, we can see how science draws the orbit of the sun around the center of our galaxy to be wavy as in fig. 7, while fig. 8 shows the wavy shadow of the moon on the earth, fig. 9 shows the wavy track of a meteoroid near the earth, fig. 10 shows an amazing wavy track of a meteoroid in the space, fig. 11 shows the great wavy sand mountains in the Empty Quarter in the Arabic Semi-Island, while Fig. 10 shows how the tracks or orbits of the sun, moon.. are drawn in the most famous astronmical scientific magazine (Astronomy), it is clearly proving that the orbits of the celestial bodies which are all moving relative to each other is wavy, but until now I couldnot reach an explaination why it is wavy, at the same time nobody drew the accumulated wavy orbits, these questions I expect I explained its answers in these two articles, while other related questions such as: How gravity works with wavy orbits? What is the relation between accumulated wavy orbits and higher dimensions?\u2026 and many others I tried to explain in my books (Universe Revealed More- Continueing Einsteins Revolution) and (New Principles of Space-Time travel).

Fig. 7 \u207D\xB2\u207E.

Fig. 8 \u207D\xB3\u207E.

Russell Schweickart / B612 Foundation

Fig. 9 \u207D\u2074\u207E.

Figure showing a meteoroid track in space, though 21 days.

Fig. 10 \u207D\u2075\u207E.

Fig. 11 \u207D\u2076\u207E.

The monthly track (orbit, passage) of the sun and the moon through the celestial sphere which is published in the most famous astronomical magazine (ASTRONOMY)\xA0 is clearly wavy, furthermore it is clear that the moon wavy orbit is crossing the orbit of the sun, and waving around it, if we imagine a vedio movements of the tracks or orbits of the solar system members, through the space, for sure the picture will be for celestial bodies where all are swimming in an orbit.

The reader is free to evaluate and rate this article, using the rating pointer at the top of the article.

Written by: Eng. Wasfi Amin Alshdaifat (Author, Inventor)

Email: wasfi974@gmail.com

(1): Reference: http://www.onemansblog.com/\u2026/2007/01/DaylightMap.jpg

(2): Reference: http://www.kaheel7.com

(3): Reference: http://www.exploratorium.edu/eclipse/2006/

(4): Reference: www.msnbc.msn.com/id/12859900

(5): Reference: Hubble, The mirror of the universe, Robbin Kerrod, David and Charles. Oliver Salzman

(6): Reference: http://maps.google.com/maps?ll=22.151928,54.076524andz..

http://articles.adsabs.harvard.edu//ful \u2026 7.000.html

SAO/NASA Astrophysics Data System (ADS)`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/islam-and-science-universe/296-all-are-swimming-in-an-orbit-2-wavy-daylight-and-night/",license:"Fair Use / Permitted Metadata",publication_date:"2011-04-20T10:43:47",created_at:"2026-08-23 09:55:28"},{id:"b67fdbb3-b3b2-43fb-b6c5-9f1d58174fc1",title:"Who makes foetus laugh and weep?",author:"Quran & Science",content:`In a very significant verse in surat Al-Najm Allah says about him self: \u201CAnd that He it is who maketh laugh, and maketh weep,\u201D (Quran 53:43)

This verse contains a very nice scientific indication about the lately-discovered fact that foetus has facial expressions while he is in his mother\u2019s womb, without being taught to do so.

The miracle of man creation reveals itself in the stages of foetal development which is described by the holy Quran and begins with the creation of germ cells in his parents, then when the sperm meets the ovum fertilizing it and they form the zygote (Nutfa Amshaj) which then becomes a\xA0leech-like clot (Alaqah) then chewed-like lump of flesh (Mudgha) which turns into bones covered with flesh, then at the decisive moment this foetus is converted from just some growing cells into another creature full of life and moves in his mother\u2019s womb and his facial expressions appears clearly. As after this large technological revolution which occurred lately in scanning embryos, we can now see embryos smiling and crying in their mothers\u2019 wombs before they see light on earth.

3D and 4D ultrasound scanning

3D ultrasound is a medical ultrasound technique, often used during pregnancy, providing three dimensional images of the foetus. Often these images are captured rapidly and animated to produce a \u201C4D ultrasound\u201D.

There are several different scanning modes in medical and obstetric ultrasound. The standard common obstetric diagnostic mode is 2D scanning. In 3D foetal scanning, however, instead of the sound waves being sent straight down and reflected back, they are sent at different angles. The returning echoes are processed by a sophisticated computer program resulting in a reconstructed three dimensional volume image of foetus\u2019s surface or internal organs; in much the same way as a CT scan machine constructs a CT scan image from multiple x-rays. 3D ultrasounds allow one to see width, height and depth of images in much the same way as 3D movies but no movement is shown. 4D ultrasounds involve the addition of movement by stringing together frames of 3D ultrasounds in quick succession.

3D ultrasound was first developed by Olaf von Ramm and Stephen Smith at Duke University in 1987.

Clinical use of this technology is an area of intense research activity especially in fetal anomaly scanning but there are also popular uses that have been shown to improve fetal-maternal bonding. 4D baby scans are similar to 3D scans except that they show fetal movement as shown in the video clip.[1]

Facial expressions are not copying of the mother\u2019s ones

Pioneering scanning techniques have produced astonishing images from inside the womb which show babies apparently smiling and crying.Up to now, doctors did not think infants made such expressions until after birth and believed they learned to smile by copying their mother. Babies do not normally smile after birth until they are about six weeks old.[2]

A foetus having a wide smile very close to laugh

Scientists are not the only who were astonished by these picture but normal people were more astonished. These pictures truly excite in the human soul a state of matchless admiration to Allah\u2019s creation. And they trigger the emotions of mercy of parents and the emotions of delight when you see the foetus smiles and the emotions of compassion when you see the foetus cries.

And at these emotions, an essential question must be asked, if the foetus is still in his mother\u2019s womb and it did not see the light yet, it did not see its mother cry or smile, then who taught this foetus to cry and who taught it to smile? This question is asked even by scientists, Professor Stuart Campbell says : \u201CWhat\u2019s behind the smile? Of course, I can\u2019t say, but the corners turn up and the cheeks bulge \u2026 I think it must be some indication of contentment in a stress-free environment.\u201D[3]

But the answer comes from the holy Quran as Allah says \u201CAnd that He it is who maketh laugh, and maketh weep,\u201D (Quran 53:43). Allah is one who makes embryos smile and it is the one who makes them weep. The advance in science does not only coincide with Quran, but also the holy Quran answers the questions that confuse scientists.

Crying and Life

This verse is a strong indication to all people that the one gives us the ability to laugh and cry is Allah (SWT). But if we can think of our ability to laugh is favour from God to us, how could our ability to cry be also a favour from God?

If we think in a certain moment of our life, we will find that the greatest blessing of Allah upon us is crying\u2026\u2026. Yes, it is the first moment in our life, the moment at which we arrive to this earth and without crying at this moment our life ends.

Smiles, relief, congratulations and applause do not start when a child is born \u2013 they start when it cries.\xA0 Without crying, the room becomes increasingly silent and the mood increasingly apprehensive; and for good reason \u2013 crying is a very positive sign of a new, healthy life.\xA0 Many factors and complex interactions go into the production of the sound that announces joyful, healthy childbirth.[4]

Why the baby should cry?

The oxygen exchange in the lungs takes place across the membranes of small balloon-like structures called alveoli attached to the branches of the bronchial passages. These alveoli inflate and deflate with inhalation and exhalation.[5]

Everyone knows that it is much more difficult to blow up a balloon for the first time. Why is that? For one thing, the applied pressure does not create much tension in the walls of a small balloon to start the stretching process necessary for inflation. According to Laplace\u2019s law, the wall tension will be twice as large for a balloon of twice the radius. If it takes a certain applied pressure to overcome the elasticity of the large balloon and cause it to expand further, it will take twice as much pressure to start to expand the smaller balloon. All this makes it difficult for the baby to take its first breath \u2014 all the balloons are small! The alveoli of the lungs are collapsed in the fetus and must be inflated in the process of inhalation. Thus the traditional spank on the bottom of the newborn to make him/her mad enough to make the effort for the first breath. Further difficulties are encountered by premature infants because the surfactant fluid which coats the alveoli to give them the appropriate wall tensions is formed in the later stages of pregnancy. Until that point, the alveoli are coated with fluid which has essentially the surface tension of water, much higher than that of the normal surfactant.[6]

So it is a great blessing of Allah (SWT) to give us the ability to laugh and cry \u201CAnd that He it is who maketh laugh, and maketh weep,\u201D (Quran 53:43)`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/human/146-who-makes-foetus-laugh-and-weep/",license:"Fair Use / Permitted Metadata",publication_date:"2011-04-13T00:00:00",created_at:"2026-08-23 09:55:28"},{id:"b49c24f8-b9f1-4551-afc7-dcf52cb87b04",title:"Leave corn in its ears",author:"Quran & Science",content:`(He said): O Yusuf (Joseph), the man of truth! Explain to us (the dream) of seven fat cows whom seven lean ones were devouring, and of seven green ears of corn, and (seven) others dry, that I may return to the people, and that they may know. Yusuf said: For seven consecutive years, you shall sow as usual and that (the harvest) which you reap you shall leave in ears, (all) \u2013 except a little of it which you may eat. Then will come after that, seven hard (years), which will devour what you have laid by in advance for them, (all) except a little of that which you have guarded (stored). Then thereafter will come a year in which people will have abundant rain and in which they will press (wine and oil). \xA0\xA0 Allah, the Almighty, says: (He said): O Yusuf (Joseph), the man of truth! Explain to us (the dream) of seven fat cows whom seven lean ones were devouring, and of seven green ears of corn, and (seven) others dry, that I may return to the people, and that they may know. Yusuf said: For seven consecutive years, you shall sow as usual and that (the harvest) which you reap you shall leave in ears, (all) \u2013 except a little of it which you may eat. Then will come after that, seven hard (years), which will devour what you have laid by in advance for them, (all) except a little of that which you have guarded (stored). Then thereafter will come a year in which people will have abundant rain and in which they will press (wine and oil).\u201D\xA0\xA0\xA0 (Yusuf: 45-49)

The Scientific Fact:

Storing corn in its ears is considered one of the basic methods of preserving such seeds during hard environmental conditions. This combination of growing crops and preserving and storing them is called preserving products.

Dr. \`Abd al-Majid Bil\`abid and his colleagues from Rabat University in Morocco conducted research on some wheat seeds that were left in their ears for two years and some other seeds that were left outside their ears. Primary results showed that the ears experienced no change and stayed 100% viable despite the fact that the storehouse was normal and no special conditions were provided. Scientists also found that seeds left in their ears lost a considerable amount of water and became drier than those left outside their ears. This means that 20.3 % of the weight of the seeds left outside their ears is water which will affect the seeds ability to grow once cultivated, simply because water makes it more vulnerable to decay.

Thereafter, researches compared the rates of growth between seeds left in their ears and others left outside their ears for 2 years. They found that seeds left in their sheaths have a better growth rate \u2013 of 20 % root length and 32 % trunk length. Afterwards, researchers tried to estimate the proteins and sugar that remained unchanged. They found that such substances had fallen by 32 % after 2 years of storage in the seeds left outside their ears while after one year of storage such seeds lost 20 % of these substances. The seeds stored in their ears lost nothing.

Facets of Scientific Inimitability:

Almighty Allah says: \u201C\u2026which you reap you shall leave in ears\u201D which means that storing seeds in their ears is the best way to preserve them.

There are two other scientific observations in this verse:

1-\xA0\xA0\xA0\xA0 Defining the period over which seeds are expected to be viable: 15 years. People were commanded to grow wheat for 7 years and then 7 hard years would follow and then one year (totaling 15 in all) will come when people will be able to produce wine and oil. Scientific researches have proven that wheat seeds can keep their ability to grow for a maximum of 15 years.

2-\xA0\xA0\xA0\xA0 The method of storage by leaving seeds in their ears has also been tested in the research. This shows that the best way to store seeds is the way practiced by Prophet Yusuf who was taught by Allah. It is historically proven that this way was unknown before, especially to ancient Egyptians who used to store wheat seeds outside their ears. Obviously, this is a scientific miracle that shows the greatness and accuracy of the Ever-Glorious Qur\u2019an and that it is a revelation from Allah (Exalted and Glorified be He).`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/plants/170-leave-corn-in-its-ears/",license:"Fair Use / Permitted Metadata",publication_date:"2011-02-15T09:35:36",created_at:"2026-08-23 09:55:28"},{id:"31724885-1e67-4595-937f-0cc89522a324",title:"Medical References  at the shadows of Surat Al Kahf",author:"Quran & Science",content:`The Quranic chapter 18 : \u201CThe Cave\u201D\xA0 (Al Kahf)\xA0 was revealed to answer few questions which the mushriks (unbelievers) of Makkah, had put to the Prophet Mohammad (PBUH) in order to test him.. One of the questions was : Who were \u201Cthe Sleepers of\xA0 the Cave\u201D ?\xA0 The disbelievers of Makkah were told that the story of the Sleepers of the Cave was a clear proof of the creed of the Hereafter, as it shows that Allah has the power to resurrect anyone He wills even after a long sleep of death as He did with the Sleepers of the Cave (they slept over 300 years) .

(\u0641\u064E\u0636\u064E\u0631\u064E\u0628\u0652\u0646\u064E\u0627\u0639\u064E\u0644\u064E\u0649\u0622\u0630\u064E\u0627\u0646\u0650\u0647\u0650\u0645\u0652 \u0641\u0650\u064A\u0627\u0644\u0652\u0643\u064E\u0647\u0652\u0641\u0650\u0633\u0650\u0646\u0650\u064A\u0646\u064E\u0639\u064E\u062F\u064E\u062F\u064B\u0627) \u2013 \u0627\u0644\u0622\u064A\u0629 11 \u0645\u0646 \u0633\u0648\u0631\u0629 \u0627\u0644\u0643\u0647\u0641

The sense of hearing is a physiological one that does not stop functioning at the time of sleep (the sleeper can wake up at a nearby sound). As the 8th cranial nerve (which passes in the inner part of the ear) has two divisions: one for hearing and the other for equilibrium (position and movement of the head). In the case of Cave Sleepers the physiological\xA0 function of both hearing and equilibrium did stop, therefore, the Quranic verse uses the expression \u201CSmote their ears..\u201D rather than their hearing.

(\u0648\u062A\u062D\u0633\u0628\u0647\u0645 \u0623\u064A\u0642\u0627\u0638\u0627 \u0648\u0647\u0645 \u0631\u0642\u0648\u062F ) \u0622\u064A\u0629 18

(\u0648\u0646\u0642\u0644\u0628\u0647\u0645 \u0630\u0627\u062A \u0627\u0644\u064A\u0645\u064A\u0646 \u0648\u0630\u0627\u062A \u0627\u0644\u0634\u0645\u0627\u0644) \u0622\u064A\u0629 18

(\u0642\u064E\u0627\u0644\u064F\u0648\u0627 \xA0\u0644\u064E\u0628\u0650\u062B\u0652\u0646\u064E\u0627\u064A\u064E\u0648\u0652\u0645\u0627\u064B \u0623\u064E\u0648\u0652 \u0628\u064E\u0639\u0652\u0636\u064E \u064A\u064E\u0648\u0652\u0645\u064D ) \u0622\u064A\u0629 19

(\u0648\u064E\u062A\u064E\u0631\u064E\u0649 \u0627\u0644\u0634\u0651\u064E\u0645\u0652\u0633\u064E \u0625\u0650\u0630\u064E\u0627 \u0637\u064E\u0644\u064E\u0639\u064E\u062A\u0652 \u062A\u064E\u0632\u064E\u0627\u0648\u064E\u0631\u064F \u0639\u064E\u0646\u0652 \u0643\u064E\u0647\u0652\u0641\u0650\u0647\u0650\u0645\u0652 \u0630\u064E\u0627\u062A\u064E \u0627\u0644\u0652\u064A\u064E\u0645\u0650\u064A\u0646\u0650 \u0648\u064E\u0625\u0650\u0630\u064E\u0627 \u063A\u064E\u0631\u064E\u0628\u064E\u062A\u0652 \u062A\u064E\u0642\u0652\u0631\u0650\u0636\u064F\u0647\u064F\u0645\u0652 \u0630\u064E\u0627\u062A\u064E \u0627\u0644\u0634\u0651\u0650\u0645\u064E\u0627\u0644 \u0648\u064E\u0647\u064F\u0645\u0652 \u0641\u0650\u064A \u0641\u064E\u062C\u0652\u0648\u064E\u0629\u064D \u0645\u0650\u0646\u0652\u0647\u064F \u0630\u0644\u0643 \u0645\u0646 \u0622 \u064A\u0627\u062A \u0627\u0644\u0644\u0647) 17

So, coolness in this gap in the Cave away from the heat of the sun that did not touch them, was sufficient to inhibit bodily metabolism for the preservation of their bodies all this long period.\xA0 Had they been only asleep, they would have needed water and food to survive, and would have been awaken by the need to urinate after some hours.\xA0 But Allah inhibited all their biological functions and preserved their bodies in a living shape. So, He said; \u201CYou would have thought them awake, as they lay sleeping\u201D.(18: 18),

(\u0648\u064E\u062A\u064E\u062D\u0652\u0633\u064E\u0628\u064F\u0647\u064F\u0645\u0652 \u0623\u064E\u064A\u0652\u0642\u064E\u0627\u0638\u0627\u064B \u0648\u064E\u0647\u064F\u0645\u0652 \u0631\u064F\u0642\u064F\u0648\u062F\u064C) \u0622\u064A\u0629 18

and did not say; \u201CYou would have thought them dead, as they lay sleeping\u201D, as the sign of awakening is \u2018eye wink\u2019.\xA0 Allah preserved their eyes from blindness through blinking, as the eye if kept closed for a long period of time will be blind, because the optic nerve will shrink and die, and if it is kept open, the cornea will be affected with corneo-xerosis, and blindness. Therefore, this rare status of theirs would have aroused terror, if seen, as they were not alive or dead.\xA0 They were asleep, yet their eyes were blinking: \u201CHad you observed them surely you would have turned your back on them in flight, and been filled with terror of them.\u201D (18:18)

(\u0644\u064E\u0648\u0650 \u0627\u0637\u0651\u064E\u0644\u064E\u0639\u0652\u062A\u064E \u0639\u064E\u0644\u064E\u064A\u0652\u0647\u0650\u0645\u0652 \u0644\u064E\u0648\u064E\u0644\u0651\u064E\u064A\u0652\u062A\u064E \u0645\u0650\u0646\u0652\u0647\u064F\u0645\u0652 \u0641\u0650\u0631\u064E\u0627\u0631\u0627\u064B \u0648\u064E\u0644\u064E\u0645\u064F\u0644\u0650\u0626\u0652\u062A\u064E \u0645\u0650\u0646\u0652\u0647\u064F\u0645\u0652 \u0631\u064F\u0639\u0652\u0628\u0627\u064B) \u0622\u064A\u0629 18

As Allah preserved their eyes through blinking, He also preserved their bodies from ulcers through constant turning: \u201CWhile We turned them now to the right, now to the left\u201D (18:18),

(\u0648\u064E\u0646\u064F\u0642\u064E\u0644\u0651\u0650\u0628\u064F\u0647\u064F\u0645\u0652 \u0630\u064E\u0627\u062A\u064E \u0627\u0644\u0652\u064A\u064E\u0645\u0650\u064A\u0646\u0650 \u0648\u064E\u0630\u064E\u0627\u062A\u064E \u0627\u0644\u0634\u0651\u0650\u0645\u064E\u0627\u0644\u0650) \u0622\u064A\u0629 18

so that they would not be affected with pressure sores.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/health-in-quran-a-sunnah/310-medical-references-at-the-shadows-of-surat-al-kahf/",license:"Fair Use / Permitted Metadata",publication_date:"2011-01-08T08:43:16",created_at:"2026-08-23 09:55:28"},{id:"a3513c02-1937-4881-8133-12f38da993aa",title:"Islamic Medicine: 1000 years ahead of its times",author:"Quran & Science",content:`Within a century after the death of Prophet Muhammad (peace be upon him) the Muslims not only conquered new lands, but also became scientific innovators with originality and productivity. They hit the source ball of knowledge over the fence to Europe.

By the ninth century, Islamic medical practice had advanced from talisman and theology to hospitals with wards, doctors who had to pass tests, and the use of technical terminology. The then Baghdad General Hospital incorporated innovations which sound amazingly modern. The fountains cooled the air near the wards of those afflicted with fever; the insane were treated with gentleness; and at night the pain of the restless was soothed by soft music and storytelling.

The prince and pauper received identical attention; the destitute upon discharge received five gold pieces to sustain them during convalescence. While Paris and London were places of mud streets and hovels, Baghdad, Cairo and Cardboard had hospitals open to both male and female patients; staffed by attendants of both sexes.

These medical centers contained libraries pharmacies, the system of interns, externs, and nurses. There were mobile clinics to reach the totally disabled, the disadvantaged and those in remote areas. There were regulations to maintain quality control on drugs. Pharmacists became licensed professionals and were pledged to follow the physician\u2019s prescriptions. Legal measures were taken to prevent doctors from owning or holding stock. in a pharmacy. The extent to which Islamic medicine advanced in the fields of medical education, hospitals, bacteriology, medicine, anesthesia, surgery, pharmacy, ophthalmology, psychotherapy and psychosomatic diseases are presented briefly.

INTRODUCTION

Prophet Muhammad (peace be upon him) who is ranked number one by Michael Hart, a Jewish scholar, in his book The 100: The Most Influential Persons in History, was able to unite the Arab tribes who had been tom by revenge, rivalry, and internal fights, and produced a strong nation acquired and ruled simultaneously, the two known empires at that time, namely the Persian and Byzantine Empires. The Islamic Empire extended from the Atlantic Ocean on the West to the borders of China on the East. Only 80 years after the death of their Prophet, the Muslims crossed to Europe to rule Spain for more than 700 years. The Muslims preserved the cultures of the conquered lands. However when the Islamic Empire became weak, most of the Islamic contributions in an and science were destroyed. The Mongols bunt Baghdad (1258 A.D.) out of barbarism, and the Spaniards demolished most of the Islamic heritage in Spain out of hatred.

The Islamic Empire for more than 1000 years remained the most advanced and civilized nation in the world. This is because Islam stressed the importance and respect of learning, forbade destruction, developed in Muslims the respect for authority and discipline, and tolerance for other religions. The Muslims recognized excellence and hungering intellectually, were avid for the wisdom of the world of Galen, Hippocrates, Rufus of Ephesus, Oribasius, Discorides and Paul of Aegina. By the tenth century their zeal and enthusiasm for learning resulted in all essential Greek medical writings being translated into Arabic in Damascus, Cairo, and Baghdad. Arabic became the International Language of learning and diplomacy. The center of scientific knowledge and activity shifted eastward, and Baghdad emerged as the capital of the scientific world. The Muslims became scientific innovators with originality and productivity. Islamic medicine is one of the most famous and best known facets of Islamic civilization, and in which the Muslims most excelled. The Muslims were the great torchbearers of international scientific research. They hit the source ball of knowledge over the fence to Europe. In the words of Campbell\u2019 \u201CThe European medical system is Arabian not only in origin but also in its structure. The Arabs are the intellectual forebears of the Europeans.\u201D

The aim of this paper is to prove that the Islamic Medicine was 1000 years ahead of its times. The paper covers areas such as medical education, hospitals, bacteriology, medicine, anesthesia, surgery, ophthalmology, pharmacy, and psychotherapy.

MEDICAL EDUCATION

In 636 A.D., the Persian City of Jundi-Shapur, which originally meant beautiful garden, was conquered by the Muslims with its great university and hospital intact. Later the Islamic medical schools developed on the Jundi-Shapur pattern. Medical education was serious and systematic. Lectures and clinical sessions included in teaching were based on the apprentice system. The advice given by Ali ibnul-Abbas (Haly Abbas: -994 -A.D.) to medical students is as timely today as it was then\u2019. \u201CAnd of those things which were incumbent on the student of this art (medicine) are that he should constantly attend the hospitals and sick houses; pay unremitting attention to the conditions and circumstances of their intimates, in company with the most astute professors of medicine, and inquire frequently as to the state of the patients and symptoms apparent in them, bearing in mind what he has read about these variations, and what they indicate of good or evil.\u201D

Razi (Rhazes: 841-926 A.D.) advised the medical students while they were seeing a patient to bear in mind the classic symptoms of a disease as given in text books and compare them with what they found (6).

The ablest physicians such as Razi (Al-Rhazes), Ibn-Sina (Avicenna: 980-1037 A.D.) and Ibn Zuhr (Avenzoar: 116 A.D.) performed the duties of both hospital directors and deans of medical schools at the same time. They studied patients and prepared them for student presentation. Clinical reports of cases were written and preserved for teaching\u2019. Registers were maintained.

Training in Basic Sciences

Only Jundi-Shapur or Baghdad had separate schools for studying basic sciences. Candidates for medical study received basic preparation from private tutors through private lectures and self study. In Baghdad anatomy was taught by dissecting the apes, skeletal studies, and didactics. Other medical schools taught anatomy through lectures and illustrations. Alchemy was once of the prerequisites for admission to medical school. The study of medicinal herbs and pharmacognosy rounded out the basic training. A number of hospitals maintained barbel gardens as a source of drugs for the patients and a means of instruction for the students.

Once the basic training was completed the candidate was admitted as an apprentice to a hospital where, at the beginning, he was assigned in a large group to a young physician for indoctrination, preliminary lectures, and familiarization with library procedures and uses. During this pre-clinical period, most of the lectures were on pharmacology and toxicology and the use of antidotes.

Clinical training: The next step was to give the student full clinical training. During this period students were assigned in small groups to famous physicians and experienced instructors, for ward rounds, discussions, lectures, and reviews. Early in this period therapeutics and pathology were taught. There was a strong emphasis on clinical instruction and some Muslim physicians contributed brilliant observations that have stood the test of time. As the students progressed in their studies they were exposed more and more to the subjects of diagnosis and judgment. Clinical observation and physical examination were stressed. Students (clinical clerks) were asked to examine a patient and make a diagnosis of the ailment. Only after an had failed would the professor make the diagnosis himself. While performing physical examination, the students were asked to examine and report six major factors: the patients\u2019 actions, excreta, the nature and location of pain, and swelling and effuvia of the body. Also noted was color and feel of the skin- whether hot, cool, moist, dry, flabby. Yellowness in the whites of the eye (jaundice) and whether or not the patient could bend his back (lung disease) was also considered important (8).

After a period of ward instructions, students, were assigned to outpatient areas. After examining the patients they reported their findings to the instructors. After discussion, treatment was decided on and prescribed. Patients who were too ill were admitted as inpatients. The keeping of records for every patient was the responsibility of the students.

Curriculum: There was a difference in the clinical curriculum of different medical schools in their courses; however the mainstay was usually internal medicine. Emphasis was placed on clarity and brevity in describing a disease and the separation of each entity. Until the time of Ibn Sina the description of meningitis was confused with acute infection accompanied by delirium. Ibn Sina described the symptoms of meningitis with such clarity and brevity that there is very little that can be added after I 000 yearS6. Surgery was also included in the curriculum. After completing courses, some students specialized under famous specialists. Some others specialized while in clinical training. According to Elgood9 many surgical procedures such as amputation, excision of varicose veins and hemorrhoids were required knowledge. Orthopedics was widely taught, and the use of plaster of Paris for casts after reduction of fractures was routinely shown to students. This method of treating fractures was rediscovered in the West in 1852. Although ophthalmology was practiced widely, it was not taught regularly in medical schools. Apprenticeship to an eye doctor was the preferred way of specializing in ophthalmology. Surgical treatment of cataract was very common. Obstetrics was left to midwives. Medical practitioners consulted among themselves and with specialists. Ibn Sina and Hazi both widely practiced and taught psychotherapy. After completing the training, the medical graduate was not ready to enter practice, until he passed the licensure examination. It is important to note that there existed a Scientific Association which had been formed in the hospital of Mayyafariqin to discuss the conditions and diseases of the patients.

Licensing of Physicians: In Baghdad in 931 A.D. Caliph Al-Muqtadir learned that a patient had died as the result of a physician\u2019s error. There upon he ordered his chief physician, Sinan-ibn Thabit bin Qurrah to examine all those who practiced the art of healing. In the first year of the decree more than 860 were examined in Baghdad alone. From that time on, licensing examinations were required and administered in various places. Licensing Boards were set up under a government official called Muhtasib or inspector general . The Muhtasib also inspected weights and measures of traders and pharmacists. Pharmacists were employed as inspectors to inspect drugs and maintain quality control of drugs sold in a pharmacy or apothecary. What the present Food and Drug Administration (FDA) is doing in America today was done in Islamic medicine I 000 years ago. The chief physician gave oral and practical examinations, and if the young physician was successful, the Muhtasib administered the Hippocratic oath and issued a license. After 1000 years licensing of physicians has been implemented in the West, particularly in America by the State Licensing Board in Medicine. For specialists we have American Board of Medical Specialties such as in Medicine, Surgery, Radiology, etc. European medical schools followed the pattern set by the Islamic medical schools and even in the early nineteenth century, students at the Sorbonne could not graduate without reading Ibn Sina\u2019s Qanun (Cannon). According to Razi a physician had to satisfy two condition for selection: firs0y, he was to be fully conversant with the new and the old medical literature and secondly, he must have worked in a hospital as house physician.

The development of efficient hospitals was an outstanding contribution of Islamic medicine (7). Hospitals served all citizens free without any regard to their color, religion, sex, age or social status. The hospitals were run by government and the directors of hospitals were physicians.

Hospitals had separate wards for male patients and female patients. Each ward was furnished with a nursing staff and porters of the sex of the patients to be treated therein. Different diseases such as fever, wounds, infections, mania, eye conditions, cold diseases, diarrhea, and female disorders were allocated different wards. Convalescents had separate sections within them. Hospitals provided patients with unlimited water supply and with bathing facilities. Only qualified and licensed physicians were allowed by law to practice medicine. The hospitals were teaching hospitals educating medical students. They had housing for students and house-staff. They contained pharmacies dispensing free drugs to patients. Hospitals had their own conference room and expensive libraries containing the most up-to-date books. According to Haddad, the library of the Tulum Hospital which was founded in Cairo in 872 A.D. (I 100 years ago) had 100,000 books. Universities, cities and hospitals acquired large libraries (Mustansiriyya University in Baghdad contained 80,000 volumes; the library of Cordova 600,000 volumes; that of Cairo 2,000,000 and that of Tripoli 3,000,000 books), physicians had their own extensive personal book collections, at a time when printing was unknown and book editing was done by skilled and specialized scribes putting in long hours of manual labour.

For the first time in history, these hospitals kept records of patients and their medical care.

From the point of view of treatment the hospital was divided into an out- patient department and an inpatient department. The system of the in-patient department differed only slightly from that of today. At Tulun hospital, on admission the patients were given special apparel while their clothes, money, and valuables were stored until the time of their discharge. On discharge, each patient \u2013 received five gold pieces to support himself until he could return to work.

The hospital and medical school at Damascus had elegant rooms and an extensive library. Healthy people are said to have feigned illness in order to enjoy its cuisine. There was a separate hospital in Damascus for lepers, while, in Europe, even six centuries later, condemned lepers were burned to death by royal decree.

The Qayrawan Hospital (built in 830 A.D. in Tunisia) was characterized by spacious separate wards, waiting rooms for visitors and patients, and female nurses from Sudan, an event representing the first use of nursing in Arabic history. The hospital also provided facilities for performing prayers.

The Al-Adudi hospital (built in 981 A.D. in Baghdad) was furnished with die best equipment and supplies known at the time. It had interns, residents, and 24 consultants attending its professional activities, An Abbasid minister, Ali ibn Isa, requested the court physician, Sinan ibn Thabit, to organize regular visiting of prisons by medical officers (14). At a time when paris and London were places of mud streets and hovels, Baghdad, Cairo, and Cordova had hospitals which incorporated innovations which sound amazingly modern. It was chiefly in the humaneness of patient care, however, that the hospitals of Islam excelled. Near the wards of those afflicted with fever, fountains cooled the air; the insane were treated with gentleness; and at night music and storytelling soothed the patients.

The Bimaristans (hospitals) were of two types \u2013 the fixed and the mobile. The mobile hospitals were transported upon beasts of burden and were erected from time to time as required. The physicians in the mobile clinics were of the same standing as those who served the fixed hospitals. Similar moving hospitals accompanied the armies in the field. The field hospitals were well equipped with medicaments, instruments, tents and a staff of doctors, nurses, and orderlies. The traveling clinics served the totally disabled, the disadvantaged and those in remote areas. These hospitals were also used by prisoners, and by the general public, particularly in times of epidemics.

BACTERIOLOGY

Al-Razi was asked to choose a site for a new hospital when he came to Baghdad. First he deduced which was the most hygienic area by observing where the fresh pieces of meat he had hung in various parts of the city decomposed least quickly.

Ibn Sina stated explicitly that the bodily secretion is contaminated by foul foreign earthly body before getting the infection. Ibn Khatima stated that man is surrounded by minute bodies which enter the human system and cause disease.

In the middle of the fourteenth century \u201Cblack death\u201D was ravaging Europe and before which Christians stood helpless, considering it an act of God.

At that time Ibn al Khatib of Granada composed a treatise in the defense of the theory of infection in the following way: To those who say, \u201CHow can we admit the possibility of infection while the religious law denies it?\u201D We reply that the existence of contagion is established by experience, investigation, the evidence of the senses and trustworthy reports. These facts constitute a sound argument. The fact of infection becomes clear to the investigator who notices how he who establishes contact with the afflicted gets the disease, whereas he who is not in contact remains safe, and how transmission is effected through garments, vessels and earrings.

Al-Razi wrote the first medical description of smallpox and measles \u2013 two important infectious diseases. He described the clinical difference between the two diseases so vividly that nothing since has been added. Ibn Sina suggested the communicable nature of tuberculosis. He is said to have been the first to describe the preparation and properties of sulphuric acid and alcohol. His recommendation of wine as the best dressing for wounds was very popular in medieval practice. However Razi was the first to use silk sutures and alcohol for hemostatis. He was the first to use alcohol as an antiseptic.

Ibn Sina originated the idea of the use of oral anesthetics. He recognized opium as the most powerful mukhadir (an intoxicant or drug). Less powerful anesthetics known were mandragora, poppy, hemlock, hyoscyamus, deadly nightshade (belladonna), lettuce seed, and snow or ice cold water. The Arabs invented the soporific sponge which was the precursor of modem anesthesia. It was a sponge soaked with aromatics and narcotics and held to the patient\u2019s nostrils.

The use of anesthesia was one of the reasons for the rise of surgery in the Islamic world to the level of an honourable speciality, while in Europe, surgery was belittled and practiced by barbers and quacks. The Council of Tours in 1163 A.D. declared Surgery is to be abandoned by the schools of medicine and by all decent physicians.\u201D Burton stated that \u201Canesthetics have been used in surgery throughout the East for centuries before ether and chloroform became the fashion in civilized West.\u201D

Al-Razi is attributed to be the first to use the seton in surgery and animal gut for sutures.

Abu al-Qasim Khalaf Ibn Abbas Al-Zahrawi (930-1013 A.D.) known to the West as Abulcasis, Bucasis or Alzahravius is considered to be the most famous surgeon in Islamic medicine. In his book Al-Tasrif, he described hemophilia for the first time in medical history. The book contains the description and illustration of about 200 surgical instruments many of which were devised by Zahrawi himself. In it Zahrawi stresses the importance of the study of Anatomy as a fundamental prerequisite to surgery. He advocates the re implantation of a fallen tooth and the use of dental prosthesis carved from cow\u2019s bone, an improvement over the wooden dentures worn by the first President of America George Washington seven centuries later. Zahrawi appears to be the first surgeon in history to use cotton (Arabic word) in surgical dressings in the control of hemorrhage, as padding in the splinting of fractures, as a vaginal padding in fractures of the pubis and in dentistry. He introduced the method for the removal of kidney stones by cutting into the urinary bladder. He was the first to teach the lithotomy position for vaginal operations. He described tracheotomy, distinguished between goiter and cancer of the thyroid, and explained his invention of a cauterizing iron which he also used to control bleeding. His description of varicose veins stripping, even after ten centuries, is almost like modern surgery. In orthopedic surgery he introduced what is called today Kocher\u2019s method of reduction of shoulder dislocation and patelectomy, 1,000 years before Brooke reintroduced it in 1937.

Ibn Sina\u2019s description of the surgical treatment of cancer holds true even today after 1,000 years. He says the excision must be wide and bold; all veins running to the tumor must be included in the amputation. Even if this is not sufficient, then the area affected should be cauterized.

The surgeons of Islam practiced three types of surgery: vascular, general, and orthopedic, Ophthalmic surgery was a speciality which was quite distinct both from medicine and surgery. They freely opened the abdomen and drained the peritoneal cavity in the approved modern style. To an unnamed surgeon of Shiraz is attributed the first colostomy operation. Liver abscesses were treated by puncture and exploration.

Surgeons all over the world practice today unknowingly several surgical procedures that Zahrawi introduced 1,000 years ago .

The most brilliant contribution was made by Al-Razi who differentiated between smallpox and measles, two diseases that were hitherto thought to be one single disease. He is credited with many contributions, which include being the first to describe true distillation, glass retorts and luting, corrosive sublimate, arsenic, copper sulfate, iron sulphate, saltpeter, and borax in the treatment of disease . He introduced mercury compounds as purgatives (after testing them on monkeys); mercurial ointments and lead ointment.\u201D His interest in urology focused on problems involving urination, venereal disease, renal abscess, and renal and vesical calculi. He described hay-fever or allergic rhinitis.

Some of the Arab contributions include the discovery of itch mite of scabies (Ibn Zuhr), anthrax, ankylostoma and the guinea worm by Ibn Sina and sleeping sickness by Qalqashandy. They described abscess of the mediastinum. They understood tuberculosis and pericarditis.

Al Ash\u2019ath demonstrated gastric physiology by pouring water into the mouth of an anesthetized lion and showed the distensibility and movements of the stomach, preceding Beaumont by about 1,000 years\u201D Abu Shal al- Masihi explained that the absorption of food takes place more through the intestines than the stomach. Ibn Zuhr introduced artificial feeding either by gastric tube or by nutrient enema. Using the stomach tube the Arab physicians performed gastric lavage in case of poisoning. Ibn Al-Nafis was the first to discover pulmonary circulation.

Ibn Sina in his masterpiece Al-Quanun (Canon), containing over a million words, described complete studies of physiology, patlhology and hygiene. He specifically discoursed upon breast cancer, poisons, diseases of the skin, rabies, insomnia, childbirth and the use of obstetrical forceps, meningitis, amnesia, stomach ulcers, tuberculosis as a contagious disease, facial tics, phlebotomy, tumors, kidney diseases and geriatric care. He defined love as a mental disease.

OPHTHALMOLOGY

The doctors of Islam exhibited a high degree of proficiency and certainly were foremost in the treatment of eye diseases. Words such as retina and cataract are of Arabic origin. In ophthalmology and optics lbn al Haytham (965-1039 A.D.) known to the West as Alhazen wrote the Optical Thesaurus from which such worthies as Roger Bacon, Leonardo da Vinci and Johannes Kepler drew theories for their own writings. In his Thesaurus he showed that light falls on the retina in the same manner as it falls on a surface in a darkened room through a small aperture, thus conclusively proving that vision happens when light rays pass from objects towards the eye and not from the eye towards the objects as thought by the Greeks. He presents experiments for testing the angles of incidence and reflection, and a theoretical proposal for magnifying lens (made in Italy three centuries later). He also taught that the image made on the retina is conveyed along the optic nerve to the brain. Razi was the first to recognize the reaction of the pupil to light and Ibn Sina was the first to describe the exact number of extrinsic muscles of the eyeball, namely six. The greatest contribution of Islamic medicine in practical ophthalmology was in the matter of cataract. The most significant development in the extraction of cataract was developed by Ammar bin Ali of Mosul, who introduced a hollow metallic needle through the sclerotic and extracted the lens by suction. Europe rediscovered this in the nineteenth century.

PHARMACOLOGY

Pharmacology took roots in Islam during the 9th century. Yuhanna bin Masawayh (777-857 A.D.) started scientific and systematic applications of therapeutics at the Abbasids capital. His students Hunayn bin Ishaq al-lbadi (809-874 A.D.) and his associates established solid foundations of Arabic medicine and therapeutics in the ninth century. In his book al-Masail Hunayn outlined methods for confirming the pharmacological effectiveness of drugs by experimenting with them on humans. He also explained the importance of prognosis and diagnosis of diseases for better and more effective treatment.

Pharmacy became an independent and separate profession from medicine and alchemy. With the wild sprouting of apothecary shops, regulations became necessary and imposed to maintain quality control.\u201D The Arabian apothecary shops were regularly inspected by a syndic (Muhtasib) who threatened the merchants with humiliating corporal punishments if they adulterated drugs.\u201D As early as the days of al-Mamun and al-Mutasim pharmacists had to pass examinations to become licensed professionals and were pledged to follow the physician\u2019s prescriptions. Also by this decree, restrictive measures were legally placed upon doctors, preventing them from owning or holding stock in a pharmacy.

Methods of extracting and preparing medicines were brought to a high art, and their techniques of distillation, crystallization, solution, sublimation, reduction and calcination became the essential processes of pharmacy and chemistry. With the help of these techniques, the Saydalanis (pharmacists) introduced new drugs such as camphor, senna, sandalwood, rhubarb, musk, myrrh, cassia, tamarind, nutmeg, alum, aloes, cloves, coconut, nuxvomica, cubebs, aconite, ambergris and mercury. The important role of the Muslims in developing modern pharmacy and chemistry is memorialized in the significant number of current pharmaceutical and chemical terms derived from Arabic: drug, alkali, alcohol, aldehydes, alembic, and elixir among others, not to mention syrups and juleps. They invented flavorings extracts made of rose water, orange blossom water, orange and lemon peel, tragacanth and other attractive ingredients. Space does not permit me to list the contributions to pharmacology and therapeutics, made by Razi, Zahrawi, Biruni, Ibn Butlan, and Tamimi.

PSYCHOTHERAPY

From freckle lotion to psychotherapy- such was the range of treatment practiced by the physicians of Islam. Though freckles continue to sprinkle the skin of 20th century man, in the realm of psychosomatic disorders both al-Razi and Ibn Sina achieved dramatic results, antedating Freud and Jung by a thousand years. When Razi was appointed physician-in-chief to the Baghdad Hospital, he made it the, first hospital to have a ward exclusively devoted to the mentally ill.\u201D

Razi combined psychological methods and physiological explanations, and he used psychotherapy in a dynamic fashion, Razi was once called in to treat a famous caliph who had severe arthritis. He advised a hot bath, and while the caliph was bathing, Razi threatened him with a knife, proclaiming he was going to kill him. This deliberate provocation increased the natural caloric which thus gained sufficient strength to dissolve the already softened humours, as a result the caliph got up from is knees in the bath and ran after Razi. One woman who suffered from such severe cramps in her joints that she was unable to rise was cured by a physician who lifted her skirt, thus putting her to shame. \u201CA flush of heat was produced within her which dissolved the rheumatic humour.\u201D

The Arabs brought a refreshing spirit of dispassionate clarity into psychiatry. They were free from the demonological theories which swept over the Christian world and were therefore able to make clear cut clinical observations on the mentally ill.

Najab ud din Muhammad'\u201D, a contemporary of Razi, left many excellent descriptions of various mental diseases. His carefully compiled observation on actual patients made up the most complete classification of mental diseases theretofore known.\u201D Najab described agitated depression, obsessional types of neurosis, Nafkhae Malikholia (combined priapism and sexual impotence). Kutrib (a form of persecutory psychosis), Dual-Kulb (a form of mania) .

Ibn Sina recognized \u2018physiological psychology\u2019 in treating illnesses involving emotions. From the clinical perspective Ibn Sina developed a system for associating changes in the pulse rate with inner feelings which has been viewed as anticipating the word association test of Jung. He is said to have treated a terribly ill patient by feeling the patient\u2019s pulse and reciting aloud to him the names of provinces, districts, towns, streets, and people. By noticing how the patient\u2019s pulse quickened when names were mentioned Ibn Sina deduced that the patient was in love with a girl whose home Ibn Sina was able to locate by the digital examination. The man took Ibn Sina\u2019s advice , married the girl , and recovered from his illness.

It is not surprising to know that at Fez, Morocco, an asylum for the mentally ill had been built early in the 8th century, and insane, asylums were built by the Arabs also in Baghdad in 705 A.D., in Cairo in 800 A.D., and in Damascus and Aleppo in 1270 A.D. In addition to baths, drugs, kind and benevolent treatment given to the mentally ill, musico-therapy and occupational therapy were also employed. These therapies were highly developed. Special choirs and live music bands were brought daily to entertain the patients by providing singing and musical performances and comic performers as well.

1,000 years ago Islamic medicine was the most advanced in the world at that time. Even after ten centuries, the achievements of Islamic medicine look amazingly modern. 1,000 years ago the Muslims were the great torchbearers of international scientific research. Every student and professional from each country outside the Islamic Empire, aspired, yearned, a dreamed to go to the Islamic universities to learn, to work, to live and to lead a comfortable life in an affluent and most advanced and civilized society. Today, in this twentieth century, the United States of America has achieved such a position. The pendulum can swing back. Fortunately Allah has given a bounty to many Islamic countries \u2013 an income over 100 billion dollars per year. Hence Islamic countries have the opportunity and resources to make Islamic science and medicine number one in the world, once again.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/health-in-quran-a-sunnah/309-islamic-medicine-1000-years-ahead-of-its-times/",license:"Fair Use / Permitted Metadata",publication_date:"2011-01-02T17:51:36",created_at:"2026-08-23 09:55:28"},{id:"ea238595-2d50-4dbf-9b8d-b967e04d924b",title:"Benefits of Honey",author:"Quran & Science",content:`The honey bee exhibits a combination of individual traits and social co-operation which is unparalleled in the animal kingdom. A glimpse into the nest makes it apparent why honey bees have fascinated us from the earliest days of scientific observations. The infrastructure of the nest, the perfectly uniform and functional comb, is composed of beeswax and is constructed into a repeating series of almost perfect hexagonal cells.

At the individual level, honey bees have not one but three types of colony members: queens, drones and workers, each with their own specialisations and place in honey bee society. The queen reigns over the nest, surrounded by attendants and fed the rich food she requires to perform her few but crucial tasks in the colony. The queen produces powerful pheromones, chemical signals to recipient workers which control many of their behaviours and provide part of the \u2018social glue\u2019 which holds honey bee life together. A highly organised social structure exists within the colony and elaborate \u2018dances\u2019 are used to communicate the location of food sources.

The products of the hive are important to the modern agricultural system. Not only do honey bees provide us with honey, wax, propolis, royal jelly and pollen but they also pollinate a good portion of our crops, including such diverse agricultural plants as fruit trees, oilseeds, small berries and forage crops.

Honey is a remarkable viscous liquid, prepared by the bees from the nectars of various plants. It has occupied a prominent place in traditional medicines throughout world history. The ancient Egyptians, Assyrians, Chinese, Greeks and Romans employed honey for wounds and diseases of the gut. When the Children of Israel were in Egypt or journeying through the desert, their promised goal was a \u2018land flowing with milk and honey\u2019.

Both the holy Qur\u2019an and Hadith refer to honey as a healer of disease.

\u2018And thy Lord taught the bee to build its cells in hills, on trees and in (men\u2019s) habitations\u2026.. there issues from within their bodies a drink of varying colours, wherein is healing for mankind. Verily in this is a Sign for those who give thought\u2019.  (Translation of Quran 16:68-69)

In addition, the Prophet (PBUH) said:

\u2018Honey is a remedy for every illness and the Qur\u2019an is a remedy for all illness of the mind, therefore I recommend to you both remedies, the Qur\u2019an and honey.\u2019 (Bukhari)

The reader may be surprised to learn that the above quotation from the Qur\u2019an is mentioned in a well known encyclopedia on honey (reference 3).

In recent years, scientific support is beginning to emerge confirming the beneficial effects of honey on certain medical and surgical conditions. These effects may be summarised as follows:

Antibacterial and antifungal properties

These properties of honey are well established. Undiluted honey inhibits the growth of bacteria such as Staphylococcus aureus, certain gut pathogens and fungi such as Candida albicans. At a concentration of 30-50%, honey has been shown to be superior to certain conventional antibiotics in treating urinary tract infections. The exact mechanism of the anti-microbial effect of honey remains obscure. Low pH, osmotic disruption of pathogens and the presence of bactericidal substances, collectively called inhibine may all play a part.

Anti-diarrhoeal properties

At a concentration of 40%, honey has a bactericidal effect on various gut bacteria known to cause diarrhoea and dysentery such as Salmonella, Shigella, enteropathogenic E. coli and Vibrio cholera. In one study, honey given with oral rehydration fluid was shown to reduce the duration of bacterial diarrhoea in infants and children.

Wound-healing and anti-inflammatory properties

Honey is of value in treating burns, infected surgical wounds and decubitus ulcers. Honey is very viscous, enabling it to absorb water from surrounding inflamed tissue. For example, a study in West Africa showed that skin grafting, surgical debridement and even amputation were avoided when local application of honey to wound promoted healing, whereas conventional treatment failed.

In another study, wound healing was accelerated by application of honey in women who had undergone radical vulvectomy for vulval cancer. Also, it has been suggested that honey may be useful in the treatment of chronic, foul smelling ulcers seen in leprosy.

Anti-tussive and expectorant properties

These anti-cough properties of honey are related to its capacity to dilute bronchial secretions and improve the function of the bronchial epithelium.

Nutritional properties

Uncontaminated honey is a healthy, easily digestible, natural and energy rich food. It contains carbohydrates, proteins, lipids, enzymes and vitamins. One tablespoon of honey provides 60 calories and contains 11g of carbohydrates, 1mg of calcium, 0.2mg of iron, 0.lmg of vitamin B and 1mg of vitamin C.

Honey is widely available in most communities but its medical potential remains grossly underutilised. Its mode of action remains incompletely understood and the healing properties of honey in other clinical and laboratory situations requires further evaluation. The miraculous beneficial properties of honey, so beautifully ex-pressed in the holy Qur\u2019an and Sunnah 14 centuries ago expose the reluctance of modern science to accept and exploit this \u2018traditional remedy\u2018.

Selected References:

1.\xA0\xA0\xA0 Ali A.T.M.M. (1989) The Pharmacological Characterization and the Scientific Basis of the Hidden Miracles of Honey; Saudi Medical Journal 10(3):177-179

2.\xA0\xA0\xA0 Zumla A. and Lulat A. (1989) Honey- a remedy rediscovered; J Royal Soc Med 82:384-385

3.\xA0\xA0\xA0 Crane E. (1975) Honey: a comprehensive survey;London, Heineman

4.\xA0\xA0\xA0 Winston M.L. (1987) The Biology of the Honey Bee;London, Harvard University Press`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/health-in-quran-a-sunnah/311-benefits-of-honey/",license:"Fair Use / Permitted Metadata",publication_date:"2010-12-20T19:39:39",created_at:"2026-08-23 09:55:28"},{id:"2ba19c0d-2ae8-4e41-9c34-1ee7a81fc10d",title:"is the likeness of a garden on a height;",author:"Quran & Science",content:`\u201C\u2026.is the likeness of a garden on a height; heavy rain falls on it and it doubles its yield of harvest. And if it does not receive heavy rain, light rain suffices it\u2026\u201D\xA0 (Surat Al-Baqarah (The Cow): 265)

This verse mentions the scientific truth that an orchard on a flat surface, which is more elevated than what surrounds it, if subjected to heavy rain, will bear twice the amount of fruit.\xA0 This is because the likelihood of it being flooded with heavy rain is non-existent as the water quickly drains away from the soil after it has taken what it requires; this is as it is elevated above the valleys surrounding it. If, however, it does not receive heavy rain but light moisture (dew or light drizzles of rain) it is sufficient to water the plants and to produce plentiful fruit.

The point here is that such a garden on a height, thrives, flourishes, bears fruit and produces generously whether or not it receives heavy rain.

Surat Al-Baqarah describes those who spend for the sake of Allah and who are righteous. Allah makes what they have spent for Him in His cause thrive and grow (irrespective of whether the amount spent is large or small); the rewards of spending for the sake of Allah are compared to the produce of the garden on a height thrives and grows whether or not it receives heavy rain.

Each of the above mentioned scientific matters requires separate analysis; therefore, I will only focus my analysis in this article on the last point concerning the description of the garden on a height.\xA0 Before starting, we shall have a quick look at the interpretation of this noble verse by old and contemporary scholars.

Concerning the interpretation of the following verse that can be translated as,* \u201CAnd the likeness of those who spend their wealth seeking Allah\u2019s Pleasure while they in their ownselves are sure and certain that Allah will reward them (for their spending in His Cause), is the likeness of a garden on a height; heavy rain falls on it and it doubles its yield of harvest. And if it does not receive heavy rain, light rain suffices it. And Allah is All-Seer (knows well) of what you do.\u201D*

(Surat Al-Baqarah (The Cow): 265).

Ibn-Kathir said, \u201CThis is the likeness of the believers, who spend their wealth seeking to please Allah by doing so. * \u201C\u2026and to strengthen their souls \u2026\u201D *They know for a certainty that Allah will reward them most generously for spending in His cause.

Al-Sha\u2019abi explained* \u201C\u2026and to strengthen their souls\u2026\u201D* means that they do this out of true faith and absolute certainty.

All the scholars agree that *\u201C\u2026is the likeness of a garden on a height\u2026\u201D* means a place that is elevated from the ground; Ibn Abbas and Ad-dahak add that rivers flow through this garden. *\u201C\u2026Heavy rain falls on it and it doubles its yield of harvest\u2026\u201D* means it bears twice the amount of fruit as compared to other gardens, if it receives heavy rain.

The scientific implications of the noble verse:It is an obvious fact that the earth\u2019s surface is not completely flat.\xA0 It ranges from high lofty summits to low lying mountain ranges to the level plains that stretch to reach an altitude slightly above sea level.

Between the lofty summits and the leveled plains, we find heights and hills with different altitudes until we reach the plains, then we find continental depressions and sea and ocean trenches.

The reason why the topography of earth is variable is because of the different chemical and mineral composition of the rocks forming it and consequently the difference in the density of these rocks.\xA0 This is because the earth\u2019s solid layer (earth\u2019s crust) floats on a layer of semi-molten materials, which is called the weak zone (Asthenosphere) in the earth\u2019s layers. This floatation is governed by the laws and principles. (For example buoyancy principle, just as an iceberg that is less dense than water floats in the ocean).

The highest peak on the earth\u2019s surface, Mount Everest in the Himalayan mountain range, reaches an altitude of 8848 m above sea level.\xA0 The lowest point on land\u2019s surface is the floor of the Dead Sea (a part of continent not marine) and is about 400 m below sea level. The average altitude of land on earth is roughly 840 m above sea level.

The deepest point on the ocean floor of the earth is the Challenger Deep in the Mariana Trench in the Pacific Ocean; its depth is a little over eleven km whereas the average depth of ocean floors is about four km (3729 to 4500 m) below sea level.

These variations in altitudes provide vastly varying types of living environments, each suited for a specific form of life. We find therefore that fruit and chestnut trees and in general trees that have produce grow best on hills and heights that are under one thousand m above sea level, whereas grains and potatoes stop growing at about two thousand m above sea level (around 2160 m). The maximum altitude for forest growth is 2660 m above sea level.

The height best suited for a garden that was given as an example in the verse under analysis is wondrous, since this is the best environment known to us for the growth of fruit trees and others trees that have produce such as olive trees, almond trees, pine trees and others.\xA0 This is because the environment of heights is characterized by mild weather, abundant water, a greater chance of being exposed to sunshine, rainfall, humidity, wind movement and to air renewal around it.\xA0 Therefore it is the most suited environment for the growth of trees in general and of fruit trees in particular.

Heights are features of the earth\u2019s surface that are leveled and elevated above sea level by an average altitude ranging from 300 to 600 m.\xA0 Their altitudes are lower than that of mountains and higher than that of hills.\xA0 Consequently, rain water never drowns heights, no matter how strong the rainfall is.\xA0 That is because the rain water is pushed ever downward by the force of gravity to the surrounding areas that are lower than the height.\xA0 That is after its soil and rocks had been saturated with the required amount of water, which both cools and refreshes them and is stored in them.\xA0 Controlling the amount of stored water helps plants perform their vital activities efficiently without drowning or dehydration.\xA0 Dehydration kills the plants and drowning them in water or having an increase in the water storage in the rocks and soil would result in the decay, rotting and decomposition of the roots which would also kill the plants.

When heavy rain falls on a height, both its soil and rocks and the plants growing on it take their required intake of water, while excess water flows over to the lower surrounding areas till it reaches the valleys and the plains.\xA0 The controlled amount of water stored in the soil and rocks of the height helps the roots of plants in general and of trees in particular to extend deeper into the soil and rocks.\xA0 This multiplies the amounts of elements and compounds that become available for the roots to absorb, along with the nutritional sap they extract from the ground.\xA0 The extended roots also help fix the plants in the ground and make them resistant to strong wind and other environmental changes.

One of the advantages of the environment of heights is that if it receives heavy rain, it doubles its produce and if the humidity decreases and only drizzle or dew are available as moisture, it still bears plenty of fruit. This is because plants growing on heights are able to benefit from the rain water whatever the quantity they receive, as well as from the dew that condenses at higher rates than in plains or in closed valleys, particularly in dry regions.

Fruit trees and others trees such as olive, almond, and pine trees bear more fruit at heights that are above sea level than on level plains and closed valleys because if heavy rain falls on the height, the excess water quickly flows away from it after the garden has taken its water requirements.\xA0 It therefore benefits it and does not harm it in any way.\xA0 The garden therefore bears double the amount of fruit.\xA0 Nevertheless, when the garden does not receive heavy rain then the drizzle or dew condensing around it is sufficient to provide it with its water requirements, so it continues to live and bear fruit by the will of Allah.

The verse thus likens those who spend their wealth, seeking Allah\u2019s pleasure and to strengthen their souls (whatever their material ability) to a fertile garden with fruitful trees growing on an elevated height in favorable environmental conditions that have provided the garden with all the means for growth and a very generous production of fruit when it receives heavy rain, moreover, still a generous production of fruit if it receives light rain.\xA0 The continuous production of this garden does not stop under any circumstance, similarly believers spend in the cause of Allah driven by their faith in Allah (SWT) and their firm belief that He is the Sustainer and that He is the Powerful and the Strong.\xA0 They therefore spend in His cause whether their financial ability is strong or weak. They spend seeking only His pleasure and the strengthening of their souls, since one of the ways to train the human soul is through spending money in the cause of Allah, and in this respect Allah (SWT) says what can be translated as, \u201CAnd the likeness of those who spend their wealth seeking Allah\u2019s Pleasure while they in their ownselves are sure and certain that Allah will reward them (for their spending in His Cause), is the likeness of a garden on a height; heavy rain falls on it and it doubles its yield of harvest. And if it does not receive heavy rain, light rain suffices it. And Allah is All-Seer (knows well) of what you do.\u201D*

(Surat Al-Baqarah (The Cow): 265).

This verse points clearly to the preference of growing fruit trees in general on heights, which are flat elevated grounds, lower than mountains and higher than hills, ranging in altitude between 300 and 600 m above sea level.\xA0 This is a scientific fact that has been proven by experiments over successive decades.\xA0 This scientific fact is present in the Qur\u2019an which was revealed over 1400 years ago to an illiterate prophet (PBUH) in a nation whose large majority were illiterate and living in a dry desert with no knowledge of gardens or fruit trees except for palm or some vines in very limited areas of it.\xA0 This Qur\u2019anic description therefore bears witness that these are the words of Allah, the Creator, who has revealed it with His knowledge to His last prophet (PBUH).\xA0 Since the Qur\u2019an is the last message, Allah (SWT) has undertaken to guard it in the same language of its revelation (Arabic).\xA0 Therefore, He has protected it word for word, letter for letter, from any addition or omission or alteration or change, for over 14 centuries and until the Day of Judgment, as He has promised what can be translated as,* \u201CVerily, it is We Who have sent down the Dhikr (i.e. the Qur\u2019an) and surely, We will guard it (from corruption)\u201D*

(Surat Al-Hijr (The Rocky Tract): 9).

Praise be to Allah for the favor of the Qur\u2019an and praise be to Allah for the favor of Islam and praise be to Allah for guiding us to this while we could never have been guided to this had it not been for the guidance of Allah, and praise be to Allah in the hereafter and in this first world.\xA0 Blessings and peace be upon the last prophet and messenger and on his family and companions and all who follow his guidance and invoke with his invocation until the Day of Judgment.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/plants/171-is-the-likeness-of-a-garden-on-a-height/",license:"Fair Use / Permitted Metadata",publication_date:"2010-11-19T13:48:05",created_at:"2026-08-23 09:55:29"},{id:"82b907ec-a478-4d71-861e-39d20e245a1d",title:"The best days of the year",author:"Quran & Science",content:`Verily, the praise belongs to Allah, the Most High, and may the Blessings of Allah and Peace be upon His Prophet Muhammad and his family and companions, all of them. It is narrated from Ibn Abbaas (RAA) that the Prophet (PBUH) of said:

\u201CThere are no days in which righteous deeds done in them are more beloved to Allah than these days, ie the ten days (of Zul-Hijjah). They said: O Messenger of Allah, not even Jihaad in the path of Allah? He said: Not even Jihaad in the Path of Allah, the Most High, except if a man goes out (for Jihaad) with his self and his wealth, then he doesn\u2019t return with anything from that.\u201D (Al-Bukhaaree, Abu Daawood and others. The exact wording is that of Abu Daawood)

It is narrated from Ibn Umar that the Prophet Muhammad (Blessings of Allah and Peace be upon him) said:

\u201CThere aren\u2019t any days greater, nor any days in which deeds done in them are more beloved to Allah, the Most High, than these ten days (of Zul-Hijjah). So, increase in them the saying of Tahleel (La Ilaaha illa Allah), and Takbeer (Allah Akbar) and Tahmeed (al-Hamdu li-llah)\u201D [Musnad Imaam Ahmad]

{source}<script async src=\u201D//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js\u201D></script><!\u2013 Side_Banner \u2013><ins class=\u201Dadsbygoogle\u201D style=\u201Ddisplay:inline-block;width:336px;height:280px\u201D data-ad-client=\u201Dca-pub-6614722437984406\u2033 data-ad-slot=\u201D7906612176\u2033></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>{/source}

The Types of Deeds in These Ten Days:

First: The performance of Haj and Umrah, and these are the best of deeds that may be done. And what indicates their superiority are a number of Ahaadith, one of which is the saying of the Prophet (PBUH).

Performance of Umrah is an expiation of the sins committed between it and the previous Umrah, and the reward of the Haj which is accepted by Allah, the Most High, is nothing but Paradise. (Al-Bukhaaree and Muslim)

Second: Fasting during these days \u2013 as many of them as may be easy (for one to fast); especially the Day of Arafah. There is no doubt that the act of fasting is one of the best deeds, and it is from what Allah, the Most High, has chosen for himself, as in the Hadith Qudsee: Fasting is for Me, and it is I who give reward for it. Verily, someone gives up his sexual passion, his food and his drink for My sake\u2026\u201D (Al-Bukhaaree, Muslim, Maalik, at-Tirmidhee, Nasaa\u2019ee and Ibn Maajah)

Also, from Abu Sa\u2019eed al-Khudree who said that the Messenger of Allah said: No servant (of Allah, the Most High) fasts one day in the Path of Allah, except that Allah, the Most High, removes his face from the Fire because of it (the distance of travelling) seventy years. (Al-Bukhaaree and Muslim)

From Abu Qatadah that the Prophet said: Fasting the Day of Arafah will be credited with Allah by forgiving one\u2019s sins of the previous year and the following year. (Muslim)

Third: At-Takbeer (Allah Akbar) and adh-Dhikr (the remembrance of Allah through different words of praise and glorification) in these (ten) days, Allah said \u201CAnd mention the name of Allah on the appointed days\u201D(12:28).

This has been explained (by some) to mean the ten days (of Zul-Hijjah), and the scholars consider it desirable to increase adh-Dhikr in these days, based upon the hadith of Ibn Umar narrated by Ahmad, which contains the words:

\u2026 so increase in these days the Tahleel and Takbeer and Tahmeed\u2026

It is reported about Ibn Umar and Abu Hurairah that: the two of them used to go out to the market place during the ten days (of Zul-Hijjah) saying: Allahu Akbar, causing the people also to say it. (Al-Bukhaaree)

Ishaaq narrates from the scholars of the Taabi\u2019een that in these ten days they used to say:

Allahu Akbar, Allahu Akbar Laa Ilaaha illa \u2018llah Wa \u2018llahu Akbar, Allahu Akbar Wa li\u2019llahi al-hamd.

It is a beloved act to raise the voice when saying the Takbeer in the markets, the houses, the streets, the Masjids and other places, because of the saying of Allah, the Most High, in Surah al-Hajj, verse 37: \u201C\u2026 that you may magnify Allah for His Guidance to you\u201D

The saying of Takbeer in congregation, ie everyone pronouncing the Takbeer with one voice, is not permissible since this has not been transmitted (to us) from the early generations of the Sahabah and those who followed their ways. Verily, the Sunnah is for everyone to say the Takbeer individually. And this is (generally) applicable to Dhikr and supplications, except if the person doesn\u2019t know what to say. In that case he may repeat after someone else until he learns (the words to be said). It is also permissible to make Dhikr with all the different wording of Takbeer and Tahmeed and Tasbeeh, and the rest of the Islamic legislated supplications (from the Qur\u2019an and Sunnah).

Fourth: At-Tawbah (repentance) and abstaining from disobedience and all types of sins, since forgiveneand mercyare the results of deeds. Disobedience is the cause of being far away (from Allah, the Most High) and repulsion, while obedience is the cause of being near (to Allah, Most High) and His love. In the hadith of Abu Hurairah he said that the Prophet said: Verily Allah has a sense of Ghaira, and Allah\u2019s sense of ghaira is provoked when a person does that which Allah has prohibited. (Al-Bukhaaree and Muslim)

Fifth: Doing plenty of voluntary (nafl) righteous deeds of worship like Prayer, Charity, Jihaad, reading the Qur\u2019an, Commanding what is Good and Forbidding what is Evil, and other such deeds.

Verily, these are amongst the deeds that are multiplied in these days. It is during these days that even deeds that are less preferred, are superior and more beloved to Allah than superior deeds done at other times. (These deeds are superior) even to al-Jihaad \u2013 which is one of the most superior of all deeds \u2013 except in the case of one whose horse is killed and his blood is spilled (loss of life in Jihaad).

Sixth: It is legislated in these days to make at-Takbeer al-Mutlaq at all times of night and day until the time of the Eid Prayer. Also, at-Takbeer al-Muqayyad is legislated, and it is done after the (five) obligatory prayers that are performed in congregation. This begins from Dawn (Fajr) on the Day of Arafah (the 9th of Zul-Hijjah) for those not performing Haj, and from Noon (Zhur) on the Day of Sacrifice (10th of Zul-Hijjah) for those performing Haj (pilgrims); and it continues until Asr prayer on the last day of the days of Tash-reeq (13th of Zul-Hijjah).

Seventh: The slaughtering of a sacrificial animal (Adhiyah) is also legislated for the Day of Sacrifice (10th) and the Days of Tashreeq (11th, 12th and 13th). This is the Sunnah of our father Ibraaheem \u2013 when Allah, the Most High, redeemed Ibraaheem\u2019s son by the great sacrifice (of an animal in his place). It is authentically reported that The Prophet Muhammad slaughtered (sacrificed) two horned rams, black and white in colour, and said Takbeer (Allahu Akbar), and placed his foot on their sides (while slaughtering them). (Al-Bukhaaree and Muslim)

Eighth: Offering animal as Udhyia It has been narrated from Umm Salamah (may Allah be pleased with her) that the Prophet said: If you see the Hilal (new moon) of Zul-Hijjah, and any one of you wants to make a sacrifice, then he should not cut (anything) from his hair and his nails. (Muslim and others) . And in one narration, he said: .Then he should not cut (anything) from his hair, nor from his nails, until he performs the sacrifice. Perhaps this is because of the similarity with the one who is bringing a sacrificial animal for slaughter (in Haj). As Allah, the Most High, said: And do not shave your heads until the Hady (sacrifice) reaches the place of sacrifice\u2026

The apparent meaning of this prohibition is that it is particularly for the one whom the sacrifice is for, and does not include the wife or children, unless there is an individual sacrifice for one of them. There is no harm in washing the head, or scratching it, even if hairs may fall out.

Ninth: It is incumbent for the Muslim (who is not performing Haj) to make every effort to perform the Eid Prayer wherever it is performed, and to be present for the Khutbah and benefit.

He must know the wisdom behind the legislation of this Eid (celebration). It is a day of thankfulness and performing deeds of righteousness. So, he must not make it a day of wildness, pride and vanity. He should not make it a season for disobedience and increase in the forbidden things like music and singing, uncontrolled amusement, intoxicants and the like \u2013 those things which could cause the cancellation of the good deeds done in these days (of Zul-Hijjah).

Tenth: After what has been mentioned, it is fitting that every Muslim, male and female, take advantage of these days by obeying Allah, the Most High, remembering Him, thanking Him, fulfilling all the obligatory duties, and staying far away from the prohibited things. He must take full advantage of this season, and the open display of Allah\u2019s gifts, to attain the pleasure of his Lord.

Surely, Allah, the Most High, is the One Who grants success, and He is the Guide to the Straight Path. And may the blessings of Allah, the Most High, and peace be upon Muhammad and his family and companions!

Ghaira: A sense of honour and prestige, and the anger caused by its being violated. At-Takbeer al-Mutlaq: the Takbeer (Allahu Akbar) which is unrestricted to specific times or any specific form. At-Takbeer al-Muqayyad: The Takbeer which is done at a particular time and in a specific manner.`,source:"Quran and Science",original_url:"https://quranandscience.com/prophet-muhammad/jewels-from-prophet/227-the-best-days-of-the-year/",license:"Fair Use / Permitted Metadata",publication_date:"2010-11-05T12:44:25",created_at:"2026-08-23 09:55:30"},{id:"6538e9a3-b3f4-4422-a64a-0cd861386d44",title:"Scientific teams in Islamic civilization",author:"Quran & Science",content:`Introduction

\u201CScientific teams\u201D are a new basis with which Muslims changed the way of thinking of former scientists. For the first time in history, Muslims formed an integrated scientific team that included more than a scientist specialized in more than a field. Eventually, they provided us with a useful integrated work, which would not see light unless it relied on more than a scientific specialization.

First Scientific team in History

Sons of Musa ibn Shakir (Muhammad, Al-Hasan and Ahmad) were the first and the most famous scientific team in history. Muhammad was an engineering scientist; Ahmad was an astronomer; and Al-Hasan was a mechanist. Working together, they composed Kitab Al-Hiyal, which reflected the spirit of scientific team directly. The book embodied the principle of teamwork that is based on cooperation. The whole book was written in a plural form. For instance, Muhammad, Al-Hasan and Ahmad said in their book: \u201CWe wish to explain how a beaker is made in which a quantity of drink is poured, and if the quantity of an amount of drink or water is added to it all its contents are discharged.\u201D[1] \u201CWe wish to make a jar with an open outlet: if water is poured into it nothing issues from the outlet, and if pouring is stopped the water issues from the outlet, and if pouring is resumed [discharge] ceases again, and if pouring is stopped the water discharges, and so on continuously.\u201D[2] \u201CWe wish to explain how we make two fountains from one of which something like a lance discharges and from the other something like a zipper discharges.\u201D[3]

There are many other examples, which reflect the mature mentality of the sons of Musa ibn Shakir as an integrated scientific team. Such examples also reflect the importance and the value of teamwork in the scientific field.

There is no doubt that such integration and mix of various specializations between those brothers led them to reach scientific facts that were difficult to reach without teamwork. These facts include the accurate calculation of the diameter of the earth, and the manufacture of the huge astrolabe that enabled astronomers to calculate the position of the sun and other major nearby stars with respect to both the horizon and the meridian.

This was not confined to that distinguished scientific team, but it recurred in many other branches of science. There was noticeable cooperation between physicians, pharmacists, botanists and zoologists, and also between geologists, geographers and astronomers, and so on.

This happened between the famous physician Al-Razi and his students. Ibn Al-Nadim relates in his book Al-Fihrist (index) that \u201CAl-Razi was a unique physician at his time. He had the knowledge of ancient scientists, especially physicians. He used to travel. He used to be surrounded by several circles of students. When some patient arrived, he asked about his illness, this question was passed on to students of the first circle. If they did not know the answer, it was passed on to those of the second circle and so on and on, until at last, when all others had failed to supply an answer, it came to al-Razi himself. Al-Razi was a very generous man, with a humane behavior towards his patients, and acting charitable to the poor. He used to give them full treatment without charging any fee, nor demanding any other payment.\u201D[4]

Al-Razi\u2019s students were scientific teams, each of them used to propose their opinion about a certain issue until they reach a conclusion. Meanwhile, Al-Razi used to listen, follow up and correct their opinions after he discusses the issue with them!

This was not confined to life science only, but it also included the religious domain. Religious groups used to meet to discuss a certain issue, seeking the help of scholars of Qur\u2019an, hadith, jurisprudence, faith, and others, thus enriching the scientific movement and developing it quickly.

[1] Sons of Musa ibn Shakir: Kitab Al-Hiyal, explained by Ahmad Yusuf Al-Hasan and others, Arab Scientific Heritage Institute, 1981, p 57.

[2] Op cit, p 9.

[3] Kitab Al-Hiyal, p 356.

[4] Ibn Al-Nadim: Al-Fihrist, p 356`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/early-muslim-scientists/137-scientific-teams-in-islamic-civilization/",license:"Fair Use / Permitted Metadata",publication_date:"2010-10-30T09:02:14",created_at:"2026-08-23 09:55:30"},{id:"985d7c9c-a5ba-4b47-acf3-98fed07ae81b",title:"Co-Ordination in Human Body",author:"Quran & Science",content:`In the human body, all the systems simultaneously work in a co-ordinated way and in full harmony for a definite purpose, namely, to keep the body alive. Even the smallest movements we do everyday, such as breathing or smiling, are outcomes of perfect co-ordination in the human body.

Inside us is an incredibly complicated and comprehensively co-ordinated network that operates without stopping at all. The purpose is the continuance of living. This co-ordination is particularly visible in the locomotive system of the body, because, for even the smallest movement, skeletal system, muscles and nervous system must work in perfect collaboration.

In order to perform a co-ordinated act, first, the organs involved in this act and their inter-relations should be known. This information comes from the eyes, the balance mechanism in the internal ear, muscles, joints and skin. Every second, billions of pieces of information are processed, evaluated and new decisions are taken accordingly . Man is not even aware of the processes accomplished in his body at dizzying speed. He just moves, laughs, cries, runs, eats and thinks. He spends no effort in performing these acts. Even for a faint smile, seventeen muscles have to work together at the same time. In order to be able to walk, fifty-four different muscles in the feet, legs, hips and back must work in co-operation.

The perfection of the co-ordination of the body will be better understood with the following example. In order just to lift the hand, the shoulder has to be bent, the front and rear arm muscles \u2013 called \u201Ctriceps\u201D and \u201Cbiceps\u201D \u2013 should be contracted and relaxed, and the muscles between elbow and wrist have to twist the wrist. In every part of the act, millions of receptors in the muscles pass on information immediately to the central nervous system about the position of the muscles. In return, the central nervous system tells the muscles what to do in the next step. Of course one is not aware of any of these processes, but just wishes to lift one\u2019s hand, and does it right away.

What happens in case of a problem in this co-ordination? Different expressions might appear on our faces when we want to smile, or we might not manage to talk or walk when we want to. However, we can smile, talk, walk anytime we want and no problems occur, because everything mentioned here is accomplished as a result of the fact of Creation which logically requires \u201D infinite intelligence and power \u201C.

For this reason, man should always remember that he owes his being and life to his Creator, God . There is nothing for man to be arrogant or boastful about. His health, beauty or strength is not his own work, and it is not given to him eternally. He certainly will become old and lose his health and beauty. In the Qur\u2019an, this is stated as:

Anything you have been given is only the enjoyment of the life of this world and its finery. What is with God is better and longer lasting. So will you not use your intellect?\u201D (Surat al-Qasas: 60)`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/know-your-god/192-co-ordination-in-human-body/",license:"Fair Use / Permitted Metadata",publication_date:"2010-10-13T16:45:26",created_at:"2026-08-23 09:55:30"},{id:"5ffc9364-7f0d-433d-9b21-fcc395693421",title:"Jesus will return",author:"Quran & Science",content:`The Qur\u2019an explicitly declares the return of Jesus (pbuh) to earth. Many verses contain explicit statements regarding this matter. The proofs revealed in the Qur\u2019an take this form:

When Allah said, \u201C\u2018Isa, I will take you back and raise you up to Me and purify you of those who are disbelievers. And I will place the people who follow you above those who are disbelievers until the Day of Rising. Then you will all return to Me, and I will judge between you regarding the things about which you differed. (The Holy Qur\u2019an, Chapter 3, Verse 55)

The statement in the verse, \u201CAnd I will place the people who follow you above those who are disbelievers until the Day of Rising\u201D is important. Here, there is reference to a group strictly adhering to Jesus (pbuh) and who will be kept above the disbelievers until the Day of Judgement. Well, who are these adherents, then? Are they the disciples who lived in the time of Jesus or are they the Christians of today?

Before he was raised up to Allah, the followers of Jesus (pbuh) were few. After his ascension, the essence of the religion degenerated rapidly. Furthermore, the people known as the disciples faced serious pressure throughout their lives. During the succeeding two centuries, having no political power, those Christians having faith in Jesus (pbuh) were also oppressed. In this case, it is not possible to say that early Christians or their successors during these periods were physically superior to the disbelievers in the world. We might logically think that this verse does not refer to them.

When we look at the Christians of today, on the other hand, we notice that the essence of Christianity has changed a lot and it is quite different from what Jesus (pbuh) originally brought to mankind. Christians embraced the perverted belief that suggests that Jesus (pbuh) is the son of God and similarly held the doctrine of the trinity (The Father, Son and the Holy Spirit). In this case, it is flawed to accept the Christians of today as the adherents of Jesus (pbuh). In many verses of the Qur\u2019an Allah states that those having faith in the trinity certainly are disbelievers:

Those who say that the Messiah, son of Maryam, is the third of three are disbelievers. There is no god but One God. (The Holy Qur\u2019an, Chapter 5, Verse 73) In this case, the commentary of the statement, \u201CAnd I will place the people who follow you above those who are disbelievers until the Day of Rising\u201D is as follows: first, it is said that these people are the Muslims who are the only true followers of the authentic teachings of Jesus (pbuh); second, it is said that these people are the Christians, whether or not they hold idolatrous beliefs, and that could be seen to be confirmed by the dominant position that nominal Christians hold on the earth today. However, both positions will be unified by the arrival of Jesus (pbuh), since he will abolish the jizyah, meaning that he will not accept that Christians and Jews live with any other religion than Islam, and so will unite all the believers as Muslims.

The Prophet and last Messenger of Allah (pbuh), has also given the glad tidings of the return of Jesus (pbuh). The scholars of hadith (reports and traditions on the sayings and doings of the Prophet Muhammad) say that the hadiths on this subject, in which Allah\u2019s Messenger (pbuh) said that the Prophet Jesus (pbuh) will descend amongst people as a leader before the Day of Judgement have reached the status of mutawatir. That means that they have been narrated by so many people from each generation from such a large group of the Companions that there can be no possible doubt of their authenticity. For example:

Abu Hurairah (ra) narrated that Allah\u2019s Messenger, peace be upon him, said, \u201CBy the One in Whose hand is my self, definitely the son of Maryam will soon descend among you as a just judge, and he will break the cross, kill the pig and abolish the jizyah, and wealth will be so abundant that no one will accept it, until a single prostration will be better than the world and everything in it. (Sahih al-Bukhari)

Jabir ibn \u2018Abdullah said, \u201CI heard the Prophet, may Allah bless him and grant him peace, saying, \u2018A party of my ummah will never stop fighting for the truth victoriously until the Day of Rising.\u2019 He said, \u2018Then \u2018Isa ibn Maryam, peace be upon him, will descend and their amir will say, \u201CCome and lead us in prayer,\u201D but he will say, \u201CNo! some of you are amirs over others,\u201D as Allah\u2019s showing honour to this ummah.'\u201D (Sahih Muslim)

Abu Hurairah (ra) narrated, \u201CThe Prophet, peace be upon him, said: \u2018There is no prophet between me and him, that is, \u2018Isa, peace be upon him. He will descend (to the earth). When you see him, recognise him: a man of medium height, reddish fair, wearing two light yellow garments, looking as if drops were falling down from his head though it will not be wet. He will fight the people for the cause of Islam. He will break the cross, kill the pig, and abolish the jizyah. Allah will cause to perish all religions except Islam. He will destroy the Dajjal and will live on the earth for forty years and then he will die. The Muslims will pray over him.'\u201D (Abu Dawud)

(2)Earlier in this section, we analysed verses 157-158 of The Holy Qur\u2019an, Chapter 4. Just after these verses Allah states the following in The Holy Qur\u2019an, Chapter 4, Verse 159: There is not one of the People of the Book who will not believe in him before he dies; and on the Day of Rising he will be a witness against them. (The Holy Qur\u2019an, Chapter 4, Verse: 159)

The statement above \u201Cwho will not believe in him before he dies\u201D is important. The Arabic text of this sentence reads: Wa-in min ahli\u2019l-kitabi illa la yuminanna bihi qabla mawtihi.Some scholars stated that the \u201Chim/it\u201D in this verse is used for the Qur\u2019an and thus made the following interpretation: There will be no one from the people of the Book who will not have faith in the Qur\u2019an before he (a person from the people of the Book) dies.Nevertheless, in verses 157 and 158, which are the two verses preceding this verse, the same \u201Chim\u201D is undoubtedly used for Jesus (pbuh). The Holy Qur\u2019an, Chapter 4, Verse 157: And (on account of) their saying, \u201CWe killed the Messiah, \u2018Isa son of Maryam, Messenger of Allah.\u201D They did not kill him and they did not crucify him but it was made to seem so to them. Those who argue about him are in doubt about it. They have no real knowledge of it, just conjecture. But they certainly did not kill him. The Holy Qur\u2019an, Chapter 4, Verse 158: Allah raised him up to Himself. Allah is Almighty, All-Wise.

Just after these verses in The Holy Qur\u2019an, Chapter 4, Verse 159, there is no evidence indicating that \u201Chim\u201D is used to imply someone other than Jesus (pbuh). The Holy Qur\u2019an, Chapter 4, Verse 159: There is not one of the People of the Book who will not believe in him before he dies; and on the Day of Rising he will be a witness against them.

In the Qur\u2019an, Allah informs us that on the Day of Judgement, the \u201Ctongues and hands and feet will testify against them about what they were doing\u201D (The Holy Qur\u2019an, Chapter 24, Verse 24 and The Holy Qur\u2019an, Chapter 36, Verse 65). From The Holy Qur\u2019an, Chapter 41, Verses 20-23, we learn that \u201Chearing, sight and skin will testify against us.\u201D In none of the verses however, is there reference to \u201Cthe Qur\u2019an as a witness\u201D. If we accept that the \u201Chim\u201D or \u201Cit\u201D in the first sentence refers to the Qur\u2019an \u2013 though grammatically or logically we have no evidence whatsoever \u2013 then we should also accept that the \u201Che\u201D in the second statement also refers to the Qur\u2019an. To accept this however, there should be an explicit verse confirming this view. However, the commentator Ibn Juzayy does not mention the possibility of the Qur\u2019an being the \u201Chim\u201D referred to, and Ibn Juzayy transmitted the views of all the major commentators in his work.

When we refer to the Qur\u2019an, we see that when the same personal pronoun is used for the Qur\u2019an, there is generally mention of the Qur\u2019an before and after that specific verse as in the cases of The Holy Qur\u2019an, Chapter 27, Verse 77 and The Holy Qur\u2019an, Chapter 42, Verse 192-196. The verse straightforwardly defines that People of the Book will have faith in Jesus (pbuh) and that he (Jesus (pbuh)) will be a witness against them. The second point is about the interpretation of the expression \u201Cbefore he dies.\u201D Some think this is \u201Chaving faith in Jesus (pbuh) before their own death.\u201D According to this interpretation everyone from the people of the Book will definitely believe in Jesus (pbuh) before he/she faces their own death. In Jesus\u2019 time however, Jews who are defined as the people of the Book not only did not have faith in Jesus but also attempted to kill him. On the other hand, it would be unreasonable to say that Jews and Christians who lived and died after the time of Jesus had faith \u2013 the type of faith described in the Qur\u2019an \u2013 in him.

To conclude, when we make a careful evaluation of the verse, we arrive at the following conclusion: Before Jesus\u2019 (pbuh) death, all the People of the Book will have faith in him. (Tafsir of Omer Nasuhi Bilmen) In its real sense, the verse reveals plain facts, which are:

Firstly, it is evident that the verse refers to the future because there is mention of the death of Jesus (pbuh). Yet, Jesus (pbuh) did not die but was raised up to the presence of Allah. Jesus (pbuh) will come to earth again, he will live for a specified time and then die. Secondly, all the people of the Book will have faith in him. This is an event which has yet not occurred, but which will definitely happen in the future.

Consequently, by the expression \u201Cbefore he dies\u201D, there is a reference to Jesus (pbuh). The People of the Book will see him, know him and obey him while he is alive. Meanwhile, Jesus (pbuh) will bear witness against them on the Last Day. Allah surely knows best.

(3) That Jesus (pbuh) will come back to earth towards the end of time is related in another verse in The Holy Qur\u2019an, Chapter 43, Verse 61. Starting from The Holy Qur\u2019an, Chapter 43, Verse 57, there is reference to Jesus (pbuh):

When an example is made of the son of Maryam (\u2018Isa) your people laugh uproariously. They retort, \u201CWho is better then, our gods or him?\u201D They only say this to you for argument\u2019s sake. They are indeed a disputatious people. He is only a slave on whom We bestowed Our blessing and whom We made an example for the tribe of Israel. If We wished, We could appoint angels in exchange for you to succeed you on the earth. (The Holy Qur\u2019an, Chapter 43, Verses 57-60)

Just after these verses, Allah declares that Jesus (pbuh) is a sign of the Day of Judgement. He is a Sign of the Hour. Have no doubt about it. But follow me. This is a straight path. (The Holy Qur\u2019an, Chapter 43, Verse 61)

Ibn Juzayy says that the first meaning of this verse is that Jesus (pbuh) is a sign or a precondition of the Last Hour. We can say that this verse is a clear indication that Jesus (pbuh) will come back to earth at the end times. That is because Jesus (pbuh) lived approximately six centuries before the revelation of the Qur\u2019an. Consequently, we cannot interpret his first coming as a sign of the Day of Judgement. What this verse actually indicates is that Jesus (pbuh) will come back to earth towards the end of time, that is to say, during the last period of time before the Day of Judgement and this will be a sign for the Day of Judgement. Allah surely knows the best. The Arabic of the verse \u201CHe is a Sign of the Hour\u201D is Innahu la \u2018ilmun li\u2019s-sa\u2019ati\u2026 Some people interpret the pronoun hu (he) in this verse as the Qur\u2019an. However, the preceding verses explicitly indicate that Jesus (pbuh) is mentioned in the verse: \u201CHe is only a slave on whom We bestowed Our blessing and whom We made an example for the tribe of Israel.\u201D (Prof. Suleyman Ates, Yuce Kur\u2019an\u2019in Cagdas Tefsiri (The Contemporary Tafsir of the Holy Qur\u2019an), vol. 6, p. 4281) Those who cite this pronoun as referring to the Qur\u2019an go on to quote the next part of the verse \u201CHave no doubt about it. But follow me\u201D as evidence. However, the verses preceding this one refer totally to Jesus (pbuh). For this reason, it appears that the pronoun hu is linked to those preceding verses and also refers to Jesus (pbuh). In fact, great Islamic scholars declare that to be the case, based on the use of the pronoun both in the Qur\u2019an and in the hadith. Muhammad Hamdi Yazir of Elmali offers the following explanation in his commentary:

The statement in the verse, \u201CHe is a sign of the hour\u201D is an indication that the Hour will come and the dead will be resurrected and stand up. Jesus, both with his return to earth and his miracle of resurrecting the dead and also with his prophesying the rise of the dead is a sign of the Hour. It is also reported in the hadith that he is a sign of the Last Day.

In Sahih Muslim, it is also stated that the hadiths in which it is said that the Prophet Jesus (pbuh) will descend amongst people at the end of time have reached the degree of being mutawatir, i.e. narrated by so many people in each generation that it is not possible to have any doubt of their authenticity, and that it is counted as one of the major signs of the Day of Rising. (Sahih Muslim, 2/58)

Hudhayfah ibn Usayd al-Ghifari said, \u201CThe Messenger of Allah (pbuh) came to us all of a sudden as we were (busy in a discussion). He said: \u2018What are you discussing?\u2019 We said: \u2018We are discussing the Last Hour.\u2019 Thereupon he said: \u2018It will not come until you see ten signs before it\u2019 \u2013 and (in this connection) he made mention of the smoke, the Dajjal, the beast, the rising of the sun from the west, the descent of \u2018Isa the son of Maryam (pbuh), Yajuj and Majuj, and landslides in three places, one in the east, one in the west and one in Arabia at the end of which fire will burn forth from the Yemen, and drive people to the place of their assembly.\u201D (Sahih Muslim)

(4)Other verses indicating the second coming of the Jesus (pbuh) are the following;

When the angels said, \u201CMaryam, your Lord gives you good news of a Word from Him. His name is the Messiah, \u2018Isa, son of Maryam of high esteem in this world and the hereafter, and one of those brought near. He will speak to people in the cradle, and also when fully grown, and will be one of the righteous,\u201D she said, \u201CMy Lord! How can I have a son when no man has ever touched me?\u201D He said, \u201CIt will be so. Allah creates whatever He wills. When He decides on something He just says to it, \u2018Be!\u2019 and it is. He will teach him the Book and Wisdom, and the Torah and the Injil\u2026\u201D (The Holy Qur\u2019an, Chapter 3, Verse 45-48)

In the verse, it is heralded that Allah would instruct Jesus (pbuh) about the Injil, the Torah and the \u201CBook.\u201D No doubt, this book in question is very important. We come across the same expression in The Holy Qur\u2019an, Chapter 5, Verse 110:

Remember when Allah said: \u201C\u2018Isa, son of Maryam, remember My blessing to you and to your mother when I reinforced you with the Purest Spirit so that you could speak to people in the cradle and when you were fully grown; and when I taught you the Book and Wisdom, and the Torah and the Injil; and when you created a bird-shape out of clay by My permission\u2026\u201C(The Holy Qur\u2019an, Chapter 5, Verse 110)

When we analyse the \u201CBook\u201D in both of the verses, we see that it may indicate the Qur\u2019an. In the verses, it is stated that the Qur\u2019an is the last divine book sent apart from the Torah, the Zabur and the Injil. Besides, in another verse in the Qur\u2019an, next to the Torah and the Injil, the word \u201CBook\u201D is used to indicate the Qur\u2019an.

Allah, there is no god but Him, the Living, the Self-Sustaining. He has sent down the Book to you with truth, confirming what has there before it. And He sent down the Torah and the Injil, previously\u2026 (The Holy Qur\u2019an, Chapter 3, Verse 2-3) Other verses in which \u201Cbook\u201D refers to the Qur\u2019an reads: When a Book does come to them from Allah, confirming what is with them \u2013 even though before that they were praying for victory over the unbelievers \u2013 yet when what they recognise does come to them, they reject it. Allah\u2019s curse is on the unbelievers. (The Holy Qur\u2019an, Chapter 2, Verse 89) For this We sent a Messenger to you from among you to recite Our Signs to you and purify you and teach you the Book and Wisdom and teach you things you did not know before. (The Holy Qur\u2019an, Chapter 2, Verse 151)

In this case, we may well consider that the third book that will be taught to Jesus (pbuh) will be the Qur\u2019an and we could assume that this will be possible only if he comes to earth at the end of time. Jesus (pbuh) lived approximately 600 years before the revelation of the Qur\u2019an. When we look at the hadiths of our Prophet (pbuh), we understand that when the Prophet Jesus (pbuh) comes for the second time, he will command with the Qur\u2019an, not the Injil. This indeed conforms exactly with the meaning in the verse. Surely Allah knows the best. This is also explained in a hadith:

Abu Hurairah (ra) narrated that Allah\u2019s Messenger, peace be upon him, said, \u201CBy the One in Whose hand is my self, definitely the son of Maryam will soon descend among you as a just judge, and he will break the cross, kill the pig and abolish the jizyah, and wealth will be so abundant that no one will accept it, until a single prostration will be better than the world and everything in it. (Sahih al-Bukhari) The \u2018ulama (Islamic scholars) say that the meaning in this hadith of his acting as a just judge/ruler is that he will judge by the shari\u2019ah of Islam, i.e. by the judgements in the Book of Allah, the Qur\u2019an, and in the Sunnah of the Last Messenger of Allah, Muhammad, may Allah bless him and grant him peace. Allah surely knows best.

(5)Allah tells about the death of Jesus (pbuh) in one verse in The Holy Qur\u2019an, Chapter 19 as follows: (\u2018Isa said,) Peace be upon me the day I was born, and the day I die and the day I am raised up again alive. (The Holy Qur\u2019an, Chapter 19, Verse 33)

When we consider this verse together with The Holy Qur\u2019an, Chapter 3, Verse 55, it indicates a very important truth. In the verse in The Holy Qur\u2019an, Chapter 3, it is stated that Jesus (pbuh) was raised up to the presence of Allah. No information is given in this verse about death or killing. Yet in The Holy Qur\u2019an, Chapter 19, Verse 33 information is given about the day when Jesus (pbuh) will die. That death can only be possible if Jesus (pbuh) dies after returning to and living on earth. Only Allah knows for certain.

(6)Another piece of evidence about Jesus (pbuh) returning to earth appears in verse 110 in The Holy Qur\u2019an, Chapter 5 and in The Holy Qur\u2019an, Chapter 3, Verse 46 in the form of the word kahlan. The verses say:

Remember when Allah said, \u201D \u2018Isa, son of Maryam, remember My blessing to you and to your mother when I reinforced you with the Purest Ruh (Spirit) so that you could speak to people in the cradle and when you were fully grown (kahlan)\u2026 (The Holy Qur\u2019an, Chapter 5, Verse 110) He will speak to people in the cradle, and also when fully grown (kahlan), and will be one of the righteous. (The Holy Qur\u2019an, Chapter 3, Verse 46)

This word appears only in the above two verses in the Qur\u2019an, and only in reference to Jesus (pbuh). The meaning of the word kahlan used to refer to Jesus\u2019 adult state is along the lines of, between 30 and 50 years old, someone who is no longer young, someone who has reached the perfect age. Islamic scholars agree on translating this word as indicating the period after 35 years of age. Based on a hadith reported by Ibn \u2018Abbas to the effect that Jesus (pbuh) ascended to heaven in his early 30s, at a young age, and will stay another 40 years when he returns, Islamic scholars say that Jesus\u2019 old age will be after he returns to earth. (Muhammed Khalil Herras, Fasl al-maqal fi raf\u2019i \u2018Isa hayyan wa nuzulihi wa qatlihi\u2019d-Dajjal, Makatabat as-Sunnah, Cairo, 1990, page 20)

Close study of the verses in question easily shows how right Islamic scholars are on this question. In looking at the verses of the Qur\u2019an, we see that this statement is only used for Jesus (pbuh). All the prophets spoke to people and called them to the true path. They all communicated their message in maturity. Yet there is no such statement in the Qur\u2019an about any other prophet. The statement is only used to refer to Jesus (pbuh) and his miraculous situation. That is because the words \u201Cin the cradle\u201D and \u201Cwhen fully grown\u201D that follow each other in the verses are stressing two miraculous periods. In fact, in his work The Commentary of at-Tabari, Imam at-Tabari gives the following explanation of these verses:

These statements (The Holy Qur\u2019an, Chapter 5, Verse 110) indicate that in order to complete his lifespan and speak to people when fully grown Jesus (pbuh) will come down from heaven. That is because he was raised to heaven when still young. In this verse (The Holy Qur\u2019an, Chapter 3, Verse 46) there is evidence that Jesus is living, and Ahl al-Sunnah share that view. That is because in this verse it is stated that he will speak to people when fully grown. He will only be able to grow fully when he returns to earth from heaven. (Imam at-Tabari, The Commentary of at-Tabari, Vol. 2, page 528, Vol. 1, page 247).

Some people however, interpret the word \u201Cwhen fully grown\u201D in a manner far removed from its true meaning and do not analyse it in the context of the general logic of the Qur\u2019an. These people maintain that prophets have always been mature adults, for which reason the expression refers to all the lives of the prophets. Of course the prophets were mature adults whom Allah raised. Yet in Surat al-Ahqaf Allah reveals that the age of full maturity is forty. It is revealed in this verse that:

We have instructed man to be good to his parents. His mother bore him with difficulty and with difficulty gave birth to him; and his bearing and weaning take thirty months. Then when he achieves his full strength and reaches forty, he says, \u201CMy Lord, keep me thankful for the blessing You bestowed on me and on my parents, and keep me acting rightly, pleasing You. And make my descendants righteous. I have repented to You and I am truly one of the Muslims.\u201D (The Holy Qur\u2019an, Chapter 46, Verse 15)

The word kahlan, therefore, also points to Jesus\u2019 return to earth just like all the other information given in the Qur\u2019an. Only Allah knows for certain. As seen, verses on Jesus\u2019 (pbuh) return to the earth are very explicit. Similar expressions to these are not used in the Qur\u2019an regarding other prophets. All these expressions, however, are used about the Prophet Jesus (pbuh). The significance of this is clear.

Excerpted from Jesus will Return by Harun Yahya`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/quran-on-jesus/253-jesus-will-return/",license:"Fair Use / Permitted Metadata",publication_date:"2010-09-22T14:26:06",created_at:"2026-08-23 09:55:30"},{id:"a120baea-d30d-4ad0-915b-ffc5038633c1",title:"Diet During Ramadan",author:"Quran & Science",content:`INTRODUCTION

Fasting during the Islamic month of Ramadan can be good for one\u2019s health and personal development. Ramadan fasting is not just about disciplining the body to restrain from eating food and drinking water from predawn until sunset.

The eyes, the ears, the tongue, and even the private parts are equally obligated to be restrained if a Muslim wants to gain the total rewards of fasting. Ramadan is also about restraining anger, doing good deeds, exercising personal discipline, and preparing oneself to serve as a good Muslim and a good person during and after Ramadan.

This is why the Messenger of Allah (Peace be upon him, Pbuh) has been attributed, by Hazrat Abu Hurairah in hadith, to say: \u201CHe who does not desist from obscene language and acting obscenely (during the period of fasting), Allah has no need that he didn\u2019t eat or drink.\u201D (Bukhari, Muslim). In another hadith by Hazrat Abu Harairah, the Prophet (Pbuh) said: \u201CFasting is not only from food and drink, fasting is to refrain from obscene (acts). If someone verbally abuses you or acts ignorantly toward you, say (to them) \u2018I am fasting; I am fasting.\u201D (Ibn Khuzaoinah). Restraint from food, water, and undesirable behavior makes a person more mentally disciplined and less prone to unhealthy behavior. In an investigation in Jordan (1), a significant reduction of parasuicidal cases was noted during the month of Ramadan. In the United Kingdom, the Ramadan model has been used by various health departments and organizations to reduce cigarette smoking among the masses, especially among Africans and Asians (2).

Ramadan fasting has spiritual, physical, psychological, and social benefits; however, manmade problems may occur, if fasting is not properly practiced. First of all, there is no need to consume excess food at iftar (the food eaten immediately after sunset to break fast), dinner or sahur ( the light meal generally eaten about half an hour to one hour before dawn). The body has regulatory mechanisms that activate during fasting. There is efficient utilization of body fat. [El Ati et al. (3)]. Basal metabolism slows down during Ramadan fasting. [Husain et al. (4)]. A diet that is less than a normal amount of food intake but balanced is sufficient enough to keep a person healthy and active during the month of Ramadan.

Health problems can emerge as a result of excess food intake, foods that make the diet unbalanced, and insufficient sleep (5, 6). Ultimately also, such a lifestyle contradicts the essential requirements and spirit of Ramadan.

DIET DURING RAMADAN

According to Sunna (the practices of Prophet Muhammad, Pbuh) and research findings referred in this report, a dietary plan is given:

1. Bread/Cereal/Rice, Pasta, Biscuits and Cracker Group: 6-11 servings/day; 2. Meat/Beans/ Nut Group: 2-3 servings/day. 3. Milk and Milk Product Group: 2-3 servings/day. 4. Vegetable Group: 3-5 servings/day; 5. Fruit Group: 2-4 servings/day. 6. Added sugar (table sugar, sucrose): sparingly. 7. Added fat, polyunsaturated oil 4-7 table spoons.

Breakfast, iftar:

The body\u2019s immediate need at the time of iftar is to get an easily available energy source in the form of glucose for every living cell, particularly the brain and nerve cells. Dates and juices are good sources of sugars. Dates and juice in the above quantity are sufficient to bring low blood glucose levels to normal levels. Juice and soup help maintain water and mineral balance in the body. An unbalanced diet and too many servings of sherbets and sweets with added sugar have been found to be unhealthy. [Gumma et al. (7)].

Consume foods from all the following food groups:

Meat/Bean Group: Chicken, beef, lamb, goat, fish, 1-2 servings (serving size = a slice =1 oz); green pea, chickpea (garbanzo, chana, humus), green gram, black gram, lentil, lima bean and other beans, 1 serving (half cup). Meat and beans are a good source of protein, minerals, and certain vitamins. Beans are a good source of dietary fiber, as well.

Bread/Cereal Group: Whole wheat bread, 2 servings (serving size = 1 oz) or cooked rice, one cup or combination. This group is a good source of complex carbohydrates, which are a good source of energy and provide some protein, minerals, and dietary fiber.

Milk Group: milk or butter-milk (lassi without sugar), yogurt or cottage cheese (one cup). Those who can not tolerate whole milk must try fermented products such as butter-milk and yogurt. Milk and dairy products are good sources of protein and calcium, which are essential for body tissue maintenance and several physiological functions.

Vegetable Group: Mixed vegetable salad, 1 serving (one cup), (lettuce, carrot, parsley, cucumber, broccoli, coriander leaves, cauliflower or other vegetables as desired.) Add 2 teaspoons of olive oil or any polyunsaturated oil and 2 spoons of vinegar. Polyunsaturated fat provides the body with essential fatty acids and keto acids. Cooked vegetables such as guar beans, French beans, okra (bhindi), eggplant (baigan), bottle gourd (loki), cabbage, spinach, 1 serving (4 oz). Vegetables are a good source of dietary fiber, vitamin A, carotene, lycopenes, and other phytochemicals, which are antioxidants. These are helpful in the prevention of cancer, cardiovascular diseases, and many other health problems.

Fruits Group: 1-2 servings of citrus and/or other fruits. Eat fruits as the last item of the dinner or soon after dinner, to facilitate digestion and prevent many gastrointestinal problems. Citrus fruits provide vitamin C. Fruits are a good source of dietary fiber.

Fruits and mixed nuts may be eaten as a snack after dinner or tarawiaha or before sleep.

Pre-dawn Meal (sahur):

Consume a light sahur. Eat whole wheat or oat cereal or whole wheat bread, 1-2 serving with a cup of milk. Add 2-3 teaspoons of olive oil or any other monounsaturated or polyunsaturated fats in a salad or the cereal. Eat 1-2 servings of fruits, as a last item.

Blood cholesterol and uric acid levels are sometimes elevated during the month of Ramadan (8). Contrary to popular thinking, it was found that intake of a moderately high-fat diet, around 36% of the total energy (calories), improved blood cholesterol profile. [Nomani, et al. (9) and Nomani (10)] It also prevents the elevation of blood uric acid level (8-10). The normal recommended guideline for fat is 30% or less energy. On weight basis, suggested fat intake during Ramadan is almost the same as at normal days. Fat is required for the absorption of fat-soluble vitamins (A, D, E, K) and carotenoids. Essential fatty acids are an important component of the cell membrane. They also are required for the synthesis of the hormone prostaglandin. Keto-acids from fat are especially beneficial during Ramadan to meet the energy requirement of brain and nerve cells. Keto-acids also are useful in the synthesis of glucose through the metabolic pathway of gluconeogenesis. This reduces the breakdown of body proteins for glucose synthesis. Therefore, the energy equivalent of 1-2 bread/cereal servings may be replaced with polyunsaturated fat.

During Ramadan increased gastric acidity is often noticed, [Iraki, et al. (5)] exhibiting itself with symptoms such as a burning feeling in the stomach, a heaviness in the stomach, and a sour mouth. Whole wheat bread, vegetables, humus, beans, and fruits \u2014 excellent sources of dietary fiber \u2014 trigger muscular action, churning and mixing food, breaking food into small particles, binding bile acids, opening the area between the stomach and the deudenum-jejunum and moving digesta in the small intestine. [Kay (11)]. Thus, dietary fiber helps reduce gastric acidity and excess bile acids. [Rydning et al. (12)]. In view of dietary fiber\u2019s role in moving digesta, it prevents constipation. It\u2019s strongly suggested that peptic ulcer patients avoid spicy foods and consult a doctor for appropriate medicine and diet. Diabetic subjects, particularly severe type I (insulin dependent) or type II (non-insulin dependent), must consult their doctor for the type and dosage of medicine, and diet and precautions to be taken during the month. Generally diabetes mellitus, type II, is manageable through proper diet during Ramadan. [Azizi and Siahkolah (13)].

Pregnant and lactating women\u2019s needs for energy and nutrients are more critical than the needs of men (14). There is a possibility of health complications to the pregnant woman and the fetus or the lactating mother and the breastfed child, if energy and nutrient requirements are not met during the month of Ramadan (15-19). Governments, communities, and heads of the family must give highest priority to meet women\u2019s dietary needs. In African countries, Bangladesh, India, Pakistan and many other places malnutrition is a major problem, especially among women from low-income groups. Further more, it is common among these women to perform strenuous work on farms or in factories, and other places. Malnutrition and strenuous conditions may lead to medical problems and danger to life. Under these conditions one must consult a medical doctor for treatment and maulana or sheikh for postponement or other suggestions regarding fasting. Quran Al-Hakeem and Hadith allow pregnant women and lactating mothers flexibility during the month of Ramadan.

For practical purposes and estimation of nutrients a diet was formulated, given below:

3 dates, 1/2 cup of orange juice, 1 cup of vegetable soup, 2 plain graham crackers; dinner: 1 cup of vegetable salad with two teaspoons of corn oil and two teaspoon of vinegar, 2 oz. of chicken, 1/2 cup of okra, 4 oz. of cooked whole chana (garbanzo), 3 tea spoon of oil while cooking main dishes, 2 slices of whole wheat bread, 1 cup of cooked rice, 3/4 cup of plain yogurt, one orange, 1/2 cup grapes, 1 oz of nuts-mixed roasted-without salt; sahur: 2 slices of whole wheat bread, 1 cup of milk, 1/4 cup of vegetable salad with two teaspoons of corn oil and two teaspoons of vinegar, 1 skinned apple, 2 teaspoons of sugar with tea or coffee.

Nutritionist IV (20) was used to estimate energy and nutrient content in the above diet, which was as follows: energy, 2136 kilocalories; protein, 70g; carbohydrate , 286g; fat, 87g, 35 % of energy of the total intake, (saturated fat 16.9g; mono saturated, 28.4g; poly unsaturated, 34g; other 7.3g; \u2013 oleic, 25.6g; linoleic, 29.5; linolenic, 0.6g; EPA-Omega-3, 0.006g; DHA-omega-3, 0.023g; dietary fiber 34g; calcium, 1013mg; sodium, 3252 mg; potassium, 2963mg; iron 13.3mg; zinc, 10mg. When the nutrients were compared with the Recommended Dietary Allowance (RDA), for an adult non-pregnant and non-lactating female (14), the diet met 100% or more of the RDA for protein, calcium, sodium, potassium, and vitamin A, K, B1, B2, B3, B6, B12, folate, and C. The energy was close to the RDA, (97%). The dietary fiber level also was met as per the recommendation (11). Consuming food in the above amount by pregnant or lactating female may not meet the RDA for all of the nutrients. They may need supplementation of some minerals and vitamins such as, iron vitamin D, and more energy through bread or rice.

Further suggestions:

Drink sufficient water between Iftar and sleep to avoid dehydration.

Consume sufficient vegetables at mealtimes. Eat fruits at the end of the meal.

Avoid intake of high sugar (table sugar, sucrose) foods through sweets or other forms.

Avoid spicy foods.

Avoid caffeine drinks such as coke, coffee or tea. Caffeine is a diuretic. Three days to five days before Ramadan gradually reduce the intake of these drinks. A sudden decrease in caffeine prompts headaches, mood swings and irritability.

Smoking is a health risk factor. Avoid smoking cigarettes. If you cannot give up smoking, cut down gradually starting a few weeks before Ramadan. Smoking negatively affects utilization of various vitamins, metabolites and enzyme systems in the body.

Do not forget to brush or Miswak (tender neem tree branch, Azhardicta indica or other appropriate plant in a country, about 1/4-1/2 inch diameter and 6-8 inches length, tip partially chewed and made brush like). Brush your teeth before sleep and after sahur. Brush more than two times or as many times as practicable.

Normal or overweight people should not gain weight. For overweight people Ramadan is an excellent opportunity to lose weight. Underweight or marginally normal weight people are discouraged from losing weight. Analyzing a diet\u2019s energy and nutritional component, using food composition tables or computer software, will be useful in planning an appropriate diet.

It is recommended that everyone engage in some kind of light exercise, such as stretching or walking. It\u2019s important to follow good time management practices for Ibada (prayer and other religious activities), sleep, studies, job, and physical activities or exercise.

In summary, intake of a balanced diet is critical to maintain good health, sustain an active lifestyle and attain the full benefits of Ramadan.

Source: International Journal of Ramadan Fasting Research`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/legislative/180-diet-during-ramadan/",license:"Fair Use / Permitted Metadata",publication_date:"2010-08-12T12:19:00",created_at:"2026-08-23 09:55:30"},{id:"629024c8-2c7e-4ef8-b0c0-f90ed5db037c",title:"How to Welcome the Month of Ramadan",author:"Quran & Science",content:`\u201CO ye who believe! Fasting is prescribed to you as it was prescribed to those before you, that ye may (learn) self-restraint, (Fasting) for a fixed number of days; but if any of you is ill, or on a journey, the prescribed number (should be made up) from days later.

For those who can do it (with hardship), is a ransom, the feeding of one that is indigent but he that will give more, of his own free will, it is better for him. And it is better for you that ye fast, if ye only knew. Ramadan is the (month) in which was sent down the Qur\u2019an, as a guide to mankind, also Clear (Signs) for guidance and judgment (between right and wrong). So every one of you who is present (at his home) during the month should spend it in fasting, but if any one is ill, or on a journey, the prescribed period (should be made up) by days later.

Allah intends every facility for you; He does not want to put you to difficulties. (He wants you) to complete the prescribed period, and to glorify Him in that He has guided you; and perchance ye shall be grateful. When My servants ask you concerning Me, I am indeed close (to them): I listen to the prayer of every suppliant when he calls on Me: let them also, with a will, listen to My call, and believe in Me: that they may walk in the right way.\u201D (Al-Baqarah 2:183-186)

Allah subhanahu wa ta\u2019ala is giving us another opportunity in our life to witness the month of Ramadan. Ramadan is a great time of Allah\u2019s blessings and His mercy. Every Muslims should take full advantage of this time. We should get ready now to welcome this month and receive it with happiness. Following are some ways to welcome this month:

1. Special Du\u2019a: Pray to Allah that this month reaches you while you are in the best of health and safety so that you can fast and do all your acts of devotion (\u2018ibadat) with ease and enthusiasm. It is reported by Anas bin Malik that the Prophet \u2013 peace be upon him \u2013 used to say from the beginning of Rajab in his prayers:

\u201CO Allah bless us in Rajab, bless us in Sha\u2019ban and bless us in Ramadan.\u201D (Musnad Ahmad, 2228)

When he used to see Ramadan\u2019s crescent, he used to pray:

\u201CO Allah, make this crescent to shine on us with safety, faith, security, Islam and good fortune to do what is beloved and pleasing to our Lord. Our and your Lord is Allah.\u201D (Al-Darmi 1625)

2. Thanks and Happiness: When the month comes, then you should be thankful to Allah and show happiness. The Companions of the Prophet \u2013 may Allah be pleased with all of them \u2013 used to greet each other on the beginning of Ramadan. The Prophet \u2013 peace be upon him \u2013 used to say:

The Prophet \u2013 peace be upon him \u2013 said giving the good news of the month to his Companions, \u201CThe month of Ramadan has come to you. It is a blessed month. Allah has made obligatory on you to fast during this month. The gates of heaven are opened in this month and the gates of hell are closed and the devils are chained. In this month there is a night that is better than one thousand months. Whosoever is deprived of its blessings is indeed deprived.\u201D (Musnad Ahmad 8631)

3. Planning and Determination: You should make a good plan for the whole month about how you are going to organize your days and evenings during Ramadan. Plan special schedules for your work so that you can pray on time, read the Qur\u2019an and take Sahur and Iftar on time. Have sincere intention and determination to take full advantage of this time. Also have a full determination and commitment that you will not do any sin or anything wrong during this time. Make sincere repentance and seek the forgiveness of those whom you might have offended. In this way you can benefit much more from your fasting and prayers.

4. Learn about the Rules of Fasting: Fiqh of fasting is very important so that you do not do anything that will spoil your fasts. Learn the way of Prophet Muhammad in fasting. That is the best way. Fast is not spoiled only by eating and drinking during the fast, but also by speaking bad words and doing wrong things. The Prophet \u2013 peace be upon him \u2013 said, \u201CWhosoever does not give up bad words and bad deeds, Allah has no need in that he leaves his food and his drink.\u201D (Al-Bukhari 1770)

5. Charity, Generosity and Kindness: The month of Ramadan is the month of kindness, charity and generosity. Plan to invite your neighbors, co-workers, friends, Muslims and non-Muslims to have Iftar with you. Let your non-Muslims friends and neighbors know about this month and its blessings. Be more generous and help the poor and needy. Plan to give your Zakat and Sadaqat at this time and help others as much as you can. It is reported in a Hadith:

The Prophet \u2013 peace be upon him \u2013 was the most generous person, but in Ramadan he used to be more generous when Jibrael(a.s.) used to meet him. Jibraeel(a.s.) used to see him during Ramadan every night and he used to read the Qur\u2019an with him. The Prophet \u2013peace be upon him \u2013 was then more generous with goodness than the blowing wind.\u201D (Al-Bukhari, 5)`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/pillars-of-islam/281-how-to-welcome-the-month-of-ramadan/",license:"Fair Use / Permitted Metadata",publication_date:"2010-08-04T18:10:41",created_at:"2026-08-23 09:55:30"},{id:"aa0d066a-e928-4134-acd9-27f1e2cf71c4",title:"Fasting Soothes the Stomach",author:"Quran & Science",content:`Ramadan fasting has a healing effect on peptic ulcers as it curbs smoking which is recognised as a precipitating factor for the peptic ulcer. The whole gastro-intestinal system takes good rest for the first time in the whole year

I feel pity for the stomach. I really feel pity for the stomach, intestines and infact the whole gastro-intestinal system. And this is so because the whole year, we never let this system take rest.

Apart from the three main meals, every few minutes, we pour something in our stomach, be it snacks, drinks, fruits or other eatables. None of us ever thinks that the food which we had already sent in before is being digested by the stomach and right when it has reached halfway, we dump some more into it only to disrupt the digestive work previously completed. This of course makes the food stay a longer time in the stomach which may result in dyspepsia, gastritis, irritable bowel syndrome etc.

In contrast, Ramadan is the only period in which our gastro-intestinal system takes good rest as the Muslims observe fasting for the whole month. Digestion is not just the name of churning movements of the stomach and the absorption by the intestines, but it is a huge integrated system involving the nervous system (eg. vagus nerve) as well as hormone secreting glands.

So the whole gastro-intestinal system takes good rest for the first time in the whole year. As digestion begins in the mouth where the salivary glands secrete excessive saliva which carries hormones to act upon the food, the burden on the salivary glands and teeth is reduced in the month of Ramadan. The oesophagus takes rest during fasting as there is no food to require its propelling movements which push the food to the stomach. Similarly, the stomach and the intestines also take good rest as after completing the digestion and absorption of food consumed at Sehri time, they have nothing to do till Iftar time. Even glands like pancreas and gall bladder which secrete hormones also reduce their secretions as there is no food to demand their hormones.

Hence, there is substantial reduction in the gastrointestinal hormones like gastric juice, gastrain, gastric inhibitory peptide (GIP), motilin, vascoactive intestinal peptide (VIP),neurotension, enteroglucagon, neuropeptide Y, gallium etc. Lastly, the colon and the liver are also at ease during fasting. In short, Ramadan lifts the heavy burden and strain which we have put on our gastrointestinal system and gives it what can said to be a refreshing annual vacation of 30 days. Now coming to the diagnostic possibilities of Ramadan fasting, a good number of patients who consult physicians with abdominal pain, suffer from peptic ulcers. The peptic ulcer can be gastric or the duodenal type. The occurence of abdominal pain in both gastric and duodenal ulcers is different in relation to the food intake. Duodenal ulcer pain, though variable usually occurs when the stomach is empty and the gastric ulcer creates pain after the food intake.

In normal days, the differentiation of the two entities is difficult to make as people eat frequently, but in Ramadan, an individual undergoes two stages. One during the fasting when his stomach is empty and the other after evening meal when the stomach is full. If the patient complains of abdominal pain while fasting, it will point to the possibility of duodenal ulcer and if the pain occurs after Iftar, then gastric ulcer will be the suspected diagnosis. The peptic ulcer pain is variable and it may not occur in some patients. Similarly, in most of the duodenal ulcer cases, as soon as mild pain starts, the patient eats something due to which the pain disappears and the disease remains undiagnosed. This undiagnosed ulcer may later surface with perforation of the ulcer and haematemesis (vomiting of blood) which has a high mortality. In Ramadan, while fasting, the duodenal ulcer pain is more likely to surface and as there is no provision to relieve the pain with food, the patient may be forced to consult a physician who with the help of endoscopy can easily clinch the diagnosis. While examining the abdomen of a patient who is already fasting, a physician can easily palpate the tenderness as well as feel the oedema around the peptic ulcer region.

Ramadan fasting has a healing effect on peptic ulcers as it curbs smoking which is recognised as a precipitating factor for the peptic ulcer. It also has beneficial effects on inflammatory bowel disease, irritable bowel syndrome, dyspepsia and gastritis.

Last, but not the least, imagine a person who has fasted for more or less 14-15 hours and is now ready to break his fast. His taste buds have taken good rest, so at Iftar, the food is going to taste more pleasant and enjoyable than ever before. This is yet another bounty of Ramadan. Allah\u2019s Messenger Prophet Muhammad (saws) says: \u201CThere are two pleasures for the fasting person, one at the time of breaking his fast and the other at the time when he will meet his Lord, then he will be pleased because of his fasting.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/legislative/182-fasting-soothes-the-stomach/",license:"Fair Use / Permitted Metadata",publication_date:"2010-07-26T13:44:44",created_at:"2026-08-23 09:55:30"},{id:"c319ac4c-36ef-4f28-92b1-453ecd3d54af",title:"The Rock from which the camel came out from",author:"Quran & Science",content:`Thamud, one of the perished nation, lived in a valley which is about two hundred meters above sea level, it is also surrounded by tall mountains with 1200 meters average height.

The account of the Holy Quran about these nations shows that they were skilled in stone sculpture, Allah gifted them with many bounties and that they led luxurious life.

When God sent them a prophet from among themselves, they belied him and hold his name to obloquy and ridicule; they attacked him with abusive words. When their great prophet persisted in teaching them God\u2019s word, they set as a condition to believe that he should bring them a she-camel out of a huge rock.

The holy Quran explanation books say \xA0that the she-camel that God sent to the tribe of Prophet Saleh came out a huge rock, this rock lies isolated in the area where they lived.

The expounders of the Holy Quran say that Prophet Saleh came to his tribe to admonish them to believe and warn them of the consequences of unbelief, they asked for a sign to believe; they pointed to a large rock and said:

\u201CCan you see this large rock? We want you to get out of this rock a she-camel with a baby in its belly; they started to set many conditions in these she-camels, they even were particulars and choosy. The prophet said\u2019 So what will you do if God gives you His sign? Will you believe?'\u201D\xA0 \u201CYes, we will.\u201D They said. So the prophet prayed to God and God answered his prayer and a huge camel went out from the rock, it was exactly as they asked. When the say this miracle, some believed and some didn\u2019t.

Some readers might ask how the expounders got the information they wrote down in their books from, they have recorded in their books information about the camel, description about the rock and even the names of the people who conspired to kill it.

It is narrated that the prophet gave his companions a lot of information about this tribe and how they were perished. The prophet and his companions passed by \u201D Alhager\u201D, the place in which the prophet \xA0Saleh and his tribe lived in\u201D on his way back from Tabouk invasion.

Gabr narrated that\xA0 when the prophet passed by \u201CAl-Hajer\u201D (the habitations of Thamud), he said: \u201D O\u2019 people don\u2019t ask for signs the same way Thamud did.\u201D Those were the people to whom Prophet Saleh was sent, and they asked him for a sign sent by God to them, so God created out for them a she-camel out of a rock they determined.

Narrated Al-Boukhary, narrated the son of Umar that the prophet passed by the place where the habitations of Thmud were, he ordered them not to drink from its well \u2026 so the people\xA0 said :\u201D we have already kneed our flour, so the prophet ordered them to spill the water they got and to drink from the water the she-camel used to drink from, and as to the flour they kneed, he ordered them to feed their animals on.

We can conclude that the prophet must have determined the rock which the she-camel went out from, since he determined the cave that the she-camel used to shelter herself in and the fountain which she drank from; also the prophet must have given all the information that the expounders of the Holy Quran wrote down in their books without being attributed to the prophet.

As to the features of the rock concerned, we can compare its features as mentioned in \xA0the books of expounding the Holy Quran\xA0 and these of the rocks that are \xA0existent in the valley, we shall depend on Google earth programme.

The prophet and his companions passed by the valley in which there used to be the habitations of Thamud. Those people, in order to believe, asked their prophet\u2019 Saleh\u2019 to show a sign \xA0or a miracle to prove his prophethood , and they determined the rock from which this she-camel should come from, this rock \xA0had to be massive and the she-camel must be pregnant and also parturient, they also determined \xA0the rock by a certain \xA0name which is \u201D Al-kataba\u2019.

Their Prophet agreed and put them under the commitment that they should believe if God showed this sign to them \xA0and they agreed. He started to pray to his Lord to answer his prayer and bring them a she-camel from the rock so that they believed. God answered his prayer and the rock cleft asunder and the she-camel went out from it exactly as they wanted; on seeing it some believed and some did not.

If we look at the picture keenly, we will see a huge rock covered with blackness, and this rock is located in isolated place in the upper part of the valley to the right. This rock is so huge and this makes it looks much like a mountain; it has odd appearance and this lays credence to the claim that those people used to worship their idols around it, its longest part amounts to(1500 M), and its widest part is about(700m), the highest hill on it reaches (100m) above \xA0the surrounding area. We will give a plethora of evidences that this rock was the one from which the she-camel went out from.

The name of the rock is\u201D Al-Kataba\u201D which can be translated\u201D the writing\u201D , the word is a present participle in Arabic, if you look closely at the picture you will find it taking the shape of \u201Cthe palm of hand\u201D, and what look like fingers come out from the rock.

Nowadays people call this rock\u201D Al-Hwar mount\u201D, the word Hwar means\u201D the baby of the she-camel\u201D, the significance of this name lies in the fact that the baby of the she-camel came back to his mother and went into it after it foamed three times, these were reference to the fact that the calamity would befall them after three days.

We can deduce the second proof from the narration that says\u201D the stone has moved then cleft asunder to let a she-camel go out\u201D, a close look at the rock supports this narration; there is a subside in the ends of the rock, one of these subsides reaches(80) meters. Surely the going out of the she-camel must have caused such a malformation\xA0 in the rock and that is why the corners of the rock subsided to be evidence to the emergence of the she-camel from the rock.

It is amazing that there are only two rocks which carry the sign of subsiding, they are near each other, and this is a proof that the she-camel went out from it.

The third evidence is that there is a black volcanic crater which takes the form of a she-camel in the sitting position, the length of the crater is fifty meter and the width is about twenty meters. The existence of this crater poses many questions that geologists can give answers too. Though the rock is big, it can\u2019t bear the signs of the explosion of a volcano because, if ever a volcano happened in it, it could have changed into pieces. One more question; the crater outline is clear and it has a geometrical shape which is different from the usual shapes of the volcanoes.

One more significant point; there is no traces of lava, this means that the volcano had erupted for a short time and the power of the explosion was so great that the lava gushed out were thrown away in the surrounding area.

I will explain how this punishment was inflicted on the tribe of Saleh after they killed the she-camel, this can give answers to these questions, in the following holy verses God says what means:

\u201CAnd O my people! This she-camel of Allah is a symbol to you: leave her to feed on Allah\u2019s (free) earth, and inflict no harm on her, or a swift penalty will seize you!\u201D (64) But they did ham-string her. So he said: \u201CEnjoy yourselves in your homes for three days: (Then will be your ruin): (Behold) there a promise not to be belied!\u201D (65) When Our Decree issued, We saved Salih and those who believed with him, by (special) Grace from Ourselves \u2013 and from the Ignominy of that day. For thy Lord \u2013 He is the Strong One, and able to enforce His Will. (66) The (mighty) Blast overtook the wrong-doers, and they lay prostrate in their homes before the morning,- (67) As if they had never dwelt and flourished there. Ah! Behold! for the Thamud rejected their Lord and Cherisher! Ah! Behold! removed (from sight) were the Thamud!(11:64-68)

Also God say what means in Sura(7)

Then they ham-strung the she-camel, and insolently defied the order of their Lord, saying: \u201CO Salih! bring about thy threats, if thou art a messenger (of Allah)!\u201D (77) So the earthquake took them unawares, and they lay prostrate in their homes in the morning! (78) So Salih left them, saying: \u201CO my people! I did indeed convey to you the message for which I was sent by my Lord: I gave you good counsel, but ye love not good counsellors!\u201D (7:77-79)

Ibn-Katheer, a well-known Quran expounder comments on this event saying:\u201D When it was Thursday, the first day of awaiting the punishment of God, their faces turned yellow-exactly as their prophet Saleh told them, when it was Friday their faces turned red and when it was Saturday their faces turned black, when it was Sunday they wore their coffins (after the punishment had been ascertained) and sat awaiting for the wrath of God; they didn\u2019t know what would befall them nor did they know where the punishment would come from.

So when it was Sunday, a blast from heaven overtook them and they were seized by an earthquake and all died at the same time.

It is known that eruptions of volcanoes are always preceded by earthquakes and this what happened in this area; the earth began to shake violently under them and then the volcanoes began to erupt from three locations; these are the hills of the two mountains to the west of the city and the rock from which the she-camel went out from as it is clear in the Google earth picture.

As we have already mentioned, the absence of the volcanic lava emphasized the fact that it abruptly, swiftly and violently erupted and\xA0 the sound of the volcano explosion caused all the people to die at once. This kind of volcanoes is termed\u201D Spatter volcano\u2019, in this kind of volcanoes the stuff emitted is always composed of water vapor and carbon dioxide, and protruding edges are formed around the volcano as shown in this picture.

The last picture shows that the volcanic crater on the mountain which is 1500 m ( to the west from the rock) has the same features of the volcanic crater, this proves that both happened simultaneously, it also proves that the gas pressure trapped was so high to the extent \xA0that they all happened in three close areas, they all lie within an area of a few kilometers.

The existence of the volcano on this mountain from which the she-camel went out is really amazing because the big volcano on the other mountain could have prevented the emergence of the volcano of the rock, but God wanted to show people His miracles as from the same place from which the she-camel came out, the volcano erupted, the going out of the she-camel must have weakened the crust and this led to the swift emission of the trapped gas accompanied with the sound of the explosion which people could not bear.

God says what means: For We sent against them a single Mighty Blast, and they became like the dry stubble used by one who pens cattle. (54: 31)`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/historical/323-the-rock-from-which-the-camel-came-out-from/",license:"Fair Use / Permitted Metadata",publication_date:"2010-07-07T15:43:01",created_at:"2026-08-23 09:55:30"},{id:"abdbb022-deb2-4911-937c-4652898b9035",title:"The Common Origin of Humanity",author:"Quran & Science",content:`\u201CO mankind! \xA0Be conscious of your Lord, who has created you from one soul (Adam), and out of it created its mate (Eve), and out of the two spread many men and women.\xA0 And remain conscious of God, in whose name you demand [your rights] from one another, and of these ties of kinship.\xA0 Verily, God is ever watchful over you!\u201D (Quran 4:1)

God addresses entire humanity and asks them to be conscious of Him, to be aware of His presence.\xA0 God reminds people of a forgotten reality: their earthly origins.\xA0 All human beings have One God, their Creator, one father \u2013 Adam \u2013 and one mother, Eve.\xA0 The plight of modernity could begin to heal if human beings remember their origins.

Human beings did not appear on this earth by their own will. Rather, someone else willed that human beings inhabit earth.\xA0 Someone else willed their existence and prepared the earth and sun in perfect balance to make life possible.\xA0 If people were to recall this simple fact, they would proceed in the right direction.\xA0 The One who willed human existence has perfect knowledge of humanity and their strengths and their weaknesses.

If humans recognized this, they would obey the One they owe their existence to.

Just like human beings have come into existence by the will of the One, human beings also trace back to the same parents.\xA0 If people were to realize this, racism, ethnic superiority, and exploitation would end.\xA0 Siblings would stop fighting and taking each other\u2019s life.\xA0 Siblings would realize their common Creator and be conscious of Him, and give their \u201Ckin\u201D their due rights.\xA0 Human beings would not divide themselves into casts and classes.\xA0 Human beings would not let race, skin color, or national origin determine superiority.

If human beings were to realize that another soul was created from the original single soul to be its mate and to spread both men and women throughout the world, they would respect women more.\xA0 Women would not have to go through centuries of oppression, and their humanity would not have been denied for centuries.\xA0 Unfortunately, when human beings tried to correct one wrong, they fell into another one.\xA0 They forgot that a soul was created for a soul, that a woman makes a man complete.\xA0 Men and women are not engaged in an eternal battle of genders; rather, they have been created to complement and complete each other.

God lays out the social fabric of human society, which lies in the family.\xA0 God could have created multiple families instead of Adam and Eve in the beginning, but He chose to create Adam and Eve, and spread humanity from their seed.\xA0 Islamic ethics considers the family to be the natural basis and cornerstone of a moral society.\xA0 A family consists of a human couple and their (legal) children where both the man and woman have each essential roles to play in keeping the family happy and intact.

In the latter portion of the verse is a reminder to be conscious of God, to do what is right and to stay away from wrongdoing in whose Name people take oaths, swear allegiances, and ask favors.

Lastly, the verse ends with a reminder that God is ever watchful over everything, big or small; nothing escapes His knowledge and sight.\xA0 The knowledge that God is watching helps one be conscious of Him.`,source:"Quran and Science",original_url:"https://quranandscience.com/the-holy-quran/jewels-from-quran/234-the-common-origin-of-humanity/",license:"Fair Use / Permitted Metadata",publication_date:"2010-07-04T17:45:28",created_at:"2026-08-23 09:55:30"},{id:"7a093214-54f5-4446-9bde-08d7334d4224",title:"Al-Kindi",author:"Quran & Science",content:`Al-Kindi was born in Kufa about 800 CE. His full name is: Abu-Yusuf Ya\u2018qub ibn Ishaq ibn as-Sabbah ibn \u2018Omran ibn Isma\u2018il al-Kindi. He was the son of the governor of Kufa, an important city in Southern Iraq at that time. He studied first in Kufa and at Baghdad, and won a high reputation at the courts of al-Mam\u2019un (reigned until 833) and al-Mu\u2019tassim (reigned 833\u2013842) as scholar, scientist, and philosopher.

Al-Kindi General Hospital, one of the biggest medical centres in present day Baghdad was named after the tremendous contributions in medical and pharmaceutical disciplines of the great Arab philosopher al-Kindi.

Al-Kindi was best known as a philosopher, but he was also a physician, pharmacist, He was also concerned with music, physicist, mathematician, geographer, astronomer, and chemist.

Human virtues seem to preoccupy Al-Kindi greatly but without overshadowing the importance and value of divine virtues. The way to worldly happiness, he says, is to reduce to a minimum all external possessions, which cause only sorrow, and the way to other worldly happiness is to know God and to perform those actions, which we know bring us nearer to him

On the scientific front, Al-Kindi plays a central role in Islamic scholarship for two principal reasons:

\u2013 his early role in establishing a scientific methodology;

\u2013 the diversity of subjects he addressed.

Al-Kindi refutes his Greek predecessors in every single discipline, which thus, once more proves that the assertion found in most Western books of his being a mere disciple of Greek science is groundless; Al-Kindi\u2019s work in the laboratory is reported by a witness who said: \u201CI received the following description, or recipe, from Abu Yusuf Ya\u2019qub b. Ishaq Al-Kindi, and I saw him making it and giving it an addition in my presence.\u201D As for scientific rigour, Al-Kindi is also the symbol of Islamic deviation from previous Greek practices of associating folklore and myths with science.

One such works by Al-Kindi is a short treatise with the long title Treatise on the Azure Colour which is Seen in the Air in the Direct of the Heavens and is Thought to be the Colour of the Heavens.

One of Al-Kindi\u2019s works which has survived in Latin while it has apparently been lost in the original Arabic is his treatise on geometrical optics. Gerard of Cremona\u2019s Latin translation of the work was published in 1912 by the Danish scholars A. A. Bjornb\xF6 and Sebastian Vogel

Al-Kindi, as a medical man, addressed amongst the diseases epilepsy, which is well detailed by Dunlop. Al-Kindi states in his introduction: \u201CMay God surround you with salvation, and establish you in its paths and aid you to attain the truth and enjoy the fruits thereof! You have asked me \u2013may God direct you to all things profitable!\u2013 that I should outline to you the disease called Sar\u2019 [the falling-sickness, epilepsy].

Al-Kindi was one of the first Arab scholars involved in studying and commenting on Greek scientific and philosophical manuscripts. He defined philosophy as \u201Cthe establishment of what is true and right\u201D.

Although Al-Kindi was influenced by the work of Aristotle (384-322 BCE), he put the Greek\u2019s ideas in a new context and laid the foundations of a new philosophy.

Al-Kindi also delved in medicine. He produced twenty two publications on medical topics. One of his major contributions in medicine and pharmaceutics was to determine and apply a correct dosage, which formed the bases of medical formulary.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/early-muslim-scientists/138-al-kindi/",license:"Fair Use / Permitted Metadata",publication_date:"2010-06-27T15:13:54",created_at:"2026-08-23 09:55:30"},{id:"590dc016-7fe2-4a82-8c6c-f6603f5c76fb",title:"Paradise in Islam",author:"Quran & Science",content:`\u201CAnd whoever desires the Hereafter and strives for it as he ought to strive and he is a believer; (as for) these, their striving shall surely be accepted.\u201D [17:19]

Recently I took a trip to see my Dad, who happens to be a non-Muslim, in order for him to meet the latest addition to our family, and in order for me to yet again try to convince him that he should accept Islam. While I was there, however, I found out something about him that I never knew before. My father is a workaholic. This man works seven days a week, sometimes 10-to-12 hours a day. The saddest part being, that his labor is all for nothing, for Allah says,

\u201C(These are) they whose labor is lost in this world\u2019s life and they think that they are well-versed in skill of the work of hands.\u201D[18:104]

Now, even though the situation with my Dad threw me for a loop, it really got me thinking. How many of us, Muslims, are in the very same predicament as my father? How many of us are working hard for the life of this world, at the cost of the Hereafter? How many of us are putting in 40-plus hours a week at our jobs, and other recreational activities, while putting in only the smallest amounts of time when it comes to our Deen? Allah, subhanahu wa ta\u2019ala, says that truly Man shall earn what he strives for. The question now is what are we truly striving and working for?

Maybe it\u2019s because at the end of the week, we are rewarded with something tangible for our efforts, a check we can see and touch. The Hereafter, although being equally as real, is at the same time, mystifying and ethereal in its nature. It\u2019s a delayed gratification, which makes it harder to earn. Our wages for our efforts in the deen will not be paid in full until we exit the life of this world. For Allah says, \u201CEvery soul shall have a taste of death: And only on the Day of Judgment shall you be paid your full recompense. Only he who is saved far from the Fire and admitted to the Garden will have attained the object (of Life). For the life of this world is but goods and chattels of deception.\u201D [3:185]

Our final destination is the life of the Hereafter. Where we end up, Jannah (Paradise) or Jahannam (Hell-fire) depends on what we worked towards in this life. Paradise is the aim and the hope of every Muslim. But like trying to attain any goal, in order to achieve success, one must have a well-defined plan, and it must be implemented to be successful. Allah says,

\u201CO you who believe! Be careful of (your duty to) Allah and seek means of nearness to Him and strive hard in His way that you may be successful.\u201D [5:35]

To prepare for our journey, we need to find out what our destination is like; who are its people, and most importantly, how to get there.

The Prophet (salAllahu alayhi wasalam) told us that within Paradise are things that no eyes have ever seen, nor ears have ever heard, and that things in it are beyond our imagination and comprehension, but we all have our own personal ideas of what eternal bliss would probably be like.

I remember a few years ago, I overheard my niece and my nephew discussing the landscape, and the privileges of living in Jannah. My nephew was telling my niece that in Jannah, they would be able to eat all the candy that they wanted and that there would be streams of chocolate and trees of ice cream. I always tell people, that Paradise for me, would be being able to eat all the cheesecake and chocolate that I wanted, without gaining a pound. But what Allah has in store for the believers is so much more than this. He, in His Book, and through His Messenger, sallallahu alayhe wa sallam, has given us a clear picture of our goal, so that we can keep it in front of us at all times. By keeping our eyes on the prize, no matter our hardships in this worldly life, we can strive that much harder to attain it.

Allah says, \u201CAnd whoever desires the Hereafter and strives for it as he ought to strive and he is a believer; (as for) these, their striving shall surely be accepted.\u201D[17:19]

Allah has also described Paradise in many places in the Qur\u2019an, so let us now take a look at what He has in store for the believers.

Description in the Qur\u2019an of Paradise

\u201CThe description of Paradise which the Muttaqoon have been promised is that in it are rivers of water, the taste and smell of which are never changed. Rivers of milk the taste of which will remain unchanged. Rivers of wine that will be delicious to those who drink from it and rivers of clear, pure honey. For them will be every kind of fruit and forgiveness form their Lord.\u201D [ 47:15]

\u201CAnd their recompense shall be Paradise, and silken garments, because they were patient. Reclining on raised thrones, they will see there neither the excessive heat of the sun, nor the excessive bitter cold, (as in Paradise there is no sun and no moon). The shade will be close upon them, and bunches of fruit will hang low within their reach. Vessels of silver and cups of crystal will be passed around amongst them, crystal-clear, made of silver. They will determine the measure of them according to their wishes. They will be given a cup (of wine) mixed with Zanjabeel, and a fountain called Salsabeel. Around them will (serve) boys of perpetual youth. If you see them, you would think they are scattered pearls. When you look there (in Paradise) you will see a delight (that cannot be imagined), and a Great Dominion. Their garments will be of fine green silk and gold embroidery. They will be adorned with bracelets of silver, and their Lord will give them a pure drink.\u201D [76:12-21]

\u201CAnd those foremost (In Tawheed and obedience to Allah and His Messenger in this life) will be foremost (in Paradise). They will be those nearest to Allah in the Gardens of Delight. A multitude of those (the foremost) will be from the first generation (who embraced Islam) and a few of those (the foremost) will be from the later (generations). They will be reclining, face to face, on thrones woven with gold and precious stones. They will be served by immortal boys, with cups and jugs, and a glass from the flowing wine, from which they will have neither any headache, nor any intoxication. They will have fruit from which they may choose, and the flesh of fowls that they desire. There will be Houris with wide, lovely eyes (as wives for the pious), like preserved pearls, a reward for deeds that they used to do. They will hear no vain or sinful speech (like backbiting, etc.) but only the saying of: Salam, Salam, (greetings of peace). And those on the Right Hand, who will be those on the Right Hand? They will be among thorn-less lote-trees among Talh (banana trees) with fruits piled one above another, in long-extended shade, by constantly flowing water, and fruit in plenty, whose season is not limited, and their supply will not be cut off. They will be on couches or thrones raised high. Verily, We have created for them (maidens) of equal age, loving (their husbands only). For those on the Right Hand.\u201D [56:10-38]

\u201CVerily, the dwellers of Paradise that Day, will be busy in joyful things. They and their wives will be in pleasant shade, reclining on thrones. They will have therein fruits (of all kinds), and all that they will ask for. (It will be said to them): \u201CSalamun\u201D (Peace be on you), a Word from the Lord, Most Merciful.\u201D [36:55-58]

Can you imagine?

Wearing the finest silk clothing and sitting on chairs made of gold and precious stones? Those who disbelieve in the words of Allah, say that this is all a fairy-tale, made up by a would-be prophet. But we know, that Allah is the Truthful and that His Messenger, sallallahu alayhe wa sallam, spoke only what was revealed to from the Most Truthful. And even though Allah describes Paradise for us in the Qur\u2019an, He still says, \u201CSo no soul knows the delights of the eyes which is hidden for them; a reward for what they did.\u201D [32:17]

Apart from the Qur\u2019anic descriptions of Paradise, the Prophet Muhammad (salAllahu alayhi wassalam) would often describe Paradise to his companions. His descriptions were often so vivid and moving, that many-a-companion would hurriedly rush towards it. This was the case, as Anas narrated that the Messenger of Allah (salAllahu alayhi wasalam) and his companions proceeded towards Badr and arrived there before the disbelievers (of Makkah). When the disbelievers arrived, the Messenger of Allah said, \u201CNone of you should step forward ahead of me to do anything.\u201D Then the disbelievers advanced (towards us), and the Messenger of Allah, sallallahu alayhe wa sallam, said, \u201CRise to enter Paradise whose width is equal to the Heavens and the Earth.\u201D Umayr Ibnul Humam al-Ansari asked, \u201CO Messenger of Allah, is Paradise equal in width to the heavens and the earth?\u201D He, sallallahu alayhe wa sallam, said, \u201CYes.\u201D Umayr said, \u201CBak\u2019hin! Bak\u2019hin!\u201D (An Arabic word denoting excitement and astonishment) The Messenger of Allah, sallallahu alayhe wa sallam, asked him, \u201CWhat made you say these words: Bak\u2019hin, Bak\u2019hin?\u201D He said, \u201CMessenger of Allah, nothing but the desire to be amongst its residents.\u201D He, sallallahu alayhe wa sallam, said, \u201CYou are surely among its residents.\u201D He then took some dates form his bag and began to eat them. Then he said, \u201CIf I were to live until I had eaten all of the dates, indeed this life would be too long.\u201D Anas then said, \u201CHe threw away the remaining dates he had with him. He then fought (the disbelievers) until he was killed.\u201D [Muslim]

What words could have inspired Umair and others like him to long for, and to pay the ultimate price for a place in Paradise? Let\u2019s now take a look at what the Messenger of Allah, had to say about Paradise.

Description of Paradise in the Hadith

Abu Sa\u2019eed Al-Khudri narrated that the Messenger of Allah (salAllahu alayhi wasalam) said, \u201CThe people of Paradise will look at the dwellers of lofty mansions (i.e. a superior place in Paradise) in the same way as one looks at a brilliant star, far away in the East or in the West of the horizon. This is because of their superiority over one another (in reward).\u201D One of the people asked, \u201CO Allah\u2019s Messenger, are these lofty mansions for the Prophets which no one else can reach?\u201D

The Prophet (salAllahu alayhi wasalam) replied, \u201CNo! By Allah, in whose Hands is my life, these are for men who believe in Allah and also believe in the Messenger.\u201D [Bukhari and Muslim]

Abu Musa al-Ash\u2019ari narrated that the Prophet (salAllahu alayhi wasalam) said, \u201CVerily, for the believers in Paradise, are tents made of a single hollow pear. The length of which would be sixty miles long from all sides, their wives being therein. The believer will go around them (i.e., visit them) and they will not be able to see each other.\u201D [Sahih al-Jami]

Abu Hurairah said that the Messenger of Allah (salAllahu alayhi wasalam) said, \u201CThere is not a tree in Paradise, except that its trunk is made of gold.\u201D [Sahih al-Jami]

Anas ibn Malik narrated that the Prophet (salAllahu alayhi wasalam) said, \u201CVerily in Paradise there is a market in which (the inhabitants of Paradise) will come to every Friday. The North wind will blow and scatter fragrances on their faces and on their clothes. This will add to their beauty and their attractiveness. They will then go back to their families after having an added luster to their beauty and their attractiveness. Their families will say to them, \u2018By Allah you have been increased in beauty and loveliness after leaving us,\u2019 and they will say, \u2018By Allah you too have increased in beauty and attractiveness after us.'\u201D [Muslim]

Jabir ibn Abdullah narrated that the Messenger of Allah (salAllahu alayhi wasalam) said, \u201C(I saw in a dream that) I entered Paradise, and behold, there was a palace built of gold. I asked, \u2018Whose is this palace?\u2019 They (the angels) replied, \u2018For a man from the Quraysh.\u2019 So I thought it might be I, so I asked, \u2018And who is he?\u2019 They said, \u2018Umar Ibnul Khattab.\u2019 Nothing stopped me form entering it except your Ghirah (sense of honor).\u201D Umar said, \u201CMy Ghirah would never be offended by you, O Messenger of Allah.\u201D [Sahih al-Bukhari and Muslim]

Anas ibn Malik said that Allah\u2019s Apostle (salAllahu alayhi wasalam) said, \u201CI entered Paradise and found myself by a river, by its edges were tents of pearls. Then I tapped with my hands where the water was running, and there was then a beautiful smell of Musk. I asked, \u2018What is this O Gabriel?\u2019 He said, \u2018This is Kawthar (river in Paradise) which Allah has given to you.'\u201D [Sahih al-Jami]

Who Are the People of Paradise?

We could go on and on, for the ahadith are vast in numbers, about the Prophet\u2019s descriptions of Paradise. But a place that has houses built with gold and silver bricks: where its dirt is made of rubies and sapphires and its inhabitants wear only the finest silk garments, sounds like a pretty exclusive neighborhood to me. Who are these people who will be allowed to live in this enchanting place? The Jews say the Jews. The Christians say the Christians. But Allah says, \u201CAnd they say: \u2018None shall enter Paradise unless he be a Jew or a Christian.\u2019 Those are their (vain) desires. Say, \u2018Produce your proof if you are truthful.\u2019 [2:111]

He also says, \u201C(Namely) those whose lives the angels take in a state of purity, saying (to them), \u2018Peace be on you, enter you the Garden, because of (the good) which you did (in the world).\u201D [16:32]

Always in the Qur\u2019an when Allah mentions those who will attain Paradise, He mentions the believers, not the Muslims. He (subhanahu wa ta\u2019ala) says, \u201CIndeed the Muttaqoon will be amongst the Gardens and water-springs.\u201D [15:45]

He also says, \u201CVerily, the Muttaqoon will be in a place of security, among Gardens and Springs, dressed in fine silk and (also) in thick silk, facing each other. This is how it shall be, and We shall marry them to Houris with wide, lovely eyes. They will request therein for every kind of fruit in peace and security.\u201D [44:51-55]

So who are the believers and how do we become one of them? Allah says, \u201CThey believe in Allah and the Last Day, and they enjoin what is right and forbid the wrong and they strive with one another in hastening to good deeds, and those are among the good.\u201D [3:114]

He (subhanahu wa ta\u2019ala) also says of the believers, \u201CBut the Apostle and those who believe with him strive hard with their property and their persons; and these it is who shall have the good things and these it is who shall be successful.\u201D [9:88]

He goes on to say, \u201CAllah has purchased of the believers their persons and their goods; for theirs (in return) is the Garden (of Paradise): they fight in His cause, and slay and are slain: a promise binding on Him in truth, through the Law, the Gospel, and the Qur\u2019an: and who is more faithful to his covenant than Allah? Then rejoice in the bargain, which you have concluded: that is the achievement supreme.\u201D [9:111]

Of the believers, He also says, \u201CBut those who have faith and work righteousness, they are companions of the Garden: Therein shall they abide (forever).\u201D[2:82]

O slaves of Allah know that being among this illustrious group of people who will live in this place of tranquillity and bliss is not something easily attained. Allah says,

\u201COr do you think that you shall enter the Garden (of bliss) without such (trials) as came to those who passed away before you? They encountered suffering and adversity, and were so shaken in spirit that even the Apostle and those of faith who were with him cried, \u2018When (will come) the help of Allah?\u2019 Ah! Verily, the help of Allah is (always) near!\u201D [2:214]

What Allah and His Messenger (salAllahu alayhi wasalam) convey to us is that the people of Paradise are the God-conscious, and the God-fearing. Not everyone, who says, Lord, Lord, will enter the Kingdom of Heaven, just as not everyone who professes the Shahadah, will enter Paradise.

Only those who fear Allah as He ought to be feared, and are motivated by that fear to do acts of righteousness will attain success. The one who is conscious of His Lord, in every aspect of his life, and turns to Him in true submission, will have purchased for himself safety and security on a day, when there will be none, except with Allah. He does not cause a soul to suffer fear twice, the fear of Him in this world, and the fear on The Day of Judgment. About this, the Messenger of Allah, sallallahu alayhe wa sallam, said, \u201CAllah says, \u2018I do not combine for my servants two states of fear, or two states of safety. So if he feels safe from Me in this world I will cause him to fear on The Day of Judgment, and if he fears Me in the world, I will cause him to be safe on The Day of Judgment.'\u201D [Sahih al-Jami]

It is important, therefore, that Muslims know the characters of those who will be the inheritors of Paradise. But it is unfortunate that many of today\u2019s Muslims understand that it is enough for one to pronounce the Shahadah by his tongue for him to be entitled to enter Paradise regardless of whether he lived according to Islam or not! But the Shahadah means and requires more than the mere utterance of it. Actually this fact is one of the most mentioned aspects of Islam in the Qur\u2019an and Sunnah. The essence of Eman is deed. Deeds of the heart and deeds of the tongue and other body parts. Deeds that are to be continued till one leaves this world. That was the reason why the Arabs of Makkah refused to pronounce it.

They fully appreciated its implication. They knew it concerned authority and understood that they had to govern their deeds and lives with it. Yet many of those who repeat it today lead life styles that do not resemble those described in the Qur\u2019an and practiced by the Prophet, sallallahu alayhe wa sallam, and his companions. The Qur\u2019an warns us that deeds are the basis on which we are to be judged, not only the utterance of the Shahadah, \u201CIt is not by your wishes nor the wishes of the People of the Book: whoever does wrong shall be punished for it, and he will find none other than Allah as a protector or helper.\u201D [4:123]

So entering Paradise requires that we live as believers and die as Muslims. That takes knowledge, dedication and determination to see it through to its completion. The fist step is belief in Allah and His Messenger, and the flip side to that is leaving all acts of shirk; this means directing all acts of ibadah to none but Allah, subhanahu wa ta\u2019ala, whether it be wearing talismans, supplicating to others than Allah or simply showing off. The next step is obeying Allah and His Messenger, avoiding bid\u2019ah and innovations, and carrying out all compulsory acts of worship that He has prescribed. Once we are steadfast and regular in what we must do, we can then proceed to the next level of eman and worship, by doing the things that we have been encouraged to do. By increasing out acts of worship, and remembrance of Allah we will leave off sin and help safeguard ourselves from a Fire, the fuel of which is men and stones.

We Should Also Strive to:

Protect our minds from thoughts, which are evil, because evil actions begin with evil thoughts.

Protect our eyes by lowering our gazes and not looking at forbidden things.

Protect our ears from lewd or evil speech where there is sin. We should also avoid listening to lies, gossip, music, slander, or blasphemy.

Protect our tongues by saying always what is correct and true, and keeping it moist with the remembrance of Allah, and keeping away from backbiting and other evil speech.

Protect our stomachs by eating the halal and keeping away from the haram. We should beware of eating usury, carrion, and swine or drinking intoxicants or taking drugs.

Protect our hands from taking what does not belong to us, or from doing harm to another Muslim.

Protect our legs from taking us to evil and corruption and an ultimate doom.

Protect our private parts from unlawful sexual intercourse.

Protect our wealth by not squandering it or holding on to it too tightly.

Protect our oaths, witnesses and trusts by not breaching or breaking a contract or pledge knowingly. We should not exceed our agreements, testify to falsehood or break our trusts.

Protect our families and children by keeping them away from the things that may be harmful and that may corrupt their minds and their souls.

Now, it is true that only Allah knows who the believers are, but that should not stop us from striving to be among their numbers. For the believers will have eternal bliss and complete success, because of the things that they did in this life. Allah says, \u201CSo no soul knows the delight of the eyes which is hidden for them; a reward for what they did.\u201D [32:17]

We now stand at the start of the race, so let us run forward quickly to the finish line, where the gates of Paradise will be open for those who strive as they should. The Messenger of Allah, sallallahu alayhe wa sallam, who said, \u201CParadise is surrounded by hardship and the Hellfire is surround by wishes and desires,\u201D has described the road to eternal bliss. [Sahih al-Jami]

Despite this, Allah and His Messenger have left breadcrumbs along the path, for us to follow to make our journey easier. All roads may lead to Rome, but not all paths lead to Allah and His Paradise. We must plan our journey by using only the road map given to us by Allah and His Messenger, sallallahu alayhe wa sallam.

Ways That Lead To Paradise:

Belief and Righteous Deeds are two of the best routes to Jannah (Paradise). The door of righteous deeds is wide and the ways of obtaining rewards are vast, as Allah says, \u201CAnd those who believe and do good deeds they are the inhabitants of Paradise, in it they shall abide.\u201D[2:82]

Taqwa is the fear of the Most Merciful, and acting in accordance with the Qur\u2019an and the Sunnah of the Messenger of Allah, sallallahu alayhe wa sallam. That is, hoping for the reward of Allah and avoiding disobedience of His Guidance and fearing His Punishment. For Allah says, \u201CSurely those of taqwa shall be in the midst of Gardens and fountains.\u201D [15:45]

The Prophet, sallallahu alayhe wa sallam, also said, \u201CThe most common thing which leads people to Paradise is taqwa of Allah and good conduct, and the most common thing which leads people to the Hell Fire is the mouth and the private parts.\u201D [at-Tirmidhi]

Obedience of Allah and His Messenger is a sure way to Paradise. Allah, subhanahu wa ta\u2019ala, says, \u201CAnd whoever obeys Allah and His Messenger, He will cause him to enter Gardens beneath which rivers flow, and whoever turns back, He will chastise him with a painful chastisement.\u201D [48:17]

Allah\u2019s Messenger, sallallahu alayhe wa sallam, also said, \u201CAll of my followers will enter Paradise except those who refuse.\u201D It was asked, \u201CO Messenger of Allah, who would refuse?\u201D He said, \u201CHe who obeys me enters Paradise and he who disobeys me has refused.\u201D [Sahih al-Bukhari]

Fighting in the Path of Allah with one\u2019s goods and soul. For Allah says, \u201CO you who believe, shall I lead you to a merchandise which may deliver you from a painful chastisement? You shall believe in Allah and His Messenger, and struggle hard in Allah\u2019s Cause with your property and your lives; that is better for you, if you but knew! He will forgive you your sins and cause you to enter Gardens beneath which rivers flow, and goodly dwellings in Gardens of perpetuity; that is the mighty achievement.\u201D [61:10-12]

Repentance erases what came before it as the Prophet, sallallahu alayhe wa sallam, said, \u201CThe one who repents form sin is like the one who never sinned.\u201D [Sahih Al-Jami]

And Allah says, \u201CExcept such as repent and believe and do good, these shall enter the Garden, and they shall not be dealt with unjustly in any way.\u201D[19:60]

There are countless other means, from building a mosque to seeking Islamic knowledge to obeying our husbands and raising righteous children. All it takes is our time and sincere efforts. With all that Allah has described, it may seem daunting to us at times, that we will ever make it. Eman rises and falls, and with it our good deeds. But we should never lose hope in Allah, for the only one who loses hope in Allah is the one who disbelieves.

So even though we may feel that we are at the bottom of the pile, the Prophet (salAllahu alayhi wasalam) gives us hope. He said, \u201CMousa, alayhes salam, asked his Lord, \u2018Who amongst the inhabitants of Paradise will be the lowest in rank?\u2019 He (subhanahu wa ta\u2019ala) said, \u2018He is a man who will come after the people have entered Paradise and it will be said to him: Enter Paradise.\u2019 He will say, \u2018How my Lord? Indeed, the people have settled in their apartments and taken their shares.\u2019 It will be asked of him, \u2018Would you be pleased if there was a kingdom for you like the kingdoms of the earth?\u2019 He will say, \u2018I would be pleased, my Lord.\u2019 He will say, \u2018And for you is the like of that, and the like of it, and the like of it.\u2019 He will say at the fifth time, \u2018I am pleased, my Lord.\u2019 He will say, \u2018This is for you and ten times like it, and for you is what you desire for yourself and what is pleasurable to your eye.\u2019 He will say, \u201CI am pleased my Lord.\u201D [Muslim]

This is what Allah has for the least among us. But despite all the glorious castles, the beautiful clothes and mates we will posses, inshaAllah, He still has in store for the believers the greatest honor awaiting them in Paradise. Suhaib ibn Sinan narrated that the Prophet, sallallahu alayhe wa sallam, said, \u201CWhen the inmates of Paradise enter Paradise and the inmates of Hellfire will enter Hell, the announcer will say, \u2018O people of Paradise, verily you have a promise with Allah and He wishes to fulfill His promise to you.\u2019 They will ask, \u2018What is His promise? Has He not made our balances heavy (with good deed), whitened our faces, admitted us into Paradise, and delivered us from the Hellfire?\u2019 Then the screen will be removed and they will look towards Him. By Allah He will not give them a thing more beloved to them and more comforting to their eyes, than the gaze of Himself.\u201D [Sahih al-Jami]

We were created in Paradise, we came out of it and we will inshaAllah go back to it. It is our destination and we shall reach it. But we have to do what Allah has asked us to do, for Paradise is not cheap. The price is true eman that is shown in obedience to Allah according to the sunnah of his Prophet, sallallahu alayhe wa sallam. The companions understood that. Their efforts were all for the life of the Hereafter and they gave only what was necessary to this worldly life. As Muslims, everything we do, can be, and should be worship of Allah. Whether we\u2019re working at the office to provide for our families; cooking a meal; raising our children, or simply resting, through remembrance of Allah and supplication, we can transform these earthly necessities into fruits that will bear for us in the life of the Hereafter.

So let us keep our eyes on the prize, and strive hard for it, for Allah says, \u201CAnd (as for) those who strive hard for Us, We will most certainly guide them in Our ways; and Allah is most surely with the doers of good.\u201D [29:69]`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/pillars-of-faith/277-paradise-in-islam/",license:"Fair Use / Permitted Metadata",publication_date:"2010-06-12T09:25:27",created_at:"2026-08-23 09:55:30"},{id:"acbe7fa3-14db-4566-817a-f82ab1b39455",title:"The troubles which afflicted pharaoh",author:"Quran & Science",content:`Pharaoh and those people close to him were so devoted to their polytheistic system and pagan beliefs that not even message of the Prophet Musa (as), armed with wisdom and spectacular miracles, could soften their hearts and thus turn them away from baseless superstitions. They also openly stated this fact:

\u201CNo matter what kind of Sign you bring us to bewitch us, we will not believe in you.\u201D (Qur\u2019an, 7:132)

Because of their haughty attitude, Allah sent to them afflictions, described as \u201CSigns, clear and distinct\u201D in one verse, in order to punish them for their haughtiness. (Qur\u2019an, 7:133) The first of these was drought. As a result, there was a fall in production. The relevant verse of the Qur\u2019an states:

We seized Pharaoh\u2019s people with years of drought and scarcity of fruits so that hopefully they would pay heed. (Qur\u2019an, 7:130)

The Egyptians\u2019 agricultural systems depended on the River Nile and changes in natural conditions did not therefore generally affect them. However, Pharaoh and those around him suffered greatly because of their pride and refusal to recognise Allah\u2019s Messenger. Yet instead of \u201Cpaying heed,\u201D they regarded these events as bad luck caused by the Prophet Musa (as) and the Tribe of Israel. Following that, Allah sent a series of tribulations. We are told of these in the Qur\u2019an:

So We sent down on them floods, locusts, lice, frogs and blood, Signs, clear and distinct, but they proved arrogant and were an evildoing people. (Qur\u2019an, 7:133)

The details in the papyrus regarding the disasters that struck the people of Egypt are just as described in the Qur\u2019an. In the Qur\u2019an, we are told about these catastrophes. This Islamic account of this period of human history has been confirmed by the discovery in Egypt, in the early 19th century, of the Ipuwer papyruses dating back to the Middle Kingdom. After the discovery of this papyrus, it was sent to the Leiden Dutch Museum in 1909 and translated by A. H. Gardiner, a prominent scholar of ancient Egypt. In the papyrus were described such disasters in Egypt as famine, drought and the fleeing of the slaves from Egypt. Moreover, it appears that the writer of the papyrus, one Ipuwer, had actually witnessed these events. This is how the Ipuwer papyrus refers to these catastrophes described in the Qur\u2019an:

Plague is throughout the land. Blood is everywhere.

The river is blood.

Forsooth, that has perished which yesterday was seen. The land is left over to its weariness like the cutting of flax.

Lower Egypt weeps\u2026 The entire palace is without its revenues. To it belong (by right) wheat and barley, geese and fish.

Forsooth, grain has perished on every side.

The land-to its whole extent confusion and terrible noise\u2026 For nine days there was no exit from the palace and no one could see the face of his fellow\u2026 Towns were destroyed by mighty tides\u2026 Upper Egypt suffered devastation\u2026 blood everywhere\u2026 pestilence throughout the country\u2026 No one really sails north to Byblos today. What shall we do for cedar for our mummies?\u2026 Gold is lacking\u2026

Men shrink from tasting-human beings, and thirst after water.

That is our water! That is our happiness! What shall we do in respect thereof? All is ruin!

The towns are destroyed. Upper Egypt has become dry.

The residence is overturned in a minute.

The chain of disasters which struck the people of Egypt, according to this document, conforms perfectly with the Qur\u2019anic account of these matters. This papyrus, which closely parallels the catastrophes which struck Egypt in the time of Pharaoh, once again demonstrates the Qur\u2019an to be divine in origin.

References:

The Plagues of Egypt,\u201D Admonitions of Ipuwer 2:5-6, www.mystae.com/restricted/streams/thera/plagues.html.
Admonitions of Ipuwer 2:10, www.mystae.com/restricted/streams/thera/plagues.html.
Admonitions of Ipuwer 5:12, www.geocities.com/regkeith/linkipuwer.htm.
Admonitions of Ipuwer 10:3-6, www.geocities.com/regkeith/linkipuwer.htm.
Admonitions of Ipuwer 6:3, www.students.itu.edu.tr/~kusak/ipuwer.htm.
Admonitions of Ipuwer, www.mystae.com/restricted/streams/thera/plagues.html.
Admonitions of Ipuwer 2:10, www.geocities.com/regkeith/linkipuwer.htm.
Admonitions of Ipuwer 3:10-13, www.geocities.com/regkeith/linkipuwer.htm.
Admonitions of Ipuwer 2:11, www.geocities.com/regkeith/linkipuwer.htm.
Admonitions of Ipuwer 7:4, www.geocities.com/regkeith/linkipuwer.htm
Rabbi Mordechai Becher, \u201CThe Ten Plagues \u2013 Live From Egypt,\u201D Ohr Somayach Institutions, www.ohr.org.il/special/pesach/ipuwer.htm.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/historical/328-the-troubles-which-afflicted-pharaoh/",license:"Fair Use / Permitted Metadata",publication_date:"2010-05-26T19:58:04",created_at:"2026-08-23 09:55:30"},{id:"c3270db5-2ab9-4b39-a5a8-f2df6e4ec1d4",title:"Quran on Formation of Clouds and Rain",author:"Quran & Science",content:`Allah says:

(And it is He Who sends the winds as heralds of glad tidings, going before His Mercy (rain). Till when they have carried a heavy-laden cloud, We drive it to a land that is dead, then We cause water (rain) to descend thereon. Then We produce every kind of fruit therewith. Similarly, We shall raise up the dead, so that you may remember or take heed.) (7:57)

Allah says:

(And We send the winds fertilizing (to fill heavily the clouds with water), then cause the water (rain) to descend from the sky, and We give it to you to drink, and it is not you who are the owners of its stores [i.e. to give water to whom you like or to withhold it from whom you like].) (15:22)

Modern science has affirmed the scientific points mentioned in this verse of the Quran. The winds carry water particles which are rich in salt up into the atmosphere; these particles which are called \u2018aerosols\u2019 function as water traps and form cloud drops by collecting around the water vapor themselves.

The clouds are formed from water vapor that condenses around the salt crystals or dust particles in the air. Because the water droplets in these clouds are very small (with a diameter between 0.01 and 0.02 mm), the clouds are suspended in the air, and spread across the sky.29 Thus, the sky is covered in clouds. The water particles that surround salt crystals and dust particles thicken and form raindrops, so drops that become heavier than the air leave the clouds and start to fall to the ground as rain. Allah says:

(See you not that Allah drives the clouds gently, then joins them together, then makes them into a heap of layers, and you see the rain comes forth from between them; and He sends down from the sky hail (like) mountains, (or there are in the heaven mountains of hail from where He sends down hail), and strikes therewith whom He wills, and averts it from whom He wills. The vivid flash of its (clouds) lightening nearly blinds the sight.) (24:43)

Rain clouds are formed and shaped according to definite systems and stages. The formation stages of cumulonimbus -a type of rain cloud- are:

(A) 1st Stage (b) 2nd Stage (c) 3rd Stage

A cloud becomes electrified as hail falls through a region in the cloud of super-cooled droplets and ice crystals. As liquid droplets collide with a hailstone, they freeze on contact and release latent heat. This keeps the surface of the hailstone warmer than that of the surrounding ice crystals.

When the hailstone comes in contact with an ice crystal, an important phenomenon occurs: electrons flow from the colder object toward the warmer object. Hence, the hailstone becomes negatively charged. The same effect occurs when super-cooled droplets come in contact with a hailstone and tiny splinters of positively charged ice break off. These lighter positively charged particles are then carried to the upper part of the cloud by updrafts.

The hail, falls towards the bottom of the cloud, thus the lower part of the cloud becomes negatively charged. These negative charges are then discharged as lightning. We conclude from this that hail is the major factor in producing lightning.30

Allah says:

(And thunder glorifies and praises Him, and so do the angels because of His Awe. He sends the thunderbolts, and therewith He strikes whom He wills, yet they (disbelievers) dispute about Allah. And He is Mighty in strength and Severe in punishment.) (13:13)`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/earth/123-quran-on-formation-of-clouds-and-rain/",license:"Fair Use / Permitted Metadata",publication_date:"2010-05-25T15:22:42",created_at:"2026-08-23 09:55:30"},{id:"75f2f25d-2197-46f7-b602-0f125f840b5f",title:"The origin of creation : clay & water !",author:"Quran & Science",content:`In the Quran, Allah reveals that the creation of man is a miracle. The first human being was created by Allah shaping clay into a human form and then breathing a soul into it, Allah (SWT) says in Quran :

( \u0625\u0630 \u0642\u0627\u0644 \u0631\u0628\u0643 \u0644\u0644\u0645\u0644\u0627\u0626\u0643\u0629 \u0625\u0646\u064A \u062E\u0627\u0644\u0642 \u0628\u0634\u0631\u0627 \u0645\u0646 \u0637\u064A\u0646\u064D \u060C \u0641\u0625\u0630\u0627 \u0633\u0648\u064A\u062A\u0647 \u0648\u0646\u0641\u062E\u062A \u0641\u064A\u0647 \u0645\u0646 \u0631\u0648\u062D\u064A \u0641\u0642\u0639\u0648\u0627 \u0644\u0647 \u0633\u0627\u062C\u062F\u064A\u0646 ) \u0633\u0648\u0631\u0629 (\u0635) 71-72

( Your Lord said to the angels, \u201CI am going to create a human being out of clay. When I have formed him and breathed My Spirit into him, fall down in prostration to him!\u201C) \xA0(Quran\xA0 38:71-72)

and also says :

( \u0641\u0627\u0633\u062A\u0641\u062A\u0647\u0645 \u0623\u0647\u0645 \u0623\u0634\u062F \u062E\u0644\u0642\u0627\u064B \u0623\u0645 \u0645\u0646 \u062E\u0644\u0642\u0646\u0627 \u0625\u0646\u0627 \u062E\u0644\u0642\u0646\u0627\u0647\u0645 \u0645\u0646 \u0637\u064A\u0646 \u0644\u0627\u0632\u0628) \u0627\u0644\u0635\u0627\u0641\u0627\u062A 11

\u201D Then inquire of them: Is it they who are stronger in structure or other things We have created? We created them from sticky clay \u201C (Quran 37:11)

When the human body is examined today, many elements present on the earth are also discovered to be found in the human body. Living tissues contain 95% carbon, hydrogen, oxygen, nitrogen, phosphorus and sulphur, with a total of 26 different elements.

In another verse of the Quran we are told:

(\u0648\u0644\u0642\u062F \u062E\u0644\u0642\u0646\u0627 \u0627\u0644\u0625\u0646\u0633\u0627\u0646 \u0645\u0646 \u0633\u0644\u0627\u0644\u0629 \u0645\u0646 \u0637\u064A\u0646 ) \u0627\u0644\u0645\u0624\u0645\u0646\u0648\u0646 12

\u201CWe created man from an extract of clay\u201D\xA0 (Quran 23:12)

The Arabic word \u201Csulala,\u201D translated as \u201Cextract\u201D in the verse, means \u201Crepresentative example, essence.\u201D As we have seen, the information revealed in the Quran 1,400 years ago confirms what modern science tells us-the fact that the same elements as those found in the soil\xA0 are employed in the human creation .

Below is a diagram showing the distribution of the elements in a 70-kilo human being.

Macro-minerals

CarbonHydrogenNitrogenCalcium PhosphorusPotassiumSulfurChlorineSodiumMagnesiumSilicon

CHNCaPKSClNaMgSi

65.018.59.53.31.51.00.350.250.150.150.050.05

12,0006,3002,0001,100750225150100903530

Macro-minerals

CopperBoronCobaltVanadiumIodineSeleniumManganeseMolybdenumChromium

CuBCoVISeMnMoCr

0.010.010.010.010.010.010.010.010.01

9068202015151386

As we notice above water forms the main component of the human being and any other being. Allah (SWT) says\xA0 :

( \u0648\u0627\u0644\u0644\u0647 \u062E\u0644\u0642 \u0643\u0644 \u062F\u0627\u0628\u0629 \u0645\u0646 \u0645\u0627\u0621 \u0641\u0645\u0646\u0647\u0645 \u0645\u0646 \u064A\u0645\u0634\u064A \u0639\u0644\u0649 \u0628\u0637\u0646\u0647 \u0648\u0645\u0646\u0647\u0645 \u0645\u0646 \u064A\u0645\u0634\u064A \u0639\u0644\u0649 \u0631\u062C\u0644\u064A\u0646 \u0648\u0645\u0646\u0647\u0645 \u0645\u0646 \u064A\u0645\u0634\u064A \u0639\u0644\u0649 \u0623\u0631\u0628\u0639\xA0 \u064A\u062E\u0644\u0642 \u0627\u0644\u0644\u0647 \u0645\u0627 \u064A\u0634\u0627\u0621 \u0625\u0646 \u0627\u0644\u0644\u0647 \u0639\u0644\u0649 \u0643\u0644 \u0634\u064A\u0621 \u0642\u062F\u064A\u0631) \u0627\u0644\u0646\u0648\u0631 45

\u201D Allah created every [living] creature from water. Some of them go on their bellies, some of them on two legs, and some on four. Allah creates whatever He wills. Allah has power over all things\u201D\xA0 (Quran, 24:45)

(\u0648\u062C\u0639\u0644\u0646\u0627 \u0645\u0646 \u0627\u0644\u0645\u0627\u0621 \u0643\u0644 \u0634\u064A\u0621 \u062D\u064A \u0623\u0641\u0644\u0627 \u064A\u0624\u0645\u0646\u0648\u0646 \u064E) \u0627\u0644\u0623\u0646\u0628\u064A\u0627\u0621 30

\u201D and\xA0 We made from water every living thing? So will they not believe?\u201D\xA0 (Quran, 21:30)

(\u0648\u0647\u0648 \u0627\u0644\u0630\u064A \u062E\u0644\u0642 \u0645\u0646 \u0627\u0644\u0645\u0627\u0621 \u0628\u0634\u0631\u0627\u064B \u0641\u062C\u0639\u0644\u0647 \u0646\u0633\u0628\u0627\u064B\xA0 \u0648\u0635\u0647\u0631\u0627\u064B \u0648\u0643\u0627\u0646 \u0631\u0628\u0643 \u0642\u062F\u064A\u0631\u0627\u064B ) \u0627\u0644\u0641\u0631\u0642\u0627\u0646 54

\u201CAnd it is He Who created human beings from water and then gave them relations by blood and marriage. Your Lord is All-Powerful\u201D\xA0 (25:54)

When we look at the verses concerned with the creation of human beings and living things, we clearly see evidence of a miracle. One such miracle is of the creation of living things from water. It was only possible for people to come across that information, clearly expressed in those verses, hundreds of years afterwards with the invention of the microscope.

All life forms need water in order to survive. Animals in dry regions, therefore, have been created with mechanisms to protect their metabolisms from water loss and to ensure maximum benefit from water use. If water loss takes place in the body for any reason, and if that loss is not replaced, death will result in a few days. The famous 17th century scientist Jan Baptista van Helmont discovered in 1640s that water in the soil was the most important element of plant development.`,source:"Quran and Science",original_url:"https://quranandscience.com/quran-a-science/human/147-the-origin-of-creation-clay-a-water/",license:"Fair Use / Permitted Metadata",publication_date:"2010-05-15T08:58:07",created_at:"2026-08-23 09:55:30"},{id:"f4df8dd0-d7e7-4ca2-a0f9-44fbe403e41c",title:"Islam is the Faith of Peace",author:"Quran & Science",content:`Islam means to submit to Allah, adhere to obeying Him, and be free from worshipping any others besides Allah. There is no good except that which Islam ordered for it to be done, and there is no evil except that which it prohibited. Applying Islam guarantees everyone to be able to live in security and peace in light of its system, which safeguards rights for all.

Allah said:((Say, \u201CCome, I will recite what your Lord has prohibited to you. He commands that you not associate anything with Him, and to parents, good treatment, and do not kill your children out of poverty; We will provide for you and them; and do not approach immoralities- what is apparent of them and what is concealed; and do not kill the soul which Allah has forbidden to be killed except by legal right. This has He instructed you that you may use reason;\u201D and do not approach the orphan\u2019s property except in a way that is best until he reaches maturity; and give full measure and weight in justice. We do not charge any soul except with that within its capacity; and when you speak be just, even if it concerns a near relative; and the Covenant of Allah fulfill. This has He instructed you that you may remember.)) (6:151 \u2013 152)

Allah also said:((Indeed, Allah orders justice and good conduct and giving to relatives and forbids immorality and bad conduct and oppression. He admonishes you that perhaps you will be reminded.)) (16: 90)

Hence, the Faith of Islam is a comprehensive Faith of peace in all meanings of this word. This applies to the internal level of Muslim society as Allah said:\xABAnd those who harm believing men and believing women for something other than what they have earned have certainly born upon themselves a slander and manifest sin.\xBB (33: 58)

The one upon whom be Allah\u2019s Blessing and Peace said:

He also said:\u201CA believer is a person whom people trust!\u201D

Islam also provides peace on an international level and it is established on forming friendly relationships that are founded on security, stability and establishing the foundations of Islam. Moreover, it is when a Muslim society does not transgress against another society, especially those that do not play with the Faith nor set up enmity against its adherents. This is according to the Words,((O you who have believed, enter into Islam completely and perfectly and do not follow the footsteps of Shayttaan. Indeed, he is to you a clear enemy.)) (2: 208)

The Faith of Islam enjoins Justice and non-oppression, even with those who set up enmity against them. Allah said:((O you who have believed, be persistently standing firm for Allah, witnesses in Justice, and do not let the hatred of a people prevent you from being just. Be just; that is nearer to Righteousness; and fear Allah; indeed, Allah is Acquainted with what you do.)) (5: 8)

As-Salaam, The Peaceful, is one of the All Praised\u2019s Names. Allah said:((He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection, the Bestower of Faith, the Overseer, the Exalted in Might, the Compeller, the Superior. Exalted is Allah above whatever they associate with Him.)) (59: 23)

As-Salaam is one of the names of Allah\u2019s Garden, jannah. Allah the All High said:((For them will be the Home of Peace with their Lord, and He will be their protecting Friend because of what they used to do.)) (6: 127)

As-Salaam is the greeting of the people of jannah. Allah said:((Their greeting the Day they meet Him will be, \u2018Peace,\u2019 and He has prepared for them a noble Reward.)) (33: 44)

As-Salaam is also the greeting of Muslims among themselves, As-Salaamu \u2018Alaykum! It is a greeting which adds tranquility, calmness and ease for the greeting and the greeted person. This is because of the expression of security and safety within this greeting. This, the Prophet (may Allah\u2019s Blessing and Peace be upon him) established as one of the perfecting actions of a person\u2019s belief. He said: \u201CYou will not enter jannah until you believe, and you will not believe until you love each other. Shall I not guide you towards a thing, that if you do, you would love each other? Spread the Salaam! greeting among you!\u201D (Reported by Muslim)

The one upon whom be Allah\u2019s Blessing and Peace established that this was one of the best actions. This is because the greeting brings hearts closer and softens them when it is given or heard. It also removes differences ands hatred. When the Prophet (may Allah\u2019s Blessing and Peace be one upon him) was asked, \u2018 Which part of Islam is best?,\u2019 he replied, \u201CTo feed people and give the Salaam! greeting to those you know and those you do not know!\u201D (Agreed upon)

Hence, the Faith of Islam brought regulations and Legislations at times of dealings, war, marriage, economy, politics, worship etc. It was for an ideal, virtuous society to implement and regulate a Muslim\u2019s relationship with his/her Lord, society and surrounding world, whether the human world or environment. The whole of humanity is unable to produce the like of Islam. A Faith of this Perfection and comprehensiveness is deserving of being embraced, invited towards, care to be taken to spread it, and not to set up enmity against it.

\u201CA Muslim is a person whose tongue and hand is safeguarded against, and an emigrant is a person who has left that which Allah prohibited!.\u201D (Agreed upon)`,source:"Quran and Science",original_url:"https://quranandscience.com/embracing-islam/fakes-about-islam/263-islam-is-the-faith-of-peace/",license:"Fair Use / Permitted Metadata",publication_date:"2010-05-03T16:34:11",created_at:"2026-08-23 09:55:30"}]};var l=j;async function N(){if(console.log("Starting to seed database from data.json..."),l.topics&&l.topics.length>0&&await h.insert(I).values(l.topics).execute(),l.articles&&l.articles.length>0){let a=l.articles.map(t=>({id:t.id,title:t.title,author:t.author,content:t.content,source:t.source,originalUrl:t.original_url,license:t.license,publicationDate:t.publication_date,createdAt:t.created_at})),i=50;for(let t=0;t<a.length;t+=i){let n=a.slice(t,t+i);await h.insert(d).values(n).execute()}}if(l.articleTopics&&l.articleTopics.length>0){let a=l.articleTopics.map(t=>({id:t.id,articleId:t.article_id,topicId:t.topic_id})),i=50;for(let t=0;t<a.length;t+=i){let n=a.slice(t,t+i);await h.insert(x).values(n).execute()}}if(l.relationships&&l.relationships.length>0){let a=l.relationships.map(t=>({id:t.id,surahNumber:t.surah_number,ayahNumber:t.ayah_number,articleId:t.article_id,explanation:t.explanation,createdAt:t.created_at})),i=50;for(let t=0;t<a.length;t+=i){let n=a.slice(t,t+i);await h.insert(f).values(n).execute()}}console.log("Seeding complete. Seeded "+l.articles.length+" articles.")}async function X(){try{(await h.select().from(d).limit(1).execute()).length===0&&(console.log("Database empty. Seeding..."),await N())}catch(n){console.error("Failed to seed database:",n)}let a=(0,M.default)(),i=3e3;if(a.use((0,G.default)()),a.use(M.default.json()),a.get("/api/tafseer/proxy/:id",async(n,o)=>{try{let s=n.params.id,u=await fetch(`https://www.tafseerenamoona.net/surahs/${s}`);if(!u.ok)return o.status(u.status).json({error:"Failed to fetch from tafseerenamoona.net"});let p=await u.text();o.send(p)}catch(s){console.error(s),o.status(500).json({error:s.message})}}),a.get("/api/discussions",async(n,o)=>{try{let{surah:s,ayah:u}=n.query,p=h.select({discussion:m,ayahRef:w}).from(m).leftJoin(w,(0,r.eq)(m.id,w.discussionId));if(s&&u){let g=parseInt(s),c=parseInt(u),y=await p.where((0,r.and)((0,r.eq)(w.surahNumber,g),(0,r.eq)(w.ayahNumber,c))).orderBy((0,r.desc)(m.createdAt)).execute();return o.json(y)}let k=await p.orderBy((0,r.desc)(m.createdAt)).limit(50).execute();o.json(k)}catch(s){o.status(500).json({error:s.message})}}),a.post("/api/discussions",async(n,o)=>{try{let{content:s,author:u,email:p,replyToId:k,surahNumber:g,ayahNumber:c,surahName:y,tafseerRef:b}=n.body;if(!s||s.trim().length===0)return o.status(400).json({error:"Content is required"});let A=(0,S.v4)();await h.insert(m).values({id:A,content:s.trim(),author:u?.trim()||"Anonymous",email:p?.trim()||null,replyToId:k||null,isModerated:!1}).execute(),g&&c&&await h.insert(w).values({id:(0,S.v4)(),discussionId:A,surahNumber:g,ayahNumber:c,surahName:y||""}).execute(),b&&await h.insert(P).values({id:(0,S.v4)(),discussionId:A,surahNumber:b.surahNumber||g,ayahNumber:b.ayahNumber||c,language:b.language,source:b.source}).execute(),o.json({success:!0,id:A})}catch(s){o.status(500).json({error:s.message})}}),a.get("/api/science",async(n,o)=>{try{let{surah:s,ayah:u}=n.query;if(s){let c=parseInt(s),y=[(0,r.eq)(f.surahNumber,c)];u&&y.push((0,r.eq)(f.ayahNumber,parseInt(u)));let b=await h.select({article:d,relation:f}).from(f).innerJoin(d,(0,r.eq)(f.articleId,d.id)).where((0,r.and)(...y)).execute();return o.json(b)}let p=await h.select().from(d).orderBy((0,r.desc)(d.createdAt)).execute(),k=await h.select().from(f).execute(),g=p.map(c=>({...c,relations:k.filter(y=>y.articleId===c.id)}));o.json(g)}catch(s){o.status(500).json({error:s.message})}}),process.env.NODE_ENV==="production"||process.argv[1]?.endsWith("server.cjs")){let n=B.default.join(process.cwd(),"dist");a.use(M.default.static(n)),a.get("*",(o,s)=>{s.sendFile(B.default.join(n,"index.html"))})}else{let n=await(0,O.createServer)({server:{middlewareMode:!0},appType:"spa"});a.use(n.middlewares)}a.listen(i,"0.0.0.0",()=>{console.log(`Server running on http://localhost:${i}`)})}X();
