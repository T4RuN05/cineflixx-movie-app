# 🎬 Cineflixx — Your Ultimate Film Explorer 🍿

Cineflixx is a sleek, modern movie discovery web app built with **Next.js 15**, **TailwindCSS**, and the **TMDB API**.  
It allows users to **search, explore, and discover movies**, offering an immersive interface with live suggestions, dynamic routes, and elegant UI components.

---

## 🌟 Features

- 🔍 **Live Search Bar** — instantly fetch movie suggestions as you type  
- 🎞️ **Detailed Movie Pages** — view complete movie details dynamically  
- 🧭 **Dashboard View** — explore trending and popular movies effortlessly  
- 📱 **Responsive UI** — fully optimized for mobile, tablet, and desktop  
- ⚡ **Optimized Performance** — server-side rendering with Next.js for speed  
- 🌙 **Dark Mode Ready** — clean, minimal, and visually appealing interface  

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-------------|----------|
| **Next.js 15** | Framework for building SSR/SSG React apps |
| **Tailwind CSS** | Utility-first styling for fast, responsive design |
| **TMDB API** | Movie data source (titles, posters, details, etc.) |
| **TypeScript** | Type-safe, scalable code |
| **Vercel** | Deployment and CI/CD hosting |

---

## ⚙️ Setup Instructions (Run Locally)

Follow these steps to run Cineflixx on your local environment 👇

### 1. Clone the Repository
```bash
git clone https://github.com/T4RuN05/cineflixx-movie-app.git
cd cineflixx-movie-app
```

### 2. Install Dependencies
Make sure you have **Node.js (v18+)** installed.
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory and add:
```bash
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```
> You can get an API key by signing up at [TMDB Developer Portal](https://developer.themoviedb.org/).

### 4. Run the Development Server
```bash
npm run dev
```
Your app will now be live at 👉 [http://localhost:3000](http://localhost:3000)

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🧩 Folder Structure

```
cineflixx-movie-app/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── movie/[id]/
│   │   └── page.tsx
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── MovieCard.tsx
│   │   └── InfiniteMovieGrid.tsx
│   └── context/
│       └── AppContext.tsx
├── public/
│   └── placeholder.png
├── next.config.ts
└── package.json
```

---

## 💡 Future Enhancements
- 🧠 Personalized recommendations  
- ❤️ Watchlist & Favorites  
- 🗂️ Genre-based filtering and sorting  
- 🌍 Multi-language support  

---

## 💬 Credits
- Movie data powered by [TMDB API](https://www.themoviedb.org/)  
- Designed & Developed by **[Tarun](https://github.com/T4RuN05)** 💻

---

> _“Movies touch our hearts and awaken our vision.” — Martin Scorsese_
