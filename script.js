// DATA UNDANGAN DAN PEMBUKA
const namaTamuUrl = new URLSearchParams(window.location.search).get("to");

document.addEventListener("DOMContentLoaded", function () {
    // Isi teks dan tautan dari konfigurasi undangan.
    const ambilKonten = function (jalur) {
        return jalur.split(".").reduce(function (nilai, bagian) {
            return nilai == null ? undefined : nilai[bagian];
        }, window.kontenUndangan);
    };

    document.querySelectorAll("[data-konten]").forEach(function (elemen) {
        const nilai = ambilKonten(elemen.dataset.konten);
        if (Array.isArray(nilai)) {
            elemen.replaceChildren();
            nilai.forEach(function (baris, index) {
                if (index > 0) {
                    elemen.appendChild(document.createElement("br"));
                }
                elemen.appendChild(document.createTextNode(baris));
            });
        } else if (typeof nilai === "string") {
            elemen.textContent = nilai;
        } else {
            throw new Error("Konten undangan tidak ditemukan: " + elemen.dataset.konten);
        }
    });

    document.querySelectorAll("[data-konten-href]").forEach(function (elemen) {
        const nilai = ambilKonten(elemen.dataset.kontenHref);
        if (typeof nilai !== "string") {
            throw new Error("URL konten undangan tidak ditemukan: " + elemen.dataset.kontenHref);
        }
        elemen.href = nilai;
    });

    // Tampilkan nama tamu dari parameter URL (?to=...).
    const elemenNama = document.getElementById("nama-tamu");

    if (namaTamuUrl && elemenNama) {
        elemenNama.innerText = decodeURIComponent(namaTamuUrl);
    }

    const btnBuka = document.getElementById("btnBuka");
    const openingVideo = document.querySelector(".video-mempelai");
    const bgMusic = document.getElementById("bgMusic");
    const musicBtn = document.getElementById("musicBtn");
    let videoDimulai = false;

    const cover = document.getElementById("welcomeCover");
    const rightSide = document.getElementById("rightSide");

    // Sinkronkan tombol musik dengan status audio.
    if (bgMusic && musicBtn) {
        bgMusic.addEventListener("play", function () {
            musicBtn.classList.add("diputar");
            musicBtn.setAttribute("aria-pressed", "true");
        });

        bgMusic.addEventListener("pause", function () {
            musicBtn.classList.remove("diputar");
            musicBtn.setAttribute("aria-pressed", "false");
        });

        musicBtn.addEventListener("click", function () {
            if (bgMusic.paused) {
                bgMusic.play().catch(function (error) {
                    console.error("Musik undangan gagal diputar:", error);
                });
            } else {
                bgMusic.pause();
            }
        });
    }

    // Buka cover, mulai media, dan aktifkan scroll.
    if (btnBuka) {
        btnBuka.addEventListener("click", function () {
            if (bgMusic) {
                bgMusic.play().catch(function (error) {
                    console.error("Musik undangan gagal diputar:", error);
                });
            }

            if (cover) {
                cover.classList.add("terbuka");
            }

            if (musicBtn) {
                musicBtn.classList.add("terlihat");
            }

            if (openingVideo) {
                videoDimulai = true;
                openingVideo.currentTime = 0;
                openingVideo.play().catch(function (error) {
                    console.error("Video pembuka gagal diputar:", error);
                });
            }
            if (rightSide) {
                rightSide.style.overflowY = "auto";
            }
        });
    }

    // Jeda video saat keluar layar dan ulangi saat terlihat kembali.
    const elemenAnimasi = document.querySelectorAll(".animasi-scroll");
    const opsi = {
        root: rightSide,
        rootMargin: "0px 0px -80px 0px",
        threshold: 0.15
    };

    if (openingVideo) {
        const videoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    openingVideo.pause();
                } else if (videoDimulai && openingVideo.paused) {
                    openingVideo.play().catch(function (error) {
                        console.error("Video pembuka gagal dilanjutkan:", error);
                    });
                }
            });
        }, {
            root: rightSide,
            threshold: 0.1
        });

        videoObserver.observe(openingVideo);
    }

    // Jalankan animasi elemen saat discroll.
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("muncul");
            } else if (entry.boundingClientRect.top > 0) {
                entry.target.classList.remove("muncul");
            }
        });
    }, opsi);

    elemenAnimasi.forEach(function (elemen) {
        observer.observe(elemen);
    });
});

// GALERI FOTO: STATE, NAVIGASI, DAN ZOOM
let currentIndex = 0;
let galeriImages = [];
let zoomScale = 1;
let zoomOffsetX = 0;
let zoomOffsetY = 0;
const zoomPointers = new Map();
let pinchStartDistance = 0;
let pinchStartScale = 1;
let panStartX = 0;
let panStartY = 0;
let panStartOffsetX = 0;
let panStartOffsetY = 0;
let swipeStartX = 0;
let swipeStartScale = 1;
let wasPinching = false;

