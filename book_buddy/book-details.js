document.addEventListener('DOMContentLoaded', () => {
    const bookDetailsContainer = document.getElementById('book-details-container');
    const editBookBtn = document.getElementById('edit-book-btn');
    const deleteBookBtn = document.getElementById('delete-book-btn');
    const addQuoteForm = document.getElementById('add-quote-form');
    const quoteTextarea = document.getElementById('quote-text');
    const pageNumberInput = document.getElementById('page-number');
    const personalNoteInput = document.getElementById('personal-note');
    const quotesListDiv = document.getElementById('quotes-list');

    // Edit form elements
    const editBookFormContainer = document.getElementById('edit-book-form-container');
    const editBookForm = document.getElementById('edit-book-form');
    const editTitleInput = document.getElementById('edit-title');
    const editAuthorInput = document.getElementById('edit-author');
    const editPublisherInput = document.getElementById('edit-publisher');
    const editPublicationYearInput = document.getElementById('edit-publication-year');
    const editStarRatingDiv = document.getElementById('edit-star-rating');
    const editCoverImageInput = document.getElementById('edit-cover-image');
    const editTagsInput = document.getElementById('edit-tags');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    let currentEditSelectedRating = 0; // Variable to store the selected rating for edit form

    // Create 5 stars for edit rating
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '☆';
        star.dataset.rating = i;
        star.addEventListener('click', function() {
            currentEditSelectedRating = parseInt(this.dataset.rating);
            document.querySelectorAll('#edit-star-rating span').forEach((s, index) => {
                s.textContent = index < currentEditSelectedRating ? '★' : '☆';
                s.classList.toggle('selected', index < currentEditSelectedRating);
            });
        });
        editStarRatingDiv.appendChild(star);
    }

    const selectedBookId = localStorage.getItem('selectedBookId');
    let books = JSON.parse(localStorage.getItem('books')) || [];
    let currentBook = books.find(book => book.id == selectedBookId);

    function renderBookDetails() {
        if (currentBook) {
            const { title, author, publisher, publicationYear, rating, coverImage, quotes, tags } = currentBook;

            const bookDetailsHTML = `
                <img src="${coverImage || 'https://via.placeholder.com/150'}" alt="Book Cover">
                <h2>${title}</h2>
                <p><strong>Author:</strong> ${author}</p>
                <p><strong>Publisher:</strong> ${publisher || 'N/A'}</p>
                <p><strong>Publication Year:</strong> ${publicationYear || 'N/A'}</p>
                <p><strong>Rating:</strong> ${'★'.repeat(rating) + '☆'.repeat(5 - rating)}</p>
                `;
            console.log('Rating in book-details.js:', rating);

            bookDetailsContainer.innerHTML = bookDetailsHTML;
            renderQuotes();
        } else {
            bookDetailsContainer.innerHTML = '<p>Book not found.</p>';
        }
    }

    function renderQuotes() {
        quotesListDiv.innerHTML = '';
        if (currentBook.quotes && currentBook.quotes.length > 0) {
            currentBook.quotes.forEach((quote, index) => {
                const quoteDiv = document.createElement('div');
                quoteDiv.classList.add('quote-item');
                quoteDiv.innerHTML = `
                    <p>"${quote.text}" (Page ${quote.page || 'N/A'})</p>
                    ${quote.note ? `<p><em>Note: ${quote.note}</em></p>` : ''}
                    <button class="edit-quote-btn" data-index="${index}">Edit</button>
                    <button class="delete-quote-btn" data-index="${index}">Delete</button>
                `;
                quotesListDiv.appendChild(quoteDiv);
            });

            document.querySelectorAll('.edit-quote-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.dataset.index;
                    const quoteToEdit = currentBook.quotes[index];
                    quoteTextarea.value = quoteToEdit.text;
                    pageNumberInput.value = quoteToEdit.page;
                    personalNoteInput.value = quoteToEdit.note;

                    // Change form to update mode
                    addQuoteForm.dataset.editingIndex = index;
                    addQuoteForm.querySelector('button[type="submit"]').textContent = 'Update Quote';
                });
            });

            document.querySelectorAll('.delete-quote-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.dataset.index;
                    if (confirm('Are you sure you want to delete this quote?')) {
                        currentBook.quotes.splice(index, 1);
                        localStorage.setItem('books', JSON.stringify(books));
                        renderBookDetails(); // Re-render to update quotes list
                    }
                });
            });

        } else {
            quotesListDiv.innerHTML = '<p>No quotes yet.</p>';
        }
    }

    renderBookDetails();

    editBookBtn.addEventListener('click', () => {
        // Show edit form, hide details
        bookDetailsContainer.style.display = 'none';
        document.getElementById('quote-management').style.display = 'none';
        editBookFormContainer.style.display = 'block';

        // Populate edit form with current book data
        editTitleInput.value = currentBook.title;
        editAuthorInput.value = currentBook.author;
        editPublisherInput.value = currentBook.publisher;
        editPublicationYearInput.value = currentBook.publicationYear;
        editTagsInput.value = currentBook.tags.join(', ');

        // Set star rating for edit form
        currentEditSelectedRating = currentBook.rating;
        document.querySelectorAll('#edit-star-rating span').forEach((s, index) => {
            s.textContent = index < currentEditSelectedRating ? '★' : '☆';
            s.classList.toggle('selected', index < currentEditSelectedRating);
        });
    });

    cancelEditBtn.addEventListener('click', () => {
        // Hide edit form, show details
        editBookFormContainer.style.display = 'none';
        bookDetailsContainer.style.display = 'block';
        document.getElementById('quote-management').style.display = 'block';
    });

    deleteBookBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this book?')) {
            books = books.filter(book => book.id != selectedBookId);
            localStorage.setItem('books', JSON.stringify(books));
            localStorage.removeItem('selectedBookId');
            window.location.href = 'index.html';
        }
    });

    editBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedTitle = editTitleInput.value;
        const updatedAuthor = editAuthorInput.value;
        const updatedPublisher = editPublisherInput.value;
        const updatedPublicationYear = editPublicationYearInput.value;
        const updatedTags = editTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const updatedCoverImageFile = editCoverImageInput.files[0];

        let updatedCoverImageBase64 = currentBook.coverImage; // Keep existing image if not changed
        if (updatedCoverImageFile) {
            updatedCoverImageBase64 = await resizeImage(updatedCoverImageFile, 150); // Reuse resizeImage
        }

        // Update currentBook object
        currentBook.title = updatedTitle;
        currentBook.author = updatedAuthor;
        currentBook.publisher = updatedPublisher;
        currentBook.publicationYear = updatedPublicationYear;
        currentBook.rating = currentEditSelectedRating;
        currentBook.tags = updatedTags;
        currentBook.coverImage = updatedCoverImageBase64;

        // Find the index of the current book in the books array and update it
        const bookIndex = books.findIndex(book => book.id == selectedBookId);
        if (bookIndex !== -1) {
            books[bookIndex] = currentBook;
        }

        localStorage.setItem('books', JSON.stringify(books));

        // Hide edit form, show details
        editBookFormContainer.style.display = 'none';
        bookDetailsContainer.style.display = 'block';
        document.getElementById('quote-management').style.display = 'block';

        renderBookDetails(); // Re-render to show updated details
    });

    // Duplicate resizeImage function from script.js for use in book-details.js
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

                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    addQuoteForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const quoteText = quoteTextarea.value.trim();
        const pageNumber = pageNumberInput.value.trim();
        const personalNote = personalNoteInput.value.trim();
        const editingIndex = addQuoteForm.dataset.editingIndex;

        if (quoteText) {
            if (editingIndex !== undefined) {
                // Update existing quote
                currentBook.quotes[editingIndex] = { text: quoteText, page: pageNumber, note: personalNote };
                addQuoteForm.removeAttribute('data-editing-index');
                addQuoteForm.querySelector('button[type="submit"]').textContent = 'Add Quote';
            } else {
                // Add new quote
                const newQuote = {
                    text: quoteText,
                    page: pageNumber,
                    note: personalNote
                };
                currentBook.quotes.push(newQuote);
            }
            localStorage.setItem('books', JSON.stringify(books));
            renderBookDetails(); // Re-render to show new quote
            addQuoteForm.reset();
        }
    });
});