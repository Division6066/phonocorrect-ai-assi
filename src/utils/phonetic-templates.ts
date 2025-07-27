/**
 * Comprehensive rule templates for common phonetic spelling patterns
 * Organized by type for easy discovery and application
 */

import { CustomRule } from '@/types/custom-rules';

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rules: Omit<CustomRule, 'id' | 'createdAt' | 'updatedAt' | 'usage'>[];
}

export const PHONETIC_TEMPLATES: RuleTemplate[] = [
  // === I BEFORE E EXCEPTIONS ===
  {
    id: 'ie-ei-patterns',
    name: 'I Before E Patterns',
    description: 'Common i-before-e and e-before-i spelling rules and exceptions',
    category: 'Vowel Patterns',
    difficulty: 'beginner',
    rules: [
      {
        misspelling: 'recieve',
        correction: 'receive',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'E before I after C: receive',
        examples: ['I will recieve the package', 'Did you recieve my email?']
      },
      {
        misspelling: 'beleive',
        correction: 'believe',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'I before E when not after C: believe',
        examples: ['I beleive in you', 'Do you beleive this story?']
      },
      {
        misspelling: 'acheive',
        correction: 'achieve',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'I before E when not after C: achieve',
        examples: ['I want to acheive my goals', 'acheive greatness']
      },
      {
        misspelling: 'deceive',
        correction: 'deceive',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'E before I after C: deceive',
        examples: ['Don\'t try to decieve me', 'He tried to decieve everyone']
      },
      {
        misspelling: 'wierd',
        correction: 'weird',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Exception to I before E rule: weird',
        examples: ['That\'s really wierd', 'What a wierd situation']
      }
    ]
  },

  // === DOUBLE CONSONANTS ===
  {
    id: 'double-consonants',
    name: 'Double Consonant Patterns',
    description: 'Words commonly misspelled with single vs double consonants',
    category: 'Consonant Patterns',
    difficulty: 'intermediate',
    rules: [
      {
        misspelling: 'occured',
        correction: 'occurred',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Double R in occurred',
        examples: ['The accident occured yesterday', 'It occured to me that...']
      },
      {
        misspelling: 'begining',
        correction: 'beginning',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Double N in beginning',
        examples: ['At the begining of time', 'This is just the begining']
      },
      {
        misspelling: 'comitted',
        correction: 'committed',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Double T in committed',
        examples: ['He was comitted to the cause', 'She comitted to the project']
      },
      {
        misspelling: 'proffessional',
        correction: 'professional',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Single F in professional',
        examples: ['A proffessional service', 'proffessional development']
      },
      {
        misspelling: 'embarass',
        correction: 'embarrass',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Double R and S in embarrass',
        examples: ['Don\'t embarass yourself', 'That will embarass him']
      }
    ]
  },

  // === PHONETIC SOUND REPLACEMENTS ===
  {
    id: 'phonetic-sounds',
    name: 'Phonetic Sound Patterns',
    description: 'Common sound-based spelling mistakes',
    category: 'Sound Patterns',
    difficulty: 'beginner',
    rules: [
      {
        misspelling: 'fone',
        correction: 'phone',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'PH sound spelled as F: phone',
        examples: ['I got your fone call', 'My fone is broken']
      },
      {
        misspelling: 'fysics',
        correction: 'physics',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'PH sound spelled as F: physics',
        examples: ['I study fysics', 'fysics is fascinating']
      },
      {
        misspelling: 'nite',
        correction: 'night',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'IGH sound spelled as I: night',
        examples: ['Good nite everyone', 'See you tonite']
      },
      {
        misspelling: 'rite',
        correction: 'right',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'IGH sound spelled as I: right',
        examples: ['Turn rite here', 'That\'s rite!']
      },
      {
        misspelling: 'ryme',
        correction: 'rhyme',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'RH sound spelled as R: rhyme',
        examples: ['Words that ryme', 'Can you ryme with cat?']
      }
    ]
  },

  // === SILENT LETTERS ===
  {
    id: 'silent-letters',
    name: 'Silent Letter Patterns',
    description: 'Words with commonly missed silent letters',
    category: 'Silent Letters',
    difficulty: 'intermediate',
    rules: [
      {
        misspelling: 'nee',
        correction: 'knee',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Silent K in knee',
        examples: ['I hurt my nee', 'Bend your nee']
      },
      {
        misspelling: 'nife',
        correction: 'knife',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Silent K in knife',
        examples: ['Use a sharp nife', 'The nife is dull']
      },
      {
        misspelling: 'rong',
        correction: 'wrong',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Silent W in wrong',
        examples: ['That\'s rong', 'You got it rong']
      },
      {
        misspelling: 'rist',
        correction: 'wrist',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Silent W in wrist',
        examples: ['My rist hurts', 'Wear a rist watch']
      },
      {
        misspelling: 'limb',
        correction: 'limb',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Silent B in limb',
        examples: ['Tree lim fell down', 'Missing a lim']
      }
    ]
  },

  // === SOFT C AND G SOUNDS ===
  {
    id: 'soft-sounds',
    name: 'Soft C and G Patterns',
    description: 'C sounds like S, G sounds like J',
    category: 'Sound Patterns',
    difficulty: 'intermediate',
    rules: [
      {
        misspelling: 'sircle',
        correction: 'circle',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Soft C sound: circle',
        examples: ['Draw a sircle', 'Go around the sircle']
      },
      {
        misspelling: 'senter',
        correction: 'center',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Soft C sound: center',
        examples: ['In the senter of town', 'senter of attention']
      },
      {
        misspelling: 'jiant',
        correction: 'giant',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Soft G sound: giant',
        examples: ['A jiant tree', 'The jiant was tall']
      },
      {
        misspelling: 'jinjer',
        correction: 'ginger',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Soft G sound: ginger',
        examples: ['Fresh jinjer root', 'jinjer ale tastes good']
      }
    ]
  },

  // === COMMON WORD ENDINGS ===
  {
    id: 'word-endings',
    name: 'Tricky Word Endings',
    description: 'Commonly confused word endings and suffixes',
    category: 'Suffixes',
    difficulty: 'intermediate',
    rules: [
      {
        misspelling: 'seperate',
        correction: 'separate',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'AR ending, not ER: separate',
        examples: ['Please seperate the items', 'They live in seperate houses']
      },
      {
        misspelling: 'definately',
        correction: 'definitely',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'ITE ending, not ATE: definitely',
        examples: ['I will definately go', 'That\'s definately true']
      },
      {
        misspelling: 'diference',
        correction: 'difference',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'ER before ENCE: difference',
        examples: ['What\'s the diference?', 'I can see the diference']
      },
      {
        misspelling: 'referance',
        correction: 'reference',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'ER before ENCE: reference',
        examples: ['Use this as a referance', 'Check your referance']
      },
      {
        misspelling: 'arguement',
        correction: 'argument',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'No E after U: argument',
        examples: ['That\'s a good arguement', 'I have an arguement to make']
      }
    ]
  },

  // === HOMOPHONES ===
  {
    id: 'homophones',
    name: 'Common Homophones',
    description: 'Words that sound the same but are spelled differently',
    category: 'Homophones',
    difficulty: 'beginner',
    rules: [
      {
        misspelling: 'there house',
        correction: 'their house',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'THEIR (possessive) vs THERE (location)',
        examples: ['I went to there house', 'there car is red']
      },
      {
        misspelling: 'your welcome',
        correction: 'you\'re welcome',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'YOU\'RE (you are) vs YOUR (possessive)',
        examples: ['your welcome to stay', 'your going to love this']
      },
      {
        misspelling: 'its raining',
        correction: 'it\'s raining',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'IT\'S (it is) vs ITS (possessive)',
        examples: ['its a beautiful day', 'its going to rain']
      },
      {
        misspelling: 'to much',
        correction: 'too much',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'TOO (also/excessive) vs TO (direction)',
        examples: ['That\'s to much', 'to hot outside']
      },
      {
        misspelling: 'would of',
        correction: 'would have',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'WOULD HAVE vs WOULD OF (sounds like would\'ve)',
        examples: ['I would of gone', 'She would of helped']
      }
    ]
  },

  // === ADVANCED PHONETIC PATTERNS ===
  {
    id: 'advanced-phonetic',
    name: 'Advanced Phonetic Patterns',
    description: 'Complex phonetic spelling rules and exceptions',
    category: 'Advanced Patterns',
    difficulty: 'advanced',
    rules: [
      {
        misspelling: 'ough',
        correction: 'ough',
        isRegex: true,
        caseSensitive: false,
        enabled: true,
        description: 'OUGH can sound like: off (cough), ow (bough), oo (through), uff (rough)',
        examples: ['I have a cof', 'The bow broke', 'Go thru the door', 'This is ruf']
      },
      {
        misspelling: 'psykology',
        correction: 'psychology',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Silent P in psychology',
        examples: ['I study psykology', 'psykology is interesting']
      },
      {
        misspelling: 'pneumonia',
        correction: 'pneumonia',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Silent P in pneumonia',
        examples: ['He has neumonia', 'neumonia is serious']
      },
      {
        misspelling: 'rythm',
        correction: 'rhythm',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Tricky vowel pattern: rhythm',
        examples: ['Keep the rythm', 'Dance to the rythm']
      },
      {
        misspelling: 'colonel',
        correction: 'colonel',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Pronounced "kernel": colonel',
        examples: ['The kernel gave orders', 'kernel Smith is here']
      }
    ]
  },

  // === PLURALS AND POSSESSIVES ===
  {
    id: 'plurals-possessives',
    name: 'Plurals and Possessives',
    description: 'Common mistakes with plural and possessive forms',
    category: 'Grammar',
    difficulty: 'beginner',
    rules: [
      {
        misspelling: 'childs',
        correction: 'children',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Irregular plural: child → children',
        examples: ['The childs are playing', 'All the childs went home']
      },
      {
        misspelling: 'mouses',
        correction: 'mice',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Irregular plural: mouse → mice',
        examples: ['The mouses are small', 'Two mouses in the house']
      },
      {
        misspelling: 'womans',
        correction: 'women',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Irregular plural: woman → women',
        examples: ['The womans are here', 'Three womans arrived']
      },
      {
        misspelling: 'potato\'s',
        correction: 'potatoes',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Plural, not possessive: potatoes',
        examples: ['I bought potato\'s', 'The potato\'s are ready']
      },
      {
        misspelling: 'apple\'s are',
        correction: 'apples are',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'Plural, not possessive: apples',
        examples: ['The apple\'s are red', 'apple\'s are healthy']
      }
    ]
  },

  // === DYSLEXIC-FRIENDLY PATTERNS ===
  {
    id: 'dyslexic-patterns',
    name: 'Dyslexic-Friendly Corrections',
    description: 'Common reversals and patterns helpful for dyslexic users',
    category: 'Accessibility',
    difficulty: 'beginner',
    rules: [
      {
        misspelling: 'was',
        correction: 'saw',
        isRegex: false,
        caseSensitive: false,
        enabled: false, // Disabled by default as context-dependent
        description: 'Common reversal: was ↔ saw (context dependent)',
        examples: ['I was the dog', 'was you there?']
      },
      {
        misspelling: 'on',
        correction: 'no',
        isRegex: false,
        caseSensitive: false,
        enabled: false, // Disabled by default as context-dependent
        description: 'Common reversal: on ↔ no (context dependent)',
        examples: ['I said on to that', 'on, I can\'t go']
      },
      {
        misspelling: 'diary',
        correction: 'dairy',
        isRegex: false,
        caseSensitive: false,
        enabled: false, // Context dependent
        description: 'Common confusion: diary vs dairy',
        examples: ['I need diary products', 'diary farm']
      },
      {
        misspelling: 'angel',
        correction: 'angle',
        isRegex: false,
        caseSensitive: false,
        enabled: false, // Context dependent
        description: 'Common confusion: angel vs angle',
        examples: ['Draw a 90-degree angel', 'The angel is sharp']
      }
    ]
  },

  // === BRITISH VS AMERICAN SPELLING ===
  {
    id: 'brit-american',
    name: 'British vs American Spelling',
    description: 'Convert between British and American spellings',
    category: 'Regional Variants',
    difficulty: 'intermediate',
    rules: [
      {
        misspelling: 'colour',
        correction: 'color',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'British to American: colour → color',
        examples: ['What colour is it?', 'My favourite colour']
      },
      {
        misspelling: 'favour',
        correction: 'favor',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'British to American: favour → favor',
        examples: ['Do me a favour', 'I favour this option']
      },
      {
        misspelling: 'realise',
        correction: 'realize',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'British to American: realise → realize',
        examples: ['I realise now', 'Did you realise that?']
      },
      {
        misspelling: 'centre',
        correction: 'center',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'British to American: centre → center',
        examples: ['The town centre', 'In the centre of the room']
      },
      {
        misspelling: 'theatre',
        correction: 'theater',
        isRegex: false,
        caseSensitive: false,
        enabled: true,
        description: 'British to American: theatre → theater',
        examples: ['Go to the theatre', 'The theatre district']
      }
    ]
  }
];

export function getTemplatesByCategory(): Record<string, RuleTemplate[]> {
  const categories: Record<string, RuleTemplate[]> = {};
  
  PHONETIC_TEMPLATES.forEach(template => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  });
  
  return categories;
}

export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): RuleTemplate[] {
  return PHONETIC_TEMPLATES.filter(template => template.difficulty === difficulty);
}

export function searchTemplates(query: string): RuleTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return PHONETIC_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery) ||
    template.rules.some(rule => 
      rule.misspelling.toLowerCase().includes(lowercaseQuery) ||
      rule.correction.toLowerCase().includes(lowercaseQuery) ||
      rule.description?.toLowerCase().includes(lowercaseQuery)
    )
  );
}

export function getTotalRulesInTemplate(template: RuleTemplate): number {
  return template.rules.length;
}

export function getTotalRulesInAllTemplates(): number {
  return PHONETIC_TEMPLATES.reduce((total, template) => total + template.rules.length, 0);
}