const $ = id => document.getElementById(id);

const DEFAULTS = { fee: 17.5, shipping: 5.22, goal: 20.00 };
let mode = "profit";

function money(v){
  return Number.isFinite(v)
    ? v.toLocaleString("en-US",{style:"currency",currency:"USD"})
    : "$0.00";
}

function num(id){
  const v = parseFloat($(id).value);
  return Number.isFinite(v) ? v : 0;
}

function setStatus(ok, buyText = "MEETS", passText = "BELOW"){
  const badge = $("statusBadge");
  badge.innerHTML = ok
    ? "✓ <span>" + buyText + "<br>GOAL</span>"
    : "! <span>" + passText + "<br>GOAL</span>";
  badge.style.color = ok ? "#75df5e" : "#ff7777";
  badge.style.background = ok ? "#17361a" : "#3a1717";
  $("profitAmount").style.color = ok ? "#72d85b" : "#ff7777";
}

function calculate(){
  const feePct = mode === "profit" ? num("feePercent") : num("feePercent");
  const shipping = mode === "profit" ? num("shippingCost") : num("shippingCost");
  const feeRate = feePct / 100;

  if(mode === "target"){
    const sale = num("targetSalePrice");
    const goal = num("targetProfitGoal");
    const actualCost = num("targetPurchasePrice");

    const fee = sale * feeRate;
    const maxCost = sale - fee - shipping - goal;
    const actualProfit = sale - actualCost - fee - shipping;
    const roi = actualCost > 0 ? (actualProfit / actualCost) * 100 : 0;

    $("profitAmount").textContent = money(maxCost);
    $("resultLabel").textContent = "MAXIMUM PURCHASE PRICE";

    $("breakSale").textContent = money(sale);
    $("breakFeePct").textContent = feePct.toFixed(1).replace(".0","");
    $("breakFee").textContent = "-" + money(fee);
    $("breakShipping").textContent = "-" + money(shipping);
    $("breakAcquisition").textContent = "-" + money(actualCost);
    $("breakProfit").textContent = money(actualProfit);
    $("roi").textContent = actualCost > 0 ? roi.toFixed(1) + "%" : "—";

    const passes = actualCost > 0 && actualProfit >= goal;
    const exactlyAtOrBelow = actualCost <= maxCost;

    const banner = $("buyPassBanner");
    banner.classList.remove("hidden", "pass");
    $("buyPassLabel").textContent = passes ? "BUY" : "PASS";
    $("buyPassSub").textContent = passes
      ? "This book meets your $" + goal.toFixed(2) + " profit goal."
      : "This book is below your $" + goal.toFixed(2) + " profit goal.";
    if (!passes) banner.classList.add("pass");

    const badge = $("statusBadge");
    badge.innerHTML = passes
      ? "✓ <span>BUY</span>"
      : "✕ <span>PASS</span>";
    badge.style.color = passes ? "#75df5e" : "#ff7777";
    badge.style.background = passes ? "#17361a" : "#3a1717";
    $("profitAmount").style.color = exactlyAtOrBelow ? "#72d85b" : "#ff7777";

    $("targetResult").querySelector(".target-title").textContent =
      "💰  PROFIT AT THIS PRICE";

    const targetRows = $("targetResult").querySelectorAll(".target-row");
    targetRows[0].querySelector("span").textContent = "Estimated Profit";
    targetRows[0].querySelector("strong").textContent = money(actualProfit);
    targetRows[0].querySelector("strong").style.color =
      passes ? "#72d85b" : "#ff7777";

    $("targetMinSaleRow").style.display = "";
    $("targetMinSaleRow").querySelector("span").textContent =
      actualCost > maxCost
        ? "Over your maximum by"
        : "You can pay up to";
    $("targetMinSaleRow").querySelector("strong").textContent =
      money(Math.abs(actualCost - maxCost));
    $("targetMinSaleRow").querySelector("strong").style.color =
      actualCost > maxCost ? "#ff7777" : "#70cfff";

    $("breakdown").style.display = "";

    return;
  }

  const cost = num("acquisitionCost");
  const sale = num("salePrice");
  const feePctProfit = num("feePercent");
  const shippingProfit = num("shippingCost");
  const goal = num("profitGoal");

  const fee = sale * (feePctProfit / 100);
  const profit = sale - cost - fee - shippingProfit;
  const roi = cost > 0 ? (profit / cost) * 100 : 0;
  const feeRateProfit = feePctProfit / 100;
  const minSale = feeRateProfit < 1
    ? (goal + cost + shippingProfit) / (1 - feeRateProfit)
    : 0;
  const maxCost = sale - fee - shippingProfit - goal;

  $("buyPassBanner").classList.add("hidden");
  $("profitAmount").textContent = money(profit);
  $("resultLabel").textContent = "ESTIMATED PROFIT";
  $("breakSale").textContent = money(sale);
  $("breakFeePct").textContent = feePctProfit.toFixed(1).replace(".0","");
  $("breakFee").textContent = "-" + money(fee);
  $("breakShipping").textContent = "-" + money(shippingProfit);
  $("breakAcquisition").textContent = "-" + money(cost);
  $("breakProfit").textContent = money(profit);
  $("roi").textContent = cost > 0 ? roi.toFixed(1) + "%" : "—";

  setStatus(profit >= goal);
  $("targetResult").querySelector(".target-title").textContent =
    "🎯  YOUR PROFIT TARGET";
  $("targetResult").querySelectorAll(".target-row")[0].querySelector("span").textContent =
    "Maximum Purchase Price";
  $("targetResult").querySelectorAll(".target-row")[0].querySelector("strong").textContent =
    money(maxCost);
  $("targetResult").querySelectorAll(".target-row")[0].querySelector("strong").style.color =
    "#70cfff";
  $("targetMinSaleRow").style.display = "";
  $("targetMinSaleRow").querySelector("span").textContent =
    "Minimum Sale Price Needed";
  $("targetMinSaleRow").querySelector("strong").textContent = money(minSale);
  $("targetMinSaleRow").querySelector("strong").style.color = "#70cfff";
}

