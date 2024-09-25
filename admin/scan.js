let html5QrCode;
requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      config: { fee: 0, max_drink: 0 },
      student_id: "",
      lists: [],
      is_loading: false,
      is_found: false,
      scan_qr: false,
      devicesList: [],
      device: null,
    },
    methods: {
      onSearch() {
        let sid = this.student_id.toLowerCase();
        if (!sid.includes("st")) sid = "st" + sid;
        let ref = database.ref("v0").child("registered");
        let studentRef = ref.orderByChild("student_id").equalTo(sid);
        this.is_loading = true;
        studentRef.get().then((snap) => {
          this.is_loading = false;
          let data = snap.val();
          if (!data) {
            this.lists = [];
            this.is_found = false;
            return;
          }
          this.is_found = true;
          this.lists = Object.entries(data).map(([id, data]) => ({
            id,
            ...data,
          }));
        });
      },
      searchById(id) {
        let ref = database.ref("v0").child("registered").child(id);
        this.is_loading = true;
        ref.get().then((snap) => {
          this.is_loading = false;
          let data = snap.val();
          if (!data) {
            this.lists = [];
            this.is_found = false;
            return;
          }
          this.is_found = true;
          this.lists = [{ id, ...data }];
        });
      },
      onScanQR() {
        this.scan_qr = true;
        setTimeout(() => {
          let camera = { facingMode: "environment" };
          if (this.device) {
            camera = this.device;
          }
          html5QrCode = new Html5Qrcode("reader", {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          });
          Html5Qrcode.getCameras().then((devices) => {
            if (devices && devices.length) {
              this.devicesList = devices;
            }
          });
          html5QrCode.start(
            camera,
            {
              fps: 10,
              experimentalFeatures: { useBarCodeDetectorIfSupported: false },
            },
            (decodedText) => {
              try {
                let url = new URL(decodedText);
                let id = url.searchParams.get("id");
                this.searchById(id);
                this.onCloseQR();
              } catch (e) {
                alert("Invalid QR Code");
              }
            }
          );
        }, 300);
      },
      onCloseQR() {
        this.scan_qr = false;
        html5QrCode?.stop();
      },
      onDinner({ id }) {
        if (!confirm("Are you sure do you want to proceed this action?"))
          return;
        let ref = database.ref("v0").child("registered").child(id);
        ref
          .update({ had_dinner: firebase.database.ServerValue.increment(1) })
          .then(() => {
            this.searchById(id);
          });
      },
      onDrink({ id }) {
        if (!confirm("Are you sure do you want to proceed this action?"))
          return;
        let ref = database.ref("v0").child("registered").child(id);
        ref
          .update({ had_drink: firebase.database.ServerValue.increment(1) })
          .then(() => {
            this.searchById(id);
          });
      },
      onCancelDrink({ id }) {
        if (!confirm("Are you sure do you want to proceed this action?"))
          return;
        let ref = database.ref("v0").child("registered").child(id);
        ref
          .update({ had_drink: firebase.database.ServerValue.increment(-1) })
          .then(() => {
            this.searchById(id);
          });
      },
      toDate(input) {
        return input ? moment(input).format("DD/MM/YYYY HH:MM:SS") : "-";
      },
    },
    mounted() {
      let ref = database.ref("v0").child("config");
      ref.get().then((snap) => {
        this.config = snap.val();
      });
    },
  });

  function generate(user_input) {
    let qr_code_element = document.querySelector(".qr-code");

    qr_code_element.style = "";

    new QRCode(qr_code_element, {
      logo: "./assets/logo.png",
      text: user_input,
      width: 350,
      height: 350,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L,
    });
  }
});
