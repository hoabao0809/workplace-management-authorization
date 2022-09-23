window.onload = function () {
  // Navbar toggle
  document.querySelector('.fa-bars').addEventListener('click', () => {
    // document.querySelector('.navigation').style.right = '0';
    document.querySelector('.navigation').style.opacity = '1';
    document.querySelector('.navigation').style.clipPath =
      'polygon(0 100%, 100% 100%, 100% 0, 0 0)';
  });

  document.querySelector('.fa-times').addEventListener('click', () => {
    // document.querySelector('.navigation').style.right = '-100%';
    document.querySelector('.navigation').style.opacity = '0';
    document.querySelector('.navigation').style.clipPath =
      'polygon(100% 100%, 100% 100%, 100% 0, 100% 0)';
  });

  // Upload user image
  let imgEl = document.querySelector('.img');
  if (imgEl) {
    imgEl.addEventListener('click', () => {
      document.querySelector('#imageUpload').click();

      document
        .querySelector('#imageUpload')
        .addEventListener('change', (event) => {
          const fileName = event.path[0].files[0];
          if (fileName) {
            document.querySelector('#avatarImg').src =
              window.URL.createObjectURL(fileName);
            document.querySelector('#imageUpload').style.pointerEvents = 'none';
            document.querySelector('.saveImg').style.display = 'block';
          }
        });
    });
  }

  let cancelEl = document.querySelector('#cancel');
  if (cancelEl) {
    cancelEl.addEventListener('click', () => {
      location.reload();
    });
  }

  let pageLimitEl = document.getElementById('pageLimit');
  if (pageLimitEl) {
    pageLimitEl.addEventListener('change', (e) => {
      let itemsPerPage = e.target.value;
      window.location.href = `/statistics/?itemsPerPage=${itemsPerPage}`;
    });
  }
};
