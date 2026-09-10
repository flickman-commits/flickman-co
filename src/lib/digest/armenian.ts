/**
 * One Western Armenian word a day, at the top of the report.
 *
 * Western, not Eastern: Nat's family speaks it, and the two differ enough that
 * the wrong one sounds off in every word — Western swaps the voiced and
 * voiceless stops (բ→p, պ→b, գ→k, կ→g, դ→t, տ→d, ձ→ts, ծ→dz, ջ→ch, ճ→j), uses
 * the classical spelling (լոյս, not լույս), and marks the present tense with
 * "ge" rather than "-um em". The transliterations here are Western; do not
 * "fix" them against an Eastern phrasebook.
 *
 * Deliberately a curated list rather than a model call. The point is to learn
 * words she'll recognise, so every entry has to be right, and a model writing
 * Armenian each morning can't be checked before it lands in the inbox. A list
 * is checked once, costs nothing, works with no provider configured, and
 * progresses in an order that makes sense — greetings and what you'd say to
 * her first, numbers and colours later.
 *
 * Deterministic by date so a re-run of the same morning shows the same word.
 * When the list runs out it cycles; appending here is how the course grows.
 */

export interface ArmenianWord {
  /** Armenian script, classical orthography. */
  hy: string;
  /** Western pronunciation, roughly as an English speaker would read it. */
  roman: string;
  en: string;
  /** Usage, when the bare translation would mislead. */
  note?: string;
}

/** The first report to carry a word. Day 1 is this date. */
const START_ISO = "2026-09-10";

