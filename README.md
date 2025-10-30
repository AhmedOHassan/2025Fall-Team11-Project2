<!-- ![Build](https://img.shields.io/github/actions/workflow/status/AhmedOHassan/2025Fall-Team11-Project2/ci.yml?branch=main) -->
<!-- Project Info -->
[![coverage](https://codecov.io/gh/AhmedOHassan/2025Fall-Team11-Project2/branch/main/graph/badge.svg)](https://codecov.io/gh/AhmedOHassan/2025Fall-Team11-Project2)
[![License](https://img.shields.io/github/license/AhmedOHassan/2025Fall-Team11-Project2)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Active-blue.svg)](CODE_OF_CONDUCT.md)
[![Install Guide](https://img.shields.io/badge/Install-Guide-important.svg)](INSTALL.md)

<!-- Tech Stack -->
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

<!-- Community -->
[![Discussions](https://img.shields.io/badge/Chat-Discussions-orange.svg)](../../discussions)
![Issues](https://img.shields.io/github/issues/AhmedOHassan/2025Fall-Team11-Project2)
![Pull Requests](https://img.shields.io/github/issues-pr/AhmedOHassan/2025Fall-Team11-Project2)

<!-- Project Stats -->
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
- Implement authentication flow with Signup, Login, and Home page.
- Build a frontend UI to upload a single food-item photo (either a photo of a menu item or an image downloaded online) and submit it for analysis.
- Integrate the GPT API to analyze the uploaded single-item image and return structured results: ingredients and details, nutrition summary, allergen warnings, healthier alternatives/suggestions, and a simple delivery recommendation.
- Build a frontend UI to display the analysis results (nutrition summary, ingredients & details, allergen warnings, healthier alternatives, and delivery recommendation).

### **November – Release 2: Enhanced System**
- Add camera capture UI to allow users to take a real-time photo of a single menu item or food and submit it directly for analysis.
- Save image analysis results and build a history page where users can view, search, and re-open previously analyzed images.
- Allow users to specify allergy preferences in their profile and include them with analysis requests so the API can surface personalized allergen warnings.
- Build admin dashboard for managing user accounts.

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

To run SnapMealAI locally, follow the full installation guide here: [INSTALL.md](INSTALL.md)

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
