// corousel.js
function postaviCarousel(glavniElement, sviElementi, indeks = 0) {
   
    if (!glavniElement || !Array.isArray(sviElementi) || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }

    function prikaziElement(indeks) {
        glavniElement.innerHTML = sviElementi[indeks].innerHTML;
    }

    function fnLijevo() {
        indeks--;
        if (indeks < 0) {
            indeks = sviElementi.length - 1; 
        }
        prikaziElement(indeks);
    }

    function fnDesno() {
        indeks++;
        if (indeks >= sviElementi.length) {
            indeks = 0; 
        }
        prikaziElement(indeks);
    }
    prikaziElement(indeks);

    return {
        fnLijevo: fnLijevo,
        fnDesno: fnDesno
    };
}