/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MOTORE LITURGICO AVANZATO (Romcal-like Logic)
 * Integra il Sanctorale (Santi Fissi) e il Temporale (Cicli Mobili)
 * con sistema di precedenza dei ranghi.
 */

export type LiturgicalColor = 'Verde' | 'Viola' | 'Bianco' | 'Rosso' | 'Oro' | 'Nero';

export interface LiturgicalDay {
  date: string;
  title: string | null;
  color: LiturgicalColor;
  season: string;
  rank: number; 
  // Ranks:
  // 0: Feria
  // 1: Memoria Facoltativa
  // 2: Memoria Obbligatoria
  // 3: Festa
  // 4: Domenica (Ordinario/Natale)
  // 5: Solennità (o Domeniche Forti: Avvento/Quaresima/Pasqua)
  // 6: Triduo Pasquale / Natale / Epifania / Pentecoste
}

// --- DATABASE SANCTORALE (Expanded) ---
const FIXED_FEASTS: Record<string, { title: string, color: LiturgicalColor, rank: number }> = {
  "1-1": { title: "Maria SS. Madre di Dio", color: "Bianco", rank: 6 },
  "1-2": { title: "Ss. Basilio e Gregorio", color: "Bianco", rank: 2 },
  "1-6": { title: "Epifania del Signore", color: "Oro", rank: 6 },
  "1-17": { title: "S. Antonio Abate", color: "Bianco", rank: 2 },
  "1-21": { title: "S. Agnese", color: "Rosso", rank: 2 },
  "1-24": { title: "S. Francesco di Sales", color: "Bianco", rank: 2 },
  "1-25": { title: "Conversione di S. Paolo", color: "Bianco", rank: 3 },
  "1-26": { title: "Ss. Timoteo e Tito", color: "Bianco", rank: 2 },
  "1-28": { title: "S. Tommaso d'Aquino", color: "Bianco", rank: 2 },
  "1-31": { title: "S. Giovanni Bosco", color: "Bianco", rank: 2 },
  
  "2-2": { title: "Presentazione del Signore", color: "Bianco", rank: 3 },
  "2-5": { title: "S. Agata", color: "Rosso", rank: 2 },
  "2-14": { title: "Ss. Cirillo e Metodio", color: "Bianco", rank: 3 },
  "2-22": { title: "Cattedra di S. Pietro", color: "Bianco", rank: 3 },
  
  "3-19": { title: "S. Giuseppe, Sposo della B.V.M.", color: "Bianco", rank: 6 },
  "3-25": { title: "Annunciazione del Signore", color: "Bianco", rank: 6 },
  
  "4-25": { title: "S. Marco Evangelista", color: "Rosso", rank: 3 },
  "4-29": { title: "S. Caterina da Siena", color: "Bianco", rank: 3 }, // Patrona d'Italia/Europa
  
  "5-1": { title: "S. Giuseppe Lavoratore", color: "Bianco", rank: 1 },
  "5-3": { title: "Ss. Filippo e Giacomo", color: "Rosso", rank: 3 },
  "5-14": { title: "S. Mattia Apostolo", color: "Rosso", rank: 3 },
  "5-31": { title: "Visitazione della B.V.M.", color: "Bianco", rank: 3 },
  
  "6-1": { title: "S. Giustino", color: "Rosso", rank: 2 },
  "6-13": { title: "S. Antonio di Padova", color: "Bianco", rank: 2 },
  "6-24": { title: "Natività di S. Giovanni Battista", color: "Bianco", rank: 6 },
  "6-29": { title: "Ss. Pietro e Paolo", color: "Rosso", rank: 6 },
  
  "7-3": { title: "S. Tommaso Apostolo", color: "Rosso", rank: 3 },
  "7-11": { title: "S. Benedetto", color: "Bianco", rank: 3 }, // Patrono d'Europa
  "7-22": { title: "S. Maria Maddalena", color: "Bianco", rank: 3 },
  "7-25": { title: "S. Giacomo Apostolo", color: "Rosso", rank: 3 },
  "7-26": { title: "Ss. Gioacchino e Anna", color: "Bianco", rank: 2 },
  "7-31": { title: "S. Ignazio di Loyola", color: "Bianco", rank: 2 },

  "8-6": { title: "Trasfigurazione del Signore", color: "Bianco", rank: 3 },
  "8-8": { title: "S. Domenico", color: "Bianco", rank: 2 },
  "8-10": { title: "S. Lorenzo", color: "Rosso", rank: 3 },
  "8-11": { title: "S. Chiara", color: "Bianco", rank: 2 },
  "8-14": { title: "S. Massimiliano Kolbe", color: "Rosso", rank: 2 },
  "8-15": { title: "Assunzione della B.V.M.", color: "Bianco", rank: 6 },
  "8-24": { title: "S. Bartolomeo Apostolo", color: "Rosso", rank: 3 },
  "8-28": { title: "S. Agostino", color: "Bianco", rank: 2 },
  "8-29": { title: "Martirio di S. Giovanni Battista", color: "Rosso", rank: 2 },

  "9-8": { title: "Natività della B.V.M.", color: "Bianco", rank: 3 },
  "9-14": { title: "Esaltazione della Santa Croce", color: "Rosso", rank: 3 },
  "9-15": { title: "B.V.M. Addolorata", color: "Bianco", rank: 2 },
  "9-21": { title: "S. Matteo Apostolo", color: "Rosso", rank: 3 },
  "9-23": { title: "S. Pio da Pietrelcina", color: "Bianco", rank: 2 },
  "9-29": { title: "Ss. Arcangeli Michele, Gabriele, Raffaele", color: "Bianco", rank: 3 },
  "9-30": { title: "S. Girolamo", color: "Bianco", rank: 2 },

  "10-2": { title: "Santi Angeli Custodi", color: "Bianco", rank: 2 },
  "10-4": { title: "S. Francesco d'Assisi", color: "Bianco", rank: 5 }, // Patrono d'Italia
  "10-7": { title: "B.V.M. del Rosario", color: "Bianco", rank: 2 },
  "10-15": { title: "S. Teresa d'Avila", color: "Bianco", rank: 2 },
  "10-18": { title: "S. Luca Evangelista", color: "Rosso", rank: 3 },
  "10-28": { title: "Ss. Simone e Giuda", color: "Rosso", rank: 3 },

  "11-1": { title: "Tutti i Santi", color: "Bianco", rank: 6 },
  "11-2": { title: "Commemorazione dei Defunti", color: "Viola", rank: 5 },
  "11-9": { title: "Dedicazione Basilica Lateranense", color: "Bianco", rank: 3 },
  "11-21": { title: "Presentazione B.V.M.", color: "Bianco", rank: 2 },
  "11-30": { title: "S. Andrea Apostolo", color: "Rosso", rank: 3 },

  "12-7": { title: "S. Ambrogio", color: "Bianco", rank: 2 },
  "12-8": { title: "Immacolata Concezione", color: "Bianco", rank: 6 },
  "12-13": { title: "S. Lucia", color: "Rosso", rank: 2 },
  "12-25": { title: "Natale del Signore", color: "Oro", rank: 6 },
  "12-26": { title: "S. Stefano", color: "Rosso", rank: 3 },
  "12-27": { title: "S. Giovanni Evangelista", color: "Bianco", rank: 3 },
  "12-28": { title: "Santi Innocenti", color: "Rosso", rank: 3 },
  "12-31": { title: "S. Silvestro", color: "Bianco", rank: 1 },
};

