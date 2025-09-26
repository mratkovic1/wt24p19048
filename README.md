# WT24P19048 – Web Technologies Coursework Project

## 📖 Overview  
This project was developed as part of the **Web Technologies** course at the University of Sarajevo (ETF).  
It was implemented iteratively across **four spirals (phases)**, each adding new functionality and complexity.  
The final result is a responsive, interactive web application for managing and browsing real estate listings.

---

## 🔹 Spiral 1 – Static Interface  
- Created the basic **HTML and CSS layout**.  
- Navigation menu with icons and animations.  
- Redesigned pages using **Flexbox** instead of Grid.  
- Responsive layouts (different display depending on screen width).  
- New page `vijesti.html` with various news layouts.  

---

## 🔹 Spiral 2 – Interactivity & Statistics  
- Implemented **carousel.js** for left/right navigation through elements.  
- Added logic for property statistics:  
  - average square footage,  
  - outlier analysis,  
  - properties by user,  
  - histogram of prices by time periods.  
- New page `statistika.html` with interactive charts (**Chart.js**).  

---

## 🔹 Spiral 3 – Backend Extensions  
- Introduced server-side validation and new routes (Node.js/Express):  
  - `POST /login` – login with attempt limits (temporary lockout).  
  - `GET /nekretnine/top5?lokacija=...` – last 5 properties by location.  
  - `POST /upit` – limited to max 3 inquiries per user/property.  
  - `GET /upiti/moji` – all inquiries of the logged-in user.  
  - `GET /nekretnina/:id` – property details with first 3 inquiries.  
  - `GET /next/upiti/nekretnina/:id?page=PAGE` – lazy loading inquiries.  
- Extended **PoziviAjax** module with new API methods.  
- New page `mojiUpiti.html`.  

---

## 🔹 Spiral 4 – Database & Advanced Features  
- Migrated backend to **MySQL** database using **Sequelize ORM**.  
- Database schema includes: `Korisnik` (User), `Nekretnina` (Property), `Upit` (Inquiry), `Zahtjev` (Request), `Ponuda` (Offer).  
- Added boolean `admin` flag to users (admin:admin, user:user).  
- Implemented entity relationships (properties – interests, offers, requests).  
- New routes:  
  - `GET /nekretnina/:id/interesovanja` – returns inquiries/requests/offers (admin vs user view).  
  - `POST /nekretnina/:id/ponuda` – create offers, connect & reject competing ones.  
  - `POST /nekretnina/:id/zahtjev` – request for a property visit.  
  - `PUT /nekretnina/:id/zahtjev/:zid` – admin approves/rejects requests.  
- Extended frontend with forms and dynamic interest displays.  
- AJAX communication handled via **PoziviAjax**.  

---

## 🛠️ Technologies  
- **Frontend:** HTML5, CSS3, JavaScript, Chart.js  
- **Backend:** Node.js, Express, Sequelize ORM  
- **Database:** MySQL  
- **Version Control:** Git & GitHub  

---

## 🚀 How to Run  
1. Clone the repository:  
   ```bash
   git clone https://github.com/mratkovic1/wt24p19048.git
   cd wt24p19048
2. Install dependencies:
   npm install
3. Configure the database in config.json (Sequelize).
4. Run the server:
   npm start
5. Open index.html in the browser.
