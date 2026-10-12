const futureDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
};

const validJob = {
    title: 'Test job',
    company: 'Test Co',
    location: 'Auckland',
    employment_type: 'Full Time',
    description: 'A valid job description',
};

const validService = {
    name: 'Test clinic',
    description: 'A valid service description',
    location: 'Auckland',
    phone: '0211234567',
    website: 'https://example.com',
};

const validResource = {
    title: 'Test resource',
    description: 'A valid resource description',
    link: 'https://example.com',
};

const validGroup = {
    name: 'Test group',
    description: 'A valid group description',
};

const validEvent = {
    title: 'Test event',
    location: 'Auckland',
    event_date: futureDate(),
    event_time: '18:00',
    description: 'A valid event description',
};

module.exports = { validJob, validService, validResource, validGroup, validEvent };