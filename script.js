document.addEventListener("DOMContentLoaded", function () {
    const btnBuka = document.getElementById("btnBuka");
    
    // PERBAIKAN: Ubah "cover" menjadi "welcomeCover" agar sesuai dengan ID di HTML
    const cover = document.getElementById("welcomeCover"); 
    const rightSide = document.getElementById("rightSide");

    // --- Logika Buka Undangan Premium ---
    if (btnBuka) {
        btnBuka.addEventListener("click", function () {
            // Sekarang variabel 'cover' sudah sukses mengambil elemen dari HTML
            if (cover) {
                cover.classList.add("terbuka");
            }
            
            // 2. Aktifkan kemampuan scroll halaman ke bawah
            if (rightSide) {
                rightSide.style.overflowY = "auto"; 
            }
        });
    }

    // --- Animasi muncul/hilang saat scroll (Tetap dipertahankan) ---
    const elemenAnimasi = document.querySelectorAll(".animasi-scroll");
    const opsi = {
        root: rightSide,
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
        });
    }, opsi);

    elemenAnimasi.forEach(function (el) {
        observer.observe(el);
    });
});