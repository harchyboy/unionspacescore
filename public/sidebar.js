async function loadSharedSidebar() {
  const placeholders = document.querySelectorAll('[data-sidebar-placeholder]');
  if (!placeholders.length) {
    return;
  }

  let sidebarHTML;
  try {
    const response = await fetch('shared-sidebar.html', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch shared sidebar: ${response.status}`);
    }
    sidebarHTML = await response.text();
  } catch (error) {
    console.error(error);
    return;
  }

  const template = document.createElement('template');
  template.innerHTML = sidebarHTML.trim();

  placeholders.forEach((placeholder) => {
    const clone = template.content.firstElementChild.cloneNode(true);

    if (placeholder.id) {
      clone.id = placeholder.id;
    }
    if (placeholder.className) {
      clone.className = placeholder.className;
    }

    const activeKey =
      placeholder.dataset.active ||
      document.body.dataset.navSection ||
      clone.dataset.defaultActive;

    placeholder.replaceWith(clone);

    if (activeKey) {
      applyActiveState(clone, activeKey);
    }

    hydrateLeadBadge(clone);
  });
}

function applyActiveState(sidebar, navKey) {
  const link = sidebar.querySelector(`[data-nav-item="${navKey}"]`);
  if (!link) {
    return;
  }

  link.classList.add('bg-primary', 'text-white', 'shadow-sm');
  link.classList.remove('text-slate', 'hover:bg-stone');

  const icon = link.querySelector('i');
  if (icon) {
    icon.classList.add('text-white');
    icon.classList.remove('text-slate', 'text-concrete');
  }

  const badge = link.querySelector('[data-nav-badge]');
  if (badge) {
    badge.classList.remove('bg-slate', 'text-white', 'bg-secondary', 'bg-red-600');
    badge.classList.add('bg-white', 'text-primary');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSharedSidebar);
} else {
  loadSharedSidebar();
}

function hydrateLeadBadge(sidebar) {
  const badge = sidebar.querySelector('[data-hot-lead-badge]');
  if (!badge) return;

  if (window.LEAD_UTILS && typeof window.LEAD_UTILS.getHotLeadCount === 'function') {
    const hotCount = window.LEAD_UTILS.getHotLeadCount();
    badge.textContent = `${hotCount} HOT`;
  }
}

