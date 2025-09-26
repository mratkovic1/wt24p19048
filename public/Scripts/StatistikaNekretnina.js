// StatistikaNekretnina.js
const SpisakNekretnina = require('./SpisakNekretnina');  // Uvozimo SpisakNekretnina

let StatistikaNekretnina = function () {
    let spisakNekretnina = SpisakNekretnina();  // Kreiramo instancu SpisakNekretnina

    let init = function (listaNekretnina) {
        spisakNekretnina.init(listaNekretnina);  // Inicijaliziramo listu nekretnina
    };

    let histogramCijena = function (periodi, rasponiCijena) {
        let rezultat = [];
        periodi.forEach((period, indeksPerioda) => {
            let nekretnineUPeriodu = spisakNekretnina.filtrirajNekretnine({
                datum_objave: { od: period.od, do: period.do },  // Filtriramo po periodu
            });

            rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
                let brojNekretnina = nekretnineUPeriodu.filter(nekretnina =>
                    nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do  // Filtriramo po cijeni
                ).length;
                rezultat.push({
                    indeksPerioda: indeksPerioda,
                    indeksRasponaCijena: indeksRasponaCijena,
                    brojNekretnina: brojNekretnina,
                });
            });
        });

        return rezultat;
    };

    return {
        init: init,
        histogramCijena: histogramCijena,
    };
};

module.exports = StatistikaNekretnina;  // Export funkcionalnosti