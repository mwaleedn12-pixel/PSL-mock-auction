# PSL 12 Automated Mock Auction Management System

A web-based real-time automated cricket auction management platform for conducting virtual PSL 12 player auctions with multi-franchise owners.

![PSL 12 Mock Auction](https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80)

---

## 🏏 Key Features

- **Automated Live Auction Engine**:
  - Server-synchronized countdown timer with automatic last-second bid extensions (+5s on bids within 5s).
  - State machine: Draft → Configuration → Ready → Live → Paused → Completed.
  - Automatic sold finalization to highest valid bidder upon timer expiration.
  - Automatic unsold classification when no valid bids are placed.
  - Real-time cross-tab synchronization (`BroadcastChannel` & state persistence).

- **Realistic Bidding Rules & Validation (FR-07, FR-10)**:
  - Minimum bid increment brackets (5 Lakh, 10 Lakh, 25 Lakh, 50 Lakh).
  - Minimum reserve purse enforcement: guarantees team retains enough budget to complete minimum squad size (`16`).
  - Maximum squad capacity (`20`) & maximum overseas player (`6`) limits strictly enforced.
  - Quick increment buttons (+10L, +25L, +50L) and custom bid placements.

- **Franchise Skip / Pass & Out Functionality (FR-09)**:
  - **Skip / Pass**: Temporarily skip bidding on current player (can re-enter before sale).
  - **Out / Withdraw**: Permanently withdraw from current player's auction.
  - **Automatic Early Finalization**: If all non-leading franchises withdraw, system sells to the leading bidder immediately without waiting for timer expiry!
  - Leading bidder withdrawal protection: Leading team cannot withdraw from its own bid.

- **Pre-Auction Retentions & Direct Signings (FR-15)**:
  - Assign star players to franchises before live bidding begins.
  - Automatically updates squad count and deducts contract value from initial purse.

- **Unsold Players Round 2 (FR-14)**:
  - One-click trigger for a second round of auctions for unsold players with 20% discount.

- **Multi-Format Player Document Extraction (FR-03)**:
  - Extracts player records from CSV, Excel (.xlsx/.xls), JSON, TXT, and scanned formats.
  - Automatic column recognition for Name, Category, Role, Base Price, and Nationality.
  - In-flight duplicate detection and editable table review before approving import.

- **Squad Management & Interactive Playing XI Builder (FR-12)**:
  - Interactive green turf cricket field visualizer.
  - Designate Captain (C) and Vice-Captain (VC).
  - 4 Overseas players in playing XI rule enforcement.

- **Trade Centre (FR-16)**:
  - Player-for-player and player-plus-money trades between franchises with Administrator approval workflow.

- **Audio & Voice Announcer Engine**:
  - Web Audio API synthesizer: Electronic bid chimes, outbid alert, last-seconds urgent countdown ticking, and realistic wooden gavel strike sound.
  - Web Speech API voice announcements: "Player sold to Lahore Qalandars for 3.5 Crore!"

- **Analytics & Comparisons (FR-17, FR-18, FR-19)**:
  - Recharts: Purse spent vs remaining, spending by category, domestic vs overseas investment, playing role expenditures, and top expensive signings.

- **Final Reports & Export (FR-21, FR-22)**:
  - Multi-sheet Excel workbook (.xlsx) export.
  - Full CSV export.
  - Formatted PDF download.
  - Real-time searchable activity audit log.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Spreadsheets & Data**: SheetJS (XLSX), PapaParse
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **Celebration Effects**: Canvas Confetti
- **Audio**: Web Audio API & Web Speech Synthesis

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v24)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "PSL mock Auction"

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete PSL 12 automated mock auction manager"
   git remote add origin https://github.com/<your-username>/psl-12-mock-auction-manager.git
   git push -u origin main
   ```
2. Import the repository in [Vercel](https://vercel.com/new).
3. Framework Preset will automatically detect **Next.js**.
4. Click **Deploy**!

---

## 📄 License

MIT License. Prepared for PSL 12 Mock Auction.

