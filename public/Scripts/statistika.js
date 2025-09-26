import { listaNekretnina } from './SpisakNekretnina.js';
import { StatistikaNekretnina } from './StatistikaNekretnina.js';

document.addEventListener('DOMContentLoaded', () => {
  const periodiContainer = document.getElementById('periodi-container');
  const rasponiContainer = document.getElementById('rasponi-container');
  const chartsContainer = document.getElementById('charts-container');

  
  document.getElementById('dodaj-period').addEventListener('click', () => {
    const newPeriod = document.createElement('div');
    newPeriod.className = 'period';
    newPeriod.innerHTML = ` 
      <label>Početna godina perioda:</label>
      <input type="number" class="od-period" placeholder="npr. 2000">
      <label>Krajnja godina perioda:</label>
      <input type="number" class="do-period" placeholder="npr. 2024">
    `;
    periodiContainer.appendChild(newPeriod);
  });


  document.getElementById('dodaj-raspon').addEventListener('click', () => {
    const newRaspon = document.createElement('div');
    newRaspon.className = 'raspon';
    newRaspon.innerHTML = ` 
      <label>Min cijena:</label>
      <input type="number" class="od-raspon" placeholder="npr. 10000">
      <label>Max cijena:</label>
      <input type="number" class="do-raspon" placeholder="npr. 150000">
    `;
    rasponiContainer.appendChild(newRaspon);
  });

  
  document.getElementById('iscrtaj-histogram').addEventListener('click', () => {
    chartsContainer.innerHTML = '';

    const periodi = [...document.querySelectorAll('.period')].map(period => ({
      od: parseInt(period.querySelector('.od-period').value),
      do: parseInt(period.querySelector('.do-period').value),
    }));

    const rasponiCijena = [...document.querySelectorAll('.raspon')].map(raspon => ({
      od: parseInt(raspon.querySelector('.od-raspon').value),
      do: parseInt(raspon.querySelector('.do-raspon').value),
    }));

    const statistika = new StatistikaNekretnina();
    statistika.init(listaNekretnina);

 
    const rezultat = statistika.histogramCijena(periodi, rasponiCijena);

    rezultat.forEach(item => {
      const chartWrapper = document.createElement('div');
      chartWrapper.className = 'chart-wrapper';
      const canvas = document.createElement('canvas');
      canvas.id = `chart-${item.indeksPerioda}-${item.indeksRaspona}`;
      chartWrapper.appendChild(canvas);
      chartsContainer.appendChild(chartWrapper);

      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [`Period: ${periodi[item.indeksPerioda].od} - ${periodi[item.indeksPerioda].do}`, `Raspon: ${rasponiCijena[item.indeksRaspona].od} - ${rasponiCijena[item.indeksRaspona].do}`],
          datasets: [{
            label: 'Broj Nekretnina',
            data: [item.brojNekretnina],
            backgroundColor: `hsl(${(item.indeksPerioda * 70) % 360}, 70%, 60%)`
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Rasponi Cijena'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Broj Nekretnina'
              }
            }
          }
        }
      });
    });
  });
});