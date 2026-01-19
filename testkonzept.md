# Testkonzept - Criteria Catalogue (IPA Bewertungssystem)

## 1. Projektübersicht

### 1.1 Projektbeschreibung
Das **Criteria Catalogue** Projekt ist ein Bewertungssystem für IPA-Projekte (Individuelle Praktische Arbeit) im Rahmen der Module 324 (DevOps) und 450 (Testing). Die Applikation ermöglicht es, Personendaten zu erfassen, Kriterien zu verwalten und Noten basierend auf dem Erfüllungsgrad der Kriterien zu berechnen.

### 1.2 Technologie-Stack

| Bereich | Technologie |
|---------|-------------|
| **Frontend** | React mit TypeScript, Tailwind CSS, Shadcn/ui, Sonner |
| **Backend** | Go (Golang), Gin Web Framework |
| **Datenbank** | MongoDB |
| **Testing Frontend** | Vitest, Testing Library |
| **Testing Backend** | Go Testing Framework |
| **Containerisierung** | Docker |

### 1.3 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend                               │
│   React + TypeScript + Tailwind CSS + Shadcn/ui                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Components:  App, PersonForm, CriteriaList, GradesDisplay│   │
│   │  Services: projectApi. ts                                 │   │
│   │  Hooks: useFlexSearch, useStorage                        │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTP/HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Backend                                │
│   Go + Gin Framework                                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  API Layer: handlers. go, routes.go                       │   │
│   │  Business Logic: grade.go, criterionUtils.go             │   │
│   │  Data Layer: store. go, criteria.go, counter.go           │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB                                  │
│   Collections: user-data, counters                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Teststrategie

### 2.1 Testebenen (Testpyramide)

```
                    ▲
                   /│\
                  / │ \        E2E Tests
                 /  │  \       (Wenige, aber wichtig)
                /   │   \
               /────┼────\
              /     │     \    Integrationstests
             /      │      \   (API, Komponenten-Integration)
            /───────┼───────\
           /        │        \
          /         │         \ Unit Tests
         /          │          \ (Viele, schnell, isoliert)
        /───────────┼───────────\
```

### 2.2 Testarten

| Testart | Beschreibung | Werkzeuge | Abdeckung |
|---------|--------------|-----------|-----------|
| **Unit Tests** | Isolierte Tests einzelner Funktionen/Komponenten | Vitest (FE), Go Testing (BE) | ~80% |
| **Integrationstests** | Tests der Zusammenarbeit mehrerer Komponenten | Testing Library, Go Testing | ~60% |
| **E2E Tests** | Vollständige User-Flows | Playwright/Cypress (empfohlen) | ~30% |
| **API Tests** | REST API Endpunkt-Tests | Go Testing, Postman | ~70% |

---

## 3. Backend-Testkonzept

### 3.1 Zu testende Module

#### 3.1.1 Grade-Berechnung (`internal/grade/grade.go`)

**Bereits implementierte Tests:** `grade_test.go`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| `TestCalculateGrade` | Vollständige Notenberechnung mit mehreren Kriterien | ✅ Implementiert |
| `TestCalculateCriterionQualityLevel` | Qualitätsstufen-Berechnung pro Kriterium | ✅ Implementiert |

**Zusätzlich zu testen:**

```go
// Empfohlene zusätzliche Testfälle
func TestCalculateGrade_EmptyCriteria(t *testing. T)
func TestCalculateGrade_OnlyPart1Criteria(t *testing.T)
func TestCalculateGrade_OnlyPart2Criteria(t *testing.T)
func TestCalculateGrade_AllRequirementsMet(t *testing.T)
func TestCalculateGrade_NoRequirementsMet(t *testing.T)
func TestMeetsQualityLevel_WithRequiredIndexes(t *testing.T)
func TestMeetsQualityLevel_WithoutRequiredIndexes(t *testing.T)
```

#### 3.1.2 Kriterium-Utilities (`internal/common/criterionUtils.go`)

**Bereits implementierte Tests:** `criterionUtils_test.go`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| `TestIsMandatoryCriterion` | Pflichtkriterien-Erkennung (Doc*, A01-A12) | ✅ Implementiert |
| `TestIsOptionalCriterion` | Optionale Kriterien-Erkennung | ✅ Implementiert |
| `TestIsCriterionPart1` | Teil 1 Kriterien (nicht Doc*) | ✅ Implementiert |
| `TestIsCriterionPart2` | Teil 2 Kriterien (Doc*) | ✅ Implementiert |

