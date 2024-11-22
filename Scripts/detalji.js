// detalji.js
window.onload = function() {
    const upitiContainer = document.getElementById('upiti'); // Div koji sadrži sve upite
    const sviUpiti = document.querySelectorAll('.upit'); // Svi upiti unutar container-a
    let trenutniUpitIndex = 0; // Početni indeks upita koji će biti prikazan

    // Funkcija za prikazivanje upita na temelju trenutnog indeksa
    function prikaziUpit(indeks) {
        // Prvo, skrivamo sve upite
        sviUpiti.forEach(upit => upit.style.display = 'none');
        
        // Provjeravamo je li indeks unutar opsega
        if (indeks >= 0 && indeks < sviUpiti.length) {
            // Prikazujemo upit na osnovu trenutnog indeksa
            sviUpiti[indeks].style.display = 'block';
        }

        // Omogućavanje ili onemogućavanje dugmadi na temelju trenutnog indeksa
        if (trenutniUpitIndex <= 0) {
            document.getElementById('prev').disabled = true; // Onemogućiti "Prethodni" ako smo na prvom upitu
        } else {
            document.getElementById('prev').disabled = false;
        }

        if (trenutniUpitIndex >= sviUpiti.length - 1) {
            document.getElementById('next').disabled = true; // Onemogućiti "Sljedeći" ako smo na posljednjem upitu
        } else {
            document.getElementById('next').disabled = false;
        }
    }

    // Funkcija za prelazak na sljedeći upit
    function sljedeciUpit() {
        if (trenutniUpitIndex < sviUpiti.length - 1) {
            trenutniUpitIndex++;
            prikaziUpit(trenutniUpitIndex);
        }
    }

    // Funkcija za prelazak na prethodni upit
    function prethodniUpit() {
        if (trenutniUpitIndex > 0) {
            trenutniUpitIndex--;
            prikaziUpit(trenutniUpitIndex);
        }
    }

    // Inicijalno prikazujemo prvi upit
    prikaziUpit(trenutniUpitIndex);

    // Dodavanje event listener-a za dugmadi
    document.getElementById('prev').onclick = prethodniUpit;
    document.getElementById('next').onclick = sljedeciUpit;

    // Provjera širine ekrana i primjena odgovarajuće logike za display
    function provjeriVelicinuEkrana() {
        if (window.innerWidth < 600) {
            // Ako je širina ekrana manja od 600px, omogućujemo navigaciju između upita
            upitiContainer.style.display = 'block'; // Osiguravamo da je container za upite vidljiv
            prikaziUpit(trenutniUpitIndex); // Prikazujemo trenutno aktivan upit
        } else {
            // Ako je širina veća od 600px, prikazujemo sve upite odjednom
            sviUpiti.forEach(upit => upit.style.display = 'block');
        }
    }

    // Pozivamo funkciju za inicijalnu provjeru veličine ekrana
    provjeriVelicinuEkrana();

    // Event listener za promjenu veličine ekrana (kako bi se prilagodilo na resize)
    window.onresize = provjeriVelicinuEkrana;
};