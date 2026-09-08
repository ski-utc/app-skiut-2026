# Bienvenue sur l'app de Ski'UT 2026 en Expo

Cette aplication est faite pour fonctionner avec le serveur Laravel de Ski'UT développé en 2025 et mis à jour en 2026

## Préliminaires
L'application de Ski'ut contient plein de features... peut-être trop.

C'est cool d'avoir une appli avec plein de features, mais si le bureau ne joue pas le jeu, ça ne servira à rien
* Si les infos dans le planning ne sont pas à jour, personne ne va le regarder
* Si la com n'a pas informé qu'un prix était à gagner pour la chambre avec le plus de points de défis, ça ne sert à rien
  * Traditionnellement, la chambre avec le plus de points de défis se voyait offrir 200€ à un restau en fin de semaine

Pour ça, je te conseille de te poser en début de semestre avec la team, et demander ouvertement quelle feature on garde, et laquelle dégage. Tu pourras également les prévenir que toute feature que l'on garde devra être supportée par le bureau, auquel cas personne n'ira sur l'app parce qu'elle raconte n'importe quoi.

## Structure du projet

```bash
├── app                 # L'application
├── assets              # Les assets (images, polices, etc.)
├── components          # Des petits composants (boutons, cards, etc.)
├── constants           # La config de la charte graphique, et les appels API
├── contexts            # Contextes, en l'occurrence utilisé pour englober l'application dans un contexte propre à l'utilisateur.ice (user id, user name, etc.)
├── hooks               # Hooks, en l'occurrence utilisé pour utiliser les notifications
├── services            # Services, en l'occurrence utilisé pour setup les notifications
├── app.json            # Config de l'application
├── babel.config.js         # Fait parti de Expo de base : config pour Babel
├── eas.json            # La config Expo (sert surtout pour le build)
├── index.js                # Fait parti de Expo de base : point d'entrée du projet
├── metro.config.js         # Fait parti de Expo de base : gère la config
├── package.json            # Fait parti de Expo de base : liste les deps
├── package-lock.json       # Fait parti de Expo de base : donne les versions précises des deps installées
├── README.md
└── tsconfig.json           # Fait parti de Expo de base : config pour TypeScript
```

## Pour commencer

1. Installer les dépendances
```bash
npm install --legacy-peer-deps
```
   
2. Lancer expo
```bash
   npx expo start
```

3. Lance le serveur Laravel en parallèle

4. Route les requêtes de ton Application vers ton serveur
Modifie l'IP dans `constants/api/apiConfig` pour donner celle de ton serveur Laravel (donc celle de ton PC, obtenable avec `ip address` ou `ifconfig`)
**Attention : Il faut que ton téléphone et ton PC soit sur le même réseau (l'IP c'est propre à un réseau)**

## Une fois expo lancé, 2 possibilités
### 1. Lancer Expo sur son téléphone
---
1. Installe Expo Go sur ton téléphone
2. Appuie sur "s" dans ton terminale qui fait tourner Expo pour passer en mode expo go
3. Scan le QR Code qui apparait dans ton terminal depuis l'app Expo Go sur ton Tél
4. _(Optionnel) : Branche ton téléphone en USB pour que l'app se reload plus vite_

