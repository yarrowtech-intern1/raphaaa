export const flyToCart = (imgSrc, startElement, cartIconRef) => {
  if (!startElement || !cartIconRef?.current) return;

  const cartIcon = cartIconRef.current.getBoundingClientRect();
  const startRect = startElement.getBoundingClientRect();

  const flyingImg = document.createElement("img");
  flyingImg.src = imgSrc;
  flyingImg.style.position = "fixed";
  flyingImg.style.zIndex = "9999";
  flyingImg.style.left = `${startRect.left}px`;
  flyingImg.style.top = `${startRect.top}px`;
  flyingImg.style.width = `${startRect.width}px`;
  flyingImg.style.height = `${startRect.height}px`;
  flyingImg.style.borderRadius = "12px";
  flyingImg.style.transition =
    "all 3s cubic-bezier(0.22, 1, 0.36, 1)";
  flyingImg.style.pointerEvents = "none";
  flyingImg.style.opacity = "1";
  document.body.appendChild(flyingImg);

  requestAnimationFrame(() => {
    flyingImg.style.left = `${cartIcon.left + cartIcon.width / 2 - 15}px`;
    flyingImg.style.top = `${cartIcon.top + cartIcon.height / 2 - 15}px`;
    flyingImg.style.width = "30px";
    flyingImg.style.height = "30px";
    flyingImg.style.opacity = "0.4";
    flyingImg.style.transform = "rotate(720deg) scale(0.3)";
  });

  flyingImg.addEventListener("transitionend", () => {
    flyingImg.remove();
  });
};
