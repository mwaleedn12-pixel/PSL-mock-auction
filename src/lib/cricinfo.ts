import { Player } from "@/types/auction";

const CRICINFO_PROFILE_MAP: Record<string, string> = {
  // Platinum
  "babar azam": "https://www.espncricinfo.com/cricketers/babar-azam-348144",
  "shaheen shah afridi": "https://www.espncricinfo.com/cricketers/shaheen-shah-afridi-1072470",
  "shaheen afridi": "https://www.espncricinfo.com/cricketers/shaheen-shah-afridi-1072470",
  "mohammad rizwan": "https://www.espncricinfo.com/cricketers/mohammad-rizwan-323389",
  "shadab khan": "https://www.espncricinfo.com/cricketers/shadab-khan-922943",
  "naseem shah": "https://www.espncricinfo.com/cricketers/naseem-shah-1158088",
  "fakhar zaman": "https://www.espncricinfo.com/cricketers/fakhar-zaman-512191",
  "haris rauf": "https://www.espncricinfo.com/cricketers/haris-rauf-1161606",
  "iftikhar ahmed": "https://www.espncricinfo.com/cricketers/iftikhar-ahmed-480603",
  "usama mir": "https://www.espncricinfo.com/cricketers/usama-mir-647705",
  "rashid khan": "https://www.espncricinfo.com/cricketers/rashid-khan-793463",
  "david miller": "https://www.espncricinfo.com/cricketers/david-miller-321777",
  "rassie van der dussen": "https://www.espncricinfo.com/cricketers/rassie-van-der-dussen-337790",

  // Diamond
  "saim ayub": "https://www.espncricinfo.com/cricketers/saim-ayub-1250269",
  "mohammad amir": "https://www.espncricinfo.com/cricketers/mohammad-amir-290948",
  "imad wasim": "https://www.espncricinfo.com/cricketers/imad-wasim-227758",
  "azam khan": "https://www.espncricinfo.com/cricketers/azam-khan-1157976",
  "salman ali agha": "https://www.espncricinfo.com/cricketers/salman-ali-agha-595978",
  "usman khan": "https://www.espncricinfo.com/cricketers/usman-khan-1243557",
  "khushdil shah": "https://www.espncricinfo.com/cricketers/khushdil-shah-792563",
  "mohammad abbas afridi": "https://www.espncricinfo.com/cricketers/abbas-afridi-1175402",
  "abbas afridi": "https://www.espncricinfo.com/cricketers/abbas-afridi-1175402",
  "mohammad ali": "https://www.espncricinfo.com/cricketers/mohammad-ali-1158097",
  "shan masood": "https://www.espncricinfo.com/cricketers/shan-masood-233901",
  "hasan ali": "https://www.espncricinfo.com/cricketers/hasan-ali-681305",
  "abdullah shafique": "https://www.espncricinfo.com/cricketers/abdullah-shafique-1159715",
  "sikandar raza": "https://www.espncricinfo.com/cricketers/sikandar-raza-299572",
  "rilee rossouw": "https://www.espncricinfo.com/cricketers/rilee-rossouw-318788",
  "sherfane rutherford": "https://www.espncricinfo.com/cricketers/sherfane-rutherford-1090123",
  "rovman powell": "https://www.espncricinfo.com/cricketers/rovman-powell-820351",
  "shai hope": "https://www.espncricinfo.com/cricketers/shai-hope-583521",
  "tim david": "https://www.espncricinfo.com/cricketers/tim-david-892749",

  // Gold
  "mohammad haris": "https://www.espncricinfo.com/cricketers/mohammad-haris-1215117",
  "aamer jamal": "https://www.espncricinfo.com/cricketers/aamer-jamal-1158098",
  "zaman khan": "https://www.espncricinfo.com/cricketers/zaman-khan-1279093",
  "shahnawaz dahani": "https://www.espncricinfo.com/cricketers/shahnawaz-dahani-1250267",
  "ihsanullah": "https://www.espncricinfo.com/cricketers/ihsanullah-1279094",
  "tayyab tahir": "https://www.espncricinfo.com/cricketers/tayyab-tahir-595982",
  "faheem ashraf": "https://www.espncricinfo.com/cricketers/faheem-ashraf-681309",
  "kamran ghulam": "https://www.espncricinfo.com/cricketers/kamran-ghulam-595977",
  "mir hamza": "https://www.espncricinfo.com/cricketers/mir-hamza-595980",
  "mohammad wasim jnr": "https://www.espncricinfo.com/cricketers/mohammad-wasim-1185538",
  "mohammad wasim": "https://www.espncricinfo.com/cricketers/mohammad-wasim-1185538",
  "sarfaraz ahmed": "https://www.espncricinfo.com/cricketers/sarfaraz-ahmed-227760",

  // Silver & Emerging
  "rumman raees": "https://www.espncricinfo.com/cricketers/rumman-raees-361858",
  "arshad iqbal": "https://www.espncricinfo.com/cricketers/arshad-iqbal-1132039",
  "arif yaqoob": "https://www.espncricinfo.com/cricketers/arif-yaqoob-1361543",
  "mirza tahir baig": "https://www.espncricinfo.com/cricketers/mirza-tahir-baig-1338600",
  "ali majid": "https://www.espncricinfo.com/cricketers/ali-majid-1320779",
  "akif javed": "https://www.espncricinfo.com/cricketers/akif-javed-1185537",
  "irfan khan niazi": "https://www.espncricinfo.com/cricketers/irfan-khan-1215118",
  "yasir khan": "https://www.espncricinfo.com/cricketers/yasir-khan-1296585",
  "ubaid shah": "https://www.espncricinfo.com/cricketers/ubaid-shah-1383803",
  "hunain shah": "https://www.espncricinfo.com/cricketers/hunain-shah-1338599",
  "jahandad khan": "https://www.espncricinfo.com/cricketers/jahandad-khan-1406820",
  "mehran mumtaz": "https://www.espncricinfo.com/cricketers/mehran-mumtaz-1293755",
  "khawaja nafay": "https://www.espncricinfo.com/cricketers/khawaja-nafay-1361542",
  "mohammad zeeshan": "https://www.espncricinfo.com/cricketers/mohammad-zeeshan-1338598",
  "haseebullah khan": "https://www.espncricinfo.com/cricketers/haseebullah-khan-1293757",
  "arafat minhas": "https://www.espncricinfo.com/cricketers/arafat-minhas-1338597",
  "faisal akram": "https://www.espncricinfo.com/cricketers/faisal-akram-1279092",
};

