# Noor Library - Islamic Books Digital Library

Noor Library is a modern, fast, and SEO-optimized digital library for Islamic books. Users can explore various categories like Quran, Hadith, Tafsir, and Fiqh, search for books in real-time with AI-powered suggestions, and read PDFs directly in the browser.

## ✨ Features

- **Warm Islamic Aesthetic**: Custom designed UI with a warm organic feel.
- **Advanced Search**: Real-time filtering with AI-powered suggestions (via Gemini).
- **In-Browser Reader**: Powerful PDF viewing experience without leaving the site.
- **Admin Dashboard**: Manage books with drag-and-drop reordering and easy upload.
- **Multi-language Support**: Support for English, Urdu, and Hindi.
- **User Favorites**: Save books for later (Requires login).
- **Responsive Design**: Mobile-first approach for reading on any device.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Motion (animation)
- **Backend**: Express (for Gemini API proxy)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google & Email)
- **PDF Viewing**: React PDF Viewer (Mozilla PDF.js)
- **Drag & Drop**: dnd-kit

## 🚀 Setup & Deployment

### Environment Variables

Configure the following secrets in AI Studio:

- `GEMINI_API_KEY`: Your Google AI Studio API Key.
- `APP_URL`: The URL where the app is deployed.

### Running Locally

1. Clone the project.
2. Run `npm install`.
3. Run `npm run dev`.

### Deployment

The app is ready for deployment on **Vercel** or **GitHub Pages**. (Note: GitHub Pages requires a static site build; for the full-stack features, Vercel or Cloud Run is recommended).

## 🛡️ Security

Firestore security rules are implemented following the **Eight Pillars of Hardened Rules**, ensuring data integrity and user privacy.

- **Admin Access**: Currently restricted to `nadimalam1203@gmail.com`.
- **Public Read**: All books and categories are public.
- **Authenticated Write**: Favorites are restricted to the owner.

## 📖 Sample Data

You can seed the library with sample books by navigating to the Admin Dashboard (after logging in as admin) and clicking the **"Seed Sample Data"** button.

---
Built with ❤️ by AI Studio
