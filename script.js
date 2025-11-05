// === Fade-In on Page Load ===
window.addEventListener('load', () => {
  document.body.classList.add('opacity-100');

  const fadeTargets = document.querySelectorAll('nav, header, .hero-section');
  fadeTargets.forEach((el, i) => {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      el.classList.remove('opacity-0', 'translate-y-2');
      el.classList.add('opacity-100', 'transition-all', 'duration-700');
    }, 150 * i + 150);
  });
});

// === Dark Mode Toggle (Shared) ===
const toggle = document.getElementById('darkModeToggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.documentElement.classList.add('dark');
  if (toggle) toggle.textContent = '☀️';
} else {
  document.documentElement.classList.remove('dark');
  if (toggle) toggle.textContent = '🌙';
}

if (toggle) {
  toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    toggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// === Compact Header on Scroll (for pages with header) ===
const header = document.querySelector('header');
if (header) {
  const title = header.querySelector('h1');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    header.classList.toggle('shadow-md', scrolled);
    header.classList.toggle('py-2', scrolled);
    if (title) {
      title.classList.toggle('text-2xl', scrolled);
      title.classList.toggle('text-3xl', !scrolled);
    }
  });
}

// === Mobile Menu Toggle (for index page only) ===
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('animate-fadeIn');
  });
}

// === Load and Display Alternative Tools ===
const contentContainer = document.getElementById('contentContainer');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

if (contentContainer && categoryFilter && searchInput) {
  fetch('alternative-tools.json')
    .then(res => res.json())
    .then(data => {
      const categories = data.map(d => d.category);
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoryFilter.appendChild(opt);
      });

      function renderTools(selected = 'all', searchTerm = '') {
        contentContainer.classList.add('opacity-0', 'translate-y-3');
        setTimeout(() => {
          contentContainer.innerHTML = '';
          const regex = searchTerm ? new RegExp(searchTerm, 'i') : null;

          data.forEach(section => {
            if (selected !== 'all' && section.category !== selected) return;

            const filtered = section.tools.filter(tool => {
              if (!regex) return true;
              return (
                regex.test(tool.name) ||
                regex.test(tool.description) ||
                tool.alternatives.some(alt => regex.test(alt.name))
              );
            });

            if (!filtered.length) return;

            const div = document.createElement('div');
            div.className =
              "bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 transition-colors duration-500 overflow-hidden animate-fadeIn animate-slideUp";

            const title = document.createElement('h2');
            title.textContent = section.category;
            title.className =
              "text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400 font-heading";

            const tableWrapper = document.createElement('div');
            tableWrapper.className =
              "overflow-x-auto rounded-lg max-h-[400px] overflow-y-auto";

            const table = document.createElement('table');
            table.className = "w-full border-collapse text-left min-w-[600px]";

            const thead = document.createElement('thead');
            thead.innerHTML = `
              <tr class="bg-blue-600 dark:bg-blue-700 text-white sticky top-0 shadow-md">
                <th class="p-3 rounded-tl-lg">Tool</th>
                <th class="p-3">Description</th>
                <th class="p-3 rounded-tr-lg">Alternatives</th>
              </tr>`;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            filtered.forEach(tool => {
              const tr = document.createElement('tr');
              tr.className =
                "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300";

              const altLinks = tool.alternatives
                .map(
                  a =>
                    `<a href="${a.link}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">${a.name}</a>`
                )
                .join(', ');

              tr.innerHTML = `
                <td class="p-3 font-medium text-blue-700 dark:text-blue-300">
                  <a href="${tool.link}" target="_blank" class="hover:underline">${tool.name}</a>
                </td>
                <td class="p-3 text-gray-700 dark:text-gray-300">${tool.description}</td>
                <td class="p-3 text-gray-700 dark:text-gray-300">${altLinks || '-'}</td>`;
              tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            tableWrapper.appendChild(table);
            div.appendChild(title);
            div.appendChild(tableWrapper);
            contentContainer.appendChild(div);
          });

          setTimeout(() => contentContainer.classList.remove('opacity-0', 'translate-y-3'), 100);
        }, 200);
      }

      const updateView = () => renderTools(categoryFilter.value, searchInput.value);
      categoryFilter.addEventListener('change', updateView);
      searchInput.addEventListener('input', updateView);
      renderTools();
    })
    .catch(err => console.error('Error loading alternative-tools.json:', err));
}

// === Load and Display Software Testing Tools ===
const toolGrid = document.getElementById("toolGrid");
const template = document.getElementById("toolCardTemplate");
const testSearch = document.getElementById("searchInputTesting");
const testFilter = document.getElementById("categoryFilterTesting");

if (toolGrid && template && testSearch && testFilter) {
  fetch("testing-tools.json")
    .then(res => res.json())
    .then(data => renderTestingTools(data, testSearch, testFilter))
    .catch(err => console.error("Error loading testing-tools.json:", err));
}

function renderTestingTools(data, searchInput, categoryFilter) {
  // Populate Category Filter
  const categories = data.map(d => d.category);
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const render = (selected = "all", filter = "") => {
    toolGrid.innerHTML = "";
    const lower = filter.toLowerCase();

    const filtered = data.filter(({ category, tools }) =>
      (selected === "all" || category === selected) &&
      (category.toLowerCase().includes(lower) ||
        tools.some(t => t.name.toLowerCase().includes(lower)))
    );

    filtered.forEach(({ category, tools }) => {
      const card = template.content.cloneNode(true);
      card.querySelector(".category-name").textContent = category;

      const list = card.querySelector(".tool-list");
      list.classList.remove("hidden");

      tools.forEach(tool => {
        const li = document.createElement("li");
        li.className = "mb-2 leading-snug";

        li.innerHTML = `
          <a href="${tool.link}" target="_blank"
            class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            ${tool.name}
          </a>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ${tool.description || ""}
          </p>
        `;
        list.appendChild(li);
      });

      toolGrid.appendChild(card);
    });
  };

  const updateView = () => render(categoryFilter.value, searchInput.value);

  categoryFilter.addEventListener("change", updateView);
  searchInput.addEventListener("input", updateView);
  render();
}
