/**
 * One Western Armenian word a day, at the top of the report.
 *
 * Sourced from Nat's own "Armenian Beginner" doc, which is the authority here
 * for two separate things:
 *
 *   Romanization. Her family's convention, not a textbook's: "u" where another
 *   system writes "ou" (luys, udel, urakh), "-utyun" not "-utioun"
 *   (neroghutyun), "gu" not "ge" for the present tense, and a trailing "uh" for
 *   the schwa (inuh, mod uh). Do not normalize these against another
 *   phrasebook — the point is that what he says matches what she says.
 *
 *   Vocabulary. Where the doc and a dictionary disagree, the doc wins: "hajees"
 *   for please rather than khntrem, "surg" for coffee rather than sourj,
 *   "kisher pari" for good night rather than the reverse. These are the words
 *   she'll actually recognise.
 *
 * `hy` is optional and deliberately sparse. The doc carries no Armenian script,
 * so script appears only on entries carried over from the earlier vetted list
 * where it's known to match. Guessing spelling for the rest would quietly put
 * errors in front of a native speaker, and the roman line is the one he reads.
 *
 * Deliberately a curated list rather than a model call: every entry has to be
 * right, and a model writing Armenian each morning can't be checked before it
 * lands in the inbox. A list is checked once, costs nothing, and works with no
 * provider configured.
 *
 * Deterministic by date so a re-run of the same morning shows the same word.
 * When the list runs out it cycles; appending here is how the course grows.
 */

export interface ArmenianWord {
  /** Armenian script, classical orthography. Omitted where it isn't verified. */
  hy?: string;
  /** Her family's romanization, exactly as her doc writes it. */
  roman: string;
  en: string;
  /** Usage, when the bare translation would mislead. */
  note?: string;
}

/**
 * Day 1 of the current list.
 *
 * Reset when the list was rebuilt from her doc. Carrying the old day number
 * forward would have skipped straight past the greetings — the words he most
 * needs, and the ones whose spelling changed most.
 */
const START_ISO = "2026-10-02";

