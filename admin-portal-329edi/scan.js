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
    },
    methods: {
      onSearch() {
        let ref = database.ref("v0").child("registered");
        let studentRef = ref
          .orderByChild("student_id")
          .equalTo(this.student_id.toLowerCase());
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
          const qrScanner = new QrScanner(
            document.querySelector("video"),
            (result) => {
              qrScanner.stop();
              this.onCloseQR();
              try {
                let url = new URL(result);
                let id = url.searchParams.get("id");
                this.searchById(id);
              } catch (e) {
                alert("Invalid QR Code");
              }
            }
          );

          qrScanner.start();
        }, 300);
      },
      onCloseQR() {
        this.scan_qr = false;
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
      onDrink({ id, had_drink }) {
        if (!confirm("Are you sure do you want to proceed this action?"))
          return;
        let ref = database.ref("v0").child("registered").child(id);
        ref
          .update({ had_drink: firebase.database.ServerValue.increment(1) })
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
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
});
