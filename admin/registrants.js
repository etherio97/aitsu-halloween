requireAuth().then(() => {
  new Vue({
    el: "#app",
    data: {
      registrants: [],
    },
    methods: {},
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