### 2. Lancer un emulateur sur son PC
---
1. Installe Android Studio 
2. Créé un émulateur sur Andoid Studio ([Vidéo](https://youtu.be/JdQlicAP5W4?si=-o1wGceeZI8_Ob8j))
3. Prie pour qu'il soit détecté par ton terminale

## Quelques explications
### Authentification
---
Toute l'application est wrapped dans un UserProvider. Quand le userId est null, l'app n'affiche que le tuto de début. Une fois le userId défini, le user a accès à la vrai app.

Ainsi du PDV du user, il fait le tuto -> va sur la webview de login -> Récupère ses acces et refreshToken stockés en secureStorage -> Le UserContext switch sur la vraie app.

Lorsque le user est déconnecté (il se déconnecte ou son refreshToken est expiré), le userContext rebascule sur le tuto.

### Requêtes au serveur
---
Les requêtes au serveur sont gérées par les fonctions dans ApiCalls, qui utilise les paramètres de ApiConfig (url de domain (pour vérifier que l'auth vient bien de notre serveur) et de requête).
ApiCalls possède 3 fonctions : 
1. Refresh : une fonction utilisée pour requêter sur /skiutc/auth.refresh et récupérer un accessToken à partir du rereshToken
2. apiGet : Réalise une requête GET au serveur. En cas d'erreur d'accessToken essaye de le refesh via la fonction de Refresh. Si l'erreur persiste, le user est déconnecté
3. apiPost : Réalise une requête POST au serveur en passant en paramètre de la requête axios les paramètres envoyés dans le screen qui fait a requête. En cas d'erreur d'accessToken essaye de le refesh via la fonction de Refresh. Si l'erreur persiste, le user est déconnecté

### Architecture (cf. app/_layout.tsx)
---
Comme dit précédemment, l'app est wrapped dans un UserContext (ou UserProvider).
Dans ce user Provider on retrouve 
* Un component Toast (c'est les petits messages en verts ou en rouge qui affichent les réponses du serveur), 
* Ainsi que le Content.

Le content c'est le contenu "utile" de l'app, mais sa structure est un peu particulière.  En gros c'est un Tab.Navigator (pour naviguer via la TabBar) et chaque Tab.Screen (élément dans la navigation via TabBar) est en réalité lui même un autre navigator mais par empilement de pages cette fois (c'est alors un Stack.Navigator).

Par exemple, lorsque je clique sur anecote dans la tabBar, je suis dans mon Tab.Navigator, sur le Tab.Screen/Stack.Navigator anecdoteNavigator et dans le Stack.Screen anecdoteScreen. Ensuite, lorsque je clique sur "envoyer une notification", ma page sendNotification se stacke sur anecdoteScreen. Une fois ma notification envoyée, la page pop et je retourne sur anecdoteScreen

## Mettre l'application mobile en ligne 
Mettre une application mobile en ligne, c'est une vraie galère : tu vas devoir contacter avec le SiMDE, chacun.e répondra en fonction de ses dispo, l'app va se faire refuser 2 à 3 fois par l'app store ou le play store... BREF

Pour ça, je te conseille de t'y prendre bien 1 mois à l'avance, quite à faire une mise à jour de l'app un peu plus tard. Au moins, tu connaitras les étapes et tu auras déjà tout ce qu'il faut.

En parlant de ce qu'il faut, voici une liste non exhaustive de ce qu'il faut : 
* Une description brève (max 80 caractères)
* Une description longue (max 4000 caractères)
* Une image de présentation (au format PNG ou JPEG, peser jusqu'à 15 Mo et mesurer 1 024 px par 500 px). Cette image sera la banière de l'app, qui apparait par exemple [ici](https://play.google.com/store/apps/developer?id=Bureau+des+Etudiants+de+l%27UTC)
* Entre deux et huit captures d'écran de téléphone. Les captures doivent être au format PNG ou JPEG, peser jusqu'à 8 Mo chacune et être en 16:9 ou 9:16, et chaque côté doit mesurer entre 320 px et 3 840 px
* Des captures pour tablettes 7 pouces (au format PNG ou JPEG, peser jusqu'à 8 Mo chacune et être en 16:9 ou 9:16, et chaque côté doit mesurer entre 320 px et 3 840 px)
* Des captures pour tablettes 10 pouces (au format PNG ou JPEG, peser jusqu'à 8 Mo chacune et être en 16:9 ou 9:16, et chaque côté doit mesurer entre 1 080 px et 7 680 px.)

Tu me diras peut-être que ça serait cool qu'on ait notre propre moyen de mettre l'app en ligne, pour ne pas dépendre du BDE...
* Mais pour mettre une app en ligne sur l'app store, il te faut un compte Apple Developer qui coute 100e à l'année et qui est déjà gracieusement payé par le BDE
* Et les accès au play/app store se font via l'adresse mail du BDE... à laquelle on ne doit pas avoir accès par soucis de sécurité/confidentialité

## Des propositions de projets
* Mieux ranger le projet
  * Typiquement les notifications n'ont un peu rien à faire dans `constants/`
  * Un rangement propre serait ça par exemple : 
    * Racine : app.json  assets/  docs/  eas.json  eslint.config.mjs  expo-env.d.ts  package.json  package-lock.json  README.md  src/  tsconfig.json
    * Dans `src/` : api/  app/  components/  hooks/  store/  theme/  types/  utils/
* Remplacer le code hyper complexe dans `constants/api/apiCalls.ts` qui gère le cache et le retry, par la librairy React Query qui fait ça plus proprement

## Un mot de la fin
Kiffe bien ton semestre à Ski'uuuuut !

Tu verras, c'est pas trop compliqué, surtout que les gens n'ont pas des grandes attentes vis-à-vis de l'info. Bilan, tout ce qu'il te reste à faire c'est de profiter à fond pendant les tournées des chambres.

La Biz

> [!NOTE]
>
> Si jamais t'as des galères, n'hésites pas à me DM sur insta : @mathis_dlmr