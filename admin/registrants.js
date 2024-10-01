requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      registrant: {},
      registrants: [],
      share_qr: false,
    },
    methods: {
      onShareQR(registrant) {
        this.share_qr = true;
        this.registrant = registrant;
        setTimeout(() => {
          var url = new URL(`${location.protocol}//${location.host}`);
          url.searchParams.append("id", registrant.id);
          generate(url.toString());
        }, 200);
      },
      onCloseQR() {
        this.share_qr = false;
      },
      checkWalkin(registrant) {
        return registrant.is_walked_in ? " (Walk-in)" : "";
      },
    },
    mounted() {
      let registeredRef = database.ref("v0").child("registered");
      registeredRef.get().then((snap) => {
        let registrants = Object.entries(snap.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        this.registrants = registrants;
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
