const { Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = require("../modeli/models");

module.exports = () => {
// Veza između Korisnik i Ponuda
Korisnik.hasMany(Ponuda, { foreignKey: 'korisnikId' });
Ponuda.belongsTo(Korisnik, { foreignKey: 'korisnikId' });

// Veza između Nekretnina i Ponuda
Nekretnina.hasMany(Ponuda, { foreignKey: 'nekretninaId' });
Ponuda.belongsTo(Nekretnina, { foreignKey: 'nekretninaId' });

Nekretnina.hasMany(Upit, { foreignKey: 'nekretninaId' });
Upit.belongsTo(Nekretnina, { foreignKey: 'nekretninaId' });

// Veza između Ponuda i Ponuda (vezane ponude)
Ponuda.hasMany(Ponuda, { foreignKey: 'vezanaPonudaId' });
Ponuda.belongsTo(Ponuda, { foreignKey: 'vezanaPonudaId' });

// Veza između Upit i Korisnik
Upit.belongsTo(Korisnik, { foreignKey: 'korisnikId' });
Korisnik.hasMany(Upit, { foreignKey: 'korisnikId' });

// Veza između Zahtjev i Nekretnina
Zahtjev.belongsTo(Nekretnina, { foreignKey: 'nekretninaId' });
Nekretnina.hasMany(Zahtjev, { foreignKey: 'nekretninaId' });

// Veza između Zahtjev i Korisnik
Zahtjev.belongsTo(Korisnik, { foreignKey: 'korisnikId' });
Korisnik.hasMany(Zahtjev, { foreignKey: 'korisnikId' });

// Dodavanje metode `getInteresovanja` u model Nekretnina
Nekretnina.prototype.getInteresovanja = async function() {
  // Dohvatiti sve upite, zahtjeve i ponude vezane za ovu nekretninu
  const upiti = await Upit.findAll({ where: { nekretninaId: this.id } });
  const zahtjevi = await Zahtjev.findAll({ where: { nekretninaId: this.id } });
  const ponude = await Ponuda.findAll({ where: { nekretninaId: this.id } });

  // Vratiti sve interesovanja u jednoj listi
  return [...upiti, ...zahtjevi, ...ponude];
}}