// Dipanggil langsung oleh handler onclick di index.html.
function bukaModal(element) {
    const imgElement = element.querySelector("img");
    const modalImage = document.getElementById("modalImage");

    if (imgElement && modalImage) {
        currentIndex = galeriImages.indexOf(imgElement.src);
        modalImage.src = imgElement.src;
        resetZoom();

        const myModal = new bootstrap.Modal(document.getElementById("imageModal"));
        myModal.show();
    }
}

// Dipanggil oleh kontrol navigasi galeri dan gesture swipe.
function geserFoto(arah) {
    const modalImage = document.getElementById("modalImage");
    if (!modalImage) return;

    modalImage.classList.add("ganti-slide");

    setTimeout(function () {
        currentIndex += arah;

        if (currentIndex >= galeriImages.length) {
            currentIndex = 0;
        } else if (currentIndex < 0) {
            currentIndex = galeriImages.length - 1;
        }

        modalImage.src = galeriImages[currentIndex];
        resetZoom();
        modalImage.classList.remove("ganti-slide");
    }, 150);
}

document.addEventListener("DOMContentLoaded", function () {
    // Siapkan galeri dan kontrol modal.
    const imgElements = document.querySelectorAll(".galeri-item img");
    galeriImages = Array.from(imgElements).map(function (img) {
        return img.src;
    });

    const modal = document.getElementById("imageModal");
    const modalBody = document.querySelector("#imageModal .modal-body");
    const modalImage = document.getElementById("modalImage");

    if (modalBody && modalImage) {
        modalImage.addEventListener("wheel", function (event) {
            event.preventDefault();
            ubahZoom(event.deltaY < 0 ? 0.25 : -0.25);
        }, { passive: false });

        modalImage.addEventListener("dblclick", function () {
            if (zoomScale > 1) {
                resetZoom();
            } else {
                setZoom(2);
            }
        });

        modalImage.addEventListener("pointerdown", function (event) {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            event.preventDefault();
            modalImage.setPointerCapture(event.pointerId);
            zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (zoomPointers.size === 1) {
                swipeStartX = event.clientX;
                swipeStartScale = zoomScale;
                panStartX = event.clientX;
                panStartY = event.clientY;
                panStartOffsetX = zoomOffsetX;
                panStartOffsetY = zoomOffsetY;
                wasPinching = false;
            } else if (zoomPointers.size === 2) {
                const [first, second] = zoomPointers.values();
                pinchStartDistance = Math.hypot(second.x - first.x, second.y - first.y);
                pinchStartScale = zoomScale;
                wasPinching = true;
            }
        });

        modalImage.addEventListener("pointermove", function (event) {
            if (!zoomPointers.has(event.pointerId)) return;
            zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (zoomPointers.size >= 2) {
                const [first, second] = zoomPointers.values();
                const distance = Math.hypot(second.x - first.x, second.y - first.y);
                if (pinchStartDistance > 0) {
                    setZoom(pinchStartScale * distance / pinchStartDistance);
                }
            } else if (zoomScale > 1) {
                const pointer = zoomPointers.get(event.pointerId);
                zoomOffsetX = panStartOffsetX + pointer.x - panStartX;
                zoomOffsetY = panStartOffsetY + pointer.y - panStartY;
                renderZoom();
            }
        });

        const endPointer = function (event) {
            if (!zoomPointers.has(event.pointerId)) return;
            const pointer = { x: event.clientX, y: event.clientY };
            zoomPointers.set(event.pointerId, pointer);
            zoomPointers.delete(event.pointerId);

            if (zoomPointers.size === 1) {
                const remaining = zoomPointers.values().next().value;
                panStartX = remaining.x;
                panStartY = remaining.y;
                panStartOffsetX = zoomOffsetX;
                panStartOffsetY = zoomOffsetY;
            } else if (zoomPointers.size === 0) {
                if (!wasPinching && swipeStartScale <= 1 && zoomScale <= 1 &&
                    Math.abs(pointer.x - swipeStartX) > 50) {
                    geserFoto(pointer.x < swipeStartX ? 1 : -1);
                }
                pinchStartDistance = 0;
            }
        };

        modalImage.addEventListener("pointerup", endPointer);
        modalImage.addEventListener("pointercancel", endPointer);
    }

    if (modal) {
        modal.addEventListener("hidden.bs.modal", resetZoom);
        modal.addEventListener("keydown", function (event) {
            if (event.key === "+" || event.key === "=") {
                event.preventDefault();
                ubahZoom(0.25);
            } else if (event.key === "-") {
                event.preventDefault();
                ubahZoom(-0.25);
            } else if (event.key === "0") {
                resetZoom();
            }
        });
    }
});

function ubahZoom(perubahan) {
    setZoom(zoomScale + perubahan);
}

