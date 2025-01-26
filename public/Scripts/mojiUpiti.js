document.addEventListener('DOMContentLoaded', function () {
  // Dohvati upite sa servera kada stranica bude učitana
  fetch('/upiti/moji', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Neuspješan zahtjev za upitima');
    }
    return response.json();
  })
  .then(upiti => {
    const upitiContainer = document.getElementById('upitiContainer');
    
    if (upiti.length === 0) {
      upitiContainer.innerHTML = '<p>Nemate nikakve upite.</p>';
    } else {
      upiti.forEach(upit => {
        const upitDiv = document.createElement('div');
        upitDiv.classList.add('upit');
        upitDiv.innerHTML = `
          <p><strong>Nekretnina ID:</strong> ${upit.id_nekretnine}</p>
          <p><strong>Upit:</strong> ${upit.tekst_upita}</p>
        `;
        upitiContainer.appendChild(upitDiv);
      });
    }
  })
  .catch(error => {
    console.error('Greška prilikom učitavanja upita:', error);
  });

  // Event listener za odjavu
  document.getElementById("logoutButton").addEventListener("click", function() {
    fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        window.location.href = '/prijava.html';  // Preusmjeri na stranicu za prijavu
      } else {
        alert('Greška pri odjavi');
      }
    })
    .catch(error => {
      console.error('Greška prilikom odjave:', error);
      alert('Greška prilikom odjave');
    });
  });
});
