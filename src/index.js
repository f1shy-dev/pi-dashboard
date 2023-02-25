const frameContainer = document.getElementById("iframe-container");
const frame = document.getElementById("iframe-frame");
const frameForward = document.getElementById("iframe-forward");
const frameBack = document.getElementById("iframe-back");
const frameReload = document.getElementById("iframe-reload");
const framePath = document.getElementById("iframe-path");
document.getElementById("iframe-close").addEventListener("click", () => {
  frameContainer.style.display = "none";
  frame.src = "";
});
// loop over all elements in the dom with a "link-hook" property
// and add a click event listener to each one
document.querySelectorAll("[link-hook]").forEach((e) => e.addEventListener("click", (g) => {
  openURL(e.getAttribute("link-hook"))
}));

document.querySelectorAll("#toggle-settings").forEach((i) =>
  i.addEventListener("click", (event) => {
    const menu = document.querySelector("#settings-menu");
    if (menu.style.display == "flex") menu.style.display = "none";
    else menu.style.display = "flex";
  })
);

const getOpeningMethod = () => {
  const openOption = localStorage.getItem("openOption");
  if (openOption !== "" && openOption !== null) return openOption;
  if (window.matchMedia("(display-mode: standalone)").matches) return "frame";
  return "newTab";
};

const openFrame = (url) => {
  // make frame visible
  frameContainer.style.display = "flex";
  // set frame src to url
  frame.src = url;
};

const openURL = (url) => {
  const openOption = getOpeningMethod();
  if (openOption === "frame") return openFrame(url);
  else if (openOption === "newTab") return window.open(url, "_blank");
  else return window.open(url, "_self");
};

// watch value of <select> #tab-open-method

const openSelect = document.getElementById("tab-open-method");
openSelect.value = localStorage.getItem("openOption") || "newTab";
openSelect.addEventListener("change", (event) => {
  localStorage.setItem("openOption", event.target.value);
});

//watch <input> #update-frequency
const updateFrequency = document.getElementById("update-frequency");
const updateFrequencyLabel = document.getElementById("update-frequency-label");
updateFrequency.value = localStorage.getItem("updateFrequency") || 3;
updateFrequencyLabel.innerText = `${updateFrequency.value}s`;
updateFrequency.addEventListener("change", (event) => {
  localStorage.setItem("updateFrequency", event.target.value);
  updateFrequencyLabel.innerText = `${event.target.value}s`;
});


// check if there even is a back/forward
frame.addEventListener("load", () => {
  // get url of window

  framePath.innerText = frame.contentWindow.location.href.replace(window.location.origin, "");

  if (frame.contentWindow.history.length > 1) {
    frameForward.removeAttribute("disabled");
    frameBack.removeAttribute("disabled");
  } else {
    frameForward.setAttribute("disabled", true);
    frameBack.setAttribute("disabled", true);
  }
});

frameForward.addEventListener("click", () => frame.contentWindow.history.forward());
frameBack.addEventListener("click", () => frame.contentWindow.history.back());
frameReload.addEventListener("click", () => frame.contentWindow.location.reload());

// start pinging http://localhost:8392/stats to get cpu/... stats
const stats = document.getElementById("stats");
const fetchStats = async () => {
  const data = await (await fetch("/stats/")).json();
  const progressBar = (id, value, text) => {
    document.querySelector(`#status-${id}-text`).innerText = `${text} (${Math.round(value)}%)`;
    document.querySelector(`#status-${id}-bar`).style.width = `${value}%`;
  }
  progressBar("ram", data.mem.usedMemPercentage, "RAM");
  progressBar("disk", data.disk.usedPercentage, "Disk");
  progressBar("cpu", data.cpu, "CPU");
  // data.uptime is in seconds, convert to days, hours, minutes, seconds
  const seconds = data.uptime % 60;
  const minutes = Math.floor(data.uptime / 60) % 60;
  const hours = Math.floor(data.uptime / 60 / 60) % 24;
  const days = Math.floor(data.uptime / 60 / 60 / 24);
  const newUptime = `${days}d ${hours}h ${minutes}m ${Math.round(seconds)}s`;
  document.getElementById("status-uptime-text").innerText = newUptime;

  const interfaces = Object.keys(data.network).filter((i) => i !== "total" && i !== "lo");

  let elements = "";
  const templateBase = `<div class="items-center w-full __hidden" id="net-template">
    <div id="status-net-interface-name"
      class="text-zinc-200 text-[11px] font-semibold font-mono leading-3 mr-3 w-[105px]">
      {{interface}}
    </div>

    <div class="flex-grow flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
      </svg>


      <div id="status-net-interface-up" class="text-zinc-200 text-[11px] font-semibold font-mono ml-0.5 mr-2">
        {{net_up}}
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
      </svg>

      <div id="status-net-interface-down" class="text-zinc-200 text-[11px] font-semibold font-mono ml-0.5">
        {{net_down}}
      </div>
    </div>
  </div>`;
  interfaces.forEach((i) => {
    // make copy of template
    let template = templateBase;
    template = template.replace("{{interface}}", i);

    template = template.replace("{{net_up}}", `${data.network[i].outputMb} Mb/s`);
    template = template.replace("{{net_down}}", `${data.network[i].inputMb} Mb/s`);
    template = template.replace("__hidden", "flex");
    elements += template;
  });
  Array.from(document.getElementById("net-template-container").children).forEach((i) => i.remove());
  document.getElementById("net-template-container").innerHTML = elements;
  document.querySelectorAll("#system-status-skeleton").forEach(i => (i.style.display = "none"));
  document.querySelectorAll("#system-status-container").forEach(i => (i.style.display = "flex"));
  setTimeout(fetchStats, localStorage.getItem("updateFrequency") * 1000 || 3000);
};

fetchStats();