const express = require('express');
const session = require("express-session");

const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const sequelize = require("./config/baza");  // Importuj konekciju
const { Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = require("./modeli/models");  // Importuj modele
require("./relacije/relacije")();  // Pozivamo funkciju koja postavlja sve relacije
function isAdmin(req, res, next) {
  if (req.user && req.user.admin) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
}
const moment = require('moment');
const app = express();

const PORT = 3000;
const attemptLimit = 3; // Maksimalan broj pokušaja prijave
const lockTime = 60 * 1000; // Blokada traje 1 minut
app.use(express.json()); 

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true,
}));


app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/mojiUpiti.html', file: 'mojiUpiti.html'},
  { route: '/vijesti.html', file: 'vijesti.html'},
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/
const loginAttempts = {};  // Pratimo broj pokušaja za svakog korisnika (u memoriji)

// POST /login - Prijava korisnika
app.post('/login', async (req, res) => {
  
  const jsonObj = req.body;
  const username = jsonObj.username;

  try {
    const korisnik = await Korisnik.findOne({ where: { username } });
    
    if (!korisnik) {
      return res.status(401).json({ poruka: 'Neuspješna prijava' });
    }

    const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password);
    if (isPasswordMatched) {
      req.session.username = korisnik.username;
      return res.json({ poruka: 'Uspješna prijava' });
    }

    res.status(401).json({ poruka: 'Neuspješna prijava' });
  } catch (error) {
    console.error('Greška tokom prijave:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});  function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/login", true)
        ajax.setRequestHeader("Content-Type", "application/json")
        var objekat = {
            "username": username,
            "password": password
        }
        forSend = JSON.stringify(objekat)
        ajax.send(forSend)
    }

/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const username = req.session.username;

  try {
    const korisnik = await Korisnik.findOne({ where: { username } });

    if (!korisnik) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    const userData = {
      id: korisnik.id,
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      username: korisnik.username
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Greška pri dohvaćanju korisničkih podataka:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


app.get('/nekretnina/:id/interesovanja', async (req, res) => {
  const nekretninaId = req.params.id; // ID nekretnine
  const loggedInUser = req.session.username; // Korisnik koji je prijavljen (pretpostavljamo da koristiš sesiju za autentifikaciju)

  try {
    // Dohvati nekretninu iz baze podataka sa povezanim ponudama i korisnicima
    const nekretnina = await Nekretnina.findByPk(nekretninaId, {
      include: [
        {
          model: Ponuda,  // Uključujemo sve ponude vezane za ovu nekretninu
          include: {
            model: Korisnik,  // Uključujemo korisnike koji su postavili ponude
            attributes: ['username']
          }
        }
      ]
    });

    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    // Provera da li je korisnik admin (ili neka druga validacija)
    const isAdmin = loggedInUser === 'admin';

    // Filtriranje ponuda
    const filteredPonude = nekretnina.Ponudas.map(ponuda => {
      const ponudaJson = ponuda.toJSON();  // Pretvaramo ponudu u JSON format

      if (!isAdmin) {
        // Ako korisnik nije admin, sakrij cijenu ponude osim ako je ponuda postavljena od strane korisnika
        if (loggedInUser && (ponudaJson.Korisnik.username === loggedInUser)) {
          return ponudaJson;  // Vratiti cijelu ponudu ako je postavio korisnik
        } else {
          const { cijenaPonude, ...rest } = ponudaJson;  // Ukloniti cijenu ako nije vezana za korisnika
          return rest;
        }
      }

      return ponudaJson;  // Ako je admin, vratiti sve ponude sa cijenama
    });

    // Vraćamo filtrirane ponude
    res.status(200).json(filteredPonude);

  } catch (error) {
    console.error('Greška pri dohvaćanju interesovanja:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


// Kreiranje ponude
app.post('/nekretnina/:id/ponuda', async (req, res) => {
  const { id } = req.params;
  const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;

  try {
    // Provjera da li nekretnina postoji
    const nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) {
      return res.status(404).json({ message: 'Nekretnina nije pronađena' });
    }

    // Provjera korisničkih kredencijala
    const korisnik = await Korisnik.findByPk(req.user.id);
    if (!korisnik) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }
    

    // Ako ponuda nije vezana, to je početna ponuda korisnika
    const novaPonuda = await Ponuda.create({
      cijenaPonude: ponudaCijene,
      datumPonude,
      odbijenaPonuda,
      korisnikId: korisnik.id,
      nekretninaId: nekretnina.id,
      vezanaPonudaId: idVezanePonude || null,
    });

    // Ako je ponuda vezana za prethodnu, provjeravamo da li je odbijena
    if (idVezanePonude) {
      const vezanaPonuda = await Ponuda.findByPk(idVezanePonude);
      if (vezanaPonuda && vezanaPonuda.odbijenaPonuda) {
        return res.status(400).json({ message: 'Ponuda nije prihvaćena, ne možete dodati novu.' });
      }
    }

    return res.status(201).json(novaPonuda);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Došlo je do greške' });
  }
});

// Admin može odbiti ponudu ili ponuditi novu cijenu
app.post('/admin/ponuda/:id/odgovori', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { ponudaCijene, odbijenaPonuda } = req.body;

  try {
    // Provjera da li ponuda postoji
    const ponuda = await Ponuda.findByPk(id);
    if (!ponuda) {
      return res.status(404).json({ message: 'Ponuda nije pronađena' });
    }

    // Provjera da li ponuda već ima status odbijena
    if (ponuda.odbijenaPonuda) {
      return res.status(400).json({ message: 'Ova ponuda je odbijena, ne možete dodati novu.' });
    }

    // Kreiramo novu ponudu kao odgovor
    const novaPonuda = await Ponuda.create({
      cijenaPonude: ponudaCijene,
      datumPonude: new Date(),
      odbijenaPonuda,
      korisnikId: req.user.id,
      nekretninaId: ponuda.nekretninaId,
      vezanaPonudaId: ponuda.id,
    });

    return res.status(201).json(novaPonuda);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Došlo je do greške' });
  }
});

const provjeraAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    return res.status(403).json({ greska: 'Admin korisnik ne moze slati zahtjeve.' });
  }
  next();
};

app.post('/nekretnina/:id/zahtjev', provjeraAdmin, async (req, res) => {
  try {
    const { tekst, trazeniDatum } = req.body;
    const { id } = req.params;

    // Provjera postoji li nekretnina s tim id-em
    const nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina s tim ID-om ne postoji.' });
    }

    // Provjera validnosti trazenog datuma
    if (!moment(trazeniDatum, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ greska: 'Neispravan format datuma.' });
    }

    // Provjera je li trazeni datum manji od trenutnog
    if (moment(trazeniDatum).isBefore(moment(), 'day')) {
      return res.status(400).json({ greska: 'Trazeni datum ne moze biti u proslosti.' });
    }

    // Provjera je li korisnik prijavljen
    const korisnik = req.user;  // Pretpostavljamo da korisnik dolazi iz autentifikacije (npr. JWT)

    // Kreiranje novog zahtjeva
    const noviZahtjev = await Zahtjev.create({
      tekst_upita: tekst,
      trazeniDatum,
      korisnikId: korisnik.id,
      nekretninaId: nekretnina.id
    });

    res.status(201).json({ poruka: 'Zahtjev uspješno kreiran.', zahtjev: noviZahtjev });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: 'Došlo je do greške prilikom kreiranja zahtjeva.' });
  }
});

