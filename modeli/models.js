const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/baza');  // Importujemo konekciju

  const Korisnik = sequelize.define('Korisnik', {
    ime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prezime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {  
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }, 
  }, {
    tableName: 'Korisnik',
  });
  
  const Upit = sequelize.define('Upit', {
    tekst_upita: {
      type: DataTypes.TEXT,  
      allowNull: false,     
    },
    korisnikId: {  
      type: DataTypes.INTEGER,
      references: {
        model: 'Korisnik',
        key: 'id',
      },
      allowNull: false, 
    },
    nekretninaId: {  
      type: DataTypes.INTEGER,
      references: {
        model: 'Nekretnina',
        key: 'id',
      },
      allowNull: false, 
    }
  }, {
    tableName: 'Upit',
});

  
  const Nekretnina = sequelize.define('Nekretnina', {
    tip_nekretnine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   
    naziv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    kvadratura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cijena: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tip_grijanja: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lokacija: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    godina_izgradnje: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    datum_objave: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    opis: {
      type: DataTypes.TEXT,
      allowNull: true,
    }, 
    upiti: {
      type: DataTypes.TEXT,  
      allowNull: true,
      defaultValue: null,    
      
    }
  },

 {
    tableName: 'Nekretnina',
  });
  
  
  const Zahtjev = sequelize.define('Zahtjev', {
    tekst_zahtjeva: {
      type: DataTypes.TEXT,  // Kolona za tekst upita
      allowNull: false,      // Ova kolona je obavezna
    },
   
    trazeniDatum: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    odobren: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
    },
    korisnikId: {  // Strani ključ prema korisniku
      type: DataTypes.INTEGER,
      references: {
        model: 'Korisnik',
        key: 'id',
      },
      allowNull: false, // Zahtjev mora imati korisnika
    },
    nekretninaId: {  // Strani ključ prema nekretnini
      type: DataTypes.INTEGER,
      references: {
        model: 'Nekretnina',
        key: 'id',
      },
      allowNull: false, // Zahtjev mora biti vezan za neku nekretninu
    }
  }, {
    tableName: 'Zahtjev',
  });
  

  
  
  const Ponuda = sequelize.define('Ponuda', {
    tekst_ponude: {
      type: DataTypes.TEXT,  // Kolona za tekst upita
      allowNull: false,      // Ova kolona je obavezna
    },
    cijenaPonude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    datumPonude: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    odbijenaPonuda: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    korisnikId: {  // Strani ključ prema korisniku
      type: DataTypes.INTEGER,
      references: {
        model: 'Korisnik',
        key: 'id',
      },
      allowNull: false, // Ponuda mora imati korisnika
    },
    nekretninaId: {  // Strani ključ prema nekretnini
      type: DataTypes.INTEGER,
      references: {
        model: 'Nekretnina',
        key: 'id',
      },
      allowNull: false, // Ponuda mora biti vezana za neku nekretninu
      vezanaPonudaId: {  // Strani ključ za vezane ponude
        type: DataTypes.INTEGER,
        references: {
          model: 'Ponuda',
          key: 'id',
        },
        allowNull: true,  // Ovo može biti null ako ponuda nije vezana za neku drugu ponudu
      }
    }
  }, {
    tableName: 'Ponuda',
  });
  

  

  
   

module.exports = {
  Korisnik,
  Nekretnina,
  Upit,
  Zahtjev,
  Ponuda
};
