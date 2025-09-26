window.onload = function () {
    const upitiContainer = document.getElementById('upiti');
    const sviUpiti = document.querySelectorAll('.upit');
    const lokacijaLink = document.getElementById('lokacija-link');
    const divNekretnine = document.getElementById('divNekretnine');
    const tipSelect = document.getElementById('tip');
    const ponudaFields = document.getElementById('ponuda-fields');
    const ponudaIdSelect = document.getElementById('ponuda-id');
    const formInteresovanje = document.getElementById('form-interesovanje');

    tipSelect.addEventListener('change', function () {
        const tip = this.value;
        if (tip === 'ponuda') {
            ponudaFields.style.display = 'block';
            // Pozovi funkciju za popunjavanje ponuda na osnovu korisnika
            popuniPonude();
        } else {
            ponudaFields.style.display = 'none';
        }
    });

    // Funkcija za popunjavanje dropdown-a za ponude
    function popuniPonude() {
        // Ako je korisnik admin, učitaj sve ponude vezane za nekretninu
        // Ako je korisnik običan, učitaj samo ponude koje je on napravio
        const userId = getUserId();  // Pretpostavljamo funkciju koja vraća korisnički ID
        PoziviAjax.getPonudeZaKorisnika(userId, function (error, ponude) {
            if (error) {
                console.error("Greška pri dohvaćanju ponuda:", error);
                return;
            }

            ponudaIdSelect.innerHTML = ''; // Očisti postojeće opcije
            if (ponude && ponude.length > 0) {
                ponude.forEach(function (ponuda) {
                    const option = document.createElement('option');
                    option.value = ponuda.id;
                    option.textContent = `Ponuda ID: ${ponuda.id}`;
                    ponudaIdSelect.appendChild(option);
                });

                ponudaIdSelect.disabled = false;
            } else {
                ponudaIdSelect.disabled = true;
            }
        });
    }

    // Funkcija za obradu forme
    formInteresovanje.addEventListener('submit', function (event) {
        event.preventDefault();  // Spriječava reload stranice

        const tip = tipSelect.value;
        const tekst = document.getElementById('tekst').value;
        const ponudaId = ponudaIdSelect.value;

        const podaci = {
            tip: tip,
            tekst: tekst,
            ponudaId: (tip === 'ponuda' ? ponudaId : null)
        };

        // Pozovi Ajax za slanje podataka
        PoziviAjax.dodajInteresovanje(podaci, function (error, odgovor) {
            if (error) {
                console.error("Greška pri dodavanju interesovanja:", error);
                alert("Došlo je do greške. Pokušajte ponovo.");
                return;
            }

            alert("Interesovanje je uspješno dodano.");
            formInteresovanje.reset();  // Resetuje formu nakon slanja
        });
    });

    // Početno pozivanje funkcije za popunjavanje ponuda ako je korisnik već izabrao "ponuda"
    if (tipSelect.value === 'ponuda') {
        popuniPonude();
    }
    
    let trenutniUpitIndex = 0; 
    let sviUcitaniUpiti = sviUpiti.length; // Broj učitanih upita
    let sviUpitiUcitani = false; // Indikator da li su svi upiti učitani
    // Klik na link za lokaciju, učitavanje nekretnina

    document.getElementById('lokacija-link').addEventListener('click', function (event) {
        event.preventDefault(); // Spriječava zadano ponašanje linka

        const lokacija = this.textContent.trim(); // Dohvati naziv lokacije
        PoziviAjax.getTop5Nekretnina(lokacija, function (error, nekretnine) {
            if (error) {
                console.error("Greška pri dohvaćanju top 5 nekretnina:", error);
                alert("Došlo je do greške. Pokušajte ponovo.");
                return;
            }

            console.log(nekretnine); // Provjera podataka
            const nekretnineContainer = document.getElementById('divNekretnine');
            nekretnineContainer.innerHTML = ''; // Očisti prethodne nekretnine

            spojiNekretnine(nekretnineContainer, nekretnine, lokacija); // Prikaz novih nekretnina
        });
    });

    // Funkcija za prikaz nekretnina
    function spojiNekretnine(container, nekretnine, tip) {
        container.innerHTML = ''; // Očisti prethodni sadržaj

        nekretnine.forEach(function (nekretnina) {
            const div = document.createElement('div');
            div.classList.add('nekretnina');
            div.innerHTML = `
                <div>
                    <h3>${nekretnina.naziv}</h3>
                    <p>Tip: ${tip}</p>
                    <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                    <p>Cijena: ${nekretnina.cijena} KM</p>
                    <p>Lokacija: ${nekretnina.lokacija}</p>
                    <p>Tip grijanja: ${nekretnina.tip_grijanja}</p>
                    <p>Godina izgradnje: ${nekretnina.godina_izgradnje}</p>
                    <p>Datum objave: ${nekretnina.datum_objave}</p>
                    <p>Opis: ${nekretnina.opis}</p>
                </div>
            `;
            container.appendChild(div);
        });
    }
      // Funkcija za prikaz upita
      function prikaziUpite() {
        // Sakrij sve upite
        sviUpiti.forEach(upit => upit.style.display = 'none');

        // Broj upita po stranici
        let brojUpitaNaStranici = 3;

        // Izračunaj redoslijed prikaza upita na trenutnoj stranici (obrnut redoslijed)
        let pocetakIndex = sviUpiti.length - (trenutniUpitIndex + brojUpitaNaStranici);
        if (pocetakIndex < 0) {
            pocetakIndex = 0;
        }

        // Na zadnjoj stranici, prikazujemo samo preostale upite, ne popunjavamo do 3
        let brojPreostalihUpita = sviUpiti.length - trenutniUpitIndex;
        if (trenutniUpitIndex + brojUpitaNaStranici > sviUpiti.length) {
            brojUpitaNaStranici = brojPreostalihUpita; // Ako preostali upiti nisu dovoljni za 3, prikazujemo samo preostale
        }

        // Prikazivanje upita na trenutnoj stranici
        for (let i = pocetakIndex; i < pocetakIndex + brojUpitaNaStranici; i++) {
            sviUpiti[i].style.display = 'block';
        }

        // Onemogući/omogući dugmadi za navigaciju
        document.getElementById('prev').disabled = (trenutniUpitIndex <= 0);  // Onemogući "Prethodni" na prvoj stranici
        document.getElementById('next').disabled = (trenutniUpitIndex + brojUpitaNaStranici >= sviUpiti.length);  // Onemogući "Sljedeći" kada su svi upiti učitani
    }

    // Sljedeći upit
    function sljedeciUpit() {
        if (trenutniUpitIndex + 3 < sviUpiti.length) {
            trenutniUpitIndex += 3;
            prikaziUpite();
        }

        // Ako smo došli do zadnje učitane stranice i nismo učitali sve upite
        if (trenutniUpitIndex + 3 >= sviUpiti.length && !sviUpitiUcitani) {
            PoziviAjax.getNextUpiti(sviUcitaniUpiti, function (error, noviUpiti) {
                if (error) {
                    console.error("Greška pri dohvaćanju novih upita:", error);
                    return;
                }

                if (noviUpiti && noviUpiti.length > 0) {
                    noviUpiti.forEach(function (noviUpit) {
                        const upitDiv = document.createElement('div');
                        upitDiv.classList.add('upit');
                        upitDiv.innerHTML =  
                            `<p><strong>${noviUpit.username}:</strong></p>
                             <p>${noviUpit.text}</p>`;
                        upitiContainer.appendChild(upitDiv);
                    });

                    sviUpiti = document.querySelectorAll('.upit');  // Ažuriramo sve upite
                    sviUcitaniUpiti += noviUpiti.length;  // Ažuriramo broj učitanih upita

                    // Ako su učitani svi upiti, postavimo indikator
                    if (noviUpiti.length === 0) {
                        sviUpitiUcitani = true;  // Nema više novih upita
                    }

                    prikaziUpite();  // Prikazujemo trenutni upit
                }
            });
        }
    }

    // Prethodni upit
    function prethodniUpit() {
        if (trenutniUpitIndex - 3 >= 0) {
            trenutniUpitIndex -= 3;
            prikaziUpite();
        }
    }

    // Inicijalizacija
    prikaziUpite();  // Početno prikazivanje upita (prvi 3 na prvoj stranici)
    document.getElementById('prev').onclick = prethodniUpit;
    document.getElementById('next').onclick = sljedeciUpit;

    // Provjera veličine ekrana prilikom učitavanja stranice i promjena veličine
    window.onresize = function () {
        prikaziUpite(); // Osigurajte da prikazujemo trenutni upit
    };
};
