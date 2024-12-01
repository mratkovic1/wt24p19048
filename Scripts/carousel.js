// corousel.js
function postaviCarousel(glavniElement, sviElementi, indeks = 0) {
    // Provjeravamo ispravnost proslijeđenih podataka
    if (!glavniElement || !Array.isArray(sviElementi) || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }

    // Funkcija za prikaz trenutnog elementa
    function prikaziElement(indeks) {
        glavniElement.innerHTML = sviElementi[indeks].innerHTML;
    }

    // Funkcija za pomicanje na lijevo
    function fnLijevo() {
        indeks--;
        if (indeks < 0) {
            indeks = sviElementi.length - 1; // Ako indeks postane negativan, idemo na zadnji element
        }
        prikaziElement(indeks);
    }

    // Funkcija za pomicanje na desno
    function fnDesno() {
        indeks++;
        if (indeks >= sviElementi.length) {
            indeks = 0; // Ako indeks premaši dužinu niza, idemo na prvi element
        }
        prikaziElement(indeks);
    }

    // Prikazujemo prvi element odmah prilikom inicijalizacije
    prikaziElement(indeks);

    // Vraćamo objekt sa funkcijama za lijevo i desno pomicanje
    return {
        fnLijevo: fnLijevo,
        fnDesno: fnDesno
    };
}