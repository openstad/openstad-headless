# Kaarten

Deze componenten omvatten een basiskaart, en drie typen specifieke kaarten.

De kaart is gebaseeerd op [react-leaflet](https://react-leaflet.js.org/) met [react-leaflet-cluster](https://akursat.gitbook.io/marker-cluster/).

De basiskaart, en daarmee de specifieke kaarten, kennen de volgende configuratie opties. Alles wat verder wordt meegestuurd wordt onveranderd door gestuurd naar de Leaflet MapContainer.

### project opties

De volgende opties worden op project niveau gezet en zijn in in de standaard headless opzet altijd beschikbaar:
```
area: LocationType[]
```
Een set van lat/lng waarden wordt getekend als polyline, waarbij het gebied buiten de line wordt verdonkerd.

```
areaPolygonStyle?: any,
```
Een ongefdefinieerde set van styling opties voor het tekenenen van de area.

### standaard opties

#### map tiles

```
tiles?: {
  url: string,
  subdomains?: string,
  attribution?: string,
},
minZoom?: number,
maxZoom?: number,
```
Attributen van de Leaflet Tileslayer

```
tilesVariant?: string,
```
Een aantal prefab varianten van tiles settings; voor nu zijn dat:  
`openstreetmap` voor de standaar OSM tiles  
`amaps` gebruikt de tegels van de Gemeente Amsterdam  
`nlmaps` is "Dé officiële kaart van Nederland"  

#### markers

```
markers?: MarkerProps[]
```
Markers kun je meesturen als array van Marker objecten.  
Per marker zijn de volgende settings beschikbaar; ook hier worden extra settings doorgestuurd naar het Leaflet Marker component.

```
  lat?: number,
  lng?: number,
  location?: Location,
```
Verschillende toepassingen gebruiken of het een of het ander; vandaar deze extra flexibiliteit

```
isFaded?: boolean,
isVisible?: boolean,
```
Zie [ToDo](#todo)
```
icon?: MarkerIcon,
iconCreateFunction?: () => any,
```
Zie [icons](#icons)
```
href?: string,
onClick?: (e: LeafletMouseEvent, map: any) => void,
```
`href` genereert automatisch een functie `onClick = (e) => { document.location.href = href }`

#### icons

```
  defaultIcon?: string,
  iconCreateFunction?: () => string,
```
Moet nog verder uitgewerkt

#### overig
```
autoZoomAndCenter?: 'area' | 'markers',
```
Bij het laden kan de kaart worden gecentreerd en ingezoomd op de `area` of op de geladen `markers`

### cluster opties

```
{
  clustering: {
    isActive: boolean,
    ...
  }
}
```
Voor configuratie van clustering is er de parameter `clustering`. Daarin bepaalt `isActive` of er uberhaubt geclustered wordt. De rest wordt doorgestuurd naar [react-leaflet-cluster](https://akursat.gitbook.io/marker-cluster/api).   

Individuele markers kun je buiten de clustering houden met de marker optie
```
doNotCluster?: boolean
```

![clusterimage](./img/cluster-icon.png)
De default `iconCreateFunction` is afgeleid van de kaarten van de Gemeente Amsterdam. Daar worden clusters getekent als een cirkel met daaarin het aantal elementen in het cluster. De kleuren van de cirkel tonen de [cetagorieën](#categorizering) van die icons, wanneer van toepassing.

### categorizering

```
{
  categorize: {
    categorizeByField: string,
    categories: any,
    ...
  }
}
```
Categorisering wordt op twee niveaus gebruikt: het kan bepalen welke marker-icons worden gebruikt, en bepaalt de kleuren in een [cluster icon](#cluster-opties). Voor categorizering wordt het de inhoud van het `data` veld in een marker vergeleken met de waarde van `categorizeByField`.

## Events

```
osc-map-is-ready
```

```
  onClick?: (e: Event, map: any) => void,
  onMarkerClick?: (e: Event, map: any) => void,
```

## De resource-details-map

De `resource-details-map` is een basis kaart die alleen een projectId en een resourceId nodig heeft om de locatie van die resource te tonen.

## De editor-map

De `editor-map` is een form field waarop een gebruiker een locatie kan kiezen. Het resultaat wordt als hidden input toegevoegd, waarin de gekozen locatie als `{"lat" x, "lmg": y}` string wordt geplaatst.

## De resource-overview-map

De `resource-overview-map` is een basis kaart die alleen een projectId nodig heeft om de locaties van alle die resources op een kaart te tonen.

Daarnaast gebruikt deze kaart tags als categorieen voor [categorizering](#categorizering). Daarmee is het heel eenvoudig om een kaart te maken waar alle ingezonden resources worden weergegeven op basis van een type. Bijvoorbeeld:

```
categorize: {
  categorizeByField: 'theme'
}
```
toont een kaart waarin alle inzendingen op basis van hun gekoppelde thema worden getoond.



## ToDo

- Clustering in resource overview gebruikt geen kleuren. De issue hier lijkt te zijn dat hij de meegestuurde categorizering niet update na de eerste initialisatie. Misschien een closure issue?
- Error handling wacht nog op een generieke oplossing
- Tag is nog niet getyped; die moet een niveau hoger.
- Resource is nog niet getyped; die moet een niveau hoger.
- Cetagorize typing moet nog uitgewerkt
- Wat te doen met het typen van AreaStlying
- MarkerIcon typing eindigt nog in any
- onClick typing klopt werkt nog niet
- De ideas-on-map versie is een combinatie van de resource map en de editor map
- Voor ideas on map: faden van markers; iVisible doet ook nog niet veel
- Search opties: adressen en filters
- De editor map is een input field, en moet gekoppeld worden aan de stndaard forms als die er zijn
- Meer events?

