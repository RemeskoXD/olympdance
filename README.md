<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Olymp Dance Olomouc – Web & Administrační portál

Aplikace pro taneční klub Olymp Dance Olomouc (taneční kroužky na školách, letní tábory, e-shop, fotogalerie, klientský portál pro rodiče a administrace).

---

## 🚀 Nasazení na Coolify (Postup krok za krokem)

Tato aplikace obsahuje Express backend (API + nahrávání souborů) a React/Vite frontend. Pro nasazení na Coolify máte dvě jednoduché možnosti:

### Možnost A: Nasazení na Coolify (s vaší externí MySQL databází)

1. V Coolify otevřete svou aplikaci `olympdance.itnahodinu.cz`.
2. V sekci **Configuration / General**:
   - **Build Pack:** zvolte `Dockerfile`
   - **Port:** nastavte na `3000`
3. V sekci **Environment Variables** nastavte buď celou `DATABASE_URL`, nebo jednotlivé proměnné:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=mysql://RemeskoDEV_olymp:VaseHeslo@databaze1.itnahodinu.cz:3306/RemeskoDEV_olymp
   ```
   *(nebo jednotlivě `DB_HOST=databaze1.itnahodinu.cz`, `DB_PORT=3306`, `DB_USER=RemeskoDEV_olymp`, `DB_PASSWORD=...`, `DB_NAME=RemeskoDEV_olymp`)*
4. Klikněte na **Deploy / Redeploy**.
5. Backend se po startu automaticky připojí k databázi, vytvoří všechny tabulky a automaticky nahraje veškerá výchozí data (školy, tábory, fotogalerii, e-shop, administrátora a texty webu).

---

### Možnost B: Nasazení přes Docker Compose (Včetně MySQL databáze)

Pokud chcete spustit aplikaci i s novou MySQL databází přímo v Coolify:
1. V Coolify zvolte **+ New Resource** -> **Docker Compose**.
2. Použijte přiložený soubor `docker-compose.yml`.
3. Klikněte na **Deploy**.

---

## 💻 Lokální spuštění

```bash
# 1. Instalace závislostí
npm install

# 2. Nastavení .env (podle .env.example)
cp .env.example .env

# 3. Spuštění v dev módu
npm run dev
```
Aplikace běží na `http://localhost:3000`.

