function changeLanguage(rawLang) {
	const isLocal = window.location.protocol === 'file:';
    const langMap = {
        ja: isLocal ? 'index.html' : '/index.html',
        en: isLocal ? 'en/index.html' : '/en/',
    };
    const lang = String(rawLang || 'ja').trim().toLowerCase();
	const targetPath = (langMap.hasOwnProperty ? langMap.hasOwnProperty(lang) : (lang in langMap)) ? langMap[lang] : langMap['ja'];

	window.location.href = encodeURI(targetPath);
}

document.addEventListener('DOMContentLoaded', function() {
	const dropdowns = document.querySelectorAll('.language-selector');

	dropdowns.forEach(function(dropdown) {
		const btn = dropdown.querySelector('.dropdown-toggle');
		const menu = dropdown.querySelector('.dropdown-toggle-content');
		const options = menu.querySelectorAll('a');

		if (!btn || !menu) return;

		const currentLang = document.documentElement.lang || 'ja';
		const currentOption = Array.from(options).find(opt => opt.dataset.lang === currentLang);

		if (currentOption) {
			btn.textContent = currentOption.textContent;
			btn.dataset.lang = currentLang;
			options.forEach(opt => {
				opt.classList.toggle('selected', opt.dataset.lang === currentLang);
			});
		}

		btn.addEventListener('click', function(e) {
			e.stopPropagation();

			dropdowns.forEach(function(otherDropdown) {
				const otherMenu = otherDropdown.querySelector('.dropdown-toggle-content');
				if (otherMenu !== menu) otherMenu.classList.remove('show');
			});

			menu.classList.toggle('show');
		});

		document.addEventListener('click', function() {
			menu.classList.remove('show');
		});

		options.forEach(function(option) {
			option.addEventListener('click', function(e) {
				e.preventDefault();
				const selectedLang = option.dataset.lang;
				btn.textContent = option.textContent;
				btn.dataset.lang = selectedLang;
				menu.classList.remove('show');

				options.forEach(opt => {
					opt.classList.toggle('selected', opt.dataset.lang === selectedLang);
				});

				if (typeof changeLanguage === 'function') {
					changeLanguage(selectedLang);
				}
			});
		});
	});
});

// document.addEventListener('contextmenu', function (event) {
//   return event.preventDefault();
// });
// document.addEventListener('keydown', function (event) {
// 	if (event.keyCode == 123) {
// 		event.preventDefault();
// 			event.returnValue = false;

// 	}
// 		else if (event.keyCode == 17) {
// 		event.preventDefault();
// 			event.returnValue = false;

// 	}
// 			else if (event.keyCode == 16) {
// 		event.preventDefault();
// 			event.returnValue = false;

// 	}
// 					else if (event.keyCode == 74) {
// 		event.preventDefault();
// 			event.returnValue = false;

// 	}
// 		else if (event.keyCode == 73) {
// 		event.preventDefault();
// 			event.returnValue = false;

// 	}
// 		else if (event.keyCode == 67) {
// 		event.preventDefault();
// 			event.returnValue = false;

// 	}
// });