const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHex = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeAdjustment = document.querySelectorAll(".close-adjustment");
const sliderContainer = document.querySelectorAll(".sliders");
let initialColor;

let savePalettes = [];

generateBtn.addEventListener("click", randomColor);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("input", () => {
    UpdateTextUI(index);
  });
});

currentHex.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyClipBoard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustment.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockBtn.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColor() {
  initialColor = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomcolor = generateHex();

    if (div.classList.contains("locked")) {
      initialColor.push(hexText.innerText);
      return;
    } else initialColor.push(randomcolor.hex());

    div.style.backgroundColor = randomcolor;
    hexText.innerText = randomcolor;
    checkTextContrast(randomcolor, hexText);

    const color = chroma(randomcolor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  resetInput();

  adjustBtn.forEach((button, index) => {
    checkTextContrast(initialColor[index], button);
    checkTextContrast(initialColor[index], lockBtn[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) text.style.color = "black";
  else text.style.color = "white";
}

function colorizeSliders(color, hue, brightness, saturation) {
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  //saturation
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;
  //brightness
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;

  hue.style.backgroundImage =
    "linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))";
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-hue") |
    e.target.getAttribute("data-bright") |
    e.target.getAttribute("data-sat");
  let slider = e.target.parentElement.querySelectorAll('input[type = "range"]');
  const hue = slider[0];
  const brightness = slider[1];
  const saturation = slider[2];

  const bgColor = initialColor[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  colorizeSliders(color, hue, brightness, saturation);
}

function UpdateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  checkTextContrast(color, adjustBtn[index]);
  checkTextContrast(color, lockBtn[index]);
}

function resetInput() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const huecolor = initialColor[slider.getAttribute("data-hue")];
      const huevalue = chroma(huecolor).hsl()[0];
      slider.value = Math.floor(huevalue);
    }
    if (slider.name === "brightness") {
      const brightcolor = initialColor[slider.getAttribute("data-bright")];
      const brightvalue = chroma(brightcolor).hsl()[2];
      slider.value = Math.floor(brightvalue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satcolor = initialColor[slider.getAttribute("data-sat")];
      const satvalue = chroma(satcolor).hsl()[2];
      slider.value = Math.floor(satvalue * 100) / 100;
    }
  });
}
function copyClipBoard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainer[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainer[index].classList.toggle("active");
}

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const CloselibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
CloselibraryBtn.addEventListener("click", closeLibrary);
libraryBtn.addEventListener("click", openLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}
function savePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHex.forEach((color) => {
    colors.push(color.innerText);
  });

  let paletteNr;
  const palatteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (palatteObjects) {
    paletteNr = palatteObjects.length;
    console.log(`Obje ${paletteNr}`);
  } else {
    paletteNr = savePalettes.length;
    console.log(paletteNr);
  }
  const paletteObj = { name, colors, nr: paletteNr };
  savePalettes.push(paletteObj);
  savetoLocal(paletteObj);
  saveInput.value = "";

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((color) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = color;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColor = [];
    savePalettes[paletteIndex].colors.forEach((color, index) => {
      initialColor.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      UpdateTextUI(index);
    });
    resetInput();
  });

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);

  libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") == null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary(e) {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}

function closeLibrary(e) {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") !== null) {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    console.log(paletteObjects);
    savePalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((color) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
      });

      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColor = [];

        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColor.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          UpdateTextUI(index);
        });
        resetInput();
      });

      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);

      libraryContainer.children[0].appendChild(palette);
    });
  }
}
getLocal();
randomColor();
