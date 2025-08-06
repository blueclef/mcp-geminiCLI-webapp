document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('book-form');
    const bookList = document.getElementById('book-list');
    const starRating = document.getElementById('star-rating');
    let currentSelectedRating = 0; // Variable to store the selected rating

    // Create 5 stars for rating
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '☆';
        star.dataset.rating = i;
        star.addEventListener('click', function() {
            currentSelectedRating = parseInt(this.dataset.rating); // Update the selected rating
            console.log('Star clicked, currentSelectedRating:', currentSelectedRating);
            document.querySelectorAll('#star-rating span').forEach((s, index) => {
                s.textContent = index < currentSelectedRating ? '★' : '☆';
                s.classList.toggle('selected', index < currentSelectedRating);
            });
        });
        starRating.appendChild(star);
    }

    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const publisher = document.getElementById('publisher').value;
        const publicationYear = document.getElementById('publication-year').value;
        const coverImageFile = document.getElementById('cover-image').files[0];
        const tagsInput = document.getElementById('tags').value;
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        console.log('Before addBook - currentSelectedRating:', currentSelectedRating);
        addBook(title, author, publisher, publicationYear, currentSelectedRating, coverImageFile, tags); // Use currentSelectedRating
        bookForm.reset();
        // Reset star rating display and selected rating variable
        document.querySelectorAll('#star-rating span').forEach(star => {
            star.textContent = '☆';
            star.classList.remove('selected');
        });
        currentSelectedRating = 0;
    });

    let books = JSON.parse(localStorage.getItem('books')) || [];

    function renderBooks() {
        bookList.innerHTML = '';
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item');

            const img = document.createElement('img');
            img.src = book.coverImage || 'https://via.placeholder.com/150'; // Placeholder image

            const titleElement = document.createElement('h3');
            titleElement.textContent = book.title;

            const authorElement = document.createElement('p');
            authorElement.textContent = book.author;

            bookItem.appendChild(img);
            bookItem.appendChild(titleElement);
            bookItem.appendChild(authorElement);

            bookItem.addEventListener('click', () => {
                localStorage.setItem('selectedBookId', book.id);
                window.location.href = 'book-details.html';
            });

            bookList.appendChild(bookItem);
        });
    }

    async function addBook(title, author, publisher, publicationYear, rating, coverImageFile, tags) {
        let coverImageBase64 = '';
        if (coverImageFile) {
            coverImageBase64 = await resizeImage(coverImageFile, 150); // Resize to 150px width
        }

        const newBook = {
            id: Date.now(), // Unique ID for the book
            title,
            author,
            publisher,
            publicationYear,
            rating,
            coverImage: coverImageBase64,
            quotes: [],
            tags: tags
        };

        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();
    }

    // Function to resize image
    function resizeImage(file, maxWidth) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Convert to JPEG with 80% quality
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Initial render
    renderBooks();

    // Star rating functionality
    document.querySelectorAll('#star-rating span').forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            document.querySelectorAll('#star-rating span').forEach((s, index) => {
                s.textContent = index < rating ? '★' : '☆';
                s.classList.toggle('selected', index < rating);
            });
        });
    });
});