const provjeriAdmina = (req, res, next) => {
  if (req.user && req.user.admin) {
    return next();
  } else {
    return res.status(403).json({ greska: 'Samo admin može izvršiti ovu akciju.' });
  }
};

// PUT ruta za ažuriranje zahtjeva
app.put('/nekretnina/:id/zahtjev/:zid', provjeriAdmina, async (req, res) => {
  const { odobren, addToTekst } = req.body;
  
  if (odobren === undefined) {
    return res.status(400).send("Moraš navesti parametar 'odobren'.");
  }
  
  if (odobren === false && !addToTekst) {
    return res.status(400).send("Kada je zahtjev odbijen, moraš navesti 'addToTekst'.");
  }
  
  try {
    // Dohvati zahtjev iz baze
    const zahtjev = await Zahtjev.findOne({
      where: {
        id: req.params.zid,
        nekretninaId: req.params.id,
      },
    });

    if (!zahtjev) {
      return res.status(404).send("Zahtjev nije pronađen.");
    }

    // Ažuriranje zahtjeva
    zahtjev.odobren = odobren;
    
    if (odobren === false && addToTekst) {
      zahtjev.tekst_upita += ` ODGOVOR ADMINA: ${addToTekst}`;
    }

    await zahtjev.save();

    return res.status(200).send("Zahtjev uspješno ažuriran.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Došlo je do greške pri ažuriranju zahtjeva.");
  }
});




