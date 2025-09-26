const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const attemptLimit = 3; // Maksimalan broj pokušaja prijave
const lockTime = 60 * 1000; // Blokada traje 1 minut

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

app.post('/login', async (req, res) => {
  const jsonObj = req.body;
  const username = jsonObj.username;

  try {
    // Proverite da li korisnik ima više od 3 pokušaja
    if (loginAttempts[username] && loginAttempts[username].count >= 3) {
      const timeSinceLastAttempt = Date.now() - loginAttempts[username].lastAttempt;
      if (timeSinceLastAttempt < 60000) {
        // Ako su pokušaji bili pre manje od 1 minute, blokiramo korisnika
        return res.status(429).json({ greska: "Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu." });
      } else {
        // Resetujemo broj pokušaja nakon 1 minute
        loginAttempts[username] = { count: 0, lastAttempt: Date.now() };
      }
    }
    const data = await fs.readFile(path.join(__dirname, 'data', 'korisnici.json'), 'utf-8');
    const korisnici = JSON.parse(data);
    let found = false;

    for (const korisnik of korisnici) {
      if (korisnik.username == username) {
        const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password);

        if (isPasswordMatched) {
          req.session.username = korisnik.username;
          found = true;
          break;
        }
      }
    }

    // Logovanje pokušaja prijave u fajl
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] - username: "${jsonObj.username}" - status: "${found ? 'uspješno' : 'neuspješno'}"\n`;
    await fs.appendFile('prijave.txt', logMessage);

    if (found) {
      // Resetujemo broj pokušaja na 0 ako je prijava uspešna
      loginAttempts[username] = { count: 0, lastAttempt: Date.now() };
      res.json({ poruka: 'Uspješna prijava' });
    } else {
      // Povećavamo broj pokušaja ako je prijava neuspešna
      if (!loginAttempts[username]) {
        loginAttempts[username] = { count: 0, lastAttempt: Date.now() };
      }
      loginAttempts[username].count++;

      res.json({ poruka: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Greška tokom prijave:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

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
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const user = users.find((u) => u.username === username);

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
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


const upitiPoKorisniku = {}; 
app.post('/upit', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { nekretnina_id, tekst_upita } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Read properties data from the JSON file
    const nekretnine = await readJsonFile('nekretnine');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.user.username);
    if (!loggedInUser) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }
    // Check if the property with nekretnina_id exists
    const nekretnina = nekretnine.find((property) => property.id === nekretnina_id);

    if (!nekretnina) {
      // Property not found
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }
    if (!upitiPoKorisniku[loggedInUser.id]) {
      upitiPoKorisniku[loggedInUser.id] = {};
    }

    if (!upitiPoKorisniku[loggedInUser.id][nekretnina_id]) {
      upitiPoKorisniku[loggedInUser.id][nekretnina_id] = 0;
    }

    // Proveri broj upita
    if (upitiPoKorisniku[loggedInUser.id][nekretnina_id] >= 3) {
      return res.status(429).json({ greska: 'Previše upita za istu nekretninu.' });
    }

    // Povećaj broj upita za ovu nekretninu
    upitiPoKorisniku[loggedInUser.id][nekretnina_id]++;

    // Add a new query to the property's queries array
    nekretnina.upiti.push({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst_upita
    });

    // Save the updated properties data back to the JSON file
    await saveJsonFile('nekretnine', nekretnine);

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Error processing query:', error);
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
    const nekretnine = await readJsonFile('nekretnine');
    const nekretnina = nekretnine.find(n => n.id === parseInt(id));

    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena" });
    }

    // Skraćujemo listu upita na posljednja 3
    const poslednja3Upita = nekretnina.upiti.slice(-3);

    // Vraćamo detalje nekretnine sa skraćenom listom upita
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
    const nekretnineData = await readJsonFile('nekretnine');
    res.json(nekretnineData);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
// Route to get top 5 properties based on location
app.get('/nekretnine/top5', async (req, res) => {
  const lokacija = req.query.lokacija; // Get the location from the query parameter

  if (!lokacija) {
    return res.status(400).json({ greska: "Lokacija je obavezna" });
  }

  try {
    const nekretnineData = await readJsonFile('nekretnine'); // Read properties from nekretnine.json

    // Filter properties based on the provided location
    const filteredProperties = nekretnineData.filter(property => property.lokacija && property.lokacija.toLowerCase() === lokacija.toLowerCase());

    // Get the last 5 properties (sorted by publication date)
    const top5Properties = filteredProperties
      .sort((a, b) => new Date(b.datumObjave) - new Date(a.datumObjave)) // Sort by publication date, newest first
      .slice(0, 5); // Get the first 5

    if (top5Properties.length === 0) {
      return res.status(404).json({ greska: "Nema nekretnina na ovoj lokaciji" });
    }

    res.status(200).json(top5Properties); // Send the filtered properties in response
  } catch (error) {
    console.error('Error fetching top 5 properties:', error);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
