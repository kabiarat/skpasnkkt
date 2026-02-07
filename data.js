export const skpData = [
    {
        id: "STRUCTURAL_GENERAL",
        category: "Struktural",
        description: "Kepala Dinas/Kepala Bidang/Sekretaris/Lurah/Camat",
        atasan: {
            level: "Bupati/Gubernur",
            rhk: "Meningkatnya efektivitas tata kelola pemerintahan yang akuntabel dan berorientasi pelayanan",
            indikator: "Nilai Indeks Reformasi Birokrasi",
            intervensi: "Mengarahkan pelaksanaan program strategis daerah sesuai visi misi pimpinan"
        },
        bawahan: {
            level: "Eselon II/III/IV",
            rhk: "Terlaksananya koordinasi, pemantauan, dan evaluasi program kerja sesuai target kualitatif dan kuantitatif yang ditetapkan",
            sub_periods: [
                { rencana: "Penyusunan rencana kerja operasional dan penetapan target kinerja", target: "1 Dokumen", bukti: "RKA/DPA" },
                { rencana: "Pelaksanaan koordinasi antar unit kerja", target: "Laporan Triwulan", bukti: "Notulen Rapat" },
                { rencana: "Monitoring progres capaian fisik dan keuangan", target: "1 Laporan", bukti: "Laporan Monitoring" },
                { rencana: "Evaluasi akhir tahun dan pelaporan kinerja", target: "1 Dokumen", bukti: "LAKIP/LKPJ" },
                { rencana: "Capaian target tahunan secara menyeluruh", target: "100%", bukti: "Laporan Akhir" }
            ],
            aspek: [
                { jenis: "Kualitas", indikator: "Tingkat kesesuaian output dengan standar operasional prosedur", target: "100%" },
                { jenis: "Kuantitas", indikator: "Jumlah produk kebijakan/layanan yang dihasilkan", target: "12 Laporan" },
                { jenis: "Waktu", indikator: "Ketepatan waktu penyampaian laporan kinerja", target: "12 Bulan" },
                { jenis: "Biaya", indikator: "Realisasi anggaran sesuai dengan perencanaan (DPA)", target: "Sesuai Pagu" }
            ]
        }
    },
    {
        id: "FUNCTIONAL_TEACHER",
        category: "Fungsional Guru",
        description: "Guru Ahli Pertama/Muda/Madya/Utama",
        atasan: {
            level: "Kepala Sekolah",
            rhk: "Meningkatnya kualitas lulusan melalui proses pembelajaran yang bermutu",
            indikator: "Nilai Standar Kompetensi Lulusan",
            intervensi: "Melaksanakan bimbingan dan pelatihan profesional secara berkelanjutan"
        },
        bawahan: {
            level: "Guru ASN",
            rhk: "Terlaksananya proses pembelajaran, pembimbingan, dan evaluasi hasil belajar siswa sesuai perangkat kurikulum",
            sub_periods: [
                { rencana: "Menyusun perangkat pembelajaran (RPP/Modul Ajar)", target: "1 Dokumen", bukti: "Silabus/RPP" },
                { rencana: "Melaksanakan kegiatan belajar mengajar secara interaktif", target: "Jurnal Mengajar", bukti: "Daftar Hadir Siswa" },
                { rencana: "Melakukan evaluasi dan penilaian hasil belajar", target: "LAPOR", bukti: "Daftar Nilai" },
                { rencana: "Menganalisis hasil evaluasi dan program pengayaan/remedial", target: "Laporan Review", bukti: "Dokumen Analisis" },
                { rencana: "Pelaporan kinerja guru tahunan", target: "1 Dokumen", bukti: "PKG (Penilaian Kinerja Guru)" }
            ],
            aspek: [
                { jenis: "Kualitas", indikator: "Tingkat pemahaman siswa terhadap materi pembelajaran", target: "85%" },
                { jenis: "Kuantitas", indikator: "Jumlah pertemuan tatap muka yang terlaksana", target: "36 Minggu" },
                { jenis: "Waktu", indikator: "Ketepatan penyelesaian administrasi kelas", target: "12 Bulan" },
                { jenis: "Biaya", indikator: "Efisiensi penggunaan dana BOS/BOP sesuai juknis", target: "100%" }
            ]
        }
    },
    {
        id: "MEDICAL_GENERAL",
        category: "Kesehatan",
        description: "Dokter/Perawat/Nakes Rumah Sakit/Puskesmas",
        atasan: {
            level: "Kepala RS/Kepala Puskesmas",
            rhk: "Meningkatnya standar pelayanan kesehatan masyarakat yang prima",
            indikator: "Indeks Kepuasan Masyarakat (IKM) Kesehatan",
            intervensi: "Menyelenggarakan tindakan medik dan asuhan keperawatan sesuai standar profesi"
        },
        bawahan: {
            level: "Tenaga Kesehatan",
            rhk: "Terselenggaranya pendokumentasian asuhan, tindakan medis, dan edukasi kesehatan secara akurat",
            sub_periods: [
                { rencana: "Pengkajian awal pasien dan perencanaan tindakan", target: "Logbook Pasien", bukti: "Rekam Medis" },
                { rencana: "Pemberian tindakan medis/asuhan keperawatan harian", target: "SOP Tindakan", bukti: "Lembar Observasi" },
                { rencana: "Edukasi kesehatan bagi pasien dan keluarga", target: "Laporan Edukasi", bukti: "Leaflet/Dokumentasi" },
                { rencana: "Audit medis/keperawatan internal", target: "1 Laporan", bukti: "Hasil Audit" },
                { rencana: "Laporan kinerja pelayanan tahunan", target: "1 Dokumen", bukti: "Laporan Tahunan" }
            ],
            aspek: [
                { jenis: "Kualitas", indikator: "Zero tolerance terhadap kesalahan tindakan medis", target: "100%" },
                { jenis: "Kuantitas", indikator: "Jumlah pasien yang terlayani sesuai standar pelayanan minimum", target: "Sesuai Kunjungan" },
                { jenis: "Waktu", indikator: "Respon time pelayanan gawat darurat/rawat jalan", target: "< 15 Menit" },
                { jenis: "Biaya", indikator: "Efektivitas penggunaan BMHP dan BHP medis", target: "100%" }
            ]
        }
    },
    {
        id: "ADMIN_OPERATIONAL",
        category: "Administrasi",
        description: "Penata Layanan Operasional/Pengadministrasi",
        atasan: {
            level: "Sekretaris/Kasubag",
            rhk: "Meningkatnya efisiensi pengelolaan administrasi perkantoran",
            indikator: "Persentase ketertiban administrasi",
            intervensi: "Melaksanakan dukungan layanan teknis dan operasional perkantoran"
        },
        bawahan: {
            level: "ASN Operasional",
            rhk: "Terselenggaranya pengelolaan dokumen, surat menyurat, dan aset secara tertib dan akuntabel",
            sub_periods: [
                { rencana: "Identifikasi kebutuhan dokumen operasional", target: "Daftar Inventaris", bukti: "Checklist" },
                { rencana: "Pengarsipan surat masuk dan keluar secara digital/manual", target: "Buku Kendali", bukti: "Arsip Surat" },
                { rencana: "Pemeliharaan kebersihan dan kelaikan sarana prasarana", target: "Laporan Harian", bukti: "Ceklist Sarpras" },
                { rencana: "Rekapitulasi data pendukung laporan keuangan", target: "Laporan Rekap", bukti: "Dokumen SPJ" },
                { rencana: "Penyusunan laporan administrasi tahunan", target: "1 Dokumen", bukti: "Laporan Akhir" }
            ],
            aspek: [
                { jenis: "Kualitas", indikator: "Tingkat akurasi data dalam penginputan sistem", target: "100%" },
                { jenis: "Kuantitas", indikator: "Jumlah dokumen yang diproses/diarsipkan", target: "Sesuai Beban Kerja" },
                { jenis: "Waktu", indikator: "Kecepatan distribusi surat/dokumen", target: "< 24 Jam" },
                { jenis: "Biaya", indikator: "Efisiensi belanja ATK dan keperluan operasional", target: "100%" }
            ]
        }
    }
];
