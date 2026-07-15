function focusFormField(form: HTMLElement) {
  form.querySelector<HTMLInputElement>("input:not([type='hidden'])")?.focus();
}

export function scrollToModaresForm() {
  const form = document.getElementById("modares-lead-form");
  if (!form) return;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => focusFormField(form), 400);
}

export function scrollToNearestModaresForm() {
  const forms = Array.from(document.querySelectorAll<HTMLElement>("[data-modares-form]"));
  if (!forms.length) return;

  const viewportMiddle = window.scrollY + window.innerHeight / 2;

  let nearest = forms[0];
  let minDistance = Infinity;

  for (const form of forms) {
    const rect = form.getBoundingClientRect();
    const formMiddle = window.scrollY + rect.top + rect.height / 2;
    const distance = Math.abs(viewportMiddle - formMiddle);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = form;
    }
  }

  nearest.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => focusFormField(nearest), 400);
}