/*
Allows logged user to make a request for a property
*/
app.get('/next/upiti/nekretnina:id', async (req, res) => {
  const { id } = req.params; // ID nekretnine
  const { page } = req.query; // Stranica (page) u query parametru

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ greska: "Page parametar mora biti broj veći ili jednak 1" });
  }

  try {
    // Učitavamo sve nekretnine
    const nekretnine = await readJsonFile('nekretnine');
    const nekretnina = nekretnine.find(n => n.id === parseInt(id));

    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena" });
    }

    // Pagiramo upite
    const startIndex = (page - 1) * 3;
    const upitiZaStranicu = nekretnina.upiti.slice(startIndex, startIndex + 3);

    // Ako nema više upita na toj stranici, vraćamo prazan niz
    if (upitiZaStranicu.length === 0) {
      return res.status(404).json([]);
    }

    // Vraćamo upite
    res.status(200).json(upitiZaStranicu);
  } catch (error) {
    console.error('Greška pri dohvaćanju upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/upiti/moji', async (req, res) => {
  // Proverite da li je korisnik prijavljen
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  // Uzimate username korisnika koji je prijavljen
  const username = req.session.username;

  try {
    // Čitate podatke o korisnicima
    const korisnici = await readJsonFile('korisnici');
    
    // Pronađite korisnika po username-u
    const korisnik = korisnici.find(user => user.username === username);

    if (!korisnik) {
      return res.status(404).json({ greska: "Korisnik nije pronađen" });
    }

    // Čitate podatke o nekretninama sa upitima
    const nekretnine = await readJsonFile('nekretnine');
    
    // Filtrirajte upite koji pripadaju ovom korisniku
    const upiti = nekretnine.flatMap(nekretnina => 
      nekretnina.upiti
        .filter(upit => upit.korisnik_id === korisnik.id)
        .map(upit => ({
          id_nekretnine: nekretnina.id,
          tekst_upita: upit.tekst_upita
        }))
    );

    if (upiti.length === 0) {
      return res.status(404).json([]); // Ako nema upita, vraćamo prazan niz
    }

    res.status(200).json(upiti); // Vraćamo upite u odgovoru

  } catch (error) {
    console.error("Greška pri čitanju upita:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

const dodajUpit = async (korisnik_id, nekretnina_id, tekst_upita) => {
  // Dodajemo logiku koja čuva upit u bazu, ovo je samo primer
  const nekretnina = await baza.dohvatiNekretninuPoId(nekretnina_id);
  if (!nekretnina) {
    throw new Error('Nekretnina nije pronađena');
  }

  nekretnina.upiti.push({ korisnik_id, tekst_upita });
  await baza.spasiNekretnine(nekretnina); // Spasavanje promjena
};

const upitiPoKorisniku = {}; 
app.post('/upit', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { nekretnina_id, tekst_upita } = req.body;
  const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });

  if (!korisnik) {
    return res.status(401).json({ greska: 'Korisnik nije pronađen' });
  }

  try {
    const nekretnina = await Nekretnina.findByPk(nekretnina_id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    // Kreiramo upit i povezujemo ga sa korisnikom i nekretninom
    await Upit.create({
      tekst_upita,
      korisnik_id: korisnik.id,
      nekretnina_id: nekretnina.id
    });

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Greška pri dodavanju upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});



/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    // Save the updated user data back to the JSON file
    await saveJsonFile('korisnici', users);
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns all properties from the file.
*/


app.get('/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const nekretnina = await Nekretnina.findByPk(id, {
      include: {
        model: Upit,
        include: Korisnik,  // Uključivanje korisnika koji je postavio upit
        attributes: ['username', 'tekst_upita']
      }
    });

    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena" });
    }

    // Skraćujemo listu upita na poslednja 3
    const poslednja3Upita = nekretnina.Upits.slice(-3);

    const nekretninaDetalji = {
      id: nekretnina.id,
      tip_nekretnine: nekretnina.tip_nekretnine,
      naziv: nekretnina.naziv,
      kvadratura: nekretnina.kvadratura,
      cijena: nekretnina.cijena,
      tip_grijanja: nekretnina.tip_grijanja,
      lokacija: nekretnina.lokacija,
      godina_izgradnje: nekretnina.godina_izgradnje,
      datum_objave: nekretnina.datum_objave,
      opis: nekretnina.opis,
      upiti: poslednja3Upita
    };

    res.status(200).json(nekretninaDetalji);
  } catch (error) {
    console.error('Greška pri dohvatanju detalja nekretnine:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});




app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll({
      include: [{
        model: Upit,
        attributes: ['tekst_upita']
      }]
    });

    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Greška pri dohvatanju nekretnina:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnine/top5', async (req, res) => {
  const lokacija = req.query.lokacija;

  if (!lokacija) {
    return res.status(400).json({ greska: "Lokacija je obavezna" });
  }

  try {
    const nekretnine = await Nekretnina.findAll({
      where: {
        lokacija: {
          [Sequelize.Op.iLike]: lokacija
        }
      },
      limit: 5,
      order: [['datum_objave', 'DESC']]
    });

    if (nekretnine.length === 0) {
      return res.status(404).json({ greska: "Nema nekretnina na ovoj lokaciji" });
    }

    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Greška pri dohvaćanju top 5 nekretnina:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get("/", (req, res) => {
  res.send("Pozdrav iz aplikacije!");
});

sequelize.sync({ force: true })  // Ako je potrebno, setuj `force: true` da izbrišeš postojeće tabele i kreiraš nove
  .then(() => {
    console.log("Baza podataka je uspešno sinhronizovana.");
    // Pokretanje servera
    app.listen(PORT, () => {
      console.log("Server je pokrenut na portu 3000");
    });
  })
  .catch((error) => {
    console.error("Greška pri sinhronizaciji sa bazom:", error);
  });
// Start server