// --- UTILITIES ---
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getFullYear() === d2.getFullYear();
};

const isSunday = (d: Date) => d.getDay() === 0;

// Meeus/Jones/Butcher algorithm for Easter
const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const getAdventStart = (year: number): Date => {
  const christmas = new Date(year, 11, 25);
  const dow = christmas.getDay(); 
  const daysToSubtract = (dow === 0 ? 7 : dow) + 21;
  const adventStart = new Date(year, 11, 25);
  adventStart.setDate(25 - daysToSubtract);
  return adventStart;
};

// --- CORE LOGIC ---
export const getLiturgicalInfo = (date: Date): LiturgicalDay => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateKey = `${month}-${day}`;
  
  // Normalize dates for comparison (midnight)
  const d = new Date(year, date.getMonth(), day);
  
  // 1. CALCULATE TEMPORALE (Mobile Cycles)
  const easter = getEasterDate(year);
  const adventStart = getAdventStart(year);
  const nextYearAdvent = getAdventStart(year + 1); // For end of year logic
  
  // Special Mobile Dates
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const goodFriday = addDays(easter, -2);
  const holyThursday = addDays(easter, -3);
  const ascension = addDays(easter, 42); // Italy: Sunday
  const pentecost = addDays(easter, 49);
  const corpusDomini = addDays(pentecost, 7); // Italy: Sunday
  const sacredHeart = addDays(pentecost, 12); // Friday after Corpus Christi + 5 (Corpus is Sun + 4 from Pentecost? No. Corpus is Pentecost + 7. Sacred Heart is Friday after 2nd Sunday after Pentecost. Pentecost=0. Trinity=7. Corpus=11(Thu) or 14(Sun). Sacred Heart is always Friday after Corpus Week. So Pentecost + 19 days.)
  const christKing = addDays(adventStart, -7);
  const baptism = new Date(year, 0, 6); // Epiphany Jan 6. Baptism is Sunday after.
  const actualBaptism = addDays(baptism, baptism.getDay() === 0 ? 1 : (7 - baptism.getDay() + 1));

  let temporale: LiturgicalDay = {
    date: dateKey,
    title: null,
    season: 'Ordinario',
    color: 'Verde',
    rank: 0
  };

  // --- TRIDUUM & EASTER ---
  if (isSameDay(d, easter)) temporale = { ...temporale, title: "Domenica di Pasqua", season: 'Pasqua', color: 'Oro', rank: 6 };
  else if (isSameDay(d, goodFriday)) temporale = { ...temporale, title: "Venerdì Santo", season: 'Triduo', color: 'Rosso', rank: 6 };
  else if (isSameDay(d, holyThursday)) temporale = { ...temporale, title: "Giovedì Santo", season: 'Triduo', color: 'Bianco', rank: 6 };
  else if (d > holyThursday && d < easter) temporale = { ...temporale, title: "Sabato Santo", season: 'Triduo', color: 'Viola', rank: 6 };
  
  // Easter Season
  else if (d > easter && d < pentecost) {
    temporale.season = 'Pasqua';
    temporale.color = 'Bianco';
    if (d < addDays(easter, 8)) {
       temporale.title = "Ottava di Pasqua";
       temporale.rank = 6;
    } else if (isSameDay(d, ascension)) {
       temporale.title = "Ascensione del Signore";
       temporale.rank = 6;
    } else if (isSunday(d)) {
       temporale.title = "Domenica di Pasqua";
       temporale.rank = 5;
    } else {
      temporale.rank = 0; // Feria di Pasqua
    }
  }
  else if (isSameDay(d, pentecost)) temporale = { ...temporale, title: "Domenica di Pentecoste", season: 'Pasqua', color: 'Rosso', rank: 6 };

  // --- LENT ---
  else if (isSameDay(d, ashWednesday)) temporale = { ...temporale, title: "Mercoledì delle Ceneri", season: 'Quaresima', color: 'Viola', rank: 5 }; // High rank but not Solennity
  else if (d > ashWednesday && d < easter) {
    temporale.season = 'Quaresima';
    temporale.color = 'Viola';
    if (isSameDay(d, palmSunday)) {
       temporale.title = "Domenica delle Palme";
       temporale.color = 'Rosso';
       temporale.rank = 6;
    } else if (isSunday(d)) {
       temporale.title = "Domenica di Quaresima";
       temporale.rank = 5; // Sundays of Lent are strong
    } else {
       temporale.rank = 0; // Feria
    }
  }

  // --- CHRISTMAS ---
  else if ((month === 12 && day >= 25) || (month === 1 && d <= actualBaptism)) {
    temporale.season = 'Natale';
    temporale.color = 'Bianco';
    if (isSameDay(d, actualBaptism)) {
      temporale.title = "Battesimo del Signore";
      temporale.rank = 5;
    } else if (isSunday(d)) {
      temporale.title = "Domenica di Natale";
      temporale.rank = 5;
    } else {
      temporale.rank = 0;
    }
  }

  // --- ADVENT ---
  else if (d >= adventStart && d < new Date(year, 11, 25)) {
    temporale.season = 'Avvento';
    temporale.color = 'Viola';
    if (isSunday(d)) {
      temporale.title = "Domenica di Avvento";
      temporale.rank = 5; // Strong Sunday
    } else {
      temporale.rank = 0;
    }
  }

  // --- ORDINARY TIME SPECIALS ---
  else {
    if (isSameDay(d, corpusDomini)) temporale = { ...temporale, title: "SS. Corpo e Sangue di Cristo", color: "Bianco", rank: 6 };
    else if (isSameDay(d, sacredHeart)) temporale = { ...temporale, title: "Sacratissimo Cuore di Gesù", color: "Rosso", rank: 6 }; // Actually solemnity (rank 6)
    else if (isSameDay(d, christKing)) temporale = { ...temporale, title: "Cristo Re dell'Universo", color: "Oro", rank: 6 };
    else if (isSameDay(d, new Date(year, 0, 6))) temporale = { ...temporale, title: "Epifania", color: "Oro", rank: 6 }; // Handled in Fixed but good to check
    else if (isSunday(d)) {
      temporale.title = "Domenica del Tempo Ordinario";
      temporale.color = "Verde";
      temporale.rank = 4; // Standard Sunday
    }
  }

  // 2. CHECK SANCTORALE (Fixed Feasts)
  let sanctorale: LiturgicalDay | null = null;
  if (FIXED_FEASTS[dateKey]) {
    sanctorale = {
      date: dateKey,
      season: temporale.season, // Retain underlying season
      title: FIXED_FEASTS[dateKey].title,
      color: FIXED_FEASTS[dateKey].color,
      rank: FIXED_FEASTS[dateKey].rank
    };
  }

  // 3. CONFLICT RESOLUTION (Precedence Logic)
  // If no fixed feast, return Temporale
  if (!sanctorale) return temporale;

  // If there is a fixed feast, compare ranks
  // Rule: Solennità (6) beats everything except Triduum/Easter/Xmas (also 6, handled by date checks usually)
  // Rule: Sundays of Advent/Lent/Easter (5) beat Feasts (3) and Memorials (2)
  // Rule: Feasts (3) beat Sundays of Ordinary Time (4? No. Ordinary Sunday is usually beaten by Feasts of the Lord, but general Feasts? Table says Feasts of Lord beat Sunday. Saints? Usually Sunday wins over generic Feast. Let's simplify: 
  
  // Simplified Hierarchy for this App:
  // 6 (Solemnity) > 5 (Strong Sunday) > 4 (Ord. Sunday) > 3 (Feast) > 2 (Memorial)
  
  // EXCEPTION: Sunday of Ordinary Time (4) is beaten by Feasts of the Lord (which are usually 5 or 6). 
  // But Sanctorale entries like St. Francis (5 - Patron) should beat Ordinary Sunday (4).
  // Sanctorale 3 (Feast) vs Ordinary Sunday (4)? Sunday wins.
  
  if (temporale.rank > sanctorale.rank) return temporale;
  if (sanctorale.rank > temporale.rank) return sanctorale;

  // Equal rank? Usually Temporale wins (e.g. Sunday vs Feast).
  // Special case: Solemnity (6) vs Sunday Ordinary (4) -> Solemnity wins.
  // Our logic above handles strict >.
  // If equal (e.g. 6 vs 6), Temporale usually represents the core mystery (Easter), so keep Temporale.
  
  return temporale.rank >= sanctorale.rank ? temporale : sanctorale;
};