#### 3.1.3 API Handlers (`internal/api/handlers.go`)

**Zu implementierende Tests:**

```go
// handlers_test.go
func TestCreateIpaProjectHandler_ValidInput(t *testing.T)
func TestCreateIpaProjectHandler_InvalidInput(t *testing.T)
func TestGetIpaProjectHandler_ExistingProject(t *testing. T)
func TestGetIpaProjectHandler_NonExistingProject(t *testing.T)
func TestGetIpaCriteriaHandler_Success(t *testing.T)
func TestCreateIpaCriteriaHandler_ValidCriterion(t *testing.T)
func TestCreateIpaCriteriaHandler_InvalidCriterion(t *testing.T)
func TestUpdateIpaCriteriaHandler_Success(t *testing.T)
func TestDeleteIpaCriteriaHandler_Success(t *testing.T)
func TestGetGradeHandler_Success(t *testing.T)
func TestGetPredefinedCriteriaHandler_Success(t *testing.T)
```

#### 3.1.4 Store Layer (`internal/store/`)

**Zu implementierende Tests:**

```go
// store_test.go
func TestNewMongoStore_ConnectionSuccess(t *testing.T)
func TestNewMongoStore_ConnectionFailure(t *testing.T)
func TestSavePersonData_Success(t *testing.T)
func TestGetIpaProject_Success(t *testing.T)
func TestGetIpaProject_NotFound(t *testing.T)
func TestUpdateIpaProject_Success(t *testing.T)
func TestAddCriterionToIpaProject_Success(t *testing.T)
func TestAddCriterionToIpaProject_DuplicateId(t *testing.T)
func TestUpdateCriterionInIpaProject_Success(t *testing.T)
func TestDeleteCriterionFromIpaProject_Success(t *testing.T)

// criteria_test.go
func TestNewCriteriaStore_ValidFile(t *testing.T)
func TestNewCriteriaStore_InvalidFile(t *testing. T)
func TestGetAllCriteria_Success(t *testing.T)
func TestGetMandatoryCriteria_Success(t *testing.T)

// counter_test.go
func TestGetNewID_Success(t *testing.T)
func TestGetNewID_Increment(t *testing.T)
```

### 3.2 Backend API-Endpunkte

| Methode | Endpunkt | Beschreibung | Testpriorität |
|---------|----------|--------------|---------------|
| POST | `/api/ipa` | IPA-Projekt erstellen | 🔴 Hoch |
| GET | `/api/ipa/: id` | IPA-Projekt abrufen | 🔴 Hoch |
| GET | `/api/ipa/:id/criteria` | Kriterien abrufen | 🔴 Hoch |
| POST | `/api/ipa/:id/criteria` | Kriterium hinzufügen | 🟡 Mittel |
| PUT | `/api/ipa/:id/criteria/:criteriaId` | Kriterium aktualisieren | 🟡 Mittel |
| DELETE | `/api/ipa/:id/criteria/:criteriaId` | Kriterium löschen | 🟡 Mittel |
| GET | `/api/ipa/:id/person-data` | Personendaten abrufen | 🟢 Niedrig |
| PUT | `/api/ipa/:id/person-data` | Personendaten aktualisieren | 🟢 Niedrig |
| GET | `/api/ipa/:id/grade` | Note berechnen | 🔴 Hoch |
| GET | `/api/criteria` | Alle verfügbaren Kriterien | 🟡 Mittel |
| GET | `/version` | Versionsinfo | 🟢 Niedrig |

---

## 4. Frontend-Testkonzept

### 4.1 Zu testende Komponenten

#### 4.1.1 App Component (`App.tsx`)

**Bereits implementierte Tests:** `App.test.tsx`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| Login-Tab ohne ipaId | Zeigt korrekten Tab-Status | ✅ Implementiert |
| Version Loading | Lädt und zeigt Version | ✅ Implementiert |
| IPA Login Flow | Login-Prozess | ✅ Implementiert |

**Zusätzlich zu testen:**

```typescript
// Empfohlene zusätzliche Testfälle
it("sollte Kriterien-Tab anzeigen wenn eingeloggt")
it("sollte Logout korrekt durchführen")
it("sollte Personendaten speichern")
it("sollte Kriterien laden nach Login")
it("sollte Fehler bei API-Aufruf behandeln")
it("sollte Loading-Indikator anzeigen")
```

