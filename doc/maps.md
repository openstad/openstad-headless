# Kaarten

Kaarten hebben een clustering optie.

Clustering geeft errors, maar momenteel alleen nog in de preview. De widgets in websites werken probleemloos.

De errors komen niet altijd; het is (dus) een timnig issue. Ik heb een vermoeden dat het een gevolg is van de manier waarop preview widgets steeds worden herladen: er zou dan een proces nog bezig kunnen zijn terwijl de onderliggende kaart al is verdwenen. Dat is dan een issue in de clustermodule, en wellicht dat het de moeite waard is om over een par maanden te kijken of het probleem 'spontaan' is opgelost.

Voor nu wordt clustering in base-map.tsx uitgezet met deze regels:

```
  clustering = {
    isActive: false
  };
```
Vewijder die, en dan werkt het weer.

Clustering als aan/uit optie is bovendien wel beschikbeer in de admin (resourcemap) maar uitgecomment.

