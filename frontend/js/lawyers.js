document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('#lawyer-list');
  const searchForm = document.querySelector('#lawyer-search');
  if (list) loadLawyers();
  if (searchForm) searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    loadLawyers(new FormData(searchForm));
  });

  async function loadLawyers(formData) {
    const params = new URLSearchParams();
    if (formData) {
      const district = formData.get('district');
      const specialization = formData.get('specialization');
      if (district) params.set('district', district);
      if (specialization) params.set('specialization', specialization);
    }
    try {
      const lawyers = await api(`/lawyers${params.size ? `?${params}` : ''}`);
      list.innerHTML = lawyers.length ? lawyers.map(lawyer => `
        <article class="card lawyer-card">
          <h3>${escapeHtml(lawyer.name)}</h3>
          <p><strong>District:</strong> ${escapeHtml(lawyer.district)}</p>
          <p><strong>Specialization:</strong> ${escapeHtml(lawyer.specialization)}</p>
          <p><strong>Experience:</strong> ${lawyer.experience} years</p>
          <a class="button" href="lawyer-profile.html?id=${lawyer.id}">View Profile</a>
        </article>`).join('') : '<p>No verified lawyers found.</p>';
    } catch (error) {
      list.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    }
  }

  const profile = document.querySelector('#lawyer-profile');
  if (profile) loadProfile();

  async function loadProfile() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { profile.innerHTML = '<p>Lawyer ID is missing.</p>'; return; }
    try {
      const lawyer = await api(`/lawyers/${id}`);
      profile.innerHTML = `
        <h1>${escapeHtml(lawyer.name)}</h1>
        <p><strong>District:</strong> ${escapeHtml(lawyer.district)}</p>
        <p><strong>Specialization:</strong> ${escapeHtml(lawyer.specialization)}</p>
        <p><strong>Experience:</strong> ${lawyer.experience} years</p>
        <p><strong>Contact:</strong> ${escapeHtml(lawyer.contact || 'Not provided')}</p>
        <p><strong>Bar Council Enrollment:</strong> ${escapeHtml(lawyer.bar_council_number)}</p>
        <form id="consultation-form" class="form">
          <h2>Request a Consultation</h2>
          <input name="subject" placeholder="Subject" required>
          <textarea name="description" placeholder="Describe your legal concern" required></textarea>
          <input name="preferredDate" type="date">
          <button type="submit">Send Request</button>
        </form>
        <div id="consultation-message"></div>`;
      document.querySelector('#consultation-form').addEventListener('submit', sendConsultation);
    } catch (error) {
      profile.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    }
  }

  async function sendConsultation(event) {
    event.preventDefault();
    const auth = getAuth();
    if (!auth) { window.location.href = 'login.html'; return; }
    if (auth.user.role !== 'citizen') {
      document.querySelector('#consultation-message').textContent = 'Only citizens can request consultations.';
      return;
    }
    const id = new URLSearchParams(window.location.search).get('id');
    const form = new FormData(event.currentTarget);
    try {
      const lawyer = await api(`/lawyers/${id}`);
      await api('/consultations', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ lawyerId: lawyer.user_id, ...Object.fromEntries(form.entries()) })
      });
      document.querySelector('#consultation-message').textContent = 'Consultation request sent.';
      event.currentTarget.reset();
    } catch (error) {
      document.querySelector('#consultation-message').textContent = error.message;
    }
  }

  async function getLawyerUserId(profileId) {
    const lawyer = await api(`/lawyers/${profileId}`);
    return lawyer.user_id;
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
  }
});