#### 4.1.2 Dialog Component (`Dialog.tsx`)

**Bereits implementierte Tests:** `Dialog.test.tsx`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| Rendern wenn geschlossen | Zeigt nichts an | ✅ Implementiert |
| Rendern wenn geöffnet | Zeigt Titel, Beschreibung, Kinder | ✅ Implementiert |
| Schliessen per Overlay | Click auf Overlay schliesst Dialog | ✅ Implementiert |
| Schliessen per Button | Click auf Close-Button schliesst Dialog | ✅ Implementiert |
| Schliessen per Escape | Escape-Taste schliesst Dialog | ✅ Implementiert |

#### 4.1.3 CriteriaList Component (`CriteriaList.tsx`)

**Bereits implementierte Tests:** `CriteriaList.test.tsx`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| Dialog öffnen und Kriterium speichern | Create Flow | ✅ Implementiert |

**Zusätzlich zu testen:**

```typescript
// Empfohlene zusätzliche Testfälle
it("sollte Kriterien-Liste rendern")
it("sollte Kriterium bearbeiten können")
it("sollte Kriterium löschen können")
it("sollte Checkbox-Änderungen speichern")
it("sollte Notizen aktualisieren können")
it("sollte Qualitätsstufen korrekt anzeigen")
```

#### 4.1.4 API Service (`utils/service/projectApi.ts`)

**Bereits implementierte Tests:** `projectApi.test.tsx`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| `getIpa` mit gültiger ID | Gibt IPA zurück | ✅ Implementiert |
| `getIpa` mit "AA00" ID | Gibt null zurück | ✅ Implementiert |
| `fetchJson` bei 204 | Gibt null zurück | ✅ Implementiert |
| `fetchJson` bei Fehler | Zeigt Toast und gibt null zurück | ✅ Implementiert |
| `createIpa` | POST Request und Return | ✅ Implementiert |
| `getCriteria` bei 204 | Gibt leeres Array zurück | ✅ Implementiert |

**Zusätzlich zu testen:**

```typescript
// Empfohlene zusätzliche Testfälle
it("updateCriterion sollte PUT Request senden")
it("deleteCriterion sollte DELETE Request senden")
it("getGrades sollte Noten zurückgeben")
it("getAllCriteria sollte alle Kriterien laden")
it("sollte Netzwerkfehler behandeln")
```

#### 4.1.5 Utility-Funktionen

**Bereits implementierte Tests:** `sortHelper.test.ts`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| `compareIds` identische Strings | Gibt 0 zurück | ✅ Implementiert |
| `compareIds` mit Whitespace | Trimmt korrekt | ✅ Implementiert |
| `compareIds` case-insensitive | Ignoriert Gross/Kleinschreibung | ✅ Implementiert |
| `compareIds` numerisch | Sortiert Zahlen korrekt | ✅ Implementiert |

**Bereits implementierte Tests:** `useFlexSearch.test.tsx`

| Testfall | Beschreibung | Status |
|----------|--------------|--------|
| Leere Suche | Gibt alle Ergebnisse zurück | ✅ Implementiert |
| Suche nach ID/Titel/Notizen | Findet korrekte Matches | ✅ Implementiert |
| Re-Indexing | Ersetzt Map mit neuen Kriterien | ✅ Implementiert |

### 4.2 Testabdeckungsziele

| Bereich | Aktuell (geschätzt) | Ziel |
|---------|---------------------|------|
| Components | ~40% | 80% |
| Services/API | ~60% | 90% |
| Utilities/Hooks | ~70% | 90% |
| Gesamt | ~50% | 80% |

---

## 5. Integrationstests

### 5.1 Frontend-Backend Integration

| Testfall | Beschreibung | Priorität |
|----------|--------------|-----------|
| IPA-Projekt erstellen | Vollständiger Flow von Form bis DB | 🔴 Hoch |
| Login mit existierender ID | Lädt korrektes Projekt | 🔴 Hoch |
| Kriterium hinzufügen | Frontend → API → DB → Response | 🟡 Mittel |
| Notenberechnung | Kriterien ändern → Note neu berechnen | 🔴 Hoch |
| Fehlerbehandlung | API-Fehler werden im UI angezeigt | 🟡 Mittel |

### 5.2 Datenbank-Integration