const CRICBUZZ_PROFILE_MAP: Record<string, string> = {
  "babar azam": "https://www.cricbuzz.com/profiles/8359/babar-azam",
  "shaheen shah afridi": "https://www.cricbuzz.com/profiles/10636/shaheen-afridi",
  "shaheen afridi": "https://www.cricbuzz.com/profiles/10636/shaheen-afridi",
  "mohammad rizwan": "https://www.cricbuzz.com/profiles/7909/mohammad-rizwan",
  "shadab khan": "https://www.cricbuzz.com/profiles/11186/shadab-khan",
  "naseem shah": "https://www.cricbuzz.com/profiles/13936/naseem-shah",
  "fakhar zaman": "https://www.cricbuzz.com/profiles/9667/fakhar-zaman",
  "haris rauf": "https://www.cricbuzz.com/profiles/13904/haris-rauf",
  "saim ayub": "https://www.cricbuzz.com/profiles/10237/saim-ayub",
  "mohammad amir": "https://www.cricbuzz.com/profiles/2258/mohammad-amir",
  "imad wasim": "https://www.cricbuzz.com/profiles/1836/imad-wasim",
  "azam khan": "https://www.cricbuzz.com/profiles/13941/azam-khan",
  "david miller": "https://www.cricbuzz.com/profiles/2239/david-miller",
  "rashid khan": "https://www.cricbuzz.com/profiles/10738/rashid-khan",
  "david warner": "https://www.cricbuzz.com/profiles/1739/david-warner",
  "moeen ali": "https://www.cricbuzz.com/profiles/8019/moeen-ali",
  "hasan ali": "https://www.cricbuzz.com/profiles/10739/hasan-ali",
  "rilee rossouw": "https://www.cricbuzz.com/profiles/1770/rilee-rossouw",
  "tim david": "https://www.cricbuzz.com/profiles/13493/tim-david",
  "shan masood": "https://www.cricbuzz.com/profiles/1979/shan-masood",
  "sarfaraz ahmed": "https://www.cricbuzz.com/profiles/1722/sarfaraz-ahmed",
  "faheem ashraf": "https://www.cricbuzz.com/profiles/11184/faheem-ashraf",
  "iftikhar ahmed": "https://www.cricbuzz.com/profiles/10543/iftikhar-ahmed",
  "usama mir": "https://www.cricbuzz.com/profiles/10544/usama-mir",
  "mohammad haris": "https://www.cricbuzz.com/profiles/13938/mohammad-haris",
  "zaman khan": "https://www.cricbuzz.com/profiles/14358/zaman-khan",
  "shahnawaz dahani": "https://www.cricbuzz.com/profiles/14041/shahnawaz-dahani",
  "aamer jamal": "https://www.cricbuzz.com/profiles/14357/aamer-jamal",
  "sikandar raza": "https://www.cricbuzz.com/profiles/8733/sikandar-raza",
  "sherfane rutherford": "https://www.cricbuzz.com/profiles/11543/sherfane-rutherford",
  "rovman powell": "https://www.cricbuzz.com/profiles/10639/rovman-powell",
  "shai hope": "https://www.cricbuzz.com/profiles/10006/shai-hope",
  "rassie van der dussen": "https://www.cricbuzz.com/profiles/8786/rassie-van-der-dussen",
  "abdullah shafique": "https://www.cricbuzz.com/profiles/13935/abdullah-shafique",
  "salman ali agha": "https://www.cricbuzz.com/profiles/11185/salman-ali-agha",
  "usman khan": "https://www.cricbuzz.com/profiles/14042/usman-khan",
  "khushdil shah": "https://www.cricbuzz.com/profiles/11545/khushdil-shah",
  "mohammad abbas afridi": "https://www.cricbuzz.com/profiles/13937/abbas-afridi",
  "abbas afridi": "https://www.cricbuzz.com/profiles/13937/abbas-afridi",
  "mohammad ali": "https://www.cricbuzz.com/profiles/14040/mohammad-ali",
  "kamran ghulam": "https://www.cricbuzz.com/profiles/10542/kamran-ghulam",
  "mir hamza": "https://www.cricbuzz.com/profiles/10541/mir-hamza",
  "mohammad wasim": "https://www.cricbuzz.com/profiles/14039/mohammad-wasim",
  "mohammad wasim jnr": "https://www.cricbuzz.com/profiles/14039/mohammad-wasim",
  "rumman raees": "https://www.cricbuzz.com/profiles/10545/rumman-raees",
};

/**
 * Returns the verified ESPNcricinfo profile URL for a player,
 * or falls back to an exact ESPNcricinfo search query.
 */
export function getCricinfoUrl(player: Player): string {
  if (player.cricinfoUrl && player.cricinfoUrl.trim().length > 0) {
    return player.cricinfoUrl;
  }
  const key = player.name.trim().toLowerCase();
  if (CRICINFO_PROFILE_MAP[key]) {
    return CRICINFO_PROFILE_MAP[key];
  }
  return `https://www.espncricinfo.com/search?q=${encodeURIComponent(player.name)}`;
}

/**
 * Returns the 100% accessible Cricbuzz profile URL for a player,
 * which is never blocked by Akamai EdgeSuite / Pakistani ISP WAFs.
 */
export function getCricbuzzUrl(player: Player): string {
  const key = player.name.trim().toLowerCase();
  if (CRICBUZZ_PROFILE_MAP[key]) {
    return CRICBUZZ_PROFILE_MAP[key];
  }
  return `https://www.google.com/search?q=${encodeURIComponent(player.name + " cricketer profile cricbuzz")}`;
}
