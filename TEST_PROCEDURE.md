# Procédure de Test E2E - Time's Up!

## Prérequis
- Serveur de dev lancé (`npm run dev`)
- Navigateur Chrome ouvert sur `http://localhost:5173` (ou port affiché)

---

## Test 1: Création de partie (30s)

1. **Page d'accueil**
   - [ ] Le titre "Time's Up!" s'affiche
   - [ ] Le champ "Ton prénom" est visible
   - [ ] Les paramètres affichent "5 mots" et "60s" par défaut

2. **Validation**
   - [ ] Cliquer "C'est parti!" sans prénom → erreur affichée
   - [ ] Entrer "Alice" et cliquer "C'est parti!" → redirection vers /words

---

## Test 2: Entrée des mots (2min)

1. **Premier joueur (Alice)**
   - [ ] Le nom "Alice" s'affiche en haut
   - [ ] Progression affiche "0/5"
   - [ ] Entrer 5 mots: "Chat", "Soleil", "Voiture", "Maison", "Pizza"
   - [ ] Chaque mot s'ajoute à la liste avec animation
   - [ ] Bouton "Valider mes mots" apparaît à 5/5
   - [ ] Cliquer "Valider" → écran "Mots enregistrés!"

2. **Ajouter 3 joueurs supplémentaires**
   - [ ] Ajouter "Bob" → entrer 5 mots → valider
   - [ ] Ajouter "Charlie" → entrer 5 mots → valider
   - [ ] Ajouter "David" → entrer 5 mots → valider
   - [ ] Bouton "Passer aux équipes (4 joueurs)" visible

3. **Validation des mots**
   - [ ] Tester doublon: entrer un mot déjà existant → erreur
   - [ ] Tester suppression: cliquer X sur un mot → mot retiré

---

## Test 3: Formation des équipes (30s)

1. **Page équipes**
   - [ ] 4 joueurs affichés dans "Joueurs à assigner"
   - [ ] Équipe Bleue et Équipe Jaune vides

2. **Attribution**
   - [ ] Cliquer "Mélanger au hasard"
   - [ ] 2 joueurs dans chaque équipe
   - [ ] Bouton "C'est parti!" devient actif (vert)

3. **Validation**
   - [ ] Les équipes sont équilibrées (2-2)

---

## Test 4: Phase de jeu (2min)

1. **Démarrage Phase 1**
   - [ ] "Phase 1 - Free Description" affiché
   - [ ] **BUG CONNU**: Nom du joueur actif non affiché avant "Démarrer"
   - [ ] Timer à 1:00
   - [ ] Scores: Équipe Bleue 0 / Équipe Jaune 0

2. **Tour de jeu**
   - [ ] Cliquer "Démarrer le tour"
   - [ ] Timer démarre, mot affiché
   - [ ] "20 mots restants" affiché
   - [ ] Nom du joueur actif maintenant visible

3. **Actions pendant le tour**
   - [ ] Cliquer "Trouvé!" → confetti, nouveau mot, score +1, mots restants -1
   - [ ] Cliquer "Passer" → nouveau mot, mots restants inchangé
   - [ ] Laisser timer expirer → changement d'équipe automatique

4. **Changement d'équipe**
   - [ ] L'autre équipe prend le relais
   - [ ] Le "Prochain tour" indique le bon joueur

5. **Fin de phase**
   - [ ] Deviner tous les mots → redirection vers /phase-summary
   - [ ] **BUG CONNU**: Scores de phase incorrects (calcul alterné)

---

## Test 5: Résumé de phase (30s)

1. **Affichage**
   - [ ] "Phase 1 terminée!" affiché
   - [ ] Confetti au chargement
   - [ ] Scores de la phase affichés (vérifier cohérence avec jeu)
   - [ ] "Prochaine phase: Phase 2 - One Word"

2. **Continuation**
   - [ ] Cliquer "Phase suivante" → retour à /play
   - [ ] Phase 2 démarre correctement

---

## Test 6: Phases 2 et 3 (1min chaque)

1. **Phase 2 - One Word**
   - [ ] Description "Give only ONE word as a clue!"
   - [ ] Même pool de mots mélangé
   - [ ] Compléter la phase

2. **Phase 3 - Mime**
   - [ ] Description "Act it out! No words allowed!"
   - [ ] Compléter la phase → redirection /game-over

---

## Test 7: Fin de partie (30s)

1. **Page Game Over**
   - [ ] Confetti continu
   - [ ] Gagnant annoncé (ou "Égalité!")
   - [ ] Score final affiché
   - [ ] Score par phase listé
   - [ ] **BUG CONNU**: Scores potentiellement incorrects

2. **Rejouer**
   - [ ] Cliquer "Nouvelle partie" → retour à /
   - [ ] Aucune donnée de l'ancienne partie

---

## Test 8: Persistance (30s)

1. **Refresh en cours de partie**
   - [ ] Rafraîchir la page pendant la phase de mots
   - [ ] Les données sont conservées (localStorage)
   - [ ] Redirection automatique vers la bonne page

2. **Reset**
   - [ ] Bouton "Retour" disponible sur chaque page
   - [ ] "Nouvelle partie" réinitialise tout

---

## Test 9: Edge Cases (1min)

1. **Minimum joueurs**
   - [ ] Avec 3 joueurs: bouton "Passer aux équipes" non visible
   - [ ] Avec 4 joueurs: bouton visible

2. **Timer**
   - [ ] Timer devient rouge à 10s
   - [ ] Animation de pulsation active
   - [ ] Timer atteint 0:00 → fin de tour automatique

3. **Dernier mot**
   - [ ] Deviner le dernier mot → transition immédiate vers résumé

---

## Checklist Rapide (Version Express ~5min)

Pour un test rapide, effectuer uniquement:

1. [ ] Créer partie avec "Test"
2. [ ] Ajouter 3 joueurs avec 3 mots chacun (modifier paramètres)
3. [ ] Mélanger équipes au hasard
4. [ ] Jouer Phase 1: deviner 3-4 mots, laisser timer expirer
5. [ ] Vérifier changement d'équipe
6. [ ] Terminer Phase 1
7. [ ] Vérifier scores sur résumé
8. [ ] Continuer jusqu'à Game Over
9. [ ] Vérifier scores finaux
10. [ ] Nouvelle partie fonctionne

---

## Bugs Connus à Vérifier Après Correction

- [ ] Joueur actif affiché AVANT de cliquer "Démarrer"
- [ ] Scores de phase correspondent aux vrais scores
- [ ] Scores réinitialisés entre les phases
- [ ] Cercle du timer s'anime correctement
