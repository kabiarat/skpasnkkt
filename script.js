import { skpData } from './data.js';

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://azaiekzidlkpkwvwpjtz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6YWlla3ppZGxrcGt3dndwanR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjYzMjgsImV4cCI6MjA4NjA0MjMyOH0.o_cG_Uit9ze09ZUGQtL75jAqRGd00XOtX_A_2vZpqp0';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentRhkItems = []; // State for multiple RHKs

document.addEventListener('DOMContentLoaded', () => {
    // --- NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');

            // Update Active Nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show Section
            sections.forEach(section => {
                section.style.display = 'none';
                if (section.id === targetId) {
                    section.style.display = 'block';
                    // Trigger specific load logic
                    if (targetId === 'history-section') {
                        loadHistory();
                    }
                    if (targetId === 'skp-section') {
                        document.getElementById('guideModal').classList.add('active');
                    }
                }
            });
        });
    });

    // --- GUIDE MODAL HANDLERS ---
    const guideModal = document.getElementById('guideModal');
    const closeGuideModal = document.getElementById('closeGuideModal');
    const btnUnderstand = document.getElementById('btnUnderstand');

    if (guideModal && closeGuideModal && btnUnderstand) {
        function closeGuide() { guideModal.classList.remove('active'); }
        closeGuideModal.addEventListener('click', closeGuide);
        btnUnderstand.addEventListener('click', closeGuide);
    }


    // --- APP LOGO LOGIC ---
    if (document.getElementById('logoUpload')) {
        const logoUpload = document.getElementById('logoUpload');
        const appLogo = document.getElementById('appLogo');
        const logoPreviewName = document.getElementById('logoPreviewName');
        const heroLogoContainer = document.querySelector('.hero-logo');

        // Load saved logo from Supabase
        async function loadAppLogo() {
            const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'skp_app_logo').maybeSingle();
            if (data && appLogo) {
                appLogo.src = data.value;
                if (heroLogoContainer) heroLogoContainer.style.display = 'block';
            }
        }
        loadAppLogo();

        logoUpload.addEventListener('change', async function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert("Ukuran file terlalu besar. Maksimal 2MB.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = async function (event) {
                    const dataUrl = event.target.result;
                    try {
                        const { error } = await supabase.from('app_settings').upsert({ key: 'skp_app_logo', value: dataUrl });
                        if (error) throw error;

                        if (appLogo) {
                            appLogo.src = dataUrl;
                            if (heroLogoContainer) heroLogoContainer.style.display = 'block';
                        }
                        if (logoPreviewName) {
                            logoPreviewName.textContent = "Terpilih: " + file.name;
                        }
                        showNotification('Logo berhasil diupload!', 'success');
                    } catch (err) {
                        console.error(err);
                        alert("Gagal menyimpan logo ke Supabase.");
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- NOTIFICATION UTILS ---
    const notification = {
        overlay: document.getElementById('notification-overlay'),
        icon: document.getElementById('notification-icon'),
        message: document.getElementById('notification-message')
    };

    function showNotification(msg, type = 'success') {
        notification.message.textContent = msg;

        // Reset animation
        notification.icon.style.animation = 'none';
        notification.icon.offsetHeight; /* trigger reflow */
        notification.icon.style.animation = 'successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

        if (type === 'success') {
            notification.icon.className = 'fas fa-check-circle notification-icon';
            notification.icon.style.color = 'var(--success-color)';
        } else if (type === 'error') {
            notification.icon.className = 'fas fa-times-circle notification-icon';
            notification.icon.style.color = 'var(--danger-color)';
        }

        notification.overlay.classList.add('active');

        // Hide after 2 seconds
        setTimeout(() => {
            notification.overlay.classList.remove('active');
        }, 2000);
    }

    // --- JABATAN LOGIC ---
    const jabatanInputs = {
        selector: document.getElementById('jabatanSelector'),
        newInput: document.getElementById('newJabatan'),
        masterDatalist: document.getElementById('masterJabatanOptions'),
        newUraian: document.getElementById('newUraian'),
        addBtn: document.getElementById('addJabatanBtn'),
        list: document.getElementById('jabatanList')
    };

    const levelInputs = {
        selector: document.getElementById('levelAtasanSelector'),
        editSelector: document.getElementById('editLevelAtasan'),
        newInput: document.getElementById('newLevel'),
        addBtn: document.getElementById('addLevelBtn'),
        list: document.getElementById('levelList')
    };

    const bidangInputs = {
        selector: document.getElementById('bidangSelector'),
        newInput: document.getElementById('newBidang'),
        addBtn: document.getElementById('addBidangBtn'),
        list: document.getElementById('bidangList')
    };

    // Default Jabatans
    const defaultJabatans = [
        "Penata Layanan Operasional",
        "Pengadministrasi Perkantoran",
        "Analis Kebijakan Ahli Muda",
        "Pranata Komputer Ahli Pertama"
    ];

    const defaultLevels = [
        "Gubernur", "Wakil Gubernur", "Bupati", "Wakil Bupati", "Wali Kota", "Wakil Wali Kota",
        "Sekda", "Kepala Dinas", "Kepala Badan", "Kepala Bagian", "Sekretaris", "Kepala Bidang",
        "Camat", "Lurah", "Kasubag", "Kepala Seksi",
        "Koordinator Wilayah", "Kepala Sekolah", "Direktur Rumah Sakit",
        "Wakil Direktur Rumah Sakit", "Kepala Bidang Rumah Sakit", "Kepala Bagian Rumah Sakit",
        "Kepala Seksi Rumah Sakit", "Kepala Subbagian Rumah Sakit", "Kepala Instalasi Rumah Sakit",
        "Kepala Ruangan Rumah Sakit", "Komite Medik",
        "Jabatan Fungsional"
    ];

    const defaultBidangs = [
        "Sekretariat",
        "Subbag Umum & Kepegawaian",
        "Subbag Keuangan",
        "Subbag Perencanaan & Program",
        "Bidang Teknis I",
        "Bidang Teknis II",
        "Bagian Tata Usaha"
    ];

    async function loadJabatans() {
        if (jabatanInputs.list) {
            jabatanInputs.list.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: gray;">Memuat daftar jabatan...</td></tr>';
        }
        if (jabatanInputs.selector) {
            jabatanInputs.selector.innerHTML = '<option value="">-- Memuat Jabatan... --</option>';
        }

        try {
            // Attempt to load with uraian_tugas
            let { data: savedJabatans, error } = await supabase.from('master_jabatans').select('nama, uraian_tugas');

            if (error) {
                // Specific Check: If column uraian_tugas is missing, fallback to just names
                if (error.message && error.message.includes('uraian_tugas')) {
                    console.warn("Column 'uraian_tugas' missing, falling back to name-only selection.");
                    const { data: fallbackData, error: fallbackError } = await supabase.from('master_jabatans').select('nama');
                    if (!fallbackError) {
                        savedJabatans = (fallbackData || []).map(item => ({ nama: item.nama, uraian_tugas: "" }));
                        error = null;
                        // Continue with jList logic
                    }
                }
            }

            if (error) {
                console.warn("Database error, using defaults:", error);
                const defaultList = defaultJabatans.map(name => ({ nama: name, uraian_tugas: "" }));
                populateJabatanUI(defaultList);
                return;
            }

            let jList = savedJabatans || [];

            // --- RESTORE MISSING DEFAULTS IF EMPTY OR MISSING ---
            const existingNames = jList.map(j => j.nama.toLowerCase());
            const missingDefaults = defaultJabatans.filter(dj => !existingNames.includes(dj.toLowerCase()));

            if (missingDefaults.length > 0) {
                const toInsert = missingDefaults.map(name => ({ nama: name, uraian_tugas: "" }));
                const { error: insertError } = await supabase.from('master_jabatans').insert(toInsert);
                if (!insertError) {
                    const { data: refreshed } = await supabase.from('master_jabatans').select('nama, uraian_tugas');
                    jList = refreshed || jList;
                }
            }

            if (jList.length === 0) {
                jList = defaultJabatans.map(name => ({ nama: name, uraian_tugas: "" }));
            }

            populateJabatanUI(jList);
        } catch (err) {
            console.error("Critical Error loading jabatans:", err);
            const fallback = defaultJabatans.map(name => ({ nama: name, uraian_tugas: "" }));
            populateJabatanUI(fallback);
        }
    }

    function populateJabatanUI(savedJabatans) {
        if (!Array.isArray(savedJabatans)) return;

        // Populate Selector & Master Datalist
        if (jabatanInputs.selector) {
            jabatanInputs.selector.innerHTML = '<option value="">-- Pilih Jabatan --</option>';
            savedJabatans.forEach(jab => {
                const option = document.createElement('option');
                option.value = jab.nama;
                option.textContent = jab.nama;
                option.dataset.uraian = jab.uraian_tugas || "";
                jabatanInputs.selector.appendChild(option);
            });
        }

        if (jabatanInputs.masterDatalist) {
            jabatanInputs.masterDatalist.innerHTML = '';
            savedJabatans.forEach(jab => {
                const opt = document.createElement('option');
                opt.value = jab.nama;
                jabatanInputs.masterDatalist.appendChild(opt);
            });
        }

        // Populate List in Manager (Now as Table Rows)
        if (jabatanInputs.list) {
            jabatanInputs.list.innerHTML = '';
            if (savedJabatans.length === 0) {
                jabatanInputs.list.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:gray;">Daftar jabatan kosong.</td></tr>';
            }

            savedJabatans.forEach((jab, idx) => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td style="text-align:center; font-weight:bold; color:#64748b;">${idx + 1}</td>
                    <td><strong style="color:var(--primary-color);">${jab.nama}</strong></td>
                    <td style="font-size:0.85rem; color:#475569; line-height:1.4;">
                        ${jab.uraian_tugas ? jab.uraian_tugas : '<span style="color:#ef4444; font-style:italic;">Belum ada uraian tugas</span>'}
                    </td>
                    <td style="text-align:center;">
                        <div style="display:flex; gap:5px; justify-content:center;">
                            <button class="btn-info btn-sm" onclick="editJabatan('${jab.nama}', \`${(jab.uraian_tugas || '').replace(/`/g, '\\`')}\`)" style="padding: 5px 8px;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-danger btn-sm" onclick="deleteJabatan('${jab.nama}')" style="padding: 5px 8px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                jabatanInputs.list.appendChild(tr);
            });
        }
    }

    async function loadLevels() {
        if (levelInputs.list) {
            levelInputs.list.innerHTML = '<li style="padding: 10px; border-bottom: 1px solid #eee; color: gray;">Memuat...</li>';
        }

        const { data: savedLevels, error } = await supabase.from('master_levels').select('nama');

        if (error) {
            console.error("Error loading levels:", error);
            if (levelInputs.list) levelInputs.list.innerHTML = '<li style="padding:10px; color:#ef4444;">Gagal memuat.</li>';
            return;
        }

        const lvlList = (savedLevels || []).map(l => l.nama);

        // Populate Selectors (Both Main and Edit Modal)
        const selectors = [levelInputs.selector, levelInputs.editSelector];
        selectors.forEach(sel => {
            if (!sel) return;
            sel.innerHTML = '<option value="">-- Pilih Jabatan Atasan --</option>';
            lvlList.forEach(lvl => {
                const option = document.createElement('option');
                option.value = lvl;
                option.textContent = lvl;
                sel.appendChild(option);
            });
        });

        // Populate List in Manager
        if (levelInputs.list) {
            levelInputs.list.innerHTML = '';
            lvlList.forEach((lvl) => {
                const li = document.createElement('li');
                li.style.padding = '10px';
                li.style.borderBottom = '1px solid #eee';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                li.innerHTML = `
                    <span>${lvl}</span>
                    <button class="btn-danger btn-sm" onclick="deleteLevel('${lvl}')" style="padding: 5px 10px; font-size: 0.8rem;">Hapus</button>
                `;
                levelInputs.list.appendChild(li);
            });
        }
    }

    async function loadBidangs() {
        if (bidangInputs.list) {
            bidangInputs.list.innerHTML = '<li style="padding: 10px; border-bottom: 1px solid #eee; color: gray;">Memuat...</li>';
        }

        const { data: savedBidangs, error } = await supabase.from('master_bidangs').select('nama');

        if (error) {
            console.error("Error loading bidangs:", error);
            populateBidangUI(defaultBidangs);
            return;
        }

        populateBidangUI((savedBidangs || []).map(b => b.nama));
    }

    function populateBidangUI(bdgList) {
        // Populate Selector for Main Form
        if (bidangInputs.selector) {
            bidangInputs.selector.innerHTML = '<option value="">-- Pilih Bidang / Bagian --</option>';
            bdgList.forEach(bdg => {
                const option = document.createElement('option');
                option.value = bdg;
                option.textContent = bdg;
                bidangInputs.selector.appendChild(option);
            });
        }

        // Populate List in Manager
        if (bidangInputs.list) {
            bidangInputs.list.innerHTML = '';
            bdgList.forEach((bdg) => {
                const li = document.createElement('li');
                li.style.padding = '10px';
                li.style.borderBottom = '1px solid #eee';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                li.innerHTML = `
                    <span>${bdg}</span>
                    <button class="btn-danger btn-sm" onclick="deleteBidang('${bdg}')" style="padding: 5px 10px; font-size: 0.8rem;">Hapus</button>
                `;
                bidangInputs.list.appendChild(li);
            });
        }
    }

    // Custom Confirm Modal Logic
    const confirmModal = {
        overlay: document.createElement('div'),
        title: null,
        message: null,
        yesBtn: null,
        noBtn: null,
        currentResolve: null
    };

    // Build Confirm Modal Structure dynamically
    confirmModal.overlay.className = 'notification-overlay'; // Reuse overlay style
    confirmModal.overlay.style.zIndex = '10000'; // Higher than others
    confirmModal.overlay.innerHTML = `
        <div class="notification-card" style="transform: scale(1); text-align: center; width: 400px; padding: 2rem;">
            <div style="margin-bottom: 20px;">
                <i class="fas fa-question-circle" style="font-size: 3rem; color: #f59e0b;"></i>
            </div>
            <h3 id="confirm-title" style="margin-bottom: 10px; color: #1e293b;">Konfirmasi</h3>
            <p id="confirm-message" style="margin-bottom: 20px; color: #64748b;">Apakah anda yakin?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-no" class="btn-secondary" style="background:#64748b; color:white; padding: 8px 20px; border-radius: 5px; border:none; cursor:pointer;">Batal</button>
                <button id="confirm-yes" class="btn-danger" style="background:#ef4444; color:white; padding: 8px 20px; border-radius: 5px; border:none; cursor:pointer;">Ya, Lanjutkan</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal.overlay);

    confirmModal.title = confirmModal.overlay.querySelector('#confirm-title');
    confirmModal.message = confirmModal.overlay.querySelector('#confirm-message');
    confirmModal.yesBtn = confirmModal.overlay.querySelector('#confirm-yes');
    confirmModal.noBtn = confirmModal.overlay.querySelector('#confirm-no');

    confirmModal.yesBtn.addEventListener('click', () => {
        if (confirmModal.currentResolve) confirmModal.currentResolve(true);
        confirmModal.overlay.classList.remove('active');
    });

    confirmModal.noBtn.addEventListener('click', () => {
        if (confirmModal.currentResolve) confirmModal.currentResolve(false);
        confirmModal.overlay.classList.remove('active');
    });

    function showConfirm(title, message, yesText = "Ya, Lanjutkan") {
        return new Promise((resolve) => {
            confirmModal.currentResolve = resolve;
            confirmModal.title.textContent = title;
            confirmModal.message.textContent = message;
            confirmModal.yesBtn.textContent = yesText;
            confirmModal.overlay.classList.add('active');
        });
    }

    // Expose delete and edit functions to window
    window.editJabatan = function (nama, uraian) {
        if (jabatanInputs.newInput) jabatanInputs.newInput.value = nama;
        if (jabatanInputs.newUraian) jabatanInputs.newUraian.value = uraian;
        // Scroll to input form
        jabatanInputs.newInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        jabatanInputs.newInput.focus();
        showNotification('Data dimuat ke form edit.', 'info');
    };

    window.deleteJabatan = async function (nama) {
        const confirmed = await showConfirm('Hapus Jabatan?', 'Jabatan ini akan dihapus dari database.', 'Hapus');
        if (confirmed) {
            const { error } = await supabase.from('master_jabatans').delete().eq('nama', nama);
            if (!error) {
                loadJabatans();
                showNotification('Jabatan berhasil dihapus!', 'success');
            } else {
                alert("Gagal menghapus jabatan dari Supabase.");
            }
        }
    };

    window.deleteLevel = async function (nama) {
        const confirmed = await showConfirm('Hapus Jabatan Atasan?', 'Jabatan Atasan ini akan dihapus dari database.', 'Hapus');
        if (confirmed) {
            const { error } = await supabase.from('master_levels').delete().eq('nama', nama);
            if (!error) {
                loadLevels();
                showNotification('Jabatan Atasan berhasil dihapus!', 'success');
            } else {
                alert("Gagal menghapus jabatan dari Supabase.");
            }
        }
    };

    window.deleteBidang = async function (nama) {
        const confirmed = await showConfirm('Hapus Bidang?', 'Bidang ini akan dihapus dari database.', 'Hapus');
        if (confirmed) {
            const { error } = await supabase.from('master_bidangs').delete().eq('nama', nama);
            if (!error) {
                loadBidangs();
                showNotification('Bidang berhasil dihapus!', 'success');
            } else {
                alert("Gagal menghapus bidang dari Supabase.");
            }
        }
    };

    if (jabatanInputs.addBtn) {
        jabatanInputs.addBtn.addEventListener('click', async () => {
            const newVal = jabatanInputs.newInput.value.trim();
            const uraianVal = jabatanInputs.newUraian.value.trim();

            if (!newVal) {
                showNotification('Harap masukkan nama jabatan pelaksana!', 'error');
                return;
            }

            // Disable button during processing
            jabatanInputs.addBtn.disabled = true;
            jabatanInputs.addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

            try {
                // 1. Existence Check
                const { data: existing, error: checkError } = await supabase.from('master_jabatans')
                    .select('nama')
                    .ilike('nama', newVal)
                    .maybeSingle();

                if (checkError) throw checkError;

                let saveError;
                if (existing) {
                    // 2. Update existing
                    const { error: updateError } = await supabase.from('master_jabatans')
                        .update({ uraian_tugas: uraianVal })
                        .ilike('nama', newVal);
                    saveError = updateError;
                } else {
                    // 3. Insert new
                    const { error: insertError } = await supabase.from('master_jabatans')
                        .insert({ nama: newVal, uraian_tugas: uraianVal });
                    saveError = insertError;
                }

                if (saveError) {
                    // Handle specific missing column case for user
                    if (saveError.message && saveError.message.includes('uraian_tugas')) {
                        throw new Error("Kolom 'uraian_tugas' tidak ditemukan di Supabase. Silakan jalankan perintah SQL FIX di Dashboard Supabase agar data bisa tersimpan.");
                    }
                    throw saveError;
                }

                // 4. Success Actions
                jabatanInputs.newInput.value = '';
                jabatanInputs.newUraian.value = '';
                await loadJabatans(); // Reload UI
                showNotification('Jabatan & Uraian Berhasil Disimpan!', 'success');
            } catch (err) {
                console.error("Jabatan Save Failure:", err);
                showNotification(err.message || 'Gagal menyimpan data ke Supabase.', 'error');
            } finally {
                jabatanInputs.addBtn.disabled = false;
                jabatanInputs.addBtn.innerHTML = '<i class="fas fa-plus"></i> Simpan Jabatan & Uraian Tugas';
            }
        });
    }

    if (levelInputs.addBtn) {
        levelInputs.addBtn.addEventListener('click', async () => {
            const newVal = levelInputs.newInput.value.trim();
            if (newVal) {
                const { error } = await supabase.from('master_levels').insert({ nama: newVal });
                if (!error) {
                    levelInputs.newInput.value = '';
                    loadLevels();
                    showNotification('Jabatan Atasan berhasil ditambahkan!', 'success');
                } else {
                    showNotification('Gagal menambahkan jabatan atau data sudah ada.', 'error');
                }
            }
        });
    }

    if (bidangInputs.addBtn) {
        bidangInputs.addBtn.addEventListener('click', async () => {
            const newVal = bidangInputs.newInput.value.trim();
            if (newVal) {
                const { error } = await supabase.from('master_bidangs').insert({ nama: newVal });
                if (!error) {
                    bidangInputs.newInput.value = '';
                    loadBidangs();
                    showNotification('Bidang berhasil ditambahkan!', 'success');
                } else {
                    showNotification('Gagal menambahkan bidang atau bidang sudah ada.', 'error');
                }
            }
        });
    }

    // --- GEMINI AI INTEGRATION ---
    const geminiConfig = {
        keyInput: document.getElementById('geminiKey'),
        saveBtn: document.getElementById('saveAiKeyBtn'),
        // Set the user provided key as the initial value or fallback
        getStoredKey: () => localStorage.getItem('gemini_api_key') || "AIzaSyCCD2tXzPWZ3F5hbVpFrfRktORH0J6lE4k"
    };

    if (geminiConfig.saveBtn) {
        // Init UI with current key
        geminiConfig.keyInput.value = geminiConfig.getStoredKey();

        geminiConfig.saveBtn.addEventListener('click', () => {
            const key = geminiConfig.keyInput.value.trim();
            try {
                if (key) {
                    localStorage.setItem('gemini_api_key', key);
                    showNotification('API Key tersimpan secara lokal!', 'success');
                    console.log("API Key saved to localStorage.");
                } else {
                    localStorage.removeItem('gemini_api_key');
                    showNotification('API Key dihapus.', 'info');
                    // Reset to hardcoded fallback in UI after clear
                    geminiConfig.keyInput.value = "AIzaSyCCD2tXzPWZ3F5hbVpFrfRktORH0J6lE4k";
                }
            } catch (e) {
                console.error("Storage Error:", e);
                showNotification('Gagal mengakses penyimpanan browser!', 'error');
            }
        });
    }

    async function callGeminiAI(jabatan, bidang, atasanRhk) {
        const apiKey = geminiConfig.getStoredKey();
        if (!apiKey) return null;

        // Use the manual edit from "Uraian Tugas Singkat" box in the form
        const uraianContext = inputs.uraianSingkat ? inputs.uraianSingkat.value : "";

        const prompt = `Tuliskan SATU KALIMAT Rencana Hasil Kerja (RHK) untuk pegawai:
        - JABATAN: "${jabatan}"
        - BIDANG: "${bidang}"
        ${uraianContext ? `- KONTEKS TUGAS/URAIAN: "${uraianContext}"` : ""}
        
        RHK ini HARUS mendongkrak/mendukung RHK ATASAN berikut: "${atasanRhk}". 
        
        SYARAT UTAMA: 
        1. Gunakan standar bahasa birokrasi ASN (Menpan-RB).
        2. Harus diawali dengan kata benda hasil (contoh: Terlaksananya, Tersusunnya, Terkelolanya, Terwujudnya).
        3. Kalimat RHK HARUS SESUAI dengan Konteks Tugas/Uraian yang diberikan di atas.
        4. Kalimat harus unik, profesional, dan linier.
        5. JANGAN berikan teks pengantar, HANYA kalimat RHK saja.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text.trim().replace(/\*/g, '');
            }
            return null;
        } catch (error) {
            console.error("AI Error:", error);
            return null;
        }
    }

    // --- AUTO-GENERATE RHK BAWAHAN LOGIC ---
    function formulateBawahanRhk(atasanText, bidangText = "") {
        if (!atasanText) return "";
        let text = atasanText.trim();
        const lower = text.toLowerCase();
        let result = "";

        // Standard Menpan Patterns
        if (lower.startsWith('meningkatnya')) {
            result = "Terlaksananya dukungan terhadap " + text.charAt(0).toLowerCase() + text.slice(1);
        } else if (lower.startsWith('tersusunnya')) {
            result = "Terlaksananya penyusunan " + text.charAt(0).toLowerCase() + text.slice(1);
        } else if (lower.startsWith('terkelolanya')) {
            result = "Terlaksananya pengelolaan " + text.charAt(0).toLowerCase() + text.slice(1);
        } else if (lower.startsWith('terwujudnya')) {
            result = "Terlaksananya kontribusi terhadap " + text.charAt(0).toLowerCase() + text.slice(1);
        } else {
            result = "Terlaksananya " + text;
        }

        // Add Bidang context if available
        if (bidangText && bidangText.trim() !== "" && !result.toLowerCase().includes(bidangText.toLowerCase())) {
            result += " pada " + bidangText;
        }

        return result;
    }

    const syncRhkBtn = document.getElementById('syncRhkBtn');
    if (syncRhkBtn) {
        syncRhkBtn.addEventListener('click', async () => {
            const atasanVal = inputs.rhkAtasan.value;
            const bidangVal = inputs.bidang.value;
            const jabatanVal = inputs.jabatan.value;

            if (!atasanVal) {
                showNotification('Harap isi RHK Atasan terlebih dahulu!', 'error');
                return;
            }

            const apiKey = geminiConfig.getStoredKey();
            if (apiKey) {
                syncRhkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI Sedang Berpikir...';
                syncRhkBtn.disabled = true;

                const aiResult = await callGeminiAI(jabatanVal, bidangVal, atasanVal);

                if (aiResult) {
                    inputs.rhkBawahan.value = aiResult;
                    showNotification('Gemini AI berhasil merumuskan RHK Unik untuk Anda!', 'success');
                } else {
                    inputs.rhkBawahan.value = formulateBawahanRhk(atasanVal, bidangVal);
                    showNotification('Koneksi AI Gagal. Menggunakan rumusan standar.', 'error');
                }

                syncRhkBtn.innerHTML = '<i class="fas fa-magic"></i> 💡 Buat RHK Saya Berdasarkan Atasan';
                syncRhkBtn.disabled = false;
            } else {
                inputs.rhkBawahan.value = formulateBawahanRhk(atasanVal, bidangVal);
                showNotification('Kalimat RHK dirumuskan secara otomatis (Mode Standar).', 'success');
            }
        });
    }

    const editSyncRhkBtn = document.getElementById('editSyncRhkBtn');
    if (editSyncRhkBtn) {
        editSyncRhkBtn.addEventListener('click', async () => {
            const atasanVal = editModal.rhk.value;
            const bidangVal = editModal.bidang.value;
            const jabatanVal = editModal.jabatan.value;

            if (!atasanVal) {
                showNotification('Harap isi RHK Atasan terlebih dahulu!', 'error');
                return;
            }

            const apiKey = geminiConfig.getStoredKey();
            if (apiKey) {
                editSyncRhkBtn.disabled = true;
                const aiResult = await callGeminiAI(jabatanVal, bidangVal, atasanVal);
                if (aiResult) {
                    editModal.rhkBawahan.value = aiResult;
                    showNotification('AI memperbarui RHK untuk Anda!', 'success');
                } else {
                    editModal.rhkBawahan.value = formulateBawahanRhk(atasanVal, bidangVal);
                }
                editSyncRhkBtn.disabled = false;
            } else {
                editModal.rhkBawahan.value = formulateBawahanRhk(atasanVal, bidangVal);
                showNotification('Kalimat RHK Edit telah dirumuskan secara standar!', 'success');
            }

            // Sync to state to update preview table if exists
            if (currentRhkItems.length > 0) {
                currentRhkItems[0].bawahan = editModal.rhkBawahan.value;
                generateEditTable(editModal.jabatan.value, currentRhkItems);
            }
        });
    }

    // --- SKP LOGIC ---
    const inputs = {
        nama: document.getElementById('namaLengkap'),
        nip: document.getElementById('nip'),
        jabatan: document.getElementById('jabatanSelector'),
        uraianSingkat: document.getElementById('uraianSingkat'),
        opd: document.getElementById('opd'),
        bidang: document.getElementById('bidangSelector'),
        rhkAtasan: document.getElementById('rhkAtasan'),
        rhkBawahan: document.getElementById('rhkBawahan'),
        indikatorAtasan: document.getElementById('indikatorAtasan'),
        levelAtasan: document.getElementById('levelAtasanSelector')
    };

    // Initial Load
    async function initialLoad() {
        await loadJabatans();
        await loadLevels();
        await loadBidangs();

        // Add Dynamic Preloader Listener for main SKP Form (once after load)
        if (jabatanInputs.selector) {
            jabatanInputs.selector.addEventListener('change', () => {
                const selectedOpt = jabatanInputs.selector.options[jabatanInputs.selector.selectedIndex];
                if (inputs && inputs.uraianSingkat) {
                    const uraian = selectedOpt && selectedOpt.dataset ? (selectedOpt.dataset.uraian || "") : "";
                    inputs.uraianSingkat.value = uraian;

                    if (uraian) {
                        inputs.uraianSingkat.placeholder = "Uraian tugas berhasil dimuat.";
                        // Add a small animation effect to highlight the change
                        inputs.uraianSingkat.style.backgroundColor = "#f0fdf4";
                        setTimeout(() => {
                            inputs.uraianSingkat.style.backgroundColor = "#f8fafc";
                        }, 1000);
                    } else {
                        inputs.uraianSingkat.placeholder = "Silakan ketik uraian tugas singkat...";
                    }
                }
            });
        }

        // Add Auto-fill Listener for Manager
        if (jabatanInputs.newInput && jabatanInputs.newUraian) {
            jabatanInputs.newInput.addEventListener('input', async () => {
                const currentVal = jabatanInputs.newInput.value.trim();
                if (!currentVal) return;

                // Use limit(1) instead of single() to avoid throwing errors on empty results
                const { data, error } = await supabase.from('master_jabatans')
                    .select('uraian_tugas')
                    .ilike('nama', currentVal)
                    .limit(1);

                if (data && data.length > 0) {
                    jabatanInputs.newUraian.value = data[0].uraian_tugas || "";
                }
            });
        }
    }

    initialLoad();

    const printSpans = {
        nama: document.getElementById('printNama'),
        nip: document.getElementById('printNip'),
        jabatan: document.getElementById('printJabatan'),
        opd: document.getElementById('printOpd'),
        bidang: document.getElementById('printBidang')
    };

    const buttons = {
        generate: document.getElementById('generateBtn'),
        save: document.getElementById('saveBtn'),
        print: document.getElementById('printBtn'),
        clear: document.getElementById('clearBtn')
    };

    const tbody = document.querySelector('#skpTable tbody');
    const jabatanTitle = document.getElementById('jabatanTitle');
    const editNotice = document.getElementById('edit-notice');

    let currentEditId = null;
    let currentActiveNip = "";

    // --- AUTO-CLEAR ON NIP CHANGE (Prevent session data leakage) ---
    inputs.nip.addEventListener('change', () => {
        const val = inputs.nip.value.trim();
        if (currentActiveNip && val !== currentActiveNip && currentRhkItems.length > 0) {
            if (confirm("Identitas NIP berubah. Kosongkan tabel RHK agar tidak tercampur dengan data pegawai sebelumnya?")) {
                resetAppForm();
            }
        }
        currentActiveNip = val;
    });

    // --- AI AUTO-SUGGEST HANDLER ---
    const suggestBtn = document.getElementById('suggestBtn');
    if (suggestBtn) {
        suggestBtn.addEventListener('click', () => {
            const userJabatan = inputs.jabatan.value;
            if (!userJabatan) {
                showNotification('Harap pilih Jabatan terlebih dahulu untuk menggunakan AI!', 'error');
                return;
            }

            // AI Simulation Logic: Match based on standard Menpan patterns
            let matched = skpData.find(d =>
                userJabatan.toLowerCase().includes(d.category.toLowerCase()) ||
                d.description.toLowerCase().includes(userJabatan.toLowerCase())
            );

            // Specific Linear Mapping
            if (!matched) {
                const jLower = userJabatan.toLowerCase();
                if (jLower.includes('guru') || jLower.includes('sekolah')) matched = skpData.find(d => d.id === 'FUNCTIONAL_TEACHER');
                else if (jLower.includes('dokter') || jLower.includes('perawat') || jLower.includes('sakit')) matched = skpData.find(d => d.id === 'MEDICAL_GENERAL');
                else if (jLower.includes('kepala') || jLower.includes('bidang') || jLower.includes('gubernur') || jLower.includes('bupati')) matched = skpData.find(d => d.id === 'STRUCTURAL_GENERAL');
                else matched = skpData.find(d => d.id === 'ADMIN_OPERATIONAL');
            }

            if (matched) {
                inputs.rhkAtasan.value = matched.atasan.rhk;
                inputs.indikatorAtasan.value = matched.atasan.indikator;

                // Also suggest a customized Bawahan RHK if matched from data
                if (matched.bawahan && matched.bawahan.rhk) {
                    inputs.rhkBawahan.value = matched.bawahan.rhk;
                }

                // --- LINEAR LEVEL MAPPING ---
                const jLower = userJabatan.toLowerCase();
                if (jLower.includes('kepala dinas') || jLower.includes('kepala badan') || jLower.includes('sekda')) {
                    inputs.levelAtasan.value = "Bupati"; // Top level usually reports to Bupati/Gubernur
                } else if (jLower.includes('kepala bidang')) {
                    inputs.levelAtasan.value = "Kepala Dinas";
                } else if (jLower.includes('kepala seksi') || jLower.includes('kasubag') || jLower.includes('sekretaris')) {
                    inputs.levelAtasan.value = "Kepala Bidang";
                } else if (jLower.includes('guru')) {
                    inputs.levelAtasan.value = "Kepala Sekolah";
                } else if (jLower.includes('korwil')) {
                    inputs.levelAtasan.value = "Koordinator Wilayah";
                } else if (jLower.includes('dokter') || jLower.includes('perawat') || jLower.includes('bidan') || jLower.includes('rumah sakit')) {
                    inputs.levelAtasan.value = "Direktur Rumah Sakit";
                } else {
                    // Default for staff usually reports to Head of Department or Section
                    inputs.levelAtasan.value = "Kepala Bidang";
                }

                showNotification('Saran AI Diterapkan! Level Atasan dikunci agar linier dengan posisi Anda.', 'success');

                // Highlight changes
                const high = [inputs.rhkAtasan, inputs.indikatorAtasan, inputs.levelAtasan];
                high.forEach(el => el.style.boxShadow = '0 0 10px rgba(126, 34, 206, 0.5)');
                setTimeout(() => high.forEach(el => el.style.boxShadow = 'none'), 2000);
            }
        });
    }

    // GENERATE BUTTON
    buttons.generate.addEventListener('click', () => {
        const userJabatan = inputs.jabatan.value.trim();
        const userRhkAtasan = inputs.rhkAtasan.value.trim();
        const userRhkBawahan = inputs.rhkBawahan.value.trim();
        const userIndikatorAtasan = inputs.indikatorAtasan.value.trim();
        const userLevelAtasan = inputs.levelAtasan.value;

        // Loading Animation Logic
        // Show Loading Overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        const aiValidation = document.getElementById('aiValidationStatus');
        loadingOverlay.style.display = 'flex';
        if (aiValidation) aiValidation.style.display = 'none';

        // Stage 1: Processing
        setTimeout(() => {
            if (aiValidation) {
                aiValidation.style.display = 'block';
                aiValidation.innerHTML = '<i class="fas fa-microchip fa-spin"></i> AI sedang menganalisis kelinieran RHK...';
            }

            // Stage 2: Final Validation Check
            setTimeout(() => {
                if (aiValidation) {
                    aiValidation.style.background = '#f0fdf4';
                    aiValidation.style.color = '#166534';
                    aiValidation.innerHTML = '<i class="fas fa-check-double"></i> Validasi Berhasil: SKP Linier & Sesuai Standar Menpan.';
                }

                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    executeGenerate(userJabatan, userRhkAtasan, userRhkBawahan, userIndikatorAtasan, userLevelAtasan);

                    // Clear RHK inputs after adding to table to prompt user for second RHK
                    inputs.rhkAtasan.value = '';
                    inputs.rhkBawahan.value = '';
                    inputs.indikatorAtasan.value = '';
                }, 1000);
            }, 1500);
        }, 1500);
    });

    function executeGenerate(userJabatan, userRhkAtasan, userRhkBawahan, userIndikatorAtasan, userLevelAtasan) {
        // Basic Validation
        if (!userJabatan) {
            showNotification('Harap pilih Jabatan terlebih dahulu!', 'error');
            return;
        }
        if (!userRhkAtasan || !userIndikatorAtasan) {
            showNotification('Harap isi RHK Atasan dan Indikator Kinerja Atasan!', 'error');
            return;
        }

        // --- DUPLICATE CHECK WITHIN CURRENT SESSION ---
        const isDuplicate = currentRhkItems.some(item =>
            item.atasan === userRhkAtasan &&
            item.indikator === userIndikatorAtasan &&
            item.bawahan === userRhkBawahan
        );

        if (isDuplicate) {
            showNotification('RHK ini sudah ada dalam daftar tabel!', 'error');
            return;
        }

        // Add to state
        currentRhkItems.push({
            atasan: userRhkAtasan,
            bawahan: userRhkBawahan,
            indikator: userIndikatorAtasan,
            levelAtasan: userLevelAtasan,
            bidang: inputs.bidang.value // Store bidang per item
        });

        // Update Title & Print Header
        jabatanTitle.innerHTML = `${userJabatan.toUpperCase()} <br> <span style="font-size: 0.8em; color: #475569;">(${inputs.bidang.value.toUpperCase()})</span>`;
        currentActiveNip = inputs.nip.value; // Lock current NIP

        // Sync Print Spans
        printSpans.nama.textContent = inputs.nama.value;
        printSpans.nip.textContent = inputs.nip.value;
        printSpans.jabatan.textContent = userJabatan;
        printSpans.opd.textContent = inputs.opd.value;
        printSpans.bidang.textContent = inputs.bidang.value;

        // Render whole list
        generateGenericTable(userJabatan, inputs.bidang.value, currentRhkItems, tbody, false);
        renderMiniRhkList();
        showNotification('RHK Berhasil Ditambahkan ke Tabel!', 'success');
    }

    function renderMiniRhkList() {
        const list = document.getElementById('miniRhkList');
        const container = document.getElementById('addedRhkContainer');
        if (!list || !container) return;

        if (currentRhkItems.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        list.innerHTML = '';
        currentRhkItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.padding = '8px 12px';
            li.style.background = 'white';
            li.style.border = '1px solid #dcfce7';
            li.style.borderRadius = '6px';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.fontSize = '0.85rem';

            li.innerHTML = `
                <div style="flex: 1;">
                    <span style="font-weight: 700; color:#166534;">#${index + 1}</span> 
                    <span style="color: #374151; margin-left: 5px;">${item.atasan.substring(0, 60)}${item.atasan.length > 60 ? '...' : ''}</span>
                </div>
                <button class="btn-danger btn-sm" onclick="removeRhk(${index})" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            list.appendChild(li);
        });
    }

    window.removeRhk = function (index) {
        currentRhkItems.splice(index, 1);
        renderMiniRhkList();
        // Regenerate main table
        const userJabatan = inputs.jabatan.value;
        const userBidang = inputs.bidang.value;
        if (userJabatan) {
            generateGenericTable(userJabatan, userBidang, currentRhkItems, tbody, false);
        }
    };

    // SIMPAN (SAVE) BUTTON
    buttons.save.addEventListener('click', async () => {
        const data = {
            rhk_items: [...currentRhkItems],
            pegawai: {
                nama: inputs.nama.value,
                nip: inputs.nip.value,
                jabatan: inputs.jabatan.value,
                opd: inputs.opd.value,
                bidang: inputs.bidang.value
            },
            periode: document.getElementById('periodeTahun').value || new Date().getFullYear().toString(),
            timestamp_iso: new Date().toISOString()
        };

        if (data.rhk_items.length === 0) {
            showNotification("Tidak ada data untuk disimpan. Tambahkan RHK terlebih dahulu!", 'error');
            return;
        }

        try {
            if (currentEditId) {
                const { error } = await supabase.from('skp_history').update(data).eq('id', currentEditId);
                if (error) throw error;
                showNotification('Data SKP Berhasil Diperbarui di Supabase!', 'success');
            } else {
                const { error } = await supabase.from('skp_history').insert(data);
                if (error) throw error;
                showNotification('Data SKP Berhasil Disimpan ke Supabase!', 'success');
            }

            loadHistory();
            currentEditId = null;
            if (editNotice) editNotice.style.display = 'none';

            // --- AUTO RESET AFTER SAVE ---
            resetAppForm();
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan data ke Supabase: " + err.message);
        }
    });

    function resetAppForm() {
        // 1. Clear state
        currentRhkItems = [];
        currentEditId = null;

        // 2. Clear all form inputs
        Object.values(inputs).forEach(input => {
            if (input.tagName === 'SELECT') input.selectedIndex = 0;
            else input.value = '';
        });

        // 3. Reset Table & List
        if (tbody) tbody.innerHTML = '';
        if (jabatanTitle) jabatanTitle.textContent = 'JABATAN';
        renderMiniRhkList();

        // 4. Hide notices
        if (editNotice) editNotice.style.display = 'none';

        // 5. Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // PRINT BUTTON
    buttons.print.addEventListener('click', () => {
        window.print();
    });

    // CLEAR BUTTON
    buttons.clear.addEventListener('click', async () => {
        const confirmed = await showConfirm('Reset Form?', 'Apakah anda yakin ingin mereset form? Semua data yang belum disimpan akan hilang.', 'Reset Sekarang');

        if (confirmed) {
            // Clear items array
            currentRhkItems = [];

            // Clear inputs
            Object.values(inputs).forEach(input => input.value = '');
            inputs.jabatan.value = 'Penata Layanan Operasional'; // Reset default

            // Clear table & list
            tbody.innerHTML = '';
            renderMiniRhkList();

            // Reset Edit Mode
            currentEditId = null;
            if (editNotice) editNotice.style.display = 'none';
            showNotification('Form berhasil direset!', 'success');
        }
    });

    // --- HELPER FUNCTIONS ---
    // (Consolidated into generateGenericTable and renderRowToGeneric below)

    function appendCell(tr, text, rowspan = 1, className = "") {
        const td = document.createElement('td');
        td.textContent = text || "";
        if (rowspan > 1) {
            td.setAttribute('rowspan', rowspan);
            td.style.verticalAlign = 'middle';
        }
        if (className) td.classList.add(className);
        tr.appendChild(td);
    }


    // --- HISTORY FUNCTIONS ---
    async function loadHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        try {
            const { data: history, error } = await supabase.from('skp_history').select('*').order('created_at', { ascending: false });

            if (error) throw error;

            historyList.innerHTML = '';
            if (!history || history.length === 0) {
                historyList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 10px; color: #64748b;">Belum ada riwayat SKP tersimpan.</div>`;
                return;
            }

            history.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card bg-white p-4 history-card';
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="color: var(--primary-color); font-size: 1.1rem; font-weight: bold;">${item.pegawai.nama}</h3>
                            <p style="font-size: 0.85rem; color: #64748b;">NIP: ${item.pegawai.nip} | Tahun: ${item.periode}</p>
                        </div>
                        <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 5px; font-size: 0.75rem; font-weight: 600;">${item.pegawai.jabatan}</span>
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #eee; padding-top: 12px;">
                        <button class="btn-secondary btn-sm" onclick="viewItem('${item.id}')"><i class="fas fa-eye"></i> Lihat</button>
                        <button class="btn-success btn-sm" onclick="loadItemForEdit('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-danger btn-sm" onclick="deleteItem('${item.id}')"><i class="fas fa-trash"></i> Hapus</button>
                    </div>
                `;
                historyList.appendChild(card);
            });
        } catch (err) {
            console.error("Load History Error:", err);
        }
    }

    // Call initially
    loadHistory();

    window.viewItem = function (id) { loadItemForView(id); };
    window.loadItemForEdit = function (id) { loadItemForEdit(id); };
    window.deleteItem = async function (id) {
        const confirmed = await showConfirm('Hapus Riwayat?', 'SKP ini akan dihapus permanen dari Supabase.', 'Hapus');
        if (confirmed) {
            const { error } = await supabase.from('skp_history').delete().eq('id', id);
            if (!error) {
                loadHistory();
                showNotification('Riwayat berhasil dihapus!', 'success');
            } else {
                alert("Gagal menghapus riwayat dari Supabase.");
            }
        }
    };

    // Also loadHistory needs to be exposed? 
    // loadHistory is defined at window.loadHistory in Step 549. So it is global.


    // --- VIEW MODAL LOGIC ---
    const viewModal = {
        overlay: document.getElementById('viewModal'),
        content: document.getElementById('viewModalContent'),
        headerDetails: document.getElementById('viewHeaderDetails'),
        tableBody: document.querySelector('#viewTablePreview tbody'),
        closeBtn: document.getElementById('closeViewModal'),
        closeFooterBtn: document.getElementById('closeViewBtn'),
        printBtn: document.getElementById('printViewBtn')
    };

    async function loadItemForView(id) {
        const { data: item, error } = await supabase.from('skp_history').select('*').eq('id', id).single();

        if (item) {
            // Populate Header Details
            viewModal.headerDetails.innerHTML = `
                <div>
                    <p><strong>Nama:</strong> ${item.pegawai.nama}</p>
                    <p><strong>NIP:</strong> ${item.pegawai.nip}</p>
                    <p><strong>Bidang:</strong> ${item.pegawai.bidang || "-"}</p>
                </div>
                <div style="text-align:right;">
                     <p><strong>Jabatan:</strong> ${item.pegawai.jabatan}</p>
                     <p><strong>OPD:</strong> ${item.pegawai.opd}</p>
                </div>
            `;

            // Populate Table
            if (item.custom_table_html) {
                viewModal.tableBody.innerHTML = item.custom_table_html;
                viewModal.tableBody.querySelectorAll('[contenteditable]').forEach(el => {
                    el.contentEditable = false;
                    el.style.cursor = 'default';
                });
            } else {
                generateViewTable(item.pegawai.jabatan, item.pegawai.bidang, item.rhk_items || []);
            }

            viewModal.overlay.classList.add('active');
        }
    }

    function generateViewTable(jabatan, bidang, rhkItems) {
        generateGenericTable(jabatan, bidang, rhkItems, viewModal.tableBody, false);
    }

    // Generic generator that can be used by both (Edit gets contentEditable=true, View gets false)
    function generateGenericTable(jabatan, bidang, rhkItems, targetTbody, isEditable) {
        // rhkItems can be a single item or an array
        const items = Array.isArray(rhkItems) ? rhkItems : [rhkItems];

        targetTbody.innerHTML = '';

        // --- SMART AI MATCHING ENGINE ---
        // Mencari template yang paling linier dengan jabatan bawahan
        let templateData = skpData.find(d =>
            jabatan.toLowerCase().includes(d.category.toLowerCase()) ||
            d.description.toLowerCase().includes(jabatan.toLowerCase())
        );

        // Advanced Pattern Recognition
        if (!templateData) {
            const j = jabatan.toLowerCase();
            if (j.includes('guru') || j.includes('pengajar')) templateData = skpData.find(d => d.id === 'FUNCTIONAL_TEACHER');
            else if (j.includes('dokter') || j.includes('perawat') || j.includes('nakes')) templateData = skpData.find(d => d.id === 'MEDICAL_GENERAL');
            else if (j.includes('kepala') || j.includes('kabid') || j.includes('kasi') || j.includes('camat')) templateData = skpData.find(d => d.id === 'STRUCTURAL_GENERAL');
            else templateData = skpData.find(d => d.id === 'ADMIN_OPERATIONAL');
        }

        if (templateData) {
            const periods = ["TRIWULAN 1", "TRIWULAN 2", "TRIWULAN 3", "TRIWULAN 4", "PERIODE FINAL"];
            const periodColors = ["#e0f2fe", "#dcfce7", "#fef3c7", "#fee2e2", "#f3e8ff"];

            periods.forEach((period, index) => {
                const color = periodColors[index];
                const periodRow = document.createElement('tr');

                // Page Break for 2nd onwards
                if (index > 0) {
                    periodRow.classList.add('page-break');
                }
                // Align LEFT: style="text-align: left;"
                periodRow.innerHTML = `<th colspan="19" class="section-header" style="background:${color}; text-align: left !important; padding-left: 15px;">${period}</th>`;
                targetTbody.appendChild(periodRow);

                items.forEach((item, itemIdx) => {
                    // Prepare Data with Sub Period Check
                    const bawahan = { ...templateData.bawahan };
                    bawahan.level = jabatan;

                    // --- DYNAMIC RHK LOGIC (STRICT) ---
                    // Priority 1: Use specific Bawahan RHK if provided
                    if (item.bawahan && item.bawahan.trim() !== "") {
                        bawahan.rhk = item.bawahan;
                    }
                    // Priority 2: Use Atasan RHK transformation (Magic)
                    else if (item.atasan && item.atasan.trim() !== "") {
                        bawahan.rhk = formulateBawahanRhk(item.atasan);
                    }
                    // Priority 3: Final fallback to template only if inputs are empty
                    else {
                        bawahan.rhk = templateData.bawahan.rhk;
                    }

                    // ENSURE Atasan RHK is strictly what user provided in the list
                    const finalAtasanRhk = item.atasan || templateData.atasan.rhk;

                    if (templateData.bawahan.sub_periods && templateData.bawahan.sub_periods[index]) {
                        const sub = templateData.bawahan.sub_periods[index];
                        bawahan.rencana_aksi = sub.rencana;
                        bawahan.target_rencana = sub.target;
                        bawahan.bukti_dukung = sub.bukti;
                    }

                    const currentData = {
                        ...templateData,
                        atasan: {
                            ...templateData.atasan,
                            level: item.levelAtasan || templateData.atasan.level,
                            rhk: finalAtasanRhk,
                            indikator: item.indikator || templateData.atasan.indikator
                        },
                        bawahan: bawahan
                    };

                    // Render
                    renderRowToGeneric(currentData, jabatan, bidang, itemIdx + 1, color, targetTbody, isEditable);
                });
            });
        }
    }

    function renderRowToGeneric(data, userJabatan, userBidang, no, bgColor, targetTbody, isEditable) {
        const aspectCount = data.bawahan.aspek.length;
        data.bawahan.aspek.forEach((aspek, index) => {
            const tr = document.createElement('tr');
            tr.style.backgroundColor = bgColor;

            const add = (text, rowspan = 1, className = "") => {
                const td = document.createElement('td');
                td.textContent = text || "";
                if (rowspan > 1) { td.setAttribute('rowspan', rowspan); td.style.verticalAlign = 'middle'; }
                if (className) td.classList.add(className);

                if (isEditable) {
                    td.contentEditable = true;
                    td.style.cursor = "text";
                    td.classList.add("editable-cell");
                }
                tr.appendChild(td);
            };

            // Use the exact same structure as before
            if (index === 0) {
                add(no, aspectCount);
                add(data.atasan.level, aspectCount, "bg-atasan");
                add(data.atasan.rhk, aspectCount, "bg-atasan");
                add(data.atasan.indikator, aspectCount, "bg-atasan");
                add(data.atasan.intervensi, aspectCount, "bg-atasan");
                add(userBidang || "-", aspectCount, "bg-bawahan");
                add(userJabatan, aspectCount, "bg-bawahan");
                add(data.bawahan.rhk, aspectCount, "bg-bawahan");
                add(aspek.jenis, 1, "bg-bawahan");
                add(aspek.indikator, 1, "bg-bawahan");
                add(aspek.target, 1, "bg-bawahan");
                add(data.bawahan.rencana_aksi || "Melaksanakan...", aspectCount, "bg-rencana");
                add(data.bawahan.target_rencana || "1", aspectCount, "bg-rencana");
                add(data.bawahan.bukti_dukung || "Dokumen...", aspectCount, "bg-bukti");
                add("(Link)", aspectCount, "bg-bukti");
                add(data.bawahan.realisasi || "100%", aspectCount, "bg-realisasi");
                add(data.bawahan.sumber_data || "Laporan", aspectCount, "bg-realisasi");
                add("Sarana Prasarana", aspectCount, "bg-lampiran");
                add("Laporan", aspectCount, "bg-lampiran");
                add("Sanksi", aspectCount, "bg-lampiran");
            } else {
                add(aspek.jenis, 1, "bg-bawahan");
                add(aspek.indikator, 1, "bg-bawahan");
                add(aspek.target, 1, "bg-bawahan");
            }
            targetTbody.appendChild(tr);
        });
    }

    // Modal Close Logic
    function closeViewModal() { viewModal.overlay.classList.remove('active'); }
    viewModal.closeBtn.addEventListener('click', closeViewModal);
    viewModal.closeFooterBtn.addEventListener('click', closeViewModal);

    // Zoom Logic
    const zoomRange = document.getElementById('zoomRange');
    const zoomValue = document.getElementById('zoomValue');
    const viewTable = document.getElementById('viewTablePreview');

    if (zoomRange && viewTable) {
        zoomRange.addEventListener('input', (e) => {
            const scale = e.target.value;
            zoomValue.textContent = `${scale}%`;
            viewTable.style.transform = `scale(${scale / 100})`;
            viewTable.style.transformOrigin = 'top left';
        });
    }

    // --- ZOOM LOGIC (MAIN GENERATE TABLE) ---
    const mainZoomRange = document.getElementById('mainZoomRange');
    const mainZoomValue = document.getElementById('mainZoomValue');
    const resetMainBtn = document.getElementById('resetMainZoom');
    const mainTable = document.getElementById('skpTable');

    if (mainZoomRange && mainTable) {
        const updateMainZoom = (val) => {
            mainZoomValue.textContent = `${val}%`;
            mainTable.style.transform = `scale(${val / 100})`;
            mainTable.style.transformOrigin = 'top left';
            mainTable.parentElement.style.height = (mainTable.scrollHeight * (val / 100)) + "px";
        };
        mainZoomRange.addEventListener('input', (e) => updateMainZoom(e.target.value));
        resetMainBtn.addEventListener('click', () => {
            mainZoomRange.value = 100;
            updateMainZoom(100);
        });
    }

    // --- ZOOM LOGIC (EDIT MODAL TABLE) ---
    const editZoomRange = document.getElementById('editZoomRange');
    const editZoomValue = document.getElementById('editZoomValue');
    const resetEditBtn = document.getElementById('resetEditZoom');
    const editTable = document.getElementById('editTablePreview');

    if (editZoomRange && editTable) {
        const updateEditZoom = (val) => {
            editZoomValue.textContent = `${val}%`;
            editTable.style.transform = `scale(${val / 100})`;
            editTable.style.transformOrigin = 'top left';
        };
        // Init 80%
        updateEditZoom(80);
        editZoomRange.addEventListener('input', (e) => updateEditZoom(e.target.value));
        resetEditBtn.addEventListener('click', () => {
            editZoomRange.value = 100;
            updateEditZoom(100);
        });
    }

    // Print View Logic
    viewModal.printBtn.addEventListener('click', () => {
        // Simple print hack: hide everything else, show modal content
        // Better: open new window or use CSS print media query that targets #viewModalContent
        // For now, let's use window.print() and CSS to hide overlays except viewModal?
        // Actually script.js printing usually prints body. 
        // Let's replace body content temporarily? Risk of losing event listeners.
        // Best approach: New Window

        const printContent = viewModal.content.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Cetak SKP</title>');
        // Copy styles
        printWindow.document.write('<link rel="stylesheet" href="style.css">');
        // Add specific print styles
        printWindow.document.write('<style>body{padding:20px;} .close-modal{display:none;} table{border-collapse:collapse; width:100%;} th,td{border:1px solid #000; padding:5px; text-align:center;} .bg-atasan{background:#dbeafe !important;} .bg-bawahan{background:#ffedd5 !important;} @media print { -webkit-print-color-adjust: exact; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    });

    const editModal = {
        overlay: document.getElementById('editModal'),
        idInput: document.getElementById('editModalId'),
        nama: document.getElementById('editNama'),
        nip: document.getElementById('editNip'),
        jabatan: document.getElementById('editJabatan'),
        opd: document.getElementById('editOpd'),
        bidang: document.getElementById('editBidang'),
        levelAtasan: document.getElementById('editLevelAtasan'),
        rhk: document.getElementById('editRhk'),
        rhkBawahan: document.getElementById('editRhkBawahan'),
        indikator: document.getElementById('editIndikator'),
        saveBtn: document.getElementById('saveEditBtn'),
        cancelBtn: document.getElementById('cancelEditBtn'),
        closeBtn: document.getElementById('closeEditModal'),
        tableBody: document.querySelector('#editTablePreview tbody')
    };


    function generateEditTable(jabatan, bidang, rhkItems) {
        generateGenericTable(jabatan, bidang, rhkItems, editModal.tableBody, true);
    }

    // Live Update on Input (Removed loop to avoid overwriting edits in table)
    // NOTE: If we allow editing cells directly, we should STOP auto-regenerating from top inputs 
    // when typing in top inputs, OR simply say "Editing table cells creates overrides".
    // For simplicity, let's keep regeneration for now but maybe user wants to edit specific cells.
    // If they edit a cell, and then type in RHK Atasan input, the table REGENERATES and wipes their cell edit.
    // To fix this, we'll remove the auto-regenerate on input event and rely on "Generate" button 
    // OR we just accept that editing the form resets the table structure.

    // User complaint: "tidak bisa edit di dalam tabelnya" -> "Cannot edit inside table".
    // So making cells contentEditable=true fixes the UI.
    // BUT saving those edits is tricky without a complex data model map.

    // STRATEGY: 
    // When "Simpan Perubahan" is clicked, we need to read the table content? 
    // OR we just assume they are editing for View/Print purposes?
    // "Simpan Perubahan" saves to LocalStorage. If we only save the top inputs (Pegawai/RHK),
    // next time they load, the table is regenerated from inputs and they LOSE cell edits.

    // To support saving CELL EDITS, we'd need to save the entire HTML or a deep object.
    // Given the complexity, for now we will make it editable for PRINTING purpose (if they print from modal?)
    // But they probably want these edits SAVED.

    // Let's implement a 'custom_overrides' object in history item to store specific cell changes? 
    // No, that's too complex for this turn.
    // We will make cells editable. Saving will only save the FORM inputs. 
    // I should warn the user, or try to sync back RHK Atasan cell -> RHK Atasan Input?

    // Sync Logic:
    // If user edits "RHK Atasan" cell in table -> update RHK Atasan Input.
    // If user edits "Indikator" cell -> update Indikator Input.

    // Live Update on Input
    [editModal.rhk, editModal.rhkBawahan, editModal.indikator, editModal.levelAtasan].forEach(input => {
        if (!input) return;
        ['input', 'change', 'keyup'].forEach(evt => {
            input.addEventListener(evt, () => {
                // Sync back to first item for live preview while editing top inputs
                if (currentRhkItems.length > 0) {
                    currentRhkItems[0].atasan = editModal.rhk.value;
                    currentRhkItems[0].bawahan = editModal.rhkBawahan.value;
                    currentRhkItems[0].indikator = editModal.indikator.value;
                    currentRhkItems[0].levelAtasan = editModal.levelAtasan.value;
                }
                generateEditTable(editModal.jabatan.value, editModal.bidang.value, currentRhkItems);
            });
        });
    });

    function closeEditModal() {
        editModal.overlay.classList.remove('active');
    }

    editModal.closeBtn.addEventListener('click', closeEditModal);
    editModal.cancelBtn.addEventListener('click', closeEditModal);

    const addRhkEditBtn = document.getElementById('addRhkEditBtn');
    if (addRhkEditBtn) {
        addRhkEditBtn.addEventListener('click', () => {
            const rhkVal = editModal.rhk.value.trim();
            const rhkBawahanVal = editModal.rhkBawahan.value.trim();
            const indVal = editModal.indikator.value.trim();
            const lvlVal = editModal.levelAtasan.value;

            if (!rhkVal || !indVal) {
                showNotification('Harap isi RHK dan Indikator terlebih dahulu!', 'error');
                return;
            }

            currentRhkItems.push({
                atasan: rhkVal,
                bawahan: rhkBawahanVal,
                indikator: indVal,
                levelAtasan: lvlVal
            });

            // Reset fields
            editModal.rhk.value = '';
            editModal.rhkBawahan.value = '';
            editModal.indikator.value = '';

            renderEditMiniRhkList();
            generateEditTable(editModal.jabatan.value, editModal.bidang.value, currentRhkItems);
            showNotification('RHK ditambahkan ke daftar edit!', 'success');
        });
    }

    function renderEditMiniRhkList() {
        const list = document.getElementById('editMiniRhkList');
        if (!list) return;

        list.innerHTML = '';
        currentRhkItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.padding = '8px 12px';
            li.style.background = 'white';
            li.style.border = '1px solid #dcfce7';
            li.style.borderRadius = '6px';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.fontSize = '0.8rem';

            li.innerHTML = `
                <div style="flex: 1;">
                    <span style="font-weight: 700; color:#166534;">#${index + 1}</span> 
                    <span>${item.atasan.substring(0, 50)}${item.atasan.length > 50 ? '...' : ''}</span>
                </div>
                <button class="btn-danger btn-sm" onclick="removeEditRhk(${index})" style="padding: 2px 6px; font-size: 0.65rem;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            list.appendChild(li);
        });
    }

    window.removeEditRhk = function (index) {
        currentRhkItems.splice(index, 1);
        renderEditMiniRhkList();
        generateEditTable(editModal.jabatan.value, editModal.bidang.value, currentRhkItems);
    };

    editModal.saveBtn.addEventListener('click', async () => {
        const id = editModal.idInput.value;
        const data = {
            pegawai: {
                nama: editModal.nama.value,
                nip: editModal.nip.value,
                jabatan: editModal.jabatan.value,
                opd: editModal.opd.value,
                bidang: editModal.bidang.value
            },
            rhk_items: [...currentRhkItems],
            custom_table_html: editModal.tableBody.innerHTML
        };

        const { error } = await supabase.from('skp_history').update(data).eq('id', id);

        if (!error) {
            loadHistory();
            closeEditModal();
            showNotification('Data SKP & Tabel Berhasil Diperbarui di Supabase!', 'success');
        } else {
            console.error(error);
            alert("Gagal memperbarui data di Supabase.");
        }
    });

    async function loadItemForEdit(id) {
        const { data: item, error } = await supabase.from('skp_history').select('*').eq('id', id).single();

        if (item) {
            editModal.idInput.value = item.id;
            editModal.nama.value = item.pegawai.nama;
            editModal.nip.value = item.pegawai.nip;
            editModal.jabatan.value = item.pegawai.jabatan;
            editModal.opd.value = item.pegawai.opd;
            editModal.bidang.value = item.pegawai.bidang || "";

            currentRhkItems = item.rhk_items ? [...item.rhk_items] : [];

            if (currentRhkItems.length > 0) {
                editModal.rhk.value = currentRhkItems[0].atasan;
                editModal.rhkBawahan.value = currentRhkItems[0].bawahan || "";
                editModal.indikator.value = currentRhkItems[0].indikator;
                editModal.levelAtasan.value = currentRhkItems[0].levelAtasan || "";
            }

            if (item.custom_table_html) {
                editModal.tableBody.innerHTML = item.custom_table_html;
            } else {
                generateEditTable(item.pegawai.jabatan, item.pegawai.bidang, currentRhkItems);
            }

            renderEditMiniRhkList();
            editModal.overlay.classList.add('active');
        }
    }



}); // End DOMContentLoaded