function loadDefaults(){
  const saved = JSON.parse(localStorage.getItem("bookProfitDefaults") || "null") || DEFAULTS;

  $("feePercent").value = saved.fee;
  $("shippingCost").value = Number(saved.shipping).toFixed(2);
  $("profitGoal").value = Number(saved.goal).toFixed(2);

  $("targetSalePrice").value = Number($("salePrice").value).toFixed(2);
  $("targetProfitGoal").value = Number(saved.goal).toFixed(2);
  $("targetPurchasePrice").value = Number($("acquisitionCost").value).toFixed(2);

  $("defaultFee").value = saved.fee;
  $("defaultShipping").value = Number(saved.shipping).toFixed(2);
  $("defaultGoal").value = Number(saved.goal).toFixed(2);
}

function syncProfitToTarget(){
  $("targetSalePrice").value = Number($("salePrice").value || 0).toFixed(2);
  $("targetProfitGoal").value = Number($("profitGoal").value || 0).toFixed(2);
  $("targetPurchasePrice").value = Number($("acquisitionCost").value || 0).toFixed(2);
}

function syncTargetToProfit(){
  $("salePrice").value = Number($("targetSalePrice").value || 0).toFixed(2);
  $("profitGoal").value = Number($("targetProfitGoal").value || 0).toFixed(2);
  $("acquisitionCost").value = Number($("targetPurchasePrice").value || 0).toFixed(2);
}

function saveDefaults(){
  const values = {
    fee: num("defaultFee"),
    shipping: num("defaultShipping"),
    goal: num("defaultGoal")
  };

  localStorage.setItem("bookProfitDefaults", JSON.stringify(values));

  $("feePercent").value = values.fee;
  $("shippingCost").value = values.shipping.toFixed(2);
  $("profitGoal").value = values.goal.toFixed(2);
  $("targetProfitGoal").value = values.goal.toFixed(2);

  $("settingsPanel").classList.add("hidden");
  calculate();
}

// Select the entire value when a numeric field is tapped/focused.
// The fields use type="text" + inputmode="decimal" so mobile browsers
// reliably support selection ranges while still showing the numeric keyboard.
document.querySelectorAll('input[inputmode="decimal"]').forEach(input => {
  const selectAll = function () {
    requestAnimationFrame(() => {
      try {
        this.focus({ preventScroll: true });
        this.setSelectionRange(0, this.value.length);
      } catch (e) {
        // Some browsers can briefly reject a selection while focus changes.
      }
    });
  };

  input.addEventListener("focus", selectAll);

  // On touch devices, run again after the browser finishes its native
  // tap/caret handling so the whole value remains selected.
  input.addEventListener("touchend", function () {
    setTimeout(() => {
      try {
        this.setSelectionRange(0, this.value.length);
      } catch (e) {}
    }, 50);
  });
});

document.querySelectorAll(".mode-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-tab").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");

    if(btn.dataset.mode === "target"){
      syncProfitToTarget();
      mode = "target";
      $("profitModeInputs").classList.add("hidden");
      $("targetModeInputs").classList.remove("hidden");
      $("calculateBtn").textContent = "▣  CHECK THIS BOOK";
    } else {
      syncTargetToProfit();
      mode = "profit";
      $("profitModeInputs").classList.remove("hidden");
      $("targetModeInputs").classList.add("hidden");
      $("calculateBtn").textContent = "▣  CALCULATE";
    }

    calculate();
  });
});

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", calculate);
});

$("calculateBtn").addEventListener("click", calculate);
$("settingsBtn").addEventListener("click", () => $("settingsPanel").classList.remove("hidden"));
$("closeSettings").addEventListener("click", () => $("settingsPanel").classList.add("hidden"));
$("saveSettings").addEventListener("click", saveDefaults);

loadDefaults();
calculate();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
}
