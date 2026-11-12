# PLAYER IMPORT & ENRICHMENT PROTOCOL (MANDATORY RULE)

> **Core Requirement:**
> Whenever the USER provides a file in ANY format (Excel, CSV, PDF, Word DOCX, Image Scan, Text, JSON) containing player names:
> 1. Extract and parse player names, categories, roles, base prices, ages, and nationalities.
> 2. **CRICKETER PICTURE EXTRACTION (MANDATORY):** For every extracted player name, search for their authentic cricketer picture/portrait from verified web sources (ICC, PCB, Wikimedia Commons, ESPNcricinfo, Cricket Australia).
> 3. Save/download the picture locally to `public/images/players/` (or assign a verified, reliable high-res profile headshot URL). Never use generic, unrelated stock model photos.
> 4. Assign their verified PSL career stats (if they previously played in PSL) or overall T20 career stats (if debutant).
> 5. Link their official **ESPNcricinfo** player profile so that clicking their player card in the UI directly opens their ESPNcricinfo page.
> 6. Add them to the active players database in `src/data/initialPlayers.ts` and auction pool state.

