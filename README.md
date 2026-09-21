# MediShield AI — Fake Medicine Detection & Drug Interaction Assistant

MediShield AI is a state-of-the-art AI-powered pharmaceutical safety platform designed to combat counterfeit medicines, analyze drug interactions, assess addiction risks, detect human/non-medicine image uploads, and provide instant **Online AI Doctor Assistance**.

---

## 🌟 Key Features

1. **AI Vision Image Classification & Human Photo Detection**:
   - Detects whether an uploaded photo is a genuine medical product (pill bottle, strip, box, label) or a non-medicine photo (e.g. human face, person, or generic object).
   - Provides clear feedback explaining why non-medicine images cannot be verified and guides users to upload a clear pharmaceutical package photo.

2. **Online AI Doctor Assistance**:
   - Interactive 24/7 AI Doctor Consultation assistant (`/ai-doctor`).
   - Automatically connects users when a medicine is flagged as suspicious, harmful, recalled, or having severe drug interactions.
   - Offers medical triage, emergency warning alerts, side-effect advice, and safe medication alternatives.

3. **Medicine Verification & Scanner**:
   - Combines Barcode/NDC lookup, OCR text recognition, and OpenFDA & NLM RxNorm databases.
   - Detects suspicious indicators, lot/batch discrepancies, altered text, and missing label elements.

4. **Multi-Drug Interaction Checker**:
   - Analyzes potential interactions across multiple concurrent medications.
   - Evaluates pharmacological mechanisms and rates overall severity (mild, moderate, severe).

5. **Addiction & Dependency Risk Engine**:
   - Cross-references medicines against US DEA Controlled Substances Schedules and pharmacology datasets.
   - Provides dependency risk levels (low, moderate, high), drug class details, and safety warnings.

---

## 🚀 How to Run the Code Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
Open a terminal in the root project directory (`MediShield-AI`) and run:
```bash
npm run install:all
```
*This command automatically installs dependencies for the root, frontend client, and backend server.*

### Step 2: Start Development Mode
In the root project directory, run:
```bash
npm run dev
```
- **Backend API**: `http://localhost:3001`
- **Frontend App**: `http://localhost:5173`

Open `http://localhost:5173` in your browser to access MediShield AI!

### Step 3: Build for Production (Optional)
To create production bundles for both client and server:
```bash
npm run build
```

---

## 📤 How to Push to GitHub (Submission Link Guide)

Follow these step-by-step instructions to push this complete project to your GitHub account and generate your submission link:

### Step 1: Create a New Repository on GitHub
1. Go to [GitHub.com](https://github.com) and click the **`+`** icon in the top right corner, then select **New repository**.
2. Name your repository `MediShield-AI`.
3. Choose **Public** (recommended for project submissions) or Private.
4. **Do NOT** check "Add a README file", ".gitignore", or "Choose a license" (the project already includes them).
5. Click **Create repository**.

### Step 2: Link & Push from Your Local Terminal
Open your terminal in the `MediShield-AI` folder and run the following commands (replace `YOUR_GITHUB_USERNAME` with your actual GitHub username):

```bash
# Set your remote origin URL
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/MediShield-AI.git

# Set default branch name to main
git branch -M main

# Push all files to GitHub
git push -u origin main
```

### Step 3: Copy Your Usable Submission Link
Once pushed, your usable project submission link will be:
`https://github.com/YOUR_GITHUB_USERNAME/MediShield-AI`

---

## 🛠 Project Structure

```
MediShield-AI/
├── client/                      # React + TypeScript + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components & layouts
│   │   ├── pages/               # Application pages (Scanner, Verification, AI Doctor, etc.)
│   │   ├── services/            # API integration layer
│   │   ├── stores/              # Zustand auth & app state
│   │   └── types/               # TypeScript interfaces
│   └── package.json
├── server/                      # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── data/                # Pharmacology, interaction, & safety databases
│   │   ├── middleware/          # JWT Auth & error handling
│   │   ├── routes/              # Express API endpoints (/api/ai, /api/medicine, etc.)
│   │   └── services/            # AI Vision, Doctor Assistant, NDC, RxNorm, OpenFDA
│   └── package.json
└── package.json                 # Root orchestration scripts
```

---

## 📜 Disclaimer
*MediShield AI is designed for educational and decision-support purposes. It is not a substitute for professional medical advice, pharmacist verification, or emergency medical care.*
