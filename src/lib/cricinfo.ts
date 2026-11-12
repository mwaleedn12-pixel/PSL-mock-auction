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
