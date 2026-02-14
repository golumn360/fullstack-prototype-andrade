const pageLinks = document.querySelectorAll('[data-page]');

const pages = document.querySelectorAll('.page');

function showPage(pageId) {
  pages.forEach(page => page.classList.remove('active')); 
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active'); 
  }
}


pageLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault(); 
    const page = link.getAttribute('data-page'); 
    showPage(page);
  });
});
