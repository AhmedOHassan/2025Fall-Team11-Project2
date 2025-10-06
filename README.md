<!-- ![Build](https://img.shields.io/github/actions/workflow/status/AhmedOHassan/2025Fall-Team11-Project2/ci.yml?branch=main) -->
![License](https://img.shields.io/github/license/AhmedOHassan/2025Fall-Team11-Project2)
![Issues](https://img.shields.io/github/issues/AhmedOHassan/2025Fall-Team11-Project2)
![Forks](https://img.shields.io/github/forks/AhmedOHassan/2025Fall-Team11-Project2)
![Stars](https://img.shields.io/github/stars/AhmedOHassan/2025Fall-Team11-Project2)
![Contributors](https://img.shields.io/github/contributors/AhmedOHassan/2025Fall-Team11-Project2)

# SnapMealAI 🍽️

**Empowering Smarter Food Choices with AI**

SnapMealAI helps users make informed, healthy meal decisions by analyzing food images and menus through AI.  
It provides instant ingredient recognition, calorie estimation, allergen alerts, and dietary suggestions, all in one snap!

---

## 🚀 Our Mission

Ordering food online is convenient, but users often don’t know what’s in their meal, especially for visually complex or homemade dishes. Restaurants also struggle to communicate nutritional details quickly.

**SnapMealAI** bridges this gap with AI-powered food understanding.

### 🧠 How It Works
1. Upload or take a photo of a meal or menu.  
2. AI analyzes the image/text to identify ingredients.  
3. SnapMealAI estimates calories, macros, and allergens.  
4. It provides personalized recommendations, including healthier alternatives and portion suggestions.

### 💡 Impact
- **Customers:** Make informed and healthier food choices.  
- **Restaurants:** Provide nutrition transparency and build trust.  
- **Delivery Platforms/Admins:** Differentiate with AI value-added insights.  
- **Healthcare Partners:** Integrate AI-driven nutrition analysis with wellness platforms.

---

## 🗓️ Development Roadmap

### **October – Release 1: Prototype**
- Build frontend with photo upload and capture interface.
- Connect GPT API to analyze menu text.
- Mock or GPT-powered meal recognition model.
- Display nutrition summary + simple delivery recommendation.

### **November – Release 2: Enhanced System**
- Add allergen warnings and dietary filters.
- Suggest healthier alternatives automatically.
- Save user preferences and meal history.
- Build admin dashboard for restaurant verification.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js (TypeScript), Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes, Node.js |
| **ORM** | Prisma |
| **Database** | PostgreSQL (via Prisma) |
| **Auth** | NextAuth.js |
| **Validation** | Zod |
| **AI** | GPT API (OpenAI) |
| **CI/CD** | GitHub Actions |
| **Hosting** | Vercel |

---

## 🛠️ Setup & Installation

```bash
# Clone the repo
git clone https://github.com/AhmedOHassan/2025Fall-Team11-Project2.git
cd 2025Fall-Team11-Project2

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run Prisma migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

---

## 🧪 Testing

```bash
# Run unit and integration tests
npm run test

# Run Coverage
npm run coverage
```

---

## 👥 Contributing

We welcome community contributions!  
See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## 📄 License

This project is licensed under the **GNU V3 License**, see the [LICENSE](LICENSE) file for details.

---

## 🌍 Authors & Team
**Team 11 (Ahmed Hassan, Nolan Witt, JC Migaly, Shounak Deshmukh)**
---
