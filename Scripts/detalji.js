window.onload = function() {
    const upitiContainer = document.getElementById('upiti'); 
    const sviUpiti = document.querySelectorAll('.upit');
    let trenutniUpitIndex = 0; 


    function prikaziUpit(indeks) {
  
        sviUpiti.forEach(upit => upit.style.display = 'none');
        
   
        if (indeks >= 0 && indeks < sviUpiti.length) {
           
            sviUpiti[indeks].style.display = 'block';
        }

      
        if (trenutniUpitIndex <= 0) {
            document.getElementById('prev').disabled = true; 
        } else {
            document.getElementById('prev').disabled = false;
        }

        if (trenutniUpitIndex >= sviUpiti.length - 1) {
            document.getElementById('next').disabled = true; 
        } else {
            document.getElementById('next').disabled = false;
        }
    }

    function sljedeciUpit() {
        if (trenutniUpitIndex < sviUpiti.length - 1) {
            trenutniUpitIndex++;
            prikaziUpit(trenutniUpitIndex);
        }
    }

   
    function prethodniUpit() {
        if (trenutniUpitIndex > 0) {
            trenutniUpitIndex--;
            prikaziUpit(trenutniUpitIndex);
        }
    }
    prikaziUpit(trenutniUpitIndex);

   
    document.getElementById('prev').onclick = prethodniUpit;
    document.getElementById('next').onclick = sljedeciUpit;

   
    function provjeriVelicinuEkrana() {
        if (window.innerWidth < 600) {
          
            upitiContainer.style.display = 'block'; 
            prikaziUpit(trenutniUpitIndex); 
        } else {
           
            upitiContainer.style.display = 'flex'; 
            upitiContainer.style.flexWrap = 'wrap'; 
            sviUpiti.forEach(upit => upit.style.display = 'block');
        }
    }

  
    provjeriVelicinuEkrana();
    window.onresize = provjeriVelicinuEkrana;
};