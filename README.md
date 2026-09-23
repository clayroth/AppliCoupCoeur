# LIVE PROGRESS CROWD — version Local + Render

Cette version fonctionne :
- en local sur ton PC ;
- sur le Wi-Fi local ;
- en ligne sur Render ;
- avec QR code automatique.

---

## 1. TESTER SUR TON PC

Dans le dossier du projet :

```bash
npm install
npm start
```

Si PowerShell bloque npm :

```powershell
npm.cmd install
npm.cmd start
```

Ensuite ouvre :

http://localhost:3000/screen.html

Le QR code pointe automatiquement vers l'adresse IP locale du PC.

---

## 2. METTRE LE PROJET SUR GITHUB

1. Crée un compte GitHub si nécessaire.
2. Crée un nouveau repository.
3. Envoie tout le contenu de ce dossier dans le repository.

Important :
- `package.json`
- `server.js`
- `render.yaml`
- dossier `public`

doivent être à la racine du repository.

---

## 3. DÉPLOYER SUR RENDER

Sur Render :

1. New
2. Web Service
3. Connecte ton compte GitHub.
4. Sélectionne le repository.
5. Render détectera le projet Node.js.

Valeurs si Render te les demande :

Build Command:
npm install

Start Command:
npm start

Health Check Path:
/health

Le serveur utilise automatiquement la variable `PORT` fournie par Render.

Une fois le déploiement terminé tu obtiendras une URL du genre :

https://live-progress-crowd.onrender.com

Ouvre alors :

https://live-progress-crowd.onrender.com/screen.html

Le QR code pointera AUTOMATIQUEMENT vers :

https://live-progress-crowd.onrender.com/phone.html

Les spectateurs peuvent alors utiliser Wi-Fi, 4G ou 5G.

---

## 4. MODIFIER LES TEXTES

Ouvre :

public/config.js

Tu peux modifier les titres, le bouton BOOST, les instructions, etc.

---

## 5. AJOUTER UN LOGO

Mets ton image dans :

public/images/

Exemple :

public/images/logo.png

Puis dans :

public/config.js

change :

logo: ""

par :

logo: "logo.png"

Le logo apparaîtra sur l'écran géant ET sur les téléphones.

---

## 6. MODIFIER LE NOMBRE DE CLICS

Dans `server.js` :

```js
const BOOST_PER_TAP = 0.25;
```

Exemples :

- `1` = 100 clics
- `0.5` = 200 clics
- `0.25` = 400 clics
- `0.1` = 1000 clics
- `0.05` = 2000 clics

---

## IMPORTANT POUR UN SPECTACLE

Sur une offre d'hébergement gratuite, le serveur peut être mis en veille après une période sans activité.

Avant le spectacle :
1. ouvre `/screen.html` quelques minutes avant ;
2. vérifie le QR code ;
3. scanne-le avec un téléphone en 4G ;
4. fais plusieurs BOOST ;
5. garde l'écran ouvert pendant l'animation.

---

## URLS

Écran :
`/screen.html`

Téléphone :
`/phone.html`

Test serveur :
`/health`

Configuration réseau :
`/config/network`

QR :
`/qr.png`


---

## VERSION COUP DE CŒUR 2026

Cette version a été retravaillée visuellement :

- thème : **Coup de cœur de la saison 2026**
- couleurs plus chaleureuses / événementielles
- textes déjà adaptés
- **apparition de cœurs animés sur l'écran géant à chaque clic**
- petit effet cœur aussi sur le téléphone

### Personnalisation rapide

Dans `public/config.js`, tu peux modifier :

- le titre
- le sous-titre
- le texte du bouton
- le message final
- le logo

### Où modifier l’effet des cœurs ?

L’animation principale des cœurs de l’écran est dans :

`public/screen.html`

Recherche la fonction :

`spawnHearts(count = 1)`

et la ligne :

`socket.on("boostEffect", () => { spawnHearts(3); });`

Si tu veux plus de cœurs par clic, remplace `3` par `5`, `8`, etc.
