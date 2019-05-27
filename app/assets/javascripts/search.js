$("form.navbar-form navbar-left").on({
    // keydown: function(e) {
    //   if (e.which === 32)
    //     return false;
    // },
    // change: function() {
    //   this.value = this.value.replace(/\s+/g, "");
    // }
    submit: function(e) {
      alert("Handler for .submit() called.");
      e.preventDefault();
      // window.checkInputLength(this);
      
      // this.value = this.value.replace(/\s+/g, "");
    }
  });