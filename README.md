# Kurjeru maršrutu optimizācijas pakalpojums

## Problēmas apraksts

### Pašreizējā situācija
Strauji augošs e-komercijas uzņēmums saskaras ar būtiskām grūtībām ikdienas piegāžu pārvaldībā. Tā kā vairāki kurjeri apkalpo dažādus pilsētas rajonus, manuālā piegāžu maršrutu plānošana rada:

- **Neefektīvus maršrutus, kas izraisa degvielas patēriņu un laika zudumu
- **Nevienmērīgu darba slodzi starp kurjeriem
- **Nokavētas piegādes un klientu neapmierinātību
- **Reāllaika optimizācijas trūkumu atbilstoši faktiskajām pasūtījumu adresēm

### Biznesa konteksts
Uzņēmums darbojas no centrālās noliktavas, kas kalpo kā izplatīšanas centrs. Katram kurjeram tiek piešķirts konkrēts pilsētas rajons, kuru viņš labi pārzina un kurā ir izveidoti piegādes ieradumi. Pašreizējā manuālā nosūtīšanas sistēma nespēj efektīvi apstrādāt pieaugošo pasūtījumu apjomu, vienlaikus saglabājot augstu piegādes kvalitāti.

## Risinājuma pārskats

### Tīmekļa pakalpojums kurjeru maršrutu optimizācijai
Tiek izstrādāts inteliģents tīmekļa pakalpojums, kas automātiski aprēķina optimālus ikdienas piegādes maršrutus kurjeriem, balstoties uz pasūtījumu adresēm, kurjeru darba zonām un piegādes ierobežojumiem.

## Tehnoloģiju Stack

### Backend
- **Python Flask** - viegls tīmekļa ietvars API izstrādei
- **MySQL** - relāciju datubāze pasūtījumu, maršrutu un kurjeru datu glabāšanai

### API Development
- **RESTful API** - JSON formāta API galapunkti
- **Swagger** - API dokumentācija
- **Postman** - API testēšanai un izstrādei

## Galvenās funkcijas

#### Gudra maršrutu aprēķināšana
- **Automātiska maršrutu optimizācija** ar adrešu ģeokodēšanu
- **Maršruta secības optimizācija**, lai samazinātu braukšanas laiku un attālumu
- **Ietilpības plānošana**, ņemot vērā transportlīdzekļu izmēru un svara ierobežojumus
- **Laika logu pārvaldība** paredzētajiem piegādes laikiem

#### Kurjeru pārvaldība
- **Darba zonu piešķiršana** - katrs kurjers apkalpo noteiktus pilsētas rajonus
- **Individuālie maršruti** katra kurjera teritorijai
- **Veiktspējas uzraudzība** un piegādes analītika

#### Pasūtījumu pārvaldība
- **Automātiska pasūtījumu piešķiršana** atbilstošajiem kurjeriem pēc piegādes adreses
- **Maršruta secības optimizācija** katra kurjera dienas plānā
- **Piegādes statusa izsekošana** no nosūtīšanas līdz izpildei
- **Klientu informēšana** ar paredzamo piegādes laiku

## Līdzīgi risinājumi

### Logistics Operating System
Logistics Operating System ļauj pilnībā pārvaldīt transportu, kurjerus, pasūtījumus un maršrutus. Sistēma atbalsta paplašinājumus, API integrācijas, piedāvā kartes, reāllaika izsekošanu un visas flotes pārvaldību vienā platformā.

#### Plusi:
- Ļoti elastīgs – modulārs arhitektūras dizains
- Ir reāllaika izsekošana un karšu sistēma
- Var pieslēgt citus servisu moduļus
- Piemērots gan maziem, gan lieliem loģistikas uzņēmumiem

#### Mīnusi:
- Sarežģītāks – vajag laiku lai izprastu arhitektūru
- Var būt par smagu ļoti mazam projektam
- Lai sertificētu ražošanai, var vajadzēt DevOps zināšanas

### Optimized Delivery Routing & Time Prediction
SmartRoute-Optimized-Delivery-Routing-and-Time-Prediction aprēķina optimālus maršrutus kurjeriem, prognozē piegādes laiku (ETA), grupē pasūtījumus pēc prioritātēm, attāluma un svara, kā arī ņem vērā transportlīdzekļa kravnesību (kapacitāti).

#### Plusi:
- Maršruts tiek optimizēts, lai ietaupītu laiku un degvielu
- Ir ETA prognozēšana, kas kurjeram parāda, cik aizņemts būs ceļš
- Ņem vērā transportlīdzekļa kapacitāti (cik daudz preču var vest)
- Reālistisks piegādes scenāriju modelēšanas rīks

#### Mīnusi:
- Nav gatavas mobilās aplikācijas kurjeriem (vajadzētu pašam taisīt UI)
- Nav integrēta karte ar “live tracking”
- Nav pilnīgas dokumentācijas – nāksies papētīt kodu

### Google OR tools
Tehniski OR-Tools darbojas šādi: lietotājs ievada adreses vai punktus, izveido attāluma vai laika matricu (piemēram, izmantojot GPS vai Google Maps API), definē transportlīdzekļu skaitu un ierobežojumus, un tad risinātājs sāk meklēt risinājumu telpā, lai atrastu labāko vai tuvu optimālam maršrutu. OR-Tools izmanto vairākas optimizācijas metodes, piemēram, Branch-and-Bound, Local Search, dažādas metaheuristikas (tabu search, simulated annealing) un grafu teoriju, kas ļauj atrast risinājumus pat tad, ja jāapstrādā simtiem vai tūkstošiem punktu.

#### Plusi:
- Bezmaksas un atvērts
- Ļoti jaudīgs – industrijā lieto DHL, Uber, FedEx tipa scenārijiem
- Atbalsta daudz reālu nosacījumu (kapacitāte, laika logi, sodi u.c.)
- Integrējams Java, Python, C++, Go utt.
- Precīzs un ātrs mazākiem/vidējiem uzdevumiem
- Var sasniegt ļoti labas optimizācijas kvalitātes

#### Mīnusi:
- Nav gatavas UI aplikācijas – vajag pašam būvēt interfeisu (web, mobilā, dashboard)
- Nav iebūvētas kartes – kartes un koordinātes jāņem no Google Maps, OSRM vai citur
- Lieliem uzdevumiem no nulles optimāls risinājums var aizņemt stundas/gadus
- Dažreiz atdod tikai labu, nevis perfektu risinājumu (tas ir normāli VRP problēmām)
-Nepieredzējušam izstrādātājam var būt sarežģīti saprast matemātisko pusi

## Konceptuālais modelis

### Datubāzes shēma un galvenie entītiji
<img width="1059" height="774" alt="Screenshot 2025-10-27 134846" src="https://github.com/user-attachments/assets/43a5246f-224b-4f98-b189-964a714484df" />



