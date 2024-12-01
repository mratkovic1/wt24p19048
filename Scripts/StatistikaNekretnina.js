const SpisakNekretnina = require('./SpisakNekretnina'); 

let StatistikaNekretnina = function () {
    let spisakNekretnina = SpisakNekretnina(); 

    let init = function (listaNekretnina) {
        spisakNekretnina.init(listaNekretnina); 
    };
    let histogramCijena = function (periodi, rasponiCijena) {
        let rezultat = [];
        periodi.forEach((period, indeksPerioda) => {
         
            let nekretnineUPeriodu = spisakNekretnina.filtrirajNekretnine({
                datum_objave: { od: period.od, do: period.do },
            });

          
            rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
            
                let brojNekretnina = nekretnineUPeriodu.filter(nekretnina =>
                    nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do
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

module.exports = StatistikaNekretnina;