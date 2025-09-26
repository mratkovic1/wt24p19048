let SpisakNekretnina = function () {
    // Privatni atributi modula
    let listaNekretnina = [];

    // Implementacija metoda
    let init = function (listaNekretninaParam) {
        listaNekretnina = listaNekretninaParam;
    };

    let filtrirajNekretnine = function (kriterij) {
        return listaNekretnina.filter(nekretnina => {
            // Filtriranje po datumu objave
            if (kriterij.datum_objave) {
                const datumObjave = new Date(nekretnina.datum_objave);
                if (datumObjave < new Date(kriterij.datum_objave.od) || datumObjave > new Date(kriterij.datum_objave.do)) {
                    return false;
                }
            }

            // Filtriranje po cijeni (ako postoji)
            if (kriterij.min_cijena && nekretnina.cijena < kriterij.min_cijena) {
                return false;
            }
            if (kriterij.max_cijena && nekretnina.cijena > kriterij.max_cijena) {
                return false;
            }

            return true;
        });
    };

    return {
        init: init,
        filtrirajNekretnine: filtrirajNekretnine
    };
};