| Testfall | Beschreibung | Priorität |
|----------|--------------|-----------|
| MongoDB Connection | Verbindungsaufbau und -abbau | 🔴 Hoch |
| CRUD Operations | Create, Read, Update, Delete für IPA | 🔴 Hoch |
| Counter Increment | ID-Generierung funktioniert korrekt | 🟡 Mittel |

---

## 6. Testdaten

### 6.1 Testdaten-Strategie

| Kategorie | Strategie |
|-----------|-----------|
| **Unit Tests** | Inline Mock-Daten |
| **Integration Tests** | Fixtures in JSON-Dateien |
| **E2E Tests** | Seed-Skripte für Testdatenbank |

### 6.2 Beispiel-Testdaten

```json
{
  "validPerson": {
    "firstname": "Max",
    "lastname": "Mustermann",
    "topic": "IPA Testprojekt",
    "date": "2026-03-15"
  },
  "validCriterion": {
    "id": "A01",
    "title": "Requirements Engineering",
    "question": "Wurden die Anforderungen korrekt erfasst?",
    "requirements": ["Anforderung 1", "Anforderung 2", "Anforderung 3"],
    "checked": [],
    "notes": "",
    "qualityLevels": {
      "0": { "description": "Nicht erfüllt", "minRequirements": 0 },
      "1":  { "description": "Teilweise erfüllt", "minRequirements": 1 },
      "2": { "description":  "Grösstenteils erfüllt", "minRequirements": 2 },
      "3": { "description": "Vollständig erfüllt", "minRequirements": 3 }
    }
  },
  "invalidPerson": {
    "firstname":  "",
    "lastname": null
  }
}
```

---

## 7. Testausführung

### 7.1 Befehle

#### Frontend

```bash
# Unit Tests ausführen
cd frontend
npm run test

# Tests mit Coverage
npm run test -- --coverage

# Tests im Watch-Modus
npm run test -- --watch
```

#### Backend

```bash
# Alle Tests ausführen
cd backend
go test ./...

# Mit Verbose Output
go test -v ./... 

# Mit Coverage
go test -cover ./... 

# Coverage-Report generieren
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### 7.2 CI/CD Integration (Empfohlen)

```yaml
# .github/workflows/test.yml
name: Tests

on:  [push, pull_request]

jobs:
  frontend-tests:
    runs-on:  ubuntu-latest
    steps: 
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm run test -- --coverage
      
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: 
          go-version: '1.25'
      - name: Run tests
        run: cd backend && go test -v -cover ./...
```

---

## 8. Qualitätskriterien

### 8.1 Definition of Done für Tests

- [ ] Alle Unit Tests sind grün
- [ ] Code Coverage >= 80%
- [ ] Keine kritischen Bugs offen
- [ ] Integration Tests bestanden
- [ ] API-Dokumentation aktuell

### 8.2 Testmetriken

| Metrik | Zielwert |
|--------|----------|
| Code Coverage (Backend) | >= 80% |
| Code Coverage (Frontend) | >= 80% |
| Test-Ausführungszeit | < 5 Minuten |
| Flaky Tests | 0% |

---

## 9. Zusammenfassung

### 9.1 Aktueller Stand

| Bereich | Implementiert | Ausstehend |
|---------|---------------|------------|
| **Backend Unit Tests** | grade_test.go, criterionUtils_test.go | handlers_test.go, store_test.go |
| **Frontend Unit Tests** | App.test.tsx, Dialog.test.tsx, CriteriaList.test.tsx, projectApi.test.tsx, sortHelper.test.ts, useFlexSearch.test.tsx | PersonForm.test.tsx, GradesDisplay.test.tsx |
| **Integration Tests** | - | API Integration, DB Integration |
| **E2E Tests** | - | User Flow Tests |

### 9.2 Empfohlene Prioritäten

1. 🔴 **Hoch:** Backend API Handler Tests, Frontend Integration mit API
2. 🟡 **Mittel:** Store Layer Tests, zusätzliche Component Tests
3. 🟢 **Niedrig:** E2E Tests, Performance Tests

### 9.3 Nächste Schritte

1. Backend Handler Tests implementieren
2. Store Layer Tests mit Test-Datenbank implementieren
3. Frontend Component Tests erweitern
4. E2E Test-Framework einrichten (Playwright empfohlen)
5. CI/CD Pipeline für automatische Test-Ausführung konfigurieren

---

**Erstellt:** 2026-01-19  
**Version:** 1.0  
**Autor:** Automatisch generiert basierend auf Codeanalyse
