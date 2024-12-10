document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Crop knit", img: "1.jpg", price: 90000 },
      { id: 2, name: "Kemeja blouse inara", img: "2.jpg", price: 80000 },
      { id: 3, name: "Rok Kargo", img: "3.jpg", price: 70000 },
      { id: 4, name: "Rompi Rajut", img: "4.jpg", price: 100000 },
      { id: 5, name: "kulot", img: "5.jpg", price: 98000 },
      { id: 5, name: "Chika Blouse", img: "6.jpg", price: 98000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // cek apakah ada barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      //jika belum ada/cart kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        //jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          //jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // ambil item yang akan di remove berdasarkan id
      const cartItem = this.items.find((item) => item.id === id);

      //jika item lebih dari 1
      if (cartItem.quantity > 1) {
        //telusuri 11
        this.items = this.items.map((item) => {
          //jika bukan barang yang di klik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        //jika barangnya sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// form validation
// Form validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true; // Tombol dimulai dalam keadaan disabled

const form = document.querySelector("#checkoutForm");

// Fungsi validasi
function validateForm() {
  let isValid = true;

  // Iterasi elemen input dalam form
  Array.from(form.querySelectorAll("input")).forEach((input) => {
    if (input.value.trim() === "") {
      isValid = false; // Jika ada input kosong, validasi gagal
    }
  });

  // Perbarui status tombol checkout
  checkoutButton.disabled = !isValid; // Jika valid, aktifkan tombol
  if (isValid) {
    checkoutButton.classList.remove("disabled");
  } else {
    checkoutButton.classList.add("disabled");
  }
}

// Tambahkan event listener untuk setiap input
form.addEventListener("input", validateForm);

//kirim data ketika tombol co diklik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  //const message = formatMessage(objData);
  //window.open("http://wa.me/6282137149634?text=" + encodeURIComponent(message));

  // meminta token transaksi with ajax/fetch
  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    //console.log(token);
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// format pesan wa
const formatMessage = (obj) => {
  return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No HP: ${obj.phone}
Data Pesanan
  ${JSON.parse(obj.items).map(
    (item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`
  )}
 Total: ${rupiah(obj.total)}
 Terima Kasih. `;
};

// konversi ke rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};