export const WORDS: ArmenianWord[] = [
  // ── Say these first ──────────────────────────────────────────────
  { hy: "Բարեւ", roman: "Parev", en: "hello" },
  { hy: "Բարի լոյս", roman: "Pari luys", en: "good morning" },
  { roman: "Gu sirem kez", en: "I love you", note: "gu sirem is \"I like/love\"; kez is you" },
  { roman: "Shnorhagal em", en: "thank you", note: "literally \"I am thankful\"" },
  { roman: "Hajees", en: "please" },
  { roman: "Inchbes es?", en: "how are you?", note: "inchbes ek? to more than one person" },
  { hy: "Լաւ", roman: "Lav", en: "good / fine", note: "the normal answer to inchbes es" },
  { hy: "Այո", roman: "Ayo", en: "yes", note: "ha is the casual one" },
  { hy: "Ոչ", roman: "Voch", en: "no", note: "che is the casual one" },
  { hy: "Հոգիս", roman: "Hokis", en: "my soul", note: "an everyday endearment, not a dramatic one" },
  { roman: "Kisher pari", en: "good night" },
  { roman: "Luys pari", en: "good night (the reply)", note: "she says kisher pari, you answer luys pari" },
  { hy: "Անուշիկ", roman: "Anushig", en: "sweetie", note: "from anush, sweet" },
  { hy: "Բարի եկար", roman: "Pari yegar", en: "welcome", note: "to someone arriving" },
  { roman: "Gu desnevink", en: "see you later" },
  { roman: "Ts'tesutyun", en: "bye" },
  { hy: "Պաչիկ", roman: "Bachig", en: "a little kiss" },
  { hy: "Ներողութիւն", roman: "Neroghutyun", en: "excuse me / sorry" },
  { roman: "Charzhe", en: "no problem" },
  { roman: "Urakh em", en: "happy to meet you" },
  { hy: "Սիրելիս", roman: "Sirelis", en: "my dear" },
  { roman: "Anshusht", en: "of course" },
  { roman: "Abreis", en: "good job", note: "what you say when someone's done well" },
  { hy: "Յաջողութիւն", roman: "Hachoghutyun", en: "good luck" },

  // ── Who's who ────────────────────────────────────────────────────
  { roman: "Yes", en: "I", note: "spelled like the English word; nothing to do with it" },
  { roman: "Toun", en: "you", note: "doun with a d is \"house\" — different word" },
  { roman: "An", en: "he / she", note: "one word for both" },
  { roman: "Menk", en: "we" },
  { roman: "Touk", en: "you (more than one)" },
  { roman: "Anonk", en: "they" },
  { roman: "Im", en: "my" },
  { roman: "em / es / e", en: "I am / you are / he-she is", note: "plural: enk / ek / en" },

  // ── Being understood ─────────────────────────────────────────────
  { roman: "Chem haskanal", en: "I don't understand" },
  { roman: "Chem kider", en: "I don't know" },
  { roman: "Noren useh", en: "say it again" },
  { roman: "Grnam?", en: "can I?" },
  { roman: "Grnam", en: "I can" },
  { roman: "Chem grnar", en: "I can't" },
  { roman: "Grnam hartsnel pan muh kezi?", en: "can I ask you something?" },
  { roman: "Hamatsign em", en: "I agree" },

  // ── Asking ───────────────────────────────────────────────────────
  { roman: "Inch?", en: "what?" },
  { roman: "Ov e?", en: "who is it?" },
  { roman: "Ur e?", en: "where is it?" },
  { roman: "Yerp", en: "when" },
  { roman: "Inchu", en: "why" },
  { roman: "Inch bes", en: "how" },
  { roman: "Vor can e?", en: "how much is it?" },
  { roman: "Arzhe?", en: "is it worth it?" },

  // ── Everyday ─────────────────────────────────────────────────────
  { hy: "Հիմա", roman: "Hima", en: "now" },
  { roman: "Imichabes", en: "at once / right away" },
  { hy: "Հոս", roman: "Hos", en: "here" },
  { hy: "Հոն", roman: "Hon", en: "there" },
  { roman: "Yev", en: "and" },
  { hy: "Շատ", roman: "Shad", en: "very / a lot" },
  { hy: "Քիչ", roman: "Kich", en: "a little" },
  { roman: "Hed", en: "with", note: "hed us — with me" },
  { roman: "Iraru hed", en: "with each other" },
  { roman: "Hamar", en: "for", note: "ador hamar — for that" },
  { roman: "Ays", en: "this", note: "adi — that" },
  { roman: "As meguh", en: "this one", note: "ad meguh — that one" },
  { roman: "Mod uh", en: "nearby" },
  { roman: "Kov uh", en: "next to" },
  { roman: "Mech uh", en: "inside" },
  { roman: "Toors uh", en: "outside" },
  { roman: "Archev uh", en: "in front of" },
  { roman: "Teimatz uh", en: "across from" },
  { roman: "Vran", en: "on" },
  { roman: "Daguh", en: "under" },
  { roman: "Degth muh", en: "somewhere / a place" },
  { roman: "Ador maseen", en: "about that" },
  { roman: "Vorov hedev", en: "because", note: "kani vor works too" },

  // ── How you feel ─────────────────────────────────────────────────
  { hy: "Ուրախ", roman: "Urakh", en: "happy" },
  { roman: "Hageli", en: "nice / pleasant" },
  { roman: "Hoknatz", en: "tired" },
  { roman: "Anotee", en: "hungry" },
  { roman: "Gusht", en: "full", note: "after a meal" },
  { roman: "Hivant", en: "sick" },
  { roman: "Kesh", en: "bad" },
  { roman: "Lav che", en: "not good" },
  { roman: "Dak", en: "hot" },
  { roman: "Bagh", en: "cold" },
  { roman: "Sar", en: "ice / frozen" },

  // ── Table ────────────────────────────────────────────────────────
  { hy: "Հաց", roman: "Hatz", en: "bread" },
  { hy: "Ջուր", roman: "Chur", en: "water" },
  { roman: "Surg", en: "coffee", note: "Armenian coffee is its own thing; ask her to make it" },
  { roman: "Tey", en: "tea" },
  { roman: "Banir", en: "cheese" },
  { roman: "Mis", en: "meat" },
  { roman: "Kavat", en: "cup" },
  { roman: "Baghbaghag", en: "ice cream" },
  { hy: "Համով", roman: "Hamov", en: "delicious" },
  { roman: "Shad hamov e", en: "it's very delicious" },
  { roman: "Hamov che", en: "not tasty" },
  { roman: "Siretzi", en: "I liked it", note: "chi siretzi — I didn't like it" },
  { roman: "Gu sirem", en: "I like it" },
  { roman: "Jash uh dak eh", en: "the food is hot" },
  { roman: "Tey uh bagh eh", en: "the tea is cold" },

  // ── Doing things ─────────────────────────────────────────────────
  { roman: "Yegur hos", en: "come here", note: "yegur — to come" },
  { hy: "Ուտել", roman: "Udel", en: "to eat" },
  { hy: "Խմել", roman: "Khmel", en: "to drink" },
  { roman: "Uzel", en: "to want" },
  { roman: "Khosel", en: "to speak" },
  { roman: "Asel", en: "to say" },
  { roman: "Haskanal", en: "to understand" },
  { roman: "Unenal", en: "to have", note: "uni — he/she has" },
  { roman: "Ganchel", en: "to call" },
  { roman: "Tsavel", en: "to ache" },
  { roman: "Hankstanal", en: "to rest" },
  { roman: "Knel", en: "to sleep", note: "her doc writes \"to buy\" the same way — context tells them apart" },
  { roman: "Ashkhadil", en: "to work", note: "ashkhatel is the other spelling" },
  { roman: "Abrel", en: "to live" },
  { roman: "Sirel", en: "to like / to love" },

  // ── Counting ─────────────────────────────────────────────────────
  { hy: "Մէկ", roman: "Meg", en: "one" },
  { hy: "Երկու", roman: "Yergu", en: "two" },
  { hy: "Երեք", roman: "Yerek", en: "three" },
  { hy: "Չորս", roman: "Chors", en: "four" },
  { hy: "Հինգ", roman: "Hing", en: "five" },
  { hy: "Վեց", roman: "Vets", en: "six" },
  { roman: "Yot", en: "seven" },
  { roman: "Ut", en: "eight" },
  { roman: "Inuh", en: "nine" },
  { roman: "Das", en: "ten" },
  { roman: "Dasnmeg", en: "eleven", note: "das + meg; the teens all work this way" },
  { roman: "Ksan", en: "twenty" },
  { roman: "Yeresun", en: "thirty" },
  { roman: "Karrasun", en: "forty" },
  { roman: "Hisun", en: "fifty" },
  { roman: "Haryur", en: "one hundred" },
  { roman: "Hazar", en: "one thousand" },

  // ── Around the house ─────────────────────────────────────────────
  { roman: "Tbrotz", en: "school" },
  { roman: "Khohanots", en: "kitchen" },
  { roman: "Senyag", en: "room" },
  { roman: "Pathnik", en: "bathroom" },
  { roman: "Poghots", en: "street" },

  // ── Where people are from ────────────────────────────────────────
  { hy: "Հայաստան", roman: "Hayastan", en: "Armenia" },
  { hy: "Հայ", roman: "Hay", en: "Armenian (a person)" },
  { roman: "Hayeren", en: "the Armenian language" },
  { roman: "Ameriga", en: "America", note: "amerigatsi — an American" },
  { roman: "Ankleren", en: "English (the language)" },
  { roman: "Fransia", en: "France", note: "fransiatsi — French person, franseren — the language" },
  { roman: "Rusastan", en: "Russia" },
];

export interface WordOfTheDay {
  word: ArmenianWord;
  /** 1-based, counting from START_ISO. Shown so progress is visible. */
  day: number;
}

function dayNumber(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [sy, sm, sd] = START_ISO.split("-").map(Number);
  const diff = Date.UTC(y, m - 1, d) - Date.UTC(sy, sm - 1, sd);
  return Math.round(diff / 86_400_000) + 1;
}

/** The word for an ET calendar date. Cycles once the list is exhausted. */
export function wordOfTheDay(dateISO: string): WordOfTheDay {
  const day = dayNumber(dateISO);
  // A preview run before START_ISO gives a negative day; wrap it rather than
  // index off the front of the list.
  const index = (((day - 1) % WORDS.length) + WORDS.length) % WORDS.length;
  return { word: WORDS[index], day };
}
