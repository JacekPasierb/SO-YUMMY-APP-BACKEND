# 🍽️ So Yummy - Backend API

## 📝 Opis Projektu

Backend dla aplikacji So Yummy zapewnia API do zarządzania przepisami kulinarnymi, użytkownikami oraz autoryzacją. Został zbudowany z użyciem Node.js i Express, z MongoDB jako bazą danych.

### ✨ Główne Funkcje

- 🔒 Autoryzacja użytkowników z JWT
- 📚 CRUD dla przepisów kulinarnych
- 📧 Wysyłanie e-maili weryfikacyjnych
- ☁️ Przechowywanie obrazów w Cloudinary
- 📊 Dokumentacja API z użyciem Swagger

## 🛠️ Technologie

- Node.js
- Express
- MongoDB & Mongoose
- JWT Authentication
- Passport & Passport JWT
- Cloudinary
- SendGrid
- Joi
- Morgan
- Multer
- Swagger UI Express
- Bcrypt
- CORS
- EJS

## 📚 Dokumentacja API

API jest udokumentowane za pomocą Swaggera. Możesz uzyskać dostęp do dokumentacji pod adresem `/api-docs` po uruchomieniu serwera.

## 💻 Instalacja

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/JacekPasierb/SO-YUMMY-BACKEND.git
   ```

2. Przejdź do katalogu projektu:
   ```bash
   cd SO-YUMMY-BACKEND
   ```

3. Zainstaluj zależności:
   ```bash
   npm install
   ```

4. Utwórz plik `.env` w głównym katalogu i dodaj wymagane zmienne środowiskowe:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

5. Uruchom serwer w trybie deweloperskim:
   ```bash
   npm run start:dev
   ```

## 🔧 Dostępne Skrypty

- `npm start` - uruchamia serwer w trybie produkcyjnym
- `npm run start:dev` - uruchamia serwer w trybie deweloperskim z nodemon
- `npm test` - uruchamia testy jednostkowe i integracyjne
- `npm run lint` - sprawdza kod pod kątem błędów

## 🌟 Funkcjonalności

### Autoryzacja
- Rejestracja użytkownika
- Logowanie
- Weryfikacja email

### Przepisy
- Przeglądanie przepisów
- Dodawanie, edytowanie i usuwanie przepisów
- Zarządzanie ulubionymi przepisami

## 🛠️ Problemy i Rozwiązania

### 1. Problem z Weryfikacją Email
- **Opis**: Wysyłanie e-maili weryfikacyjnych nie działało poprawnie.
- **Rozwiązanie**: Upewniłem się, że konfiguracja SendGrid jest poprawna i dodałem logi do debugowania.

## 👨‍💻 Autor

- [Jacek Pasierb](https://github.com/JacekPasierb)

## 📞 Kontakt

Jeśli masz pytania lub sugestie, skontaktuj się z nami:
- Email: jpasierb@proton.me
- [GitHub Issues](https://github.com/JacekPasierb/SO-YUMMY-BACKEND/issues)