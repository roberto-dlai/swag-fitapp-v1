const ReviewSection = {
  selectedRating: 0,

  async load() {
    const container = document.getElementById('reviews-section');
    try {
      const data = await API.get('/api/reviews');
      this.render(container, data.reviews);
    } catch (err) {
      container.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'error-state';
      div.textContent = 'Failed to load reviews';
      container.appendChild(div);
    }
  },

  render(container, reviews) {
    container.innerHTML = '';

    // Review list
    if (reviews && reviews.length > 0) {
      const list = document.createElement('div');
      list.className = 'review-list';

      for (const review of reviews) {
        list.appendChild(this.createReviewCard(review));
      }
      container.appendChild(list);
    } else {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No reviews yet. Be the first!';
      container.appendChild(empty);
    }

    // Write review form
    container.appendChild(this.createReviewForm());
  },

  createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';

    // Header
    const header = document.createElement('div');
    header.className = 'review-header';

    const author = document.createElement('span');
    author.className = 'review-author';
    author.textContent = review.userName;

    const stars = document.createElement('span');
    stars.className = 'review-stars';
    stars.textContent = '\u2605'.repeat(review.rating) + '\u2606'.repeat(5 - review.rating);

    header.appendChild(author);
    header.appendChild(stars);
    card.appendChild(header);

    // Title
    if (review.title) {
      const title = document.createElement('div');
      title.className = 'review-title';
      title.textContent = review.title;
      card.appendChild(title);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'review-body';
    body.textContent = review.body;
    card.appendChild(body);

    // Tags
    if (review.tags && review.tags.length > 0) {
      const tags = document.createElement('div');
      tags.className = 'review-tags';
      for (const tag of review.tags) {
        const tagEl = document.createElement('span');
        tagEl.className = 'review-tag';
        tagEl.textContent = tag;
        tags.appendChild(tagEl);
      }
      card.appendChild(tags);
    }

    return card;
  },

  createReviewForm() {
    const wrapper = document.createElement('div');
    wrapper.className = 'review-form';

    const heading = document.createElement('h3');
    heading.textContent = 'Write a Review';
    wrapper.appendChild(heading);

    const form = document.createElement('form');

    // Star rating
    const starInput = document.createElement('div');
    starInput.className = 'star-input';
    starInput.setAttribute('role', 'radiogroup');
    starInput.setAttribute('aria-label', 'Rating');

    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '\u2605';
      btn.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
      btn.addEventListener('click', () => {
        this.selectedRating = i;
        starInput.querySelectorAll('button').forEach((b, idx) => {
          b.classList.toggle('active', idx < i);
        });
      });
      starInput.appendChild(btn);
    }
    form.appendChild(starInput);

    // Title
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    const titleLabel = document.createElement('label');
    titleLabel.setAttribute('for', 'review-title-input');
    titleLabel.textContent = 'Title';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'review-title-input';
    titleInput.placeholder = 'Brief summary';
    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    form.appendChild(titleGroup);

    // Body
    const bodyGroup = document.createElement('div');
    bodyGroup.className = 'form-group';
    const bodyLabel = document.createElement('label');
    bodyLabel.setAttribute('for', 'review-body-input');
    bodyLabel.textContent = 'Review';
    const bodyInput = document.createElement('textarea');
    bodyInput.id = 'review-body-input';
    bodyInput.placeholder = 'How was your workout?';
    bodyInput.required = true;
    bodyGroup.appendChild(bodyLabel);
    bodyGroup.appendChild(bodyInput);
    form.appendChild(bodyGroup);

    // Submit
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary btn-sm';
    submitBtn.textContent = 'Post Review';
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.selectedRating) {
        Notifications.error('Please select a rating');
        return;
      }
      try {
        await API.post('/api/reviews', {
          workoutId: 1,
          rating: this.selectedRating,
          title: titleInput.value,
          body: bodyInput.value,
        });
        this.selectedRating = 0;
        form.reset();
        starInput.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        this.load();
      } catch (err) {
        Notifications.error(err.message);
      }
    });

    wrapper.appendChild(form);
    return wrapper;
  },
};
