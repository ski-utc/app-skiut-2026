# Bienvenue sur l'app de Ski'UT 2025 en Expo

## Pour commencer :
1. Installer les dépendances

   ```bash
   npm install
   ```
   
2. Lancer expo

   ```bash
    npx expo start
   ```

3. Lance le serveur Laravel (si j'ai fini de le setup)

## Une fois expo lancé, 2 possibilités
### 1. Lancer Expo sur son téléphone
1. Installe Expo Go sur ton téléphone
2. Appuie sur "s" dans ton terminale qui fait tourner Expo pour passer en mode expo go
3. Scan le QR Code qui apparait dans ton terminal depuis l'app Expo Go sur ton Tél
4. _(Optionnel) : Branche ton téléphone en USB pour que l'app se reload plus vite_

### 2. Lancer un emulateur sur son PC
1. Installe Android Studio 
2. Créé un émulateur sur Andoid Studio ([Vidéo](https://youtu.be/JdQlicAP5W4?si=-o1wGceeZI8_Ob8j))
3. Prie pour qu'il soit détecté par ton terminale


## Quelques explications
* app/  - Contient les fichiers de l'app
* app.json  - C'est pour configurer l'app (nom, icônes, permissions)
* assets/  - On y met les fichiers multimédia
* babel.config.js  -  On touche pas (c'est pour le compilateur)
* components/  - On y stocke des composants de page qu'on réutilise plusieurs fois (header, button, card...)
* constants/  - On y stocke les variables globales (thème, dimensions, appels API)
  * api/  - Contient les fichiers pour config et appeler l'API
    * apiCalls  - Contient les fonctions d'appel API Post et Get
    * apiConfig  - Regroupe les paramètres de config API (mode dev/prod, URL du serveur...)
* expo-env.d.ts  - On touche pas, c'est pour Expo et l'IDE
* hooks/  - On y stocke des fonctions pour gérer des états dans des composants (genre mettre le fond en noir quand on est en Dark Theme)
* package.json  - Permet de stocker les dépendances pour npm install
* package-lock.json  - On touche pas, c'est pour vérif la cohérence entre ton PC et package.json
* ToDo.tkt  - C'est des trucs à faire pour plus tard
* tsconfig.json  - On touche pas, c'est pour le compilateur JS