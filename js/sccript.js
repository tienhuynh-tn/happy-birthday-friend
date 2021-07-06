function clickMe() {
  var name = prompt("Gõ tên mày vào cái khung dưới đây, liền ngay nào!!!");
  if (name != null) {
    switch (name) {
      case "":
        document.getElementById("name").innerHTML =
          "Gửi lời chúc không thân thương và vô cùng khó chịu vì mày không chịu nhập tên của mày vào!!!";
        break;
      default:
        document.getElementById("name").innerHTML =
          "Gửi lời chúc thân ái và quyết thắng đến bạn " + name + " của tôi <3";
        break;
    }
  } else {
    document.getElementById("name").innerHTML =
      "Gửi lời chúc không thân thương và vô cùng khó chịu vì mày bấm cancel mà không chịu nhập tên của mày vào!!!";
  }
  document.getElementById("image").style.display = "inline-block";
  document.getElementById("button").style.display = "none";
  document.getElementById("content").style.display = "inline-block";
  document.getElementById("link").style.display = "block";
}
