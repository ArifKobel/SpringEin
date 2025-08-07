import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

export const i18n = new I18n({
  de: {
    settings: {
      title: "Einstellungen",
    },
    auth: {
      signIn: "Anmelden",
      register: "Registrieren",
      email: "E-Mail",
      password: "Passwort",
      noAccount: "Noch kein Konto?",
      forgotPassword: "Passwort vergessen",
      alreadyHaveAccount: "Hast du bereits ein Konto?",
      sendResetEmail: "E-Mail senden",
      confirmPassword: "Passwort bestätigen",
      name: "Name",
      phone: "Telefonnummer",
      passwordsDoNotMatch: "Passwörter stimmen nicht überein",
      code: "Code",
      verifying: "Verifizieren...",
      verify: "Verifizieren",
      "signUp": "Registrieren",
      "chooseAccountType": "Account-Typ wählen",
      "personAccount": "Person Account",
      "teamAccount": "Team Account",
      "personDescription": "Ich bin Tagesmutter/Tagesvater und suche Stellenangebote",
      "teamDescription": "Wir sind eine Tagesstätte und suchen Personal",
      "continue": "Weiter"
    },
    "home": {
        "welcome": "Willkommen bei SpringEin",
        "subtitle": "Die Plattform für Tagesbetreuung"
    },
    "profile": {
        "title": "Profil",
        "createProfile": "Profil erstellen",
        "editProfile": "Profil bearbeiten",
        "name": "Name",
        "bio": "Über mich",
        "postalCode": "Postleitzahl",
        "phone": "Telefon",
        "maxTravelDistance": "Maximale Reiseentfernung (km)",
        "ageGroups": "Altersgruppen",
        "sharePhone": "Telefonnummer teilen",
        "shareEmail": "E-Mail teilen",
        "facilityName": "Einrichtungsname",
        "description": "Beschreibung",
        "address": "Adresse",
        "contactPersonName": "Ansprechpartner"
    },
    "jobs": {
        "title": "Stellenanzeigen",
        "createJob": "Stelle ausschreiben",
        "myJobs": "Meine Anzeigen",
        "applications": "Bewerbungen",
        "apply": "Bewerben",
        "jobTitle": "Stellentitel",
        "jobDescription": "Stellenbeschreibung",
        "jobType": "Art der Stelle",
        "substitute": "Vertretung",
        "longterm": "Langzeit",
        "startDate": "Startdatum",
        "endDate": "Enddatum",
        "startTime": "Startzeit",
        "endTime": "Endzeit",
        "maxPositions": "Maximale Anzahl Stellen"
    },
    "chat": {
        "title": "Nachrichten",
        "sendMessage": "Nachricht senden",
        "typeMessage": "Nachricht eingeben..."
    },
    "onboarding": {
        "welcome": "Willkommen!",
        "subtitle": "Lass uns dein Profil einrichten",
        "creating": "Account wird erstellt..."
    }
  },
});

i18n.locale = getLocales()[0].languageCode ?? 'en';