window.onload = function () {
    const upitiContainer = document.getElementById('upiti');
    const sviUpiti = document.querySelectorAll('.upit');
    let trenutniUpitIndex = 0;
    const lokacijaLink = document.getElementById('lokacija-link');
    const divNekretnine = document.getElementById('divNekretnine');
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


     function prikaziUpit(indeks) {
        sviUpiti.forEach(upit => upit.style.display = 'none');  // Sakrij sve upite

        if (indeks >= 0 && indeks < sviUpiti.length) {
            sviUpiti[indeks].style.display = 'block';  // Prikazivanje trenutnog upita
        }

        // Onemogući/omogući dugmadi za navigaciju
        document.getElementById('prev').disabled = (trenutniUpitIndex <= 0);
        document.getElementById('next').disabled = (trenutniUpitIndex >= sviUpiti.length - 1);
    }

    // Sljedeći upit
    function sljedeciUpit() {
        if (trenutniUpitIndex < sviUpiti.length - 1) {
            trenutniUpitIndex++;
            prikaziUpit(trenutniUpitIndex);
        }

        // Ako smo došli do zadnjeg učitanog upita i nismo učitali sve upite
        if (trenutniUpitIndex >= sviUpiti.length - 1 && !sviUpitiUcitani) {
            PoziviAjax.getNextUpiti(sviUcitaniUpiti, function (error, noviUpiti) {
                if (error) {
                    console.error("Greška pri dohvaćanju novih upita:", error);
                    return;
                }

                if (noviUpiti && noviUpiti.length > 0) {
                    noviUpiti.forEach(function (noviUpit) {
                        const upitDiv = document.createElement('div');
                        upitDiv.classList.add('upit');
                        upitDiv.innerHTML = ` 
                            <p><strong>${noviUpit.username}:</strong></p>
                            <p>${noviUpit.text}</p>
                        `;
                        upitiContainer.appendChild(upitDiv);
                    });

                    sviUpiti = document.querySelectorAll('.upit');  // Ažuriramo sve upite
                    sviUcitaniUpiti += noviUpiti.length;  // Ažuriramo broj učitanih upita

                    // Ako su učitani svi upiti, postavimo indikator
                    if (noviUpiti.length === 0) {
                        sviUpitiUcitani = true;  // Nema više novih upita
                    }

                    prikaziUpit(trenutniUpitIndex);  // Prikazujemo trenutni upit
                }
            });
        }
    }

    // Prethodni upit
    function prethodniUpit() {
        if (trenutniUpitIndex > 0) {
            trenutniUpitIndex--;
            prikaziUpit(trenutniUpitIndex);
        }
    }

    // Inicijalizacija
    prikaziUpit(trenutniUpitIndex);
    document.getElementById('prev').onclick = prethodniUpit;
    document.getElementById('next').onclick = sljedeciUpit;

    // Provjera veličine ekrana prilikom učitavanja stranice i promjena veličine
    window.onresize = function () {
        prikaziUpit(trenutniUpitIndex); // Osigurajte da prikazujemo trenutni upit
    };
};
