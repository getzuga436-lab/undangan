document.addEventListener("DOMContentLoaded", function () {
    // === 🛠️ SCRIPT TAMBAHAN: AMBIL NAMA DARI LINK URL ===
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    const elemenNama = document.getElementById('nama-tamu');

    if (namaTamu && elemenNama) {
        // decodeURIComponent mengubah karakter seperti %20 menjadi spasi asli
        elemenNama.innerText = decodeURIComponent(namaTamu);
    }
    // ====================================================

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
        rootMargin: "0px 0px -80px 0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // 1. Saat elemen masuk ke layar -> TAMPILKAN (Muncul)
                    entry.target.classList.add("muncul");
                } else {
                    // 2. Saat elemen keluar dari layar, kita cek posisinya
                    // Jika "top" lebih besar dari 0, berarti elemen tersebut terdorong ke BAWAH layar (Anda men-scroll ke atas).
                    // Maka HAPUS class 'muncul' agar siap dianimasikan lagi nanti.
                    if (entry.boundingClientRect.top > 0) {
                        entry.target.classList.remove("muncul");
                    }
                    // Jika elemen keluar di ATAS layar (Anda lanjut men-scroll jauh ke bawah),
                    // class 'muncul' tidak akan dihapus, sehingga elemennya "tetap ada".
                }
            });
        }, opsi);

    elemenAnimasi.forEach(function (el) {
        observer.observe(el);
    });
});

// Variabel untuk melacak urutan foto yang sedang aktif
let currentIndex = 0;
let galeriImages = [];

document.addEventListener("DOMContentLoaded", function () {
    // Ambil semua elemen gambar yang ada di dalam galeri-grid
    const imgElements = document.querySelectorAll(".galeri-item img");
    galeriImages = Array.from(imgElements).map(img => img.src);
});

// Fungsi untuk membuka modal berdasarkan foto yang diklik
function bukaModal(element) {
    const imgElement = element.querySelector("img");
    const modalImage = document.getElementById("modalImage");
    
    if (imgElement && modalImage) {
        // Cari posisi index gambar saat ini di dalam array galeri
        currentIndex = galeriImages.indexOf(imgElement.src);
        
        // Tampilkan gambar ke modal
        modalImage.src = imgElement.src;
        
        // Tampilkan modal Bootstrap 5
        const myModal = new bootstrap.Modal(document.getElementById('imageModal'));
        myModal.show();
    }
}

// Fungsi untuk menggeser foto ke depan (+1) atau ke belakang (-1) dengan animasi halus
function geserFoto(arah) {
    const modalImage = document.getElementById("modalImage");
    if (!modalImage) return;

    // 1. Jalankan animasi keluar (fade-out / sedikit mengecil)
    modalImage.classList.add("ganti-slide");

    setTimeout(() => {
        // 2. Ubah index foto setelah animasi setengah jalan
        currentIndex += arah;

        if (currentIndex >= galeriImages.length) {
            currentIndex = 0; // Putar balik ke awal
        } else if (currentIndex < 0) {
            currentIndex = galeriImages.length - 1; // Pindah ke akhir
        }

        // 3. Ganti sumber gambar
        modalImage.src = galeriImages[currentIndex];

        // 4. Hilangkan kelas animasi agar gambar kembali muncul mulus (fade-in)
        modalImage.classList.remove("ganti-slide");
    }, 150); // Jeda waktu 150 milidetik agar transisinya pas dan natural
}

// ==========================================
// FITUR SWIPE (SENTUHAN LAYAR HP) PADA MODAL
// ==========================================
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("DOMContentLoaded", function () {
    const modalBody = document.querySelector("#imageModal .modal-body");

    if (modalBody) {
        // Deteksi awal sentuhan jari di layar
        modalBody.addEventListener("touchstart", function (event) {
            touchStartX = event.changedTouches[0].screenX;
        }, { passive: true });

        // Deteksi saat jari diangkat dari layar
        modalBody.addEventListener("touchend", function (event) {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipeGesture();
        }, { passive: true });
    }
});

// Menghitung arah geseran (kiri atau kanan)
function handleSwipeGesture() {
    const batasGeser = 50; // Minimal jarak geser dalam piksel agar terdeteksi

    if (touchEndX < touchStartX - batasGeser) {
        // Geser ke Kiri -> Tampilkan foto berikutnya (Next)
        geserFoto(1);
    } 
    if (touchEndX > touchStartX + batasGeser) {
        // Geser ke Kanan -> Tampilkan foto sebelumnya (Previous)
        geserFoto(-1);
    }
}