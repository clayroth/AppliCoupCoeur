# Award Bedeez

Site de vote temps réel basé sur Node.js + Socket.IO.

## Pages
- `/phone.html` : page de vote sur téléphone
- `/screen.html` : affichage grand écran avec jauge + QR code
- `/admin.html` : réglage objectif / reset
- `/` : redirige vers la page téléphone

## Déploiement Render
1. Envoyer ce dossier sur GitHub.
2. Sur Render, créer un **Web Service** relié au dépôt.
3. Render détectera `render.yaml`, sinon :
   - Build command : `npm install`
   - Start command : `npm start`
4. Une fois en ligne, ouvrir `/screen.html` sur l’écran principal.
5. Le QR code est généré automatiquement avec l’adresse réelle du site Render.

## Couleurs
- Bleu : `#1683F3`
- Bleu foncé : `#0B66C3`
- Orange : `#FFA400`
- Orange clair : `#FFBE42`

La mascotte utilisée est `public/mascotte-bedeez.png`.