export const WORDS: ArmenianWord[] = [
  // ── Say these first ──────────────────────────────────────────────
  { hy: "Բարեւ", roman: "parev", en: "hello" },
  { hy: "Կը սիրեմ քեզ", roman: "ge sirem kez", en: "I love you" },
  { hy: "Բարի լոյս", roman: "pari louys", en: "good morning" },
  { hy: "Շնորհակալութիւն", roman: "shnorhagaloutioun", en: "thank you", note: "\"mersi\" is what everyone actually says; this is the proper one" },
  { hy: "Անուշիկ", roman: "anoushig", en: "sweetie", note: "from anoush, sweet — the -ig makes it affectionate" },
  { hy: "Ինչպէ՞ս ես", roman: "inchbes es", en: "how are you?" },
  { hy: "Լաւ եմ", roman: "lav em", en: "I'm good" },
  { hy: "Բարի գիշեր", roman: "pari kisher", en: "good night" },
  { hy: "Հոգիս", roman: "hokis", en: "my soul", note: "an everyday endearment, not a dramatic one" },
  { hy: "Այո", roman: "ayo", en: "yes" },
  { hy: "Ոչ", roman: "voch", en: "no" },
  { hy: "Խնդրեմ", roman: "khntrem", en: "please / you're welcome", note: "both, depending on where it lands" },
  { hy: "Պաչիկ", roman: "bachig", en: "a little kiss" },
  { hy: "Ես հայերէն կը սորվիմ", roman: "yes hayeren ge sorvim", en: "I'm learning Armenian" },
  { hy: "Սիրելիս", roman: "sirelis", en: "my dear / my love" },
  { hy: "Բարի իրիկուն", roman: "pari irigoun", en: "good evening" },
  { hy: "Ցտեսութիւն", roman: "tsdesoutioun", en: "goodbye" },
  { hy: "Ներողութիւն", roman: "neroghoutioun", en: "sorry / excuse me" },
  { hy: "Քեզի կարօտցած եմ", roman: "kezi garodtsadz em", en: "I miss you" },
  { hy: "Աչքիս լոյս", roman: "achkis louys", en: "light of my eyes", note: "said to someone you're glad to see" },

  // ── Getting by ───────────────────────────────────────────────────
  { hy: "Կը հասկնա՞ս", roman: "ge hasgnas", en: "do you understand?" },
  { hy: "Չեմ հասկնար", roman: "chem hasgnar", en: "I don't understand" },
  { hy: "Նորէն ըսէ", roman: "noren use", en: "say it again" },
  { hy: "Ի՞նչ", roman: "inch", en: "what?" },
  { hy: "Ո՞ւր", roman: "our", en: "where?" },
  { hy: "Ինչո՞ւ", roman: "inchou", en: "why?" },
  { hy: "Ե՞րբ", roman: "yerp", en: "when?" },
  { hy: "Ո՞վ", roman: "ov", en: "who?" },
  { hy: "Ի՞նչ կ՚ընես", roman: "inch g'unes", en: "what are you doing?" },
  { hy: "Շատ", roman: "shad", en: "very / a lot" },
  { hy: "Քիչ", roman: "kich", en: "a little" },
  { hy: "Լաւ", roman: "lav", en: "good" },
  { hy: "Շատ լաւ", roman: "shad lav", en: "very good" },
  { hy: "Ամէն ինչ լաւ է", roman: "amen inch lav e", en: "everything's fine" },
  { hy: "Ես ալ", roman: "yes al", en: "me too", note: "\"al\" for also is a Western tell; Eastern says \"el\"" },
  { hy: "Հոս", roman: "hos", en: "here" },
  { hy: "Հոն", roman: "hon", en: "there" },
  { hy: "Հիմա", roman: "hima", en: "now" },
  { hy: "Այսօր", roman: "aysor", en: "today" },
  { hy: "Վաղը", roman: "vaghu", en: "tomorrow" },
  { hy: "Երէկ", roman: "yereg", en: "yesterday" },
  { hy: "Հոգ մի՛ ըներ", roman: "hok mi uner", en: "don't worry" },
  { hy: "Կեցցե՛ս", roman: "getses", en: "well done!", note: "literally \"may you live\" — bravo" },
  { hy: "Յաջողութիւն", roman: "hachoghoutioun", en: "good luck" },

  // ── Table ────────────────────────────────────────────────────────
  { hy: "Սուրճ", roman: "sourj", en: "coffee", note: "Armenian coffee is its own thing; ask her to make it" },
  { hy: "Ջուր", roman: "chour", en: "water" },
  { hy: "Հաց", roman: "hats", en: "bread" },
  { hy: "Գինի", roman: "kini", en: "wine" },
  { hy: "Բարի ախորժակ", roman: "pari akhorzhag", en: "bon appétit" },
  { hy: "Անուշ ըլլայ", roman: "anoush ulla", en: "may it be sweet", note: "the reply when someone says thanks for a meal" },
  { hy: "Համով", roman: "hamov", en: "delicious" },
  { hy: "Կենաց", roman: "genats", en: "cheers!", note: "raise a glass" },
  { hy: "Ուտել", roman: "oudel", en: "to eat" },
  { hy: "Խմել", roman: "khmel", en: "to drink" },

  // ── People ───────────────────────────────────────────────────────
  { hy: "Մայրիկ", roman: "mayrig", en: "mom" },
  { hy: "Հայրիկ", roman: "hayrig", en: "dad" },
  { hy: "Մեծ մայրիկ", roman: "medz mayrig", en: "grandma" },
  { hy: "Մեծ հայրիկ", roman: "medz hayrig", en: "grandpa" },
  { hy: "Քոյր", roman: "kouyr", en: "sister" },
  { hy: "Եղբայր", roman: "yeghpayr", en: "brother" },
  { hy: "Ընտանիք", roman: "undanik", en: "family" },
  { hy: "Ընկեր", roman: "unger", en: "friend" },
  { hy: "Սէր", roman: "ser", en: "love (the noun)" },
  { hy: "Համբոյր", roman: "hampouyr", en: "kiss (the noun)" },
  { hy: "Գրկել", roman: "krgel", en: "to hug" },
  { hy: "Հայ", roman: "hay", en: "Armenian (a person)" },
  { hy: "Հայաստան", roman: "hayasdan", en: "Armenia" },
  { hy: "Բարի եկար", roman: "pari yegar", en: "welcome", note: "to someone arriving" },
  { hy: "Անունս ... է", roman: "anouns ... e", en: "my name is ..." },

  // ── Describing ───────────────────────────────────────────────────
  { hy: "Գեղեցիկ", roman: "keghetsig", en: "beautiful" },
  { hy: "Աղուոր", roman: "aghvor", en: "lovely / nice", note: "very Western; you won't hear it in Yerevan" },
  { hy: "Սիրուն", roman: "siroun", en: "pretty" },
  { hy: "Ուրախ", roman: "ourakh", en: "happy" },
  { hy: "Անուշ", roman: "anoush", en: "sweet" },
  { hy: "Տուն", roman: "doun", en: "home / house" },
  { hy: "Ծաղիկ", roman: "dzaghig", en: "flower" },
  { hy: "Արեւ", roman: "arev", en: "sun" },
  { hy: "Լուսին", roman: "lousin", en: "moon" },
  { hy: "Ծով", roman: "dzov", en: "sea" },
  { hy: "Կարմիր", roman: "garmir", en: "red" },
  { hy: "Կապոյտ", roman: "gabouyd", en: "blue" },
  { hy: "Կանաչ", roman: "ganach", en: "green" },

  // ── Counting ─────────────────────────────────────────────────────
  { hy: "Մէկ", roman: "meg", en: "one" },
  { hy: "Երկու", roman: "yergou", en: "two" },
  { hy: "Երեք", roman: "yerek", en: "three" },
  { hy: "Չորս", roman: "chors", en: "four" },
  { hy: "Հինգ", roman: "hink", en: "five" },
  { hy: "Վեց", roman: "vets", en: "six" },
  { hy: "Եօթը", roman: "yotu", en: "seven" },
  { hy: "Ութը", roman: "outu", en: "eight" },
  { hy: "Ինը", roman: "inu", en: "nine" },
  { hy: "Տասը", roman: "dasu", en: "ten" },

  // ── Occasions ────────────────────────────────────────────────────
  { hy: "Շնորհաւոր", roman: "shnorhavor", en: "congratulations", note: "also the \"happy\" in happy birthday, happy new year" },
  { hy: "Ծնունդդ շնորհաւոր", roman: "dznountt shnorhavor", en: "happy birthday" },
  { hy: "Կիրակի", roman: "giragi", en: "Sunday" },
  { hy: "Երկուշաբթի", roman: "yergoushapti", en: "Monday" },
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
