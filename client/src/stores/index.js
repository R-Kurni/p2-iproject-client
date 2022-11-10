import { defineStore } from "pinia";
import axios from "axios";
// import midtransClient from "midtrans-client";

export const useIndexStore = defineStore("index", {
  state: () => ({
    baseUrl: "http://localhost:3000",
    isLogin: false,
    isCartEmpty: false,
    products: [],
    carts: [],
    prc: 0,
  }),
  actions: {
    async fetchProducts() {
      try {
        const { data } = await axios({
          url: this.baseUrl + "/products",
          method: "get",
        });
        this.products = data;
      } catch (err) {
        console.log(err.data);
      }
    },

    async fetchCarts() {
      try {
        const { data } = await axios({
          url: this.baseUrl + "/carts",
          method: "get",
          headers: {
            access_token: localStorage.access_token,
          },
        });
        this.carts = data;
        this.isCartEmpty = true;
      } catch (error) {
        console.log(error.data);
        this.isCartEmpty = false;
      }
    },

    async signUpHandler(value) {
      try {
        const { data } = await axios({
          url: this.baseUrl + "/register",
          method: "post",
          data: {
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            password: value.password,
            phoneNumber: value.phoneNumber,
          },
        });
        this.router.push("/sign-in");
        this.registerAlert();
      } catch (err) {
        console.log(err);
        this.globalAlert(
          "error",
          "Please check:",
          `${err.response.data.message}`
        );
      }
    },

    async signInHandler(value) {
      try {
        const { data } = await axios({
          url: this.baseUrl + "/login",
          method: "post",
          data: {
            email: value.email,
            password: value.password,
          },
        });
        localStorage.setItem("access_token", data.access_token);
        if (localStorage.access_token) {
          this.isLogin = true;
          this.router.push("/");
          this.loginAlert();
        }
      } catch (err) {
        console.log(err);
        this.globalAlert(
          "error",
          "Please check:",
          `${(err.response.data.message = "Invalid Email / Password !!")}`
        );
      }
    },

    async callback(response) {
      try {
        const result = await axios({
          url: this.baseUrl + "/google-sign-in",
          method: "post",
          headers: {
            google_token: response.credential,
          },
        });
        localStorage.setItem("access_token", result.data.access_token);
        if (localStorage.access_token) {
          this.isLogin = true;
          this.router.push("/");
          this.loginAlert();
        }
      } catch (err) {
        console.log(err);
        this.globalAlert(
          "error",
          "Please check:",
          `${(err.result.data.message = "Google Sign In Failed !!")}`
        );
      }
    },

    // async payment() {
    //   let snap = new midtransClient.Snap({
    //     // Set to true if you want Production Environment (accept real transaction).
    //     isProduction: false,
    //     serverKey: "SB-Mid-server-Hgx1_XJ42nh0NHrjvpV4pkm-",
    //   });
    //   try {
    //     const { data } = await axios({
    //       url: this.baseUrl + "/carts/payment",
    //       method: "get",
    //     });
    //     window.snap.pay(data.token, {
    //       onSuccess: function (result) {
    //         this.paymentAlert();
    //       },
    //     });
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },

    signOutHandler() {
      this.logoutAlert();
    },

    prcHandler() {
      this.prc = 0;
      this.router.push("/");
    },

    async addToCartHandler(id) {
      try {
        const { data } = await axios({
          url: this.baseUrl + "/carts/" + id,
          method: "post",
          headers: {
            access_token: localStorage.access_token,
          },
        });
        this.carts.push(data);
        this.addToCartAlert();
        this.router.push("/carts");
      } catch (error) {
        console.log(error);
        this.globalAlert(
          "warning",
          "Please check:",
          `${error.response.data.message}`
        );
      }
    },

    async deleteFromCartHandler(id) {
      try {
        await axios({
          url: this.baseUrl + "/carts/" + id,
          method: "delete",
          headers: {
            access_token: localStorage.access_token,
          },
        });
        this.router.push("/carts");
        this.fetchCarts();
      } catch (error) {
        console.log(error);
      }
    },

    // Sweet Alert
    async registerAlert() {
      const Toast = await Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      Toast.fire({
        icon: "success",
        title: "Registered successfully",
      });
    },

    async loginAlert() {
      const Toast = await Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      Toast.fire({
        icon: "success",
        title: "Signed in successfully",
      });
    },

    async logoutAlert() {
      await Swal.fire({
        title: "Are you sure?",
        text: "You are logging out...",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF3A3A",
        cancelButtonColor: "#E3E3E3",
        confirmButtonText: "Log Out!",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("access_token");
          this.isLogin = false;
          this.router.push("/");
          this.globalAlert("success", "Success!", "You have been logged out.");
        }
      });
    },

    async addToCartAlert() {
      const Toast = await Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
      Toast.fire({
        icon: "success",
        title: "Success adding Product to Cart",
      });
    },

    async deleteFromCartAlert(id) {
      await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF3A3A",
        cancelButtonColor: "#E3E3E3",
        confirmButtonText: "DELETE!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteFromCartHandler(id);
          this.globalAlert(
            "success",
            "Deleted!",
            "The Product has been deleted."
          );
        }
      });
    },

    // async paymentAlert() {
    //   const Toast = await Swal.mixin({
    //     toast: true,
    //     position: "top-end",
    //     showConfirmButton: false,
    //     timer: 3000,
    //     timerProgressBar: true,
    //     didOpen: (toast) => {
    //       toast.addEventListener("mouseenter", Swal.stopTimer);
    //       toast.addEventListener("mouseleave", Swal.resumeTimer);
    //     },
    //   });
    //   Toast.fire({
    //     icon: "success",
    //     title: "Payment successful",
    //   });
    // },

    async globalAlert(icon, title, text) {
      let result = {};
      if (icon) {
        result.icon = icon;
      }
      if (title) {
        result.title = title;
      }
      if (text) {
        result.text = text;
      }
      await Swal.fire(result);
    },
  },
});
