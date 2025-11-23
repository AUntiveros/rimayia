# RimiApp - Virtual Health Ecosystem

## Project Overview

RimiApp is a Progressive Web Application (PWA) and native mobile application designed to provide comprehensive virtual health assistance through intelligent triage, medication management, and health community engagement. The application serves as the frontend interface for Rimac's digital health ecosystem.

### Technology Stack

- **Framework**: React 18.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: TailwindCSS 3.4.17
- **Animations**: Framer Motion 12.23.24
- **Routing**: React Router DOM 7.9.6
- **Mobile**: Capacitor 7.4.4
- **Target Platforms**: Web (PWA), Android

### Key Features

- **Intelligent Triage System**: Symptom-based routing to appropriate care channels
- **Virtual Assistant (Rimi)**: Conversational AI with text and voice modes
- **Medication Management**: HL7 interoperability for prescription import
- **Geofencing**: Location-based reimbursement workflows
- **Health Communities**: Gamified wellness engagement
- **Family Care Network**: Multi-user health monitoring

---

## Architecture & Directory Structure

The application follows a modular, layered architecture with clear separation of concerns:

```
RimiApp/
├── src/
│   ├── features/          # Domain-driven feature modules
│   │   └── agent/         # Virtual assistant (Rimi) components
│   │       ├── ChatModal.tsx
│   │       ├── SetupModal.tsx
│   │       └── README.md
│   │
│   ├── hooks/             # Service Layer (Business Logic)
│   │   ├── useChatSession.ts      # Conversational AI adapter
│   │   ├── usePermissions.ts      # Native permissions handler
│   │   └── index.ts
│   │
│   ├── context/           # Global State Management
│   │   └── AuthContext.tsx        # Authentication & session
│   │
│   ├── data/              # Data Contracts & Schemas
│   │   └── mockData.ts            # Type definitions & mock data
│   │
│   ├── pages/             # Route-level components
│   │   ├── LoginPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── CommunityPage.tsx
│   │   └── CareNetworkPage.tsx
│   │
│   ├── components/        # Shared UI components
│   │   ├── layout/        # Layout wrappers
│   │   ├── ui/            # Reusable UI primitives
│   │   └── ProtectedRoute.tsx
│   │
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/             # Utility functions
│   │
│   ├── App.tsx            # Application root
│   └── main.tsx           # Entry point
│
├── android/               # Native Android project (Capacitor)
├── dist/                  # Production build output
├── public/                # Static assets
│
├── capacitor.config.ts    # Capacitor configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

### Architectural Layers

#### 1. Presentation Layer (`src/pages/`, `src/components/`)
- Responsible for UI rendering and user interactions
- Consumes data from Service Layer via custom hooks
- No direct API calls or business logic

#### 2. Service Layer (`src/hooks/`)
- Implements the **Adapter Pattern** for backend integration
- Centralizes business logic and API communication
- Provides clean interfaces to Presentation Layer
- **Primary integration points for backend developers**

#### 3. State Management (`src/context/`)
- Global application state (authentication, user session)
- React Context API for state distribution

#### 4. Data Layer (`src/data/`)
- Type definitions and data contracts
- Mock data for development and testing
- **Reference for backend API response schemas**

---

## Backend Integration Guide

The application is designed for seamless backend integration through well-defined adapter interfaces. All API communication should be implemented in the Service Layer (custom hooks).

### 1. Authentication Integration

**File**: `src/context/AuthContext.tsx`

**Current Implementation**: Local mock authentication

**Integration Points**:

```typescript
// Replace mock validation with API call
const login = async (dni: string, password: string) => {
  // TODO: Replace with actual authentication endpoint
  // Example: AWS Cognito, OAuth2, or custom auth API
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dni, password })
  });
  
  const userData = await response.json();
  setUser(userData);
  localStorage.setItem('rimiapp_user', JSON.stringify(userData));
};
```

**Expected Response Schema**:
```typescript
interface User {
  dni: string;
  name: string;
  isFirstTime: boolean;
}
```

**Reference**: See `src/data/mockData.ts` for complete type definition.

---

### 2. Conversational AI (Rimi Assistant)

**File**: `src/hooks/useChatSession.ts`

**Current Implementation**: Rule-based message routing with simulated delays

**Integration Points**:

#### A. Text Message Processing

```typescript
const sendMessage = async (text: string) => {
  // Add user message to UI
  addMessage(text, 'user');
  
  // TODO: Replace with NLP/LLM API endpoint
  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      userId: user.dni,
      sessionId: sessionId,
      context: messages
    })
  });
  
  const aiResponse = await response.json();
  addMessage(aiResponse.text, 'ai', aiResponse.type, aiResponse.payload);
};
```

#### B. Voice Command Processing

```typescript
const handleVoiceCommand = async () => {
  // Capture audio from microphone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  
  // TODO: Send audio to AWS Transcribe or Speech-to-Text API
  const audioBlob = await recordAudio(mediaRecorder);
  
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });
  
  const { transcript } = await response.json();
  sendMessage(transcript);
};
```

**Message Types**:
- `options`: Display triage options (Telemedicine, Home Visit, Clinic)
- `confirmation`: Request user confirmation
- `map`: Display location/route information
- `geofence`: Trigger location-based workflow
- `prescription_import`: Medication import flow
- `upload_prompt`: Request document upload
- `gamification`: Display wellness points

**Reference**: See `TRIAGE_OPTIONS` in `src/data/mockData.ts` for payload structure.

---

### 3. Triage System

**File**: `src/hooks/useChatSession.ts` (Rama A)

**Workflow**:
1. User reports symptoms
2. AI analyzes and returns triage options
3. User selects care channel
4. System activates pre-admission (if applicable)
5. GPS routing to selected facility

**API Endpoints Required**:
- `POST /api/triage/analyze` - Symptom analysis
- `POST /api/triage/pre-admission` - Hospital alert
- `GET /api/triage/route` - Navigation data

---

### 4. Medication Management (HL7 Interoperability)

**File**: `src/hooks/useChatSession.ts` (Rama C)

**Workflow**:
1. User requests prescription import
2. System connects to clinic's HL7 FHIR endpoint
3. Imports MedicationRequest resource
4. Configures medication reminders
5. Awards wellness points

**API Endpoints Required**:
- `POST /api/hl7/import-prescription` - HL7 FHIR integration
- `POST /api/medication/set-reminders` - Alarm configuration
- `POST /api/gamification/award-points` - Points system

**Expected Response**:
```typescript
{
  medication: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  };
  reminders: Array<{ time: string; enabled: boolean }>;
  pointsAwarded: number;
}
```

---

### 5. Geofencing & Reimbursements

**File**: `src/hooks/useChatSession.ts` (Rama B)

**Workflow**:
1. System detects user at medical facility (geofence)
2. Displays reimbursement coverage information
3. User initiates claim process
4. OCR processes uploaded documents
5. Claim submitted for review

**API Endpoints Required**:
- `POST /api/geofence/check` - Location verification
- `POST /api/reimbursement/initiate` - Start claim
- `POST /api/ocr/process` - Document processing

---

### 6. Health Communities

**File**: `src/data/mockData.ts` - `COMMUNITIES` constant

**Data Contract**:
```typescript
interface Community {
  id: string;
  title: string;
  description: string;
  benefit: string;
  image: string;
  gradient: string;
  ctaText: string;
}
```

**API Endpoints Required**:
- `GET /api/communities` - List available communities
- `POST /api/communities/:id/join` - Join community
- `GET /api/communities/:id/activity` - Community feed

---

### 7. Family Care Network

**File**: `src/data/mockData.ts` - `FAMILY_MEMBERS` constant

**Data Contract**:
```typescript
interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  status: 'OK' | 'Attention Needed';
  vitals: {
    heart: string;
    bp: string;
  };
  adherence: 'taken' | 'missed';
  policy: string;
}
```

**API Endpoints Required**:
- `GET /api/family/members` - List family members
- `GET /api/family/:id/vitals` - Health metrics
- `POST /api/family/:id/medication-reminder` - Adherence tracking

---

## Data Schemas Reference

All data contracts are defined in `src/data/mockData.ts`. Backend APIs should return JSON responses matching these TypeScript interfaces:

- `User` - User profile and authentication
- `ChatMessage` - Conversational AI messages
- `TriageOption` - Medical triage options
- `Community` - Health community data
- `FamilyMember` - Family care network member

**Important**: The frontend expects exact property names and types as defined in these interfaces.

---

## Mobile Deployment (Android)

The application uses Capacitor to generate native Android builds from the web codebase.

### Build Process

```bash
# 1. Build web application
npm run build