function setZoom(skala) {
    zoomScale = Math.min(4, Math.max(1, skala));
    if (zoomScale === 1) {
        zoomOffsetX = 0;
        zoomOffsetY = 0;
    }
    renderZoom();
}

function renderZoom() {
    const modalImage = document.getElementById("modalImage");
    if (!modalImage) return;

    modalImage.style.transform = `translate3d(${zoomOffsetX}px, ${zoomOffsetY}px, 0) scale(${zoomScale})`;
    modalImage.style.cursor = zoomScale > 1 ? "grab" : "zoom-in";
}

function resetZoom() {
    zoomScale = 1;
    zoomOffsetX = 0;
    zoomOffsetY = 0;
    renderZoom();
}

// UCAPAN, DOA, DAN RSVP
document.addEventListener("DOMContentLoaded", function () {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbx_k7EC2-ZZBWfB8PsyqJ0HFkALO1MxU8nhIjpYYgHm3K_0bP17IsIuzzYi4XR9z7E/exec";
    const inputNamaPengirim = document.getElementById("namaPengirim");

    if (inputNamaPengirim) {
        if (namaTamuUrl) {
            inputNamaPengirim.value = decodeURIComponent(namaTamuUrl);
        } else {
            inputNamaPengirim.value = ""; 
        }
    }

    const formGabungan = document.getElementById("formGabungan");
    const daftarUcapan = document.getElementById("daftarUcapan");
    const btnKirim = document.getElementById("btnKirimSemua");

    // Muat daftar ucapan saat halaman dibuka.
    muatUcapan();

    if (formGabungan) {
        formGabungan.addEventListener("submit", function (e) {
            e.preventDefault();

            const nama = inputNamaPengirim ? inputNamaPengirim.value.trim() : "Tamu Undangan";
            const kehadiran = document.getElementById("rsvpStatus").value;
            const pesan = document.getElementById("pesanUcapan").value.trim();
            const tanggal = new Date().toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
            });

            if (!nama || !kehadiran || !pesan) {
                alert("Semua kolom harus diisi!");
                return;
            }

            btnKirim.disabled = true;
            btnKirim.innerText = "Mengirim...";

            const formData = new FormData();
            formData.append("nama", nama);
            formData.append("kehadiran", kehadiran);
            formData.append("pesan", pesan);
            formData.append("tanggal", tanggal);

            fetch(GAS_URL, {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert("Terima kasih! Konfirmasi kehadiran dan ucapan Anda berhasil dikirim.");
                formGabungan.reset();
                
                if (namaTamuUrl && inputNamaPengirim) {
                    inputNamaPengirim.value = decodeURIComponent(namaTamuUrl);
                }

                btnKirim.disabled = false;
                btnKirim.innerText = "Kirim Konfirmasi & Ucapan";
                muatUcapan();
            })
            .catch(error => {
                console.error("Error mengirim ucapan:", error);
                alert("Gagal mengirim data, silakan coba lagi.");
                btnKirim.disabled = false;
                btnKirim.innerText = "Kirim Konfirmasi & Ucapan";
            });
        });
    }

    function muatUcapan() {
        if (!daftarUcapan) return;

        fetch(GAS_URL)
            .then(response => response.json())
            .then(data => {
                daftarUcapan.innerHTML = "";
                
                if (!data || data.length === 0) {
                    daftarUcapan.innerHTML = "<p class='text-center text-muted small'>Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>";
                    return;
                }

                data.reverse().forEach(item => {
                    if (!item.pesan) return;

                    let badgeWarna = "secondary";
                    if (item.kehadiran === "Hadir") badgeWarna = "success";
                    else if (item.kehadiran === "Tidak Hadir") badgeWarna = "danger";
                    else if (item.kehadiran === "Masih Ragu-ragu") badgeWarna = "warning";

                    const card = document.createElement("div");
                    card.className = "card mb-2 p-3 border-0 shadow-sm";
                    card.style.backgroundColor = "#fdfbfb";
                    card.style.borderRadius = "12px";
                    card.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong style="font-size: 0.9rem; color: #333;"><i class="bi bi-person-circle"></i> ${escapeHtml(item.nama)}</strong>
                            <span class="badge bg-${badgeWarna}" style="font-size: 0.65rem;">${escapeHtml(item.kehadiran || 'Hadir')}</span>
                        </div>
                        <p class="mb-1 text-secondary" style="font-size: 0.85rem; line-height: 1.4; word-break: break-word;">${escapeHtml(item.pesan)}</p>
                        <small class="text-muted" style="font-size: 0.7rem; display: block; text-align: right;">${escapeHtml(item.tanggal)}</small>
                    `;
                    daftarUcapan.appendChild(card);
                });
            })
            .catch(error => {
                console.error("Error memuat ucapan:", error);
                daftarUcapan.innerHTML = "<p class='text-center text-danger small'>Gagal memuat daftar ucapan.</p>";
            });
    }

    function escapeHtml(text) {
        if (text == null) return "";

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});