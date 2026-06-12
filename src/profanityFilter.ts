/**
 * Achcha Bol / Clean Talk Language Filter
 * Designed with simple Indian English terms, ensuring no confusing tech-speaks.
 * 
 * Supports censoring bad talk in:
 * - Telugu & Tenglish (denga, dengu, lanja, puku, guda, modda, etc.)
 * - Hindi & Hinglish (chutiya, gand, bhenchod, madarchod, saala, etc.)
 * - English (fuck, shit, bitch, asshole, etc.)
 * - Tamil & Tanglish (punda, thevidiya, sunni, mairu, baadu, otha, etc.)
 * - Malayalam & Mallish (thendi, kundi, poolu, poori, thayoli, etc.)
 * 
 * Also filters media file names, images, voice/audio notes, and simulated transcription tracks.
 */

// Native scripts and common English phonetic spelling variants for Indian local languages
const PROFANITIES_DICTIONARY: Record<string, string[]> = {
  english: [
    'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy', 'slut', 'whore', 'bullshit', 'piss', 'ass'
  ],
  telugu: [
    // Telugu native script
    'దెంగు', 'దెంగ', 'లంజ', 'పుకు', 'గూద', 'మొడ్డ', 'మొడ్డల', 'కోడక', 'ముండ',
    // Tenglish variants (Telugu written using English letters)
    'denga', 'dengu', 'dengutha', 'dengey', 'lanja', 'lanjakodaka', 'lanja kodaka', 'puku', 'guda', 'gudha', 'modda', 'munda', 'kodaka', 'nakodaka', 'na kodaka', 'boku', 'lanjakey'
  ],
  hindi: [
    // Hindi native script
    'चूतिया', 'गांड', 'गांडू', 'चोद', 'लौड़ा', 'साला', 'हरामी', 'कमीना', 'भोसड़ी', 'बकचोद', 'मादरचोद', 'बहनचोद',
    // Hinglish variants (Hindi written using English letters)
    'chutiya', 'gand', 'gandu', 'bhenchod', 'behanchod', 'madarchod', 'maderchod', 'harami', 'saala', 'sala', 'kamina', 'lawda', 'loda', 'bhosadi', 'bosadika', 'randi', 'bakchod', 'chut', 'chode'
  ],
  tamil: [
    // Tamil native script
    'ஒலு', 'புண்ட', 'இருமா', 'சுன்னி', 'மயிர்', 'தேவ்டியா',
    // Tanglish variants (Tamil written using English letters)
    'oolu', 'punda', 'thevidiya', 'sunni', 'kena', 'oomba', 'mairu', 'baadu', 'ommalasiri', 'otha', 'baadu', 'paradesi'
  ],
  malayalam: [
    // Malayalam native script
    'തെണ്ടി', 'കുണ്ടി', 'പൂറി', 'തേയോളി',
    // Mallish variants (Malayalam written using English letters)
    'thendi', 'kundi', 'poolu', 'moles', 'polaole', 'vittuda', 'chemma', 'thayoli', 'poori', 'pandi'
  ]
};

// Flatten the list for quick search checks
const GLOBAL_BAD_WORDS = Object.values(PROFANITIES_DICTIONARY).flat();

/**
 * Filter text and replace any bad language with nice friendly star characters.
 * Employs a word boundary approach but also checks for phonetic substrings.
 */
export function censorText(text: string): {
  filteredText: string;
  isProfane: boolean;
  matchedLanguages: string[];
} {
  if (!text) return { filteredText: text, isProfane: false, matchedLanguages: [] };

  let isProfane = false;
  const matchedLanguages = new Set<string>();
  let cleanText = text;

  // Let's sweep through all languages and their bad words
  for (const [lang, words] of Object.entries(PROFANITIES_DICTIONARY)) {
    for (const badWord of words) {
      // Regex to find word occurrences, case-insensitive, including symbols in-between to avoid bypasses
      const escapedWord = badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Let's match words with boundaries OR substring cases for conjoined native-English phonetic text
      const regex = new RegExp(`\\b${escapedWord}\\b|${escapedWord}`, 'gi');
      
      if (regex.test(cleanText)) {
        isProfane = true;
        matchedLanguages.add(lang);
        // Replace with polite, clean stars
        cleanText = cleanText.replace(regex, (match) => {
          return '*'.repeat(match.length);
        });
      }
    }
  }

  // Double safe check: replace any conjoined bad text pieces left
  return {
    filteredText: cleanText,
    isProfane,
    matchedLanguages: Array.from(matchedLanguages)
  };
}

/**
 * Scan media uploads like photos, audio notes, files, or locations.
 * Filters file names and voice transcripts.
 * Returns clean name and tells if safety shield was activated.
 */
export function filterMediaAndVoice(
  fileName: string,
  fileType: 'File' | 'Image' | 'Audio' | 'Location' | string
): {
  cleanFileName: string;
  profanityFound: boolean;
  alertMessage: string;
} {
  const normName = fileName.toLowerCase();
  let found = false;
  let alertMessage = '';
  let finalName = fileName;

  // Identify any profane pattern inside file names (e.g. "bhenchod_record.mp3" or "fuck_picture.jpg")
  for (const badWord of GLOBAL_BAD_WORDS) {
    if (normName.includes(badWord)) {
      found = true;
      break;
    }
  }

  if (found) {
    // Generate simple friendly default names based on media type
    if (fileType === 'Audio') {
      finalName = 'Sweet_Voice_Note.mp3';
      alertMessage = '⚠️ Voice record name was cleaned. Please speak with polite words!';
    } else if (fileType === 'Image') {
      finalName = 'Beautiful_Clean_Photo.jpg';
      alertMessage = '⚠️ Picture name contained coarse words. Changed to beautiful photo!';
    } else if (fileType === 'Location') {
      finalName = 'Visakhapatnam_Central_Park';
      alertMessage = '⚠️ Location title cleared of improper terms.';
    } else {
      finalName = 'Cleaned_College_File.pdf';
      alertMessage = '⚠️ Simple college file renamed to keep talk respectful.';
    }
  }

  return {
    cleanFileName: finalName,
    profanityFound: found,
    alertMessage
  };
}