# 2. Sync web assets to native project
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

### Configuration

**File**: `capacitor.config.ts`

```typescript
{
  appId: 'com.rimac.rimiapp',
  appName: 'RimiApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'  // Prevents CORS issues
  }
}
```

### Native Permissions

The application requires the following Android permissions:

- `INTERNET` - API communication
- `CAMERA` - Document capture
- `RECORD_AUDIO` - Voice commands
- `ACCESS_FINE_LOCATION` - Geofencing
- `ACCESS_COARSE_LOCATION` - Geofencing

Permissions are configured in `android/app/src/main/AndroidManifest.xml`.

### Distribution

- **Debug APK**: `./gradlew assembleDebug`
- **Release AAB**: `./gradlew bundleRelease`

See `ANDROID-SETUP.md` for detailed mobile deployment instructions.

---

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd RimiApp

# Install dependencies
npm install
```

### Development Server

```bash
# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Development Credentials

For local testing, use the following credentials:

- **DNI**: `123456789`
- **Password**: `usuario`

**Note**: These credentials are defined in `src/data/mockData.ts` and should be replaced with actual authentication in production.

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://api.rimac.com
VITE_AWS_TRANSCRIBE_ENDPOINT=<transcribe-endpoint>
VITE_HL7_FHIR_ENDPOINT=<fhir-endpoint>
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Testing

