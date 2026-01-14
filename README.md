# Projekt Bewertungssystem - Modul 324 & 450

Eine Webanwendung zur Verfolgung und Bewertung von Projekten gemäß den Anforderungen der Module 324 (DevOps) und 450 (Testing).

## 📋 Funktionalität

### 1. Personendaten erfassen
- Name, Vorname
- Thema der Arbeit
- Datum der Abgabe
- Speicherung in der Datenbank über Backend-API

### 2. Kriterien-Fortschritt verfolgen
- Darstellung von Kriterien aus JSON (ID, Titel, Leitfrage, Anforderungen, Gütestufen)
- Abhaken von erfüllten Anforderungen
- Notizen zu jedem Kriterium
- Automatische Berechnung der Gütestufe (0-3)
- Persistierung in der Datenbank

### 3. Notenberechnung
- Automatische Berechnung basierend auf Gütestufen
- Separate Berechnung für Teil 1 (Umsetzung) und Teil 2 (Dokumentation)
- Visuelle Darstellung des Fortschritts
- Detailübersicht aller Kriterien

## 🏗️ Technologie-Stack

### Frontend
- **React** mit TypeScript
- **Tailwind CSS** für Styling
- **Shadcn/ui** Komponenten-Bibliothek
- **Sonner** für Toast-Benachrichtigungen

### Backend
- **Supabase Edge Functions** (Hono Web Framework)
- **Deno** Runtime
- REST API mit CORS-Support
- Ausführliche Fehlerbehandlung und Logging

### Datenbank
- **Supabase Key-Value Store** (PostgreSQL)
- Speicherung von:
    - Personendaten
    - Kriterien (JSON)
    - Fortschritt pro Kriterium
    - Notizen

## 📊 Datenmodell

### Key-Value Store Schema

```
person_data: {
  lastname: string,
  firstname: string,
  topic: string,
  date: string
}

criteria_json: [
  {
    id: string,
    title: string,
    question: string,
    requirements: string[],
    gutestufen: {
      "0": string,
      "1": string,
      "2": string,
      "3": string
    }
  }
]

criterion_progress_{id}: {
  checkedRequirements: number[],
  grades: string
}
```

## 🔌 API-Endpunkte

### Personendaten
- `POST /make-server-e2bf8d92/person` - Personendaten speichern
- `GET /make-server-e2bf8d92/person` - Personendaten abrufen

### Kriterien
- `GET /make-server-e2bf8d92/criteria` - Alle Kriterien abrufen

### Fortschritt
- `POST /make-server-e2bf8d92/progress` - Fortschritt speichern
- `GET /make-server-e2bf8d92/progress/:id` - Fortschritt für Kriterium abrufen

### Notenberechnung
- `GET /make-server-e2bf8d92/grades` - Berechnung aller Noten und Gütestufen

## 🎯 Gütestufen-Berechnung

Die Gütestufe für jedes Kriterium wird basierend auf der Anzahl erfüllter Anforderungen berechnet:

- **Gütestufe 3**: Alle Anforderungen erfüllt
- **Gütestufe 2**: 4-5 Anforderungen erfüllt
- **Gütestufe 1**: 2-3 Anforderungen erfüllt
- **Gütestufe 0**: Weniger als 2 Anforderungen erfüllt

### Notenberechnung

Die Note wird aus dem Durchschnitt der Gütestufen berechnet:

```
Note = (Durchschnitt Gütestufe / 3) × 5 + 1
```

- **Teil 1** (Umsetzung): Kriterien A, B, C
- **Teil 2** (Dokumentation): Kriterien DOC, G, H

## 🚀 Verwendung

1. **Personendaten erfassen**: Geben Sie Ihre persönlichen Daten ein
2. **Kriterien bearbeiten**: Haken Sie erfüllte Anforderungen ab und fügen Sie Notizen hinzu
3. **Note berechnen**: Sehen Sie Ihre aktuelle Note basierend auf Ihrem Fortschritt

## 🔒 Sicherheitshinweise

- Sensible Daten werden über HTTPS übertragen
- Authorization-Header mit Supabase Public Key
- CORS konfiguriert für sichere API-Aufrufe
- Eingabevalidierung auf Backend-Seite

## 📝 Beispiel-Kriterien

Die Applikation enthält 3 vordefinierte Kriterien:

1. **A01** - Requirements Engineering
2. **C02** - Datenmodell entwickeln
3. **DOC01** - Dokumentation

Diese Kriterien können durch Bearbeitung der JSON-Daten im Backend erweitert werden.

## 🧪 Testing & DevOps

Dieses Projekt wurde entwickelt, um die Anforderungen der Module 324 und 450 zu erfüllen:

### Modul 324 (DevOps)
- Automatisiertes Build-System
- CI/CD-Pipeline Integration möglich
- Systematische Versionskontrolle
- Code-Qualität durch TypeScript

### Modul 450 (Testing)
- Testbare Architektur
- Klare Trennung Frontend/Backend
- Dokumentierte API-Endpunkte
- Fehlerbehandlung und Logging

## 📄 Lizenz

Dieses Projekt wurde für Bildungszwecke erstellt.
