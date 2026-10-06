#!/usr/bin/env python3
"""Converte prospetto_libri.xlsx in books.json. Uso: python3 converti_excel.py [file.xlsx]"""
import json, re, sys, unicodedata, openpyxl
F = sys.argv[1] if len(sys.argv) > 1 else 'prospetto_libri.xlsx'
# Classificazione fissa (usata SOLO per colori/legenda). Se l'Excel ha le colonne "Testamento"/"Categoria" hanno la precedenza.
CL = {}
for t, cat, names in [
 ('AT','Pentateuco','genesi,esodo,levitico,numeri,deuteronomio'),
 ('AT','Storici','giosue,giudici,rut,1 samuele,2 samuele,1 re,2 re,1 cronache,2 cronache,esdra,neemia,ester'),
 ('AT','Poetici','giobbe,salmi,proverbi,ecclesiaste,cantico dei cantici'),
 ('AT','Profeti','isaia,geremia,lamentazioni,ezechiele,daniele,osea,gioele,amos,abdia,giona,michea,naum,abacuc,sofonia,aggeo,zaccaria,malachia'),
 ('NT','Vangeli','matteo,marco,luca,giovanni'), ('NT','Storia','atti'),
 ('NT','Lettere','romani,1 corinti,2 corinti,galati,efesini,filippesi,colossesi,1 tessalonicesi,2 tessalonicesi,1 timoteo,2 timoteo,tito,filemone,ebrei,giacomo,1 pietro,2 pietro,1 giovanni,2 giovanni,3 giovanni,giuda'),
 ('NT','Profezia','rivelazione')]:
    for n in names.split(','): CL[n] = (t, cat)

def norm(s):  # nome normalizzato: accetta varianti (Il Cantico..., Corinzi/Corinti, Apocalisse/Rivelazione)
    s = ''.join(c for c in unicodedata.normalize('NFD', re.sub(r'\s*\(.*?\)', '', s).lower().strip()) if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', re.sub(r'^il ', '', s)).replace('corinzi','corinti').replace('apocalisse','rivelazione')
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', norm(s)).strip('-')

# Un anno è un numero seguito (anche dopo intervalli) da "a.C." o "d.C."; durate e versetti vengono ignorati.
CH = re.compile(r'(\d{1,4}(?:\s*(?:–|-|—|e(?:\s+il)?)\s*(?:c\.\s*|dopo il\s*|prima del\s*)?\d{1,4})*)\s*(a\.C\.|d\.C\.)')
def anno(t):
    m = CH.search(t)
    if not m: return None
    n = int(re.match(r'\d+', m.group(1)).group())
    return -n if m.group(2) == 'a.C.' else n

rows = list(openpyxl.load_workbook(F, data_only=True).active.iter_rows(values_only=True))
H = [str(h).strip() for h in rows[0]]
col = lambda name: H.index(name) if name in H else None
cell = lambda r, name: ('—' if col(name) is None or r[col(name)] in (None, '') else str(r[col(name)]).strip())
books, refusi, nonric, interp = [], [], [], []
for r in rows[1:]:
    if not r[0]: continue
    nome = str(r[0]).strip()
    m = re.fullmatch(r'(.+?)\s*/\s*\1', nome)          # refuso: nome ripetuto ("X / X")
    if m: refusi.append(f'{nome} -> {m.group(1)}'); nome = m.group(1)
    comp, trat = cell(r, 'Tempo completato'), cell(r, 'Tempo trattato')
    t, c = CL.get(norm(nome), ('', ''))
    if col('Testamento') is not None and r[col('Testamento')]: t = str(r[col('Testamento')]).strip()
    if col('Categoria') is not None and r[col('Categoria')]: c = str(r[col('Categoria')]).strip()
    if not c: nonric.append(nome)
    ini = -1000000 if re.match(r'\W*in principio', trat, re.I) else anno(trat)
    if re.search(r'giorn|mes[ei]|anni|:|prolog|oltre|principio', trat): interp.append(f'{nome}: "{trat}" -> {ini}')
    books.append(dict(id=slug(nome), nome=nome, scrittore=cell(r, 'Scrittore'), luogo=cell(r, 'Luogo di scrittura'),
        completato_testo=comp, completato_anno=anno(comp), trattato_testo=trat, trattato_inizio=ini, testamento=t, categoria=c))
with open('books.json', 'w', encoding='utf-8') as f:
    f.write('[\n' + ',\n'.join(json.dumps(b, ensure_ascii=False) for b in books) + '\n]\n')
trovati = {norm(b['nome']) for b in books}
manc = [k.title() for k in CL if k not in trovati]
print(f'Libri letti: {len(books)} | mancanti rispetto ai 66: {len(manc)}\n  {", ".join(manc)}')
print('Senza riferimento temporale:', ', '.join(b['nome'] for b in books if b['trattato_inizio'] is None))
print('Refusi corretti:', refusi or 'nessuno'); print('Non riconosciuti nella classificazione:', nonric or 'nessuno')
print('Testi interpretati per l\'ordinamento:'); [print('  ', i) for i in interp]