### Unit Tests

```bash
# Run unit tests (when configured)
npm run test
```

### Manual Testing Checklist

See `TESTING.md` for comprehensive testing scenarios including:
- Authentication flows
- Triage system (Rama A)
- Geofencing & reimbursements (Rama B)
- Medication management (Rama C)
- Voice mode functionality

---

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint
```

### Type Checking

```bash
# TypeScript type checking
npx tsc --noEmit
```

---

## Project Scripts

```json
{
  "dev": "vite",                          // Start development server
  "build": "tsc -b && vite build",        // Production build
  "preview": "vite preview",              // Preview production build
  "lint": "eslint .",                     // Run linter
  "android": "npm run build && npx cap sync && npx cap open android",
  "android:build": "npm run build && npx cap sync",
  "android:open": "npx cap open android",
  "android:sync": "npx cap sync"
}
```

---

## Additional Documentation

- `ANDROID-SETUP.md` - Comprehensive Android deployment guide
- `FINAL-ARCHITECTURE.md` - Detailed architecture documentation
- `VOICE-MODE-SYSTEM.md` - Voice interaction system
- `CHAT-FLOWS.md` - Conversational AI flow diagrams
- `TESTING.md` - Testing procedures and checklists

---

## Support & Contribution

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error handling
- Document complex business logic
- Maintain separation of concerns (Presentation/Service/Data layers)

### Git Workflow

- Feature branches: `feature/<feature-name>`
- Bug fixes: `fix/<bug-description>`
- Commit messages: Follow conventional commits

---

## License

Proprietary - Rimac Seguros y Reaseguros

---

## Contact

For technical questions regarding backend integration, please refer to the integration points documented in this README or contact the frontend development team.

**Version**: 1.0.0  
**Last Updated**: November 2025
