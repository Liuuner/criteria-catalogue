# Testfalldokumentation - Criteria Catalogue

Dieses Dokument enthält die detaillierte Dokumentation aller Testfälle mit Vorbedingungen, Eingaben, erwarteten Ergebnissen und Nachbedingungen.

---

## Inhaltsverzeichnis

1. [Backend Tests](#1-backend-tests)
    - [1.1 Grade Tests](#11-grade-tests)
    - [1.2 Criterion Utils Tests](#12-criterion-utils-tests)
2. [Frontend Tests](#2-frontend-tests)
    - [2.1 App Component Tests](#21-app-component-tests)
    - [2.2 Dialog Component Tests](#22-dialog-component-tests)
    - [2.3 CriteriaList Component Tests](#23-criterialist-component-tests)
    - [2.4 API Service Tests](#24-api-service-tests)
3. [Geplante Testfälle](#3-geplante-testfälle)

---

## 1. Backend Tests

### 1.1 Grade Tests

**Datei:** `backend/internal/grade/grade_test.go`

---

#### TC-BE-001: TestCalculateGrade - Vollständige Notenberechnung

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-001 |
| **Testname** | `TestCalculateGrade/full_example` |
| **Beschreibung** | Berechnet die Note für ein vollständiges IPA-Projekt mit mehreren Kriterien aus Teil 1 und Teil 2 |
| **Vorbedingungen** | - Das `grade` Package ist importiert<br>- Das `models` Package ist importiert |
| **Eingaben** | Array von 4 Kriterien: <br>- A01 (Teil 1): 4/4 Requirements erfüllt → QualityLevel 3<br>- A15 (Teil 1): 4/5 Requirements, aber RequiredIndex 2 fehlt → QualityLevel 1<br>- Doc01 (Teil 2): 3/4 Requirements erfüllt → QualityLevel 2<br>- Doc02 (Teil 2): 1/5 Requirements erfüllt → QualityLevel 0 |
| **Erwartetes Ergebnis** | `GradeResult{Part1: {Grade: 4. 33, AverageQualityLevel: 2}, Part2: {Grade: 2.67, AverageQualityLevel: 1}}` |
| **Nachbedingungen** | Keine Seiteneffekte, reine Berechnung |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-BE-002: TestCalculateCriterionQualityLevel - Alle Requirements erfüllt

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-002 |
| **Testname** | `TestCalculateCriterionQualityLevel/all_requirements_checked` |
| **Beschreibung** | Prüft, dass QualityLevel 3 zurückgegeben wird, wenn alle Requirements erfüllt sind |
| **Vorbedingungen** | Kriterium mit definierten QualityLevels |
| **Eingaben** | `Criterion{Checked: [1,2,3], Requirements: ["1","2","3"], QualityLevels: {... }}` |
| **Erwartetes Ergebnis** | `3` (höchstes QualityLevel) |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-BE-003: TestCalculateCriterionQualityLevel - QualityLevel 2 erreicht

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-003 |
| **Testname** | `TestCalculateCriterionQualityLevel/meets_quality_level_2` |
| **Beschreibung** | Prüft, dass QualityLevel 2 zurückgegeben wird, wenn MinRequirements und RequiredIndexes für Level 2 erfüllt sind |
| **Vorbedingungen** | Kriterium mit QualityLevel 2 Definition:  MinRequirements=2, RequiredIndexes=[1,2] |
| **Eingaben** | `Criterion{Checked: [1,2], Requirements: ["1","2","3"], ... }` |
| **Erwartetes Ergebnis** | `2` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-004: TestCalculateCriterionQualityLevel - QualityLevel 1 erreicht

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-004 |
| **Testname** | `TestCalculateCriterionQualityLevel/meets_quality_level_1` |
| **Beschreibung** | Prüft, dass QualityLevel 1 zurückgegeben wird, wenn nur MinRequirements für Level 1 erfüllt sind |
| **Vorbedingungen** | Kriterium mit QualityLevel 1 Definition: MinRequirements=1, RequiredIndexes=[1] |
| **Eingaben** | `Criterion{Checked: [1], Requirements: ["1","2","3"], ...}` |
| **Erwartetes Ergebnis** | `1` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-005: TestCalculateCriterionQualityLevel - Kein QualityLevel erreicht

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-005 |
| **Testname** | `TestCalculateCriterionQualityLevel/meets_no_quality_level` |
| **Beschreibung** | Prüft, dass QualityLevel 0 zurückgegeben wird, wenn keine Level-Anforderungen erfüllt sind |
| **Vorbedingungen** | Kriterium mit hohen Anforderungen für alle QualityLevels |
| **Eingaben** | `Criterion{Checked: [1], Requirements: ["1","2","3","4"], QualityLevels: {2: {MinReq: 3}, 1: {MinReq:  2}}}` |
| **Erwartetes Ergebnis** | `0` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-006: TestCalculateCriterionQualityLevel - MinRequirements erfüllt, RequiredIndexes nicht

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-006 |
| **Testname** | `TestCalculateCriterionQualityLevel/min_requirements_met_but_not_required_indexes` |
| **Beschreibung** | Prüft, dass nur QualityLevel 1 erreicht wird, wenn MinRequirements für Level 2 erfüllt sind, aber ein RequiredIndex fehlt |
| **Vorbedingungen** | QualityLevel 2 erfordert RequiredIndex 2 |
| **Eingaben** | `Criterion{ID: "A15", Checked: [1,3,4,5], QualityLevels: {2: {MinReq: 4, RequiredIndexes: [2]}}}` |
| **Erwartetes Ergebnis** | `1` (nicht 2, da RequiredIndex 2 fehlt) |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-BE-007: TestMeetsRequirements - Alle erforderlichen Indizes vorhanden

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-007 |
| **Testname** | `TestMeetsRequirements/all_required_checked` |
| **Beschreibung** | Prüft, dass `true` zurückgegeben wird, wenn alle erforderlichen Indizes in Checked enthalten sind |
| **Vorbedingungen** | Keine |
| **Eingaben** | `checked: [1,2,3], required: [1,2]` |
| **Erwartetes Ergebnis** | `true` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-008: TestMeetsRequirements - Erforderlicher Index fehlt

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-008 |
| **Testname** | `TestMeetsRequirements/missing_required` |
| **Beschreibung** | Prüft, dass `false` zurückgegeben wird, wenn ein erforderlicher Index fehlt |
| **Vorbedingungen** | Keine |
| **Eingaben** | `checked: [1,3], required: [1,2]` |
| **Erwartetes Ergebnis** | `false` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-009: TestMeetsRequirements - Leere Required-Liste

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-009 |
| **Testname** | `TestMeetsRequirements/empty_required` |
| **Beschreibung** | Prüft, dass `true` zurückgegeben wird, wenn keine RequiredIndexes definiert sind |
| **Vorbedingungen** | Keine |
| **Eingaben** | `checked: [1,2,3], required: []` |
| **Erwartetes Ergebnis** | `true` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟢 Niedrig |
| **Status** | ✅ Implementiert |

---

#### TC-BE-010: TestMeetsRequirements - Leere Checked-Liste

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-010 |
| **Testname** | `TestMeetsRequirements/empty_checked` |
| **Beschreibung** | Prüft, dass `false` zurückgegeben wird, wenn keine Requirements erfüllt sind |
| **Vorbedingungen** | Keine |
| **Eingaben** | `checked: [], required: [1]` |
| **Erwartetes Ergebnis** | `false` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟢 Niedrig |
| **Status** | ✅ Implementiert |

---

### 1.2 Criterion Utils Tests

**Datei:** `backend/internal/common/criterionUtils_test.go`

---

#### TC-BE-011: TestIsMandatoryCriterion - Doc-Präfix (verschiedene Schreibweisen)

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-011 |
| **Testname** | `TestIsMandatoryCriterion/starts_with_Doc*` |
| **Beschreibung** | Prüft, dass Kriterien mit "Doc", "doc", "DOC" Präfix als Pflichtkriterien erkannt werden |
| **Vorbedingungen** | Keine |
| **Eingaben** | `"Doc1"`, `"doc2"`, `"DOC3"` |
| **Erwartetes Ergebnis** | `true` für alle |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-BE-012: TestIsMandatoryCriterion - A01-A12 Bereich

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-012 |
| **Testname** | `TestIsMandatoryCriterion/in_range_A01-A12` |
| **Beschreibung** | Prüft, dass Kriterien A01-A12 als Pflichtkriterien erkannt werden |
| **Vorbedingungen** | Keine |
| **Eingaben** | `"A01"`, `"a05"`, `"A12"` |
| **Erwartetes Ergebnis** | `true` für alle |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-BE-013: TestIsMandatoryCriterion - Ausserhalb des Bereichs

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-013 |
| **Testname** | `TestIsMandatoryCriterion/out_of_range` |
| **Beschreibung** | Prüft, dass Kriterien ausserhalb A01-A12 nicht als Pflichtkriterien erkannt werden |
| **Vorbedingungen** | Keine |
| **Eingaben** | `"A00"`, `"A13"`, `"B01"`, `"Xoc1"`, `""`, `"A1"` |
| **Erwartetes Ergebnis** | `false` für alle |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-014: TestIsOptionalCriterion - Optionale Kriterien

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-014 |
| **Testname** | `TestIsOptionalCriterion` |
| **Beschreibung** | Prüft die Erkennung optionaler Kriterien (Inverse von Pflichtkriterien) |
| **Vorbedingungen** | Keine |
| **Eingaben** | Verschiedene Kriterien-IDs |
| **Erwartetes Ergebnis** | `false` für "Doc1", "A05"; `true` für "A13", "B01", "" |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-015: TestIsCriterionPart1 - Teil 1 Kriterien (nicht Doc)

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-015 |
| **Testname** | `TestIsCriterionPart1` |
| **Beschreibung** | Prüft, ob ein Kriterium zu Teil 1 gehört (beginnt nicht mit "Doc") |
| **Vorbedingungen** | Keine |
| **Eingaben** | Verschiedene Kriterien-IDs |
| **Erwartetes Ergebnis** | `false` für "Doc1", "doc2"; `true` für "A01", "", "Do" |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-BE-016: TestIsCriterionPart2 - Teil 2 Kriterien (Doc)

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-BE-016 |
| **Testname** | `TestIsCriterionPart2` |
| **Beschreibung** | Prüft, ob ein Kriterium zu Teil 2 gehört (beginnt mit "Doc") |
| **Vorbedingungen** | Keine |
| **Eingaben** | Verschiedene Kriterien-IDs |
| **Erwartetes Ergebnis** | `true` für "Doc1"; `false` für "A01", "" |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

## 2. Frontend Tests

### 2.1 App Component Tests

**Datei:** `frontend/src/App.test.tsx`

---

#### TC-FE-001: Login-Tab ohne ipaId

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-001 |
| **Testname** | `zeigt Login-Tab wenn keine ipaId vorhanden ist` |
| **Beschreibung** | Prüft die korrekte Tab-Anzeige für nicht eingeloggte Benutzer |
| **Vorbedingungen** | - Keine ipaId in localStorage<br>- API-Mocks konfiguriert (getVersions, getAllCriteria) |
| **Eingaben** | Keine (leerer localStorage) |
| **Erwartetes Ergebnis** | - Tabs "Personendaten", "IPA Login", "Alle Kriterien" sichtbar<br>- Tabs "Kriterien erfassen", "Notenberechnung" nicht sichtbar<br>- Version "1.2.3" im Footer |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-FE-002: IPA erstellen Flow

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-002 |
| **Testname** | `createIpa flow:  speichert, zeigt Dialog + toast. success` |
| **Beschreibung** | Testet den vollständigen Flow beim Erstellen eines neuen IPA-Projekts |
| **Vorbedingungen** | - API-Mock:  createIpa gibt {id: "BB01", ... } zurück<br>- Keine ipaId in localStorage |
| **Eingaben** | PersonForm: {firstname: "Max", lastname: "Muster", topic: "IPA", date: "2026-01-17"} |
| **Erwartetes Ergebnis** | - API createIpa wird aufgerufen<br>- toast.success enthält "BB01"<br>- Dialog mit IPA-ID wird angezeigt<br>- Tabs "Kriterien erfassen", "Notenberechnung" erscheinen<br>- IPA-ID im Person-Tab sichtbar |
| **Nachbedingungen** | ipaId "BB01" in localStorage gespeichert |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-FE-003: Bestehende ipaId aus localStorage laden

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-003 |
| **Testname** | `lädt bestehende ipaId aus localStorage und ruft getIpa auf` |
| **Beschreibung** | Prüft das automatische Laden eines bestehenden IPA-Projekts beim App-Start |
| **Vorbedingungen** | - ipaId "BB99" in localStorage<br>- API-Mock: getIpa gibt Projekt mit 2 Kriterien zurück |
| **Eingaben** | localStorage:  `ipaId = "BB99"` |
| **Erwartetes Ergebnis** | - getIpa("BB99") wird aufgerufen<br>- Kriterien-Tab zeigt Anzahl 2<br>- Tabs für eingeloggten Benutzer sichtbar |
| **Nachbedingungen** | Projekt-Daten im State geladen |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-FE-004: Kriterium löschen Flow

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-004 |
| **Testname** | `deleteCriterion flow: ruft deleteCriterion und danach getCriteria` |
| **Beschreibung** | Testet das Löschen eines Kriteriums und die Aktualisierung der Liste |
| **Vorbedingungen** | - ipaId "BB01" in localStorage<br>- Projekt mit 2 Kriterien geladen<br>- deleteCriterion und getCriteria Mocks konfiguriert |
| **Eingaben** | Click auf "delete-criterion" Button |
| **Erwartetes Ergebnis** | - deleteCriterion("BB01", "c1") aufgerufen<br>- getCriteria("BB01") aufgerufen<br>- Kriterien-Anzahl von 2 auf 1 reduziert |
| **Nachbedingungen** | Kriterien-Liste aktualisiert |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-005: Kriterium aktualisieren

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-005 |
| **Testname** | `updateCriterion: wenn personData vorhanden ist, ruft updateCriterion auf` |
| **Beschreibung** | Testet das Aktualisieren eines Kriteriums |
| **Vorbedingungen** | - ipaId "BB01" in localStorage<br>- Projekt mit Kriterium c1 geladen<br>- updateCriterion Mock konfiguriert |
| **Eingaben** | Click auf "update-criterion" Button |
| **Erwartetes Ergebnis** | updateCriterion("BB01", "c1", {id: "c1", ... }) aufgerufen |
| **Nachbedingungen** | Kriterium aktualisiert |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-006: IPA Login Flow

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-006 |
| **Testname** | `ipa login button ruft loadData auf und navigiert zu person` |
| **Beschreibung** | Testet den Login-Flow mit einer existierenden IPA-ID |
| **Vorbedingungen** | - Keine ipaId in localStorage<br>- getIpa Mock gibt Projekt zurück |
| **Eingaben** | - Wechsel zu "IPA Login" Tab<br>- Click auf "login" Button (sendet "BB01") |
| **Erwartetes Ergebnis** | - getIpa("BB01") aufgerufen<br>- Navigation zu "person" Tab<br>- Person-Tab sichtbar |
| **Nachbedingungen** | ipaId gesetzt, Route auf "person" |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

### 2.2 Dialog Component Tests

**Datei:** `frontend/src/components/Dialog.test.tsx`

---

#### TC-FE-007: Dialog geschlossen - Rendert nichts

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-007 |
| **Testname** | `renders nothing when closed` |
| **Beschreibung** | Prüft, dass ein geschlossener Dialog kein DOM-Element rendert |
| **Vorbedingungen** | Keine |
| **Eingaben** | `<Dialog open={false} onClose={fn}>Hi</Dialog>` |
| **Erwartetes Ergebnis** | Container ist leer (toBeEmptyDOMElement) |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-008: Dialog geöffnet - Rendert Titel, Beschreibung, Kinder

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-008 |
| **Testname** | `renders title/description and children when open` |
| **Beschreibung** | Prüft, dass ein geöffneter Dialog alle Inhalte korrekt rendert |
| **Vorbedingungen** | Keine |
| **Eingaben** | `<Dialog open={true} title="My Title" description="Desc" onClose={fn}><div>Child</div></Dialog>` |
| **Erwartetes Ergebnis** | - "My Title" sichtbar<br>- "Desc" sichtbar<br>- "Child" sichtbar<br>- Close-Overlay-Button vorhanden |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-009: Dialog schliessen per Overlay-Click

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-009 |
| **Testname** | `closes when clicking overlay` |
| **Beschreibung** | Prüft, dass ein Click auf das Overlay den Dialog schliesst |
| **Vorbedingungen** | Dialog ist geöffnet |
| **Eingaben** | fireEvent.click auf Overlay-Button |
| **Erwartetes Ergebnis** | onClose wurde 1x aufgerufen |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-010: Dialog schliessen per Close-Button

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-010 |
| **Testname** | `closes when clicking the close button` |
| **Beschreibung** | Prüft, dass ein Click auf den Close-Button den Dialog schliesst |
| **Vorbedingungen** | Dialog ist geöffnet |
| **Eingaben** | fireEvent.click auf Button mit Name "Close" |
| **Erwartetes Ergebnis** | onClose wurde 1x aufgerufen |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-011: Dialog schliessen per Escape-Taste

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-011 |
| **Testname** | `closes on Escape key when open` |
| **Beschreibung** | Prüft, dass die Escape-Taste den Dialog schliesst |
| **Vorbedingungen** | Dialog ist geöffnet |
| **Eingaben** | fireEvent.keyDown(window, {key: "Escape"}) |
| **Erwartetes Ergebnis** | onClose wurde 1x aufgerufen |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟢 Niedrig |
| **Status** | ✅ Implementiert |

---

### 2.3 CriteriaList Component Tests

**Datei:** `frontend/src/components/CriteriaList.test.tsx`

---

#### TC-FE-012: Kriterium erstellen Dialog - Trimming

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-012 |
| **Testname** | `opens create dialog and saves a trimmed criterion` |
| **Beschreibung** | Prüft, dass beim Erstellen eines Kriteriums Whitespace korrekt getrimmt wird |
| **Vorbedingungen** | - Leere Kriterien-Liste<br>- defaultCriteria mit einem Preset |
| **Eingaben** | - Click "Neues Kriterium"<br>- ID: "  A9  ", Titel: "  Title  ", Frage: "  Question  ", Requirement: "  Req 1  "<br>- Form Submit |
| **Erwartetes Ergebnis** | onSaveCriterion mit getrimmten Werten:  {id: "A9", title: "Title", question: "Question", requirements: ["Req 1"]} |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-013: Preset anwenden

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-013 |
| **Testname** | `applyPreset loads a default criterion into the form` |
| **Beschreibung** | Prüft, dass ein Preset die Formularfelder korrekt befüllt |
| **Vorbedingungen** | defaultCriteria enthält Preset PRE1 mit Titel, Frage, 3 Requirements |
| **Eingaben** | - Click "Neues Kriterium"<br>- Select Preset "PRE1" |
| **Erwartetes Ergebnis** | - ID = "PRE1"<br>- Titel = "Preset Title"<br>- Frage = "Preset Question"<br>- 3 Requirement-Felder sichtbar |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-014: RequiredIndexes Verschiebung beim Entfernen

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-014 |
| **Testname** | `removing a requirement shifts requiredIndexes for quality levels` |
| **Beschreibung** | Prüft, dass beim Entfernen einer Anforderung die RequiredIndexes korrekt angepasst werden |
| **Vorbedingungen** | Preset mit 3 Requirements und QualityLevel mit RequiredIndexes [1, 2] |
| **Eingaben** | - Preset laden<br>- Requirement 2 entfernen |
| **Erwartetes Ergebnis** | - Nur noch 2 Requirement-Felder sichtbar<br>- "Kriterium 3" nicht mehr vorhanden |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

### 2.4 API Service Tests

**Datei:** `frontend/src/utils/service/projectApi.test.tsx`

---

#### TC-FE-015: getIpa - Erfolgreiche Abfrage

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-015 |
| **Testname** | `getIpa: returns IPA when id !== AA00` |
| **Beschreibung** | Prüft, dass getIpa bei gültiger ID das IPA-Objekt zurückgibt |
| **Vorbedingungen** | fetch Mock gibt Status 200 mit {id: "BB01"} zurück |
| **Eingaben** | `getIpa("BB01")` |
| **Erwartetes Ergebnis** | - fetch aufgerufen mit korrekter URL<br>- {id: "BB01", name: "x"} zurückgegeben<br>- toast.error nicht aufgerufen |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-FE-016: getIpa - ID "AA00" gibt null zurück

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-016 |
| **Testname** | `getIpa: returns null when API returns id "AA00"` |
| **Beschreibung** | Prüft, dass getIpa null zurückgibt, wenn die API-Antwort id "AA00" enthält |
| **Vorbedingungen** | fetch Mock gibt {id: "AA00"} zurück |
| **Eingaben** | `getIpa("whatever")` |
| **Erwartetes Ergebnis** | `null` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-017: fetchJson - Status 204 gibt null zurück

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-017 |
| **Testname** | `fetchJson: returns null on 204` |
| **Beschreibung** | Prüft, dass bei HTTP 204 (No Content) null zurückgegeben wird |
| **Vorbedingungen** | fetch Mock gibt Status 204 zurück |
| **Eingaben** | `getGrades("X")` |
| **Erwartetes Ergebnis** | `null`, toast.error nicht aufgerufen |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-018: fetchJson - Fehler zeigt Toast

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-018 |
| **Testname** | `fetchJson: calls toast.error and returns null when payload has error` |
| **Beschreibung** | Prüft die Fehlerbehandlung bei API-Fehlern |
| **Vorbedingungen** | fetch Mock gibt Status 400 mit {error: "Boom"} zurück |
| **Eingaben** | `getGrades("X")` |
| **Erwartetes Ergebnis** | - `null` zurückgegeben<br>- toast.error("Boom") aufgerufen |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-FE-019: createIpa - POST Request

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-019 |
| **Testname** | `createIpa: POSTs JSON and returns created IPA` |
| **Beschreibung** | Prüft, dass createIpa einen korrekten POST-Request sendet |
| **Vorbedingungen** | fetch Mock gibt {id: "BB02"} zurück |
| **Eingaben** | `createIpa({firstName: "Ada"})` |
| **Erwartetes Ergebnis** | - fetch mit POST, Content-Type: application/json aufgerufen<br>- Body enthält JSON des PersonData-Objekts<br>- {id: "BB02"} zurückgegeben |
| **Nachbedingungen** | Keine |
| **Priorität** | 🔴 Hoch |
| **Status** | ✅ Implementiert |

---

#### TC-FE-020: getCriteria - Leeres Array bei 204

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-020 |
| **Testname** | `getCriteria: returns [] when null (204)` |
| **Beschreibung** | Prüft, dass getCriteria ein leeres Array zurückgibt bei Status 204 |
| **Vorbedingungen** | fetch Mock gibt Status 204 zurück |
| **Eingaben** | `getCriteria("BB01")` |
| **Erwartetes Ergebnis** | `[]` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-021: createCriterion - POST Request

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-021 |
| **Testname** | `createCriterion: POSTs and returns criterion` |
| **Beschreibung** | Prüft, dass createCriterion einen korrekten POST-Request sendet |
| **Vorbedingungen** | fetch Mock gibt Kriterium zurück |
| **Eingaben** | `createCriterion("BB01", {id: "c1", label: "Quality"})` |
| **Erwartetes Ergebnis** | - fetch mit POST an /api/ipa/BB01/criteria<br>- Kriterium zurückgegeben |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-022: updateCriterion - PUT Request

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-022 |
| **Testname** | `updateCriterion: PUTs and returns updated criterion` |
| **Beschreibung** | Prüft, dass updateCriterion einen korrekten PUT-Request sendet |
| **Vorbedingungen** | fetch Mock gibt aktualisiertes Kriterium zurück |
| **Eingaben** | `updateCriterion("BB01", "c1", {id: "c1", label: "Updated"})` |
| **Erwartetes Ergebnis** | - fetch mit PUT an /api/ipa/BB01/criteria/c1<br>- Aktualisiertes Kriterium zurückgegeben |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-023: deleteCriterion - DELETE Request

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-023 |
| **Testname** | `deleteCriterion: sends DELETE` |
| **Beschreibung** | Prüft, dass deleteCriterion einen korrekten DELETE-Request sendet |
| **Vorbedingungen** | fetch Mock gibt Status 204 zurück |
| **Eingaben** | `deleteCriterion("BB01", "c1")` |
| **Erwartetes Ergebnis** | fetch mit DELETE an /api/ipa/BB01/criteria/c1 |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-024: getAllCriteria - Leeres Array und Liste

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-024 |
| **Testname** | `getAllCriteria: returns [] on null (204) and list on success` |
| **Beschreibung** | Prüft beide Fälle:  leeres Array bei 204, Liste bei Erfolg |
| **Vorbedingungen** | fetch Mock konfiguriert für beide Szenarien |
| **Eingaben** | `getAllCriteria()` (zweimal) |
| **Erwartetes Ergebnis** | - Erstes Mal: `[]`<br>- Zweites Mal: `[{id: "c1"}]` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Implementiert |

---

#### TC-FE-025: getVersions - Plain Text

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-FE-025 |
| **Testname** | `getVersions: returns plain text` |
| **Beschreibung** | Prüft, dass getVersions die Version als String zurückgibt |
| **Vorbedingungen** | fetch Mock gibt "1.2.3" als Text zurück |
| **Eingaben** | `getVersions()` |
| **Erwartetes Ergebnis** | `"1.2.3"` |
| **Nachbedingungen** | Keine |
| **Priorität** | 🟢 Niedrig |
| **Status** | ✅ Implementiert |

---

## 3. Geplante Testfälle

Die folgenden Testfälle sind noch zu implementieren:

### 3.1 Backend - API Handlers

| Test-ID | Testname | Beschreibung | Priorität |
|---------|----------|--------------|-----------|
| TC-BE-P01 | `TestCreateIpaProjectHandler_ValidInput` | Neues IPA-Projekt mit gültigen Daten erstellen | 🔴 Hoch |
| TC-BE-P02 | `TestCreateIpaProjectHandler_InvalidInput` | Fehlerbehandlung bei ungültigen Eingabedaten | 🔴 Hoch |
| TC-BE-P03 | `TestGetIpaProjectHandler_NotFound` | 404 bei nicht existierendem Projekt | 🔴 Hoch |
| TC-BE-P04 | `TestUpdateIpaCriteriaHandler_Success` | Kriterium erfolgreich aktualisieren | 🟡 Mittel |
| TC-BE-P05 | `TestDeleteIpaCriteriaHandler_Success` | Kriterium erfolgreich löschen | 🟡 Mittel |
| TC-BE-P06 | `TestGetGradeHandler_Success` | Notenberechnung erfolgreich durchführen | 🔴 Hoch |

### 3.2 Backend - Store Layer

| Test-ID | Testname | Beschreibung | Priorität |
|---------|----------|--------------|-----------|
| TC-BE-P07 | `TestMongoStore_Connection` | MongoDB-Verbindung aufbauen | 🔴 Hoch |
| TC-BE-P08 | `TestSavePersonData_Success` | Personendaten speichern | 🔴 Hoch |
| TC-BE-P09 | `TestGetIpaProject_NotFound` | Projekt nicht gefunden | 🟡 Mittel |
| TC-BE-P10 | `TestAddCriterionToIpaProject_Duplicate` | Duplikat-ID verhindern | 🟡 Mittel |

### 3.3 Frontend - Komponenten

| Test-ID | Testname | Beschreibung | Priorität |
|---------|----------|--------------|-----------|
| TC-FE-P01 | `PersonForm_Submit` | Formular erfolgreich absenden | 🔴 Hoch |
| TC-FE-P02 | `PersonForm_Validation` | Pflichtfeld-Validierung | 🟡 Mittel |
| TC-FE-P03 | `GradesDisplay_Render` | Notenübersicht korrekt anzeigen | 🔴 Hoch |
| TC-FE-P04 | `GradesDisplay_Loading` | Loading-State anzeigen | 🟢 Niedrig |

### 3.4 E2E Tests

| Test-ID | Testname | Beschreibung | Priorität |
|---------|----------|--------------|-----------|
| TC-E2E-01 | `NewProject_FullFlow` | Kompletter Flow:  Projekt erstellen → Kriterien → Note | 🔴 Hoch |
| TC-E2E-02 | `Login_ExistingProject` | Mit existierender ID einloggen | 🔴 Hoch |
| TC-E2E-03 | `CriterionCheckbox_UpdateGrade` | Checkbox ändert Note in Echtzeit | 🟡 Mittel |

---

## Anhang:  Testfall-Vorlage

Für neue Testfälle kann folgende Vorlage verwendet werden:

```markdown
#### TC-XXX-000: Testname

| Attribut | Beschreibung |
|----------|--------------|
| **Test-ID** | TC-XXX-000 |
| **Testname** | `name_des_tests` |
| **Beschreibung** | Kurze Beschreibung des Testziels |
| **Vorbedingungen** | - Bedingung 1<br>- Bedingung 2 |
| **Eingaben** | Beschreibung der Eingabedaten |
| **Erwartetes Ergebnis** | - Ergebnis 1<br>- Ergebnis 2 |
| **Nachbedingungen** | Beschreibung des Systemzustands nach dem Test |
| **Priorität** | 🔴 Hoch / 🟡 Mittel / 🟢 Niedrig |
| **Status** | ⏳ Geplant / ✅ Implementiert / ❌ Fehlgeschlagen |
```

---

**Erstellt:** 2026-01-19  
**Version:** 1.0  
**Basierend auf:** Codeanalyse der bestehenden Testdateien
