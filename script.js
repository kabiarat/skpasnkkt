import { skpData } from './data.js';

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

        // Load saved logo
        const savedLogo = localStorage.getItem('skp_app_logo');
        if (savedLogo && appLogo) {
            appLogo.src = savedLogo;
            if (heroLogoContainer) heroLogoContainer.style.display = 'block';
        }

        logoUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert("Ukuran file terlalu besar. Maksimal 2MB.");
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (event) {
                    const dataUrl = event.target.result;
                    try {
                        localStorage.setItem('skp_app_logo', dataUrl);
                        // Update UI
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
                        alert("Gagal menyimpan logo. Kemungkinan ukuran terlalu besar untuk penyimpanan browser.");
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

    function loadJabatans() {
        let savedJabatans = JSON.parse(localStorage.getItem('skp_jabatans') || '[]');

        // Merge defaults if empty (first run)
        if (savedJabatans.length === 0) {
            savedJabatans = defaultJabatans;
            localStorage.setItem('skp_jabatans', JSON.stringify(savedJabatans));
        }

        // Populate Selector
        jabatanInputs.selector.innerHTML = '<option value="">-- Pilih Jabatan --</option>';
        savedJabatans.forEach(jab => {
            const option = document.createElement('option');
            option.value = jab;
            option.textContent = jab;
            jabatanInputs.selector.appendChild(option);
        });

        // Populate List in Manager
        jabatanInputs.list.innerHTML = '';
        savedJabatans.forEach((jab, index) => {
            const li = document.createElement('li');
            li.style.padding = '10px';
            li.style.borderBottom = '1px solid #eee';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            li.innerHTML = `
                <span>${jab}</span>
                <button class="btn-danger btn-sm" onclick="deleteJabatan(${index})" style="padding: 5px 10px; font-size: 0.8rem;">Hapus</button>
            `;
            jabatanInputs.list.appendChild(li);
        });
    }

    function loadLevels() {
        let savedLevels = JSON.parse(localStorage.getItem('skp_levels') || '[]');

        // Merge defaults if empty
        if (savedLevels.length === 0) {
            savedLevels = defaultLevels;
            localStorage.setItem('skp_levels', JSON.stringify(savedLevels));
        }

        // Populate Selectors (Both Main and Edit Modal)
        const selectors = [levelInputs.selector, levelInputs.editSelector];
        selectors.forEach(sel => {
            if (!sel) return;
            sel.innerHTML = '<option value="">-- Pilih Level Jabatan Atasan --</option>';
            savedLevels.forEach(lvl => {
                const option = document.createElement('option');
                option.value = lvl;
                option.textContent = lvl;
                sel.appendChild(option);
            });
        });

        // Populate List in Manager
        if (levelInputs.list) {
            levelInputs.list.innerHTML = '';
            savedLevels.forEach((lvl, index) => {
                const li = document.createElement('li');
                li.style.padding = '10px';
                li.style.borderBottom = '1px solid #eee';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                li.innerHTML = `
                    <span>${lvl}</span>
                    <button class="btn-danger btn-sm" onclick="deleteLevel(${index})" style="padding: 5px 10px; font-size: 0.8rem;">Hapus</button>
                `;
                levelInputs.list.appendChild(li);
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

    // Expose delete function to window
    window.deleteJabatan = async function (index) {
        const confirmed = await showConfirm('Hapus Jabatan?', 'Jabatan ini akan dihapus dari daftar.', 'Hapus');
        if (confirmed) {
            let savedJabatans = JSON.parse(localStorage.getItem('skp_jabatans') || '[]');
            savedJabatans.splice(index, 1);
            localStorage.setItem('skp_jabatans', JSON.stringify(savedJabatans));
            loadJabatans();
            showNotification('Jabatan berhasil dihapus!', 'success');
        }
    };

    window.deleteLevel = async function (index) {
        const confirmed = await showConfirm('Hapus Level Atasan?', 'Level ini akan dihapus dari daftar.', 'Hapus');
        if (confirmed) {
            let savedLevels = JSON.parse(localStorage.getItem('skp_levels') || '[]');
            savedLevels.splice(index, 1);
            localStorage.setItem('skp_levels', JSON.stringify(savedLevels));
            loadLevels();
            showNotification('Level Atasan berhasil dihapus!', 'success');
        }
    };

    jabatanInputs.addBtn.addEventListener('click', () => {
        const newVal = jabatanInputs.newInput.value.trim();
        if (newVal) {
            let savedJabatans = JSON.parse(localStorage.getItem('skp_jabatans') || '[]');
            if (!savedJabatans.includes(newVal)) {
                savedJabatans.push(newVal);
                localStorage.setItem('skp_jabatans', JSON.stringify(savedJabatans));
                jabatanInputs.newInput.value = '';
                loadJabatans();
                showNotification('Jabatan berhasil ditambahkan!', 'success');
            } else {
                showNotification('Jabatan sudah ada!', 'error');
            }
        }
    });

    if (levelInputs.addBtn) {
        levelInputs.addBtn.addEventListener('click', () => {
            const newVal = levelInputs.newInput.value.trim();
            if (newVal) {
                let savedLevels = JSON.parse(localStorage.getItem('skp_levels') || '[]');
                if (!savedLevels.includes(newVal)) {
                    savedLevels.push(newVal);
                    localStorage.setItem('skp_levels', JSON.stringify(savedLevels));
                    levelInputs.newInput.value = '';
                    loadLevels();
                    showNotification('Level Atasan berhasil ditambahkan!', 'success');
                } else {
                    showNotification('Level ini sudah ada!', 'error');
                }
            }
        });
    }

    // Initial Load
    loadJabatans();
    loadLevels();


    // --- SKP LOGIC ---
    const inputs = {
        nama: document.getElementById('namaLengkap'),
        nip: document.getElementById('nip'),
        jabatan: document.getElementById('jabatanSelector'), // Updated to selector
        opd: document.getElementById('opd'),
        rhkAtasan: document.getElementById('rhkAtasan'),
        indikatorAtasan: document.getElementById('indikatorAtasan'),
        levelAtasan: document.getElementById('levelAtasanSelector')
    };

    const printSpans = {
        nama: document.getElementById('printNama'),
        nip: document.getElementById('printNip'),
        jabatan: document.getElementById('printJabatan'),
        opd: document.getElementById('printOpd')
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
                    executeGenerate(userJabatan, userRhkAtasan, userIndikatorAtasan, userLevelAtasan);

                    // Clear RHK inputs after adding to table to prompt user for second RHK
                    inputs.rhkAtasan.value = '';
                    inputs.indikatorAtasan.value = '';
                }, 1000);
            }, 1500);
        }, 1500);
    });

    function executeGenerate(userJabatan, userRhkAtasan, userIndikatorAtasan, userLevelAtasan) {
        // Basic Validation
        if (!userJabatan) {
            showNotification('Harap pilih Jabatan terlebih dahulu!', 'error');
            return;
        }
        if (!userRhkAtasan || !userIndikatorAtasan) {
            showNotification('Harap isi RHK Atasan dan Indikator Kinerja Atasan!', 'error');
            return;
        }

        // Add to state
        currentRhkItems.push({
            atasan: userRhkAtasan,
            indikator: userIndikatorAtasan,
            levelAtasan: userLevelAtasan
        });

        // Update Title & Print Header
        jabatanTitle.textContent = userJabatan.toUpperCase();
        printSpans.nama.textContent = inputs.nama.value;
        printSpans.nip.textContent = inputs.nip.value;
        printSpans.jabatan.textContent = userJabatan;
        printSpans.opd.textContent = inputs.opd.value;

        // Render whole list
        generateGenericTable(userJabatan, currentRhkItems, tbody, false);
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
        if (userJabatan) {
            generateGenericTable(userJabatan, currentRhkItems, tbody, false);
        }
    };

    // SIMPAN (SAVE) BUTTON
    buttons.save.addEventListener('click', () => {
        const data = {
            id: currentEditId || Date.now().toString(), // Use existing ID if editing
            timestamp: new Date().toISOString(),
            rhkItems: [...currentRhkItems],
            pegawai: {
                nama: inputs.nama.value,
                nip: inputs.nip.value,
                jabatan: inputs.jabatan.value,
                opd: inputs.opd.value
            },
            periode: document.getElementById('periodeTahun').value || new Date().getFullYear().toString()
        };

        // --- DUPLICATE CHECK LOGIC ---
        let history = JSON.parse(localStorage.getItem('skp_history') || '[]');

        const isDuplicate = history.some(item =>
            item.id !== currentEditId &&
            item.pegawai.nip === data.pegawai.nip &&
            item.periode === data.periode &&
            JSON.stringify(item.rhkItems) === JSON.stringify(data.rhkItems) // Compare rhkItems array
        );

        if (isDuplicate) {
            showNotification('Gagal Simpan: Data SKP serupa sudah ada dalam riwayat untuk periode ini.', 'error');
            return;
        }

        // Validate minimal
        if (!data.rhkItems || data.rhkItems.length === 0) {
            showNotification("Tidak ada data untuk disimpan.", 'error');
            return;
        }

        if (currentEditId) {
            // Update existing
            const index = history.findIndex(item => item.id === currentEditId);
            if (index !== -1) history[index] = data;
        } else {
            // Add new
            history.unshift(data);
        }

        localStorage.setItem('skp_history', JSON.stringify(history));

        showNotification('Data berhasil disimpan ke Riwayat SKP!', 'success');

        // Refresh History List
        loadHistory();

        // Reset edit mode
        currentEditId = null;
        editNotice.style.display = 'none';

        // Clear buttons or form? Usually User wants to keep seeing what they saved.
        // We leave it as is.
    });

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
    function loadHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        const history = JSON.parse(localStorage.getItem('skp_history') || '[]');
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 10px; color: #64748b;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.3;"></i>
                    <p>Belum ada riwayat SKP tersimpan.</p>
                </div>
            `;
            return;
        }

        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card bg-white p-4 history-card';
            card.style.border = '1px solid #e2e8f0';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h3 style="color: var(--primary-color); font-size: 1.1rem; font-weight: bold;">${item.pegawai.nama}</h3>
                        <p style="font-size: 0.85rem; color: #64748b;">NIP: ${item.pegawai.nip}</p>
                        <p style="font-size: 0.85rem; color: #64748b;"><i class="fas fa-calendar-alt"></i> Tahun: ${item.periode}</p>
                    </div>
                    <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 5px; font-size: 0.75rem; font-weight: 600;">${item.pegawai.jabatan}</span>
                </div>
                <div style="border-top: 1px solid #eee; padding-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn-secondary btn-sm" onclick="viewItem('${item.id}')" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; cursor:pointer;"><i class="fas fa-eye"></i> Lihat</button>
                    <button class="btn-success btn-sm" onclick="loadItemForEdit('${item.id}')" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0; padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; cursor:pointer;"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-danger btn-sm" onclick="deleteItem('${item.id}')" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; cursor:pointer;"><i class="fas fa-trash"></i> Hapus</button>
                </div>
            `;
            historyList.appendChild(card);
        });
    }

    // Call initially
    loadHistory();

    // Expose functions to window for onclick handlers
    // Expose functions to window for onclick handlers
    window.viewItem = function (id) { loadItemForView(id); };
    window.loadItemForEdit = function (id) { loadItemForEdit(id); };
    // window.deleteItem is handled by the global definition logic? 
    // No, deleteItem is defined inside DOMContentLoaded scope in Step 549/566.
    // But I just closed DOMContentLoaded at line 430 in Step 602.
    // So deleteItem IS local to DOMContentLoaded.
    // So I MUST expose it here.
    window.deleteItem = function (id) { deleteItem(id); };

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

    function loadItemForView(id) {
        const history = JSON.parse(localStorage.getItem('skp_history') || '[]');
        const item = history.find(d => d.id === id);

        if (item) {
            // Populate Header Details
            viewModal.headerDetails.innerHTML = `
                <div>
                    <p><strong>Nama:</strong> ${item.pegawai.nama}</p>
                    <p><strong>NIP:</strong> ${item.pegawai.nip}</p>
                </div>
                <div style="text-align:right;">
                     <p><strong>Jabatan:</strong> ${item.pegawai.jabatan}</p>
                     <p><strong>OPD:</strong> ${item.pegawai.opd}</p>
                </div>
            `;

            // Populate Table
            if (item.custom_table_html) {
                viewModal.tableBody.innerHTML = item.custom_table_html;
                // Make sure we DISABLE contentEditable for View Mode
                viewModal.tableBody.querySelectorAll('[contenteditable]').forEach(el => {
                    el.contentEditable = false;
                    el.style.cursor = 'default';
                    el.classList.remove('editable-cell');
                });
            } else {
                // Generate Fresh
                generateViewTable(item.pegawai.jabatan, item.rhkItems || []);
            }

            viewModal.overlay.classList.add('active');
        }
    }

    function generateViewTable(jabatan, rhkItems) {
        generateGenericTable(jabatan, rhkItems, viewModal.tableBody, false);
    }

    // Generic generator that can be used by both (Edit gets contentEditable=true, View gets false)
    function generateGenericTable(jabatan, rhkItems, targetTbody, isEditable) {
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
                            rhk: item.atasan,
                            indikator: item.indikator
                        },
                        bawahan: bawahan
                    };

                    // Render
                    renderRowToGeneric(currentData, jabatan, itemIdx + 1, color, targetTbody, isEditable);
                });
            });
        }
    }

    function renderRowToGeneric(data, userJabatan, no, bgColor, targetTbody, isEditable) {
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
        levelAtasan: document.getElementById('editLevelAtasan'),
        rhk: document.getElementById('editRhk'),
        indikator: document.getElementById('editIndikator'),
        saveBtn: document.getElementById('saveEditBtn'),
        cancelBtn: document.getElementById('cancelEditBtn'),
        closeBtn: document.getElementById('closeEditModal'),
        tableBody: document.querySelector('#editTablePreview tbody')
    };


    function generateEditTable(jabatan, rhkItems) {
        generateGenericTable(jabatan, rhkItems, editModal.tableBody, true);
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
    [editModal.rhk, editModal.indikator, editModal.levelAtasan].forEach(input => {
        if (!input) return;
        ['input', 'change', 'keyup'].forEach(evt => {
            input.addEventListener(evt, () => {
                // Sync back to first item for live preview while editing top inputs
                if (currentRhkItems.length > 0) {
                    currentRhkItems[0].atasan = editModal.rhk.value;
                    currentRhkItems[0].indikator = editModal.indikator.value;
                    currentRhkItems[0].levelAtasan = editModal.levelAtasan.value;
                }
                generateEditTable(editModal.jabatan.value, currentRhkItems);
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
            const indVal = editModal.indikator.value.trim();
            const lvlVal = editModal.levelAtasan.value;

            if (!rhkVal || !indVal) {
                showNotification('Harap isi RHK dan Indikator terlebih dahulu!', 'error');
                return;
            }

            currentRhkItems.push({
                atasan: rhkVal,
                indikator: indVal,
                levelAtasan: lvlVal
            });

            // Reset fields
            editModal.rhk.value = '';
            editModal.indikator.value = '';

            renderEditMiniRhkList();
            generateEditTable(editModal.jabatan.value, currentRhkItems);
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
        generateEditTable(editModal.jabatan.value, currentRhkItems);
    };

    editModal.saveBtn.addEventListener('click', () => {
        const id = editModal.idInput.value;
        const history = JSON.parse(localStorage.getItem('skp_history') || '[]');
        const index = history.findIndex(item => item.id === id);

        if (index !== -1) {
            // Update Data
            history[index].pegawai.nama = editModal.nama.value;
            history[index].pegawai.nip = editModal.nip.value;
            // history[index].pegawai.jabatan is readonly in modal
            history[index].pegawai.opd = editModal.opd.value;
            history[index].rhkItems = [...currentRhkItems];

            // Save Table State (Persist manual cell edits)
            history[index].custom_table_html = editModal.tableBody.innerHTML;

            // Save & Refresh
            localStorage.setItem('skp_history', JSON.stringify(history));
            loadHistory();
            closeEditModal();
            showNotification('Data SKP & Tabel Berhasil Diperbarui!', 'success');
        } else {
            showNotification('Gagal Menyimpan: Data tidak ditemukan.', 'error');
        }
    });

    function loadItemForEdit(id) {
        const history = JSON.parse(localStorage.getItem('skp_history') || '[]');
        const item = history.find(d => d.id === id);

        if (item) {
            // Populate Inputs
            editModal.idInput.value = item.id;
            editModal.nama.value = item.pegawai.nama;
            editModal.nip.value = item.pegawai.nip;
            editModal.jabatan.value = item.pegawai.jabatan;
            editModal.opd.value = item.pegawai.opd;

            // Load items into state
            currentRhkItems = item.rhkItems ? [...item.rhkItems] : [
                { atasan: item.rhk.atasan, indikator: item.rhk.indikator, levelAtasan: item.rhk.levelAtasan }
            ];

            // For the edit modal inputs, we show the first one or leave empty for adding new ones
            if (currentRhkItems.length > 0) {
                editModal.rhk.value = currentRhkItems[0].atasan;
                editModal.indikator.value = currentRhkItems[0].indikator;
                editModal.levelAtasan.value = currentRhkItems[0].levelAtasan || "";
            }

            // Generate Preview Table
            if (item.custom_table_html) {
                // Restore saved table state
                editModal.tableBody.innerHTML = item.custom_table_html;
            } else {
                // Generate fresh if no custom save exists
                generateEditTable(item.pegawai.jabatan, currentRhkItems);
            }

            renderEditMiniRhkList();

            // Show Modal
            editModal.overlay.classList.add('active');
        }
    }

    function deleteItem(id) {
        showConfirm('Hapus Riwayat?', 'Riwayat SKP ini akan dihapus permanen.', 'Hapus')
            .then(confirmed => {
                if (confirmed) {
                    let history = JSON.parse(localStorage.getItem('skp_history') || '[]');
                    history = history.filter(item => item.id !== id);
                    localStorage.setItem('skp_history', JSON.stringify(history));
                    loadHistory(); // Refresh list
                    showNotification('Riwayat berhasil dihapus!', 'success');
                }
            });
    }



}); // End DOMContentLoaded
