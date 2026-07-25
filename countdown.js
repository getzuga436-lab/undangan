document.addEventListener("DOMContentLoaded", function () {
    const targetDate = new Date("November 20, 2026 09:00:00").getTime();
    
    // Ambil elemen angkanya langsung
    const elHari = document.getElementById("cd-hari");
    const elJam = document.getElementById("cd-jam");
    const elMenit = document.getElementById("cd-menit");
    const elDetik = document.getElementById("cd-detik");
    const countdownEl = document.getElementById("countdown");

    if (elHari && elJam && elMenit && elDetik) {
        const timer = setInterval(function () {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(timer);
                if (countdownEl) {
                    countdownEl.innerHTML = "<p style='font-family: Work Sans; color: #a87e7e; font-weight: bold; margin-top:1rem;'>Acara Telah Berlangsung</p>";
                }
                return;
            }

            const hari = Math.floor(distance / (1000 * 60 * 60 * 24));
            const jam = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const menit = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const detik = Math.floor((distance % (1000 * 60)) / 1000);

            // Update angka secara mulus tanpa merusak border CSS kotak
            elHari.innerText = hari;
            elJam.innerText = jam;
            elMenit.innerText = menit;
            elDetik.innerText = detik;

        }, 1000);
    }
});