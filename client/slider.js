$(function () {
    let i = 0;
    const images = $(".sliderContainer img");
  
    $(".next").on("click", function () {
      const prevImg = images.eq(i);
      i = (i + 1) % images.length;
      const currentImg = images.eq(i);
      animateRight(prevImg, currentImg);
    });
  
    $(".previous").on("click", function () {
      const prevImg = images.eq(i);
      i = (i - 1 + images.length) % images.length;
      const currentImg = images.eq(i);
      animateLeft(prevImg, currentImg);
    });
  
    function animateRight(prevImg, currentImg) {
      currentImg.css({ left: "-100%" });
      currentImg.animate({ left: "0%" }, 1000);
      prevImg.animate({ left: "100%" }, 1000);
    }
  
    function animateLeft(prevImg, currentImg) {
      currentImg.css({ left: "100%" });
      currentImg.animate({ left: "0%" }, 1000);
      prevImg.animate({ left: "-100%" }, 1000);
    }
  });
  