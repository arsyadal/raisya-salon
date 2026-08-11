/**
 * Raisya Salon - Karawang
 * Interactive App Logic, Cost Calculator, Before/After Slider & WhatsApp Booking
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveStatus();
  initMobileDrawer();
  initServiceFilters();
  initFaqAccordion();
  initDatePicker();
  initNavbarScroll();
  initBeforeAfterSlider();
  updateCalculator();
});

// State for active promo voucher
let activePromoVoucher = null;

// 1. Live Operating Hours Status
function initLiveStatus() {
  const statusElem = document.getElementById('liveStatusText');
  if (!statusElem) return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const timeInMinutes = currentHour * 60 + currentMinute;

  // Open 09:00 (540 mins) to 18:00 (1080 mins)
  const openTime = 9 * 60;
  const closeTime = 18 * 60;

  if (timeInMinutes >= openTime && timeInMinutes < closeTime) {
    statusElem.textContent = 'Buka Sekarang • Tutup pukul 18.00 WIB';
  } else {
    statusElem.textContent = 'Tutup • Buka Kembali Besok Pukul 09.00 WIB';
    const dot = document.querySelector('.status-dot');
    if (dot) {
      dot.style.backgroundColor = '#eab308';
      dot.style.boxShadow = '0 0 8px #eab308';
    }
  }
}

// 2. Mobile Drawer Menu
function initMobileDrawer() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const links = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  links.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

// 3. Navbar Scroll Shadow Effect
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

// 4. Service Category Filter
function initServiceFilters() {
  const tabs = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.service-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// 5. Select Service into Booking Form
window.selectServiceForBooking = function(serviceName) {
  const serviceSelect = document.getElementById('serviceSelect');
  if (serviceSelect) {
    let matched = false;
    for (let i = 0; i < serviceSelect.options.length; i++) {
      if (serviceSelect.options[i].text.includes(serviceName) || serviceName.includes(serviceSelect.options[i].value)) {
        serviceSelect.selectedIndex = i;
        matched = true;
        break;
      }
    }
    if (!matched) {
      serviceSelect.value = serviceSelect.options[1].value;
    }
  }

  const bookingSection = document.getElementById('booking');
  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`Layanan "${serviceName.split('(')[0].trim()}" telah dipilih! Silakan lengkapi tanggal kedatangan.`);
};

// 6. Interactive Calculator Logic
window.updateCalculator = function() {
  const lengthElem = document.querySelector('input[name="calcLength"]:checked');
  const hairLength = lengthElem ? lengthElem.value : 'short';
  const hairCondition = document.getElementById('calcCondition') ? document.getElementById('calcCondition').value : 'normal';

  // Multipliers based on length
  let lengthMultiplier = 1.0;
  let lengthTimeAdd = 0;
  if (hairLength === 'medium') {
    lengthMultiplier = 1.25;
    lengthTimeAdd = 20;
  } else if (hairLength === 'long') {
    lengthMultiplier = 1.5;
    lengthTimeAdd = 45;
  } else if (hairLength === 'xlong') {
    lengthMultiplier = 1.8;
    lengthTimeAdd = 60;
  }

  // Extra price for thick/difficult hair
  let conditionExtra = 0;
  if (hairCondition === 'thick') {
    conditionExtra = 20000;
  }

  // Update dynamic price tags on checklist
  const smoothingPrice = Math.round((150000 * lengthMultiplier + conditionExtra) / 5000) * 5000;
  const colorPrice = Math.round((120000 * lengthMultiplier + conditionExtra) / 5000) * 5000;

  const smoothDisp = document.getElementById('price_smoothing_display');
  if (smoothDisp) smoothDisp.textContent = `Rp ${smoothingPrice.toLocaleString('id-ID')}`;

  const colorDisp = document.getElementById('price_color_display');
  if (colorDisp) colorDisp.textContent = `Rp ${colorPrice.toLocaleString('id-ID')}`;

  // Gather selected items
  const checkboxes = document.querySelectorAll('.treatment-checkbox input[type="checkbox"]');
  const selectedListElem = document.getElementById('calcSelectedList');
  let totalPrice = 0;
  let totalMinutes = 0;
  let selectedItemsHtml = '';
  let selectedItemsCount = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) {
      selectedItemsCount++;
      let itemPrice = parseInt(cb.value);
      let itemTime = parseInt(cb.getAttribute('data-time') || '45');
      const itemName = cb.getAttribute('data-name');

      // Adjust smoothing & color by length
      if (cb.id === 'srv_smoothing') {
        itemPrice = smoothingPrice;
        itemTime += lengthTimeAdd;
      } else if (cb.id === 'srv_color') {
        itemPrice = colorPrice;
        itemTime += lengthTimeAdd;
      }

      totalPrice += itemPrice;
      totalMinutes += itemTime;

      selectedItemsHtml += `
        <div class="calc-item-row">
          <span>• ${itemName}</span>
          <span>Rp ${itemPrice.toLocaleString('id-ID')}</span>
        </div>
      `;
    }
  });

  if (selectedItemsCount === 0) {
    selectedItemsHtml = `<p style="font-size:0.85rem; color:#888; font-style:italic;">Belum ada layanan yang dipilih. Silakan centang layanan di sebelah kiri.</p>`;
  }

  if (selectedListElem) {
    selectedListElem.innerHTML = selectedItemsHtml;
  }

  // Apply voucher discount if active
  let finalPrice = totalPrice;
  const promoBox = document.getElementById('calcPromoApplied');
  if (activePromoVoucher === 'RAISYAPROMO10' && totalPrice > 0) {
    const discount = Math.round(totalPrice * 0.1);
    finalPrice = totalPrice - discount;
    if (promoBox) promoBox.style.display = 'flex';
  } else {
    if (promoBox) promoBox.style.display = 'none';
  }

  // Update display values
  const totalDisplay = document.getElementById('calcTotalDisplay');
  if (totalDisplay) {
    totalDisplay.textContent = `Rp ${finalPrice.toLocaleString('id-ID')}`;
  }

  const durationDisplay = document.getElementById('calcDurationDisplay');
  if (durationDisplay) {
    if (totalMinutes < 60) {
      durationDisplay.textContent = `~ ${totalMinutes} Menit`;
    } else {
      const hours = (totalMinutes / 60).toFixed(1);
      durationDisplay.textContent = `~ ${hours.replace('.0', '')} Jam (${totalMinutes} mnt)`;
    }
  }
};

// Apply calculated package into Booking form & redirect to WhatsApp
window.applyCalcToBooking = function() {
  const checkboxes = document.querySelectorAll('.treatment-checkbox input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    showToast('Silakan pilih minimal 1 jenis perawatan terlebih dahulu.', 'error');
    return;
  }

  let selectedNames = [];
  checkboxes.forEach(cb => selectedNames.push(cb.getAttribute('data-name')));

  const lengthElem = document.querySelector('input[name="calcLength"]:checked');
  const hairLength = lengthElem ? lengthElem.value : 'short';
  const totalDisplay = document.getElementById('calcTotalDisplay').textContent;
  const durationDisplay = document.getElementById('calcDurationDisplay').textContent;

  const notesField = document.getElementById('notes');
  if (notesField) {
    let noteText = `[Estimasi Kalkulator: Paket ${selectedNames.join(' + ')} | Panjang Rambut: ${hairLength} | Estimasi: ${totalDisplay} (${durationDisplay})]`;
    if (activePromoVoucher) {
      noteText += ` [VOUCHER: ${activePromoVoucher} -10%]`;
    }
    notesField.value = noteText;
  }

  const serviceSelect = document.getElementById('serviceSelect');
  if (serviceSelect) {
    serviceSelect.value = 'Konsultasi & Perawatan Lainnya';
  }

  const bookingSection = document.getElementById('booking');
  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: 'smooth' });
  }

  showToast('Paket pilihan Anda telah dimasukkan ke Form Reservasi! Silakan isi nama & tanggal.');
};

// Reset Calculator
window.resetCalculator = function() {
  const defaultRadio = document.querySelector('input[name="calcLength"][value="short"]');
  if (defaultRadio) defaultRadio.checked = true;

  const cond = document.getElementById('calcCondition');
  if (cond) cond.selectedIndex = 0;

  const checkboxes = document.querySelectorAll('.treatment-checkbox input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    cb.checked = (idx === 0);
  });

  updateCalculator();
  showToast('Pilihan kalkulator telah direset.');
};

// Copy & Apply Promo Voucher
window.copyVoucherCode = function() {
  const code = 'RAISYAPROMO10';
  navigator.clipboard.writeText(code).then(() => {
    activePromoVoucher = code;
    updateCalculator();
    showToast(`Voucher "${code}" berhasil disalin & otomatis mengaktifkan diskon 10%!`);
  }).catch(() => {
    activePromoVoucher = code;
    updateCalculator();
    showToast(`Voucher "${code}" aktif!`);
  });
};

// 7. Interactive Before & After Slider
function initBeforeAfterSlider() {
  const container = document.getElementById('baSliderContainer');
  const overlay = document.getElementById('baOverlay');
  const handle = document.getElementById('baHandle');
  if (!container || !overlay || !handle) return;

  let isDragging = false;

  function setSliderPos(xPos) {
    const rect = container.querySelector('.ba-image-wrapper').getBoundingClientRect();
    let percentage = ((xPos - rect.left) / rect.width) * 100;

    if (percentage < 5) percentage = 5;
    if (percentage > 95) percentage = 95;

    overlay.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  }

  const wrapper = container.querySelector('.ba-image-wrapper');

  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    setSliderPos(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setSliderPos(e.clientX);
  });

  // Touch support for mobile
  wrapper.addEventListener('touchstart', (e) => {
    isDragging = true;
    setSliderPos(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    setSliderPos(e.touches[0].clientX);
  }, { passive: true });
}

// 8. Gallery Lightbox Modal
window.openLightbox = function(imgSrc, title, desc) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const t = document.getElementById('lightboxTitle');
  const d = document.getElementById('lightboxDesc');

  if (modal && img) {
    img.src = imgSrc;
    if (t) t.textContent = title;
    if (d) d.textContent = desc;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// 9. Date Picker default to today / tomorrow
function initDatePicker() {
  const dateInput = document.getElementById('bookDate');
  if (!dateInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  dateInput.min = `${yyyy}-${mm}-${dd}`;
  dateInput.value = `${yyyy}-${mm}-${dd}`;
}

// 10. Handle WhatsApp Booking Submission
window.handleBookingSubmit = function(event) {
  event.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const service = document.getElementById('serviceSelect').value;
  const date = document.getElementById('bookDate').value;
  const time = document.getElementById('bookTime').value;
  const notes = document.getElementById('notes').value.trim();

  if (!name || !phone || !service || !date) {
    showToast('Mohon lengkapi semua kolom yang wajib diisi.', 'error');
    return;
  }

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const salonPhone = '6285216855668'; // 0852-1685-5668
  let message = `*FORM RESERVASI / BOOKING RAISYA SALON*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *Nama:* ${name}\n`;
  message += `📱 *No. WhatsApp:* ${phone}\n`;
  message += `💇‍♀️ *Layanan:* ${service}\n`;
  message += `📅 *Hari/Tanggal:* ${formattedDate}\n`;
  message += `⏰ *Jam Kedatangan:* ${time}\n`;
  if (activePromoVoucher) {
    message += `🎟️ *Kode Voucher Promo:* ${activePromoVoucher} (Diskon 10%)\n`;
  }
  if (notes) {
    message += `📝 *Catatan Khusus:* ${notes}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Halo Admin Raisya Salon, apakah pada jadwal di atas slot masih tersedia? Terima kasih!`;

  const encodedUrl = `https://wa.me/${salonPhone}?text=${encodeURIComponent(message)}`;

  showToast('Membuka WhatsApp untuk mengirim data reservasi...');
  
  setTimeout(() => {
    window.open(encodedUrl, '_blank');
  }, 400);
};

// 11. FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// 12. Share Salon Info
window.shareSalonLink = function() {
  const shareData = {
    title: 'Raisya Salon Karawang (Rating 4.3 ⭐)',
    text: 'Cek Raisya Salon di Telukjambe Timur Karawang - Potong rambut, Smoothing, Coloring, Creambath, & Make Up. Telp/WA: 0852-1685-5668',
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(
      `Raisya Salon Karawang - Blok C, Perum Bumi Teluk Jambe No.153, Sukaluyu, Telukjambe Timur, Karawang. Telp: 0852-1685-5668 | ${window.location.href}`
    );
    showToast('Info alamat & kontak Raisya Salon berhasil disalin ke clipboard!');
  }
};

// 13. Toast Notification System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = type === 'error' 
    ? '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444"></i>'
    : '<i class="fa-solid fa-circle-check" style="color:#22c55e"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
