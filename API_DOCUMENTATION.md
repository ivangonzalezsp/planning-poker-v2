# Planning Poker Application - Comprehensive API Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Components API](#components-api)
5. [Firebase Utilities](#firebase-utilities)
6. [Internationalization](#internationalization)
7. [API Routes](#api-routes)
8. [Pages](#pages)
9. [Types and Interfaces](#types-and-interfaces)
10. [Usage Examples](#usage-examples)

## Project Overview

Planning Poker is a web application for Agile teams to estimate user stories using the Planning Poker technique. The application supports:

- Creating and joining poker rooms
- Multiple voting modes (Fibonacci numbers and T-shirt sizes)
- Real-time voting and results
- Internationalization (English and Spanish)
- Vote visualization with charts
- Admin controls for room management

### Technology Stack

- **Frontend**: Next.js 13.3.0, React 18.2.0, TypeScript 5.0.4
- **Backend**: Firebase Realtime Database
- **Styling**: SCSS with CSS Modules
- **Charts**: Recharts 2.5.0
- **Internationalization**: next-i18next 13.2.2, i18next 22.4.15
- **Analytics**: Vercel Analytics

## Architecture

```
src/
├── components/          # React components
│   ├── Home/           # Home page component
│   └── PokerRoom/      # Main poker room component
├── firebase/           # Firebase configuration and utilities
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── join-room/     # Room joining pages
│   └── poker-room/    # Poker room pages
├── styles/            # SCSS stylesheets
├── getInitialLocale.ts # Locale detection utility
└── i18n.ts           # i18n configuration
```

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Installation and Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Components API

### Home Component

**Location**: `src/components/Home/index.tsx`

**Description**: Main landing page component for creating new poker rooms.

**Props**: None

**State**:
```typescript
const [userName, setUserName] = useState<string>("")
const [roomName, setRoomName] = useState<string>("")
```

**Key Functions**:

#### `createRoom()`
```typescript
const createRoom = async () => Promise<void>
```
- **Description**: Creates a new poker room in Firebase and navigates to it
- **Behavior**: 
  - Generates a new room ID using Firebase push()
  - Sets up room data with admin user
  - Redirects to `/poker-room/[roomId]?user=[userName]`
- **Requirements**: Both `userName` and `roomName` must be non-empty

#### `changeLanguage(lang: string)`
```typescript
const changeLanguage = (lang: string) => void
```
- **Description**: Changes the application language
- **Parameters**: 
  - `lang`: Language code ("en" or "es")

**Usage Example**:
```tsx
import Home from "@/components/Home"

function HomePage() {
  return <Home />
}
```

### PokerRoom Component

**Location**: `src/components/PokerRoom/index.tsx`

**Description**: Main poker room interface with voting, admin controls, and real-time updates.

**Props**:
```typescript
interface PokerRoomProps {
  room: string;    // Room ID
  name: string;    // User name
}
```

**State**:
```typescript
const [votes, setVotes] = useState<any>({})
const [votesVisible, setVotesVisible] = useState<boolean>(false)
const [participants, setParticipants] = useState<{
  [key: string]: { 
    voted: boolean; 
    vote?: string; 
    isAdmin?: boolean 
  }
}>({})
const [isAdmin, setIsAdmin] = useState<boolean>(false)
const [mode, setMode] = useState<"normal" | "tshirt">("normal")
const [selectedVote, setSelectedVote] = useState<string | null>(null)
const [storyURL, setStoryURL] = useState<string>("")
const [inviteURL, setInviteURL] = useState<string>("")
```

**Key Functions**:

#### `onVote(value: string | number)`
```typescript
const onVote = async (value: string | number) => Promise<void>
```
- **Description**: Records a vote for the current user
- **Parameters**: 
  - `value`: Vote value (number for normal mode, string for t-shirt mode)
- **Behavior**: Updates Firebase with user's vote and voted status

#### `onRevealVotes()`
```typescript
const onRevealVotes = async () => Promise<void>
```
- **Description**: Reveals all votes to participants (Admin only)
- **Behavior**: Sets `reveal: true` in Firebase, making votes visible

#### `onResetVotes()`
```typescript
const onResetVotes = async () => Promise<void>
```
- **Description**: Resets all votes for a new round (Admin only)
- **Behavior**: Clears all votes and sets `reveal: false`

#### `toggleMode()`
```typescript
const toggleMode = async () => Promise<void>
```
- **Description**: Switches between normal (Fibonacci) and t-shirt sizing modes (Admin only)
- **Behavior**: Updates mode in Firebase and resets reveal state

#### `generateInviteURL()`
```typescript
const generateInviteURL = () => void
```
- **Description**: Generates invite link for the current room
- **Returns**: Sets `inviteURL` state with join link

#### `onSaveStoryURL()`
```typescript
const onSaveStoryURL = async () => Promise<void>
```
- **Description**: Saves user story URL to the room (Admin only)
- **Behavior**: Updates `storyURL` in Firebase

#### `prepareChartData(participants: any)`
```typescript
const prepareChartData = (participants: any) => {
  data: Array<{name: string, count: number}>;
  average: string;
}
```
- **Description**: Prepares vote data for chart visualization
- **Parameters**: 
  - `participants`: Participants object with votes
- **Returns**: Chart data and calculated average

**Voting Options**:
- **Normal Mode**: `[1, 2, 3, 5, 8, 13, 20, 40, 100]` (Fibonacci sequence)
- **T-shirt Mode**: `["XS", "S", "M", "L", "XL", "XXL"]`

**Usage Example**:
```tsx
import PokerRoom from "@/components/PokerRoom"

function PokerRoomPage() {
  return <PokerRoom room="room123" name="John Doe" />
}
```

## Firebase Utilities

### Database Configuration

**Location**: `src/firebase/config.ts`

**Exports**:
```typescript
export const database: Database
```
- **Description**: Configured Firebase Realtime Database instance
- **Usage**: Import for direct Firebase operations

### useFirebase Hook

**Location**: `src/firebase/useFirebase.ts`

**Signature**:
```typescript
export const useFirebase = (path: string) => {
  data: any;
  loading: boolean;
  error: Error | null;
  setDataAtPath: (newData: any) => Promise<void>;
}
```

**Parameters**:
- `path`: Firebase database path (e.g., "rooms/room123")

**Returns**:
- `data`: Current data at the specified path
- `loading`: Boolean indicating if data is being fetched
- `error`: Error object if fetch failed
- `setDataAtPath`: Function to update data at the path

**Usage Example**:
```typescript
import { useFirebase } from "@/firebase/useFirebase"

function MyComponent() {
  const { data, loading, error, setDataAtPath } = useFirebase("rooms/123")
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const updateRoom = () => {
    setDataAtPath({ name: "New Room Name" })
  }
  
  return <div>{data?.name}</div>
}
```

## Internationalization

### getInitialLocale Function

**Location**: `src/getInitialLocale.ts`

**Signature**:
```typescript
export function getInitialLocale(): string
```

**Description**: Determines initial locale for the application

**Logic**:
1. Check localStorage for saved locale
2. Fall back to browser language (first part before "-")
3. Default to "en" on server side

**Usage Example**:
```typescript
import { getInitialLocale } from "@/getInitialLocale"

const locale = getInitialLocale() // Returns "en" or "es"
```

### i18n Configuration

**Location**: `src/i18n.ts`

**Description**: Configures i18next for client-side internationalization

**Configuration**:
- **Supported Languages**: English ("en"), Spanish ("es")
- **Translation Path**: `/translations/{{lng}}.json`
- **Fallback Language**: English
- **Backend**: HTTP backend for loading translations

### Translation Keys

**Available Keys**:
```typescript
interface TranslationKeys {
  welcome: string;           // "Welcome to Planning Poker"
  roomName: string;          // "Room name"
  join: string;             // "Join a room"
  create: string;           // "Create a room"
  participants: string;      // "Participants"
  name: string;             // "Name"
  normalMode: string;       // "Switch to normal mode"
  tshirtMode: string;       // "Switch to T-shirt sizes"
  invite: string;           // "Invite colleagues"
  share: string;            // "Share this link"
  reveal: string;           // "Reveal"
  reset: string;            // "Reset voting"
  saveURL: string;          // "Save Ticket URL"
}
```

**Usage with Hook**:
```typescript
import { useTranslation } from "next-i18next"

function MyComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t("welcome")}</h1>
      <button onClick={() => i18n.changeLanguage("es")}>
        Español
      </button>
    </div>
  )
}
```

## API Routes

### Hello API

**Location**: `src/pages/api/hello.ts`

**Endpoint**: `GET /api/hello`

**Response**:
```typescript
{
  name: string; // "John Doe"
}
```

**Description**: Sample API endpoint (can be removed in production)

**Usage Example**:
```javascript
fetch('/api/hello')
  .then(res => res.json())
  .then(data => console.log(data.name))
```

## Pages

### Home Page

**Location**: `src/pages/index.tsx`

**Route**: `/`

**Description**: Landing page with room creation form

**Components Used**: `<Home />`

### Join Room Page

**Location**: `src/pages/join-room/[roomId].tsx`

**Route**: `/join-room/[roomId]`

**Description**: Page for joining an existing poker room

**Query Parameters**:
- `roomId`: Room ID to join

**Key Functions**:

#### `joinRoom()`
```typescript
const joinRoom = async () => Promise<void>
```
- **Description**: Adds user to existing room and navigates to poker room
- **Behavior**: 
  - Saves username to localStorage
  - Updates Firebase participants
  - Redirects to `/poker-room/[roomId]?user=[userName]`

### Poker Room Page

**Location**: `src/pages/poker-room/[roomId].tsx`

**Route**: `/poker-room/[roomId]?user=[userName]`

**Description**: Main poker room interface

**Query Parameters**:
- `roomId`: Room ID
- `user`: Username

**Components Used**: `<PokerRoom room={roomId} name={userName} />`

### App Component

**Location**: `src/pages/_app.tsx`

**Description**: Root application component with global providers

**Providers**:
- Vercel Analytics
- i18next Provider
- Next.js i18n wrapper

### Document Component

**Location**: `src/pages/_document.tsx`

**Description**: Custom HTML document structure

## Types and Interfaces

### Room Data Structure

```typescript
interface RoomData {
  name: string;                    // Room name
  admin: string;                   // Admin username
  participants: {
    [username: string]: {
      voted: boolean;              // Has user voted
      vote?: string;               // User's vote value
      isAdmin?: boolean;           // Is user admin
    }
  };
  reveal?: boolean;                // Are votes revealed
  mode?: "normal" | "tshirt";      // Voting mode
  storyURL?: string;               // User story URL
}
```

### Participant Interface

```typescript
interface Participant {
  voted: boolean;
  vote?: string;
  isAdmin?: boolean;
}
```

### Vote Data for Charts

```typescript
interface ChartDataPoint {
  name: string;    // Vote value
  count: number;   // Number of votes
}
```

## Usage Examples

### Creating a Complete Room Flow

```typescript
// 1. User creates room (Home component)
const createRoom = async () => {
  const newRoomRef = push(ref(database, "rooms"))
  const roomId = newRoomRef.key
  
  await set(newRoomRef, {
    name: "Sprint Planning",
    admin: "John Doe",
    participants: {
      "John Doe": { voted: false, isAdmin: true }
    }
  })
  
  // Navigate to room
  router.push(`/poker-room/${roomId}?user=John Doe`)
}

// 2. Other users join (JoinRoom component)
const joinRoom = async () => {
  const roomRef = ref(database, `rooms/${roomId}/participants/Jane`)
  await update(roomRef, { voted: false })
  router.push(`/poker-room/${roomId}?user=Jane`)
}

// 3. Users vote (PokerRoom component)
const vote = async (value: string) => {
  const userRef = ref(database, `rooms/${roomId}/participants/${username}`)
  await update(userRef, { voted: true, vote: value })
}

// 4. Admin reveals votes
const revealVotes = async () => {
  await update(ref(database, `rooms/${roomId}`), { reveal: true })
}
```

### Real-time Data Subscription

```typescript
import { useFirebase } from "@/firebase/useFirebase"

function RoomStatus({ roomId }: { roomId: string }) {
  const { data: roomData, loading } = useFirebase(`rooms/${roomId}`)
  
  if (loading) return <div>Loading room...</div>
  
  const participantCount = Object.keys(roomData?.participants || {}).length
  const votedCount = Object.values(roomData?.participants || {})
    .filter((p: any) => p.voted).length
  
  return (
    <div>
      <p>Participants: {participantCount}</p>
      <p>Voted: {votedCount}/{participantCount}</p>
      {roomData?.reveal && <p>Votes are revealed!</p>}
    </div>
  )
}
```

### Custom Hook for Room Management

```typescript
import { useFirebase } from "@/firebase/useFirebase"
import { ref, update } from "firebase/database"
import { database } from "@/firebase/config"

export function usePokerRoom(roomId: string, username: string) {
  const { data: roomData, loading, error } = useFirebase(`rooms/${roomId}`)
  
  const vote = async (value: string) => {
    const userRef = ref(database, `rooms/${roomId}/participants/${username}`)
    await update(userRef, { voted: true, vote: value })
  }
  
  const resetVotes = async () => {
    const updates: any = {}
    Object.keys(roomData?.participants || {}).forEach(user => {
      updates[`rooms/${roomId}/participants/${user}/voted`] = false
      updates[`rooms/${roomId}/participants/${user}/vote`] = null
    })
    await update(ref(database), updates)
    await update(ref(database, `rooms/${roomId}`), { reveal: false })
  }
  
  return {
    roomData,
    loading,
    error,
    vote,
    resetVotes,
    isAdmin: roomData?.participants?.[username]?.isAdmin || false,
    participants: roomData?.participants || {},
    votesRevealed: roomData?.reveal || false
  }
}
```

### Internationalization Usage

```typescript
import { useTranslation } from "next-i18next"

function LocalizedComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t("welcome")}</h1>
      
      <div>
        <button 
          onClick={() => i18n.changeLanguage("en")}
          disabled={i18n.language === "en"}
        >
          English
        </button>
        <button 
          onClick={() => i18n.changeLanguage("es")}
          disabled={i18n.language === "es"}
        >
          Español
        </button>
      </div>
      
      <p>Current language: {i18n.language}</p>
    </div>
  )
}
```

---

This documentation covers all public APIs, components, and functions in the Planning Poker application. For additional implementation details, refer to the source code in the respective files.