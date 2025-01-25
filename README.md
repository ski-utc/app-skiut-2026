# Bienvenue sur l'app de Ski'UT 2025 en Expo

Cette aplication est faite pour fonctionner avec le serveur Laravel de Ski'UT développé en 2025

## Pour commencer :
1. Installer les dépendances

   ```bash
   npm install
   ```
   
2. Lancer expo

   ```bash
    npx expo start
   ```

3. Lance le serveur Laravel sur l'IP de ta machine (php artisan serve --host=Ip.De.Ton.Pc)

4. Route les requêtes de ton App vers ton serveur
Modifie l'IP dans constants/api/apiConfig pour donner celle de ton serv Laravel
**Attention : Il faut que ton téléphone et ton PC soit sur le même réseau (l'IP c'est propre à un réseau)**

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
### Authentification
Toute l'application est wrapped dans un UserProvider. Quand le userId est null, l'app n'affiche que le tuto de début. Une fois le userId défini, le user a accès à la vrai app.
Ainsi du PDV du user, il fait le tuto -> va sur la webview de login -> Récupère ses acces et refreshToken stockés en secureStorage -> Le UserContext switch sur la vraie app.
Lorsque le user est déconnecté (il se déconnecte ou son refreshToken est expiré), le userContext rebascule sur le tuto.

### Requêtes au serveur
Les requêtes au serveur sont gérées par les fonctions dans ApiCalls, qui utilise les paramètres de ApiConfig (url de domain (pour vérifier que l'auth vient bien de notre serveur) et de requête).
ApiCalls possède 3 fonctions : 
1. Refresh : une fonction utilisée pour requêter sur /skiutc/auth.refresh et récupérer un accessToken à partir du rereshToken
2. apiGet : Réalise une requête GET au serveur. En cas d'erreur d'accessToken essaye de le refesh via la fonction de Refresh. Si l'erreur persiste, le user est déconnecté
3. apiPost : Réalise une requête POST au serveur en passant en paramètre de la requête axios les paramètres envoyés dans le screen qui fait a requête. En cas d'erreur d'accessToken essaye de le refesh via la fonction de Refresh. Si l'erreur persiste, le user est déconnecté

### Architecture (cf. app/_layout.tsx)
Comme dit précédemment, l'app est wrapped dans un UserContext (ou UserProvider).
Dans ce user Provider on retrouve un component Toast (c'est les petits messages en verts ou en rouge qui affichent les réponses du serveur), ainsi que le Content.
Le content c'est le contenu "utile" de l'app, mais sa structure est un peu particulière. En gros c'est un Tab.Navigator (pour naviguer via la TabBar). Chaque Tab.Screen est en réalité un Stack.Navigator de screens. par exemple, lorsque je clique sur anecote dans la tabBar, je suis dans mon Tab.Navigator, sur le Tab.Screen/Stack.Navigator anecdoteScreen. Ainsi, lorsque je clique sur "envoyer une notification", ma page sendNotification se stacke sur anecdoteScreen. Une fois ma notification envoyée, la page pop et je retourne sur anecdoteScreen
