const PoziviAjax = (() => {

    // fnCallback se u svim metodama poziva kada stigne
    // odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data,
    // error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška, poruka se prosljeđuje u error parametru
    // callback-a, a data je tada null

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }
    function impl_getTop5Nekretnina(lokacija, fnCallback) {
        const url = `http://localhost:3000/nekretnine/top5?lokacija=${encodeURIComponent(lokacija)}`;

        
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    function impl_getMojiUpiti(fnCallback) {
        ajaxRequest('GET', '/upiti/moji', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const upiti = JSON.parse(data);
                    fnCallback(null, upiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    function impl_getNekretnina(nekretnina_id, fnCallback) {
        const url = `/nekretnine/${nekretnina_id}`;
        
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnina = JSON.parse(data);
                    fnCallback(null, nekretnina);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    function impl_getNextUpiti(nekretnina_id, page, fnCallback) {
        const url = `/nekretnine/${nekretnina_id}/upiti?page=${page}`;
        
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const upiti = JSON.parse(data);
                    fnCallback(null, upiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    
    

    // vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        let ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    console.log('Uspješan zahtjev, status 200');
                    fnCallback(null, JSON.parse(ajax.responseText));
                } else if (ajax.status == 401) {
                    console.log('Neuspješan zahtjev, status 401');
                    fnCallback("error", null);
                } else {
                    console.log('Nepoznat status:', ajax.status);
                }
            }
        };

        ajax.open("GET", "http://localhost:3000/korisnik/", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send();
    }

    // ažurira podatke loginovanog korisnika
    function impl_putKorisnik(noviPodaci, fnCallback) {
        // Prvo proverite da li je korisnik autentifikovan
        impl_getKorisnik((error, user) => {
            if (error || !user) {
                return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
            }
    
            // Pripremite podatke koji treba da se ažuriraju
            const dataToUpdate = {
                ime: noviPodaci.ime,
                prezime: noviPodaci.prezime,
                username: noviPodaci.username,
                password: noviPodaci.password
            };
    
            // Pošaljite PUT zahtev prema serveru
            ajaxRequest('PUT', `http://localhost:3000/korisnik`, dataToUpdate, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const response = JSON.parse(data);
                        fnCallback(null, response);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        });
    }
    
    // dodaje novi upit za trenutno loginovanog korisnika
    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        impl_getKorisnik((error, user) => {
            if (error || !user) {
                return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
            }
    
            const upit = {
                korisnik_id: user.id,
                nekretnina_id: nekretnina_id,
                tekst_upita: tekst_upita
            };
    
            ajaxRequest('POST', `http://localhost:3000/nekretnina/${nekretnina_id}/upiti`, upit, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const response = JSON.parse(data);
                        fnCallback(null, response);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        });
    }
    
    

    function impl_getNekretnine(fnCallback) {
        // Koristimo AJAX poziv da bismo dohvatili podatke s servera
        ajaxRequest('GET', '/nekretnine', null, (error, data) => {
            // Ako se dogodi greška pri dohvaćanju podataka, proslijedi grešku kroz callback
            if (error) {
                fnCallback(error, null);
            } else {
                // Ako su podaci uspješno dohvaćeni, parsiraj JSON i proslijedi ih kroz callback
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    // Ako se dogodi greška pri parsiranju JSON-a, proslijedi grešku kroz callback
                    fnCallback(parseError, null);
                }
            }
        });
    }
    function impl_getInteresovanja(nekretnina_id, fnCallback) {
        const url = `http://localhost:3000/nekretnina/${nekretnina_id}/interesovanja`;
    
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const interesovanja = JSON.parse(data);
                    fnCallback(null, interesovanja);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_postPonuda(nekretnina_id, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda, fnCallback) {
        impl_getKorisnik((error, user) => {
            if (error || !user) {
                return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
            }
    
            const ponuda = {
                tekst: 'Neka ponuda',  // Možda trebaš tražiti od korisnika da unese tekst ponude
                ponudaCijene: ponudaCijene,
                datumPonude: datumPonude,
                idVezanePonude: idVezanePonude || null,
                odbijenaPonuda: odbijenaPonuda || false
            };
    
            ajaxRequest('POST', `http://localhost:3000/nekretnina/${nekretnina_id}/ponuda`, ponuda, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const response = JSON.parse(data);
                        fnCallback(null, response);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        });
    }
    function impl_postAdminOdgovorPonudi(ponuda_id, ponudaCijene, odbijenaPonuda, fnCallback) {
        ajaxRequest('POST', `http://localhost:3000/admin/ponuda/${ponuda_id}/odgovori`, { ponudaCijene, odbijenaPonuda }, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const response = JSON.parse(data);
                    fnCallback(null, response);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    function impl_postZahtjev(nekretnina_id, tekst_upita, trazeniDatum, fnCallback) {
        impl_getKorisnik((error, user) => {
            if (error || !user) {
                return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
            }
    
            const zahtjev = {
                tekst: tekst_upita,
                trazeniDatum: trazeniDatum
            };
    
            ajaxRequest('POST', `http://localhost:3000/nekretnina/${nekretnina_id}/zahtjev`, zahtjev, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const response = JSON.parse(data);
                        fnCallback(null, response);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        });
    }
    function impl_putZahtjev(nekretnina_id, zahtjev_id, odobren, addToTekst, fnCallback) {
        const zahtjevData = {
            odobren: odobren,
            addToTekst: addToTekst
        };
    
        ajaxRequest('PUT', `http://localhost:3000/nekretnina/${nekretnina_id}/zahtjev/${zahtjev_id}`, zahtjevData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const response = JSON.parse(data);
                    fnCallback(null, response);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
                

    function impl_postLogin(username, password, fnCallback) {
        const ajax = new XMLHttpRequest();
    
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    // Uspješna prijava
                    fnCallback(null, ajax.responseText);
                } else {
                    // Neuspješna prijava
                    fnCallback(ajax.statusText, null);
                }
            }
        };
    
        // Priprema podataka
        const objekat = {
            username: username,
            password: password
        };
    
        // Otvorite POST zahtev
        ajax.open("POST", "http://localhost:3000/login", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(objekat)); // Pošaljite podatke u JSON formatu
    }
    

    function impl_postLogout(fnCallback) {
        let ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/logout", true)
        ajax.send()
    }

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getTop5Nekretnina: impl_getTop5Nekretnina,    // Dodato
        getMojiUpiti: impl_getMojiUpiti,              // Dodato
        getNekretnina: impl_getNekretnina,              // Dodato
        getNextUpiti: impl_getNextUpiti ,              // Dodato
        getInteresovanja: impl_getInteresovanja,  // Dodano
        postPonuda: impl_postPonuda,              // Dodano
        postAdminOdgovorPonudi: impl_postAdminOdgovorPonudi,  // Dodano
        postZahtjev: impl_postZahtjev,            // Dodano
        putZahtjev: impl_putZahtjev               // Dodano
    };
})();