document.addEventListener("DOMContentLoaded", function () {
    const btnBuka = document.getElementById("btnBuka");
    const cover = document.getElementById("cover");
    const rightSide = document.getElementById("rightSide");

// --- Logika Buka Undangan Premium ---
    btnBuka.addEventListener("click", function () {
        // 1. Angkat tirai cover ke atas
        welcomeCover.classList.add("terbuka");
        
        // 2. Aktifkan kemampuan scroll halaman ke bawah
        rightSide.style.overflowY = "auto"; 
    });

    // --- Animasi muncul/hilang saat scroll (punya kamu, dipertahankan) ---
    const elemenAnimasi = document.querySelectorAll(".animasi-scroll");

    const opsi = {
        root: rightSide, // penting: root harus .right-side, karena itu yang discroll (bukan window)
        rootMargin: "0px 0px -70px 0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("muncul");
            } else {
                entry.target.classList.remove("muncul");
            }
            // tidak pakai unobserve() supaya animasi bisa berulang saat scroll naik-turun
        });
    }, opsi);

    elemenAnimasi.forEach(function (el) {
        observer.observe(el);
    });
});
